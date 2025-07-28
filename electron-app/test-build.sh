#!/bin/bash

# Test script for the built Time Tracker app
echo "🧪 Testing Time Tracker macOS build..."

# Check if the app exists
if [ ! -d "releases/mac-arm64/Time Tracker.app" ]; then
    echo "❌ App not found. Please build first with: npm run build:mac"
    exit 1
fi

# Check if DMG exists
if [ ! -f "releases/Time Tracker-1.0.0-arm64.dmg" ]; then
    echo "❌ DMG not found. Please build first with: npm run build:mac"
    exit 1
fi

echo "✅ App bundle found: releases/mac-arm64/Time Tracker.app"
echo "✅ DMG installer found: releases/Time Tracker-1.0.0-arm64.dmg"

# Test app launch (non-blocking)
echo "🚀 Launching app for testing..."
open "releases/mac-arm64/Time Tracker.app" &
APP_PID=$!

# Wait a moment for app to start
sleep 3

# Check if app is running
if pgrep -f "Time Tracker" > /dev/null; then
    echo "✅ App launched successfully!"
    echo "📱 You can now test the app functionality"
    echo "🛑 To stop the app, use: pkill -f 'Time Tracker'"
else
    echo "⚠️  App may not have started properly"
fi

echo ""
echo "📋 Build Summary:"
echo "   - App Bundle: releases/mac-arm64/Time Tracker.app"
echo "   - DMG Installer: releases/Time Tracker-1.0.0-arm64.dmg"
echo "   - Size: $(du -h releases/Time\ Tracker-1.0.0-arm64.dmg | cut -f1)"
echo ""
echo "🎉 Build completed successfully!" 