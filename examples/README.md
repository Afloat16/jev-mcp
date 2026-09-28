# Examples

These examples are intentionally synthetic. They show the shape of useful
bounded decisions without including real credentials, customer data, or
proprietary source.

## 1. Retry / rollback / escalate

A good `jev_decide` state is compact and evidence-oriented:

```json
{
  "state": {
    "deployment": "canary",
    "error_rate_before": 0.3,
    "error_rate_after": 2.4,
    "rollback_available": true,
    "retry_count": 1,
    "tests": "passed before deployment"
  },
  "question": "Which handling path is the best second opinion given this state?",
  "options": [
    { "id": "retry", "description": "Retry the failed step once" },
    { "id": "rollback", "description": "Roll back the canary" },
    { "id": "escalate", "description": "Stop automation and require review" }
  ]
}
```

The host model should still inspect logs and deployment evidence. The Jev result
is an additional signal, not authorization.

## 2. Risk assessment

```json
{
  "state": {
    "change": "replace session auth with JWT plus refresh tokens",
    "touches_authorization_middleware": true,
    "schema_change": false,
    "rollback_plan": "feature flag",
    "integration_tests": "partial"
  },
  "question": "How risky is this proposed change if executed as described?"
}
```

A high-risk signal should increase scrutiny; a low-risk signal does not remove
the need for tests or review.

## 3. Workflow routing

```json
{
  "state": {
    "failure": "generated client no longer matches API schema",
    "compiler": "type mismatch in generated models",
    "schema_changed": true
  },
  "objective": "Choose the next subsystem to inspect",
  "candidates": [
    { "id": "schema", "description": "Inspect API schema and generator inputs" },
    { "id": "frontend", "description": "Inspect consuming UI code" },
    { "id": "database", "description": "Inspect database migrations" }
  ]
}
```

If compiler output already proves the source of the error, skip Jev and follow
the deterministic evidence instead.

## 4. Atomic gate

```json
{
  "state": {
    "tests": "passed",
    "lint": "passed",
    "diff_size": 18,
    "touches_security_code": false,
    "rollback": "immediate"
  },
  "statement": "This change is suitable for the next automated verification stage.",
  "threshold": 0.85
}
```

A passed gate is advisory. It should not be treated as permission for
irreversible production changes.

## Privacy checklist for examples

Before sending a real state to Jev:

- remove API keys, tokens, passwords, cookies, and private keys;
- replace customer/user identifiers with synthetic labels;
- summarize code rather than dumping unrelated source;
- include only facts that matter to the bounded decision;
- avoid raw production logs if a short redacted summary is enough.
