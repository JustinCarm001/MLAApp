# Development Setup Guide - Hockey Live App

## Overview

This guide will help you set up the Hockey Live App development environment on your local machine. The setup includes the backend API, mobile app, database, and all necessary dependencies.

## Prerequisites

### Required Software
- **Python 3.11+** - Backend API development
- **Node.js 18+** - Mobile app development
- **Git** - Version control
- **VS Code** (recommended) - IDE with extensions

### Operating System Support
- **macOS 10.15+** (recommended for iOS development)
- **Windows 10/11** (tested and working)
- **Linux** (Ubuntu 20.04+ or equivalent)

## Quick Start (Recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hockey-live-app.git
cd hockey-live-app
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies (SQLite - works on all platforms)
pip install -r backend/requirements-local.txt

# Navigate to backend directory
cd backend

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will be available at:** `http://localhost:8000`  
**API Documentation:** `http://localhost:8000/docs`

### 3. Mobile App Setup (Expo - Recommended)

```bash
# Navigate to mobile app directory
cd hockey-live-mobile

# Install dependencies
npm install

# Install Expo CLI globally
npm install -g @expo/cli

# Start mobile app
npm start
```

**Mobile app options:**
- **Web**: http://localhost:8081
- **iOS**: Scan QR code with Camera app
- **Android**: Scan QR code with Expo Go app

## Database Configuration

### Local Development (SQLite)
- **Database file**: `backend/hockey_live.db`
- **Created automatically** when backend starts
- **No additional setup required**

### Production (PostgreSQL)
```bash
# Start database services
docker-compose up -d postgres redis

# Update backend/requirements.txt instead of requirements-local.txt
pip install -r backend/requirements.txt
```

## What's Working in V1.0

### ✅ Backend Features
- FastAPI server with SQLite database
- User authentication (JWT tokens)
- Team creation and management
- User profile management
- API documentation at `/docs`
- CORS configuration for mobile app

### ✅ Mobile App Features
- User login/logout
- Team creation with detailed forms
- Session management
- Real-time API communication
- Beautiful UI with proper navigation

### ✅ Database Models
- User model with authentication
- Team model with hockey-specific fields
- TeamMembership for user-team relationships
- Proper foreign key constraints

## Development Commands

### Backend Development
```bash
# Start backend (from backend/ directory)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest

# Run tests with coverage
pytest --cov=app tests/

# Code formatting
black app/ tests/
flake8 app/ tests/
```

### Mobile App Development
```bash
# Start Expo development server
npm start

# Run on specific platform
npm run android    # Android
npm run ios        # iOS
npm run web        # Web browser

# Run tests
npm test

# Format code
npm run format
```

## Troubleshooting

### Backend Issues

**Database connection errors:**
```bash
# Delete old database file and restart
rm backend/hockey_live.db
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Module not found errors:**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Reinstall dependencies
pip install -r backend/requirements-local.txt
```

**Port already in use:**
```bash
# Use different port
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Mobile App Issues

**Metro bundler not starting:**
```bash
# Clear cache and restart
npm start -- --reset-cache
```

**Connection to backend fails:**
- Check that backend is running on `http://localhost:8000`
- Verify your IP address matches in mobile app logs
- Try restarting both backend and mobile app

## API Endpoints (V1.0)

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/register` - User registration

### User Management
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update user profile

### Team Management
- `POST /api/v1/teams` - Create new team
- `GET /api/v1/teams/my-teams` - Get user's teams
- `POST /api/v1/teams/join` - Join team with code

## Environment Variables

### Backend (Optional)
Most settings have defaults in `app/core/config.py`. For production, set:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET_KEY` - JWT token secret
- `DEBUG` - Enable debug mode

### Mobile App (Optional)
Default API URL is configured automatically. For custom configuration:
- `API_BASE_URL` - Backend API URL
- `DEBUG_MODE` - Enable debug logging

## Next Steps

1. **Explore the API**: Visit `http://localhost:8000/docs`
2. **Test mobile app**: Login with test credentials
3. **Create a team**: Use the team creation form
4. **Join a team**: Use the 6-digit team code
5. **Read the documentation**: Check `/docs` folder for detailed guides

## Getting Help

- **Documentation**: `/docs` directory contains detailed guides
- **Issues**: Create GitHub issues for bugs or questions
- **API Reference**: Interactive docs at `http://localhost:8000/docs`
- **Troubleshooting**: See troubleshooting section above

This setup guide focuses on the working V1.0 features and provides a streamlined development experience.