#!/bin/bash
# Run this ONCE from inside the signal folder to push to GitHub.
# Usage: bash push.sh
set -e

# Use a local git dir so we don't need root perms on .git
rm -rf .git
git init -b main
git config user.email "waelsalameh255@gmail.com"
git config user.name "Wael Salameh"

# Make sure env files stay ignored (they already are, just being paranoid)
cat >> .gitignore <<'EOF'
.env.local
.env
tsconfig.tsbuildinfo
EOF
# dedupe
sort -u .gitignore -o .gitignore

git add -A
git commit -m "Initial commit: Signal content automation"
git remote add origin git@github.com:superwae/signal.git
git push -u origin main --force

echo ""
echo "✅ Pushed. Now tell Claude 'pushed' so it can trigger the Vercel deploy."
