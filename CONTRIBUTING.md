# Contributing

Thanks for helping improve Timeline UI. The project is intentionally small:
one component, a fixed skeleton and a narrow public API.

## Setup

Requires Node 20+ and pnpm 10.

```bash
pnpm install
pnpm dev
```

The Lab and Docs run at http://localhost:4173.

## Checks

Run these before opening a PR:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm build:demo
```

CI runs the same checks on every push and pull request.

## Design constraints

- Keep the group, rail and detail shell fixed. The default row may be replaced
  through the `row` slot; other public layout variants need a design discussion
  before they become props or slots.
- Keep product concerns in the host: no i18n strings, stores, data fetching,
  markdown, diff, icons or desktop APIs.
- The library does not bundle CSS into the JavaScript entry. `style.css` stays
  a separate public export.
- Do not add a second public component without a clear API boundary.

## Public API changes

Update these together when a public prop, event, slot or token changes:

- `src/lib/types.ts`
- the component and README example
- `src/playground/docs/type-docs.ts`
- the Docs page and README examples
- tests

## Pull requests

- Keep changes focused and explain the user-facing reason.
- Add or update a test when behavior changes.
- Include screenshots for visual changes.
- Do not commit generated `dist/`, `dist-demo/`, `.wrangler/` or package
  tarballs.

Use the issue templates for bugs and feature proposals. Report security issues
through [SECURITY.md](./SECURITY.md), not a public issue.
