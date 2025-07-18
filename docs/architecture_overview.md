# Architecture Overview - Hockey Live App

## System Architecture

The Hockey Live App is built as a distributed system with mobile clients, backend services, and cloud infrastructure designed to handle real-time multi-camera video streaming, processing, and compilation.

## High-Level Architecture

```
                                                           
   Mobile Apps          Web Portal           Admin Panel   
   (iOS/Android)        (React.js)           (React.js)    
                                                           
                                                       
                                <                       
                                 
                                     
                       Load Balancer 
                       (nginx/AWS)   
                                     
                                 
                                     
                       API Gateway   
                       (FastAPI)     
                                     
                                 
                                <                       
                                                       
                                                           
   Game Service       Video Service         User Service   
   (Sessions)         (Processing)         (Auth/Profile)  
                                                           
                                                       
                                <                       
                                 
                                     
                       Database      
                       (PostgreSQL)  
                                     
                                 
                                     
                       File Storage  
                       (AWS S3/CDN)  
                                     
```

## Core Components

### 1. Mobile Application Layer

**Technology Stack:**
- React Native for cross-platform development
- WebRTC for real-time video streaming
- WebSocket for real-time synchronization
- Native camera APIs for video capture

**Key Responsibilities:**
```typescript
// Mobile App Architecture
interface MobileAppArchitecture {
  // UI Layer
  screens: {
    gameJoin: GameJoinScreen;
    cameraSetup: CameraSetupScreen;
    recording: RecordingScreen;
    gameHistory: GameHistoryScreen;
  };
  
  // Service Layer
  services: {
    gameSync: GameSyncService;
    cameraManager: CameraManagerService;
    streamUpload: StreamUploadService;
    positionValidation: PositionValidationService;
  };
  
  // State Management
  state: {
    gameSession: GameSessionState;
    cameraState: CameraState;
    userProfile: UserProfileState;
    appSettings: AppSettingsState;
  };
}
```

### 2. Backend Services Layer

**Technology Stack:**
- FastAPI (Python) for API services
- PostgreSQL for relational data
- Redis for caching and real-time features
- WebSocket for real-time communication

#### Game Management Service

```python
# Game Service Architecture
class GameService:
    def __init__(self):
        self.session_manager = SessionManager()
        self.position_assigner = PositionAssigner()
        self.sync_coordinator = SyncCoordinator()
    
    async def create_game_session(self, game_info: GameInfo) -> GameSession:
        """Create new game session with join code"""
        session = await self.session_manager.create_session(game_info)
        positions = await self.position_assigner.assign_positions(
            session.arena_type, 
            session.max_cameras
        )
        return GameSession(
            id=session.id,
            join_code=session.join_code,
            positions=positions,
            status="waiting"
        )
    
    async def join_game_session(self, join_request: JoinRequest) -> JoinResponse:
        """Handle parent joining game session"""
        session = await self.session_manager.get_session(join_request.game_code)
        position = await self.position_assigner.assign_next_position(session)
        
        return JoinResponse(
            game_id=session.id,
            assigned_position=position,
            sync_config=await self.sync_coordinator.get_sync_config(session)
        )
```

#### Video Processing Service

```python
# Video Processing Architecture
class VideoProcessingService:
    def __init__(self):
        self.stream_manager = StreamManager()
        self.video_compiler = VideoCompiler()
        self.quality_enhancer = QualityEnhancer()
    
    async def process_stream_chunk(self, chunk: StreamChunk) -> ProcessingResult:
        """Process incoming video stream chunk"""
        # Validate and store chunk
        await self.stream_manager.store_chunk(chunk)
        
        # Check if ready for compilation
        if await self.stream_manager.is_ready_for_compilation(chunk.game_id):
            compilation_job = await self.video_compiler.create_compilation_job(
                chunk.game_id
            )
            return ProcessingResult(
                chunk_processed=True,
                compilation_started=True,
                job_id=compilation_job.id
            )
        
        return ProcessingResult(chunk_processed=True)
    
    async def compile_game_video(self, game_id: str) -> CompilationResult:
        """Compile multi-camera streams into final video"""
        streams = await self.stream_manager.get_game_streams(game_id)
        
        # Synchronize streams
        synchronized_streams = await self.synchronize_streams(streams)
        
        # Apply quality enhancement
        enhanced_streams = await self.quality_enhancer.enhance_streams(
            synchronized_streams
        )
        
        # Compile final video
        final_video = await self.video_compiler.compile_video(
            enhanced_streams,
            switching_algorithm="puck_based"
        )
        
        return CompilationResult(
            video_id=final_video.id,
            download_url=final_video.url,
            duration=final_video.duration
        )
```

