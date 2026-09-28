# FAQ

## Does jev-mcp make the host model smarter?

Not directly. It adds a structured probabilistic decision tool. The host model
still performs the primary reasoning, coding, planning, and final decision.

## Should Jev run on every prompt?

No. Most coding steps should use zero Jev calls. Jev is most useful when a
decision is bounded, uncertainty remains after inspection, and the answer could
materially change the next action.

## What wins if Jev disagrees with tests or compiler output?

Deterministic evidence wins.

## What wins if Jev disagrees with the host model?

The host should re-inspect the relevant evidence instead of mechanically
following either answer. For destructive, irreversible, production, security,
authorization, or data-loss-sensitive work, unresolved disagreement should not
authorize the action.

## Does the MCP switch my selected Codex model?

No. `jev_route` routes among explicit workflow/tool candidates. It does not
change the host model selected by the user.

## Does the API key get sent to the host model?

The server reads the key from its local process environment or a local
credential file. The one-command installer stores the shared key in
`~/.jev-mcp/.env` and does not place it in AI client MCP configuration. The
server uses the key only as the Authorization header for the configured API
request; tool output does not intentionally include the credential.

Do not put credentials into tool `state`, prompts, screenshots, logs, issues,
or examples.

## What data leaves my machine?

The contents supplied to a Jev tool's `state`, plus the decision question and
criteria required for that call, are sent to the configured TypeSafe API
endpoint.

See [SECURITY-MODEL.md](SECURITY-MODEL.md).

## Why is npm publishing disabled?

The repository currently distributes source through GitHub rather than as a
published npm package. `"private": true` reduces the chance of accidental
`npm publish`.

## Why is the project pre-1.0?

The MCP tool interface is small, but host behavior, Jev integration patterns,
and ecosystem conventions may still evolve. Breaking behavior should be
documented in the changelog and migration notes.

## TypeSafe skill or this MCP?

Use the skill when you mainly want the agent to understand Jev concepts and
recommended patterns. Use the MCP when you want a stable executable tool
boundary, structured output, or repeatable workflow integration.

## Can I point TYPESAFE_BASE_URL somewhere else?

Yes, but treat that as a security-sensitive configuration change. The API key
and tool state are sent to the configured endpoint.

## Is the built-in secret scanner enough?

No. It checks several common token/key patterns and accidental env-file
tracking. It is a guardrail, not a complete DLP or secret-detection product.
