# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hockey Live App (MLAApp) is an AI-powered multi-camera hockey game streaming platform that transforms parent smartphone recordings into professional-quality game videos. The app targets U16-U18 hockey leagues, allowing parents to use their phones as cameras to create professional game coverage with future AI commentary.

**Technology Stack:**
- **Mobile**: React Native (iOS/Android cross-platform)
- **Backend**: Python FastAPI with PostgreSQL
- **Infrastructure**: AWS (S3, ECS), Docker, Redis
- **Video Processing**: Real-time multi-camera stitching with quality assessment

## Project Structure

```
/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/v1/         # API endpoints
│   │   ├── core/           # Configuration, database, security
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── main.py         # FastAPI application entry point
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile         # Container configuration
├── hockey-live-mobile/     # Expo React Native app
├── mobile/ios/            # Alternative React Native setup
├── docs/                  # Comprehensive documentation
├── docker-compose.yml     # Development services
└── venv/                  # Python virtual environment
```

## Development Commands

### Backend Development

```bash
# Setup virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Start development server
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Database migrations
alembic upgrade head
alembic revision --autogenerate -m "description"

# Run tests
pytest
pytest --cov=app tests/
pytest tests/test_auth.py

# Code quality
black app/ tests/
flake8 app/ tests/
mypy app/
```

### Mobile App Development

**Hockey Live Mobile (Expo):**
```bash
cd hockey-live-mobile
npm install
npm start                    # Start Metro bundler
npm run android             # Run on Android
npm run ios                 # Run on iOS
npm run web                 # Run on web
```

**Alternative Mobile Setup:**
```bash
cd mobile/ios
npm install
npm start
npm run ios
npm run android
npm test
npm run lint
npm run format
```

### Infrastructure

```bash
# Start local services
docker-compose up -d postgres redis

# View all services
docker-compose ps

# View logs
docker-compose logs postgres
docker-compose logs redis

# Full development stack
docker-compose up -d
```

## Key Development Endpoints

- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health
- **Database Admin**: http://localhost:5050 (PgAdmin)
- **Task Monitor**: http://localhost:5555 (Flower)

## Architecture Overview

### Mobile App Architecture

The React Native app follows a component-based architecture:

**Hockey Live Mobile (Expo):**
- `src/screens/` - Main UI screens (auth, teams, home, profile)
- `src/components/` - Reusable UI components
- `src/navigation/` - Navigation setup and routing
- `src/services/` - API communication (api.js, gameSync.js)
- `src/context/` - React Context providers (AuthContext, TeamContext)
- `src/config/` - Configuration files (API endpoints, arena positioning)

**Alternative Mobile Setup:**
- `src/Screens/` - Organized by feature (auth, main, data)
- `src/components/` - Categorized components (basic, cards, forms, lists, navigation)
- `src/services/` - Business logic (api.js, authServices.js, gameSync.js)
- `src/config/` - JSON configuration files and constants
- `src/utils/` - Utility functions and helpers

### Backend Architecture

FastAPI backend with layered architecture:
- **API Layer** (`app/api/v1/`): REST endpoints for auth, games, teams, streaming
- **Core Layer** (`app/core/`): Configuration, database, security, exceptions
- **Models Layer** (`app/models/`): SQLAlchemy database models
- **Schema Layer** (`app/schemas/`): Pydantic validation schemas
- **Service Layer** (`app/services/`): Business logic (future implementation)

### Database Design

PostgreSQL with SQLAlchemy ORM:
- User authentication and profiles
- Team management and memberships
- Game sessions and coordination
- Video processing and storage metadata

## Core Game Flow

1. **Game Creation**: Coach/organizer creates session, generates 6-digit join code
2. **Parent Joining**: Parents scan QR code or enter game code, select team context
3. **Position Assignment**: Flexible camera positioning with quality-based priorities
4. **Recording**: Synchronized multi-camera recording with real-time streaming
5. **Processing**: Cloud-based video stitching and quality enhancement

