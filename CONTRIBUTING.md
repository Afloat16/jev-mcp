# Contributing

Thanks for helping improve `jev-mcp`.

## Development setup

Requirements: Node.js 20+ and Git.

```bash
npm install
npm run check
```

`npm run check` runs the repository secret scan, unit tests, TypeScript
type-checking, and a production build. It does not call the TypeSafe API.

For a local MCP session:

```bash
npm run dev
```

For MCP Inspector:

```bash
npm run inspect
```

A live Jev call requires your own `TYPESAFE_API_KEY` and may consume provider
credits.

## Design principles

Changes should preserve these invariants:

1. The host model remains the primary reasoner and final decision maker.
2. Deterministic evidence outranks Jev output.
3. Jev is for bounded probabilistic decisions, not open-ended generation.
4. A Jev result never authorizes destructive or irreversible work by itself.
5. Only minimal, redacted state should be sent to the hosted TypeSafe API.
6. stdout is reserved for MCP protocol traffic; diagnostics go to stderr.
7. No credential is stored in source, Codex configuration examples, tests, or
   documentation.

## Pull requests

Keep PRs focused. Update tests and documentation when behavior changes. Run:

```bash
npm run check
```

before opening the PR.

If a change alters tool semantics, privacy behavior, network behavior, or the
advisory authority model, call it out explicitly in the PR description.
