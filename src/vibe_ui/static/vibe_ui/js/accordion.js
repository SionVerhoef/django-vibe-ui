/* django-vibe-ui — optional accordion enhancer.
   Smoothly animates <details class="faq-item"> OPEN and CLOSE in every browser
   via the Web Animations API. Progressive enhancement: without this script the
   accordion still toggles natively (with the CSS reveal-on-open). Respects
   prefers-reduced-motion.

   Use:  <script src="{% static 'vibe_ui/js/accordion.js' %}" defer></script>
*/
(function () {
  var DURATION = 300;
  var EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

  function reduced() {
    return window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function enhance(item) {
    var summary = item.querySelector('summary');
    if (!summary) return;

    // Wrap everything after <summary> so we can animate one element's height.
    var body = document.createElement('div');
    body.className = 'faq-content';
    body.style.overflow = 'hidden';
    var node = summary.nextSibling;
    while (node) {
      var next = node.nextSibling;
      body.appendChild(node);
      node = next;
    }
    item.appendChild(body);
    item.classList.add('is-enhanced');

    var busy = false;

    summary.addEventListener('click', function (e) {
      e.preventDefault();
      if (busy) return;

      if (!item.open) {
        item.open = true;
        if (reduced() || !body.animate) return;
        busy = true;
        var target = body.scrollHeight;
        var a = body.animate(
          [{ height: '0px', opacity: 0 }, { height: target + 'px', opacity: 1 }],
          { duration: DURATION, easing: EASING }
        );
        a.onfinish = a.oncancel = function () { busy = false; };
      } else {
        if (reduced() || !body.animate) { item.open = false; return; }
        busy = true;
        var start = body.scrollHeight;
        var b = body.animate(
          [{ height: start + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
          { duration: DURATION, easing: EASING }
        );
        b.onfinish = b.oncancel = function () { item.open = false; busy = false; };
      }
    });
  }

  function init() {
    var items = document.querySelectorAll('.faq-item');
    for (var i = 0; i < items.length; i++) enhance(items[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
