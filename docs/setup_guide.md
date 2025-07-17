# Development Setup Guide - Hockey Live App

## Overview

This guide will help you set up the Hockey Live App development environment on your local machine. The setup includes the backend API, mobile app, database, and all necessary dependencies.

## Prerequisites

### Required Software
- **Python 3.11+** - Backend API development
- **Node.js 18+** - Mobile app development
- **Docker & Docker Compose** - Database and services
- **Git** - Version control
- **VS Code** (recommended) - IDE with extensions

### Operating System Support
- **macOS 10.15+** (recommended for iOS development)
- **Windows 10/11** with WSL2
- **Linux** (Ubuntu 20.04+ or equivalent)

## System Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hockey-live-app.git
cd hockey-live-app
```

### 2. Install Python Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Install Node.js Dependencies

```bash
# Navigate to mobile app directory
cd mobile/ios

# Install dependencies
npm install

# Install React Native CLI globally
npm install -g react-native-cli

# For iOS development (macOS only)
cd ios && pod install && cd ..
```

### 4. Docker Setup

```bash
# Start database and services
docker-compose up -d postgres redis

# Verify services are running
docker-compose ps
```

## Backend API Setup

### 1. Environment Configuration

Create `.env` file in the root directory:

```bash
# Database
DATABASE_URL=postgresql://admin:password@localhost:5432/hockey_live_dev
TEST_DATABASE_URL=postgresql://admin:password@localhost:5432/hockey_live_test

# Redis
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_HOURS=24

# AWS Configuration (for development)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=hockey-live-dev-videos

# Email Configuration (optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Application Settings
ENV=development
DEBUG=True
LOG_LEVEL=DEBUG
CORS_ORIGINS=http://localhost:3000,http://localhost:8081

# Video Processing
MAX_VIDEO_SIZE_MB=500
SUPPORTED_VIDEO_FORMATS=mp4,mov,avi
VIDEO_PROCESSING_TIMEOUT=300
```

### 2. Database Setup

```bash
# Create database tables
python -c "from app.database import create_tables; create_tables()"

# Or using Alembic for migrations
alembic upgrade head

# Create sample data (optional)
python scripts/create_sample_data.py
```

### 3. Run the Backend API

```bash
# Development server with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using the custom run script
python run_dev.py
```

**API will be available at:** `http://localhost:8000`
**API Documentation:** `http://localhost:8000/docs`

## Mobile App Setup

### 1. Environment Configuration

Create `mobile/ios/.env` file:

```bash
# API Configuration
API_BASE_URL=http://localhost:8000/api/v1
WS_BASE_URL=ws://localhost:8000/ws

# App Configuration
APP_NAME=Hockey Live Dev
APP_VERSION=1.0.0-dev
ENVIRONMENT=development

# Debug Settings
DEBUG_MODE=true
LOG_LEVEL=debug

# Camera Settings
DEFAULT_CAMERA_RESOLUTION=1080p
DEFAULT_FRAME_RATE=60
```

### 2. iOS Development Setup (macOS only)

```bash
# Install Xcode from App Store
# Install Xcode Command Line Tools
xcode-select --install

# Install CocoaPods
sudo gem install cocoapods

# Navigate to iOS directory and install pods
cd mobile/ios/ios
pod install

# Open the workspace (not the project file)
open HockeyLiveApp.xcworkspace
```

### 3. Android Development Setup

```bash
# Install Android Studio
# Download from: https://developer.android.com/studio

# Set up Android SDK
# Add to ~/.bashrc or ~/.zshrc:
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Create Android Virtual Device (AVD)
# Open Android Studio -> AVD Manager -> Create Virtual Device
```

### 4. Run the Mobile App

```bash
# Navigate to mobile app directory
cd mobile/ios

# Start Metro bundler
npm start

# Run on iOS (macOS only)
npm run ios
# Or specific simulator:
npx react-native run-ios --simulator="iPhone 15 Pro"

# Run on Android
npm run android
# Or specific emulator:
npx react-native run-android
```

