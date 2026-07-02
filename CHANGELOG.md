# Changelog

All notable changes to django-vibe-ui are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

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
