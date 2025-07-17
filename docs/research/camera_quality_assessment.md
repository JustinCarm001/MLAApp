# Camera Quality Assessment System - Hockey Live App

## Overview

The Camera Quality Assessment System evaluates the technical and positional quality of each parent's phone camera in real-time, then uses these metrics to intelligently weight camera contributions in the final video edit. Poor quality cameras receive minimal screen time, while high-quality cameras with optimal positioning get priority.

## Quality Assessment Framework

### 1. Multi-Dimensional Quality Metrics

```python
# Camera Quality Assessment Engine
class CameraQualityAssessment:
    def __init__(self):
        self.quality_dimensions = {
            'technical_quality': 0.4,      # 40% weight
            'positional_effectiveness': 0.3, # 30% weight
            'stability_metrics': 0.2,       # 20% weight
            'content_relevance': 0.1        # 10% weight
        }
        
        self.quality_thresholds = {
            'excellent': 0.85,     # 85%+ - Primary camera candidate
            'good': 0.70,          # 70-84% - Secondary camera
            'acceptable': 0.50,    # 50-69% - Supplementary usage
            'poor': 0.30,          # 30-49% - Minimal usage
            'unusable': 0.0        # <30% - Exclude from edit
        }
    
    async def assess_camera_stream(self, camera_stream: CameraStream) -> QualityReport:
        """
        Comprehensive quality assessment for incoming camera stream
        """
        # Technical quality assessment
        technical_score = await self.assess_technical_quality(camera_stream)
        
        # Positional effectiveness
        position_score = await self.assess_positional_effectiveness(camera_stream)
        
        # Stability metrics
        stability_score = await self.assess_stability(camera_stream)
        
        # Content relevance (what's actually in frame)
        content_score = await self.assess_content_relevance(camera_stream)
        
        # Calculate weighted overall score
        overall_score = (
            technical_score * self.quality_dimensions['technical_quality'] +
            position_score * self.quality_dimensions['positional_effectiveness'] +
            stability_score * self.quality_dimensions['stability_metrics'] +
            content_score * self.quality_dimensions['content_relevance']
        )
        
        # Generate quality report
        return QualityReport(
            stream_id=camera_stream.id,
            overall_score=overall_score,
            quality_tier=self.determine_quality_tier(overall_score),
            technical_metrics=technical_score,
            position_metrics=position_score,
            stability_metrics=stability_score,
            content_metrics=content_score,
            recommendations=self.generate_improvement_recommendations(
                technical_score, position_score, stability_score, content_score
            ),
            processing_weight=self.calculate_processing_weight(overall_score, camera_stream.position)
        )
```

### 2. Technical Quality Assessment

