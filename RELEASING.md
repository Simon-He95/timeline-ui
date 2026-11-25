# Releasing

`@simon_he/timeline-ui@0.1.0` is published on
[npm](https://www.npmjs.com/package/@simon_he/timeline-ui). The current release
was built from the `main` branch and published to `https://registry.npmjs.org/`.

## Before a release

1. Update `package.json` version.
2. Update `CHANGELOG.md`.
3. Update the Docs version label if needed.
4. Run the checks:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm build:demo
```

5. Inspect the package:

```bash
npm pack --dry-run
```

## Publish paths

Choose one path. Do not publish the same version twice.

### Local direct publish

```bash
npm publish --access public --registry=https://registry.npmjs.org/
```

`prepublishOnly` runs tests and the library build first. This path publishes
without npm provenance.

### Staged publish

```bash
npm stage publish --registry=https://registry.npmjs.org/
npm stage list --registry=https://registry.npmjs.org/
npm stage approve <stage-id> --registry=https://registry.npmjs.org/
```

A new package gets a public `0.0.0-stage` placeholder until a maintainer
approves the staged version with 2FA.

### GitHub tag workflow

The workflow in `.github/workflows/release.yml` publishes a version tag. It
checks the registry first and skips the publish step when the version already
exists.

- Add an `NPM_TOKEN` secret with access to `@simon_he`.
- Keep the tag and `package.json` version in sync, for example `v0.2.0`.
- Push the tag.

## After publishing

- Verify `npm view @simon_he/timeline-ui version`.
- Install the published version in a clean project and import both the
  component and `@simon_he/timeline-ui/style.css`.
- Create the matching GitHub release and include the docs and npm links.
- Rebuild the Lab and Docs if their source changed.
