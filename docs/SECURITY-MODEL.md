# Security and privacy model

## What this server can do

The MCP tools are annotated read-only and do not modify files, execute shell
commands, deploy infrastructure, or change the host model. They make outbound
HTTP requests to the configured TypeSafe API endpoint and return the response
to the MCP host.

## Primary risks

### Data disclosure

Anything placed in `state` leaves the local machine. The server cannot know
whether arbitrary text contains proprietary or regulated data. Its privacy
instructions are guidance, not DLP.

Mitigation: send only a minimal redacted decision summary. Do not include
credentials, source dumps, customer records, private keys, tokens, or unrelated
code.

### Probabilistic error

Type-safe output is not the same as a correct decision. Jev can be wrong.

Mitigation: the host model retains final authority; deterministic evidence
wins; unresolved high-risk disagreement must not authorize consequential work.

### Endpoint substitution

`TYPESAFE_BASE_URL` is configurable. A malicious or mistaken value can route
state and credentials to another server.

Mitigation: leave the default unchanged unless you intentionally control the
alternate endpoint. Review environment configuration before use.

### Credential exposure

The API key is read locally from `.env` or the process environment and sent as
a Bearer token to the configured endpoint.

Mitigation: `.env` is ignored by Git; setup scripts do not print the key; the
repository includes a tracked-file secret scanner. Rotate any key that has
appeared in a shared surface or Git history.

### Dependency / supply-chain risk

The project depends on npm packages and GitHub Actions.

Mitigation: Dependabot is configured for npm and GitHub Actions. Review lockfile
and dependency updates before merging. This repository currently avoids
third-party release actions.

## Non-goals

This project is not a sandbox, secrets manager, DLP system, policy engine, or
formal verification system. MCP tool annotations are descriptive hints, not a
security perimeter.
