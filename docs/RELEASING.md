# Releasing

The repository is intentionally `private: true` in `package.json` to prevent
accidental npm publication. Releases are GitHub source releases, not npm
packages.

## Automated path

After Git and GitHub CLI are configured:

```bash
./scripts/publish-github.sh jev-mcp public
```

or on PowerShell:

```powershell
./scripts/publish-github.ps1 -RepoName jev-mcp -Visibility public
```

The script checks secrets and the build, creates/pushes the repository if
needed, then pushes the version tag. The tag triggers the GitHub release
workflow, which validates the project again and publishes source archives.

## Manual release path

1. Update `package.json` and `CHANGELOG.md`.
2. Run `npm run check`.
3. Commit the changes.
4. Create an annotated tag, e.g. `git tag -a v0.4.1 -m "jev-mcp v0.4.1"`.
5. Push `main` and the tag.
6. The GitHub Actions release workflow creates the GitHub Release.

## Manual prerequisites only

Before the automated publishing script can act on your GitHub account, you must
personally complete the account-bound steps:

1. Install GitHub CLI (`gh`) if it is not already installed.
2. Authenticate it with `gh auth login` (do not send access tokens to anyone).
3. Configure your own Git author identity if needed:
   `git config --global user.name ...` and `git config --global user.email ...`.
4. Decide which GitHub owner/repository name should receive the project. Pass
   `owner/jev-mcp` to the script if publishing under an organization.

The script handles dependency installation, `package-lock.json`, staging,
secret checks, tests/build, initial commit, repository creation, push, tag,
repository topics/settings, security-scanning enablement where permitted, and
release triggering.

After publication, adding a branch ruleset that requires CI before merging is
recommended but intentionally left manual because organization policies and
merge preferences vary.
