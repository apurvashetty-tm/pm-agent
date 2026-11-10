#!/bin/bash
# Run a node script with the installed Chrome. From the project folder: bash docs/renders/2026-11-10-wheel-keyboard/tools/node.sh <script> [args]
export CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
export CHROMIUM="${CHROMIUM:-$CHROME}"
node "$@"
