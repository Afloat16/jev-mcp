# Architecture

`jev-mcp` is a local stdio MCP server. The MCP host launches the Node.js
process and discovers four read-only, open-world decision tools.

```text
MCP host / coding agent
        |
        | stdio MCP
        v
     jev-mcp
        |
        | HTTPS + Bearer token
        v
TypeSafe AI System One API
```

## Tools

- `jev_decide` — choice among 2–255 explicit alternatives.
- `jev_route` — workflow/tool/subsystem routing among explicit candidates.
- `jev_risk_score` — low/medium/high/critical risk second opinion.
- `jev_gate` — atomic yes/no probability compared with a caller-provided
  threshold.

## Authority model

The server embeds conservative instructions in MCP metadata and adds a local
`jev_mcp_advisory` object to successful responses.

```text
Deterministic evidence
        >
Host-model repository-aware reasoning
        >
Jev probabilistic advice
```

The metadata is a behavioral control, not a formal safety boundary.

## Runtime

The server uses the MCP TypeScript v2 server package and `serveStdio(factory)`.
stdout is exclusively protocol traffic. Human-readable lifecycle messages use
stderr.

## Configuration

The server loads `.env` next to the project by default. Existing process
environment variables take precedence. Set `JEV_ENV_FILE` to point elsewhere.

Network requests time out after 15 seconds by default. Override with
`TYPESAFE_TIMEOUT_MS` (250–120000 ms).
