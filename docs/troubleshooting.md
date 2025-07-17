# Troubleshooting Guide - Hockey Live App

## Overview

This guide covers common issues encountered during development and their solutions. The issues are organized by category and include step-by-step solutions based on real debugging sessions.

## Backend Issues

### Database Problems

#### Error: `psycopg2` installation fails on Windows

**Problem:** PostgreSQL client library won't install on Windows systems.

**Error Message:**
```
Microsoft Visual C++ 14.0 is required. Get it with "Microsoft C++ Build Tools"
```

**Solution:**
```bash
# Use SQLite for local development instead
pip install -r backend/requirements-local.txt

# This avoids PostgreSQL dependencies entirely
```

**Root Cause:** PostgreSQL dependencies require C++ build tools on Windows.

#### Error: Database relationship errors

**Problem:** UUID vs Integer foreign key mismatches.

**Error Message:**
```
sqlalchemy.exc.NoForeignKeysError: Could not determine join condition between parent/child tables on relationship User.created_teams
```

**Solution:**
This was fixed in V1.0 by updating the database models:
- Changed `Team.created_by` from `Integer` to `UUID`
- Changed `TeamMembership.user_id` from `Integer` to `UUID`
- Added proper `ForeignKey` constraints

**If you encounter this:** Update to V1.0 code or manually fix the models.

#### Error: `no such column: users.is_verified`

**Problem:** Old database schema doesn't match current models.

**Error Message:**
```
sqlite3.OperationalError: no such column: users.is_verified
```

**Solution:**
```bash
# Delete old database file
rm backend/hockey_live.db
# On Windows:
del backend\hockey_live.db

# Restart server to create new database
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Root Cause:** Database schema changes require recreation in SQLite.

### API Issues

#### Error: 307 Redirect on POST requests

**Problem:** Mobile app gets 307 Temporary Redirect on team creation.

**Error Message:**
```
POST /api/v1/teams HTTP/1.1" 307 Temporary Redirect
```

**Solution:**
Fixed in V1.0 by:
1. Adding `redirect_slashes=False` to FastAPI configuration
2. Adding duplicate route handlers for both `/teams` and `/teams/`

**Code Fix:**
```python
# In app/main.py
app = FastAPI(
    title=settings.PROJECT_NAME,
    redirect_slashes=False  # This line prevents redirects
)

# In app/api/v1/endpoints/teams.py
@router.post("/", status_code=201)
@router.post("", status_code=201)  # Handle both cases
async def create_team(...):
```

#### Error: CORS errors from mobile app

**Problem:** Mobile app can't connect to backend due to CORS.

**Error Message:**
```
Access to fetch at 'http://localhost:8000/api/v1/auth/login' from origin 'http://localhost:8081' has been blocked by CORS policy
```

**Solution:**
CORS is configured in V1.0 for common mobile app origins:
```python
# In app/core/config.py
CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8081"]
```

Check mobile app logs for actual IP address and add to CORS origins if needed.

## Mobile App Issues

### Connection Problems

#### Error: Backend connection fails

**Problem:** Mobile app can't connect to backend.

**Error Message:**
```
❌ API Error: Invalid response format from server
```

**Solution:**
1. Check backend is running: `http://localhost:8000/health`
2. Check IP address in mobile app logs
3. Restart both backend and mobile app
4. Verify network connectivity

**Debug Steps:**
```bash
# Check backend health
curl http://localhost:8000/health

# Check mobile app logs for actual IP
# Look for lines like:
# LOG  📡 Base URL: http://10.0.0.18:8000/api/v1
```

#### Error: Team creation timeout

**Problem:** Mobile app times out when creating teams.

**Error Message:**
```
❌ API Error: Request timeout - server is taking too long to respond
```

**Solution:**
Fixed in V1.0 by resolving the 307 redirect issue. If still occurring:
1. Check backend logs for errors
2. Verify network connection
3. Try creating team directly via API docs (`/docs`)

### Metro Bundler Issues

#### Error: Metro bundler won't start

**Problem:** React Native Metro bundler fails to start.

**Solution:**
```bash
# Clear Metro cache
cd hockey-live-mobile
npm start -- --reset-cache

# Or clear node_modules and reinstall
rm -rf node_modules
npm install
npm start
```

#### Error: Build fails after dependency changes

**Problem:** App won't build after installing new packages.

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# For iOS (if using react-native CLI)
cd ios && pod install && cd ..
```

## Development Environment Issues

### Python Virtual Environment

#### Error: Virtual environment activation fails

**Problem:** Cannot activate Python virtual environment.

**Solution:**
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# If venv doesn't exist, create it
python -m venv venv
```

