# Changelog

All notable project changes are documented here.

## Unreleased

- Added cross-platform bootstrap installers that create/update a durable local
  runtime at `~/.jev-mcp/runtime` instead of relying on npm Git-package
  execution at every MCP startup.
- Added one-command setup for Codex, Claude Code, Kimi Code, ZCode, Cursor,
  Gemini CLI, Windsurf-compatible config, generic `.agents`, and
  project-scoped VS Code MCP configuration.
- Added a user-level `~/.jev-mcp/.env` credential store so GUI clients do not
  need API keys embedded in MCP configuration.
- Added safe JSON config merging with local backups and absolute local
  Node/runtime launch paths.
- Added installer unit tests, Linux/Windows bootstrap smoke checks, CLI smoke
  checks, and dedicated client/install documentation.

- Redesigned the English and Chinese project homepages around quick onboarding,
  tool boundaries, privacy, and a clear host-model/Jev authority model.
- Added quick-start, FAQ, troubleshooting, examples, support, governance,
  roadmap, and CODEOWNERS documentation.
- Added Markdown/repository consistency checks and strengthened secret/privacy
  scanning to catch common credential patterns and accidental local home paths.
- Upgraded first-party GitHub Actions used by CI/release workflows to current
  major versions.
- Added a CI-generated npm lockfile and switched CI, release, setup, and
  publishing flows to reproducible `npm ci` installs.
- Added safer issue routing and a structured usage-question template to reduce
  accidental disclosure of secrets or sensitive project data.

## 0.4.1 — Open-source hardening

- Prepared the project for public GitHub release under the MIT license.
- Generalized server wording from Codex-specific model names to the active MCP
  host model while retaining Codex configuration examples.
- Added request timeout support via `TYPESAFE_TIMEOUT_MS` (default 15 seconds).
- Added pure core helpers and unit tests for env parsing, URL normalization,
  timeout validation, choice criteria, and advisory metadata.
- Added `npm run doctor` and tracked-file secret scanning.
- Added GitHub CI, release automation, Dependabot, issue forms, and PR template.
- Added `SECURITY.md`, threat model, architecture, contribution guidance,
  community guidelines, NOTICE, publishing scripts, and Chinese README.
- Kept npm publishing disabled (`private: true`) to avoid accidental package
  publication; releases are GitHub source releases.

## 0.4.0 — Conservative

- Reframed Jev from an autonomous co-decider to a **secondary advisory signal** under the active host model.
- Added an explicit authority order: deterministic evidence > repository-aware host-model reasoning > Jev.
- Added **host model first, Jev second** guidance: inspect context and form a preliminary judgment when practical before calling Jev.
- Added guidance to keep the primary model's preliminary conclusion out of Jev `state` when possible so Jev remains a more independent second opinion.
- Added disagreement protection: never mechanically follow Jev when it conflicts with evidence or a well-supported primary-model judgment.
- Added a high-risk disagreement guard for destructive, irreversible, production, security, authorization, and data-loss-sensitive actions.
- Added a local `jev_mcp_advisory` object to every successful Jev tool result, reinforcing that the result is secondary and deterministic evidence overrides it.
- Tightened all four tool descriptions to reduce unnecessary calls.
- Preserved tool names, MCP configuration, `.env` handling, and TypeSafe API configuration from v0.3.

## 0.3.0

- Expanded MCP server-level `instructions` so the active model can decide autonomously when Jev is useful without asking the user first.
- Added explicit guidance to prefer zero Jev calls for routine/deterministic work.
- Added high-risk categories where `jev_risk_score` is preferred when risk is not already obvious.
- Clarified that complexity alone is not a reason to call Jev and that `jev_route` never switches the user-selected model.
- Added MCP tool annotations (`readOnlyHint: true`, `openWorldHint: true`) to all Jev tools.
- Strengthened each tool description so model-side tool selection is more reliable.
- Added a ready-to-copy global Codex policy snippet.
- Preserved the v0.2 local `.env` secret-loading design; no API key is stored in client config or project source.
