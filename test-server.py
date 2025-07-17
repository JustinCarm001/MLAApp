#!/usr/bin/env python3
"""
Simple test server to verify mobile app connectivity
"""
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

class TestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Accept')
        self.end_headers()

    def do_GET(self):
        """Handle GET requests"""
        parsed_url = urlparse(self.path)
        
        # Add CORS headers
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if parsed_url.path == '/health':
            response = {
                "status": "ok",
                "service": "Hockey Live Test Server",
                "version": "1.0.0",
                "message": "Backend connection successful! 🏒"
            }
        elif parsed_url.path == '/api/v1/':
            response = {
                "message": "Hockey Live API v1",
                "version": "1.0.0",
                "status": "running"
            }
        elif parsed_url.path == '/api/v1/arena/types':
            response = {
                "arena_types": [
                    {"id": 1, "name": "standard", "description": "Standard NHL size rink"},
                    {"id": 2, "name": "olympic", "description": "Olympic size rink"},
                    {"id": 3, "name": "practice", "description": "Practice rink"}
                ]
            }
        else:
            response = {"error": f"Endpoint {parsed_url.path} not found", "status": 404}
            
        self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        """Handle POST requests"""
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode()) if post_data else {}
        except:
            data = {}
        
        # Add CORS headers
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        parsed_url = urlparse(self.path)
        
        if parsed_url.path == '/api/v1/auth/register':
            response = {
                "message": "Test user registered successfully",
                "user": {
                    "id": 1,
                    "email": data.get("email", "test@example.com"),
                    "full_name": data.get("full_name", "Test User")
                },
                "token": "test_jwt_token_12345"
            }
        elif parsed_url.path == '/api/v1/teams':
            response = {
                "message": "Team created successfully",
                "team": {
                    "id": 1,
                    "name": data.get("name", "Test Team"),
                    "league": data.get("league", "Test League"),
                    "age_group": data.get("age_group", "U16")
                }
            }
        elif parsed_url.path == '/api/v1/games':
            response = {
                "message": "Game created successfully",
                "game": {
                    "id": 1,
                    "home_team": data.get("home_team", "Lightning"),
                    "away_team": data.get("away_team", "Thunder"),
                    "arena_type": data.get("arena_type", "standard"),
                    "status": "scheduled"
                }
            }
        else:
            response = {"error": f"Endpoint {parsed_url.path} not found", "status": 404}
            
        self.wfile.write(json.dumps(response).encode())

    def log_message(self, format, *args):
        """Custom log format"""
        print(f"📱 Mobile Request: {format % args}")

if __name__ == '__main__':
    server_address = ('0.0.0.0', 8000)
    httpd = HTTPServer(server_address, TestHandler)
    print(f"🚀 Hockey Live Test Server starting on http://0.0.0.0:8000")
    print(f"📱 Mobile app should connect to: http://192.168.59.30:8000")
    print(f"🏒 Ready to test mobile app connectivity!")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped")