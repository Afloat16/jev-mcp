# Security policy

## Supported versions

Security fixes are applied to the latest `0.4.x` release line. Older local
archives are not maintained once a newer patch release is available.

## Report a vulnerability

Prefer GitHub **Private vulnerability reporting** (Security → Advisories →
Report a vulnerability) once it is enabled for the repository.

If private reporting is not available, do **not** post credentials, exploit
payloads, or sensitive repository data in a public issue. Open a minimal issue
asking the maintainer to establish a private contact channel.

## Secrets

Never commit a TypeSafe API key. This repository intentionally ignores `.env`
and ships only `.env.example`.

If a key is ever pasted into a chat, issue, commit, CI log, screenshot, or
other shared surface, treat it as exposed and rotate/revoke it at the provider.
Removing it from the latest commit is not sufficient if it remains in Git
history.

Run before publishing:

```bash
npm run secrets:check
```

The scanner is a guardrail, not a complete secret-detection system.

## Trust boundary

`jev-mcp` sends the `state` supplied to a Jev tool to the configured TypeSafe
API endpoint. Do not send secrets, credentials, customer data, regulated data,
or unrelated proprietary code.

See `docs/SECURITY-MODEL.md` for the full threat model.
