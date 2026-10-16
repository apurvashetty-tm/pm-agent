#!/bin/bash
# Start work on a project (new or existing): prints its working folder. Same as: scripts/workspace.sh project <name>
exec "$(dirname "$0")/workspace.sh" project "$@"
