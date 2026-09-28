# Releasing

The repository is intentionally `private: true` in `package.json` to prevent
accidental npm publication. Releases are GitHub source releases, not npm
packages.

## Release model

Normal releases are now driven by the repository itself:

1. prepare a release PR that updates `package.json`, `src/core.ts`,
   `CHANGELOG.md`, and any stable installer defaults;
2. merge only after CI passes;
3. the post-CI auto-release workflow sees an untagged version on `main`;
4. it creates the annotated `vX.Y.Z` tag and GitHub Release assets.

No maintainer PAT or TypeSafe credential is required by the release workflow.

The release contains:

```text
jev-mcp-X.Y.Z.zip
jev-mcp-X.Y.Z.tar.gz
SHA256SUMS.txt
```

Release notes are extracted from the matching `CHANGELOG.md` section.

## Manual fallback

If automatic release is intentionally disabled:

```bash
git checkout main
git pull
npm ci
npm run check
git tag -a v0.5.0 -m "jev-mcp v0.5.0"
git push origin v0.5.0
```

The tag-triggered release workflow validates the tag against
`package.json` and creates the same assets.

## Stable installer channel

The public bootstrap script is fetched from `main`, but the installed runtime
must default to the latest stable version tag. For v0.5.0:

```text
JEV_MCP_GIT_REF default = v0.5.0
```

Development users can opt into:

```text
JEV_MCP_GIT_REF=main
```

When cutting the next release, update the default stable ref in both
`scripts/install.sh` and `scripts/install.ps1`.

## Release checklist

Before merging a version PR:

- version in `package.json` matches `src/core.ts`;
- `CHANGELOG.md` contains `## X.Y.Z`;
- Linux and Windows bootstrap smoke tests pass;
- Node 20/22/24 checks pass;
- stable installer default points at `vX.Y.Z`;
- no credential or user-specific path appears in the diff.
