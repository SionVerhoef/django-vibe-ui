// Pure copy-format helpers for the value-field copy dropdown (issue #35).
//
// Kept DOM-free and in its own UMD module so the formatting logic can be
// unit-tested under `node --test` without a browser or build step (the
// repo has no JS test runner / bundler). value-field.js consumes it as
// window.VibeCopyFormat; the node test requires it directly.
(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.VibeCopyFormat = api;
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // The supported copy formats, in the order they appear in the dropdown.
    // `number` is the historical default (full-precision bare value).
    var FORMATS = ['number', 'value-unit', 'value-unit-bracket', 'python', 'matlab'];

    // Turn a unit category (e.g. "torque", "rotational_speed") into a
    // usable assignment variable name: lowercase, non-alphanumerics → "_",
    // trimmed. Falls back to "value" when there's nothing usable.
    function sanitizeVarName(category) {
        if (!category) return 'value';
        var v = String(category)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
        return v || 'value';
    }

    // Build the clipboard payload for `formatKey`.
    //   numberStr : the (already rounded/rescaled) number as a string
    //   symbol    : the unit symbol, e.g. "N·m" (may be empty)
    //   varName   : assignment variable name for code formats
    // When no symbol is available the unit-bearing formats degrade
    // gracefully to just the number / a bare assignment.
    function formatCopyPayload(numberStr, symbol, varName, formatKey) {
        var n = (numberStr === null || numberStr === undefined) ? '' : String(numberStr);
        // No number → nothing to copy, regardless of format. Keeps the
        // unit-bearing formats from emitting a stray " N·m" / "x = ;".
        if (n === '') return '';
        var sym = (symbol === null || symbol === undefined) ? '' : String(symbol).trim();
        var name = sanitizeVarName(varName);
        switch (formatKey) {
            case 'value-unit':
                return sym ? n + ' ' + sym : n;
            case 'value-unit-bracket':
                return sym ? n + ' [' + sym + ']' : n;
            case 'python':
                return name + ' = ' + n + (sym ? '  # ' + sym : '');
            case 'matlab':
                return name + ' = ' + n + ';' + (sym ? ' % ' + sym : '');
            case 'number':
            default:
                return n;
        }
    }

    return {
        FORMATS: FORMATS,
        formatCopyPayload: formatCopyPayload,
        sanitizeVarName: sanitizeVarName,
    };
});
