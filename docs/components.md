# Component reference

Load `ui.css` once, then use the classes below. JS-backed widgets need their
script (see [JavaScript widgets](#javascript-widgets)). Everything themes from
[tokens](tokens.md); see the live [demo](../demo/index.html).

## CSS components

### Buttons
```html
<a class="btn btn-primary">Primary</a>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-primary" disabled>Disabled</button>
```
Pure CSS: hover lift + glow, active press (motion tokens).

### Cards
```html
<div class="card">
  <h3 class="card-title">Title</h3>
  <div class="card-body">…</div>
</div>
```

### Badges
`.badge` + a variant: `.badge-new` `.badge-popular` `.badge-info` `.badge-save`.

### Forms
```html
<div class="form-group">
  <label class="form-label form-label-required" for="email">Email</label>
  <input class="form-input" id="email" type="email">
  <p class="form-error">Required.</p>
</div>

<div class="form-row">…two+ .form-group…</div>   <!-- responsive columns -->

<label class="form-check">
  <input class="form-check-input" type="checkbox"> <span class="form-check-label">Opt in</span>
</label>

<div class="alert alert-success">Saved.</div>
<div class="alert alert-danger">Failed.</div>
```
Inputs: `.form-input` (or bare `input`/`select`/`textarea`). Validation:
`.is-valid` / `.is-invalid`. Alerts are theme-adaptive (color-mix) with an icon.

### Pill tabs
```html
<div class="pill-tabs" role="tablist">
  <button class="pill-tab pill-tab--active" aria-selected="true">All</button>
  <button class="pill-tab">Length</button>
</div>
```
CSS-only. Active state: `.pill-tab--active` **or** `aria-selected="true"`.

### Progress & loading
- Spinner: `<div class="spinner"></div>`
- Bar: `<div class="progress-bar-track"><div class="progress-bar-fill" style="width:60%"></div></div>`
- Steps: `.steps > .step (> .step-number) + .step-connector`
- Skeleton: `.skeleton` (`.skeleton-text` / `.skeleton-image` / `.skeleton-circle`)

### Accordion (FAQ)
```html
<div class="faq-container">
  <details class="faq-item"><summary>Q?</summary><p class="faq-answer">A.</p></details>
</div>
```
Works with zero JS (native `<details>` + CSS reveal). Optional
`js/accordion.js` adds smooth open **and** close.

### Toast
`.toast-container` (fixed) holding `.toast` items (with an optional
`.toast-action` button). Show/dismiss from your own JS.

---

## Fields & selectors (JS-backed)

### category-nav — `{% vibe_category_nav %}`
Desktop link-list + mobile `<select>` (switches at `--bp-md`). Needs
`js/category-nav.js` for the select to navigate on change.
```django
{% load vibe_ui %}
{% vibe_category_nav items=categories current_key=active label="Categories" %}
```
Each item needs `.key`, `.name`, `.url`.

### num-base-field — `{% vibe_num_base_field %}`
Integer field with a DEC / HEX / BIN base selector + copy. Needs
`js/num-base-field.js`.
```django
{% vibe_num_base_field field_id="reg" label="Register" width_bits=16 default_base="hex" %}
```
Fires `numbase:change` → `detail.value` (int) / `.base` / `.raw`.
Element API: `el.numBase.{getValue,setValue,getBase,setBase}`.

### value-field — `{% vibe_value_field %}`  *(widget only)*
Labeled input/output field with a unit **selector**, copy, and a copy-format
menu (number / value+unit / bracket / Python / MATLAB). Needs
`js/value-field.js` + `js/copy-format.js`.

**Domain-free by design** — the site supplies units and conversion:
```django
{% vibe_value_field field_id="len-in"  label="From" category="length" default_unit="mm" %}
{% vibe_value_field field_id="len-out" label="To" mode="output" category="length" default_unit="m" %}
```
```js
const a = document.querySelector('[data-field-id="len-in"]');
const b = document.querySelector('[data-field-id="len-out"]');
const UNITS = [{ value:'mm', label:'mm', symbol:'mm' }, { value:'m', label:'m', symbol:'m' }];
a.valueField.setUnits(UNITS); b.valueField.setUnits(UNITS);
a.addEventListener('valuefield:change', () => {
  /* read a.valueField.getValue()/getUnit(), convert, b.valueField.setValue(result) */
});
```
Element API: `el.valueField.{getValue,setValue,getUnit,setUnit,setUnits,getFormat}`.
Event: `valuefield:change` → `detail.{fieldId,value,unit}`.

---

## JavaScript widgets

All are plain `<script defer>` includes, no build step, and degrade gracefully.

| Script | Powers | Global |
|---|---|---|
| `js/accordion.js` | smooth FAQ open/close | — |
| `js/category-nav.js` | `[data-category-nav]` select navigation | — |
| `js/num-base-field.js` | numeric base field | `window.NumBaseField` |
| `js/value-field.js` | value-field widget | `window.VibeValueField` |
| `js/copy-format.js` | copy payload formatting (dep of value-field) | `window.VibeCopyFormat` |

---

## Template tags

`{% load vibe_ui %}` then:
`{% vibe_button %}` · `{% vibe_card %}` · `{% vibe_category_nav %}` ·
`{% vibe_num_base_field %}` · `{% vibe_value_field %}`.

---

## Known app-specific leftovers

Trimmed in v0.3.0. The StickerVibez-specific classes carried in during
extraction (`.upload-zone*`, `.upload-preview*`, `.style-tile*`,
`.discount-input-group`, the `.cart-panel*` "modal", `.style-card*`,
`.trust-*`) were removed — StickerVibez still ships its own copies, and
nothing consumed them from the package.
