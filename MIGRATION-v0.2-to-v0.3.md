# Upgrade from v0.2 to v0.3

Your existing `.env` can be kept unchanged. v0.3 does not require a new TypeSafe API key.

## Recommended upgrade

1. Stop/restart any active Codex session after replacing the server files.
2. Back up your existing `jev-mcp/.env`.
3. Replace the v0.2 project files with the v0.3 files. Do not overwrite/delete your existing `.env`.
4. Run:

```bash
npm install
npm run build
```

5. Keep your existing `~/.codex/config.toml` entry if its absolute path to `dist/index.js` did not change.
6. Restart VS Code/Codex so it performs a fresh MCP initialization and receives the v0.3 server instructions.

## Optional but recommended: global Codex policy

If you want the autonomous policy to apply consistently across repositories, merge the contents of:

```text
codex/AGENTS.jev-autonomous.md
```

into:

```text
~/.codex/AGENTS.md
```

Do not blindly overwrite an existing global `AGENTS.md`; merge the section instead.

The MCP server-level instructions already work without this step. The global policy reinforces the same behavior on the Codex side.
