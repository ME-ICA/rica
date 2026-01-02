#!/bin/bash
# ============================================================================
# Rica - Linting Script
# ============================================================================
#
# Purpose:
#   Runs ESLint on the codebase to check for code quality issues.
#   Uses the eslint configuration from react-app preset.
#
# Expected Environment:
#   - Node.js v16+ installed
#   - Dependencies installed via npm install
#
# Usage:
#   ./scripts/lint.sh              # Lint all source files
#   ./scripts/lint.sh --fix        # Lint and auto-fix issues
#   ./scripts/lint.sh --quiet      # Only report errors (not warnings)
#   ./scripts/lint.sh src/Plots/   # Lint specific directory
#
# Configuration:
#   ESLint config is defined in package.json under "eslintConfig"
#   Currently extends: react-app, react-app/jest
#
# Common Issues to Watch For:
#   - Unused variables (especially in destructuring)
#   - Missing dependencies in useEffect hooks
#   - Deprecated React lifecycle methods
#   - Accessibility issues (jsx-a11y rules)
#
# TODO:
#   - Add Prettier for consistent formatting
#   - Configure additional ESLint rules for stricter checks
#   - Add pre-commit hooks with husky
#
# ============================================================================

set -e

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Default values
FIX=false
QUIET=false
TARGET="src/"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --fix)
            FIX=true
            shift
            ;;
        --quiet)
            QUIET=true
            shift
            ;;
        -*)
            echo "Unknown option: $1"
            echo "Usage: ./scripts/lint.sh [--fix] [--quiet] [directory]"
            exit 1
            ;;
        *)
            TARGET="$1"
            shift
            ;;
    esac
done

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Error: node_modules not found. Run ./scripts/init_env.sh first."
    exit 1
fi

echo "============================================"
echo "Rica Linting"
echo "============================================"
echo ""
echo "Target: $TARGET"
echo ""

# Build the command
CMD="npx eslint"

if [ "$FIX" = true ]; then
    CMD="$CMD --fix"
    echo "Mode: Fix"
else
    echo "Mode: Check only (use --fix to auto-fix)"
fi

if [ "$QUIET" = true ]; then
    CMD="$CMD --quiet"
fi

# Add file extensions and target
CMD="$CMD --ext .js,.jsx $TARGET"

echo ""

# Run linter
$CMD

LINT_EXIT=$?

echo ""
if [ $LINT_EXIT -eq 0 ]; then
    echo "============================================"
    echo "Linting passed! No issues found."
    echo "============================================"
else
    echo "============================================"
    echo "Linting found issues. Review output above."
    echo "Run with --fix to auto-fix some issues."
    echo "============================================"
fi

exit $LINT_EXIT
