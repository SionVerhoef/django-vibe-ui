# django-vibe-ui

A reusable Django app that packages a shared **design system** — design tokens,
CSS components, and a few template partials — so multiple Django sites can stay
visually consistent and get fixes from one place.

Extracted from the PixRemix (StickerVibez) design system, generalized so any
site can consume it and re-theme it with a handful of CSS variables.

> **Status:** `v0.3.0` (in progress) — adds the **app tier** harvested from
> InduIndex: an app-shell layout, dark theme, an accessible modal stack, and
> htmx conventions, alongside the existing marketing tier.
> See [`docs/PLAN.md`](docs/PLAN.md) for the full roadmap.

---

## Documentation

- **[docs/components.md](docs/components.md)** — every component: classes, markup, the JS widget APIs, and template tags.
- **[docs/tokens.md](docs/tokens.md)** — full token reference (globals · brand · semantic) + the theming guide (incl. dark mode).
- **[demo/index.html](demo/index.html)** — marketing-tier showcase under three brand themes; **[demo/app.html](demo/app.html)** — the app shell (nav rail, dark toggle, modal). Run `python3 -m http.server` in the repo root and open `/demo/`.
- **[docs/PLAN.md](docs/PLAN.md)** — roadmap · **[CHANGELOG.md](CHANGELOG.md)** — changes.

---

## What's inside

```
src/vibe_ui/
├── static/vibe_ui/css/
│   ├── ui.css                  # MARKETING entry — landing/legal/content pages
│   ├── app.css                 # APP entry — product pages (shell + dark theme)
│   │                           #   one entry per page, never both
│   ├── tokens/
│   │   ├── _globals.css        # invariant scales (spacing/radius/type/motion) — shared across ALL sites
│   │   ├── _defaults.css       # brand palette + fonts — override these per site
│   │   ├── _semantic.css       # roles the marketing components consume
│   │   ├── _app.css            # app tier: light/dark ramps, status colors, shell dims
│   │   └── overrides.example.css   # copy into YOUR site to re-theme
│   ├── base/                   # marketing reset, typography, accessibility
│   ├── layout/                 # marketing container, header, navigation, footer
│   ├── components/             # marketing: buttons, cards, forms, badges, carousel, toast,
│   │                           #   progress, accordion, category-nav, num-field, value-field, pill-tabs
│   ├── app/                    # app tier: base, shell (nav rail), components
│   └── utilities/              # helpers (shared)
├── static/vibe_ui/js/          # widgets: accordion, category-nav, num-base-field,
│   │                           #   value-field, copy-format
│   ├── app/                    # shell.js (theme/nav/drawer/focus), modal.js (edit overlay)
│   └── vendor/htmx.min.js      # vendored htmx 2.0.6 (CSP-safe, no CDN)
├── templates/vibe_ui/          # app_base.html skeleton, form_modal, prepaint, pagination,
│                               #   button/card/category_nav/num_base_field/value_field partials
├── mixins.py                   # ModalFormMixin + safe_next_url (the edit-overlay pattern)
└── templatetags/vibe_ui.py     # {% vibe_button %} {% vibe_card %} {% vibe_pagination %} …
```

CSS uses native **cascade layers** (`@layer reset, base, layout, components,
pages, utilities`) so your site's page CSS (the `pages` layer) and overrides
always win without specificity wars.

---

## Install

It's a private package — install straight from GitHub by tag:

```bash
pip install "git+ssh://git@github.com/SionVerhoef/django-vibe-ui@v0.3.0"
```

Or pin it in `requirements.txt`:

```
django-vibe-ui @ git+ssh://git@github.com/SionVerhoef/django-vibe-ui@v0.3.0
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

## Interactive fields & selectors

Beyond the CSS-only components, the package ships a few JS-backed widgets
(ported from motionconvert). Include the scripts you use, with `defer`:

```html
<script src="{% static 'vibe_ui/js/num-base-field.js' %}" defer></script>
<script src="{% static 'vibe_ui/js/copy-format.js' %}" defer></script>
<script src="{% static 'vibe_ui/js/value-field.js' %}" defer></script>
<script src="{% static 'vibe_ui/js/category-nav.js' %}" defer></script>
```

- **`{% vibe_num_base_field %}`** — integer field with a DEC/HEX/BIN base
  selector + copy. Fires `numbase:change` (`detail.value/.base/.raw`).
- **`{% vibe_value_field %}`** — labeled input/output field with a unit
  **selector**, copy, and a copy-format menu. It's **domain-free** — your site
  supplies the units and the conversion:

  ```js
  const el = document.querySelector('[data-field-id="torque"]');
  el.valueField.setUnits([{ value: 'nm', label: 'N·m', symbol: 'N·m' }, /* … */]);
  el.addEventListener('valuefield:change', (e) => {
    /* convert e.detail.value and push to the output via out.valueField.setValue(...) */
  });
  ```

- **`{% vibe_category_nav %}`** — desktop link-list + mobile `<select>` nav.
- **`.pill-tabs` / `.pill-tab`** — segmented tab/filter pills (CSS-only; add
  `.pill-tab--active` or `aria-selected="true"`).

---

## The app tier: shell, dark theme, modals, htmx

Product/app pages load `app.css` instead of `ui.css` and extend the shell
skeleton — nav rail, header, light/dark theming, and an accessible
edit-overlay modal stack come wired:

```html
{% extends "vibe_ui/app_base.html" %}
{% block brand_name %}Acme{% endblock %}
{% block nav_items %}
  <a class="nav-item" href="{% url 'projects:list' %}" title="Projects">…</a>
{% endblock %}
{% block page_title %}Dashboard{% endblock %}
{% block content %}…{% endblock %}
```

Form views become modals with one mixin — htmx GET opens the dialog in
`#modal-root`, valid POST answers `204 + HX-Redirect`, and without JS the
same URL serves the full page:

```python
from vibe_ui.mixins import ModalFormMixin

class ProjectUpdate(ModalFormMixin, UpdateView):
    model = Project
    fields = ["name"]
    modal_title = "Edit project"
```

htmx 2.0.6 is vendored (CSP-safe), in-flight states are styled, and focus
survives swaps. See [docs/components.md](docs/components.md) → *App tier*.

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

That one file re-themes every button, card, badge, form, field, selector, and toast.

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
