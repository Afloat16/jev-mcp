# jev-mcp

**Unofficial, community-maintained MCP server for TypeSafe AI Jev.**

[简体中文](README.zh-CN.md)

`jev-mcp` exposes TypeSafe AI's Jev decision model to MCP hosts as four
conservative, read-only decision tools. It is designed for workflows where a
host model has already inspected the relevant context and wants a structured,
probabilistic **second opinion** on a bounded decision.

> This project is not affiliated with, endorsed by, sponsored by, or an
> official product of TypeSafe AI or OpenAI.

## What it is — and what it is not

Jev is useful for bounded decisions inside software: classify, route, score,
or gate among predefined outcomes. It is **not** a drop-in replacement for a
strong coding/reasoning model and this MCP does not claim to make that model
"smarter."

The default authority order is intentionally conservative:

```text
Deterministic evidence
        >
Host-model repository-aware reasoning
        >
Jev probabilistic advice
```

If your normal workflow is simply "ask a strong coding model to solve one
problem," TypeSafe's agent skill alone may be the simpler choice. This MCP is
most useful when you specifically want a stable tool boundary, repeatable
structured decisions, explicit probability thresholds, or agent/workflow
orchestration.

## Tools

| Tool | Purpose |
| --- | --- |
| `jev_decide` | Second opinion among 2–255 explicit alternatives |
| `jev_route` | Route among explicit tools/subsystems/workflows |
| `jev_risk_score` | Advisory low / medium / high / critical risk signal |
| `jev_gate` | Atomic yes/no probability compared with a threshold |

All tools are declared read-only. They make an outbound request to TypeSafe's
hosted API; they do not edit files, execute shell commands, deploy anything, or
switch the model selected by the user.

## Conservative behavior

Successful results include local metadata:

```json
{
  "jev_mcp_advisory": {
    "authority": "secondary_advisory",
    "finalDecisionBy": "active_host_model",
    "deterministicEvidenceOverrides": true,
    "doNotTreatProbabilityAsFact": true
  }
}
```

This metadata is added by `jev-mcp`; it is not Jev model output. It is a
behavioral guardrail reminding the host that a probability is not proof or
authorization.

## Requirements

- Node.js 20+
- A TypeSafe API key / applicable TypeSafe access and credits
- An MCP host that can launch a local stdio server

The implementation uses the MCP TypeScript v2 server package and
`serveStdio(factory)`. Diagnostics go to stderr because stdout is reserved for
MCP protocol traffic.

## Install

Clone or extract the repository, then:

### macOS / Linux

```bash
./setup.sh
```

### Windows PowerShell

```powershell
./setup.ps1
```

The setup script:

1. checks Node.js 20+;
2. creates a local `.env` if one does not already exist;
3. reads the API key without echoing it;
4. installs dependencies;
5. runs tests/type-check/build checks.

The API key is never required in MCP client configuration.

## Codex example

Add this to `~/.codex/config.toml` and replace the path:

```toml
[mcp_servers.jev]
command = "node"
args = ["/ABSOLUTE/PATH/TO/jev-mcp/dist/index.js"]
```

Then restart the MCP host / start a new session.

For users who explicitly want Codex to apply the conservative decision policy
across projects, an optional policy snippet is provided at:

```text
codex/AGENTS.jev-conservative.md
```

Merge it into your own `~/.codex/AGENTS.md`; do not overwrite unrelated
instructions.

## Other MCP hosts

The server itself is not Codex-specific. Any host that supports launching a
local stdio MCP server can use:

```text
command: node
args: [/absolute/path/to/jev-mcp/dist/index.js]
```

Host-specific configuration syntax varies.

## Configuration

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `TYPESAFE_API_KEY` | yes | — | TypeSafe credential |
| `JEV_MODEL` | no | `jev-latest` | Jev model override |
| `TYPESAFE_BASE_URL` | no | `https://api.typesafe.ai` | API base URL |
| `TYPESAFE_TIMEOUT_MS` | no | `15000` | Request timeout, 250–120000 ms |
| `JEV_ENV_FILE` | no | project `.env` | Alternate env file path |

Existing process environment variables override values loaded from `.env`.

## Privacy warning

Anything placed in a Jev tool's `state` is sent to the configured TypeSafe API
endpoint. Send only the minimum necessary, preferably redacted state. Do not
send passwords, API keys, access tokens, private keys, customer data,
regulated data, or unrelated proprietary source code.

This guidance is not a DLP boundary. See [Security and privacy model](docs/SECURITY-MODEL.md).

## Verify the installation

Offline configuration check:

```bash
npm run doctor
```

Full local checks (no TypeSafe API call):

```bash
npm run check
```

Interactive MCP inspection:

```bash
npm run inspect
```

A live tool call in MCP Inspector uses your TypeSafe account and may consume
provider credits.

## Development

```bash
npm install
npm run test
npm run typecheck
npm run build
npm run secrets:check
```

See [CONTRIBUTING.md](CONTRIBUTING.md) and [Architecture](docs/ARCHITECTURE.md).

## When the MCP is a good fit

Good candidates include:

- retry vs rollback vs change strategy after an ambiguous failure;
- workflow routing where several explicit paths remain plausible;
- a structured independent risk signal after the host model has inspected the
  relevant change;
- an atomic yes/no gate where a probability threshold affects orchestration;
- repeated decision points in automated agent/CI pipelines.

Usually avoid Jev for:

- open-ended coding, architecture, algorithm design, or explanation;
- questions already settled by tests, compiler diagnostics, runtime evidence,
  static analysis, or direct inspection;
- trivial file edits or routine commands;
- using a probability as sole authorization for destructive, irreversible,
  production, security-sensitive, or data-loss-sensitive work.

## TypeSafe agent skill vs this MCP

They solve different problems:

```text
TypeSafe skill  -> teaches an agent Jev concepts and recommended patterns
jev-mcp         -> provides a stable executable MCP tool boundary
host model      -> remains the primary reasoner and final decision maker
```

For interactive coding, the skill alone can be simpler. For automation,
repeatable tool contracts, or explicit workflow gates, an MCP boundary can be
useful.

## Open-source publishing

This repository includes GitHub CI, release automation, Dependabot, issue/PR
templates, a secret scanner, and one-command publishing scripts.

After configuring Git and GitHub CLI:

```bash
./scripts/publish-github.sh jev-mcp public
```

PowerShell:

```powershell
./scripts/publish-github.ps1 -RepoName jev-mcp -Visibility public
```

See [Releasing](docs/RELEASING.md).

## Security

Read [SECURITY.md](SECURITY.md) before reporting vulnerabilities. Never paste
credentials into public issues or logs.

## License

MIT. See [LICENSE](LICENSE).

The license covers this repository's code only. Third-party services and names
remain subject to their own terms and rights. See [NOTICE](NOTICE).

## References

- TypeSafe AI documentation: https://docs.typesafe.ai/
- TypeSafe AI — Introducing System One Models & Jev: https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Model Context Protocol TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
