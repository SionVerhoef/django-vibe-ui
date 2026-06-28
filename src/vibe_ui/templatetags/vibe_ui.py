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
