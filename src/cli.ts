#!/usr/bin/env node
import {
  INSTALL_TARGETS,
  ensureCredential,
  installTargets,
  removeStoredCredential,
  runtimeRoot,
  uninstallTargets,
  type InstallTarget,
} from "./installer.js";

function printHelp(): void {
  console.log(`
jev-mcp

Usage:
  jev-mcp server
  jev-mcp setup [--reset]
  jev-mcp install <target|all> [--skip-key]
  jev-mcp uninstall <target|all>
  jev-mcp targets
  jev-mcp runtime
  jev-mcp forget-key

Targets:
  codex         OpenAI Codex CLI + VS Code extension shared MCP config
  claude-code   Anthropic Claude Code (user scope)
  kimi          Kimi Code
  zcode         ZCode
  cursor        Cursor
  gemini        Gemini CLI
  windsurf      Windsurf-compatible MCP config
  agents        Generic ~/.agents/mcp.json
  vscode        VS Code workspace .vscode/mcp.json

Recommended bootstrap:
  macOS/Linux:
    curl -fsSL https://raw.githubusercontent.com/Afloat16/jev-mcp/v0.5.0/scripts/install.sh | bash -s -- codex

  Windows PowerShell:
    & ([scriptblock]::Create((irm https://raw.githubusercontent.com/Afloat16/jev-mcp/v0.5.0/scripts/install.ps1))) -Target codex

After bootstrap, the local CLI lives under ~/.jev-mcp/runtime.
`.trim());
}

function parseTarget(raw: string): InstallTarget {
  if (!INSTALL_TARGETS.includes(raw as InstallTarget)) {
    throw new Error(`Unknown target: ${raw}. Run 'jev-mcp targets'.`);
  }
  return raw as InstallTarget;
}

async function main(): Promise<void> {
  const [command = "server", ...rest] = process.argv.slice(2);

  if (command === "server") {
    await import("./index.js");
    return;
  }

  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "targets") {
    console.log(INSTALL_TARGETS.join("\n"));
    return;
  }

  if (command === "runtime") {
    console.log(runtimeRoot());
    return;
  }

  if (command === "setup") {
    const path = await ensureCredential({ reset: rest.includes("--reset") });
    console.log(`Credential configured locally at ${path}. The key value was not printed.`);
    return;
  }

  if (command === "forget-key") {
    removeStoredCredential();
    console.log("Removed the locally stored jev-mcp credential file.");
    return;
  }

  if (command === "install") {
    const rawTarget = rest.find((arg) => !arg.startsWith("-"));
    if (!rawTarget) throw new Error("Missing target. Use 'jev-mcp install <target|all>'.");
    const skipKey = rest.includes("--skip-key");

    const results =
      rawTarget === "all"
        ? await installTargets(INSTALL_TARGETS.filter((target) => target !== "vscode"), {
            skipKey,
            detectOnly: true,
          })
        : await installTargets([parseTarget(rawTarget)], { skipKey });

    for (const result of results) {
      const symbol = result.status === "installed" ? "✓" : "·";
      console.log(`${symbol} ${result.target}: ${result.status} — ${result.detail}`);
    }

    console.log("\nRestart the configured AI client or start a new session before using Jev.");
    return;
  }

  if (command === "uninstall") {
    const rawTarget = rest.find((arg) => !arg.startsWith("-"));
    if (!rawTarget) throw new Error("Missing target. Use 'jev-mcp uninstall <target|all>'.");
    const targets =
      rawTarget === "all"
        ? INSTALL_TARGETS.filter((target) => target !== "vscode")
        : [parseTarget(rawTarget)];

    for (const result of uninstallTargets(targets)) {
      console.log(`✓ ${result.target}: ${result.detail}`);
    }
    console.log(
      "Stored TypeSafe credentials were left untouched. Run 'jev-mcp forget-key' to remove them.",
    );
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(`jev-mcp: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
