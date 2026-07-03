"""Template tags for django-vibe-ui.

Load in a template with ``{% load vibe_ui %}``.

These are thin conveniences over the CSS components — the CSS classes
(``.btn``, ``.card`` …) are the real contract and can be used directly in
markup without any tag. The inclusion tags exist so common components can be
dropped in with one line and consistent defaults.
"""

from django import template

register = template.Library()


@register.inclusion_tag("vibe_ui/button.html")
def vibe_button(label, href=None, variant="primary", type="button", size=None):
    """Render a button (or link styled as a button).

    Usage:
        {% vibe_button "Save" variant="primary" %}
        {% vibe_button "Learn more" href="/about/" variant="secondary" %}

    variant: primary | secondary | ghost
    size:    None | sm | lg   (maps to .btn-sm / .btn-lg if defined)
    """
    return {
        "label": label,
        "href": href,
        "variant": variant,
        "type": type,
        "size": size,
    }


@register.inclusion_tag("vibe_ui/card.html")
def vibe_card(title=None, body=None, href=None):
    """Render a simple content card.

    Usage:
        {% vibe_card title="Plan" body="Details…" href="/pricing/" %}

    For richer cards, use the ``.card`` CSS classes directly in your own markup.
    """
    return {"title": title, "body": body, "href": href}


@register.inclusion_tag("vibe_ui/category_nav.html")
def vibe_category_nav(items, current_key=None, label="Categories", select_id="category-nav-select"):
    """Render a category nav (desktop link list + mobile <select>).

    Each item needs .key, .name, .url. Requires js/category-nav.js for the
    <select> to navigate on change.
    """
    return {"items": items, "current_key": current_key, "label": label, "select_id": select_id}


@register.inclusion_tag("vibe_ui/num_base_field.html")
def vibe_num_base_field(field_id, label="", placeholder="Enter value", width_bits=16, default_base="dec", value=""):
    """Render a numeric field with a DEC/HEX/BIN base selector + copy button.

    Requires js/num-base-field.js. The element fires a bubbling "numbase:change"
    CustomEvent (detail.value / .base / .raw) you can listen for.
    """
    return {
        "field_id": field_id,
        "label": label,
        "placeholder": placeholder,
        "width_bits": width_bits,
        "default_base": default_base,
        "value": value,
    }


@register.inclusion_tag("vibe_ui/value_field.html")
def vibe_value_field(field_id, label="", mode="input", value="", placeholder="Enter value",
                     variant="", category="", default_unit=""):
    """Render a value-field WIDGET (input/output + unit selector + copy).

    Fill the unit <select> and convert from your own JS by listening for the
    "valuefield:change" event; needs js/value-field.js and js/copy-format.js.
    """
    return {
        "field_id": field_id, "label": label, "mode": mode, "value": value,
        "placeholder": placeholder, "variant": variant, "category": category,
        "default_unit": default_unit,
    }
