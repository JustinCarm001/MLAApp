# Real-Time Video Processing Architecture - Hockey Live App

## Overview

This document outlines the backend architecture for real-time multi-camera video processing, stitching, and delivery based on industry best practices and NHL's proven cloud-based approach. The system processes 2-6 simultaneous phone camera streams into a single, professional-quality hockey game video.

## Architecture Philosophy

**Cloud-First Approach**: Following NHL's successful implementation of cloud-based live sports production using AWS, reducing infrastructure costs and enabling remote collaboration.

**Edge + Cloud Hybrid**: Local edge processing for quality assessment and encoding, cloud-based processing for AI-intensive tasks like stitching and enhancement.

**Real-Time Performance**: Target <200ms processing latency per frame pair for smooth 30fps output.

## System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Parent Phone  │    │   Parent Phone  │    │   Parent Phone  │
│   Camera 1      │    │   Camera 2      │    │   Camera N      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ RTSP/WebRTC Stream    │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Edge Gateway  │
                    │ (Quality Check) │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Stream Ingestion│
                    │   (AWS Kinesis) │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Quality/Sync    │    │ Real-Time       │    │ AI Processing   │
│ Processor       │    │ Video Stitcher  │    │ (SAM 2 Future)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Output Encoder  │
                    │ & CDN Delivery  │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Parent Devices  │
                    │ (Live Stream)   │
                    └─────────────────┘
```

## Core Processing Components

### 1. Stream Ingestion Layer

```python
# Real-Time Stream Ingestion Service
class StreamIngestionService:
    def __init__(self):
        self.kinesis_client = boto3.client('kinesis')
        self.active_streams = {}
        self.quality_thresholds = {
            'min_resolution': (720, 480),
            'min_fps': 24,
            'max_latency_ms': 500
        }
    
    async def accept_stream(self, stream_metadata: StreamMetadata) -> StreamSession:
        """
        Accept incoming stream from parent device
        """
        # Validate stream quality
        quality_check = await self.validate_stream_quality(stream_metadata)
        
        if not quality_check.meets_minimum:
            return StreamSession(
                accepted=False,
                reason=quality_check.rejection_reason,
                suggested_adjustments=quality_check.improvements
            )
        
        # Create stream session
        session = StreamSession(
            stream_id=generate_stream_id(),
            camera_position=stream_metadata.position,
            quality_score=quality_check.score,
            expected_bitrate=calculate_optimal_bitrate(quality_check),
            processing_priority=determine_processing_priority(
                stream_metadata.position, 
                quality_check.score
            )
        )
        
        # Register with Kinesis
        await self.kinesis_client.create_stream(
            StreamName=session.stream_id,
            ShardCount=1
        )
        
        self.active_streams[session.stream_id] = session
        return session
    
    async def process_stream_chunk(self, chunk: StreamChunk) -> ProcessingResult:
        """
        Process incoming video chunk
        """
        # Add timestamp synchronization
        synchronized_chunk = await self.synchronize_timestamp(chunk)
        
        # Quality assessment
        quality_metrics = await self.assess_chunk_quality(synchronized_chunk)
        
        # Update stream priority based on quality
        await self.update_stream_priority(chunk.stream_id, quality_metrics)
        
        # Forward to processing pipeline
        await self.forward_to_stitcher(synchronized_chunk, quality_metrics)
        
        return ProcessingResult(
            processed=True,
            quality_score=quality_metrics.overall_score,
            processing_time_ms=quality_metrics.processing_time
        )
