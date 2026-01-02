#!/bin/bash
# ============================================================================
# Rica - Development Server Script
# ============================================================================
#
# Purpose:
#   Starts the React development server with hot reload for rapid iteration.
#   Optionally starts Tailwind CSS watcher in parallel.
#
# Expected Environment:
#   - Node.js v16+ installed
#   - Dependencies installed via npm install
#   - Browser: Chrome, Firefox, Safari, or Edge (modern versions)
#
# Default Behavior:
#   - Starts on http://localhost:3000
#   - Opens browser automatically
#   - Hot reload enabled for JS/CSS changes
#
# Usage:
#   ./scripts/dev.sh              # Start dev server (port 3000)
#   ./scripts/dev.sh --port 3001  # Start on custom port
#   ./scripts/dev.sh --no-open    # Don't auto-open browser
#   ./scripts/dev.sh --with-css   # Also run Tailwind CSS watcher
#
# Environment Variables:
#   PORT=3001 ./scripts/dev.sh    # Alternative way to set port
#   BROWSER=none ./scripts/dev.sh # Prevent browser from opening
#
# ============================================================================

set -e

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Default values
PORT=${PORT:-3000}
OPEN_BROWSER=true
WITH_CSS=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --port)
            PORT="$2"
            shift 2
            ;;
        --no-open)
            OPEN_BROWSER=false
            shift
            ;;
        --with-css)
            WITH_CSS=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./scripts/dev.sh [--port PORT] [--no-open] [--with-css]"
            exit 1
            ;;
    esac
done

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Error: node_modules not found. Run ./scripts/init_env.sh first."
    exit 1
fi

echo "============================================"
echo "Rica Development Server"
echo "============================================"
echo ""
echo "Starting on: http://localhost:$PORT"
echo ""

# Set environment
export PORT=$PORT

if [ "$OPEN_BROWSER" = false ]; then
    export BROWSER=none
fi

# Start Tailwind CSS watcher if requested
if [ "$WITH_CSS" = true ]; then
    echo "Starting Tailwind CSS watcher in background..."
    npm run watch:css &
    CSS_PID=$!

    # Cleanup function
    cleanup() {
        echo ""
        echo "Shutting down..."
        kill $CSS_PID 2>/dev/null || true
        exit 0
    }
    trap cleanup SIGINT SIGTERM
fi

# Start development server
npm start

# Cleanup CSS watcher if it was started
if [ "$WITH_CSS" = true ]; then
    kill $CSS_PID 2>/dev/null || true
fi
