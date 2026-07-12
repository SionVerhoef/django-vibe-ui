"""
The app-shell edit-overlay pattern: form views that open as a modal
instead of a page. An htmx GET renders just vibe_ui/form_modal.html into
app_base's #modal-root; a valid htmx POST answers 204 + HX-Redirect so
the browser lands where the full-page flow would have. Without JS the
same URLs keep serving their standalone pages.
"""

from django.http import HttpResponse
from django.utils.http import url_has_allowed_host_and_scheme


def safe_next_url(request):
    """The validated ?next=/POST-next return target, or None — so a form
    opened from another page can send the user back where they came from
    without an open-redirect hole."""
    candidate = request.POST.get("next") or request.GET.get("next") or ""
    if candidate and url_has_allowed_host_and_scheme(
        candidate,
        allowed_hosts={request.get_host()},
        require_https=request.is_secure(),
    ):
        return candidate
    return None


class ModalFormMixin:
    """Mix into a Create/Update/FormView ahead of the other mixins."""

    modal_title = ""
    modal_submit = "Save changes"
    modal_template_name = "vibe_ui/form_modal.html"

    def _is_htmx(self):
        return self.request.headers.get("HX-Request") == "true"

    def get_modal_title(self):
        return self.modal_title

    def get_template_names(self):
        if self._is_htmx():
            return [self.modal_template_name]
        return super().get_template_names()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(
            modal_title=self.get_modal_title(),
            modal_submit=self.modal_submit,
            # get_full_path keeps ?next= riding along into the POST.
            modal_action=self.request.get_full_path(),
        )
        return context

    def get_success_url(self):
        return safe_next_url(self.request) or super().get_success_url()

    def form_valid(self, form):
        response = super().form_valid(form)
        if self._is_htmx():
            # The redirect must happen at the window level, not inside the
            # swap target — htmx follows the header, cookies (the success
            # flash) survive the round trip.
            return HttpResponse(
                status=204, headers={"HX-Redirect": self.get_success_url()}
            )
        return response