```

### 2. Real-Time Video Stitching Engine

Based on research showing multi-GPU systems can achieve 13+ fps for real-time stitching:

```python
# Multi-GPU Real-Time Video Stitcher
class RealTimeVideoStitcher:
    def __init__(self):
        self.gpu_pool = GPUPool(
            gpu_count=4,  # Multi-GPU setup for parallel processing
            memory_per_gpu="16GB",
            cuda_cores="5000+"
        )
        self.stitching_algorithm = "homography_refinement"
        self.target_fps = 30
        self.max_processing_time_ms = 200  # <200ms per frame pair
    
    async def stitch_frame_set(self, frame_set: MultiCameraFrameSet) -> StitchedFrame:
        """
        Stitch frames from multiple cameras in real-time
        """
        # Parallel GPU processing
        gpu_tasks = []
        
        # Assign frames to different GPUs
        for gpu_id, frame_subset in enumerate(self.distribute_frames(frame_set)):
            gpu_task = self.gpu_pool.process_on_gpu(
                gpu_id=gpu_id,
                frames=frame_subset,
                operation="feature_detection_and_matching"
            )
            gpu_tasks.append(gpu_task)
        
        # Wait for parallel processing
        processed_frames = await asyncio.gather(*gpu_tasks)
        
        # Stitch using homography refinement (NHL-inspired approach)
        stitched_frame = await self.perform_stitching(
            processed_frames,
            algorithm=self.stitching_algorithm,
            quality_weights=frame_set.quality_weights
        )
        
        # Quality validation
        quality_check = await self.validate_stitched_quality(stitched_frame)
        
        if quality_check.score < 0.7:
            # Fallback to best single camera
            return await self.fallback_to_best_camera(frame_set)
        
        return stitched_frame
    
    def calculate_camera_weights(self, cameras: List[CameraStream]) -> Dict[str, float]:
        """
        Calculate camera contribution weights based on quality and position
        """
        weights = {}
        
        for camera in cameras:
            # Base weight from position priority
            position_weight = {
                'center_ice': 1.0,      # Highest priority
                'corner_cam': 0.8,      # Second priority
                'goal_line': 0.6,       # Third priority
                'bench_side': 0.4       # Lowest priority
            }.get(camera.position, 0.5)
            
            # Quality modifier (0.3 to 1.0)
            quality_modifier = max(0.3, camera.quality_score)
            
            # Final weight
            weights[camera.stream_id] = position_weight * quality_modifier
        
        # Normalize weights
        total_weight = sum(weights.values())
        return {k: v/total_weight for k, v in weights.items()}
    
    async def intelligent_camera_switching(self, frame_set: MultiCameraFrameSet) -> CameraSwitchingDecision:
        """
        Determine optimal camera switching based on action and quality
        """
        # Analyze frame content for action location
        action_analysis = await self.analyze_action_location(frame_set)
        
        # Calculate camera suitability scores
        camera_scores = {}
        for camera in frame_set.cameras:
            # Distance from action
            distance_score = self.calculate_distance_score(
                camera.position, 
                action_analysis.action_location
            )
            
            # Quality score
            quality_score = camera.current_quality_score
            
            # Coverage score (is action in frame?)
            coverage_score = self.calculate_coverage_score(
                camera.frame, 
                action_analysis.action_location
            )
            
            # Combined score
            camera_scores[camera.stream_id] = (
                distance_score * 0.3 + 
                quality_score * 0.4 + 
                coverage_score * 0.3
            )
        
        # Select best camera
        best_camera = max(camera_scores.items(), key=lambda x: x[1])
        
        return CameraSwitchingDecision(
            primary_camera=best_camera[0],
            secondary_cameras=sorted(camera_scores.items(), key=lambda x: x[1], reverse=True)[1:3],
            confidence=best_camera[1],
            switch_reason=action_analysis.event_type
        )
