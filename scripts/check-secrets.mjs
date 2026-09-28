import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const patterns = [
  { name: "TypeSafe-style API key", regex: /apikey_[A-Za-z0-9_-]{20,}/g },
  { name: "GitHub classic token", regex: /gh[pousr]_[A-Za-z0-9]{20,}/g },
  { name: "GitHub fine-grained token", regex: /github_pat_[A-Za-z0-9_]{20,}/g },
  { name: "OpenAI-style secret", regex: /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/g },
  { name: "private key block", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { name: "macOS user home path", regex: /\/Users\/[A-Za-z0-9._-]+\//g },
  { name: "Linux user home path", regex: /\/home\/[A-Za-z0-9._-]+\//g },
  { name: "Windows user home path", regex: /[A-Za-z]:\\Users\\[A-Za-z0-9._-]+\\/g },
];

function recursivelyList(dir) {
  const skipDirs = new Set([".git", "node_modules", "dist", "coverage"]);
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (skipDirs.has(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) files.push(...recursivelyList(path));
    else if (entry !== ".env" && !entry.startsWith(".env.")) files.push(relative(root, path));
  }
  return files;
}

let files;
let trackedMode = true;
try {
  files = execFileSync("git", ["-C", root, "ls-files", "-z"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  })
    .split("\0")
    .filter(Boolean);
  if (files.length === 0) throw new Error("no tracked files yet");
} catch {
  trackedMode = false;
  files = recursivelyList(root);
}

const forbiddenTrackedFiles = trackedMode
  ? files.filter((file) => /^\.env(?:\.|$)/.test(file) && file !== ".env.example")
  : [];
const findings = [];

for (const file of files) {
  let text;
  try {
    text = readFileSync(join(root, file), "utf8");
  } catch {
    continue;
  }

  for (const pattern of patterns) {
    pattern.regex.lastIndex = 0;
    if (pattern.regex.test(text)) findings.push(`${file}: ${pattern.name}`);
  }

  for (const match of text.matchAll(/TYPESAFE_API_KEY\s*=\s*([^\s"'\x60]+)/g)) {
    const value = match[1];
    const safePlaceholders = new Set(["replace_me", "YOUR_TYPESAFE_API_KEY", "<your-key>"]);
    if (value && !safePlaceholders.has(value)) {
      findings.push(`${file}: non-placeholder TYPESAFE_API_KEY assignment`);
    }
  }
}

if (forbiddenTrackedFiles.length) {
  findings.push(`Tracked env file(s): ${forbiddenTrackedFiles.join(", ")}`);
}

if (findings.length) {
  console.error("Potential secret/privacy material found:\n- " + [...new Set(findings)].join("\n- "));
  process.exit(1);
}

console.log(
  `Secret/privacy check passed (${files.length} ${trackedMode ? "tracked" : "workspace"} files scanned).`,
);