```python
# Technical Quality Metrics
class TechnicalQualityAssessor:
    def __init__(self):
        self.resolution_standards = {
            '1080p': 1.0,      # Full score for 1080p
            '720p': 0.8,       # Good score for 720p
            '480p': 0.5,       # Acceptable for 480p
            '360p': 0.2        # Poor for 360p and below
        }
        
        self.fps_standards = {
            60: 1.0,           # Excellent
            30: 0.9,           # Very good
            24: 0.7,           # Acceptable
            15: 0.3            # Poor
        }
    
    async def assess_technical_quality(self, camera_stream: CameraStream) -> TechnicalQualityMetrics:
        """
        Assess technical aspects of video quality
        """
        # Resolution assessment
        resolution_score = self.assess_resolution(camera_stream.resolution)
        
        # Frame rate assessment
        fps_score = self.assess_frame_rate(camera_stream.current_fps)
        
        # Bitrate and compression quality
        bitrate_score = await self.assess_bitrate_quality(camera_stream)
        
        # Lighting conditions
        lighting_score = await self.assess_lighting_conditions(camera_stream.latest_frame)
        
        # Focus and sharpness
        focus_score = await self.assess_focus_sharpness(camera_stream.latest_frame)
        
        # Color accuracy and saturation
        color_score = await self.assess_color_quality(camera_stream.latest_frame)
        
        # Audio quality (if applicable)
        audio_score = await self.assess_audio_quality(camera_stream.audio_track)
        
        # Calculate weighted technical score
        technical_score = (
            resolution_score * 0.25 +
            fps_score * 0.20 +
            bitrate_score * 0.15 +
            lighting_score * 0.15 +
            focus_score * 0.15 +
            color_score * 0.05 +
            audio_score * 0.05
        )
        
        return TechnicalQualityMetrics(
            overall_score=technical_score,
            resolution=resolution_score,
            frame_rate=fps_score,
            bitrate=bitrate_score,
            lighting=lighting_score,
            focus=focus_score,
            color=color_score,
            audio=audio_score
        )
    
    async def assess_lighting_conditions(self, frame: VideoFrame) -> float:
        """
        Assess lighting quality in current frame
        """
        # Convert to grayscale for analysis
        gray_frame = cv2.cvtColor(frame.data, cv2.COLOR_BGR2GRAY)
        
        # Calculate histogram
        histogram = cv2.calcHist([gray_frame], [0], None, [256], [0, 256])
        
        # Analyze lighting characteristics
        mean_brightness = np.mean(gray_frame)
        brightness_std = np.std(gray_frame)
        
        # Check for overexposure/underexposure
        overexposed_pixels = np.sum(gray_frame > 240) / gray_frame.size
        underexposed_pixels = np.sum(gray_frame < 15) / gray_frame.size
        
        # Calculate lighting score
        # Ideal: mean brightness 100-150, good contrast (std > 30), minimal over/under exposure
        brightness_score = 1.0 - abs(mean_brightness - 125) / 125
        contrast_score = min(1.0, brightness_std / 50)
        exposure_penalty = (overexposed_pixels + underexposed_pixels) * 2
        
        lighting_score = max(0.0, (brightness_score + contrast_score) / 2 - exposure_penalty)
        
        return lighting_score
    
    async def assess_focus_sharpness(self, frame: VideoFrame) -> float:
        """
        Assess focus and sharpness quality
        """
        # Convert to grayscale
        gray_frame = cv2.cvtColor(frame.data, cv2.COLOR_BGR2GRAY)
        
        # Calculate Laplacian variance (measures sharpness)
        laplacian_var = cv2.Laplacian(gray_frame, cv2.CV_64F).var()
        
        # Calculate gradient magnitude (edge detection)
        sobelx = cv2.Sobel(gray_frame, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray_frame, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(sobelx**2 + sobely**2).mean()
        
        # Normalize scores
        # Good focus typically has Laplacian variance > 100 and gradient magnitude > 20
        sharpness_score = min(1.0, laplacian_var / 200)
        edge_score = min(1.0, gradient_magnitude / 40)
        
        focus_score = (sharpness_score + edge_score) / 2
        
        return focus_score
```

### 3. Positional Effectiveness Assessment

```python
# Positional Quality Assessment
class PositionalEffectivenessAssessor:
    def __init__(self):
        # Hockey-specific region importance weights
        self.ice_regions = {
            'center_ice': 1.0,          # Most important for overall game view
            'offensive_zone': 0.9,      # High scoring activity
            'defensive_zone': 0.9,      # High defensive activity
            'neutral_zone': 0.7,        # Medium importance
            'corners': 0.8,             # Good for puck battles
            'behind_net': 0.6,          # Specialized plays
            'bench_area': 0.4           # Lower priority
        }
    
    async def assess_positional_effectiveness(self, camera_stream: CameraStream) -> PositionalMetrics:
        """
        Assess how effectively the camera position covers important game areas
        """
        # Analyze current frame coverage
        coverage_analysis = await self.analyze_ice_coverage(camera_stream.latest_frame)
        
        # Calculate viewing angle quality
        angle_quality = self.assess_viewing_angle(camera_stream.position, camera_stream.orientation)
        
        # Assess distance appropriateness
        distance_quality = self.assess_viewing_distance(camera_stream.position, coverage_analysis)
        
        # Check for obstructions
        obstruction_penalty = await self.detect_obstructions(camera_stream.latest_frame)
        
        # Calculate position-specific effectiveness
        position_effectiveness = self.calculate_position_effectiveness(
            camera_stream.position,
            coverage_analysis,
            angle_quality,
            distance_quality
        )
        
        # Apply obstruction penalty
        final_score = max(0.0, position_effectiveness - obstruction_penalty)
        
        return PositionalMetrics(
            overall_score=final_score,
            ice_coverage=coverage_analysis.coverage_percentage,
            viewing_angle=angle_quality,
            viewing_distance=distance_quality,
            obstruction_penalty=obstruction_penalty,
            position_type=camera_stream.position,
            covered_regions=coverage_analysis.covered_regions
        )
    
    async def analyze_ice_coverage(self, frame: VideoFrame) -> IceCoverageAnalysis:
        """
        Analyze how much of the ice surface is visible in the frame
        """
        # Use computer vision to detect ice boundaries
        ice_mask = await self.detect_ice_surface(frame)
        
        # Identify different regions of the ice
        regions = await self.identify_ice_regions(ice_mask, frame)
        
        # Calculate coverage percentages
        total_ice_pixels = np.sum(ice_mask)
        frame_pixels = frame.width * frame.height
        coverage_percentage = total_ice_pixels / frame_pixels
        
        # Weight regions by importance
        weighted_coverage = 0
        covered_regions = []
        
        for region_name, region_mask in regions.items():
            if np.sum(region_mask) > 0:  # Region is visible
                region_coverage = np.sum(region_mask) / total_ice_pixels
                region_weight = self.ice_regions.get(region_name, 0.5)
                weighted_coverage += region_coverage * region_weight
                covered_regions.append(region_name)
        
        return IceCoverageAnalysis(
            coverage_percentage=coverage_percentage,
            weighted_coverage=weighted_coverage,
            covered_regions=covered_regions,
            ice_mask=ice_mask,
            region_masks=regions
        )
    
    def calculate_position_effectiveness(self, position: str, coverage: IceCoverageAnalysis, angle: float, distance: float) -> float:
        """
        Calculate overall positional effectiveness score
        """
        # Base effectiveness by position type
        position_base_scores = {
            'center_ice': 0.95,         # Excellent overall coverage
            'corner_cam_1': 0.85,       # Good diagonal coverage
            'corner_cam_2': 0.85,       # Good diagonal coverage
            'bench_side': 0.75,         # Good side coverage
            'goal_line_1': 0.70,        # Specialized coverage
            'goal_line_2': 0.70         # Specialized coverage
        }
        
        base_score = position_base_scores.get(position, 0.5)
        
        # Modify based on actual coverage
        coverage_modifier = coverage.weighted_coverage
        angle_modifier = angle
        distance_modifier = distance
        
        # Calculate final effectiveness
        effectiveness = base_score * coverage_modifier * angle_modifier * distance_modifier
        
        return min(1.0, effectiveness)
```

