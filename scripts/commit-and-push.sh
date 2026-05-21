#!/bin/bash
# Commit and push to GitHub with a message
# Usage: ~/pm-agent/scripts/commit-and-push.sh "Your commit message"

cd ~/pm-agent

if [ -z "$1" ]; then
  echo "❌ Error: Please provide a commit message"
  echo "Usage: ~/pm-agent/scripts/commit-and-push.sh 'Your commit message'"
  exit 1
fi

echo "📝 Committing: $1"
git add -A
git commit -m "$1"

echo "🚀 Pushing to GitHub..."
git push

echo "✅ Successfully pushed to GitHub!"
