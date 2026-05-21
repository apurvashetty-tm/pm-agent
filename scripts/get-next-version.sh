#!/bin/bash
# Get the next version number for a file
# Usage: ~/pm-agent/scripts/get-next-version.sh "archives/projects" "promise-buffer"
# Output: "2026-05-17-promise-buffer-v2.md"

ARCHIVE_PATH="$1"
FEATURE_NAME="$2"
DATE=$(date +%Y-%m-%d)

# Check if any version exists
LATEST_VERSION=$(ls ~/pm-agent/$ARCHIVE_PATH/${DATE}-${FEATURE_NAME}-v*.md 2>/dev/null | sed 's/.*-v//' | sed 's/.md//' | sort -n | tail -1)

if [ -z "$LATEST_VERSION" ]; then
  NEXT_VERSION=1
else
  NEXT_VERSION=$((LATEST_VERSION + 1))
fi

echo "${DATE}-${FEATURE_NAME}-v${NEXT_VERSION}.md"
