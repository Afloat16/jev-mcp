$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js 20+ is required."
}

$nodeMajor = [int](& node -p 'process.versions.node.split(".")[0]')
if ($nodeMajor -lt 20) {
  throw "Node.js 20+ is required; found $(& node -v)."
}

if (Test-Path .env) {
  Write-Host "Existing .env found; keeping it unchanged."
} elseif (-not [string]::IsNullOrWhiteSpace($env:TYPESAFE_API_KEY)) {
  Write-Host "TYPESAFE_API_KEY already exists in the process environment; no .env created."
} else {
  $secureKey = Read-Host "Paste your TypeSafe API key" -AsSecureString
  $key = [System.Net.NetworkCredential]::new("", $secureKey).Password
  if ([string]::IsNullOrWhiteSpace($key)) {
    throw "API key cannot be empty."
  }

  $envText = @"
# Local secret file. Do not commit.
TYPESAFE_API_KEY=$key
JEV_MODEL=jev-latest
TYPESAFE_BASE_URL=https://api.typesafe.ai
TYPESAFE_TIMEOUT_MS=15000
"@
  [IO.File]::WriteAllText((Join-Path $PSScriptRoot ".env"), $envText, [Text.UTF8Encoding]::new($false))
  $key = $null
  $secureKey = $null
  Write-Host "Created local .env."
}

& npm ci --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& npm run check
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& npm run doctor
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "jev-mcp v0.5.0 setup complete."
Write-Host "Next: configure your MCP host using config.toml.snippet or the README example, then restart the host."
