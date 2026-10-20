/* RSuta — mathview.js : affichage mathématique (fractions, radicaux, exposants),
   graphiques SVG hors-ligne et tableaux. Aucune dépendance externe.
   Éditeur : BSH - Best Services and House */
(function (G) {
  'use strict';
  const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', 'ⁿ': 'n' };

  // ---------------------------------------------------------------- texte math
  // Entrée : texte DÉJÀ échappé (HTML-safe). Sortie : HTML enrichi.
  function math(h) {
    if (h == null) return '';
    h = String(h);
    // exposants : x^2, x^(n+1), e^(-x), 10^-3
    h = h.replace(/\^\(([^()]{1,30})\)/g, '<sup>$1</sup>');
    h = h.replace(/\^(-?[0-9a-zA-Zπ]{1,6})/g, '<sup>$1</sup>');
    // racines : √(expr) et √12, √x
    h = h.replace(/√\(((?:[^()]|\([^()]*\)){1,50})\)/g, '√<span class="rad">$1</span>');
    h = h.replace(/√([0-9]+(?:[.,][0-9]+)?|[a-zA-Z])(?![0-9a-zA-Z])/g, '√<span class="rad">$1</span>');
    // fractions numériques simples a/b (pas les dates 02/03, ni 1/2/2024, ni unités km/h)
    h = h.replace(/(^|[^0-9/.,\w])(-?)([1-9][0-9]{0,5}|0)\/([1-9][0-9]{0,5})(?![0-9/]|[.,][0-9])/g, (m, pre, sg, a, b) => pre + sg + '<span class="frac"><span>' + a + '</span><span>' + b + '</span></span>');
    // (expr)/(expr)
    h = h.replace(/\(([^()]{1,30})\)\/\(([^()]{1,30})\)/g, '<span class="frac"><span>$1</span><span>$2</span></span>');
    // indices : u_n, u_(n+1)
    h = h.replace(/([a-zA-Z])_\(([^()]{1,10})\)/g, '$1<sub>$2</sub>').replace(/([a-zA-Z])_([0-9a-z+]{1,4})/g, '$1<sub>$2</sub>');
    return h;
  }

  // ---------------------------------------------------------------- tableaux
  function table(t) {
    if (!t || !t.rows || !t.rows.length) return '';
    const e = (s) => math(String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
    const head = t.head ? '<thead><tr>' + t.head.map((c) => '<th>' + e(c) + '</th>').join('') + '</tr></thead>' : '';
    const body = '<tbody>' + t.rows.map((r) => '<tr>' + r.map((c, i) => (i === 0 && t.head ? '<th scope="row">' : '<td>') + e(c) + (i === 0 && t.head ? '</th>' : '</td>')).join('') + '</tr>').join('') + '</tbody>';
    return '<div class="mtable-wrap scroll" role="region" aria-label="Tableau" tabindex="0"><table class="mtable">' + (t.caption ? '<caption>' + e(t.caption) + '</caption>' : '') + head + body + '</table></div>';
  }

  // ---------------------------------------------------------------- graphiques
  const W = 340, H = 240, PAD = 28;
  const nfmt = (v) => { if (Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-3 && v !== 0)) return v.toExponential(1).replace('.', ','); const r = Math.round(v * 100) / 100; return String(r).replace('.', ','); };
  function niceStep(span, target) { const raw = span / (target || 6); const p = Math.pow(10, Math.floor(Math.log10(raw))); const f = raw / p; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p; }
  const polyVal = (c, x) => c.reduce((a, q, k) => a + q * Math.pow(x, k), 0);
  function realRoots(c) { // racines réelles approchées d'un polynôme (balayage + dichotomie)
    const out = []; const deg = c.length - 1; if (deg < 1) return out;
    const lead = c[deg] || 1; const B = 1 + Math.max(...c.slice(0, deg).map((q) => Math.abs(q / lead)));
    const N = 800; let px = -B, pv = polyVal(c, px);
    for (let i = 1; i <= N; i++) {
      const x = -B + (2 * B * i) / N; const v = polyVal(c, x);
      if (Math.abs(v) < 1e-12) { if (!out.some((r) => Math.abs(r - x) < 1e-6)) out.push(x); }
      else if (pv * v < 0) { let a = px, b = x; for (let k = 0; k < 60; k++) { const m = (a + b) / 2; if (polyVal(c, a) * polyVal(c, m) <= 0) b = m; else a = m; } const r = (a + b) / 2; if (!out.some((q) => Math.abs(q - r) < 1e-6)) out.push(r); }
      px = x; pv = v;
    }
    return out;
  }

  function frame(xmin, xmax, ymin, ymax, opts) {
    opts = opts || {};
    if (xmax - xmin < 1e-9) { xmin -= 1; xmax += 1; }
    if (ymax - ymin < 1e-9) { ymin -= 1; ymax += 1; }
    if (opts.equal) { // repère orthonormé
      const sx = (W - 2 * PAD) / (xmax - xmin), sy = (H - 2 * PAD) / (ymax - ymin), s = Math.min(sx, sy);
      const cx = (xmin + xmax) / 2, cy = (ymin + ymax) / 2; const hw = (W - 2 * PAD) / s / 2, hh = (H - 2 * PAD) / s / 2;
      xmin = cx - hw; xmax = cx + hw; ymin = cy - hh; ymax = cy + hh;
    }
    const X = (x) => PAD + ((x - xmin) / (xmax - xmin)) * (W - 2 * PAD);
    const Y = (y) => H - PAD - ((y - ymin) / (ymax - ymin)) * (H - 2 * PAD);
    let g = '';
    const sx = opts.xstep || niceStep(xmax - xmin), sy = niceStep(ymax - ymin, 5);
    for (let x = Math.ceil(xmin / sx) * sx; x <= xmax + 1e-9; x += sx) { const px = X(x).toFixed(1); g += `<line class="gr" x1="${px}" y1="${PAD}" x2="${px}" y2="${H - PAD}"/>`; if (Math.abs(x) > sx / 1e3) g += `<text class="tk" x="${px}" y="${Math.min(H - PAD + 12, Math.max(PAD + 10, Y(0) + 12)).toFixed(1)}" text-anchor="middle">${opts.xlab ? opts.xlab(x) : nfmt(x)}</text>`; }
    for (let y = Math.ceil(ymin / sy) * sy; y <= ymax + 1e-9; y += sy) { const py = Y(y).toFixed(1); g += `<line class="gr" x1="${PAD}" y1="${py}" x2="${W - PAD}" y2="${py}"/>`; if (Math.abs(y) > sy / 1e3) g += `<text class="tk" x="${Math.min(W - PAD - 2, Math.max(PAD + 2, X(0) - 4)).toFixed(1)}" y="${(+py + 3).toFixed(1)}" text-anchor="end">${nfmt(y)}</text>`; }
    // axes
    const ax = Math.min(H - PAD, Math.max(PAD, Y(0))), ay = Math.min(W - PAD, Math.max(PAD, X(0)));
    g += `<line class="ax" x1="${PAD - 6}" y1="${ax.toFixed(1)}" x2="${W - PAD + 8}" y2="${ax.toFixed(1)}" marker-end="url(#rsar)"/>`;
    g += `<line class="ax" x1="${ay.toFixed(1)}" y1="${H - PAD + 6}" x2="${ay.toFixed(1)}" y2="${PAD - 8}" marker-end="url(#rsar)"/>`;
    g += `<text class="lb" x="${W - PAD + 6}" y="${(ax - 6).toFixed(1)}" text-anchor="end">${opts.xname || 'x'}</text><text class="lb" x="${(ay + 6).toFixed(1)}" y="${PAD - 4}">${opts.yname || 'y'}</text>`;
    if (xmin <= 0 && xmax >= 0 && ymin <= 0 && ymax >= 0) g += `<text class="tk" x="${(X(0) - 4).toFixed(1)}" y="${(Y(0) + 12).toFixed(1)}" text-anchor="end">O</text>`;
    return { X, Y, g, xmin, xmax, ymin, ymax };
  }
  function curve(F, f, xmin, xmax, cls, breaks) {
    let d = '', pen = false; const N = 300;
    for (let i = 0; i <= N; i++) {
      const x = xmin + ((xmax - xmin) * i) / N; let y;
      try { y = f(x); } catch (e) { y = NaN; }
      const nearBreak = (breaks || []).some((b) => Math.abs(x - b) < (xmax - xmin) / N * 1.01);
      if (!isFinite(y) || nearBreak || y < F.ymin - (F.ymax - F.ymin) * 2 || y > F.ymax + (F.ymax - F.ymin) * 2) { pen = false; continue; }
      d += (pen ? 'L' : 'M') + F.X(x).toFixed(1) + ' ' + F.Y(y).toFixed(1); pen = true;
    }
    return `<path class="${cls || 'cv'}" d="${d}"/>`;
  }
  const dot = (F, x, y, label, cls) => `<circle class="${cls || 'pt'}" cx="${F.X(x).toFixed(1)}" cy="${F.Y(y).toFixed(1)}" r="4"/>` + (label ? `<text class="pl" x="${(F.X(x) + 6).toFixed(1)}" y="${(F.Y(y) - 6).toFixed(1)}">${label}</text>` : '');
  function wrap(inner, title) {
    return `<figure class="mplot"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${title || 'Graphique'}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="rsar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="arh"/></marker><clipPath id="rsclip"><rect x="${PAD}" y="${PAD}" width="${W - 2 * PAD}" height="${H - 2 * PAD}"/></clipPath></defs>${inner}</svg>${title ? `<figcaption>${title}</figcaption>` : ''}</figure>`;
  }
  function rangeY(f, xmin, xmax, clampAbs) {
    const ys = []; for (let i = 0; i <= 200; i++) { const x = xmin + ((xmax - xmin) * i) / 200; let y; try { y = f(x); } catch (e) { y = NaN; } if (isFinite(y) && Math.abs(y) < (clampAbs || 1e6)) ys.push(y); }
    if (!ys.length) return [-5, 5];
    ys.sort((a, b) => a - b); let lo = ys[Math.floor(ys.length * 0.03)], hi = ys[Math.ceil(ys.length * 0.97) - 1];
    lo = Math.min(lo, 0); hi = Math.max(hi, 0); const m = (hi - lo) * 0.12 || 1; return [lo - m, hi + m];
  }

  function plot(spec) {
    if (!spec || !spec.kind) return '';
    try {
      const k = spec.kind;
      if (k === 'poly') {
        const c = spec.c || []; const f = (x) => polyVal(c, x); const v = spec.v || 'x';
        const keys = [...realRoots(c), ...((spec.pts || []).map((p) => p.x)), ...(spec.area || []), 0];
        let xmin = Math.min(...keys), xmax = Math.max(...keys); const span = Math.max(4, xmax - xmin); xmin -= span * 0.35; xmax += span * 0.35;
        const [ymin, ymax] = rangeY(f, xmin, xmax); const F = frame(xmin, xmax, ymin, ymax, { xname: v });
        let inner = F.g; let area = '';
        if (spec.area) { const [a, b] = spec.area; let d = `M${F.X(a).toFixed(1)} ${F.Y(0).toFixed(1)}`; for (let i = 0; i <= 80; i++) { const x = a + ((b - a) * i) / 80; d += `L${F.X(x).toFixed(1)} ${F.Y(f(x)).toFixed(1)}`; } d += `L${F.X(b).toFixed(1)} ${F.Y(0).toFixed(1)}Z`; area = `<path class="ar" d="${d}"/>`; }
        inner += `<g clip-path="url(#rsclip)">${area}${curve(F, f, xmin, xmax)}</g>`;
        (spec.pts || []).forEach((p) => { inner += dot(F, p.x, p.y, '(' + nfmt(p.x) + ' ; ' + nfmt(p.y) + ')'); });
        realRoots(c).slice(0, 4).forEach((r) => { inner += dot(F, r, 0, '', 'pt0'); });
        return wrap(inner, 'Courbe de ' + (spec.name || 'f') + (spec.area ? ' — aire sous la courbe entre ' + nfmt(spec.area[0]) + ' et ' + nfmt(spec.area[1]) : ''));
      }
      if (k === 'rat') {
        const n = spec.n || [1], d = spec.d || [1]; const f = (x) => polyVal(n, x) / polyVal(d, x);
        const va = (spec.asym && spec.asym.v && spec.asym.v.length ? spec.asym.v : realRoots(d)); const ha = (spec.asym && spec.asym.h) || [];
        const keys = [...va, ...realRoots(n), 0]; let xmin = Math.min(...keys), xmax = Math.max(...keys); const span = Math.max(6, xmax - xmin); xmin -= span * 0.4; xmax += span * 0.4;
        let [ymin, ymax] = rangeY(f, xmin, xmax, 50); ha.forEach((h) => { ymin = Math.min(ymin, h - 2); ymax = Math.max(ymax, h + 2); });
        const F = frame(xmin, xmax, ymin, ymax); let inner = F.g;
        va.forEach((a) => { inner += `<line class="as" x1="${F.X(a).toFixed(1)}" y1="${PAD}" x2="${F.X(a).toFixed(1)}" y2="${H - PAD}"/><text class="pl" x="${(F.X(a) + 3).toFixed(1)}" y="${PAD + 10}">x = ${nfmt(a)}</text>`; });
        ha.forEach((h) => { inner += `<line class="as" x1="${PAD}" y1="${F.Y(h).toFixed(1)}" x2="${W - PAD}" y2="${F.Y(h).toFixed(1)}"/><text class="pl" x="${W - PAD - 4}" y="${(F.Y(h) - 4).toFixed(1)}" text-anchor="end">y = ${nfmt(h)}</text>`; });
        inner += `<g clip-path="url(#rsclip)">${curve(F, f, xmin, xmax, 'cv', va)}</g>`;
        return wrap(inner, 'Courbe de ' + (spec.name || 'f') + ' et ses asymptotes');
      }
      if (k === 'points') {
        const pts = spec.pts || []; if (!pts.length) return '';
        const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
        const F = frame(Math.min(0, ...xs) - 0.5, Math.max(...xs) + 0.5, Math.min(0, ...ys) - (Math.max(...ys) - Math.min(0, ...ys)) * 0.1, Math.max(0, ...ys) * 1.12 + 0.5, { xname: spec.xlabel || 'n', yname: (spec.name || 'u') + 'ₙ', xstep: 1 });
        let inner = F.g; pts.forEach((p) => { inner += `<line class="as" x1="${F.X(p.x).toFixed(1)}" y1="${F.Y(0).toFixed(1)}" x2="${F.X(p.x).toFixed(1)}" y2="${F.Y(p.y).toFixed(1)}"/>` + dot(F, p.x, p.y); });
        return wrap(inner, 'Premiers termes de la suite (' + (spec.name || 'u') + 'ₙ)');
      }
      if (k === 'trig') {
        const fn = Math[spec.fn] || Math.cos; const xmax = 2 * Math.PI;
        const lim = spec.fn === 'tan' ? 4 : 1.4;
        const F = frame(-0.3, xmax + 0.3, -lim, lim, { xstep: Math.PI / 2, xlab: (x) => { const q = Math.round(x / (Math.PI / 2)); return ['0', 'π/2', 'π', '3π/2', '2π'][q] || ''; } });
        let inner = F.g + `<g clip-path="url(#rsclip)">${curve(F, fn, 0, xmax, 'cv', spec.fn === 'tan' ? [Math.PI / 2, 3 * Math.PI / 2] : [])}</g>`;
        if (isFinite(spec.y)) inner += `<line class="as y" x1="${PAD}" y1="${F.Y(spec.y).toFixed(1)}" x2="${W - PAD}" y2="${F.Y(spec.y).toFixed(1)}"/><text class="pl" x="${W - PAD - 2}" y="${(F.Y(spec.y) - 5).toFixed(1)}" text-anchor="end">y = ${nfmt(spec.y)}</text>`;
        (spec.sols || []).filter((x) => x >= -1e-9 && x <= xmax + 1e-9).forEach((x) => { inner += `<line class="as" x1="${F.X(x).toFixed(1)}" y1="${F.Y(0).toFixed(1)}" x2="${F.X(x).toFixed(1)}" y2="${F.Y(spec.y).toFixed(1)}"/>` + dot(F, x, spec.y); });
        return wrap(inner, 'Solutions lues sur la courbe de ' + spec.fn + ' sur [0 ; 2π[');
      }
      if (k === 'scatter') {
        const pts = spec.pts || []; if (!pts.length) return '';
        const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y); const dx = (Math.max(...xs) - Math.min(...xs)) * 0.15 || 1, dy = (Math.max(...ys) - Math.min(...ys)) * 0.15 || 1;
        const F = frame(Math.min(0, Math.min(...xs) - dx), Math.max(...xs) + dx, Math.min(0, Math.min(...ys) - dy), Math.max(...ys) + dy);
        let inner = F.g; if (spec.line) { const [a, b] = spec.line; inner += `<g clip-path="url(#rsclip)">${curve(F, (x) => a * x + b, F.xmin, F.xmax, 'cv')}</g>`; }
        pts.forEach((p) => { inner += dot(F, p.x, p.y); });
        const G2 = { x: xs.reduce((a, b) => a + b, 0) / xs.length, y: ys.reduce((a, b) => a + b, 0) / ys.length }; inner += dot(F, G2.x, G2.y, 'G', 'pt0');
        return wrap(inner, 'Nuage de points et droite d\'ajustement' + (spec.line ? ' y = ' + nfmt(spec.line[0]) + 'x ' + (spec.line[1] < 0 ? '− ' + nfmt(-spec.line[1]) : '+ ' + nfmt(spec.line[1])) : ''));
      }
      if (k === 'geo') {
        const pts = spec.pts || []; if (!pts.length) return '';
        const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
        const F = frame(Math.min(0, ...xs) - 1, Math.max(0, ...xs) + 1, Math.min(0, ...ys) - 1, Math.max(0, ...ys) + 1, { equal: true });
        const by = {}; pts.forEach((p) => { by[p.label] = p; });
        let inner = F.g; if (pts.length >= 3 && (spec.segs || []).length >= 3) inner += `<polygon class="ar" points="${(spec.segs || []).map((s) => by[s[0]]).filter(Boolean).map((p) => F.X(p.x).toFixed(1) + ',' + F.Y(p.y).toFixed(1)).join(' ')}"/>`;
        (spec.segs || []).forEach((s) => { const a = by[s[0]], b = by[s[1]]; if (a && b) inner += `<line class="sg" x1="${F.X(a.x).toFixed(1)}" y1="${F.Y(a.y).toFixed(1)}" x2="${F.X(b.x).toFixed(1)}" y2="${F.Y(b.y).toFixed(1)}"/>`; });
        pts.forEach((p) => { inner += dot(F, p.x, p.y, p.label + '(' + nfmt(p.x) + ' ; ' + nfmt(p.y) + ')'); });
        return wrap(inner, 'Figure dans un repère orthonormé');
      }
    } catch (e) { return ''; }
    return '';
  }


  // ---------------------------------------------------------------- clavier mathématique
  // [affiché, inséré, décalage du curseur depuis la fin]
  const KEYS = [
    ['x', 'x'], ['y', 'y'], ['²', '²'], ['³', '³'], ['xⁿ', '^'], ['√', '√()', 1], ['π', 'π'], ['a/b', '/'], ['( )', '()', 1], ['=', ' = '],
    ['≤', ' ≤ '], ['≥', ' ≥ '], ['≠', ' ≠ '], ['×', ' × '], ['÷', ' ÷ '], ['±', '±'], ['∞', '∞'], ['i', 'i'], ['[ ; ]', '[ ; ]', 3], [';', ' ; '],
    ['sin', 'sin()', 1], ['cos', 'cos()', 1], ['tan', 'tan()', 1], ['ln', 'ln()', 1], ['eˣ', 'e^()', 1], ['∫', 'intégrale de 0 à 1 de () dx', 4], ['lim', 'limite en +∞ de ', 0], ['uₙ', 'uₙ'], ['→', ' → '], ['%', ' %']
  ];
  function keypad(id, open) {
    return `<div class="mkpad${open ? '' : ' hidden'}" id="mk-${id}" role="group" aria-label="Clavier mathématique">${KEYS.map((k, i) => `<button type="button" class="mk" onmousedown="event.preventDefault()" onclick="RSutaView.key('${id}',${i})" aria-label="Insérer ${k[0]}">${k[0]}</button>`).join('')}</div>`;
  }
  function key(id, i) {
    const el = document.getElementById(id); const k = KEYS[i]; if (!el || !k) return;
    const a = el.selectionStart == null ? el.value.length : el.selectionStart, b = el.selectionEnd == null ? a : el.selectionEnd;
    el.value = el.value.slice(0, a) + k[1] + el.value.slice(b);
    const pos = a + k[1].length - (k[2] || 0); el.focus(); try { el.setSelectionRange(pos, pos); } catch (e) { /* */ }
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function toggle(id, btn) { const p = document.getElementById('mk-' + id); if (!p) return; p.classList.toggle('hidden'); if (btn) btn.classList.toggle('on', !p.classList.contains('hidden')); const el = document.getElementById(id); if (el) el.focus(); }

  G.RSutaView = { math, plot, table, keypad, key, toggle, KEYS, _realRoots: realRoots, SUP };
  if (typeof module !== 'undefined') module.exports = G.RSutaView;
})(typeof window !== 'undefined' ? window : globalThis);