### 3. Database Layer

**PostgreSQL Schema Design:**

```sql
-- Game Sessions Table
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    join_code VARCHAR(6) UNIQUE NOT NULL,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    arena_type VARCHAR(50) NOT NULL,
    arena_name VARCHAR(200),
    game_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting',
    max_cameras INTEGER DEFAULT 6,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game Participants Table
CREATE TABLE game_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    position_name VARCHAR(50) NOT NULL,
    position_coordinates JSONB,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'joined'
);

-- Video Streams Table
CREATE TABLE video_streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    camera_id VARCHAR(100) NOT NULL,
    position VARCHAR(50) NOT NULL,
    stream_url VARCHAR(500),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    total_chunks INTEGER DEFAULT 0,
    file_size_mb DECIMAL(10,2),
    quality_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compiled Videos Table
CREATE TABLE compiled_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    file_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    duration_seconds INTEGER,
    file_size_mb DECIMAL(10,2),
    resolution VARCHAR(20),
    processing_status VARCHAR(20) DEFAULT 'queued',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Arena Configurations Table
CREATE TABLE arena_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arena_type VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    dimensions JSONB NOT NULL,
    optimal_positions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Real-Time Communication Layer

**WebSocket Architecture:**

```python
# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.game_sessions: Dict[str, GameSession] = {}
    
    async def connect(self, websocket: WebSocket, game_id: str, client_id: str):
        await websocket.accept()
        if game_id not in self.active_connections:
            self.active_connections[game_id] = []
        self.active_connections[game_id].append(websocket)
    
    async def broadcast_to_game(self, game_id: str, message: dict):
        """Broadcast message to all participants in a game"""
        if game_id in self.active_connections:
            for connection in self.active_connections[game_id]:
                try:
                    await connection.send_json(message)
                except ConnectionClosedError:
                    self.active_connections[game_id].remove(connection)
    
    async def send_sync_signal(self, game_id: str, sync_timestamp: str):
        """Send synchronization signal to all cameras"""
        sync_message = {
            "type": "sync_signal",
            "timestamp": sync_timestamp,
            "countdown": 3000  # 3 seconds
        }
        await self.broadcast_to_game(game_id, sync_message)
```

### 5. File Storage and CDN Layer

**AWS S3 Integration:**

```python
# File Storage Service
class FileStorageService:
    def __init__(self):
        self.s3_client = boto3.client('s3')
        self.bucket_name = 'hockey-live-videos'
        self.cloudfront_domain = 'cdn.hockeylive.app'
    
    async def upload_stream_chunk(self, chunk: StreamChunk) -> str:
        """Upload video chunk to S3"""
        key = f"streams/{chunk.game_id}/{chunk.camera_id}/{chunk.sequence}.mp4"
        
        await self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=key,
            Body=chunk.data,
            ContentType='video/mp4'
        )
        
        return f"s3://{self.bucket_name}/{key}"
    
    async def upload_compiled_video(self, video: CompiledVideo) -> str:
        """Upload final compiled video to S3 with CDN"""
        key = f"videos/{video.game_id}/compiled.mp4"
        
        await self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=key,
            Body=video.data,
            ContentType='video/mp4',
            CacheControl='max-age=86400'
        )
        
        return f"https://{self.cloudfront_domain}/{key}"
```

## Data Flow Architecture

### 1. Game Session Creation Flow

```mermaid
sequenceDiagram
    participant Coach as Coach/Organizer
    participant API as API Gateway
    participant GameService as Game Service
    participant DB as Database
    participant Parents as Parents
    
    Coach->>API: POST /games/create
    API->>GameService: create_game_session()
    GameService->>DB: Insert game session
    DB-->>GameService: Game ID + Join Code
    GameService-->>API: Game details
    API-->>Coach: Join code + QR code
    
    Coach->>Parents: Share join code
    Parents->>API: POST /games/join
    API->>GameService: join_game_session()
    GameService->>DB: Insert participant
    GameService-->>API: Position assignment
    API-->>Parents: Camera position + setup
```

### 2. Video Streaming Flow

```mermaid
sequenceDiagram
    participant Mobile as Mobile App
    participant API as API Gateway
    participant StreamService as Stream Service
    participant Storage as S3 Storage
    participant VideoService as Video Service
    
    Mobile->>API: POST /stream/upload (chunk)
    API->>StreamService: process_stream_chunk()
    StreamService->>Storage: Store chunk
    Storage-->>StreamService: Chunk stored
    
    StreamService->>VideoService: Check compilation readiness
    VideoService-->>StreamService: Ready for compilation
    StreamService->>VideoService: Start compilation job
    VideoService-->>API: Compilation started
    API-->>Mobile: Chunk received + status
