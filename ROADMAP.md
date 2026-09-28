# Roadmap

This roadmap is directional, not a promise of dates or features.

## 0.4.x — hardening

- Improve documentation, examples, diagnostics, and privacy guidance.
- Keep the four-tool interface small and conservative.
- Improve automated tests around request construction and error handling.
- Track MCP SDK changes without expanding tool authority.

## 0.5.x — interoperability

Potential areas:

- document tested MCP-host compatibility rather than relying only on protocol
  compatibility;
- add integration-test fixtures that do not require live provider credentials;
- improve observability without exposing state or secrets;
- evaluate a configurable transport layer if the MCP ecosystem makes it useful.

## Toward 1.0

A 1.0 release should require:

- a stable, documented tool contract;
- reliable automated test coverage for request/response behavior;
- explicit compatibility documentation;
- a settled privacy/security model;
- a clear release and deprecation policy.

## Out of scope unless the project direction changes

- making Jev authoritative over the host model;
- using probabilities as sole authorization for destructive work;
- bundling or proxying user API keys through a hosted community service;
- adding file-write, shell-execution, deployment, or other destructive MCP
  capabilities to this server.
