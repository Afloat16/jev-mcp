param(
  [string]$RepoName = "jev-mcp",
  [ValidateSet("public", "private")][string]$Visibility = "public"
)

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "git is required." }
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw "GitHub CLI (gh) is required. Install it, then run: gh auth login" }
& gh auth status | Out-Null
if ($LASTEXITCODE -ne 0) { throw "GitHub CLI is not authenticated. Run: gh auth login" }

$userName = & git config user.name
$userEmail = & git config user.email
if ([string]::IsNullOrWhiteSpace($userName) -or [string]::IsNullOrWhiteSpace($userEmail)) {
  throw "Git identity is not configured. Set git config user.name and user.email first."
}

if (-not (Test-Path .git)) { & git init -b main }
& npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& git add .
& npm run secrets:check
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& npm run check
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& git diff --cached --quiet
if ($LASTEXITCODE -ne 0) { & git commit -m "chore: prepare jev-mcp for open source" }

& git remote get-url origin *> $null
if ($LASTEXITCODE -ne 0) {
  $visibilityFlag = if ($Visibility -eq "public") { "--public" } else { "--private" }
  & gh repo create $RepoName $visibilityFlag --source=. --remote=origin --push --description "Unofficial conservative MCP server for TypeSafe AI Jev"
} else {
  & git push -u origin main
}

$repoFull = & gh repo view --json nameWithOwner --jq .nameWithOwner
& node scripts/set-repo-metadata.mjs $repoFull
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& npm install --package-lock-only --ignore-scripts --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& git add package.json package-lock.json
& git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  & git commit -m "chore: add GitHub repository metadata"
  & git push origin main
}

$pkg = Get-Content package.json -Raw | ConvertFrom-Json
$tag = "v$($pkg.version)"
& git rev-parse $tag *> $null
if ($LASTEXITCODE -ne 0) {
  & git tag -a $tag -m "jev-mcp $tag"
  & git push origin $tag
  Write-Host "Pushed $tag. The release workflow will create GitHub Release assets."
} else {
  Write-Host "Tag $tag already exists; skipped tagging."
}
& gh repo edit --enable-issues=true --enable-wiki=false --delete-branch-on-merge=true --enable-secret-scanning=true --enable-secret-scanning-push-protection=true --add-topic mcp --add-topic model-context-protocol --add-topic typesafe-ai --add-topic jev
& gh api -X PUT "repos/$repoFull/vulnerability-alerts" *> $null
if ($Visibility -eq "public") {
  & gh api -X PUT "repos/$repoFull/private-vulnerability-reporting" *> $null
}
Write-Host ""
Write-Host "Repository: $(& gh repo view --json url --jq .url)"
Write-Host "Automated where permitted: issues on, wiki off, delete-branch-on-merge, security scanning/push protection, topics, and public-repo private vulnerability reporting."
Write-Host "Optional manual hardening: add a main-branch ruleset requiring the CI check before merge."
