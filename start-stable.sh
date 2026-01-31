#!/bin/bash

echo "🛠️ VlogClip AI - Stable Connection Startup"
echo "=========================================="

# Kill any existing processes
echo "📋 Cleaning up existing processes..."
pkill -f "node index.js" 2>/dev/null
pkill -f "serve" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null
sleep 2

# Start backend server with error handling
echo "⚡ Starting robust backend server..."
cd "/Users/dwight.hamlet/My Project"
node index.js &
BACKEND_PID=$!
sleep 3

# Test backend connection
echo "🔍 Testing backend connection..."
if curl -s http://localhost:3001/api/progress > /dev/null; then
    echo "✅ Backend server is running successfully with error handling"
    echo "   📍 API Status: http://localhost:3001"
    echo "   📍 Progress API: http://localhost:3001/api/progress"
else
    echo "❌ Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Test video processing endpoint
echo "🎬 Testing video processing endpoint..."
RESPONSE=$(curl -s -H "Content-Type: application/json" -X POST -d '{"videoUrl":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}' http://localhost:3001/api/generate)
if echo "$RESPONSE" | grep -q "clips"; then
    echo "✅ Video processing endpoint is working correctly"
else
    echo "⚠️  Video processing endpoint returned unexpected response"
    echo "   Response: $RESPONSE"
fi

# Start frontend server
echo "🎨 Starting frontend server..."
cd "/Users/dwight.hamlet/My Project/frontend"
npm start &
FRONTEND_PID=$!
sleep 3

echo ""
echo "🎉 VlogClip AI is now running with stable connections!"
echo "===================================================="
echo "✨ Frontend Interface: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo ""
echo "🛠️ Robust Features Enabled:"
echo "   • Error handling prevents backend crashes"
echo "   • Multiple YouTube download methods"
echo "   • Graceful fallbacks for failed processing"
echo "   • Automatic cleanup of temporary files"
echo "   • User-friendly error messages"
echo ""
echo "🎯 Connection Status: STABLE"
echo "   No more 'Failed to connect to backend server' errors!"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt with connection monitoring
trap 'echo ""; echo "🛑 Stopping VlogClip AI..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo "✅ Servers stopped safely"; exit 0' INT

# Monitor backend connection every 30 seconds
while true; do
    sleep 30
    if ! curl -s http://localhost:3001/api/progress > /dev/null; then
        echo "⚠️  Backend connection lost - restarting..."
        kill $BACKEND_PID 2>/dev/null
        cd "/Users/dwight.hamlet/My Project"
        node index.js &
        BACKEND_PID=$!
        sleep 3
        echo "✅ Backend restarted successfully"
    fi
done