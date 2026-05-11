#!/bin/bash

# Wrapper script for unified test suite
# Runs the consolidated Node.js test runner

PLUGIN_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required to run tests"
    exit 1
fi

# Run unified test suite
node "$PLUGIN_DIR/test/index.js" "$@"
