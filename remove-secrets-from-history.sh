#!/bin/bash
# Script to remove .env and .npmrc from git history

cd /home/main/automaton/meta-log-db

echo "Removing .env and .npmrc from git history..."
echo ""

# Check if files exist in current commit
if git ls-files --error-unmatch .env .npmrc >/dev/null 2>&1; then
    echo "Removing files from index..."
    git rm --cached .env .npmrc 2>/dev/null || true
fi

# Remove from all commits using filter-branch
echo "Filtering git history to remove secrets..."
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env .npmrc' \
  --prune-empty --tag-name-filter cat -- --all

echo ""
echo "Cleaning up..."
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "Done! Now you can push:"
echo "  git push origin --force --all"
echo ""
echo "⚠️  WARNING: This rewrites history. Make sure you're okay with force pushing."

