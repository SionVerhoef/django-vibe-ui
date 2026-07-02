# django-vibe-ui — Roadmap

Two repos make up the system:

- **`django-vibe-ui`** (this repo) — the pip-installable **package**: design
  tokens, CSS components, template partials. Sites depend on it and get fixes
  centrally by bumping a version.
- **`django-vibe-template`** (later) — a **Cookiecutter project template** that
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

### Step 6 — `tool-toolbar`, tabs, pills (remaining medium/low)
- [ ] Port toolbar/share-banner chrome + `js/tool-toolbar.js`; tabs & pills CSS.

### Step 7 — Showcase + verify
- [ ] Add every new field/selector to `demo/index.html` under all three themes.
- [ ] Verify in both StickerVibez and motionconvert.

**Left behind (site-specific):** `logo` / `logo_mark` (brand identity) and the
whole-feature pages `drivetrain.css` / `statusword.css` (motionconvert's `pages/`).

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
- [ ] **Trim app-specific CSS that came along in the extraction** (found while
      building the demo): `components/modal.css` is actually StickerVibez's cart
      drawer (`.cart-panel`/`.cart-overlay`), and `cards.css`/`forms.css` carry
      StickerVibez-only classes (`.style-card`, `.trust-bar`, `.upload-zone`,
      `.style-tiles`). Either move these back to StickerVibez's `pages/` CSS or
      generalize them. The genuinely-generic pieces (`.btn`, `.card`, `.badge`,
      `.form-*`, `.alert`, `.toast`, `.spinner`, `.progress-bar`, `.steps`,
      accordion) are validated by `demo/index.html`.
- [ ] Pin the version in `requirements.txt`.

**Exit criteria:** StickerVibez renders identically while sourcing its design
system from the package.

---

## Phase 3 — Build the project template (`django-vibe-template`)

Distill the skeleton both existing sites share (Django layout, Docker, Nginx,
Gunicorn, `base.html`, accounts) into a Cookiecutter that depends on this package.

- [ ] New repo `django-vibe-template` (Cookiecutter).
- [ ] `cookiecutter.json` (project name, slug, brand accent, domain…).
- [ ] Scaffold: settings split, `base.html` loading `vibe_ui/css/ui.css` +
      generated `theme.css` seeded from the chosen accent, `INSTALLED_APPS`
      already including `vibe_ui`, `requirements.txt` pinning the package.
- [ ] Carry over the shared Docker/Nginx/Gunicorn config (both sites match).
- [ ] Optional starter pages (home, pricing, legal) using the components.

**Exit criteria:** `cookiecutter django-vibe-template` produces a runnable site
that already looks on-brand.

---

## Phase 4 — Start the new site from the template

The real-world test of the whole system — the new site you're about to begin.

- [ ] Generate it from the template.
- [ ] Build site-specific pages; feed any genuinely reusable component **back
      into the package** (then bump + re-pin).

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
