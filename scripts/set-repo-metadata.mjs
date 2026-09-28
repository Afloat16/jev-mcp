import { readFileSync, writeFileSync } from "node:fs";

const nameWithOwner = process.argv[2];
if (!nameWithOwner || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(nameWithOwner)) {
  console.error("Usage: node scripts/set-repo-metadata.mjs OWNER/REPO");
  process.exit(2);
}

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const webUrl = `https://github.com/${nameWithOwner}`;
packageJson.repository = {
  type: "git",
  url: `git+${webUrl}.git`,
};
packageJson.bugs = { url: `${webUrl}/issues` };
packageJson.homepage = `${webUrl}#readme`;
writeFileSync("package.json", `${JSON.stringify(packageJson, null, 2)}\n`);
console.log(`Updated package.json repository metadata for ${nameWithOwner}`);
