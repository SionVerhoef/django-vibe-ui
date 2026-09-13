"""Minimal settings for the package test suite.

No database: every test is a SimpleTestCase (the package ships no
models), so DATABASES stays empty and the suite runs anywhere Django
is installed:

    python -m django test tests --settings=tests.settings
"""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

SECRET_KEY = "vibe-ui-test-suite"
DEBUG = True
ALLOWED_HOSTS = ["testserver"]

INSTALLED_APPS = [
    "django.contrib.staticfiles",
    "vibe_ui",
]

DATABASES = {}

ROOT_URLCONF = "tests.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
            ],
        },
    }
]

STATIC_URL = "/static/"
USE_TZ = True
