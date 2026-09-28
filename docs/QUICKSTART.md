# Quick start

The fastest path is the bootstrap installer. It creates a managed local runtime,
configures the selected MCP client, and keeps the TypeSafe credential outside
client configuration.

## 1. Requirements

- Node.js 20+
- Git
- npm
- a TypeSafe API key / applicable TypeSafe access and credits
- the target AI client

## 2. Install

Codex on macOS/Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/Afloat16/jev-mcp/main/scripts/install.sh | bash -s -- codex
```

Codex on Windows PowerShell:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/Afloat16/jev-mcp/main/scripts/install.ps1))) -Target codex
```

Other target IDs:

```text
claude-code
kimi
zcode
cursor
gemini
windsurf
agents
vscode
```

Configure every detected user-level client on macOS/Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/Afloat16/jev-mcp/main/scripts/install.sh | bash
```

The installer creates:

```text
~/.jev-mcp/runtime   # managed local runtime
~/.jev-mcp/.env      # local credential file
```

The API key is entered with hidden input and is not placed in the target
client's MCP configuration.

See [INSTALLATION.md](INSTALLATION.md) for all clients and lifecycle commands.

## 3. Restart the AI client

MCP tool discovery normally happens at client/session startup. Restart the
client or open a new session after installation.

## 4. Safe first test

Use synthetic state and ask the host model for a second opinion on a bounded
decision such as:

```text
retry / rollback / escalate
```

Do not use production secrets or customer data as test input.

## 5. Trust model

```text
deterministic evidence
        >
host-model repository-aware reasoning
        >
Jev probabilistic advice
```

Anything placed in Jev `state` is sent to the configured TypeSafe API
endpoint. Read [SECURITY-MODEL.md](SECURITY-MODEL.md) before using the tool with
sensitive projects.

## Source checkout alternative

```bash
git clone https://github.com/Afloat16/jev-mcp.git
cd jev-mcp
./setup.sh
```

On Windows PowerShell use `./setup.ps1`.
