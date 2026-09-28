# Installation

`jev-mcp` can be installed into supported AI coding clients without cloning
this repository or manually editing MCP configuration.

## Prerequisites

- Node.js 20+ with `npm` / `npx`
- a TypeSafe API key / applicable TypeSafe access and credits
- the target AI client installed when the installer uses that client's CLI

The first install prompts for the TypeSafe API key with hidden terminal input
and stores it at:

```text
~/.jev-mcp/.env
```

On POSIX systems the installer attempts to use mode `0600`. The key is **not**
written into Codex, Claude Code, Cursor, Kimi, ZCode, Gemini, Windsurf, VS Code,
or generic MCP configuration.

Existing JSON configuration files are preserved and backed up to a sibling
`.jev-mcp.bak` file before modification.

## One-command installation

Use the same command on macOS, Linux, and Windows PowerShell:

### Codex

```bash
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp install codex
```

The installer uses `codex mcp add`. Codex CLI and the Codex IDE extension
share MCP configuration, so this configures both surfaces.

### Claude Code

```bash
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp install claude-code
```

The server is added at Claude Code user scope.

### Kimi Code

```bash
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp install kimi
```

This updates `~/.kimi-code/mcp.json` and enables deferred MCP loading so the
tools can be loaded on demand.

### ZCode

```bash
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp install zcode
```

This updates ZCode's user-level `~/.zcode/cli/config.json`.

### Cursor

```bash
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp install cursor
```

This updates `~/.cursor/mcp.json`.

If you prefer Cursor's official deeplink flow, configure the local credential
once:

```bash
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp setup
```

Then use:

[Add Jev MCP to Cursor](cursor://anysphere.cursor-deeplink/mcp/install?name=jev&config=eyJqZXYiOnsidHlwZSI6InN0ZGlvIiwiY29tbWFuZCI6Im5weCIsImFyZ3MiOlsiLXkiLCItLXBhY2thZ2U9Z2l0aHViOkFmbG9hdDE2L2pldi1tY3AjbWFpbiIsImpldi1tY3AiLCJzZXJ2ZXIiXX19)

### Gemini CLI

```bash
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp install gemini
```

This updates `~/.gemini/settings.json`.

### Windsurf / Devin Desktop compatible config

```bash
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp install windsurf
```

This writes the MCP entry to the Windsurf-compatible user configuration at
`~/.codeium/windsurf/mcp_config.json`. Existing installations that retain
this configuration layout can use the server after restart.

### Generic `.agents`

```bash
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp install agents
```

This updates `~/.agents/mcp.json`. ZCode can use/import this industry-style
configuration when its native MCP configuration does not override it.

### VS Code / GitHub Copilot Agent mode

Run from the project that should receive the MCP server:

```bash
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp install vscode
```

This updates the project-level `.vscode/mcp.json`.

## Configure every detected client

```bash
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp install all
```

`all` configures detected user-level clients and the generic `.agents`
configuration. It intentionally skips the VS Code target because that target is
workspace-scoped; run `install vscode` explicitly from the desired project.

## Credential-only setup

```bash
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp setup
```

Rotate/replace the locally stored key:

```bash
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp setup --reset
```

If `TYPESAFE_API_KEY` is already present in the environment, the installer can
persist that value locally without printing it.

For an environment-managed credential where you do not want the installer to
create `~/.jev-mcp/.env`, use:

```bash
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp install codex --skip-key
```

The MCP subprocess must then receive `TYPESAFE_API_KEY` through its environment.

## Uninstall

Remove one client integration:

```bash
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp uninstall cursor
```

Remove all supported user-level integrations:

```bash
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp uninstall all
```

Uninstalling client configuration intentionally leaves the locally stored
TypeSafe credential untouched. Remove it separately:

```bash
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp forget-key
```

## How the launcher works

Installed clients start Jev through npm's remote-package execution:

```text
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp server
```

npm supports GitHub repositories as package specs. The repository exposes a
`jev-mcp` binary and builds its TypeScript during Git-based package
installation.

The repository currently tracks `main` because the project remains pre-1.0.
A future stable release can replace `#main` with a version tag.

## Official client behavior referenced by the installer

- Codex supports local stdio MCP servers through `codex mcp add ... -- <command>`.
- Claude Code supports local stdio servers and user scope through `claude mcp add`.
- Kimi Code uses user-level `~/.kimi-code/mcp.json` and supports deferred tools.
- ZCode uses `~/.zcode/cli/config.json` and can import MCP servers from Codex,
  Claude Code, OpenCode, and generic `.agents`.
- Cursor uses `~/.cursor/mcp.json` and supports MCP install deeplinks.
- Gemini CLI uses `~/.gemini/settings.json` and its `mcpServers` object.

Because client configuration formats can evolve, the installer is covered by CI
and should be updated when upstream client documentation changes.
