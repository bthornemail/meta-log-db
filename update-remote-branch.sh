#!/bin/bash
# Script to update the remote tracking branch after history rewrite

cd /home/main/automaton/meta-log-db

echo "Updating remote tracking branch for automaton-intergration..."
echo ""

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Switch to automaton-intergration if not already on it
if [ "$CURRENT_BRANCH" != "automaton-intergration" ]; then
    echo "Switching to automaton-intergration branch..."
    git checkout automaton-intergration
fi

# Fetch latest from remote
echo "Fetching latest from origin..."
git fetch origin

# Show current state
echo ""
echo "Local branch commit:"
git log --oneline -1 automaton-intergration

echo ""
echo "Remote branch commit:"
git log --oneline -1 origin/automaton-intergration 2>/dev/null || echo "Remote branch not found"

# Force push to update remote
echo ""
echo "Force pushing to update remote branch..."
git push origin automaton-intergration --force

# Update remote tracking reference
echo ""
echo "Updating remote tracking reference..."
git fetch origin
git branch -vv | grep automaton-intergration

echo ""
echo "✅ Done! Remote branch should now be updated."

