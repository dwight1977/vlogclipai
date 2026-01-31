#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys
from datetime import datetime

class CacheBusterHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add cache-busting headers
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        # Add timestamp to prevent caching
        self.send_header('X-Timestamp', str(int(datetime.now().timestamp())))
        super().end_headers()

    def guess_type(self, path):
        mimetype = super().guess_type(path)
        # Force reload of JavaScript and CSS files
        if path.endswith('.js'):
            return 'application/javascript; charset=utf-8'
        elif path.endswith('.css'):
            return 'text/css; charset=utf-8'
        return mimetype

if __name__ == "__main__":
    PORT = 3000
    os.chdir("build")
    
    with socketserver.TCPServer(("", PORT), CacheBusterHandler) as httpd:
        print(f"🚀 Cache-Busting Server running on port {PORT}")
        print("📱 All files served with no-cache headers")
        print("🔄 JavaScript and CSS will be reloaded fresh")
        httpd.serve_forever()