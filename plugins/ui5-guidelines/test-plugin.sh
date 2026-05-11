#!/usr/bin/env bash

# Wrapper script for TypeScript test suite
# Builds and runs the TypeScript test runner

PLUGIN_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required to run tests"
    exit 1
fi

# Build and run tests
cd "$PLUGIN_DIR" && npm test -- "$@"
