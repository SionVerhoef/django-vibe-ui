/*
 * num-base-field.js — standalone numeric field with DEC/HEX/BIN-MSB/BIN-LSB base selector.
 *
 * Independent of value-field.js (which owns unit conversion). This module
 * parses/formats unsigned integers up to `data-width-bits` bits wide and
 * dispatches "numbase:change" events from the root element.
 *
 * API (per element):
 *   el.numBase.getValue()    → integer
 *   el.numBase.setValue(n)   → updates the input to reflect `n` in the current base
 *   el.numBase.getBase()     → 'dec' | 'hex' | 'bin-msb' | 'bin-lsb'
 *   el.numBase.setBase(b)    → switches base and reformats
 *
 * All attached elements are initialized on DOMContentLoaded. Dynamic elements
 * can be initialized explicitly by calling window.NumBaseField.attach(el).
 */
(function() {
    'use strict';

    function reverseBits(value, width) {
        let out = 0;
        for (let i = 0; i < width; i++) {
            if (value & (1 << i)) out |= 1 << (width - 1 - i);
        }
        return out >>> 0;
    }

    function format(value, base, width) {
        value = value & (((1 << width) >>> 0) - 1);
        const pad = width;
        switch (base) {
            case 'hex':
                return '0x' + value.toString(16).toUpperCase().padStart(Math.ceil(width / 4), '0');
            case 'bin-msb': {
                const bin = value.toString(2).padStart(pad, '0');
                return groupNibbles(bin);
            }
            case 'bin-lsb': {
                const msb = value.toString(2).padStart(pad, '0');
                // LSB-first display: reverse character order so bit 0 appears on the left.
                const lsb = msb.split('').reverse().join('');
                return groupNibbles(lsb);
            }
            case 'dec':
            default:
                return String(value);
        }
    }

    function groupNibbles(binStr) {
        // Space every 4 characters for readability. Works for both MSB and LSB
        // strings — the grouping is purely visual.
        return binStr.replace(/(.{4})(?=.)/g, '$1 ');
    }

    function parse(raw, base, width) {
        const mask = ((1 << width) >>> 0) - 1;
        const s = String(raw || '').trim();
        if (s === '') return { ok: true, value: 0 };

        try {
            switch (base) {
                case 'hex': {
                    const hex = s.replace(/^0[xX]/, '');
                    if (!/^[0-9a-fA-F]+$/.test(hex)) return { ok: false, error: 'Invalid hex' };
                    const raw_n = parseInt(hex, 16);
                    return makeOk(raw_n, mask, width);
                }
                case 'bin-msb': {
                    const clean = s.replace(/\s+/g, '');
                    if (!/^[01]+$/.test(clean)) return { ok: false, error: 'Binary: 0/1 only' };
                    if (clean.length > width) return { ok: false, error: `Max ${width} bits` };
                    return { ok: true, value: parseInt(clean, 2) & mask };
                }
                case 'bin-lsb': {
                    const clean = s.replace(/\s+/g, '');
                    if (!/^[01]+$/.test(clean)) return { ok: false, error: 'Binary: 0/1 only' };
                    if (clean.length > width) return { ok: false, error: `Max ${width} bits` };
                    // LSB-first input: reverse characters so parseInt(., 2) reads bit-(n-1)..bit-0.
                    const msb = clean.split('').reverse().join('');
                    return { ok: true, value: parseInt(msb, 2) & mask };
                }
                case 'dec':
                default:
                    if (s.toLowerCase().startsWith('0x')) {
                        return { ok: false, error: 'Switch base to HEX for 0x values' };
                    }
                    if (!/^-?[0-9]+$/.test(s)) return { ok: false, error: 'Digits only' };
                    const n = parseInt(s, 10);
                    if (n < 0) return { ok: false, error: 'Must be ≥ 0' };
                    return makeOk(n, mask, width);
            }
        } catch (e) {
            return { ok: false, error: 'Invalid number' };
        }
    }

    // Mask the raw value to ``width`` bits and flag a non-fatal ``notice``
    // when the input had more bits than the field can hold. The field still
    // resolves to a valid value — the notice surfaces via the existing
    // hint slot so users pasting a 32-bit register read see why only the
    // lower 16 bits decode.
    function makeOk(raw_n, mask, width) {
        if (raw_n > mask) {
            return {
                ok: true,
                value: raw_n & mask,
                notice: `Field is ${width}-bit; using lower ${width} bits of input.`,
            };
        }
        return { ok: true, value: raw_n & mask };
    }

    function fire(el, value, base, raw, error) {
        el.dispatchEvent(new CustomEvent('numbase:change', {
            bubbles: true,
            detail: { value: value, base: base, raw: raw, error: error || null },
        }));
    }

    function copyToClipboard(text) {
        // navigator.clipboard is preferred; fall back to a textarea exec
        // for older browsers and non-secure contexts.
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function(resolve, reject) {
            try {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.setAttribute('readonly', '');
                ta.style.position = 'absolute';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                resolve();
            } catch (e) { reject(e); }
        });
    }

    function attach(root) {
        if (root.numBase) return root.numBase;

        const input = root.querySelector('.num-field-input');
        const select = root.querySelector('.num-field-base');
        const copyBtn = root.querySelector('.num-field-copy');
        const hintEl = root.querySelector('.num-field-hint');
        const width = parseInt(root.dataset.widthBits, 10) || 16;

        function setHint(msg) {
            if (!hintEl) return;
            hintEl.textContent = msg || '';
            hintEl.classList.toggle('num-field-hint--visible', !!msg);
        }

        // Internal state — the authoritative value lives here, not in the input.
        let currentValue = 0;

        function setBase(newBase) {
            if (!['dec', 'hex', 'bin-msb', 'bin-lsb'].includes(newBase)) return;
            root.dataset.base = newBase;
            if (select.value !== newBase) select.value = newBase;
            input.value = format(currentValue, newBase, width);
            // Binary modes need more room — swap inputmode so mobile keyboards
            // don't show a number pad that can't type spaces.
            if (newBase === 'dec') input.inputMode = 'numeric';
            else if (newBase === 'hex') input.inputMode = 'text';
            else input.inputMode = 'text';
            root.classList.toggle('num-field--wide', newBase.startsWith('bin'));
        }

        function setValue(n) {
            currentValue = n & (((1 << width) >>> 0) - 1);
            input.value = format(currentValue, root.dataset.base, width);
        }

        function getValue() { return currentValue; }
        function getBase() { return root.dataset.base; }

        input.addEventListener('input', function() {
            const result = parse(input.value, root.dataset.base, width);
            if (result.ok) {
                currentValue = result.value;
                root.classList.remove('num-field--error');
                setHint(result.notice || '');
                fire(root, currentValue, root.dataset.base, input.value);
            } else {
                root.classList.add('num-field--error');
                setHint(result.error);
                fire(root, null, root.dataset.base, input.value, result.error);
            }
        });

        select.addEventListener('change', function() {
            setBase(select.value);
            // Re-validate the (possibly reformatted) input under the new base
            // so a stale error hint from the previous base doesn't linger.
            const result = parse(input.value, root.dataset.base, width);
            if (result.ok) {
                root.classList.remove('num-field--error');
                setHint(result.notice || '');
            } else {
                root.classList.add('num-field--error');
                setHint(result.error);
            }
            fire(root, currentValue, root.dataset.base, input.value);
        });

        if (copyBtn) {
            let resetTimer = null;
            copyBtn.addEventListener('click', function() {
                copyToClipboard(input.value).then(function() {
                    copyBtn.classList.add('num-field-copy--done');
                    if (resetTimer) clearTimeout(resetTimer);
                    resetTimer = setTimeout(function() {
                        copyBtn.classList.remove('num-field-copy--done');
                    }, 1200);
                }).catch(function(e) {
                    console.warn('num-base-field copy failed:', e);
                });
            });
        }

        // Initial sync — input may already have a value from template rendering.
        setBase(root.dataset.base || 'dec');
        const initial = parse(input.value, root.dataset.base, width);
        if (initial.ok) currentValue = initial.value;
        input.value = format(currentValue, root.dataset.base, width);

        root.numBase = {
            getValue: getValue,
            setValue: setValue,
            getBase: getBase,
            setBase: setBase,
            width: width,
        };
        return root.numBase;
    }

    function attachAll() {
        document.querySelectorAll('.num-field').forEach(attach);
    }

    window.NumBaseField = { attach: attach, attachAll: attachAll, format: format, parse: parse };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachAll);
    } else {
        attachAll();
    }
})();
