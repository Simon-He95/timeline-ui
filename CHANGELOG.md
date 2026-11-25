# Changelog

All notable changes to `@simon_he/timeline-ui` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-11-25

Documentation and discoverability update. No runtime API changes.

### Added

- Direct Lab and Docs URLs with view-aware page metadata.
- Open Graph and Twitter cards, JSON-LD software metadata, robots and sitemap.
- Full token reference and concepts in the Docs site.
- Repository contributing, release, security and third-party documentation.
- GitHub issue templates and a GitHub release for the published version.

### Changed

- README reduced from a full manual to a concise landing page.
- Public package metadata now points to the live Lab and includes SEO keywords.
- Documentation images moved from `docs/` to `assets/`.
- Release workflow is idempotent and skips an already-published version.

## [0.1.0] - 2026-11-25

Initial public release.

### Added

- `TimelineGroup` component with a fixed group header, row grid and vertical
  rail skeleton that hosts can skin but not restructure.
- Public TypeScript types: `TimelineGroupProps`, `TimelineGroupEmits`,
  `TimelineGroupVM`, `TimelineItemVM`, `TimelineItemKind`, `TimelineStatus`,
  `TimelineDetailVM`, `TimelineDetailLoadingVM`, `TimelineDetailReadyVM`,
  `TimelineDetailErrorVM` and `TimelineDetailStatus`.
- Fixed row layout with decorative icon, label, primary text and chevron, plus
  activatable rows without details.
- Controlled and uncontrolled group and row expansion through `expanded`,
  `expandedItemIds` and the matching `update:*` events.
- Detail lifecycle shell with loading, ready (host slot content) and error
  states, including `detail-toggle`, `detail-retry`, lazy mounting and optional
  keep-mounted behavior.
- `summary` slot for rich group headers while the header skeleton and chevron
  remain fixed.
- CSS custom properties for typography, spacing, color, motion and detail
  sizing (`--timeline-ui-*` tokens) on the `.timeline-ui` root.
- Built-in dark tone selected with `data-tone="dark"` on the group root.
- Accessibility: native buttons for group and row headers, `aria-expanded`,
  `inert`/`aria-hidden` for collapsed bodies, `role="alert"` error state,
  accent focus-visible rings and `prefers-reduced-motion` support.
- Stylesheet export at `@simon_he/timeline-ui/style.css`.

[0.1.1]: https://www.npmjs.com/package/@simon_he/timeline-ui/v/0.1.1
[0.1.0]: https://www.npmjs.com/package/@simon_he/timeline-ui/v/0.1.0
