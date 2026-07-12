/* App shell behavior: theme toggle + nav rail collapse, persisted in
 * localStorage. The matching pre-paint snippet
 * (templates/vibe_ui/prepaint.html) applies the stored state to <html>
 * before first render; this file only wires the buttons. Everything
 * degrades: without JS the shell renders with the default light theme
 * and collapsed rail. */
(function () {
  "use strict";

  var root = document.documentElement;

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }

  var themeButton = document.getElementById("theme-toggle");
  if (themeButton) {
    themeButton.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store("vibe-theme", next);
      var label = themeButton.querySelector(".nav-item-label");
      if (label) label.textContent = next === "dark" ? "Dark mode" : "Light mode";
    });
  }

  var navButton = document.getElementById("nav-toggle");
  if (navButton) {
    navButton.setAttribute(
      "aria-expanded",
      root.getAttribute("data-nav") === "expanded" ? "true" : "false"
    );
    navButton.addEventListener("click", function () {
      var expanded = root.getAttribute("data-nav") === "expanded";
      if (expanded) root.removeAttribute("data-nav");
      else root.setAttribute("data-nav", "expanded");
      navButton.setAttribute("aria-expanded", expanded ? "false" : "true");
      store("vibe-nav", expanded ? "collapsed" : "expanded");
    });
  }

  /* Mobile: the rail becomes an overlay drawer. */
  var mobileButton = document.getElementById("mobile-nav-toggle");
  function closeDrawer(refocus) {
    if (!root.hasAttribute("data-nav-open")) return;
    root.removeAttribute("data-nav-open");
    if (mobileButton) {
      mobileButton.setAttribute("aria-expanded", "false");
      // Escape hands focus back to the toggle; a scrim click does not.
      if (refocus) mobileButton.focus();
    }
  }
  if (mobileButton) {
    mobileButton.addEventListener("click", function () {
      if (root.hasAttribute("data-nav-open")) {
        closeDrawer();
        return;
      }
      root.setAttribute("data-nav-open", "");
      mobileButton.setAttribute("aria-expanded", "true");
      var nav = document.getElementById("app-nav");
      var first = nav && nav.querySelector("a, button");
      if (first) first.focus();
    });
  }
  var scrim = document.getElementById("app-scrim");
  if (scrim) scrim.addEventListener("click", function () { closeDrawer(); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeDrawer(true);
  });

  /* Drag-drop for .file-upload-drop zones: a native drop on a <label>
   * never reaches the hidden file input, so mirror dataTransfer.files
   * onto it and fire a bubbling change — that drives an htmx
   * auto-submit / filename display exactly like a picked file.
   * Delegated on document so htmx-swapped content stays wired. */
  function dropZone(event) {
    var target = event.target;
    return target.closest ? target.closest(".file-upload-drop") : null;
  }
  document.addEventListener("dragover", function (event) {
    var zone = dropZone(event);
    if (!zone) return;
    event.preventDefault(); // required, or the drop event never fires
    zone.classList.add("is-dragover");
  });
  document.addEventListener("dragleave", function (event) {
    var zone = dropZone(event);
    if (zone) zone.classList.remove("is-dragover");
  });
  document.addEventListener("drop", function (event) {
    var zone = dropZone(event);
    if (!zone) return;
    event.preventDefault();
    zone.classList.remove("is-dragover");
    var input = zone.querySelector('input[type="file"]');
    if (!input || !event.dataTransfer || !event.dataTransfer.files.length) return;
    input.files = event.dataTransfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });

  /* htmx outerHTML swaps replace the focused control and hx-disabled-elt
   * drops focus even earlier, so remember where focus was when a request
   * starts and put it back on the swapped-in copy. Captured at
   * configRequest — before htmx disables anything — and only when the
   * control sits inside the swap target (a poll refreshing another panel
   * must not steal focus). */
  var refocus = null;
  document.body.addEventListener("htmx:configRequest", function (event) {
    var active = document.activeElement;
    if (!active || active === document.body) return;
    var target = event.detail.target;
    if (!target || !target.contains(active)) return;
    if (active.id) {
      refocus = "#" + active.id;
    } else if (active.name) {
      var scope = active.closest("[id]");
      if (scope) refocus = "#" + scope.id + " [name='" + active.name + "']";
    }
  });
  document.body.addEventListener("htmx:afterSettle", function () {
    if (!refocus) return;
    var el = document.querySelector(refocus);
    refocus = null;
    if (el && !el.disabled) el.focus();
  });
})();
