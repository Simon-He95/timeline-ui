# Third-party notices

The published library package contains the component, CSS, types, README and
brand screenshots. It does not ship the demo dependencies or their assets.

## Development demo assets

The Lab is a development demo and is not part of the published package.

- Gentleface SMIL glyphs under `src/playground/glyph/`: MIT, copyright
  Alexander Kiselev. Original designer: eric8810. The full notice is in
  `src/playground/glyph/assets/LICENSE.txt` and at
  [timeline-ui.pages.dev/third-party-notices.html](https://timeline-ui.pages.dev/third-party-notices.html).
- Wikipe-tan artwork used by the mock image result: CC BY-SA 2.5 / GFDL, by
  Kasuga via Wikimedia Commons. The full notice is in
  `src/playground/mock-chat/assets/anime-girl.LICENSE.txt`.
- `stream-diffs` and `markstream-vue` are development dependencies with their
  own licenses. They are not exported from the library entry.

## Library runtime

The library has no runtime dependency other than Vue, which is a peer
dependency supplied by the host application.
