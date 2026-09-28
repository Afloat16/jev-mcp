# Supported AI clients

The one-click installer currently targets the following MCP clients.

| Target | Installer ID | Scope | Method |
| --- | --- | --- | --- |
| OpenAI Codex CLI + IDE extension | `codex` | user | official `codex mcp` CLI |
| Anthropic Claude Code | `claude-code` | user | official `claude mcp` CLI |
| Kimi Code | `kimi` | user | `~/.kimi-code/mcp.json` |
| ZCode | `zcode` | user | `~/.zcode/cli/config.json` |
| Cursor | `cursor` | user | `~/.cursor/mcp.json` |
| Gemini CLI | `gemini` | user | `~/.gemini/settings.json` |
| Windsurf / compatible Devin Desktop migration | `windsurf` | user | Windsurf MCP config |
| Generic agents config | `agents` | user | `~/.agents/mcp.json` |
| VS Code / Copilot Agent | `vscode` | project | `.vscode/mcp.json` |

## Design rules

The installer:

- never embeds the TypeSafe API key in an AI client's MCP config;
- writes the key only to the local jev-mcp credential file unless `--skip-key`
  is used;
- backs up existing JSON configuration before modification;
- preserves unrelated keys in existing JSON configuration;
- uses the client CLI where that is the safer documented integration path;
- uses a Windows `cmd /c npx ...` wrapper for local stdio startup when needed;
- never sends a TypeSafe API request during installation.

## New client requests

When adding another client, prefer in this order:

1. an official client CLI for MCP registration;
2. an officially documented user-level configuration file;
3. an industry-standard generic MCP file;
4. a clearly labeled compatibility path when no first-party mechanism exists.

Every new target should include a no-secret unit test and documentation link.
