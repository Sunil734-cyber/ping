#!/bin/bash

echo "========================================"
echo "PingDaily - Starting Application"
echo "========================================"
echo ""

# Check if MongoDB is installed and running
if command -v mongod &> /dev/null; then
    # Check if MongoDB is running
    if pgrep -x "mongod" > /dev/null; then
        echo "✓ MongoDB is already running"
    else
        echo "Starting MongoDB..."
        # Try to start MongoDB based on OS
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew services start mongodb-community 2>/dev/null || sudo mongod --fork --logpath /usr/local/var/log/mongodb/mongo.log
        else
            # Linux
            sudo systemctl start mongod 2>/dev/null || sudo mongod --fork --logpath /var/log/mongodb/mongod.log
        fi
        
        if [ $? -eq 0 ]; then
            echo "✓ MongoDB started successfully"
        else
            echo "⚠ Could not start MongoDB automatically"
            echo "Please start it manually or use MongoDB Atlas"
        fi
    fi
else
    echo "⚠ MongoDB not found!"
    echo "Please install MongoDB or use MongoDB Atlas"
    echo "The app will work with localStorage as fallback"
fi

echo ""
echo "Starting PingDaily application..."
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev:all
