#!/bin/bash

echo "🎬 VlogClip AI - Starting Your Million Dollar Interface"
echo "======================================================"

# Kill any existing processes
echo "📋 Cleaning up existing processes..."
pkill -f "node index.js" 2>/dev/null
pkill -f "react-scripts start" 2>/dev/null
sleep 1

# Start backend server
echo "⚡ Starting backend server on port 3001..."
cd "/Users/dwight.hamlet/My Project"
node index.js &
BACKEND_PID=$!
sleep 3

# Test backend
echo "🔍 Testing backend connection..."
if curl -s http://localhost:3001/ > /dev/null; then
    echo "✅ Backend server is running successfully"
    echo "   🎯 API Status: http://localhost:3001"
    echo "   🎥 Test Video: http://localhost:3001/test-video"
    echo "   📊 Progress API: http://localhost:3001/api/progress"
else
    echo "❌ Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend server
echo "🎨 Starting premium vlogger UI on port 3000..."
cd "/Users/dwight.hamlet/My Project/frontend"
npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 VlogClip AI is now LIVE!"
echo "======================================================"
echo "✨ Million Dollar UI: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo ""
echo "🎬 Features Available:"
echo "   • AI-Powered Highlight Generation"
echo "   • Multi-Platform Captions (TikTok/Twitter/LinkedIn)"
echo "   • Real-time Progress Tracking"
echo "   • Premium Vlogger Interface"
echo ""
echo "💡 Tip: The interface will automatically open in your browser!"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt
trap 'echo ""; echo "🛑 Stopping VlogClip AI..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo "✅ Servers stopped gracefully"; exit 0' INT
wait