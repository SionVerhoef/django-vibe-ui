"""{% vibe_pagination %}: querystring preservation and edge cases."""

from django.core.paginator import Paginator
from django.template import Context, Template
from django.test import RequestFactory, SimpleTestCase

TEMPLATE = Template("{% load vibe_ui %}{% vibe_pagination page_obj %}")


def render(page_obj, request=None):
    context = {"page_obj": page_obj}
    if request is not None:
        context["request"] = request
    return TEMPLATE.render(Context(context))


class VibePaginationTests(SimpleTestCase):
    def test_preserves_other_query_params(self):
        request = RequestFactory().get("/list/?tab=all&page=2")
        html = render(Paginator(range(50), 10).page(2), request)
        self.assertIn("Page 2 of 5", html)
        self.assertIn('href="?tab=all&amp;page=3"', html)
        self.assertIn('href="?tab=all&amp;page=1"', html)

    def test_without_request_falls_back_to_bare_param(self):
        html = render(Paginator(range(30), 10).page(1))
        self.assertIn('href="?page=2"', html)
        self.assertNotIn("Previous", html)

    def test_single_page_renders_nothing(self):
        html = render(Paginator(range(5), 10).page(1))
        self.assertNotIn("<nav", html)
