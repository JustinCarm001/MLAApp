# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hockey Live App (MLAApp) is an AI-powered multi-camera hockey game streaming platform that transforms parent smartphone recordings into professional-quality game videos. The app targets U16-U18 hockey leagues, allowing parents to use their phones as cameras to create professional game coverage with future AI commentary.

**Technology Stack:**
- **Mobile**: React Native (iOS/Android cross-platform)
- **Backend**: Python FastAPI with PostgreSQL
- **Infrastructure**: AWS (S3, ECS), Docker, Redis
- **Video Processing**: Real-time multi-camera stitching with quality assessment

## Architecture

### Mobile App Structure (`/mobile/ios/src/`)
The React Native app follows a component-based architecture:
- `Screens/` - Main UI screens (auth, main app, data management)
- `components/` - Reusable UI components organized by type (basic, cards, forms, lists, navigation)
- `services/` - API communication and business logic (api.js, gameSync.js, authServices.js)
- `config/` - Configuration files including arena positioning and API endpoints
- `context/` - React Context providers for global state
- `navigation/` - Navigation setup and routing

### Backend Architecture (FastAPI)
- Real-time video processing pipeline with multi-GPU support
- Quality-based camera weighting system to minimize poor camera usage
- Arena positioning system with NHL broadcast research-informed priorities
- WebSocket-based game synchronization service

### Core Game Flow
1. **Game Creation**: Coach/organizer creates session, generates 6-digit join code
2. **Parent Joining**: Parents scan QR code or enter game code, select team context
3. **Position Assignment**: Flexible camera positioning with quality-based priorities
4. **Recording**: Synchronized multi-camera recording with real-time streaming
5. **Processing**: Cloud-based video stitching and quality enhancement

## Common Development Commands

### Backend Development
```bash
# Setup virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Database migrations
alembic upgrade head
alembic revision --autogenerate -m "description"

# Run tests
pytest
pytest --cov=app tests/

# Code quality
black app/ tests/
flake8 app/ tests/
```

### Mobile App Development
```bash
# Navigate to mobile app
cd mobile/ios

# Install dependencies (when package.json is implemented)
npm install

# Start Metro bundler
npm start

# Run on specific platforms
npm run ios
npm run android
npx react-native run-ios --simulator="iPhone 15 Pro"

# Development workflow
npm test
npm run lint
```

### Infrastructure
```bash
# Start local services
docker-compose up -d postgres redis

# View service status
docker-compose ps

# View logs
docker-compose logs postgres
```

## Key Configuration Files

### Arena Positioning System (`mobile/ios/src/config/arena_positioning.js`)
Contains NHL research-informed camera position priorities:
- Center Ice Elevated: Priority 1 (1.0 weight)
- Corner Diagonal: Priority 2 (0.85 weight)
- Bench Side: Priority 3 (0.75 weight)
- Goal Line: Priority 4 (0.65 weight)

### API Configuration (`mobile/ios/src/config/api_endpoints.json`)
Defines all backend endpoints for games, streaming, user management, and arena configuration.

### Game Synchronization (`mobile/ios/src/services/gameSync.js`)
Handles real-time coordination between multiple parent cameras including synchronized recording start/stop.

## Development Phases

**Phase 1 (Current)**: Multi-camera coordination with automated positioning
- Flexible camera assignment based on NHL broadcast standards
- Quality assessment system for intelligent camera weighting
- Parent-friendly UX with team management

**Phase 2**: AI enhancement with Meta SAM 2 integration for player tracking
**Phase 3**: Automated AI commentary generation
**Phase 4**: Complete AI broadcasting with analytics

## Important Notes

### Camera Quality System
The system uses multi-dimensional quality assessment (technical, positional, stability, content) to weight camera contributions. Poor quality cameras receive minimal screen time while high-quality cameras get priority in the final edit.

### Arena Positioning Logic
The flexible positioning system allows parents to choose from predetermined optimal positions rather than fixed assignments. Priorities are based on NHL broadcast research with Veo 3 camera positioning compliance.

### Real-time Processing
Target <200ms processing latency per frame pair for smooth 30fps output using cloud-based multi-GPU processing following NHL's AWS-based approach.

## Documentation Structure

Comprehensive documentation in `/docs/`:

### Core Documentation
- `api_documentation.md` - Complete API reference with endpoints, schemas, and examples
- `architecture_overview.md` - System architecture, components, and data flow
- `setup_guide.md` - Detailed development environment setup
- `deployment_guide.md` - Production deployment with AWS, Docker, CI/CD
- `backend_architecture.md` - Backend services, database schema, and API design
- `backend_development_guide.md` - Backend development patterns and best practices

### Phase 1 Implementation
- `phase1/arena_positioning_system.md` - NHL-research informed camera positioning system
- `phase1/parent_user_flow.md` - Complete parent user experience with team management

### Research Documentation
- `research/camera_quality_assessment.md` - Multi-dimensional quality scoring system
- `research/video_processing_pipeline.md` - Video compilation and enhancement pipeline
- `research/arena_configurations.md` - Arena types and optimal positioning
- `research/real_time_video_processing.md` - Real-time processing architecture
- `research/sam2_integration.md` - Meta SAM 2 integration plans

### Future Development
- `future_phases/ai_integration_roadmap.md` - AI enhancement roadmap and implementation

## Testing Strategy

- Backend: pytest with coverage requirements (80%+ coverage target)
- Mobile: Jest with React Native testing library
- Integration: End-to-end game session testing
- Performance: Video processing latency benchmarks

The codebase is currently in the documentation and architecture phase, with mobile app component structure implemented but business logic pending. Backend API implementation is the next major milestone.