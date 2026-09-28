#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

repo_name="${1:-jev-mcp}"
visibility="${2:-public}"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required." >&2
  exit 1
fi
if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required. Install it, then run: gh auth login" >&2
  exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not authenticated. Run: gh auth login" >&2
  exit 1
fi
if ! git config user.name >/dev/null || ! git config user.email >/dev/null; then
  echo "Git identity is not configured. Set git config user.name and user.email first." >&2
  exit 1
fi

if [ ! -d .git ]; then
  git init -b main
fi

npm install --no-audit --no-fund
git add .
npm run secrets:check
npm run check

if git diff --cached --quiet; then
  echo "No staged changes to commit."
else
  git commit -m "chore: prepare jev-mcp for open source"
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  case "$visibility" in
    public) visibility_flag="--public" ;;
    private) visibility_flag="--private" ;;
    *) echo "Visibility must be public or private." >&2; exit 1 ;;
  esac
  gh repo create "$repo_name" "$visibility_flag" --source=. --remote=origin --push \
    --description "Unofficial conservative MCP server for TypeSafe AI Jev"
else
  git push -u origin main
fi

repo_full="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
node scripts/set-repo-metadata.mjs "$repo_full"
npm install --package-lock-only --ignore-scripts --no-audit --no-fund
git add package.json package-lock.json
if ! git diff --cached --quiet; then
  git commit -m "chore: add GitHub repository metadata"
  git push origin main
fi

version="$(node -p "JSON.parse(require('fs').readFileSync('package.json','utf8')).version")"
tag="v${version}"
if ! git rev-parse "$tag" >/dev/null 2>&1; then
  git tag -a "$tag" -m "jev-mcp ${tag}"
  git push origin "$tag"
  echo "Pushed ${tag}. The release workflow will create GitHub Release assets."
else
  echo "Tag ${tag} already exists; skipped tagging."
fi

gh repo edit \
  --enable-issues=true \
  --enable-wiki=false \
  --delete-branch-on-merge=true \
  --enable-secret-scanning=true \
  --enable-secret-scanning-push-protection=true \
  --add-topic mcp \
  --add-topic model-context-protocol \
  --add-topic typesafe-ai \
  --add-topic jev || true

gh api -X PUT "repos/${repo_full}/vulnerability-alerts" >/dev/null 2>&1 || true
if [ "$visibility" = "public" ]; then
  gh api -X PUT "repos/${repo_full}/private-vulnerability-reporting" >/dev/null 2>&1 || true
fi

echo
echo "Repository: $(gh repo view --json url --jq .url)"
echo "Automated: issues on, wiki off, delete-branch-on-merge, security scanning/push protection (where available), topics, and public-repo private vulnerability reporting (where permitted)."
echo "Optional manual hardening: add a main-branch ruleset requiring the CI check before merge."
