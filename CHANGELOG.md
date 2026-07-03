# Changelog

All notable changes to django-vibe-ui are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.1] — ship the font files (unreleased)

### Fixed
- **`base/typography.css` referenced four `vibe_ui/fonts/*.woff2` files that
  were never shipped** (SpaceGrotesk-Latin, SpaceGrotesk-LatinExt,
  Inter-Regular, Inter-Medium). Consumers running Django's manifest static
  storage (`CompressedManifestStaticFilesStorage` — the standard production
  setup) failed hard at `collectstatic` with `MissingFileError`; plain-storage
  consumers got silent 404s and fell back to system fonts. The woff2 files
  (copied from StickerVibez, where this CSS originated) now live at
  `src/vibe_ui/static/vibe_ui/fonts/`.
- `__version__` bumped from the stale `0.1.0` to `0.2.1` so wheel metadata
  matches the release tag again.

## [0.2.0] — motionconvert fields & selectors (unreleased)

### Added
- **Three-tier token system**: `_globals.css` (invariant scales, shared by all
  sites), `_defaults.css` (brand palette + fonts), `_semantic.css` (roles
  components consume: `--surface`, `--text`, `--border`, `--surface-input`,
  `--accent-subtle`, `--ring`). New globals: breakpoints (`--bp-sm/md/lg/xl`),
  `--border-width`/`-2`, `--container-narrow`, `--font-mono`.
- **Reconciled form set** into one `.form-*` convention: `.form-input`,
  `.form-check` (checkbox/radio), `.form-row`, plus existing label/error/alert.
- **category-nav** (desktop link-list + mobile `<select>`), `{% vibe_category_nav %}`, `js/category-nav.js`.
- **num-base-field** (DEC/HEX/BIN + copy), `{% vibe_num_base_field %}`, `js/num-base-field.js`.
- **value-field** widget (input/output + unit selector + copy/copy-format),
  `{% vibe_value_field %}`, `js/value-field.js` + `js/copy-format.js`. Domain-free:
  the site supplies units + conversion via `setUnits()` and the `valuefield:change` event.
- **pill-tabs** — segmented tabs / filter pills.

### Changed
- `forms.css` bare `input`/`select` selectors wrapped in `:where()` so component
  classes always win (fixes width/border bleed into `.value-field` / `.num-field`).

### Left behind (app-specific, by design)
- motionconvert's unit-conversion engine + units DB (value-field is widget-only),
  `tool-toolbar`, the tool-directory CSS, and the logo lockups.

## [0.1.0] — Phase 1 scaffold

### Added
- Initial package scaffold (`vibe_ui` reusable Django app, hatchling build, src layout).
- Design tokens shipped as defaults (`tokens/_defaults.css`) plus a per-site
  theming contract (`tokens/overrides.example.css`).
- CSS components extracted from the StickerVibez/PixRemix design system:
  buttons, cards, forms, badges, modal, carousel, toast, progress, accordion.
- Base (reset, typography, accessibility), layout (container, header,
  navigation, footer), and utilities CSS.
- `ui.css` entry stylesheet using native `@layer` ordering.
- Template partials and tags: `{% vibe_button %}`, `{% vibe_card %}`.
- README (install + theming guide) and `docs/PLAN.md` (Phases 2–5 roadmap).
