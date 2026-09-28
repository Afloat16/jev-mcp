# Installation

`jev-mcp` provides a bootstrap installer for major MCP-capable AI coding
clients. Users do not need to clone this repository or manually edit JSON/TOML.

## Prerequisites

- Node.js 20+
- Git
- npm (bundled with Node.js)
- a TypeSafe API key / applicable TypeSafe access and credits

The runtime is installed to:

```text
~/.jev-mcp/runtime
```

The TypeSafe credential is stored separately at:

```text
~/.jev-mcp/.env
```

The key is entered with hidden terminal input and is **not** written into the
AI client's MCP configuration.

Existing JSON client configs are backed up to a sibling `.jev-mcp.bak` before
they are changed.

## macOS / Linux

### Codex

```bash
curl -fsSL https://raw.githubusercontent.com/Afloat16/jev-mcp/v0.5.0/scripts/install.sh | bash -s -- codex
```

### Claude Code

```bash
curl -fsSL https://raw.githubusercontent.com/Afloat16/jev-mcp/v0.5.0/scripts/install.sh | bash -s -- claude-code
```

### Kimi Code

```bash
curl -fsSL https://raw.githubusercontent.com/Afloat16/jev-mcp/v0.5.0/scripts/install.sh | bash -s -- kimi
```

### ZCode

```bash
curl -fsSL https://raw.githubusercontent.com/Afloat16/jev-mcp/v0.5.0/scripts/install.sh | bash -s -- zcode
```

### Cursor

```bash
curl -fsSL https://raw.githubusercontent.com/Afloat16/jev-mcp/v0.5.0/scripts/install.sh | bash -s -- cursor
```

### Gemini CLI

```bash
curl -fsSL https://raw.githubusercontent.com/Afloat16/jev-mcp/v0.5.0/scripts/install.sh | bash -s -- gemini
```

### All detected user-level clients

```bash
curl -fsSL https://raw.githubusercontent.com/Afloat16/jev-mcp/v0.5.0/scripts/install.sh | bash
```

The `all` flow intentionally skips the project-scoped VS Code target. Run the
installer with `vscode` from the project that should receive `.vscode/mcp.json`.

## Windows PowerShell

### Codex

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/Afloat16/jev-mcp/v0.5.0/scripts/install.ps1))) -Target codex
```

Replace `codex` with `claude-code`, `kimi`, `zcode`, `cursor`,
`gemini`, `windsurf`, `agents`, or `vscode`.

Configure all detected user-level clients:

```powershell
irm https://raw.githubusercontent.com/Afloat16/jev-mcp/v0.5.0/scripts/install.ps1 | iex
```

## What the bootstrap does

1. verifies Git, Node.js 20+, and npm;
2. installs or updates a managed checkout at `~/.jev-mcp/runtime`;
3. performs a locked `npm ci` install and TypeScript build;
4. prompts for the TypeSafe key with hidden input when no local key exists;
5. stores that key only in `~/.jev-mcp/.env`;
6. configures the selected AI client to launch the local runtime directly.

Client configs therefore use a durable command equivalent to:

```text
<absolute node executable> ~/.jev-mcp/runtime/dist/cli.js server
```

They do not depend on npm/GitHub every time the AI starts.

Rerunning the same bootstrap command updates the managed runtime and refreshes
the client configuration.

## Supported targets

| Client | Target | Configuration method |
| --- | --- | --- |
| OpenAI Codex CLI + IDE extension | `codex` | `codex mcp add` |
| Anthropic Claude Code | `claude-code` | `claude mcp add --scope user` |
| Kimi Code | `kimi` | `~/.kimi-code/mcp.json` |
| ZCode | `zcode` | `~/.zcode/cli/config.json` |
| Cursor | `cursor` | `~/.cursor/mcp.json` |
| Gemini CLI | `gemini` | `~/.gemini/settings.json` |
| Windsurf-compatible MCP config | `windsurf` | `~/.codeium/windsurf/mcp_config.json` |
| Generic agents config | `agents` | `~/.agents/mcp.json` |
| VS Code / Copilot Agent workspace | `vscode` | `.vscode/mcp.json` |

Kimi is configured with deferred MCP loading so Jev tools can be loaded on
demand.

## Environment-managed credentials

If you intentionally manage `TYPESAFE_API_KEY` outside jev-mcp, skip local
credential creation:

```bash
curl -fsSL https://raw.githubusercontent.com/Afloat16/jev-mcp/v0.5.0/scripts/install.sh | bash -s -- codex --skip-key
```

The MCP process must then inherit `TYPESAFE_API_KEY` from its environment.

## Updating

Rerun the installer:

```bash
curl -fsSL https://raw.githubusercontent.com/Afloat16/jev-mcp/v0.5.0/scripts/install.sh | bash -s -- codex
```

The managed runtime is fetched again and checked out to the configured ref. By default that ref is the stable `v0.5.0` tag.

## Uninstalling a client integration

After installation:

```bash
node ~/.jev-mcp/runtime/dist/cli.js uninstall cursor
```

Remove all supported user-level integrations:

```bash
node ~/.jev-mcp/runtime/dist/cli.js uninstall all
```

Removing client configuration does not delete the TypeSafe credential. To
remove the locally stored credential:

```bash
node ~/.jev-mcp/runtime/dist/cli.js forget-key
```

On Windows use the corresponding path under `$HOME\.jev-mcp\runtime`.

## Security notes

Downloading and executing a remote install script is convenient but carries
normal supply-chain risk. Users who prefer to inspect everything first should
download the script or clone the repository, review it, and run it locally.

The installer never makes a live Jev API call. Live calls only happen after an
MCP client invokes a Jev tool.

Anything later placed in a Jev tool's `state` is sent to the configured
TypeSafe endpoint. See [SECURITY-MODEL.md](SECURITY-MODEL.md).

## Advanced installer controls

The bootstrap recognizes:

| Variable | Purpose |
| --- | --- |
| `JEV_MCP_CONFIG_HOME` | Override `~/.jev-mcp` |
| `JEV_MCP_RUNTIME_DIR` | Override the managed runtime checkout |
| `JEV_MCP_REPO_URL` | Override the Git repository URL |
| `JEV_MCP_GIT_REF` | Override the fetched branch/tag/ref; default is `v0.5.0` |

These are primarily useful for testing, forks, and pinned deployments.


## Stable vs development channel

The stable bootstrap script and installed runtime are both pinned to the same release tag:

```text
v0.5.0
```

To intentionally follow the development branch:

```bash
curl -fsSL https://raw.githubusercontent.com/Afloat16/jev-mcp/v0.5.0/scripts/install.sh | bash -s -- codex
```

For PowerShell:

```powershell
$env:JEV_MCP_GIT_REF = "main"
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/Afloat16/jev-mcp/main/scripts/install.ps1))) -Target codex
```

Development-channel users should expect behavior to change before the next
tagged release.
