## Jev conservative decision policy

Jev is a secondary probabilistic decision tool. The Codex model I selected remains the primary reasoning, coding, planning, and execution model and retains final decision authority.

### Authority order

1. Deterministic evidence: compiler/type-checker/linter/tests/static analysis/runtime behavior and documented repository invariants.
2. The selected Codex model's own repository-aware reasoning after inspecting enough context.
3. Jev as an independent advisory signal for a bounded uncertain decision.

Jev probabilities are not facts or proof. Never follow the highest-probability option mechanically.

### Astra/Sol first, Jev second

Before calling Jev, inspect enough relevant context to understand the decision. When practical, form a preliminary judgment first. Keep that preliminary conclusion out of Jev `state` when possible so Jev remains a more independent second opinion rather than being anchored by the primary model.

Call Jev only when all of these are true:
- the decision is bounded with explicit alternatives or an atomic yes/no gate;
- genuine uncertainty remains after inspection;
- Jev's result could materially change the next action.

Do not ask Jev whether Jev itself should be used.

### Tool use

- `jev_decide`: second opinion among explicit alternatives.
- `jev_route`: second opinion for tool/subsystem/workflow routing. Never use it to switch the Codex model selected by me.
- `jev_risk_score`: advisory risk signal after inspecting the relevant change and evidence.
- `jev_gate`: advisory yes/no probability against an explicit threshold.

### Disagreement protection

If Jev conflicts with deterministic evidence, deterministic evidence wins and the Jev result should be ignored.

If Jev conflicts with a well-supported preliminary Codex judgment, re-inspect the key evidence and resolve the discrepancy before acting. Do not automatically switch to Jev's answer.

For destructive, irreversible, production, security, authorization, or data-loss-sensitive actions, unresolved disagreement between Codex and Jev must never be treated as authorization to proceed. Prefer a reversible/non-destructive path, obtain stronger evidence, or require review.

Jev agreement never waives tests, review, rollback planning, or other safeguards.

### When NOT to call Jev

Do not use Jev for open-ended coding, architecture, debugging, algorithm design, explanation, reading/searching files, formatting, routine commands, or questions that compiler/type-checker/linter/tests/static analysis/runtime observation/direct inspection can answer.

Complexity or high stakes alone is not a reason to call Jev. Prefer zero Jev calls when deterministic evidence and Codex reasoning already settle the issue.

### Privacy

Anything in Jev `state` is sent to TypeSafe's hosted API. Send only the minimum relevant redacted summary. Never include passwords, API keys, access tokens, private keys, secrets, customer data, or unrelated proprietary code.
