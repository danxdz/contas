#!/bin/bash

# Script to commit with version in the message
# Usage: ./commit-with-version.sh "Your commit message"

# Get the current version from version.js
VERSION=$(grep "MACHINE_MODULE_VERSION = " version.js | sed "s/.*'\(.*\)'.*/\1/")

if [ -z "$1" ]; then
    echo "Usage: ./commit-with-version.sh \"Your commit message\""
    exit 1
fi

# Add all changes
git add -A

# Commit with version in the message
git commit -m "[$VERSION] $1"

echo "✅ Committed with version $VERSION"
echo "📝 Message: [$VERSION] $1"
echo ""
echo "To push: git push origin cursor/develop-machine-module-for-cnc-studio-be2e"