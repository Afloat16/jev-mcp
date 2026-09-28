import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { parseEnvFile } from "./core.js";

export const SERVER_NAME = "jev";

export type InstallTarget =
  | "codex"
  | "claude-code"
  | "kimi"
  | "zcode"
  | "cursor"
  | "gemini"
  | "windsurf"
  | "agents"
  | "vscode";

export const INSTALL_TARGETS: InstallTarget[] = [
  "codex",
  "claude-code",
  "kimi",
  "zcode",
  "cursor",
  "gemini",
  "windsurf",
  "agents",
  "vscode",
];

type JsonObject = Record<string, unknown>;

export function configHome(): string {
  return process.env.JEV_MCP_CONFIG_HOME?.trim() || join(homedir(), ".jev-mcp");
}

export function userEnvPath(): string {
  return join(configHome(), ".env");
}

export function runtimeRoot(): string {
  const explicit = process.env.JEV_MCP_RUNTIME_DIR?.trim();
  if (explicit) return resolve(explicit);

  const moduleDir = dirname(fileURLToPath(import.meta.url));
  return resolve(moduleDir, "..");
}

export function serverLauncher(
  runtime = runtimeRoot(),
  nodeExecutable = process.execPath,
): {
  command: string;
  args: string[];
} {
  return {
    command: nodeExecutable,
    args: [resolve(runtime, "dist", "cli.js"), "server"],
  };
}

