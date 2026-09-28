# Supported AI clients

The installer targets common MCP-capable coding agents while keeping the
TypeSafe credential outside every client config.

| Client | Installer ID | Scope | Integration |
| --- | --- | --- | --- |
| OpenAI Codex CLI + IDE extension | `codex` | user | official `codex mcp` CLI |
| Anthropic Claude Code | `claude-code` | user | official `claude mcp` CLI |
| Kimi Code | `kimi` | user | `~/.kimi-code/mcp.json` |
| ZCode | `zcode` | user | `~/.zcode/cli/config.json` |
| Cursor | `cursor` | user | `~/.cursor/mcp.json` |
| Gemini CLI | `gemini` | user | `~/.gemini/settings.json` |
| Windsurf-compatible config | `windsurf` | user | Windsurf MCP config |
| Generic agents config | `agents` | user | `~/.agents/mcp.json` |
| VS Code / Copilot Agent | `vscode` | project | `.vscode/mcp.json` |

## Shared runtime model

All configured clients point to the same managed local runtime:

```text
~/.jev-mcp/runtime
```

and the same local credential store:

```text
~/.jev-mcp/.env
```

This has three advantages:

- no API key is duplicated into multiple AI configuration files;
- clients do not need network access just to start the MCP server;
- rerunning the bootstrap updates one shared runtime for every configured
  client.

## Design rules

The installer:

- never embeds the TypeSafe API key in an AI client's MCP config;
- backs up existing JSON configuration before modification;
- preserves unrelated keys in existing JSON configuration;
- uses an official client CLI when that is the safer documented path;
- uses absolute local Node/runtime paths for stable stdio startup;
- never sends a TypeSafe API request during installation;
- configures Kimi for deferred Jev tool loading.

## New client requests

When adding another client, prefer in this order:

1. an official client CLI for MCP registration;
2. an officially documented user-level configuration file;
3. an industry-standard generic MCP file;
4. a clearly labeled compatibility path when no first-party mechanism exists.

Every new target should include installer tests, a bootstrap smoke test where
practical, and a check that no credential is written to client config.
