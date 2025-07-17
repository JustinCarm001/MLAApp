"""
Real-time streaming and video upload endpoints.
"""

from fastapi import APIRouter

router = APIRouter()

@router.post("/start")
async def start_streaming():
    """Start streaming session."""
    return {"message": "Start streaming endpoint - to be implemented"}

@router.post("/stop")
async def stop_streaming():
    """Stop streaming session."""
    return {"message": "Stop streaming endpoint - to be implemented"}

@router.post("/{session_id}/chunk")
async def upload_chunk():
    """Upload video chunk."""
    return {"message": "Upload chunk endpoint - to be implemented"}