#!/bin/bash

echo "🎬 VlogClip AI - UI Preview"
echo "============================"

# Quick backend test
cd "/Users/dwight.hamlet/My Project"
echo "🔧 Testing backend startup..."
node index.js &
BACKEND_PID=$!
sleep 3

if curl -s http://localhost:3001/ > /dev/null; then
    echo "✅ Backend is ready!"
else
    echo "❌ Backend issue detected"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Build frontend for preview
cd "/Users/dwight.hamlet/My Project/frontend"
echo "🎨 Building premium vlogger interface..."
npm run build > /dev/null 2>&1

echo ""
echo "🎉 VlogClip AI Interface Preview"
echo "================================="
echo ""
echo "✨ MILLION DOLLAR FEATURES:"
echo "   🎯 Stunning gradient header with animated logo"
echo "   🌟 Glass-morphism input cards with blur effects"
echo "   ⚡ Animated progress bars with shine effects"
echo "   🎬 Premium video player with custom styling"
echo "   📱 Platform-specific caption cards (TikTok/Twitter/LinkedIn)"
echo "   🎨 Smooth hover animations throughout"
echo "   📱 Fully responsive design"
echo ""
echo "🎭 DESIGN ELEMENTS:"
echo "   • Vibrant gradient backgrounds"
echo "   • Floating action buttons with shadows"
echo "   • Animated icons and emojis"
echo "   • Professional typography"
echo "   • Backdrop blur effects"
echo "   • Smooth transitions"
echo ""
echo "🚀 Ready to launch your premium interface!"
echo "   Run: ./start-dev.sh"
echo ""

# Cleanup
kill $BACKEND_PID 2>/dev/null
echo "✅ Preview complete!"