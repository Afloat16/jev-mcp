# Migrating jev-mcp v0.3 -> v0.4 Conservative

v0.4 keeps the same four MCP tool names and the same TypeSafe API/environment configuration. The change is primarily behavioral: Jev is now explicitly a secondary advisory signal rather than a peer decision maker.

## Upgrade

1. Back up the existing local `.env`.
2. Replace the v0.3 project files with v0.4 while keeping `.env` in place.
3. Run:

```bash
npm install
npm run build
```

4. If the project path is unchanged, `~/.codex/config.toml` does not need to change.
5. Replace/merge any prior `AGENTS.jev-autonomous.md` policy with `codex/AGENTS.jev-conservative.md`.
6. Restart VS Code/Codex and start a new Codex session so the MCP initialization receives v0.4 server instructions.

## Behavioral differences

- **Astra/Sol first:** inspect context and, when practical, form a preliminary judgment before Jev.
- **Jev second opinion:** Jev is advisory rather than authoritative.
- **Deterministic evidence wins:** compiler/tests/static analysis/runtime evidence override Jev.
- **Disagreement protection:** a conflict triggers re-inspection instead of automatic acceptance of Jev.
- **High-risk conflict guard:** unresolved disagreement cannot authorize destructive/irreversible/production/security/data-loss-sensitive actions.
- **Independent signal:** avoid placing the primary model's preliminary conclusion into Jev `state` when possible, reducing anchoring.
- **Tool outputs are self-labeled:** each Jev result includes a local `jev_mcp_advisory` object reminding the model of the authority policy.

No OpenAI API key is required by this MCP server. Your TypeSafe API key remains in the local gitignored `.env`.
