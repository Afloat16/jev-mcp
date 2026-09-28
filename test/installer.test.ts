import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";

import {
  SERVER_NAME,
  genericMcpEntry,
  jsonConfigForTarget,
  serverLauncher,
} from "../src/installer.js";

const runtime = resolve("/tmp", "jev-mcp-runtime");
const nodeExecutable = resolve("/opt", "node", "bin", "node");

test("launcher uses a durable local runtime and explicit Node executable", () => {
  const launcher = serverLauncher(runtime, nodeExecutable);
  assert.equal(launcher.command, nodeExecutable);
  assert.deepEqual(launcher.args, [resolve(runtime, "dist", "cli.js"), "server"]);
});

test("generic MCP entry never contains a TypeSafe API key", () => {
  const entry = JSON.stringify(genericMcpEntry(runtime, nodeExecutable));
  assert.match(entry, /dist/);
  assert.match(entry, /cli\.js/);
  assert.doesNotMatch(entry, /TYPESAFE_API_KEY/);
  assert.doesNotMatch(entry, /apikey_/);
});

test("Kimi configuration uses deferred loading", () => {
  const config = jsonConfigForTarget("kimi", runtime, nodeExecutable);
  assert.deepEqual(config.keyPath, ["mcpServers", SERVER_NAME]);
  assert.equal(config.value.deferred, true);
});

test("ZCode configuration uses its native user-level MCP nesting", () => {
  const config = jsonConfigForTarget("zcode", runtime, nodeExecutable);
  assert.deepEqual(config.keyPath, ["mcp", "servers", SERVER_NAME]);
});

test("Cursor config uses stdio and the durable runtime", () => {
  const config = jsonConfigForTarget("cursor", runtime, nodeExecutable);
  assert.deepEqual(config.keyPath, ["mcpServers", SERVER_NAME]);
  assert.equal(config.value.command, nodeExecutable);
  assert.deepEqual(config.value.args, [resolve(runtime, "dist", "cli.js"), "server"]);
  assert.doesNotMatch(JSON.stringify(config.value), /TYPESAFE_API_KEY/);
});

test("VS Code configuration is workspace-scoped", () => {
  const config = jsonConfigForTarget("vscode", runtime, nodeExecutable);
  assert.deepEqual(config.keyPath, ["servers", SERVER_NAME]);
  assert.match(config.path, /\.vscode[\\/]mcp\.json$/);
});
