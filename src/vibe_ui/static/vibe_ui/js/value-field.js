/* django-vibe-ui — value-field widget (generic, domain-free).
   A labeled input/output field with a trailing UNIT SELECTOR, a copy button,
   and a copy-format popover. It owns NO domain logic: the SITE fills the unit
   <select> (el.valueField.setUnits([...])) and listens for "valuefield:change"
   to do any conversion, pushing results back via el.valueField.setValue().

   Depends on copy-format.js (window.VibeCopyFormat) for the copy payloads.

   Per-element API (el.valueField):
     getValue()  setValue(str)  getUnit()  setUnit(key)  getFormat()
     setUnits([{ value, label, symbol }])
   Event (bubbles): "valuefield:change" -> detail { fieldId, value, unit }
*/
(function () {
  'use strict';

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', '');
        ta.style.position = 'absolute'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        resolve();
      } catch (e) { reject(e); }
    });
  }

  function attach(root) {
    if (root.valueField) return root.valueField;

    var input   = root.querySelector('.value-field-input');
    var unitSel = root.querySelector('.value-field-unit');
    var copyBtn = root.querySelector('.value-field-copy');
    var menuBtn = root.querySelector('.value-field-copy-menu');
    var panel   = root.querySelector('.value-field-copy-panel');
    var group   = root.querySelector('.value-field-copy-group');
    var fieldId = root.dataset.fieldId || '';
    var varName = root.dataset.category || fieldId || 'value';
    var format  = 'number';

    function unitSymbol() {
      if (!unitSel || unitSel.selectedIndex < 0) return '';
      var opt = unitSel.options[unitSel.selectedIndex];
      return (opt && (opt.dataset.symbol || opt.textContent || '')).trim();
    }

    function fire() {
      root.dispatchEvent(new CustomEvent('valuefield:change', {
        bubbles: true,
        detail: {
          fieldId: fieldId,
          value: input ? input.value : '',
          unit: unitSel ? unitSel.value : null,
        },
      }));
    }

    function doCopy() {
      var fmt = window.VibeCopyFormat;
      var text = fmt
        ? fmt.formatCopyPayload(input.value, unitSymbol(), varName, format)
        : input.value;
      if (!text) return;
      copyToClipboard(text).then(function () {
        if (!copyBtn) return;
        copyBtn.classList.add('value-field-copy--done');
        setTimeout(function () {
          copyBtn.classList.remove('value-field-copy--done');
        }, 1200);
      }).catch(function (e) { console.warn('value-field copy failed:', e); });
    }

    function openPanel(open) {
      if (!panel || !menuBtn) return;
      panel.hidden = !open;
      if (group) group.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    }

    if (input)   input.addEventListener('input', fire);
    if (unitSel) unitSel.addEventListener('change', fire);
    if (copyBtn) copyBtn.addEventListener('click', doCopy);

    if (menuBtn && panel) {
      menuBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        openPanel(panel.hidden);
      });
      panel.querySelectorAll('.value-field-copy-format').forEach(function (btn) {
        btn.addEventListener('click', function () {
          format = btn.dataset.copyFormat || 'number';
          panel.querySelectorAll('.value-field-copy-format').forEach(function (b) {
            b.setAttribute('aria-pressed', String(b === btn));
          });
          openPanel(false);
          doCopy();
        });
      });
    }

    root.valueField = {
      getValue: function () { return input ? input.value : ''; },
      setValue: function (v) { if (input) input.value = (v == null ? '' : String(v)); },
      getUnit:  function () { return unitSel ? unitSel.value : null; },
      setUnit:  function (u) { if (unitSel) unitSel.value = u; },
      getFormat: function () { return format; },
      setUnits: function (opts) {
        if (!unitSel) return;
        unitSel.innerHTML = '';
        (opts || []).forEach(function (o) {
          var el = document.createElement('option');
          el.value = o.value;
          el.textContent = (o.label != null ? o.label : o.value);
          if (o.symbol != null) el.dataset.symbol = o.symbol;
          unitSel.appendChild(el);
        });
        if (root.dataset.defaultUnit) unitSel.value = root.dataset.defaultUnit;
      },
    };
    return root.valueField;
  }

  function attachAll() {
    document.querySelectorAll('.value-field').forEach(attach);
  }

  // One delegated handler for ALL value-fields: close any open copy-format
  // popover on an outside click or Escape (instead of a listener per instance).
  function closeOpenPanels(target) {
    document.querySelectorAll('.value-field-copy-group.is-open').forEach(function (group) {
      var root = group.closest('.value-field');
      if (root && (!target || !root.contains(target))) {
        var panel = root.querySelector('.value-field-copy-panel');
        var menuBtn = root.querySelector('.value-field-copy-menu');
        if (panel) panel.hidden = true;
        group.classList.remove('is-open');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
  document.addEventListener('click', function (e) { closeOpenPanels(e.target); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeOpenPanels(null); });

  window.VibeValueField = { attach: attach, attachAll: attachAll };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachAll);
  } else {
    attachAll();
  }
})();
