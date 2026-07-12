# django-vibe-ui — Roadmap

Two repos make up the system:

- **`django-vibe-ui`** (this repo) — the pip-installable **package**: design
  tokens, CSS components, template partials, and (since v0.3.0) the app-shell
  tier with its view mixins. Sites depend on it and get fixes centrally by
  bumping a version.
- **`django-vibe-template`** — a **Cookiecutter project template** that
  scaffolds a *new* Django site already wired to depend on this package.

The guiding principle throughout: **the package owns structure + components +
default tokens; each site owns its brand** (a small token-override file). Get
that boundary right and the system stays maintainable; hard-code colors into
components and it rots.

---

## Phase 1 — Create the package from StickerVibez's design system ✅ (this PR)

StickerVibez (PixRemix) already had a mature, token-driven, `@layer`-based CSS
architecture — that's the hard part of a design system, and it's what we
extracted. motionconvert contributed the *template-partial* discipline
(its `templates/components/` pattern).

Done in this scaffold:

- [x] Repo + `pyproject.toml` (hatchling, src layout, ships CSS + templates).
- [x] Reusable CSS extracted into `static/vibe_ui/css/`, namespaced under the
      app name so it never collides with a host project's files. App-specific
      `pages/` CSS was intentionally **left behind** in the sites.
- [x] Tokens split: `tokens/_defaults.css` (shipped) + `overrides.example.css`
      (the per-site theming contract).
- [x] `ui.css` manifest preserving the `@layer` order.
- [x] FAQ promoted from an inline block into a real `components/accordion.css`.
- [x] `vibe_ui` app config, `__version__`, `{% vibe_button %}` / `{% vibe_card %}`
      tags + partials.
- [x] README documenting install + the token-override contract.

---

## v0.2.0 — Harvest motionconvert's fields & selectors

motionconvert is an engineering-tools site (drivetrain builder, CiA 402
decoder, unit converters). Its signature reusable pieces are **fields and
selectors**, and they're **dark-first** and **JS-backed** — richer than the
StickerVibez CSS-only components. Decisions locked in with Sion:
bring **all** high/medium/low components, **fully** (CSS + JS + Django template
tags), on top of a new **semantic token layer**.

### Step 1 — Semantic token layer ✅ (foundation)
Three-tier tokens so dark-first components port cleanly:
- `_globals.css` — invariant scales (spacing/radius/type/motion), shared by all sites.
- `_defaults.css` — brand palette + fonts (what a site overrides).
- `_semantic.css` — roles components consume (`--surface`, `--text`, `--border`,
  `--surface-input`, `--accent-subtle`, `--ring` …), mapping onto the brand so
  overriding the brand re-themes everything. New components read the ROLES.
- [x] Split tokens, re-point `ui.css`, verify every component token resolves + demo parity.

### Step 2 — Reconcile the generic form set ✅
Single canonical `.form-*` convention (no aliases — sites convert to it):
`.form-group`, `.form-label`(+`-required`), `.form-input`, `.form-check`
(+`-input`/`-label`), `.form-error`, `.form-row`, `.alert*`, `.is-valid`/`.is-invalid`.
- [x] Re-point generic form rules at semantic tokens (`--surface-input`, `--border`,
      `--border-focus`, `--text`, `--ring`).
- [x] Add `.form-check` (checkbox/radio) + `.form-row` (from motionconvert's
      `.field-pair`); showcased in the demo.
- Migration when motionconvert adopts: `.form-control`→`.form-input`, `.field-pair`→`.form-row`.
- [ ] Trim later: `.upload-zone*`, `.style-tile*`, `.discount-input-group` are
      StickerVibez-specific — flagged in forms.css for Phase-2 extraction.

### Step 3 — `category-nav` (selector) ✅
- [x] Ported: desktop link-list + mobile `<select>` (js/category-nav.js) on
      semantic tokens; `{% vibe_category_nav %}` tag + partial; shown in demo.

### Step 4 — `num-base-field` (full: CSS + JS + template tag) ✅
- [x] Ported CSS on semantic tokens (adaptive tints via color-mix).
- [x] Shipped `js/num-base-field.js` verbatim (self-contained; fires `numbase:change`).
- [x] Added partial + `{% vibe_num_base_field %}` tag; shown in demo.

### Step 5 — `value-field` (WIDGET only: CSS + JS + tag) ✅
Boundary (Option A): package owns the reusable WIDGET; each site supplies units
+ conversion. The 901-line unit engine + units DB stay in motionconvert.
- [x] Clean value-field.css on semantic tokens (dropped app-specific station/result/flash variants).
- [x] Slim js/value-field.js (~110 lines): unit selector + copy + copy-format popover;
      exposes setUnits()/setValue()/getUnit(), fires `valuefield:change` — site converts.
- [x] js/copy-format.js (generic payload formatter → window.VibeCopyFormat).
- [x] `{% vibe_value_field %}` tag + partial; demo wires a length converter to prove reuse.

### Step 6 — tabs / pills ✅
- [x] Ported `pill-tabs` (segmented rounded tabs/filters, active = accent) on
      semantic tokens; supports `.pill-tab--active` or `aria-selected`; shown in demo.
