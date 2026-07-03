# Tokens & Theming

django-vibe-ui uses a **three-tier** CSS custom-property system. Components read
only the *semantic* roles; a site re-brands by overriding the *brand* layer.

```
_globals.css    invariant scales — SHARED across all sites
      +
_defaults.css   brand palette + fonts — OVERRIDE these per site
      ↓ mapped by
_semantic.css   roles components consume — auto-follow the brand
      ↓ used by
components       .btn, .card, .value-field, .num-field, …
```

All three are `@import`ed (unlayered) by `ui.css`, so a site override loaded
*after* `ui.css` always wins.

---

## 1. Globals — `tokens/_globals.css`

Invariant scales, identical on every site. You rarely override these.

| Group | Tokens |
|---|---|
| Type scale | `--text-xs` `--text-sm` `--text-base` `--text-lg` `--text-xl` `--text-2xl` `--text-3xl` `--text-4xl` |
| Weight | `--weight-regular` `--weight-medium` `--weight-semibold` `--weight-bold` |
| Line height | `--leading-tight` `--leading-normal` `--leading-relaxed` |
| Spacing (4px base) | `--space-1` … `--space-6`, `--space-8` `--space-10` `--space-12` `--space-16` |
| Radius | `--radius-sm` `--radius-md` `--radius-lg` `--radius-xl` `--radius-full` |
| Elevation | `--shadow-sm` `--shadow-md` `--shadow-lg` |
| Motion | `--duration-fast` `--duration-normal` `--duration-moderate` `--ease-out` `--ease-spring` |
| Z-index | `--z-base` `--z-dropdown` `--z-sticky` `--z-overlay` `--z-modal` `--z-toast` |
| Layout | `--container-narrow` `--container-max` `--container-wide` `--header-height` `--tab-bar-height` |
| Border widths | `--border-width` `--border-width-2` |
| Breakpoints | `--bp-sm` (640) `--bp-md` (768) `--bp-lg` (1024) `--bp-xl` (1280) |

> **Breakpoints caveat:** CSS variables can't be used inside `@media
> (min-width: var(--bp-md))` — media queries don't read `var()`. These tokens are
> the canonical values for container queries, JS, and for keeping every site's
> hand-written `@media` breakpoints identical by convention.

---

## 2. Brand — `tokens/_defaults.css`

The default (PixRemix) palette + fonts. **This is the layer a site overrides.**

| Group | Tokens |
|---|---|
| Accent | `--accent` `--accent-hover` `--accent-glow` `--shadow-glow` |
| Surfaces | `--surface-white` `--surface-cream` `--surface-warm` |
| Neutrals | `--neutral-50` `--neutral-100` `--neutral-200` `--neutral-400` `--neutral-600` `--neutral-900` |
| States | `--success` `--error` `--warning` `--info` |
| Fonts | `--font-heading` `--font-body` `--font-mono` |

(Plus a block of `--color-*` / `--shadow-*` **legacy aliases** kept for the
StickerVibez migration — new code should not use these.)

---

## 3. Semantic roles — `tokens/_semantic.css`

**What components consume.** Each maps onto a brand token, so overriding the
brand re-themes every role. Prefer these names in any new component.

| Role | Default mapping |
|---|---|
| `--surface` | card / panel background |
| `--surface-page` | page background |
| `--surface-elevated` | raised / hover surface |
| `--surface-input` | form field background |
| `--text` | primary text |
| `--text-muted` | secondary text |
| `--text-subtle` | hints / placeholders |
| `--text-on-accent` | text on an accent fill |
| `--border` | default line |
| `--border-subtle` | faint divider |
| `--border-strong` | emphasized / hover line |
| `--border-focus` | focused field |
| `--accent-subtle` | tinted accent wash (`color-mix`) |
| `--ring` | focus ring box-shadow |

---

## Theming a site

1. Copy `tokens/overrides.example.css` into your site's static dir, e.g.
   `static/css/theme.css`.
2. Override only the brand tokens you need (start with `--accent`).
3. Load it **after** `ui.css`:

```html
<link rel="stylesheet" href="{% static 'vibe_ui/css/ui.css' %}">
<link rel="stylesheet" href="{% static 'css/theme.css' %}">
```

### Light re-brand (accent + fonts)

```css
:root {
  --accent: #2563EB;
  --accent-hover: #1D4ED8;
  --accent-glow: rgba(37, 99, 235, 0.20);
  --font-heading: 'Sora', 'Inter', system-ui, sans-serif;
}
```

### Dark theme (flip surfaces + the neutral ramp)

Because the semantic roles derive from the brand, a dark theme just remaps the
brand — no component CSS is forked:

```css
:root {
  --accent: #fbbf24;
  --surface-white: #23272b;   /* -> --surface & --surface-input */
  --surface-cream: #1a1d21;   /* -> --surface-page */
  --neutral-900:  #f1f3f5;    /* -> --text (now light) */
  --neutral-200:  rgba(255,255,255,.16);  /* -> --border */
  --font-body: 'Fira Sans', system-ui, sans-serif;
}
```

The `demo/index.html` theme switcher (PixRemix / MotionConvert / New-site) is a
live example of all three.
