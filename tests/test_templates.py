"""app_base.html renders as a complete, accessible shell when extended."""

from django.template import engines
from django.test import RequestFactory, SimpleTestCase

CHILD = (
    "{% extends 'vibe_ui/app_base.html' %}"
    "{% block title %}Dash · Acme{% endblock %}"
    "{% block brand_name %}Acme{% endblock %}"
    "{% block page_title %}Dashboard{% endblock %}"
    "{% block content %}<p>hello</p>{% endblock %}"
)


class AppBaseTests(SimpleTestCase):
    def render(self):
        template = engines["django"].from_string(CHILD)
        return template.render({"request": RequestFactory().get("/")})

    def test_shell_structure(self):
        html = self.render()
        self.assertIn('<a class="skip-link" href="#main">', html)
        self.assertIn('id="modal-root"', html)
        self.assertIn('aria-label="Primary"', html)
        self.assertIn("vibe_ui/js/vendor/htmx.min.js", html)
        self.assertIn("vibe_ui/css/app.css", html)
        self.assertIn("<p>hello</p>", html)

    def test_single_h1(self):
        html = self.render()
        self.assertEqual(html.count("<h1"), 1)
        self.assertIn("Dashboard", html)

    def test_theme_defaults_to_light(self):
        self.assertIn('data-theme="light"', self.render())
