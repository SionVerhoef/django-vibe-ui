/* django-vibe-ui — category-nav select navigation.
   Makes [data-category-nav] <select>s navigate to the chosen option's value
   (a URL) on change. Progressive enhancement: on wide screens the link list
   is used instead and this does nothing. */
(function () {
  function init() {
    document.querySelectorAll('select[data-category-nav]').forEach(function (sel) {
      sel.addEventListener('change', function () {
        if (sel.value) window.location.href = sel.value;
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