- [x] **Left behind** `tool-toolbar` + `tool-card`/`tool-grid`/`tool-category`:
      these are app plumbing (feature-locks, share/save modals, JSON import,
      motionconvert's tool directory), not generic UI — same call as value-field's engine.

### Step 7 — Showcase + verify ✅ (package-level)
- [x] Every new field/selector in `demo/index.html` under all three themes.
- [x] Headless verification: all JS passes `node --check`, every component token
      resolves, brace balance OK, templatetags compile, all imports wired.
- [ ] Real-app verify in StickerVibez / motionconvert happens at adoption
      (Phase 2 / Phase 5) — not blocking the v0.2.0 cut.

**Left behind (site-specific):** `logo` / `logo_mark` (brand identity) and the
whole-feature pages `drivetrain.css` / `statusword.css` (motionconvert's `pages/`).

---

## v0.3.0 — The app tier (InduIndex harvest) ✅

InduIndex was generated from django-vibe-template but grew its own, more
mature app design system (AA-verified tokens, dark theme, nav-rail shell,
a11y-complete modal stack, htmx conventions) while only using vibe-ui on
error/legal pages. v0.3.0 promotes that system into the package as a second
entry point, so app-style products and marketing sites share one dependency.

- [x] `tokens/_app.css`: AA light+dark ramps, status trio, shell dims,
      density hook; re-brand contract (both theme scopes) in
      `overrides.example.css`.
- [x] `app.css` entry: app base/shell/components on the shared cascade-layer
      order; marketing `ui.css` untouched.
- [x] App shell: nav rail + header + mobile drawer (`shell.css`/`shell.js`),
      `vibe_ui/app_base.html` skeleton, `prepaint.html` anti-FOUC include.
- [x] Modal stack: `vibe_ui.mixins.ModalFormMixin` + `form_modal.html` +
      `modal.js` (focus trap/restore, scroll lock, 204 + HX-Redirect).
- [x] htmx layer: vendored 2.0.6, in-flight CSS, focus restore across swaps.
- [x] `{% vibe_pagination %}`; housekeeping (leftover trim, version drift);
      test suite + CI.
- Left behind in InduIndex by design: rate-chart, state-select, Issue-state
  pills, qa-list, the agent chat tray (domain-specific).

---

## Phase 2 — Prove it by re-consuming in StickerVibez itself

Lowest-risk first adoption: swap StickerVibez's local `static/css/` for the
package, because it's the same source — **pixel-parity is trivially verifiable**.

- [ ] `pip install django-vibe-ui` (git tag) into StickerVibez.
- [ ] Add `vibe_ui` to `INSTALLED_APPS`.
- [ ] Point `base.html` at `{% static 'vibe_ui/css/ui.css' %}` + a small
      `theme.css` override (StickerVibez orange already *is* the default, so the
      override may be near-empty).
- [ ] Keep StickerVibez's `pages/*.css` loaded per page via `{% block extra_css %}`.
- [ ] Visual diff key pages (home, styles, cart, upload, results) — confirm parity.
- [ ] Delete the now-duplicated component/token CSS from StickerVibez.
- [x] ~~Trim app-specific CSS that came along in the extraction~~ — done in
      v0.3.0: `modal.css` (the cart drawer), `.style-card`/`.trust-*`,
      `.upload-zone*`/`.style-tile*`/`.discount-input-group` removed from the
      package. StickerVibez keeps its own copies until adoption, when they
      move into its `pages/` CSS.
- [ ] Pin the version in `requirements.txt`.

**Exit criteria:** StickerVibez renders identically while sourcing its design
system from the package.

---

## Phase 3 — Project template (`django-vibe-template`)

- [x] The Cookiecutter exists (v0.1.0): production deploy stack (Docker,
      nginx+certbot, Gunicorn, tag-driven CI deploys, nonce CSP), optional
      allauth accounts, `base.html` wired to `ui.css` + a generated
      `theme.css` — InduIndex was generated from it.
- [ ] **App-shell scaffold mode**: a `project_type` (marketing | app) choice
      that scaffolds a base extending `vibe_ui/app_base.html` (nav rail,
      htmx, `#modal-root`, allauth-on-app-tokens bridge) against v0.3.0.
- [ ] Backports from InduIndex: CI/test tweaks, docs + AGENTS.md scaffold,
      `use_celery` toggle (tracked in django-vibe-template's beads).

**Exit criteria:** `cookiecutter django-vibe-template` with
`project_type=app` produces a runnable product shell that looks like an app
on first boot.

---

## Phase 4 — Start the new site from the template

The real-world test of the whole system — the new site you're about to begin.

- [ ] Generate it from the template.
- [ ] Build site-specific pages; feed any genuinely reusable component **back
      into the package** (then bump + re-pin).

---

## Phase 4b — Collapse InduIndex's two design systems

The payoff of v0.3.0 (tracked as `induindex-8dm` in InduIndex's beads):
swap InduIndex's local `static/css/app/`, `static/js/app/{shell,modal}.js`,
`core/modals.py`, and `app_base.html` for the package equivalents; keep the
domain pieces (rate-chart, state-select, issue partials, chat tray) in its
`pages/` layer. Pixel-parity should be near-trivial — the package code IS
InduIndex's code.

---

## Phase 5 — (Later) Adopt in motionconvert

The harder adoption: motionconvert has its own identity and a monolithic
126 KB `main.css`. Do it last, deliberately.

- [ ] Add the package; create a motionconvert `theme.css` override.
- [ ] Migrate page-by-page off `main.css` onto package components.
- [ ] Accept an intentional, reviewed visual refresh where they differ.

---

## Optional upgrade — django-cotton

Today components are CSS classes + `{% include %}` partials, which ship fine.
Later, layer in **django-cotton** for `<c-button variant="primary">` ergonomics
— it's additive, so it never blocks the work above. When added, cotton
components live in `templates/vibe_ui/cotton/` and wrap the same CSS classes.

---

## Distribution & versioning

- Install by **git tag** over SSH:
  `pip install "git+ssh://git@github.com/SionVerhoef/django-vibe-ui@vX.Y.Z"`.
- **Semver.** Breaking token/class renames = major. New components = minor.
  Fixes = patch. Each site pins a version and upgrades deliberately.
- Graduate to a private PyPI index only if git-tag installs ever get painful.