## Configuration Files

### Arena Positioning System
- `hockey-live-mobile/src/config/arena_positioning.js`
- `mobile/ios/src/config/arena_positioning.js`

Contains NHL research-informed camera position priorities:
- Center Ice Elevated: Priority 1 (1.0 weight)
- Corner Diagonal: Priority 2 (0.85 weight)
- Bench Side: Priority 3 (0.75 weight)
- Goal Line: Priority 4 (0.65 weight)

### API Configuration
- `hockey-live-mobile/src/config/api_endpoints.js`
- `mobile/ios/src/config/api_endpoints.json`

Defines all backend endpoints for games, streaming, user management, and arena configuration.

## Testing Strategy

### Backend Testing
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test
pytest tests/test_auth.py::test_user_login

# Generate HTML coverage report
pytest --cov=app --cov-report=html tests/
```

### Mobile Testing
```bash
# Run tests (mobile/ios)
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- --testNamePattern="Auth"
```

## Development Environment

### Required Services
- **PostgreSQL**: Primary database (port 5432)
- **Redis**: Caching and session storage (port 6379)
- **FastAPI**: Backend API server (port 8000)
- **React Native Metro**: Mobile development server (port 8081)

### Environment Variables
Key environment variables for development:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET_KEY`: JWT token signing key
- `AWS_ACCESS_KEY_ID`: AWS credentials (for video storage)
- `DEBUG`: Enable debug mode

## Phase Development

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

### Real-time Processing
Target <200ms processing latency per frame pair for smooth 30fps output using cloud-based multi-GPU processing following NHL's AWS-based approach.

### Game Synchronization
`gameSync.js` handles real-time coordination between multiple parent cameras including synchronized recording start/stop.

## 🚀 V1.0 Working Features (RELEASED)

### ✅ Complete User Authentication System
- JWT-based secure authentication with token refresh
- User registration, login, and logout endpoints
- Password reset and email verification
- Role-based access control (parent, coach, admin, viewer)
- Session management with automatic token cleanup

### ✅ Full Team Management
- Create hockey teams with comprehensive information
- Generate and share 6-digit team codes
- Join teams using team codes
- Manage team rosters and player information
- Support for hockey leagues and age groups (U8-U18)
- Team branding with custom colors

### ✅ Production-Ready Mobile App
- Cross-platform React Native app (iOS/Android)
- Expo-based development for rapid deployment
- Beautiful, hockey-themed user interface
- Real-time API communication with error handling
- Offline capability for basic team information
- Session persistence and automatic login

### ✅ Database Architecture
- SQLite for local development (Windows-friendly)
- PostgreSQL for production with connection pooling
- Proper UUID foreign key relationships
- Comprehensive data validation and constraints
- Automatic table creation and schema management

### ✅ API Infrastructure
- FastAPI backend with interactive documentation
- Health monitoring and error handling
- CORS configuration for mobile app integration
- Comprehensive request/response validation
- Rate limiting and security features

### ✅ Developer Experience
- 5-minute setup process for new developers
- Comprehensive documentation with examples
- Troubleshooting guide for common issues
- Database schema documentation
- Testing framework with good coverage

## 🔧 Fixed Issues in V1.0

### Database Issues Resolved
- Fixed UUID/Integer foreign key mismatches between User and Team models
- Resolved SQLite schema compatibility issues
- Fixed database relationship configuration errors
- Proper foreign key constraints and back_populates

### API Issues Resolved
- Fixed 307 redirect errors on POST requests (`redirect_slashes=False`)
- Resolved CORS configuration for mobile app origins
- Fixed team creation timeout issues
- Proper HTTP status codes for all endpoints

### Mobile App Issues Resolved
- Fixed authentication flow with proper token management
- Resolved navigation issues between screens
- Fixed API communication with proper error handling
- Improved user experience with loading states

The codebase is now in a production-ready state with V1.0 features fully implemented and tested. The system is designed to be scalable and maintainable for future AI enhancement phases.