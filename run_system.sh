#!/bin/bash

# Configuration
BACKEND_PORT=8000
FRONTEND_PORT=5173

echo "🚀 Initializing Ayushman Bharat Fraud Detection System..."

# Step 1: Cleanup existing processes on needed ports
echo "🧹 Cleaning up existing processes..."
lsof -ti :$BACKEND_PORT | xargs kill -9 2>/dev/null
lsof -ti :$FRONTEND_PORT | xargs kill -9 2>/dev/null

# Step 2: Ensure permissions
echo "🔒 Verifying permissions..."
chmod -R +x frontend/node_modules/.bin/ 2>/dev/null

# Step 3: Start FastAPI Backend
echo "📡 Starting Backend API on port $BACKEND_PORT..."
cd /Users/nyalapallypavankumar/Downloads/KLH/backend
/tmp/venv/bin/python3 main.py > backend.log 2>&1 &
BACKEND_PID=$!

# Step 4: Start React Frontend
echo "💻 Starting Frontend on port $FRONTEND_PORT..."
cd /Users/nyalapallypavankumar/Downloads/KLH/frontend
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

echo "✨ System is booting up!"
echo "🔗 Backend: http://localhost:$BACKEND_PORT"
echo "🔗 Frontend: http://localhost:$FRONTEND_PORT"
echo "📝 Logs: backend.log, frontend.log"
echo "🛑 Press Ctrl+C to stop both."

# Handle shutdown
trap "echo '🛑 Shutting down...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