### 4. Stability Assessment

```python
# Camera Stability Assessment
class StabilityAssessor:
    def __init__(self):
        self.stability_window = 30  # Analyze last 30 frames
        self.motion_threshold = 5.0  # Pixels of acceptable motion
    
    async def assess_stability(self, camera_stream: CameraStream) -> StabilityMetrics:
        """
        Assess camera stability and motion characteristics
        """
        recent_frames = camera_stream.get_recent_frames(self.stability_window)
        
        if len(recent_frames) < 2:
            return StabilityMetrics(overall_score=1.0)  # Not enough data yet
        
        # Calculate frame-to-frame motion
        motion_vectors = await self.calculate_motion_vectors(recent_frames)
        
        # Assess different types of motion
        shake_score = self.assess_camera_shake(motion_vectors)
        drift_score = self.assess_camera_drift(motion_vectors)
        jitter_score = self.assess_camera_jitter(motion_vectors)
        
        # Overall stability score
        stability_score = (shake_score + drift_score + jitter_score) / 3
        
        return StabilityMetrics(
            overall_score=stability_score,
            shake_score=shake_score,
            drift_score=drift_score,
            jitter_score=jitter_score,
            average_motion=np.mean([mv.magnitude for mv in motion_vectors]),
            motion_consistency=self.calculate_motion_consistency(motion_vectors)
        )
    
    async def calculate_motion_vectors(self, frames: List[VideoFrame]) -> List[MotionVector]:
        """
        Calculate motion vectors between consecutive frames
        """
        motion_vectors = []
        
        for i in range(1, len(frames)):
            prev_frame = cv2.cvtColor(frames[i-1].data, cv2.COLOR_BGR2GRAY)
            curr_frame = cv2.cvtColor(frames[i].data, cv2.COLOR_BGR2GRAY)
            
            # Calculate optical flow
            flow = cv2.calcOpticalFlowPyrLK(
                prev_frame, 
                curr_frame,
                corners=cv2.goodFeaturesToTrack(prev_frame, 100, 0.01, 10),
                nextPts=None
            )
            
            # Calculate average motion
            if flow[0] is not None and flow[1] is not None:
                motion_x = np.mean(flow[1][:, 0] - flow[0][:, 0])
                motion_y = np.mean(flow[1][:, 1] - flow[0][:, 1])
                magnitude = np.sqrt(motion_x**2 + motion_y**2)
                
                motion_vectors.append(MotionVector(
                    x=motion_x,
                    y=motion_y,
                    magnitude=magnitude,
                    timestamp=frames[i].timestamp
                ))
        
        return motion_vectors
    
    def assess_camera_shake(self, motion_vectors: List[MotionVector]) -> float:
        """
        Assess rapid, small movements (camera shake)
        """
        if not motion_vectors:
            return 1.0
        
        # High-frequency, low-amplitude motion indicates shake
        motion_magnitudes = [mv.magnitude for mv in motion_vectors]
        motion_variance = np.var(motion_magnitudes)
        average_motion = np.mean(motion_magnitudes)
        
        # Good stability: low variance, low average motion
        shake_score = 1.0 - min(1.0, (motion_variance + average_motion) / 20)
        
        return max(0.0, shake_score)
```

