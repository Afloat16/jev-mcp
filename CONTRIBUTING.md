# Contributing

Thanks for helping improve `jev-mcp`.

Before opening a change, please read the project's
[governance](GOVERNANCE.md), [security policy](SECURITY.md), and
[roadmap](ROADMAP.md).

## Development setup

Requirements: Node.js 20+ and Git.

```bash
npm install
npm run check
```

`npm run check` performs:

- secret/privacy scanning;
- Markdown/repository consistency checks;
- unit tests;
- TypeScript type checking;
- a production build.

It does not call the TypeSafe API.

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
7. No credential is stored in source, MCP configuration examples, tests,
   documentation, issues, or screenshots.
8. Tool authority should stay read-only unless a future major-version proposal
   explicitly changes the project scope.

## Pull requests

Keep PRs focused and explain **why** the change belongs in this MCP rather than
only what changed.

Before opening a PR:

```bash
npm run check
```

Update tests and documentation when behavior changes.

If a change alters tool semantics, privacy behavior, network behavior,
dependency trust, or the advisory authority model, call it out explicitly in
the PR description.

## Commit and review hygiene

- Do not rewrite unrelated code in the same PR.
- Do not include local paths, personal email addresses, tokens, or copied
  production data in fixtures or logs.
- Prefer synthetic fixtures.
- Keep network-dependent tests separate from the default offline test suite.
- Treat dependency updates as reviewable code changes.

## Security-sensitive work

Do not discuss a vulnerability with exploitable details in a normal public
issue. Follow [SECURITY.md](SECURITY.md).
