# Repository instructions for coding agents

This file governs changes to the `jev-mcp` repository itself. User-facing
Codex policy lives in `codex/AGENTS.jev-conservative.md`.

## Before changing code

- Preserve the conservative authority model: deterministic evidence > host
  model reasoning > Jev advice.
- Keep all MCP tools read-only unless a future major design explicitly changes
  that contract.
- Never add real API keys, tokens, credentials, customer data, or proprietary
  source to tests, fixtures, docs, examples, or commits.
- stdout is MCP protocol traffic. Use stderr for server diagnostics.

## Validation

Run before finishing a change:

```bash
npm run check
```

This performs tracked-file secret scanning, unit tests, TypeScript checking,
and a build without making a TypeSafe API request.

## Network/privacy changes

Any change to data sent externally, the default endpoint, credential handling,
or Jev authority semantics requires corresponding updates to README,
`docs/SECURITY-MODEL.md`, and tests where practical.
