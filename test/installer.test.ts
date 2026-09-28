import assert from "node:assert/strict";
import test from "node:test";

import {
  PACKAGE_SPEC,
  SERVER_NAME,
  genericMcpEntry,
  jsonConfigForTarget,
  serverLauncher,
} from "../src/installer.js";

test("POSIX launcher uses npx and the GitHub package", () => {
  const launcher = serverLauncher("linux");
  assert.equal(launcher.command, "npx");
  assert.deepEqual(launcher.args, [
    "-y",
    `--package=${PACKAGE_SPEC}`,
    "jev-mcp",
    "server",
  ]);
});

test("Windows launcher wraps npx with cmd", () => {
  const launcher = serverLauncher("win32");
  assert.equal(launcher.command, "cmd");
  assert.deepEqual(launcher.args.slice(0, 4), ["/d", "/s", "/c", "npx"]);
});

test("generic MCP entry never contains a TypeSafe API key", () => {
  const entry = JSON.stringify(genericMcpEntry("linux"));
  assert.match(entry, /jev-mcp/);
  assert.doesNotMatch(entry, /TYPESAFE_API_KEY/);
  assert.doesNotMatch(entry, /apikey_/);
});

test("Kimi configuration uses deferred loading", () => {
  const config = jsonConfigForTarget("kimi", "linux");
  assert.deepEqual(config.keyPath, ["mcpServers", SERVER_NAME]);
  assert.equal(config.value.deferred, true);
});

test("ZCode configuration uses its native user-level MCP nesting", () => {
  const config = jsonConfigForTarget("zcode", "linux");
  assert.deepEqual(config.keyPath, ["mcp", "servers", SERVER_NAME]);
});

test("VS Code configuration is workspace-scoped", () => {
  const config = jsonConfigForTarget("vscode", "linux");
  assert.deepEqual(config.keyPath, ["servers", SERVER_NAME]);
  assert.match(config.path, /\.vscode[\\/]mcp\.json$/);
});
