#!/bin/bash
# ============================================================================
# Rica - Test Runner Script
# ============================================================================
#
# Purpose:
#   Runs the test suite for rica using Jest (via react-scripts).
#   Currently the project has minimal test coverage - this script is a
#   placeholder for future test infrastructure.
#
# Expected Environment:
#   - Node.js v16+ installed
#   - Dependencies installed via npm install
#   - Test files in src/__tests__/ or named *.test.js
#
# Usage:
#   ./scripts/test.sh                # Run all tests in watch mode
#   ./scripts/test.sh --coverage     # Run with coverage report
#   ./scripts/test.sh --ci           # Run once (CI mode, no watch)
#   ./scripts/test.sh --file <path>  # Run specific test file
#
# Notes:
#   - Tests use Jest with React Testing Library (via react-scripts)
#   - Watch mode is default for interactive development
#   - CI mode runs once and exits with appropriate code
#
# TODO: Add test files for:
#   - PlotUtils.js (data parsing functions)
#   - File loading workflow
#   - Component rendering tests
#
# ============================================================================

set -e

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Default values
COVERAGE=false
CI_MODE=false
TEST_FILE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --coverage)
            COVERAGE=true
            shift
            ;;
        --ci)
            CI_MODE=true
            shift
            ;;
        --file)
            TEST_FILE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./scripts/test.sh [--coverage] [--ci] [--file <path>]"
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
echo "Rica Test Suite"
echo "============================================"
echo ""

# Build the command
CMD="npm test --"

if [ "$CI_MODE" = true ]; then
    CMD="$CMD --watchAll=false"
fi

if [ "$COVERAGE" = true ]; then
    CMD="$CMD --coverage"
fi

if [ -n "$TEST_FILE" ]; then
    CMD="$CMD $TEST_FILE"
fi

# Note about current test status
echo "Note: Test infrastructure is being set up. Limited tests may be available."
echo ""

# Run tests
eval $CMD
