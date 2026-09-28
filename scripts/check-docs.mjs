import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";

const root = process.cwd();

function trackedFiles() {
  return execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
    .split("\0")
    .filter(Boolean);
}

const files = trackedFiles();
const markdownFiles = files.filter((file) => extname(file).toLowerCase() === ".md");
const errors = [];

for (const file of markdownFiles) {
  const text = readFileSync(join(root, file), "utf8");
  const links = [...text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1].trim());

  for (let target of links) {
    if (
      !target ||
      target.startsWith("#") ||
      /^(?:https?:|mailto:|cursor:|vscode:)/i.test(target)
    ) {
      continue;
    }

    if (target.startsWith("<") && target.endsWith(">")) {
      target = target.slice(1, -1);
    }

    target = target.split("#", 1)[0].split("?", 1)[0];
    if (!target) continue;

    try {
      target = decodeURIComponent(target);
    } catch {
      errors.push(`${file}: invalid percent-encoding in link ${target}`);
      continue;
    }

    const resolved = normalize(resolve(root, dirname(file), target));
    if (!resolved.startsWith(root)) {
      errors.push(`${file}: link escapes repository root: ${target}`);
      continue;
    }

    if (!existsSync(resolved)) {
      errors.push(`${file}: missing relative link target: ${target}`);
      continue;
    }

    // Directory links are allowed if the directory exists.
    statSync(resolved);
  }
}

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf8");
if (!changelog.includes(`## ${pkg.version}`)) {
  errors.push(`CHANGELOG.md has no section for package version ${pkg.version}`);
}

const core = readFileSync(join(root, "src/core.ts"), "utf8");
const coreVersion = core.match(/export const VERSION = "([^"]+)";/)?.[1];
if (coreVersion !== pkg.version) {
  errors.push(`src/core.ts VERSION (${coreVersion ?? "missing"}) does not match package.json (${pkg.version})`);
}

const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
if (lock.version !== pkg.version || lock.packages?.[""]?.version !== pkg.version) {
  errors.push(`package-lock.json version does not match package.json (${pkg.version})`);
}

const stableTag = `v${pkg.version}`;
const unixInstaller = readFileSync(join(root, "scripts/install.sh"), "utf8");
const windowsInstaller = readFileSync(join(root, "scripts/install.ps1"), "utf8");
if (!unixInstaller.includes(`JEV_MCP_GIT_REF:-${stableTag}`)) {
  errors.push(`scripts/install.sh default ref is not ${stableTag}`);
}
if (!windowsInstaller.includes(`"${stableTag}"`)) {
  errors.push(`scripts/install.ps1 default ref is not ${stableTag}`);
}

const setupSh = readFileSync(join(root, "setup.sh"), "utf8");
const setupPs = readFileSync(join(root, "setup.ps1"), "utf8");
if (!setupSh.includes(`v${pkg.version} setup complete`)) {
  errors.push(`setup.sh completion version does not match ${pkg.version}`);
}
if (!setupPs.includes(`v${pkg.version} setup complete`)) {
  errors.push(`setup.ps1 completion version does not match ${pkg.version}`);
}

const readme = readFileSync(join(root, "README.md"), "utf8");
const stableInstallUrl =
  `https://raw.githubusercontent.com/Afloat16/jev-mcp/v${pkg.version}/scripts/install.sh`;
if (!readme.includes(stableInstallUrl)) {
  errors.push(`README.md does not point stable install at v${pkg.version}`);
}

for (const required of [
  "README.md",
  "README.zh-CN.md",
  "LICENSE",
  "NOTICE",
  "SECURITY.md",
  "CONTRIBUTING.md",
  "SUPPORT.md",
  "GOVERNANCE.md",
  "ROADMAP.md",
]) {
  if (!files.includes(required)) errors.push(`missing required project file: ${required}`);
}

if (errors.length) {
  console.error("Documentation/repository checks failed:\n- " + errors.join("\n- "));
  process.exit(1);
}

console.log(`Documentation/repository checks passed (${markdownFiles.length} Markdown files checked).`);