```

### 3. Cloud-Based Processing Pipeline

Following NHL's AWS-based approach:

```python
# Cloud Processing Pipeline (AWS-Based)
class CloudProcessingPipeline:
    def __init__(self):
        self.ec2_instances = self.setup_ec2_compute_cluster()
        self.s3_storage = S3StorageManager()
        self.cloudfront_cdn = CloudFrontCDN()
        self.processing_queue = SQSQueue("video-processing-queue")
    
    def setup_ec2_compute_cluster(self) -> EC2ComputeCluster:
        """
        Set up GPU-enabled EC2 instances for video processing
        """
        return EC2ComputeCluster(
            instance_types=["p3.2xlarge", "p3.8xlarge"],  # GPU instances
            auto_scaling_group={
                "min_size": 2,
                "max_size": 10,
                "target_capacity": "maintain_latency_sla"
            },
            gpu_specifications={
                "gpu_memory": "16GB+",
                "cuda_cores": "5000+",
                "nvlink_support": True  # Multi-GPU communication
            }
        )
    
    async def process_game_stream(self, game_session: GameSession) -> ProcessingJob:
        """
        Main processing pipeline for live game
        """
        processing_job = ProcessingJob(
            game_id=game_session.id,
            camera_count=len(game_session.active_cameras),
            processing_mode="real_time_stitching",
            target_latency_ms=1000  # NHL achieves <1s end-to-end
        )
        
        # Start parallel processing streams
        processing_tasks = []
        
        for camera_stream in game_session.active_cameras:
            task = self.process_camera_stream(
                camera_stream, 
                processing_job.settings
            )
            processing_tasks.append(task)
        
        # Real-time stitching
        stitching_task = self.real_time_stitching_pipeline(
            processing_tasks,
            processing_job.settings
        )
        
        # CDN delivery
        delivery_task = self.setup_cdn_delivery(
            stitching_task,
            game_session.subscriber_endpoints
        )
        
        return processing_job
    
    async def real_time_stitching_pipeline(self, input_streams: List[StreamTask], settings: ProcessingSettings) -> OutputStream:
        """
        Real-time stitching using multi-GPU cluster
        """
        stitcher = DistributedVideoStitcher(
            compute_cluster=self.ec2_instances,
            stitching_algorithm="adaptive_homography",
            quality_target="broadcast_quality"
        )
        
        # Process stream chunks in real-time
        async for frame_set in self.collect_synchronized_frames(input_streams):
            # Stitch frames
            stitched_frame = await stitcher.stitch_frame_set(frame_set)
            
            # Apply enhancements
            enhanced_frame = await self.apply_real_time_enhancements(stitched_frame)
            
            # Stream to CDN
            await self.stream_to_cdn(enhanced_frame)
            
            # Store for post-processing
            await self.store_for_post_processing(enhanced_frame, frame_set.metadata)
        
        return OutputStream(
            stream_url=self.cloudfront_cdn.get_stream_url(),
            quality="1080p30fps",
            latency_ms=settings.target_latency_ms
        )