#### Error: Module not found errors

**Problem:** Python can't find installed modules.

**Solution:**
1. Ensure virtual environment is activated
2. Check you're in the correct directory
3. Reinstall dependencies

```bash
# Verify virtual environment
which python  # Should show venv path

# Reinstall dependencies
pip install -r backend/requirements-local.txt
```

### Node.js Issues

#### Error: Node version compatibility

**Problem:** Node.js version too old for React Native.

**Solution:**
```bash
# Check Node version
node --version

# Should be 18+ for React Native
# Install nvm to manage Node versions
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### Error: npm install fails

**Problem:** npm dependencies won't install.

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete package-lock.json and node_modules
rm -rf node_modules package-lock.json

# Try with different registry
npm install --registry https://registry.npmjs.org/

# Or use yarn instead
yarn install
```

## Database Management

### SQLite Issues

#### Error: Database file locked

**Problem:** SQLite database file is locked by another process.

**Solution:**
```bash
# Stop backend server first
# Then delete database file
rm backend/hockey_live.db

# Restart server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Error: Database corruption

**Problem:** SQLite database file is corrupted.

**Solution:**
```bash
# Delete corrupted database
rm backend/hockey_live.db

# Server will create new database automatically
# You'll lose all data, but for development this is acceptable
```

### PostgreSQL Issues (Production)

#### Error: PostgreSQL connection refused

**Problem:** Can't connect to PostgreSQL database.

**Solution:**
```bash
# Check if PostgreSQL is running
docker-compose ps

# Start PostgreSQL
docker-compose up -d postgres

# Check logs
docker-compose logs postgres

# Verify connection
psql -h localhost -U admin -d hockey_live_dev
```

## Performance Issues

### Backend Performance

#### Problem: Slow API responses

**Solution:**
1. Check database queries in logs
2. Add indexes to frequently queried fields
3. Use database connection pooling
4. Enable response compression

#### Problem: High memory usage

**Solution:**
1. Monitor with `htop` or Task Manager
2. Check for memory leaks in background tasks
3. Implement proper database session management
4. Use connection pooling

### Mobile App Performance

#### Problem: App slow to load

**Solution:**
1. Enable Metro caching
2. Optimize image sizes
3. Use React Native performance profiler
4. Implement lazy loading for screens

## Network Issues

### Development Network

#### Problem: Mobile app can't reach backend

**Solution:**
1. Check firewall settings
2. Verify IP addresses in logs
3. Test with `curl` from mobile device
4. Use `--host 0.0.0.0` when starting backend

#### Problem: Different IP addresses

**Solution:**
Mobile app automatically detects network IP. If issues persist:
1. Check mobile app logs for detected IP
2. Manually set API base URL if needed
3. Ensure backend binds to `0.0.0.0` not `127.0.0.1`

## Security Issues

### Authentication Problems

#### Error: JWT token invalid

**Problem:** Authentication fails with valid credentials.

**Solution:**
1. Check token expiration
2. Verify JWT secret key configuration
3. Clear mobile app token storage
4. Check for clock synchronization issues

#### Error: Password hashing fails

**Problem:** User registration or login fails.

**Solution:**
1. Check bcrypt installation
2. Verify password complexity requirements
3. Check for encoding issues with special characters

## Debugging Tips

### Backend Debugging

1. **Enable debug logging:**
```python
# In app/core/config.py
DEBUG = True
LOG_LEVEL = "DEBUG"
```

2. **Use print statements:**
```python
print(f"Debug: {variable_name}")
```

3. **Check database queries:**
```python
# In app/core/database.py
engine = create_engine(settings.DATABASE_URL, echo=True)
```

### Mobile App Debugging

1. **Enable debug mode:**
```javascript
// Check mobile app logs
console.log("Debug:", data);
```

2. **Use React Native debugger:**
```bash
# Shake device/simulator
# Select "Debug JS Remotely"
```

3. **Check network requests:**
```javascript
// Mobile app logs show all API requests
// Look for 🚀 API Request and 📡 API Response
```

## Getting Help

### When to Create Issues

Create GitHub issues for:
- Bugs not covered in this guide
- Feature requests
- Documentation improvements
- Performance problems

### Information to Include

When reporting issues, include:
1. Operating system and version
2. Python and Node.js versions
3. Full error messages
4. Steps to reproduce
5. Expected vs actual behavior
6. Mobile device/simulator details

### Community Resources

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community help
- **API Documentation**: `/docs` endpoint for API reference
- **Interactive Testing**: Use `/docs` for testing endpoints

This troubleshooting guide is based on real issues encountered during V1.0 development and should resolve most common problems.