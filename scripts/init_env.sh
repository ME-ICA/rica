#!/bin/bash
# ============================================================================
# Rica - Environment Initialization Script
# ============================================================================
#
# Purpose:
#   Sets up the Node.js development environment for rica, installs dependencies,
#   and verifies the installation is ready for development.
#
# Expected Environment:
#   - Node.js: v16.x or v18.x recommended (Create React App 5.x compatibility)
#   - npm: v8.x or higher
#   - OS: macOS, Linux, or WSL on Windows
#
# Usage:
#   ./scripts/init_env.sh
#   ./scripts/init_env.sh --clean    # Clean install (removes node_modules first)
#
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "============================================"
echo "Rica Environment Setup"
echo "============================================"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo "Please install Node.js v16 or v18 from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "Node.js version: ${GREEN}$NODE_VERSION${NC}"

# Extract major version number
NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v\([0-9]*\).*/\1/')

if [ "$NODE_MAJOR" -lt 14 ]; then
    echo -e "${RED}Error: Node.js v14 or higher is required.${NC}"
    echo "Current version: $NODE_VERSION"
    exit 1
fi

if [ "$NODE_MAJOR" -ge 20 ]; then
    echo -e "${YELLOW}Warning: Node.js v$NODE_MAJOR may have compatibility issues with some dependencies.${NC}"
    echo "Recommended: Node.js v16.x or v18.x"
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed.${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "npm version: ${GREEN}$NPM_VERSION${NC}"

# Handle --clean flag
if [ "$1" == "--clean" ]; then
    echo ""
    echo "Performing clean install..."
    if [ -d "node_modules" ]; then
        echo "Removing node_modules..."
        rm -rf node_modules
    fi
    if [ -f "package-lock.json" ]; then
        echo "Removing package-lock.json..."
        rm -f package-lock.json
    fi
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Verify installation
echo ""
echo "Verifying installation..."

# Check if react-scripts is available
if [ -f "node_modules/.bin/react-scripts" ]; then
    echo -e "${GREEN}react-scripts installed successfully${NC}"
else
    echo -e "${RED}Error: react-scripts not found${NC}"
    exit 1
fi

# Check for Tailwind output
if [ ! -f "src/styles/output.css" ]; then
    echo ""
    echo "Generating Tailwind CSS..."
    npm run watch:css &
    WATCH_PID=$!
    sleep 3
    kill $WATCH_PID 2>/dev/null || true
fi

if [ -f "src/styles/output.css" ]; then
    echo -e "${GREEN}Tailwind CSS output exists${NC}"
else
    echo -e "${YELLOW}Warning: src/styles/output.css not found. Run 'npm run watch:css' separately.${NC}"
fi

echo ""
echo "============================================"
echo -e "${GREEN}Environment setup complete!${NC}"
echo "============================================"
echo ""
echo "Next steps:"
echo "  npm start      - Start development server"
echo "  npm run build  - Create production build"
echo "  npm test       - Run tests"
echo ""