```

### 4. Quality-Based Processing Logic

```python
# Camera Quality Assessment and Processing Weight Calculator
class CameraQualityProcessor:
    def __init__(self):
        self.quality_metrics = [
            "resolution",
            "frame_rate", 
            "stability",
            "lighting",
            "focus_quality",
            "motion_blur"
        ]
    
    async def assess_camera_quality(self, camera_stream: CameraStream) -> QualityAssessment:
        """
        Comprehensive quality assessment for camera stream
        """
        assessment = QualityAssessment()
        
        # Technical quality metrics
        assessment.resolution_score = self.assess_resolution(camera_stream.resolution)
        assessment.frame_rate_score = self.assess_frame_rate(camera_stream.fps)
        assessment.stability_score = await self.assess_stability(camera_stream.frames[-10:])
        assessment.lighting_score = await self.assess_lighting(camera_stream.latest_frame)
        assessment.focus_score = await self.assess_focus_quality(camera_stream.latest_frame)
        
        # Position-specific scoring
        assessment.position_effectiveness = self.assess_position_effectiveness(
            camera_stream.position,
            camera_stream.latest_frame
        )
        
        # Calculate overall score
        assessment.overall_score = self.calculate_weighted_score(assessment)
        
        # Determine processing weight
        assessment.processing_weight = self.calculate_processing_weight(
            assessment.overall_score,
            camera_stream.position
        )
        
        return assessment
    
    def calculate_processing_weight(self, quality_score: float, position: str) -> float:
        """
        Calculate how much this camera should contribute to final edit
        """
        # Base weight from position priority (following research)
        position_weights = {
            'center_ice': 1.0,      # Primary view
            'corner_cam_1': 0.85,   # Good coverage
            'corner_cam_2': 0.85,   # Good coverage  
            'bench_side': 0.7,      # Secondary view
            'goal_line_1': 0.6,     # Specialized view
            'goal_line_2': 0.6      # Specialized view
        }
        
        base_weight = position_weights.get(position, 0.5)
        
        # Quality modifier
        # Poor quality (< 0.4): Reduce weight significantly
        # Average quality (0.4-0.7): Slight reduction
        # Good quality (> 0.7): Full weight
        if quality_score < 0.4:
            quality_modifier = 0.3  # Use sparingly
        elif quality_score < 0.7:
            quality_modifier = 0.7  # Reduced usage
        else:
            quality_modifier = 1.0  # Full usage
        
        final_weight = base_weight * quality_modifier
        
        # Ensure minimum contribution (never completely exclude)
        return max(0.1, final_weight)
    
    async def dynamic_weight_adjustment(self, game_session: GameSession) -> Dict[str, float]:
        """
        Dynamically adjust camera weights during game
        """
        current_weights = {}
        
        for camera in game_session.active_cameras:
            # Recent quality trend
            recent_quality = await self.analyze_quality_trend(camera, window_seconds=30)
            
            # Current game situation
            game_situation = await self.analyze_game_situation(game_session)
            
            # Adjust weight based on situation
            situation_modifier = self.get_situation_modifier(
                camera.position, 
                game_situation
            )
            
            # Calculate dynamic weight
            current_weights[camera.stream_id] = (
                camera.base_processing_weight * 
                recent_quality.trend_modifier * 
                situation_modifier
            )
        
        # Normalize to ensure total doesn't exceed reasonable bounds
        return self.normalize_weights(current_weights)
    
    def get_situation_modifier(self, position: str, situation: GameSituation) -> float:
        """
        Adjust camera importance based on game situation
        """
        modifiers = {
            # Power play - emphasize offensive zone
            'power_play': {
                'center_ice': 1.2,
                'corner_cam_1': 1.1,
                'corner_cam_2': 1.1,
                'goal_line_1': 0.9,
                'goal_line_2': 0.9
            },
            # Regular play - balanced
            'even_strength': {
                'center_ice': 1.0,
                'corner_cam_1': 1.0,
                'corner_cam_2': 1.0,
                'goal_line_1': 1.0,
                'goal_line_2': 1.0
            },
            # Penalty kill - emphasize defensive positioning
            'penalty_kill': {
                'center_ice': 1.0,
                'corner_cam_1': 0.9,
                'corner_cam_2': 0.9,
                'goal_line_1': 1.1,
                'goal_line_2': 1.1
            }
        }
        
        return modifiers.get(situation.type, {}).get(position, 1.0)
