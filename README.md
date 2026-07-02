# django-vibe-ui

A reusable Django app that packages a shared **design system** — design tokens,
CSS components, and a few template partials — so multiple Django sites can stay
visually consistent and get fixes from one place.

Extracted from the PixRemix (StickerVibez) design system, generalized so any
site can consume it and re-theme it with a handful of CSS variables.

> **Status:** `v0.1.0` — Phase 1 scaffold. See [`docs/PLAN.md`](docs/PLAN.md)
> for the full roadmap (Phases 2–5).

---

## What's inside

```
src/vibe_ui/
├── static/vibe_ui/css/
│   ├── ui.css                  # entry point — load this once per page
│   ├── tokens/
│   │   ├── _defaults.css       # shipped DEFAULT tokens (colors, type, spacing, motion…)
│   │   └── overrides.example.css   # copy into YOUR site to re-theme
│   ├── base/                   # reset, typography, accessibility
│   ├── layout/                 # container, header, navigation, footer
│   ├── components/             # buttons, cards, forms, badges, modal, carousel, toast, progress, accordion
│   └── utilities/              # helpers
├── templates/vibe_ui/          # button.html, card.html (optional partials)
└── templatetags/vibe_ui.py     # {% vibe_button %}, {% vibe_card %}
```

CSS uses native **cascade layers** (`@layer reset, base, layout, components,
pages, utilities`) so your site's page CSS (the `pages` layer) and overrides
always win without specificity wars.

---

## Install

It's a private package — install straight from GitHub by tag:

```bash
pip install "git+ssh://git@github.com/SionVerhoef/django-vibe-ui@v0.1.0"
```

Or pin it in `requirements.txt`:

```
django-vibe-ui @ git+ssh://git@github.com/SionVerhoef/django-vibe-ui@v0.1.0
```

---

## Use it

**1. Add the app** to `INSTALLED_APPS`:

```python
INSTALLED_APPS = [
    # ...
    "vibe_ui",
]
```

(Make sure `django.contrib.staticfiles` is enabled — that's how the package's
CSS is discovered and collected.)

**2. Load the stylesheet** in your `base.html`, then your own theme override
*after* it:

```html
{% load static %}
<link rel="stylesheet" href="{% static 'vibe_ui/css/ui.css' %}">
<link rel="stylesheet" href="{% static 'css/theme.css' %}">  <!-- your overrides -->
```

**3. Use the components** — the CSS classes are the contract:

```html
<a href="/pricing/" class="btn btn-primary">Get started</a>
<button class="btn btn-secondary">Learn more</button>

<div class="card">
  <h3 class="card-title">Plan</h3>
  <div class="card-body">…</div>
</div>
```

Or the optional template tags:

```html
{% load vibe_ui %}
{% vibe_button "Get started" href="/pricing/" variant="primary" %}
{% vibe_card title="Plan" body="Everything you need." href="/pricing/" %}
```

**4. Collect static** for production as usual:

```bash
python manage.py collectstatic
```

---

## Theming: the package owns structure, your site owns the brand

This is the core idea. The package ships a complete **default** token set in
`tokens/_defaults.css`, and every component is built from those variables
(`var(--accent)`, `var(--space-4)`, `var(--radius-md)` …). To re-brand a site,
you **don't fork component CSS** — you override a few tokens.

1. Copy `static/vibe_ui/css/tokens/overrides.example.css` into **your site's**
   static dir as e.g. `static/css/theme.css`.
2. Set only the tokens you want to change (start with `--accent`).
3. Load it **after** `ui.css` so your values win.

```css
/* your site's static/css/theme.css */
:root {
  --accent: #2563EB;
  --accent-hover: #1D4ED8;
  --font-heading: 'Sora', 'Inter', system-ui, sans-serif;
  --radius-md: 8px;
}
```

That one file re-themes every button, card, badge, form, modal, and toast.

---

## Buttons are animated, and that's by design

The button component is pure CSS (no JS): hover lift, active press, and a glow
shadow, all driven by motion tokens (`--duration-fast`, `--ease-out`). This is
exactly the kind of thing the package owns — see
`static/vibe_ui/css/components/buttons.css`.

---

## Optional: smooth accordion close animation

The FAQ/accordion works with **zero JavaScript** (native `<details>` + a CSS
reveal on open). For a smooth *close* animation in every browser, optionally
include the enhancer — it progressively enhances `.faq-item` elements and
respects `prefers-reduced-motion`:

```html
<script src="{% static 'vibe_ui/js/accordion.js' %}" defer></script>
```

---

## License

MIT © Sion Verhoef
