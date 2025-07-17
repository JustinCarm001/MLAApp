"""
Hockey Live App - FastAPI Backend Main Application

This is the main entry point for the Hockey Live App backend server.
Supports multi-platform clients: mobile app, web portal, and desktop application.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import time
import uvicorn

from app.core.config import settings
from app.core.exceptions import CustomException
from app.core.database import create_tables
from app.api.v1.api import api_router

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multi-camera hockey game recording and compilation platform",
    version=settings.PROJECT_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=False
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=settings.ALLOWED_HOSTS
)

# CORS middleware for web and mobile clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time header to all responses."""
    start_time = time.time()
    
    # Log all incoming requests
    print(f"\n=== INCOMING REQUEST ===")
    print(f"Method: {request.method}")
    print(f"URL: {request.url}")
    print(f"Headers: {dict(request.headers)}")
    print(f"Client IP: {request.client.host if request.client else 'Unknown'}")
    
    # Try to read body for POST requests
    if request.method in ["POST", "PUT", "PATCH"]:
        body = await request.body()
        if body:
            try:
                print(f"Body: {body.decode('utf-8')}")
            except:
                print(f"Body (bytes): {body}")
    
    response = await call_next(request)
    process_time = time.time() - start_time
    
    print(f"Response Status: {response.status_code}")
    print(f"Process Time: {process_time:.4f}s")
    print("========================\n")
    
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Custom exception handler
@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    """Handle custom application exceptions."""
    return JSONResponse(
        status_code=exc.code,
        content={
            "error": exc.error_code,
            "message": exc.message,
            "details": exc.details
        }
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Application health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "timestamp": time.time()
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with basic application information."""
    return {
        "message": "Hockey Live App API",
        "version": settings.PROJECT_VERSION,
        "docs": "/docs",
        "health": "/health"
    }

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    """Create database tables on application startup."""
    create_tables()

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info"
    )