export function genericMcpEntry(
  runtime = runtimeRoot(),
  nodeExecutable = process.execPath,
): JsonObject {
  return serverLauncher(runtime, nodeExecutable);
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readJson(path: string): JsonObject {
  if (!existsSync(path)) return {};
  const text = readFileSync(path, "utf8").trim();
  if (!text) return {};
  const parsed: unknown = JSON.parse(text);
  if (!isObject(parsed)) {
    throw new Error(`Expected a JSON object in ${path}`);
  }
  return parsed;
}

function atomicWriteJson(path: string, value: JsonObject): void {
  mkdirSync(dirname(path), { recursive: true });
  const temp = `${path}.jev-mcp.tmp-${process.pid}`;
  const backup = `${path}.jev-mcp.bak`;

  if (existsSync(path)) copyFileSync(path, backup);
  writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  renameSync(temp, path);
}

function setNested(root: JsonObject, path: string[], value: unknown): void {
  let current = root;
  for (const key of path.slice(0, -1)) {
    if (!isObject(current[key])) current[key] = {};
    current = current[key] as JsonObject;
  }
  current[path[path.length - 1]] = value;
}

function deleteNested(root: JsonObject, path: string[]): boolean {
  let current = root;
  for (const key of path.slice(0, -1)) {
    if (!isObject(current[key])) return false;
    current = current[key] as JsonObject;
  }
  return delete current[path[path.length - 1]];
}

export function jsonConfigForTarget(
  target: Exclude<InstallTarget, "codex" | "claude-code">,
  runtime = runtimeRoot(),
  nodeExecutable = process.execPath,
): { path: string; keyPath: string[]; value: JsonObject } {
  const home = homedir();
  const base = serverLauncher(runtime, nodeExecutable);

  switch (target) {
    case "kimi":
      return {
        path: join(home, ".kimi-code", "mcp.json"),
        keyPath: ["mcpServers", SERVER_NAME],
        value: {
          ...base,
          deferred: true,
          startupTimeoutMs: 120000,
          toolTimeoutMs: 120000,
        },
      };
    case "zcode":
      return {
        path: join(home, ".zcode", "cli", "config.json"),
        keyPath: ["mcp", "servers", SERVER_NAME],
        value: { ...base, enable: true },
      };
    case "cursor":
      return {
        path: join(home, ".cursor", "mcp.json"),
        keyPath: ["mcpServers", SERVER_NAME],
        value: { type: "stdio", ...base },
      };
    case "gemini":
      return {
        path: join(home, ".gemini", "settings.json"),
        keyPath: ["mcpServers", SERVER_NAME],
        value: { ...base, timeout: 120000 },
      };
    case "windsurf":
      return {
        path: join(home, ".codeium", "windsurf", "mcp_config.json"),
        keyPath: ["mcpServers", SERVER_NAME],
        value: base,
      };
    case "agents":
      return {
        path: join(home, ".agents", "mcp.json"),
        keyPath: ["mcpServers", SERVER_NAME],
        value: base,
      };
    case "vscode":
      return {
        path: resolve(process.cwd(), ".vscode", "mcp.json"),
        keyPath: ["servers", SERVER_NAME],
        value: { type: "stdio", ...base },
      };
  }
}

function commandExists(command: string): boolean {
  const probe =
    process.platform === "win32"
      ? spawnSync("where", [command], { stdio: "ignore" })
      : spawnSync("sh", ["-lc", `command -v ${command}`], { stdio: "ignore" });
  return probe.status === 0;
}

function runCli(
  command: string,
  args: string[],
  options: { ignoreFailure?: boolean } = {},
): boolean {
  const result =
    process.platform === "win32"
      ? spawnSync("cmd", ["/d", "/s", "/c", command, ...args], {
          stdio: options.ignoreFailure ? "ignore" : "inherit",
        })
      : spawnSync(command, args, {
          stdio: options.ignoreFailure ? "ignore" : "inherit",
        });

  if (result.error && !options.ignoreFailure) throw result.error;
  if (result.status !== 0 && !options.ignoreFailure) {
    throw new Error(`${command} exited with status ${result.status ?? "unknown"}`);
  }
  return result.status === 0;
}

async function readSecret(prompt: string): Promise<string> {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    throw new Error(
      "Interactive secret input requires a TTY. Set TYPESAFE_API_KEY in the environment and rerun.",
    );
  }

  process.stdout.write(prompt);
  process.stdin.setEncoding("utf8");
  process.stdin.setRawMode(true);
  process.stdin.resume();

  return await new Promise<string>((resolvePromise, reject) => {
    let value = "";

    const cleanup = () => {
      process.stdin.off("data", onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
    };

    const onData = (chunk: string | Buffer) => {
      const text = String(chunk);
      for (const char of text) {
        if (char === "\u0003") {
          cleanup();
          process.stdout.write("\n");
          reject(new Error("Cancelled."));
          return;
        }

        if (char === "\r" || char === "\n") {
          cleanup();
          process.stdout.write("\n");
          resolvePromise(value);
          return;
        }

        if (char === "\u007f" || char === "\b") {
          value = value.slice(0, -1);
          continue;
        }

        if (char >= " ") value += char;
      }
    };

    process.stdin.on("data", onData);
  });
}

function validateKey(key: string): string {
  const value = key.trim();
  if (!value) throw new Error("TypeSafe API key cannot be empty.");
  if (/\s/.test(value)) throw new Error("TypeSafe API key must not contain whitespace.");
  return value;
}

export async function ensureCredential(options: {
  reset?: boolean;
  skip?: boolean;
} = {}): Promise<string | null> {
  if (options.skip) return null;

  const path = userEnvPath();
  if (!options.reset && existsSync(path)) {
    const parsed = parseEnvFile(readFileSync(path, "utf8"));
    if (parsed.TYPESAFE_API_KEY?.trim()) return path;
  }

  const key = validateKey(
    process.env.TYPESAFE_API_KEY ??
      (await readSecret("TypeSafe API key (input hidden): ")),
  );

  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const temp = `${path}.tmp-${process.pid}`;
  writeFileSync(
    temp,
    [
      "# Local jev-mcp credential file. Never commit or share this file.",
      `TYPESAFE_API_KEY=${key}`,
      "JEV_MODEL=jev-latest",
      "TYPESAFE_BASE_URL=https://api.typesafe.ai",
      "TYPESAFE_TIMEOUT_MS=15000",
      "",
    ].join("\n"),
    { encoding: "utf8", mode: 0o600 },
  );
  renameSync(temp, path);
  try {
    chmodSync(path, 0o600);
  } catch {
    // Best effort on platforms/filesystems without POSIX permissions.
  }

  return path;
}

function installJsonTarget(
  target: Exclude<InstallTarget, "codex" | "claude-code">,
): string {
  const config = jsonConfigForTarget(target);
  const root = readJson(config.path);
  setNested(root, config.keyPath, config.value);
  atomicWriteJson(config.path, root);
  return config.path;
}

function uninstallJsonTarget(
  target: Exclude<InstallTarget, "codex" | "claude-code">,
): string {
  const config = jsonConfigForTarget(target);
  if (!existsSync(config.path)) return config.path;
  const root = readJson(config.path);
  if (deleteNested(root, config.keyPath)) atomicWriteJson(config.path, root);
  return config.path;
}

function installCliTarget(target: "codex" | "claude-code"): void {
  const launcher = serverLauncher();

  if (target === "codex") {
    if (!commandExists("codex")) {
      throw new Error("Codex CLI was not found on PATH.");
    }
    runCli("codex", ["mcp", "remove", SERVER_NAME], { ignoreFailure: true });
    runCli("codex", [
      "mcp",
      "add",
      SERVER_NAME,
      "--",
      launcher.command,
      ...launcher.args,
    ]);
    return;
  }

  if (!commandExists("claude")) {
    throw new Error("Claude Code CLI was not found on PATH.");
  }
  runCli("claude", ["mcp", "remove", SERVER_NAME], { ignoreFailure: true });
  runCli("claude", [
    "mcp",
    "add",
    "--scope",
    "user",
    SERVER_NAME,
    "--",
    launcher.command,
    ...launcher.args,
  ]);
}

function uninstallCliTarget(target: "codex" | "claude-code"): void {
  const command = target === "codex" ? "codex" : "claude";
  if (!commandExists(command)) return;
  runCli(command, ["mcp", "remove", SERVER_NAME], { ignoreFailure: true });
}

function targetLooksInstalled(target: InstallTarget): boolean {
  if (target === "codex") return commandExists("codex");
  if (target === "claude-code") return commandExists("claude");

  const config = jsonConfigForTarget(target);
  return existsSync(dirname(config.path));
}

export async function installTargets(
  targets: InstallTarget[],
  options: { skipKey?: boolean; detectOnly?: boolean } = {},
): Promise<Array<{ target: InstallTarget; status: "installed" | "skipped"; detail: string }>> {
  await ensureCredential({ skip: options.skipKey });

  const results: Array<{
    target: InstallTarget;
    status: "installed" | "skipped";
    detail: string;
  }> = [];

  for (const target of targets) {
    if (options.detectOnly && !targetLooksInstalled(target) && target !== "agents") {
      results.push({
        target,
        status: "skipped",
        detail: "client/config directory not detected",
      });
      continue;
    }

    try {
      if (target === "codex" || target === "claude-code") {
        installCliTarget(target);
        results.push({ target, status: "installed", detail: "configured via client CLI" });
      } else {
        const path = installJsonTarget(target);
        results.push({ target, status: "installed", detail: path });
      }
    } catch (error) {
      if (options.detectOnly) {
        results.push({
          target,
          status: "skipped",
          detail: error instanceof Error ? error.message : String(error),
        });
        continue;
      }
      throw error;
    }
  }

  return results;
}

export function uninstallTargets(
  targets: InstallTarget[],
): Array<{ target: InstallTarget; detail: string }> {
  return targets.map((target) => {
    if (target === "codex" || target === "claude-code") {
      uninstallCliTarget(target);
      return { target, detail: "removed via client CLI when present" };
    }
    return { target, detail: uninstallJsonTarget(target) };
  });
}

export function removeStoredCredential(): void {
  const path = userEnvPath();
  if (existsSync(path)) rmSync(path);
}
