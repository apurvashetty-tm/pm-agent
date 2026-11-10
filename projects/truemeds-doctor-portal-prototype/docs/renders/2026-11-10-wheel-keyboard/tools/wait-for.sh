#!/bin/bash
# Wait (up to N×5 s) until a file contains a pattern, then print the file. bash wait-for.sh <file> <regex> [N]
f="$1"; re="$2"; n="${3:-110}"
for i in $(seq 1 "$n"); do
  if grep -qE "$re" "$f" 2>/dev/null; then cat "$f"; exit 0; fi
  sleep 5
done
echo "timed out"; cat "$f" 2>/dev/null; exit 1
