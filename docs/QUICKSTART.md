# Quick start

This guide gets a local `jev-mcp` server running without putting a TypeSafe
credential in your MCP client configuration.

## 1. Requirements

- Node.js 20+
- Git
- a TypeSafe API key / applicable TypeSafe access and credits
- an MCP host that can launch a local stdio server

Check Node:

```bash
node --version
```

## 2. Clone

```bash
git clone https://github.com/Afloat16/jev-mcp.git
cd jev-mcp
```

## 3. Configure the local credential

macOS / Linux:

```bash
./setup.sh
```

Windows PowerShell:

```powershell
./setup.ps1
```

The setup script reads the key without echoing it and, when needed, stores it
in a local `.env` file that is ignored by Git.

Do not paste a real key into README files, `AGENTS.md`, MCP configuration,
issues, screenshots, or shell history.

You may instead provide `TYPESAFE_API_KEY` through your own process
environment. Existing process variables override values in `.env`.

## 4. Verify locally

These checks do not call the TypeSafe API:

```bash
npm run doctor
npm run check
```

Expected result: configuration checks, tests, type checking, and build succeed.

## 5. Configure Codex

Add this to `~/.codex/config.toml` and replace the path:

```toml
[mcp_servers.jev]
command = "node"
args = ["/ABSOLUTE/PATH/TO/jev-mcp/dist/index.js"]
```

Restart Codex / start a new session.

Other MCP clients can use the same executable through their local stdio-server
configuration.

## 6. Start with a safe test

Use a synthetic decision first. For example, ask the host to obtain a second
opinion between:

- retry once;
- roll back;
- escalate for review.

Do not use production data or credentials as test input.

Examples are available in [../examples/README.md](../examples/README.md).

## 7. Understand the trust model

Jev is advisory. The intended priority order is:

```text
deterministic evidence
        >
host-model repository-aware reasoning
        >
Jev probabilistic advice
```

Anything placed in `state` is sent to the configured TypeSafe API endpoint.
Read [SECURITY-MODEL.md](SECURITY-MODEL.md) before using the tool with sensitive
projects.
