/* Edit-overlay + auto-submit behaviors for the app shell. Edit buttons
   hx-get a vibe_ui.mixins.ModalFormMixin URL into #modal-root; this
   file owns closing it (× / Cancel via [data-modal-close], scrim click,
   Escape), focuses the first field when one lands, keeps Tab inside the
   dialog, locks the page scroll behind it, and hands focus back to the
   opener on close. form[data-autosubmit] posts itself when a control
   changes — for state dropdowns outside htmx swap targets. */
(function () {
  var root = document.getElementById("modal-root");
  var opener = null;

  function isOpen() {
    return !!(root && root.firstElementChild);
  }

  function close() {
    if (!isOpen()) return;
    root.innerHTML = "";
    document.body.classList.remove("modal-open");
    if (opener && document.contains(opener)) opener.focus();
    opener = null;
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-modal-close]")) {
      close();
      return;
    }
    // Only a click on the scrim itself — not anything inside the dialog.
    if (e.target.classList && e.target.classList.contains("modal-scrim")) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      close();
      return;
    }
    // form_modal.html asserts aria-modal="true" — enforce it: Tab cycles
    // inside the dialog instead of escaping into the page behind.
    if (e.key !== "Tab" || !isOpen()) return;
    var focusables = root.querySelectorAll(
      "a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled])"
    );
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (!root.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  document.body.addEventListener("htmx:afterSwap", function (e) {
    if (e.target !== root) return;
    if (!isOpen()) {
      document.body.classList.remove("modal-open");
      return;
    }
    document.body.classList.add("modal-open");
    // First swap = the open: remember the trigger so close() can give
    // focus back. On a validation re-render focus is already lost to
    // <body>, so the original opener is kept.
    if (document.activeElement !== document.body && !root.contains(document.activeElement)) {
      opener = document.activeElement;
    }
    var field = root.querySelector("input:not([type=hidden]), select, textarea");
    if (field) field.focus();
  });

  document.addEventListener("change", function (e) {
    var form = e.target.closest("form[data-autosubmit]");
    if (form) form.submit();
  });
})();
