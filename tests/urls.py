"""URL harness: one ModalFormMixin form view, exercised by test_mixins."""

from django import forms
from django.urls import path
from django.views.generic import FormView

from vibe_ui.mixins import ModalFormMixin


class NoteForm(forms.Form):
    title = forms.CharField()


class NoteFormView(ModalFormMixin, FormView):
    form_class = NoteForm
    template_name = "test_page.html"
    success_url = "/done/"
    modal_title = "Edit note"


urlpatterns = [
    path("edit/", NoteFormView.as_view(), name="edit"),
]
