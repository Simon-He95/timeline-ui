# Releasing

`@simon_he/timeline-ui` is published on
[npm](https://www.npmjs.com/package/@simon_he/timeline-ui). Every release gets a
matching GitHub release.

## One-command release

Use:

```bash
pnpm release patch
```

Or add release notes:

```bash
pnpm release patch "Fix keyboard focus in collapsed details"
```

`patch`, `minor`, `major` and an explicit version such as `0.2.0` are accepted
as the first argument.

The command:

1. requires a clean `main` working tree;
2. verifies npm auth for `https://registry.npmjs.org/`;
3. bumps `package.json`, the Docs version label, JSON-LD `softwareVersion` and
   sitemap `lastmod`;
4. prepends the `CHANGELOG.md` entry;
5. runs typecheck, tests, library build and demo build;
6. commits the version change and creates the `vX.Y.Z` tag;
7. publishes to npm, which may prompt for a one-time password;
8. pushes `main` and the tag;
9. creates the GitHub release.

The GitHub release workflow is idempotent. When the version already exists on
npm, the tag workflow skips the publish step.

## Requirements

- clean `main` branch
- `npm login --registry=https://registry.npmjs.org/` as `simon_he`
- `gh auth login` for the GitHub release
- 2FA access for the npm one-time password

Run from the repository root:

```bash
pnpm release patch
```

If publishing fails after the local commit and tag are created, fix the npm
issue and finish with:

```bash
npm publish --access public --registry=https://registry.npmjs.org/ --ignore-scripts
git push origin main
git push origin vX.Y.Z
```

Replace `vX.Y.Z` with the version created by the script.

## Finish a staged release

If a version was published with `npm stage publish`, wait for the automated
review and approve it:

```bash
npm stage approve <stage-id> --registry=https://registry.npmjs.org/
```

Approval requires 2FA.

## Manual staged publishing

Use staging only when a release must be reviewed separately:

```bash
npm stage publish --registry=https://registry.npmjs.org/
npm stage list --registry=https://registry.npmjs.org/
npm stage approve <stage-id> --registry=https://registry.npmjs.org/
```

## GitHub tag workflow

The workflow in `.github/workflows/release.yml` can publish a version tag. It
checks the registry first and skips the publish step when the version already
exists.

- Add an `NPM_TOKEN` secret with access to `@simon_he`.
- Keep the tag and `package.json` version in sync.
- Push the tag.