```

## Performance Optimization

### 1. Latency Optimization

```python
# Low-Latency Processing Configuration
PROCESSING_OPTIMIZATION = {
    # Target performance metrics
    "target_latency_ms": 1000,      # NHL achieves <1s end-to-end
    "processing_per_frame_ms": 200,  # <200ms per frame for 5fps minimum
    "stitching_fps_target": 30,     # Smooth 30fps output
    
    # GPU optimization
    "gpu_memory_allocation": "16GB_per_instance",
    "cuda_cores_minimum": 5000,
    "nvlink_enabled": True,         # Multi-GPU communication
    
    # Stream processing optimization
    "chunk_size_ms": 100,           # Small chunks for low latency
    "parallel_processing": True,    # Process multiple streams simultaneously
    "adaptive_quality": True,       # Adjust quality based on bandwidth
    
    # CDN optimization
    "edge_caching": True,
    "adaptive_bitrate": True,
    "global_distribution": True
}
```

### 2. Cost Optimization

```python
# Cost-Effective Scaling Strategy
class CostOptimizedProcessing:
    def __init__(self):
        self.cost_targets = {
            "processing_cost_per_game": "$5.00",    # Target: $5 per 60-minute game
            "storage_cost_per_gb": "$0.023",        # S3 standard pricing
            "bandwidth_cost_per_gb": "$0.085"      # CloudFront pricing
        }
    
    def calculate_processing_cost(self, game_session: GameSession) -> CostEstimate:
        """
        Calculate real-time processing costs
        """
        # EC2 GPU instance costs (p3.2xlarge: ~$3.06/hour)
        processing_hours = game_session.duration_minutes / 60
        instance_cost = processing_hours * 3.06
        
        # Storage costs (temporary storage during processing)
        temp_storage_gb = game_session.camera_count * 1.5  # 1.5GB per camera
        storage_cost = temp_storage_gb * 0.023
        
        # Bandwidth costs (streaming to parents)
        output_bandwidth_gb = processing_hours * 2.5  # 2.5GB/hour for 1080p
        subscriber_count = len(game_session.subscribers)
        bandwidth_cost = output_bandwidth_gb * subscriber_count * 0.085
        
        return CostEstimate(
            processing=instance_cost,
            storage=storage_cost,
            bandwidth=bandwidth_cost,
            total=instance_cost + storage_cost + bandwidth_cost
        )
    
    def optimize_for_cost(self, game_session: GameSession) -> OptimizationStrategy:
        """
        Optimize processing based on cost constraints
        """
        cost_estimate = self.calculate_processing_cost(game_session)
        
        if cost_estimate.total > 8.00:  # Above target
            return OptimizationStrategy(
                reduce_output_resolution="720p",
                limit_parallel_processing=True,
                use_spot_instances=True,
                compress_temporary_storage=True
            )
        
        return OptimizationStrategy(
            output_resolution="1080p",
            full_parallel_processing=True,
            use_on_demand_instances=True,
            standard_storage=True
        )
```

## Integration Points

### 1. Mobile App Integration

```javascript
// Mobile App Real-Time Streaming Integration
class RealTimeStreamUploader {
    constructor(gameSession) {
        this.gameSession = gameSession;
        this.streamEndpoint = `wss://stream.hockeylive.app/upload/${gameSession.id}`;
        this.qualityMonitor = new StreamQualityMonitor();
        this.adaptiveEncoder = new AdaptiveVideoEncoder();
    }
    
    async startRealTimeUpload() {
        // Connect to streaming endpoint
        this.websocket = new WebSocket(this.streamEndpoint);
        
        // Configure adaptive encoding based on network conditions
        const encodingSettings = await this.adaptiveEncoder.getOptimalSettings();
        
        // Start camera capture with optimal settings
        const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: encodingSettings.resolution.width,
                height: encodingSettings.resolution.height,
                frameRate: encodingSettings.frameRate
            },
            audio: true
        });
        
        // Create media recorder for chunked upload
        this.mediaRecorder = new MediaRecorder(mediaStream, {
            videoBitsPerSecond: encodingSettings.bitrate,
            audioBitsPerSecond: 128000
        });
        
        // Handle data chunks
        this.mediaRecorder.ondataavailable = (event) => {
            this.uploadChunk(event.data);
        };
        
        // Start recording with small chunks for low latency
        this.mediaRecorder.start(100); // 100ms chunks
    }
    
    async uploadChunk(chunkData) {
        const chunkMetadata = {
            timestamp: Date.now(),
            cameraPosition: this.gameSession.assignedPosition,
            qualityMetrics: await this.qualityMonitor.assessChunk(chunkData),
            sequenceNumber: this.getNextSequenceNumber()
        };
        
        // Upload chunk with metadata
        this.websocket.send(JSON.stringify({
            type: 'video_chunk',
            metadata: chunkMetadata,
            data: await this.arrayBufferToBase64(chunkData)
        }));
    }
}
```

This real-time video processing architecture provides the foundation for professional-quality hockey game streaming while maintaining cost efficiency and leveraging proven cloud-based approaches from industry leaders like the NHL.