#!/bin/bash
# ============================================================================
# Rica - Production Build Script
# ============================================================================
#
# Purpose:
#   Creates an optimized production build of rica with optional asset inlining
#   for single-file HTML distribution (suitable for embedding in tedana outputs).
#
# Expected Environment:
#   - Node.js v16+ installed
#   - Dependencies installed via npm install
#
# Build Output:
#   - ./build/           - Standard React production build
#   - ./build/index.html - With --inline: single-file with inlined JS/CSS
#
# Usage:
#   ./scripts/build.sh              # Standard production build
#   ./scripts/build.sh --inline     # Build + inline assets (single HTML file)
#   ./scripts/build.sh --analyze    # Build + analyze bundle size
#   ./scripts/build.sh --check      # Build + verify output integrity
#
# Notes:
#   - The --inline option uses Gulp to inline JS/CSS into index.html
#   - This is useful for distributing rica as a single file with tedana outputs
#   - Build artifacts are placed in ./build/ directory
#
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Default values
INLINE=false
ANALYZE=false
CHECK=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --inline)
            INLINE=true
            shift
            ;;
        --analyze)
            ANALYZE=true
            shift
            ;;
        --check)
            CHECK=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./scripts/build.sh [--inline] [--analyze] [--check]"
            exit 1
            ;;
    esac
done

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${RED}Error: node_modules not found. Run ./scripts/init_env.sh first.${NC}"
    exit 1
fi

echo "============================================"
echo "Rica Production Build"
echo "============================================"
echo ""

# Clean previous build
if [ -d "build" ]; then
    echo "Cleaning previous build..."
    rm -rf build
fi

# Run production build
echo "Creating production build..."
if [ "$ANALYZE" = true ]; then
    # Build with source maps for analysis
    GENERATE_SOURCEMAP=true npm run build
else
    npm run build
fi

# Verify build output
if [ ! -f "build/index.html" ]; then
    echo -e "${RED}Error: Build failed - index.html not found${NC}"
    exit 1
fi

echo -e "${GREEN}React build complete${NC}"

# Inline assets if requested
if [ "$INLINE" = true ]; then
    echo ""
    echo "Inlining JS and CSS assets..."

    # Check if gulp is available
    if [ ! -f "node_modules/.bin/gulp" ]; then
        echo -e "${YELLOW}Warning: Gulp not found. Installing...${NC}"
        npm install --save-dev gulp gulp-inline-source gulp-replace
    fi

    # Run gulp task
    npx gulp

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Assets inlined successfully${NC}"

        # Check file size
        INLINE_SIZE=$(wc -c < "build/index.html" | tr -d ' ')
        INLINE_SIZE_MB=$(echo "scale=2; $INLINE_SIZE / 1048576" | bc)
        echo "Inlined index.html size: ${INLINE_SIZE_MB}MB"
    else
        echo -e "${RED}Warning: Asset inlining failed${NC}"
    fi
fi

# Verify build integrity if requested
if [ "$CHECK" = true ]; then
    echo ""
    echo "Verifying build integrity..."

    # Check for expected files
    EXPECTED_FILES=("build/index.html" "build/static/js" "build/static/css")
    ALL_PRESENT=true

    for file in "${EXPECTED_FILES[@]}"; do
        if [ -e "$file" ] || [ -d "$file" ]; then
            echo -e "  ${GREEN}[OK]${NC} $file"
        else
            echo -e "  ${RED}[MISSING]${NC} $file"
            ALL_PRESENT=false
        fi
    done

    if [ "$ALL_PRESENT" = true ]; then
        echo -e "${GREEN}Build verification passed${NC}"
    else
        echo -e "${YELLOW}Warning: Some expected files are missing${NC}"
    fi
fi

# Print build summary
echo ""
echo "============================================"
echo -e "${GREEN}Build complete!${NC}"
echo "============================================"
echo ""
echo "Output directory: ./build/"

if [ "$INLINE" = true ]; then
    echo "Single-file distribution: ./build/index.html"
fi

echo ""
echo "To preview the build locally:"
echo "  npx serve -s build"
echo ""
