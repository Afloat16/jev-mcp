param(
  [string]$Target = "all",
  [switch]$SkipKey
)

$ErrorActionPreference = "Stop"

foreach ($command in @("git", "node", "npm")) {
  if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
    throw "jev-mcp installer: $command is required."
  }
}

$nodeMajor = [int](& node -p 'process.versions.node.split(".")[0]')
if ($nodeMajor -lt 20) {
  throw "jev-mcp installer: Node.js 20+ is required; found $(& node -v)."
}

$configHome = if ([string]::IsNullOrWhiteSpace($env:JEV_MCP_CONFIG_HOME)) {
  Join-Path $HOME ".jev-mcp"
} else {
  $env:JEV_MCP_CONFIG_HOME
}

$runtime = if ([string]::IsNullOrWhiteSpace($env:JEV_MCP_RUNTIME_DIR)) {
  Join-Path $configHome "runtime"
} else {
  $env:JEV_MCP_RUNTIME_DIR
}

$repoUrl = if ([string]::IsNullOrWhiteSpace($env:JEV_MCP_REPO_URL)) {
  "https://github.com/Afloat16/jev-mcp.git"
} else {
  $env:JEV_MCP_REPO_URL
}

$gitRef = if ([string]::IsNullOrWhiteSpace($env:JEV_MCP_GIT_REF)) {
  "v0.5.0"
} else {
  $env:JEV_MCP_GIT_REF
}

New-Item -ItemType Directory -Force -Path $configHome | Out-Null

if ((Test-Path $runtime) -and -not (Test-Path (Join-Path $runtime ".git"))) {
  throw "jev-mcp installer: $runtime exists but is not a jev-mcp Git checkout."
}

if (-not (Test-Path (Join-Path $runtime ".git"))) {
  Write-Host "Installing jev-mcp runtime into $runtime"
  & git clone --filter=blob:none --no-checkout $repoUrl $runtime
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
  Write-Host "Updating existing jev-mcp runtime in $runtime"
}

& git -C $runtime fetch --prune origin $gitRef
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& git -C $runtime checkout --detach FETCH_HEAD
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Push-Location $runtime
try {
  & npm ci --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  & npm run build
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Pop-Location
}

$previousRuntime = $env:JEV_MCP_RUNTIME_DIR
$env:JEV_MCP_RUNTIME_DIR = $runtime
try {
  $args = @((Join-Path $runtime "dist/cli.js"), "install", $Target)
  if ($SkipKey) { $args += "--skip-key" }
  & node @args
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  $env:JEV_MCP_RUNTIME_DIR = $previousRuntime
}

Write-Host ""
Write-Host "jev-mcp runtime: $runtime"
Write-Host "Restart the configured AI client or start a new session before using Jev."
