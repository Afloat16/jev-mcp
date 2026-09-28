import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const major = Number(process.versions.node.split(".")[0]);
let failed = false;

function ok(message) {
  console.log(`✓ ${message}`);
}
function warn(message) {
  console.warn(`! ${message}`);
}
function fail(message) {
  console.error(`✗ ${message}`);
  failed = true;
}

if (major >= 20) ok(`Node ${process.version}`);
else fail(`Node 20+ required; found ${process.version}`);

const candidates = process.env.JEV_ENV_FILE
  ? [process.env.JEV_ENV_FILE]
  : [
      resolve(root, ".env"),
      resolve(
        process.env.JEV_MCP_CONFIG_HOME || resolve(homedir(), ".jev-mcp"),
        ".env",
      ),
    ];

const envPath = candidates.find((path) => path && existsSync(path));
if (envPath) {
  ok(`Environment file found: ${envPath}`);
  const envText = readFileSync(envPath, "utf8");
  const keyLine = envText
    .split(/\r?\n/)
    .find((line) => line.trim().startsWith("TYPESAFE_API_KEY="));
  if (!keyLine) fail("TYPESAFE_API_KEY is missing from the environment file");
  else if (/=\s*(?:replace_me)?\s*$/.test(keyLine))
    fail("TYPESAFE_API_KEY is still a placeholder");
  else ok("TYPESAFE_API_KEY is configured (value not printed)");
} else if (process.env.TYPESAFE_API_KEY) {
  ok("TYPESAFE_API_KEY is available from the process environment (value not printed)");
} else {
  warn(
    "No project/user env file or process TYPESAFE_API_KEY found. Live Jev calls will fail until configured.",
  );
}

if (existsSync(resolve(root, "dist/index.js"))) ok("Built server found at dist/index.js");
else warn("dist/index.js not found; run `npm run build`");

if (existsSync(resolve(root, "dist/cli.js"))) ok("Installer CLI found at dist/cli.js");
else warn("dist/cli.js not found; run `npm run build`");

console.log("\nNo network request was made. Run MCP Inspector for an explicit live test.");
process.exit(failed ? 1 : 0);
