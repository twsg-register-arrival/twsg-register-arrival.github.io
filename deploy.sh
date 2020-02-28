#!/usr/bin/env bash

set -euo pipefail

BUILD_HASH=$(git rev-parse HEAD)
git fetch origin master:master
git checkout master
cp dist/* .

if [ -z "$(git status --porcelain)" ]; then
    echo "Nothing to deploy"
    exit 0
fi

echo "Changes detected; deploying..."
GH_PAT=$1
GH_REPO=$2
REMOTE_REPO="https://${GH_PAT}@github.com/${GH_REPO}"
git add .
git commit -m "Deploy to GitHub Pages" -m "Build ${BUILD_HASH}"
git push $REMOTE_REPO
echo "Deployment $(git rev-parse HEAD) succeeded"
