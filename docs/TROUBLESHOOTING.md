# Troubleshooting

## Server does not appear in the MCP host

1. Confirm Node.js is 20+.
2. Run `npm run build`.
3. Confirm the MCP configuration points to the absolute path of
   `dist/index.js`.
4. Restart the MCP host / start a new session.
5. Run `npm run doctor`.

## "TYPESAFE_API_KEY is not set"

Use either:

- the local gitignored `.env` created by `./setup.sh` / `./setup.ps1`; or
- your own process environment.

Do not put a real key in `config.toml`.

## TypeSafe API error 401 / 403

Likely causes include an invalid, expired, revoked, or unauthorized provider
credential. Rotate/recreate the credential in the provider account if needed.

Never paste the credential into a public issue.

## Request timeout

The default timeout is 15 seconds.

You can override it:

```text
TYPESAFE_TIMEOUT_MS=30000
```

Allowed range: 250–120000 ms.

A larger timeout does not fix invalid credentials or network policy blocks.

## MCP protocol errors / malformed output

The server reserves stdout for MCP protocol traffic and writes lifecycle
diagnostics to stderr. If you modify the server, avoid `console.log` in the
runtime path.

## Jev is being called too often

Keep the conservative policy:

- use Jev only for bounded decisions;
- prefer deterministic evidence;
- do not use Jev for routine file reads, formatting, tests, compiler errors, or
  obvious choices.

For Codex, consider merging
`codex/AGENTS.jev-conservative.md` into your existing global instructions.

## Jev disagrees with the host model

Re-inspect the evidence. Do not treat the probability as proof.

For consequential operations, unresolved disagreement should lead to a
reversible path, stronger evidence, or human review rather than automatic
execution.

## Need to report a bug

Use the GitHub bug-report form with synthetic/redacted reproduction details.
Do not attach `.env`, credentials, customer data, private source code, or raw
production logs containing secrets.

Security issues should follow [../SECURITY.md](../SECURITY.md).