```

### 3. Video Compilation Flow

```mermaid
sequenceDiagram
    participant VideoService as Video Service
    participant Storage as S3 Storage
    participant Processor as Video Processor
    participant CDN as CloudFront CDN
    participant Parents as Parents
    
    VideoService->>Storage: Retrieve all stream chunks
    Storage-->>VideoService: Stream data
    VideoService->>Processor: Compile video
    Processor->>Processor: Synchronize streams
    Processor->>Processor: Apply quality enhancement
    Processor->>Processor: Intelligent switching
    Processor-->>VideoService: Compiled video
    VideoService->>CDN: Upload final video
    CDN-->>VideoService: CDN URL
    VideoService->>Parents: Send download notification
```

## Security Architecture

### 1. Authentication & Authorization

```python
# JWT Token Management
class AuthenticationService:
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET_KEY')
        self.algorithm = 'HS256'
        self.access_token_expire = timedelta(hours=24)
    
    def create_access_token(self, user_id: str, user_type: str) -> str:
        payload = {
            'user_id': user_id,
            'user_type': user_type,
            'exp': datetime.utcnow() + self.access_token_expire,
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(401, "Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(401, "Invalid token")
```

### 2. Data Protection

```python
# Data Encryption Service
class DataProtectionService:
    def __init__(self):
        self.encryption_key = os.getenv('ENCRYPTION_KEY')
        self.cipher_suite = Fernet(self.encryption_key)
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """Encrypt sensitive data like phone numbers"""
        return self.cipher_suite.encrypt(data.encode()).decode()
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        return self.cipher_suite.decrypt(encrypted_data.encode()).decode()
```

## Performance and Scalability

### 1. Horizontal Scaling

```yaml
# Kubernetes Deployment Example
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hockey-live-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hockey-live-api
  template:
    metadata:
      labels:
        app: hockey-live-api
    spec:
      containers:
      - name: api
        image: hockey-live/api:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

### 2. Caching Strategy

```python
# Redis Caching Service
class CacheService:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST'),
            port=6379,
            decode_responses=True
        )
    
    async def cache_game_session(self, session: GameSession):
        """Cache active game session for quick access"""
        await self.redis_client.setex(
            f"game_session:{session.id}",
            3600,  # 1 hour expiration
            session.json()
        )
    
    async def get_cached_session(self, game_id: str) -> Optional[GameSession]:
        """Retrieve cached game session"""
        cached_data = await self.redis_client.get(f"game_session:{game_id}")
        if cached_data:
            return GameSession.parse_raw(cached_data)
        return None
```

## Monitoring and Observability

### 1. Logging Strategy

```python
# Structured Logging
import structlog

logger = structlog.get_logger()

class GameEventLogger:
    def log_game_created(self, game_id: str, organizer_id: str):
        logger.info(
            "game_created",
            game_id=game_id,
            organizer_id=organizer_id,
            event_type="game_lifecycle"
        )
    
    def log_video_compilation_started(self, game_id: str, camera_count: int):
        logger.info(
            "video_compilation_started",
            game_id=game_id,
            camera_count=camera_count,
            event_type="video_processing"
        )
```

### 2. Metrics Collection

```python
# Prometheus Metrics
from prometheus_client import Counter, Histogram, Gauge

# Define metrics
games_created = Counter('games_created_total', 'Total games created')
video_processing_duration = Histogram('video_processing_seconds', 'Video processing duration')
active_streams = Gauge('active_streams_current', 'Currently active video streams')

# Usage in services
def create_game_session(self, game_info: GameInfo):
    games_created.inc()
    # ... game creation logic
```

## Deployment Architecture

### 1. Infrastructure as Code

```terraform
# AWS Infrastructure
resource "aws_ecs_cluster" "hockey_live" {
  name = "hockey-live-cluster"
}

resource "aws_ecs_service" "api" {
  name            = "hockey-live-api"
  cluster         = aws_ecs_cluster.hockey_live.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 3
  
  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 8000
  }
}

resource "aws_rds_cluster" "postgres" {
  cluster_identifier = "hockey-live-db"
  engine             = "aurora-postgresql"
  engine_version     = "13.7"
  database_name      = "hockey_live"
  master_username    = "admin"
  master_password    = var.db_password
  
  backup_retention_period = 7
  preferred_backup_window = "07:00-09:00"
}
```

This architecture provides a scalable, reliable foundation for the Hockey Live App that can handle real-time video streaming, processing, and delivery while maintaining high performance and security standards.