### 5. Content Relevance Assessment

```python
# Content Relevance Analyzer
class ContentRelevanceAssessor:
    def __init__(self):
        self.hockey_elements = {
            'players': 0.4,         # 40% - Players in frame
            'puck': 0.3,            # 30% - Puck visibility
            'goal_area': 0.2,       # 20% - Goal/crease area
            'game_action': 0.1      # 10% - Active play
        }
    
    async def assess_content_relevance(self, camera_stream: CameraStream) -> ContentRelevanceMetrics:
        """
        Assess how much relevant hockey content is in the frame
        """
        frame = camera_stream.latest_frame
        
        # Detect hockey players
        player_score = await self.detect_players(frame)
        
        # Detect puck (if possible)
        puck_score = await self.detect_puck(frame)
        
        # Identify goal area coverage
        goal_area_score = await self.detect_goal_area(frame)
        
        # Assess game action level
        action_score = await self.assess_action_level(camera_stream.recent_frames)
        
        # Calculate weighted relevance score
        relevance_score = (
            player_score * self.hockey_elements['players'] +
            puck_score * self.hockey_elements['puck'] +
            goal_area_score * self.hockey_elements['goal_area'] +
            action_score * self.hockey_elements['game_action']
        )
        
        return ContentRelevanceMetrics(
            overall_score=relevance_score,
            player_detection=player_score,
            puck_detection=puck_score,
            goal_area_coverage=goal_area_score,
            action_level=action_score
        )
    
    async def detect_players(self, frame: VideoFrame) -> float:
        """
        Detect hockey players in the frame
        """
        # Use YOLO or similar object detection for person detection
        # This is a simplified implementation
        
        # Convert frame for processing
        frame_data = frame.data
        
        # Run object detection (placeholder - would use actual model)
        detected_objects = await self.run_object_detection(frame_data, target_class='person')
        
        # Filter for hockey players (on ice, appropriate size, etc.)
        hockey_players = self.filter_hockey_players(detected_objects, frame)
        
        # Score based on number and quality of player detections
        player_count = len(hockey_players)
        
        # Ideal: 6-12 players visible (full teams on ice)
        if player_count >= 6:
            player_score = min(1.0, player_count / 12)
        else:
            player_score = player_count / 6
        
        return player_score
```

## Quality-Based Processing Weights

### 1. Dynamic Weight Calculation

