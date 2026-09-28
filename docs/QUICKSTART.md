# Quick start

The fastest path is the one-command installer. It downloads the package from
GitHub through npm, configures the selected MCP client, and stores the TypeSafe
credential outside the client config.

## 1. Requirements

- Node.js 20+ with npm/npx
- a TypeSafe API key / applicable TypeSafe access and credits
- the target AI client

Check Node:

```bash
node --version
```

## 2. Install into your client

Example for Codex:

```bash
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp install codex
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

Or configure every detected user-level client:

```bash
npx -y --package=github:Afloat16/jev-mcp#main jev-mcp install all
```

The first install asks for the TypeSafe API key using hidden terminal input.
It is stored in:

```text
~/.jev-mcp/.env
```

The key is not placed in the target client's MCP configuration.

See [INSTALLATION.md](INSTALLATION.md) for platform-specific details.

## 3. Restart the AI client

MCP tool discovery normally happens when a new client/session starts. Restart
the client or open a new session after installation.

## 4. Start with a safe synthetic test

Ask the host model to get a second opinion on a bounded decision such as:

```text
retry / rollback / escalate
```

Do not use production secrets or customer data as test input.

Examples are available in [../examples/README.md](../examples/README.md).

## 5. Trust model

Jev remains advisory:

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

If you are contributing to the project or want a pinned local checkout:

```bash
git clone https://github.com/Afloat16/jev-mcp.git
cd jev-mcp
./setup.sh
```

On Windows PowerShell use `./setup.ps1`.