## Database Management

### 1. Database Schema Management

```bash
# Create a new migration
alembic revision --autogenerate -m "Add game sessions table"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Check migration status
alembic current
```

### 2. Sample Data Creation

**scripts/create_sample_data.py**
```python
import asyncio
from app.database import get_db
from app.models import User, GameSession, ArenaConfiguration

async def create_sample_data():
    db = next(get_db())
    
    # Create sample users
    sample_users = [
        User(
            email="coach@example.com",
            name="Coach Johnson",
            user_type="coach",
            hashed_password="$2b$12$sample_hashed_password"
        ),
        User(
            email="parent1@example.com",
            name="Sarah Johnson",
            user_type="parent",
            hashed_password="$2b$12$sample_hashed_password"
        )
    ]
    
    for user in sample_users:
        db.add(user)
    
    # Create sample arena configurations
    standard_arena = ArenaConfiguration(
        arena_type="standard",
        name="Standard North American",
        dimensions={"length": 200, "width": 85},
        optimal_positions={
            "goal_line_1": {"x": 11, "y": 42.5, "priority": 1},
            "goal_line_2": {"x": 189, "y": 42.5, "priority": 1}
        }
    )
    
    db.add(standard_arena)
    db.commit()
    
    print("Sample data created successfully!")

if __name__ == "__main__":
    asyncio.run(create_sample_data())
```

### 3. Database Utilities

```bash
# Reset database (careful!)
python scripts/reset_database.py

# Backup database
pg_dump hockey_live_dev > backup.sql

# Restore database
psql hockey_live_dev < backup.sql
```

## Development Tools

### 1. VS Code Setup

**Recommended Extensions:**
```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.flake8",
    "ms-python.black-formatter",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "ms-python.pylint",
    "ms-toolsai.jupyter"
  ]
}
```

**VS Code Settings (.vscode/settings.json):**
```json
{
  "python.defaultInterpreterPath": "./venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": false,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "python.formatting.blackArgs": ["--line-length", "88"],
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "files.exclude": {
    "**/__pycache__": true,
    "**/.pytest_cache": true,
    "**/node_modules": true
  }
}
```

### 2. Git Configuration

```bash
# Set up Git hooks
cp scripts/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Configure Git
git config --local user.name "Your Name"
git config --local user.email "your-email@example.com"
```

**Pre-commit Hook (scripts/pre-commit):**
```bash
#!/bin/bash
# Run tests and linting before commit

echo "Running pre-commit checks..."

# Run Python tests
python -m pytest tests/ -v
if [ $? -ne 0 ]; then
    echo "Python tests failed. Commit aborted."
    exit 1
fi

# Run Python linting
flake8 app/
if [ $? -ne 0 ]; then
    echo "Python linting failed. Commit aborted."
    exit 1
fi

# Run JavaScript/TypeScript linting
cd mobile/ios && npm run lint
if [ $? -ne 0 ]; then
    echo "JavaScript linting failed. Commit aborted."
    exit 1
fi

echo "All pre-commit checks passed!"
```

## Testing Setup

### 1. Backend Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio pytest-cov httpx

# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_game_service.py

# Run specific test
pytest tests/test_game_service.py::test_create_game_session
```

**Test Configuration (pytest.ini):**
```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    -v
    --tb=short
    --strict-markers
    --disable-warnings
    --cov=app
    --cov-report=term-missing
    --cov-report=html
    --cov-fail-under=80
```

### 2. Mobile App Testing

```bash
# Install test dependencies
cd mobile/ios
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Development Workflow

### 1. Daily Development Routine

```bash
# 1. Start development environment
docker-compose up -d postgres redis

# 2. Activate Python virtual environment
source venv/bin/activate

# 3. Start backend API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 4. Start mobile app (in new terminal)
cd mobile/ios && npm start

# 5. Run mobile app on device/simulator
npm run ios  # or npm run android
```

### 2. Creating New Features