```python
# Processing Weight Calculator
class ProcessingWeightCalculator:
    def __init__(self):
        self.weight_algorithms = {
            'position_priority': self.calculate_position_weight,
            'quality_modifier': self.calculate_quality_weight,
            'situation_adaptive': self.calculate_situation_weight,
            'temporal_adjustment': self.calculate_temporal_weight
        }
    
    def calculate_final_processing_weight(self, camera: CameraStream, game_context: GameContext) -> ProcessingWeight:
        """
        Calculate final processing weight considering all factors
        """
        # Base weight from position
        position_weight = self.calculate_position_weight(camera.position)
        
        # Quality modifier
        quality_weight = self.calculate_quality_weight(camera.quality_assessment)
        
        # Game situation modifier
        situation_weight = self.calculate_situation_weight(camera.position, game_context)
        
        # Temporal adjustment (recent performance)
        temporal_weight = self.calculate_temporal_weight(camera.recent_performance)
        
        # Calculate final weight
        final_weight = position_weight * quality_weight * situation_weight * temporal_weight
        
        # Ensure minimum weight (never completely exclude)
        final_weight = max(0.05, min(1.0, final_weight))
        
        return ProcessingWeight(
            final_weight=final_weight,
            position_component=position_weight,
            quality_component=quality_weight,
            situation_component=situation_weight,
            temporal_component=temporal_weight,
            usage_recommendation=self.get_usage_recommendation(final_weight)
        )
    
    def calculate_position_weight(self, position: str) -> float:
        """
        Base weight from camera position (NHL research-informed)
        """
        position_weights = {
            # Center ice elevated - best overall coverage
            'center_ice': 1.0,
            
            # Corner cameras - good diagonal coverage
            'corner_cam_1': 0.85,
            'corner_cam_2': 0.85,
            
            # Bench side - good for line changes and bench action
            'bench_side': 0.75,
            
            # Goal line cameras - specialized for goal area
            'goal_line_1': 0.65,
            'goal_line_2': 0.65
        }
        
        return position_weights.get(position, 0.5)
    
    def calculate_quality_weight(self, quality_assessment: QualityReport) -> float:
        """
        Weight modifier based on camera quality
        """
        quality_score = quality_assessment.overall_score
        
        # Aggressive quality weighting to minimize poor camera usage
        if quality_score >= 0.85:
            return 1.0          # Excellent - full weight
        elif quality_score >= 0.70:
            return 0.8          # Good - slight reduction
        elif quality_score >= 0.50:
            return 0.5          # Acceptable - significant reduction
        elif quality_score >= 0.30:
            return 0.2          # Poor - minimal usage
        else:
            return 0.05         # Very poor - almost excluded
    
    def get_usage_recommendation(self, final_weight: float) -> UsageRecommendation:
        """
        Provide usage recommendation based on final weight
        """
        if final_weight >= 0.8:
            return UsageRecommendation(
                tier="primary",
                usage_percentage=60-80,
                description="Primary camera - use for majority of edit",
                switching_priority="high"
            )
        elif final_weight >= 0.6:
            return UsageRecommendation(
                tier="secondary",
                usage_percentage=20-40,
                description="Secondary camera - use for specific situations",
                switching_priority="medium"
            )
        elif final_weight >= 0.3:
            return UsageRecommendation(
                tier="supplementary",
                usage_percentage=5-15,
                description="Supplementary camera - use sparingly for variety",
                switching_priority="low"
            )
        else:
            return UsageRecommendation(
                tier="minimal",
                usage_percentage=0-5,
                description="Minimal usage - only when no better option",
                switching_priority="very_low"
            )
```

## Real-Time Quality Monitoring

### 1. Live Quality Dashboard

```python
# Real-Time Quality Monitoring
class LiveQualityMonitor:
    def __init__(self):
        self.monitoring_interval = 5  # seconds
        self.quality_history_window = 300  # 5 minutes
        
    async def monitor_game_quality(self, game_session: GameSession) -> QualityDashboard:
        """
        Real-time quality monitoring dashboard
        """
        dashboard = QualityDashboard()
        
        for camera in game_session.active_cameras:
            # Current quality assessment
            current_quality = await self.assess_current_quality(camera)
            
            # Quality trend analysis
            quality_trend = self.analyze_quality_trend(camera.quality_history)
            
            # Performance prediction
            performance_prediction = self.predict_future_performance(camera)
            
            # Add to dashboard
            dashboard.add_camera_status(CameraStatus(
                camera_id=camera.id,
                position=camera.position,
                current_quality=current_quality,
                quality_trend=quality_trend,
                processing_weight=camera.current_processing_weight,
                performance_prediction=performance_prediction,
                recommendations=self.generate_real_time_recommendations(camera)
            ))
        
        return dashboard
    
    def generate_real_time_recommendations(self, camera: CameraStream) -> List[Recommendation]:
        """
        Generate real-time recommendations for camera improvement
        """
        recommendations = []
        quality = camera.latest_quality_assessment
        
        if quality.technical_metrics.lighting < 0.6:
            recommendations.append(Recommendation(
                type="lighting",
                severity="medium",
                message="Lighting conditions could be improved",
                suggestion="Move to a position with better lighting or adjust phone settings"
            ))
        
        if quality.stability_metrics.overall_score < 0.7:
            recommendations.append(Recommendation(
                type="stability",
                severity="high",
                message="Camera movement detected",
                suggestion="Hold phone more steadily or use a tripod if available"
            ))
        
        if quality.positional_metrics.ice_coverage < 0.5:
            recommendations.append(Recommendation(
                type="positioning",
                severity="medium",
                message="Limited ice coverage",
                suggestion="Adjust camera angle to capture more of the playing area"
            ))
        
        return recommendations
```

This camera quality assessment system ensures that only the best camera feeds contribute significantly to the final edit, while poor quality cameras are minimized or excluded, resulting in a professional-quality final product regardless of varying parent phone capabilities.