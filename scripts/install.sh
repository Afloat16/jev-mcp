#!/usr/bin/env bash
set -euo pipefail

target="${1:-all}"
if [ "$#" -gt 0 ]; then
  shift
fi

for command in git node npm; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "jev-mcp installer: $command is required." >&2
    exit 1
  fi
done

node_major="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$node_major" -lt 20 ]; then
  echo "jev-mcp installer: Node.js 20+ is required; found $(node -v)." >&2
  exit 1
fi

config_home="${JEV_MCP_CONFIG_HOME:-$HOME/.jev-mcp}"
runtime="${JEV_MCP_RUNTIME_DIR:-$config_home/runtime}"
repo_url="${JEV_MCP_REPO_URL:-https://github.com/Afloat16/jev-mcp.git}"
git_ref="${JEV_MCP_GIT_REF:-main}"

mkdir -p "$config_home"
chmod 700 "$config_home" 2>/dev/null || true

if [ -e "$runtime" ] && [ ! -d "$runtime/.git" ]; then
  echo "jev-mcp installer: $runtime exists but is not a jev-mcp Git checkout." >&2
  echo "Set JEV_MCP_RUNTIME_DIR to another directory or remove that path." >&2
  exit 1
fi

if [ ! -d "$runtime/.git" ]; then
  echo "Installing jev-mcp runtime into $runtime"
  git clone --filter=blob:none --no-checkout "$repo_url" "$runtime"
else
  echo "Updating existing jev-mcp runtime in $runtime"
fi

git -C "$runtime" fetch --prune origin "$git_ref"
git -C "$runtime" checkout --detach FETCH_HEAD

(
  cd "$runtime"
  npm ci --no-audit --no-fund
  npm run build
)

export JEV_MCP_RUNTIME_DIR="$runtime"

skip_key=false
for arg in "$@"; do
  if [ "$arg" = "--skip-key" ]; then
    skip_key=true
    break
  fi
done

if [ "$skip_key" = false ] && [ -z "${TYPESAFE_API_KEY:-}" ] && [ ! -t 0 ]; then
  if [ -e /dev/tty ]; then
    node "$runtime/dist/cli.js" install "$target" "$@" < /dev/tty
  else
    echo "jev-mcp installer: interactive key entry needs a TTY." >&2
    echo "Set TYPESAFE_API_KEY in the environment or rerun from an interactive terminal." >&2
    exit 1
  fi
else
  node "$runtime/dist/cli.js" install "$target" "$@"
fi

echo
echo "jev-mcp runtime: $runtime"
echo "Restart the configured AI client or start a new session before using Jev."
