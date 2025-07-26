#!/bin/bash

# Development script for Time Tracker Electron App
echo "🚀 Starting Time Tracker Electron App in development mode..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the app in development mode with hot reloading
echo "🔥 Starting with hot reloading enabled..."
npm run dev 