```bash
# 1. Create feature branch
git checkout -b feature/new-feature-name

# 2. Create database migration (if needed)
alembic revision --autogenerate -m "Add new feature tables"

# 3. Write tests first (TDD approach)
# Edit tests/test_new_feature.py

# 4. Implement feature
# Edit app/services/new_feature_service.py

# 5. Run tests
pytest tests/test_new_feature.py

# 6. Commit changes
git add .
git commit -m "Add new feature: description"

# 7. Push and create PR
git push origin feature/new-feature-name
```

### 3. Code Quality Checks

```bash
# Format Python code
black app/ tests/

# Sort imports
isort app/ tests/

# Run linting
flake8 app/ tests/

# Type checking
mypy app/

# Security scanning
bandit -r app/

# Format mobile app code
cd mobile/ios && npm run format

# Lint mobile app
cd mobile/ios && npm run lint
```

## Debugging

### 1. Backend Debugging

```python
# Add to your code for debugging
import pdb; pdb.set_trace()

# Or use VS Code debugger
# Add breakpoints in VS Code and run with F5
```

**Launch Configuration (.vscode/launch.json):**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/venv/bin/uvicorn",
      "args": ["app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
      "console": "integratedTerminal",
      "envFile": "${workspaceFolder}/.env"
    }
  ]
}
```

### 2. Mobile App Debugging

```bash
# Enable debug mode
# In mobile/ios/.env
DEBUG_MODE=true

# Open React Native debugger
# Install: npm install -g react-native-debugger

# Enable Chrome DevTools
# Shake device/simulator and select "Debug JS Remotely"
```

### 3. Database Debugging

```bash
# Connect to database
psql hockey_live_dev

# View logs
docker-compose logs postgres

# Reset database
python scripts/reset_database.py
```

## Common Issues and Solutions

### 1. Backend Issues

**Issue: Database connection error**
```bash
# Solution: Check if PostgreSQL is running
docker-compose ps
docker-compose up -d postgres

# Check connection
psql -h localhost -U admin -d hockey_live_dev
```

**Issue: Module not found error**
```bash
# Solution: Make sure you're in the virtual environment
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### 2. Mobile App Issues

**Issue: Metro bundler not starting**
```bash
# Solution: Clear cache and restart
cd mobile/ios
npm start -- --reset-cache
```

**Issue: iOS build failed**
```bash
# Solution: Clean build and reinstall pods
cd mobile/ios/ios
rm -rf ~/Library/Developer/Xcode/DerivedData
pod install
```

**Issue: Android build failed**
```bash
# Solution: Clean Gradle cache
cd mobile/ios/android
./gradlew clean
```

### 3. Docker Issues

**Issue: Database won't start**
```bash
# Solution: Check Docker daemon and restart
docker-compose down
docker-compose up -d postgres redis
```

## Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `REDIS_URL` | Redis connection string | Yes | - |
| `JWT_SECRET_KEY` | Secret key for JWT tokens | Yes | - |
| `AWS_ACCESS_KEY_ID` | AWS access key | Yes | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Yes | - |
| `DEBUG` | Enable debug mode | No | False |
| `LOG_LEVEL` | Logging level | No | INFO |

### Mobile App Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `API_BASE_URL` | Backend API URL | Yes | - |
| `WS_BASE_URL` | WebSocket URL | Yes | - |
| `DEBUG_MODE` | Enable debug mode | No | false |
| `LOG_LEVEL` | Logging level | No | info |

## Next Steps

After completing the setup:

1. **Explore the codebase** - Read through the architecture documentation
2. **Run the test suite** - Ensure everything is working correctly
3. **Try the API** - Use the interactive docs at `http://localhost:8000/docs`
4. **Test the mobile app** - Join a game session and test camera functionality
5. **Read the contributing guide** - Learn about code standards and workflow

## Getting Help

- **Documentation**: Check the `/docs` directory for detailed guides
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Code Review**: Submit PRs for review by the team

This setup guide should get you up and running with the Hockey Live App development environment. Happy coding! <Ò