"""ModalFormMixin: template switching, HX-Redirect flow, ?next= safety."""

from django.test import SimpleTestCase


class ModalFormMixinTests(SimpleTestCase):
    def test_plain_get_uses_the_page_template(self):
        response = self.client.get("/edit/")
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "test_page.html")

    def test_htmx_get_renders_the_modal_partial(self):
        response = self.client.get("/edit/", HTTP_HX_REQUEST="true")
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "vibe_ui/form_modal.html")
        self.assertContains(response, 'role="dialog"')
        self.assertContains(response, "Edit note")

    def test_htmx_get_keeps_next_in_the_form_action(self):
        response = self.client.get("/edit/?next=/foo/", HTTP_HX_REQUEST="true")
        self.assertContains(response, 'hx-post="/edit/?next=/foo/"')

    def test_htmx_post_valid_answers_204_with_hx_redirect(self):
        response = self.client.post(
            "/edit/", {"title": "x"}, HTTP_HX_REQUEST="true"
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response.headers["HX-Redirect"], "/done/")

    def test_safe_next_overrides_the_success_url(self):
        response = self.client.post(
            "/edit/?next=/projects/2/", {"title": "x"}, HTTP_HX_REQUEST="true"
        )
        self.assertEqual(response.headers["HX-Redirect"], "/projects/2/")

    def test_unsafe_next_is_ignored(self):
        response = self.client.post(
            "/edit/?next=https://evil.example/", {"title": "x"}, HTTP_HX_REQUEST="true"
        )
        self.assertEqual(response.headers["HX-Redirect"], "/done/")

    def test_plain_post_redirects_normally(self):
        response = self.client.post("/edit/", {"title": "x"})
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.headers["Location"], "/done/")

    def test_htmx_post_invalid_rerenders_with_linked_errors(self):
        response = self.client.post("/edit/", {}, HTTP_HX_REQUEST="true")
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "vibe_ui/form_modal.html")
        # The error container id matches Django 5.2's automatic
        # aria-describedby="<auto_id>_error" on the invalid field.
        self.assertContains(response, 'id="id_title_error"')
        self.assertContains(response, 'class="form-error"')
