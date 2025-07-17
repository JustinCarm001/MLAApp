# Hockey Live App - Setup Guide

This guide will help you start the Hockey Live App project from scratch. Follow these steps in order to get both the backend and mobile app running.

## Project Overview

**Hockey Live** is a multi-camera hockey game recording platform where parents use their phones as cameras to create professional game coverage. The system consists of:

- **FastAPI Backend** - Handles API endpoints, data storage, and game coordination
- **React Native Mobile App (Expo)** - Parent-facing camera app for recording games
- **Future Web Frontend** - For viewing and downloading game footage

## Prerequisites

Before starting, make sure you have:

- **Python 3.12+** installed with virtual environment support
- **Node.js and npm** installed
- **Expo Go app** installed on your phone (iOS/Android)
- **Git** (if cloning from repository)

## Project Structure

```
C:\Users\justin\MLAApp\
├── backend/                    # FastAPI backend server
│   ├── app/                   # Main application code
│   ├── requirements.txt       # Python dependencies
│   └── requirements-local.txt # Local development dependencies
├── hockey-live-mobile/        # Expo mobile app
│   ├── App.js                # Main mobile app file
│   ├── package.json          # Node.js dependencies
│   └── assets/               # App icons and images
├── venv/                     # Python virtual environment
└── docs/                     # Project documentation
```

## Step 1: Start the Backend Server

### 1.1 Navigate to Project Directory
```bash
cd C:\Users\justin\MLAApp
```

### 1.2 Activate Virtual Environment
```bash
# Windows Command Prompt
venv\Scripts\activate

# If using PowerShell
venv\Scripts\Activate.ps1
```

### 1.3 Navigate to Backend
```bash
cd backend
```

### 1.4 Start FastAPI Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Will watch for changes in these directories: ['C:\\Users\\justin\\MLAApp\\backend']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [XXXX] using WatchFiles
INFO:     Started server process [XXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 1.5 Verify Backend is Running
Open your browser and go to:
- **Health Check:** http://localhost:8000/health
- **API Documentation:** http://localhost:8000/docs

You should see a JSON response for health check and interactive API docs.

## Step 2: Find Your Computer's IP Address

The mobile app needs to connect to your computer's IP address, not localhost.

### 2.1 Get Your IP Address
```bash
ipconfig
```

Look for **"Wireless LAN adapter Wi-Fi"** and find the **IPv4 Address**. 

**Example Output:**
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 10.0.0.18
```

In this case, your IP is `10.0.0.18`.

### 2.2 Update Mobile App Configuration
1. Open `C:\Users\justin\MLAApp\hockey-live-mobile\App.js`
2. Find this line (around line 22):
   ```javascript
   const API_BASE_URL = 'http://10.0.0.18:8000';
   ```
3. Replace `10.0.0.18` with your actual IP address from step 2.1

## Step 3: Start the Mobile App

### 3.1 Open New Terminal Window
Keep the backend running and open a new terminal/command prompt window.

### 3.2 Navigate to Mobile App Directory
```bash
cd C:\Users\justin\MLAApp\hockey-live-mobile
```

### 3.3 Install Dependencies (if needed)
```bash
npm install
```

### 3.4 Start Expo Development Server
```bash
npx expo start
```

**Expected Output:**
```
› Metro waiting on exp://10.0.0.18:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press w │ open web
› Press r │ reload app
› Press m │ toggle menu
```

## Step 4: Connect Your Phone

### 4.1 Install Expo Go
- **iPhone:** Download "Expo Go" from App Store
- **Android:** Download "Expo Go" from Google Play Store

### 4.2 Scan QR Code
1. Open Expo Go on your phone
2. Scan the QR code shown in your terminal
3. The Hockey Live app should load on your phone

### 4.3 Verify Connection
When the app loads, you should see:
- **Green "✅ Connected" badge** at the top
- Hockey Live home screen with action buttons
- No network errors in the logs

## Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'uvicorn'`
**Solution:** Make sure your virtual environment is activated:
```bash
venv\Scripts\activate
```

**Problem:** Backend starts but mobile can't connect
**Solution:** 
1. Check Windows Firewall settings
2. Ensure both devices are on same WiFi network
3. Verify IP address in App.js matches your computer's IP

### Mobile App Issues

**Problem:** Metro dependency errors
**Solution:** Delete node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

**Problem:** "Network request failed" errors
**Solution:**
1. Verify backend is running on correct IP/port
2. Update API_BASE_URL in App.js with correct IP address
3. Check that both phone and computer are on same WiFi

### Network Issues

**Problem:** Phone can't reach computer
**Solution:**
1. Make sure both devices are on same WiFi network
2. Check if Windows Firewall is blocking port 8000
3. Try temporarily disabling firewall to test

## Development Workflow

### Daily Startup Process
1. Open terminal and activate virtual environment
2. Start backend server: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
3. Open second terminal for mobile app
4. Start Expo: `npx expo start`
5. Scan QR code with Expo Go app

### Making Changes
- **Backend changes:** Server auto-reloads when you save files
- **Mobile changes:** Expo hot-reloads automatically, or press 'r' to manually reload

### Stopping the Project
- **Backend:** Press `Ctrl+C` in backend terminal
- **Mobile:** Press `Ctrl+C` in Expo terminal
- **Phone:** Close Expo Go app

## Project Status

### ✅ Completed Features
- FastAPI backend with health endpoints
- Mobile app with professional UI
- Backend-mobile connectivity
- Home screen with navigation
- Camera recording interface (UI only)
- Basic game flow (start/pause/stop)

### 🚧 In Development
- Real camera functionality
- Game joining/coordination
- Video recording and storage
- User authentication
- Game history

### 📋 Next Steps
1. Add actual camera recording
2. Implement user registration/login
3. Build game coordination features
4. Add video processing pipeline
5. Create web frontend for viewing games

## Important Files

- **`backend/app/main.py`** - Main FastAPI application
- **`hockey-live-mobile/App.js`** - Main mobile app component
- **`backend/requirements-local.txt`** - Python dependencies
- **`hockey-live-mobile/package.json`** - Node.js dependencies

## API Endpoints

The backend provides these endpoints:
- `GET /health` - Health check
- `GET /api/v1/` - API information
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/teams` - Create teams
- `POST /api/v1/games` - Create games
- `GET /api/v1/arena/types` - Arena configurations

## Support

If you encounter issues:
1. Check this setup guide first
2. Verify all prerequisites are installed
3. Ensure network connectivity between devices
4. Check logs in both backend and mobile terminals

Remember to keep both the backend server and Expo development server running while developing!