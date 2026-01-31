#!/bin/bash

echo "🧪 Testing Video Processing Fix"
echo "================================"

# Check if server is running
echo "📡 Checking if server is running..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running"
    echo "Please start the server first:"
    echo "  npm start"
    echo "  or"
    echo "  node index.js"
    exit 1
fi

echo ""
echo "🎬 Testing video processing with different URLs..."
echo ""

# Test with different video URLs (replace with actual working URLs)
echo "🔍 Test 1: Processing first video..."
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=example1",
    "plan": "pro"
  }' \
  -w "\nStatus: %{http_code}\n" \
  --max-time 120

echo ""
echo "⏱️ Waiting 5 seconds..."
sleep 5

echo ""
echo "🔍 Test 2: Processing second video..."
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=example2", 
    "plan": "pro"
  }' \
  -w "\nStatus: %{http_code}\n" \
  --max-time 120

echo ""
echo "📁 Checking generated clip files..."
ls -la uploads/clip_* 2>/dev/null | head -10

echo ""
echo "✅ Test completed!"
echo ""
echo "🔍 To manually test:"
echo "1. Start the server: node index.js"
echo "2. Use different YouTube URLs in the frontend"
echo "3. Check that clip filenames contain different video IDs"
echo "4. Verify clip content is from the correct videos"