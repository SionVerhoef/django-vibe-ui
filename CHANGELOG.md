# Changelog

All notable changes to django-vibe-ui are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

## [0.3.0] — the app tier (unreleased)

### Added — the app tier, harvested from InduIndex
- **`app.css` entry point** alongside `ui.css` (one entry per page): the
  application-shell design system that matured through InduIndex's a11y and
  interaction review batches.
- **`tokens/_app.css`** — AA-verified light + dark ramps
  (`[data-theme="dark"]`), status trio (`--ok`/`--warn`/`--crit` + `-soft`
  fills), non-flipping `--text-on-accent` ink, shell dimensions, and a
  `[data-density="compact"]` hook. Re-brand contract documented in
  `overrides.example.css` (override both theme scopes).
- **App shell** — `app/shell.css` + `js/app/shell.js`: collapsible nav rail,
  header, mobile overlay drawer (`aria-expanded`/`aria-controls`, Escape
  refocuses the toggle), theme toggle with localStorage persistence, and
  `templates/vibe_ui/prepaint.html` (anti-FOUC pre-paint include).
- **App components** — `app/components.css`: buttons (dark-ink primary,
  AA focus ring), cards, pills/tags, severity helpers, segmented tabs,
  toolbar, forms (custom select chevron per theme, linked error styling),
  drag-drop upload zone, search box, alerts, empty states, row lists, data
  tables, meter, KPI/stat tiles, numbered steps, pagination, page hero, and
  the edit-overlay modal.
- **Modal stack** — `vibe_ui.mixins.ModalFormMixin` (+ `safe_next_url`):
  htmx GET renders `vibe_ui/form_modal.html` into `#modal-root`, valid POST
  answers `204 + HX-Redirect`, no-JS falls back to the full page.
  `js/app/modal.js` provides the focus trap, scroll lock, Escape/scrim
  close, and focus return to the opener. Form errors render into
  `<auto_id>_error` containers matching Django 5.2's automatic
  `aria-describedby`.
- **htmx layer** — vendored `js/vendor/htmx.min.js` (2.0.6, CSP-safe),
  `.htmx-request` in-flight spinner/dim CSS (reduced-motion aware), and
  focus restore across swaps in `shell.js`.
- **`templates/vibe_ui/app_base.html`** — extendable shell skeleton (skip
  link, single-h1 header, messages strip, `#modal-root`, script wiring).
- **`{% vibe_pagination page_obj %}`** — Previous / "Page N of M" / Next,
  preserving the rest of the query string.
- **Test suite + CI** — 17 DB-free tests (mixin flow, pagination tag,
  app_base render, and a CSS `url()` integrity scan guarding against the
  v0.2.1 missing-fonts class of bug) run on GitHub Actions.

### Removed (housekeeping — the long-flagged StickerVibez leftovers)
- `components/modal.css` — it was StickerVibez's cart drawer (`.cart-panel*`),
  not a generic modal. The app tier (below) ships a real, accessible modal.
- `forms.css` app-specific block: `.upload-zone*`, `.upload-preview*`,
  `.style-tile*`, `.discount-input-group`, and the global
  `input[type="file"] { display: none }` that supported them.
- `cards.css`: `.style-card*`, `.trust-card`, `.trust-bar`, `.trust-item`.

These classes were never part of the generic set (flagged in
`docs/components.md` since 0.1.0) and StickerVibez still ships its own copies —
nothing consumed them from the package.

## [0.2.1] — ship the font files (2026-07-03)

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

## [0.2.0] — motionconvert fields & selectors (2026-07-03)

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
