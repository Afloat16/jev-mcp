#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20+ is required." >&2
  exit 1
fi

node_major="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$node_major" -lt 20 ]; then
  echo "Node.js 20+ is required; found $(node -v)." >&2
  exit 1
fi

if [ -f .env ]; then
  echo "Existing .env found; keeping it unchanged."
elif [ -n "${TYPESAFE_API_KEY:-}" ]; then
  echo "TYPESAFE_API_KEY already exists in the process environment; no .env created."
else
  printf 'Paste your TypeSafe API key (input hidden): '
  IFS= read -r -s typesafe_key
  printf '\n'

  if [ -z "$typesafe_key" ]; then
    echo "API key cannot be empty." >&2
    exit 1
  fi

  umask 077
  cat > .env <<EOF_ENV
# Local secret file. Do not commit.
TYPESAFE_API_KEY=$typesafe_key
JEV_MODEL=jev-latest
TYPESAFE_BASE_URL=https://api.typesafe.ai
TYPESAFE_TIMEOUT_MS=15000
EOF_ENV
  chmod 600 .env 2>/dev/null || true
  unset typesafe_key
  echo "Created local .env with restrictive permissions."
fi

npm install --no-audit --no-fund
npm run check
npm run doctor

echo
echo "jev-mcp v0.4.1 setup complete."
echo "Next: configure your MCP host using config.toml.snippet or the README example, then restart the host."
