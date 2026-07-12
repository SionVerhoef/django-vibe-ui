"""Every url(...) reference inside the shipped CSS must resolve to a
shipped file. Regression guard for the v0.2.1 class of bug, where
typography.css referenced font files that were never packaged and
production collectstatic (manifest storage) failed hard."""

import re
from pathlib import Path

from django.test import SimpleTestCase

import vibe_ui

CSS_ROOT = Path(vibe_ui.__file__).resolve().parent / "static" / "vibe_ui" / "css"
URL_RE = re.compile(r"""url\(\s*['"]?([^'")]+)['"]?\s*\)""")


class StaticIntegrityTests(SimpleTestCase):
    def test_css_root_exists(self):
        self.assertTrue(CSS_ROOT.is_dir(), CSS_ROOT)

    def test_all_css_url_references_resolve(self):
        missing = []
        for css_file in sorted(CSS_ROOT.rglob("*.css")):
            for ref in URL_RE.findall(css_file.read_text()):
                if ref.startswith(("data:", "http:", "https:", "#")):
                    continue
                target = (css_file.parent / ref.split("?")[0].split("#")[0]).resolve()
                if not target.is_file():
                    missing.append(f"{css_file.relative_to(CSS_ROOT)} -> {ref}")
        self.assertEqual(missing, [], "unresolved url() references:\n" + "\n".join(missing))

    def test_both_entry_stylesheets_ship(self):
        self.assertTrue((CSS_ROOT / "ui.css").is_file())
        self.assertTrue((CSS_ROOT / "app.css").is_file())
