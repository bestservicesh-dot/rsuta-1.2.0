/* RSuta v1.1 — Solveurs mathématiques avancés (HORS-LIGNE)
   Suites, nombres complexes, trigonométrie, limites de fonctions rationnelles, intégrales, dénombrement et probabilités.
   Chaque solveur renvoie un résultat en 3 étapes (format du prompt officiel) et s'enregistre dans RSutaEngine. */
(function (G) {
  'use strict';
  const E = G.RSutaEngine || (typeof require !== 'undefined' ? require('./engine.js') : null);
  const H = E._h; const { res, L, strip, lc, M } = H;
  const { Q, fmt, fmtNum } = M;

  // ---------------------------------------------------------------- utilitaires communs (exportés pour engine3.js)
  const f2 = (x, d) => fmtNum(Math.abs(x) < 1e-12 ? 0 : x, d == null ? 4 : d);
  function rat(x, maxD) {
    maxD = maxD || 1000; if (!isFinite(x)) return x > 0 ? '+∞' : '-∞';
    if (Math.abs(x - Math.round(x)) < 1e-9) return fmtNum(Math.round(x));
    for (let d = 2; d <= maxD; d++) { const n = Math.round(x * d); if (Math.abs(x * d - n) < 1e-7 * d) return (n < 0 ? '-' : '') + Math.abs(n) + '/' + d; }
    return f2(x);
  }
  function pq(str) { // "2,5" -> Q(5,2) ; "3/4" -> Q(3,4)
    str = String(str).replace(/\s/g, '').replace(',', '.').replace('−', '-');
    if (str.includes('/')) { const [a, b] = str.split('/'); const qa = pq(a), qb = pq(b); return qa.div(qb); }
    const neg = str.startsWith('-'); if (neg) str = str.slice(1);
    const [i, d] = str.split('.'); const den = d ? Math.pow(10, d.length) : 1; const q = new Q(parseInt((i || '0') + (d || ''), 10), den);
    return neg ? q.neg() : q;
  }
  const qf = (x) => fmt(x);
  function surd(x) { // 1.7320508 -> "√3" ; 0.8660254 -> "√3/2"
    if (Math.abs(x - Math.round(x)) < 1e-9) return fmtNum(Math.round(x));
    const sg0 = x < 0 ? '-' : ''; const ax = Math.abs(x);
    for (const m of [2, 3, 5, 6, 7, 10, 11, 13]) for (let d = 1; d <= 12; d++) { const k = ax * d / Math.sqrt(m); const kr = Math.round(k); if (kr > 0 && Math.abs(k - kr) < 1e-9) { const g = M.gcd(kr, d); const kk = kr / g, dd = d / g; return sg0 + (kk === 1 ? '' : kk) + '√' + m + (dd === 1 ? '' : '/' + dd); } }
    return rat(x);
  }
  function sqrtStr(n) { // n entier >= 0 -> "k√m"
    if (n < 0) return 'i' + sqrtStr(-n);
    if (!Number.isInteger(n)) return f2(Math.sqrt(n));
    let k = 1, m = n; for (let f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; }
    if (m === 1) return String(k);
    return (k === 1 ? '' : k) + '√' + m;
  }
  function sqrtQ(q) { // racine d'un rationnel positif, forme exacte si possible
    const v = q.val(); if (v < 0) return null;
    const n = Math.round(v * 1e6) / 1e6; for (let d = 1; d <= 400; d++) { const N = n * d * d; if (Math.abs(N - Math.round(N)) < 1e-6) { const s = sqrtStr(Math.round(N)); return d === 1 ? s : (/√/.test(s) ? s + '/' + d : rat(Math.sqrt(v))); } }
    return f2(Math.sqrt(v));
  }
  const RNUM = '(-?\\d+(?:[.,]\\d+)?(?:\\s*/\\s*\\d+)?)';
  const sgn = (x) => (x < 0 ? '- ' + f2(-x) : '+ ' + f2(x));
  const binom = (n, k) => { if (k < 0 || k > n) return 0; k = Math.min(k, n - k); let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };
  const fact = (n) => { let r = 1n; for (let i = 2n; i <= BigInt(n); i++) r *= i; return r; };
  const big = (b) => b.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  // ================================================================= 1. SUITES ARITHMÉTIQUES ET GÉOMÉTRIQUES
  function solveSuite(text, ctx) {
    const s = strip(text); const t = M.norm(text);
    if (!/suite|u\s*_?\s*\{?\(?\s*n\s*\+\s*1|\(u\s*_?\s*n\)/.test(s)) return null;
    let type = /arithm/.test(s) ? 'A' : /geometr/.test(s) ? 'G' : null;
    let p0 = null, u0 = null, r = null, m;
    m = t.match(/u\s*_?\s*\{?\(?\s*([01])\s*\)?\}?\s*=\s*(-?\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?)/i);
    if (m) { p0 = +m[1]; u0 = pq(m[2]); }
    if (!u0) { m = s.match(new RegExp('premier terme[^0-9-]{0,14}' + RNUM)); if (m) { u0 = pq(m[1]); p0 = /premier terme\s*u\s*_?\s*1/.test(s) ? 1 : 0; } }
    m = s.match(new RegExp('raison\\s*(?:r|q)?\\s*(?:=|egale a|de|:)?\\s*' + RNUM)); if (m) r = pq(m[1]);
    const comp = t.replace(/\s/g, '');
    const rec = comp.match(/u_?\{?\(?n\+1\)?\}?=([^;,]+?)(?:;|,|et|\.(?!\d)|$)/i);
    if (rec) {
      const rhs = rec[1]; let mm;
      if ((mm = rhs.match(/^u_?\{?\(?n\)?\}?([+-]\d+(?:\.\d+)?(?:\/\d+)?)$/i))) { type = 'A'; r = pq(mm[1]); }
      else if ((mm = rhs.match(/^(-?\d+(?:\.\d+)?(?:\/\d+)?)\*?u_?\{?\(?n\)?\}?$/i))) { type = 'G'; r = pq(mm[1]); }
      else if ((mm = rhs.match(/^u_?\{?\(?n\)?\}?\/(\d+(?:\.\d+)?)$/i))) { type = 'G'; r = new Q(1, 1).div(pq(mm[1])); }
      else if ((mm = rhs.match(/^u_?\{?\(?n\)?\}?\*(\d+(?:\.\d+)?(?:\/\d+)?)$/i))) { type = 'G'; r = pq(mm[1]); }
    }
    if (!type || !u0 || !r) return null;
    const A = type === 'A'; const nm = A ? 'r' : 'q';
    const term = (k) => (A ? u0.add(r.mul(new Q(k - p0, 1))) : u0.mul(r.pow(k - p0)));
    const asked = [...new Set([...t.matchAll(/u\s*_?\s*\{?\(?\s*(\d{1,3})\s*\)?\}?(?!\s*=\s*-?\d)/gi)].map((x) => +x[1]).filter((k) => k !== p0 && k <= 200))];
    const lines = [], e3 = [];
    const gen = A ? 'u' + 'ₙ = u' + (p0 ? '₁' : '₀') + ' + ' + (p0 ? '(n - 1)' : 'n') + ' × r = ' + qf(u0) + ' + ' + (p0 ? '(n - 1) × ' : '') + (p0 ? qf(r) : qf(r) + 'n')
      : 'uₙ = u' + (p0 ? '₁' : '₀') + ' × q' + (p0 ? '⁽ⁿ⁻¹⁾' : 'ⁿ') + ' = ' + qf(u0) + ' × (' + qf(r) + ')' + (p0 ? '^(n - 1)' : '^n');
    lines.push('Terme général d\'une suite ' + (A ? 'arithmétique' : 'géométrique') + ' : ' + gen + '.');
    asked.forEach((k) => lines.push('u' + k + ' = ' + (A ? qf(u0) + ' + ' + (k - p0) + ' × ' + qf(r) : qf(u0) + ' × (' + qf(r) + ')^' + (k - p0)) + ' = ' + qf(term(k)) + '.'));
    let sumTxt = null;
    if (/somme|\bs\s*_?\s*n?\s*=/.test(s)) {
      let N = null, last = null; let mm = s.match(/somme des (\d+) premiers termes/);
      if (mm) { N = +mm[1]; last = p0 + N - 1; }
      mm = comp.match(/\+(?:\.\.\.|…)\+?u_?\{?\(?(\d+)/i); if (mm) { last = +mm[1]; N = last - p0 + 1; }
      if (N) {
        const first = u0, ul = term(last); let S;
        if (A) { S = new Q(N, 1).mul(first.add(ul)).div(new Q(2, 1)); lines.push('Somme de termes consécutifs : S = (nombre de termes) × (premier + dernier) ÷ 2 = ' + N + ' × (' + qf(first) + ' + ' + qf(ul) + ') ÷ 2 = ' + qf(S) + '.'); }
        else if (!r.eq(new Q(1, 1))) { S = first.mul(new Q(1, 1).sub(r.pow(N))).div(new Q(1, 1).sub(r)); lines.push('Somme : S = premier terme × (1 - qᴺ) ÷ (1 - q) = ' + qf(first) + ' × (1 - (' + qf(r) + ')^' + N + ') ÷ (1 - ' + qf(r) + ') = ' + qf(S) + '.'); }
        if (S) { sumTxt = 'S = ' + qf(S); let chk = new Q(0, 1); for (let k = p0; k <= last; k++) chk = chk.add(term(k)); e3.push('En additionnant les ' + N + ' termes un par un, on retrouve bien ' + qf(chk) + ' ✅'); }
      }
    }
    // sens de variation et limite
    const rv = r.val(), uv = u0.val();
    if (A) lines.push('Sens de variation : r ' + (rv > 0 ? '> 0, la suite est strictement croissante ; elle tend vers +∞.' : rv < 0 ? '< 0, la suite est strictement décroissante ; elle tend vers -∞.' : '= 0, la suite est constante.'));
    else if (rv > 1) lines.push('Sens de variation : q > 1 et u' + p0 + (uv > 0 ? ' > 0 : la suite est croissante et tend vers +∞.' : ' < 0 : la suite est décroissante et tend vers -∞.'));
    else if (rv > 0 && rv < 1) lines.push('Sens de variation : 0 < q < 1 : la suite est ' + (uv > 0 ? 'décroissante' : 'croissante') + ' et converge vers 0.');
    else if (rv < 0) lines.push('q < 0 : la suite n\'est pas monotone (les signes alternent)' + (rv > -1 ? ' ; elle converge vers 0.' : '.'));
    const t1 = term(p0 + 1), t2 = term(p0 + 2);
    e3.unshift('Trois premiers termes : ' + qf(u0) + ' ; ' + qf(t1) + ' ; ' + qf(t2) + '. ' + (A ? 'Différences : ' + qf(t1.sub(u0)) + ' et ' + qf(t2.sub(t1)) + ' = r ✅' : 'Quotients : ' + qf(t1.div(u0)) + ' et ' + qf(t2.div(t1)) + ' = q ✅'));
    const concl = [asked.length ? asked.map((k) => 'u' + k + ' = ' + qf(term(k))).join(' ; ') : gen, sumTxt].filter(Boolean).join(' ; ');
    const pts = []; for (let k = p0; k < p0 + 8; k++) { const v = term(k).val(); if (isFinite(v) && Math.abs(v) < 1e7) pts.push({ x: k, y: v }); }
    return res({ type: 'suite', titre: 'Suite ' + (A ? 'arithmétique' : 'géométrique') + ' (' + nm + ' = ' + qf(r) + ')', difficulte: sumTxt ? 'difficile' : 'moyen',
      e1: 'On reconnaît une suite ' + (A ? 'arithmétique : on passe d\'un terme au suivant en AJOUTANT toujours la même raison r = ' + qf(r) : 'géométrique : on passe d\'un terme au suivant en MULTIPLIANT toujours par la même raison q = ' + qf(r)) + '. Premier terme : u' + p0 + ' = ' + qf(u0) + '.',
      e2: L(lines), e3: L(e3), conclusion: concl, reponse: concl, answers: asked.length ? asked.map((k) => term(k).val()) : undefined, gen: { k: 'suite' },
      graph: { kind: 'points', pts, name: 'u', xlabel: 'n' } });
  }

  // ================================================================= 2. NOMBRES COMPLEXES
  const C = {
    add: (a, b) => ({ re: a.re + b.re, im: a.im + b.im }), sub: (a, b) => ({ re: a.re - b.re, im: a.im - b.im }),
    mul: (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }),
    div: (a, b) => { const d = b.re * b.re + b.im * b.im; if (!d) throw new Error('div0'); return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d }; },
    neg: (a) => ({ re: -a.re, im: -a.im }), conj: (a) => ({ re: a.re, im: -a.im })
  };
  function cpow(a, n) { let r = { re: 1, im: 0 }; for (let k = 0; k < n; k++) r = C.mul(r, a); return r; }
  function cparse(str) {
    const s = str.replace(/\s+/g, '').replace(/[×·]/g, '*').replace(/−/g, '-').replace(/(\d),(\d)/g, '$1.$2');
    let i = 0; const peek = () => s[i];
    function num() { const m = s.slice(i).match(/^\d+(?:\.\d+)?/); if (!m) return null; i += m[0].length; return parseFloat(m[0]); }
    function atom() {
      const c = peek();
      if (c === '(') { i++; const v = expr(); if (peek() !== ')') throw new Error('par'); i++; return v; }
      if (c === 'i') { i++; return { re: 0, im: 1 }; }
      if (c === '√') { i++; const a = atom(); return { re: Math.sqrt(a.re), im: 0 }; }
      const n = num(); if (n === null) throw new Error('tok'); return { re: n, im: 0 };
    }
    function factor() { let v = atom(); for (;;) { if (peek() === '^') { i++; const n = num(); v = cpow(v, n); } else if (peek() === '²') { i++; v = cpow(v, 2); } else if (peek() === '³') { i++; v = cpow(v, 3); } else break; } return v; }
    function unary() { if (peek() === '-') { i++; return C.neg(unary()); } if (peek() === '+') { i++; return unary(); } return factor(); }
    function term() { let v = unary(); for (;;) { const c = peek(); if (c === '*' || c === '/') { i++; const w = unary(); v = c === '*' ? C.mul(v, w) : C.div(v, w); } else if (c && /[0-9i(√]/.test(c)) v = C.mul(v, factor()); else break; } return v; }
    function expr() { let v = term(); while (peek() === '+' || peek() === '-') { const op = s[i++]; const w = term(); v = op === '+' ? C.add(v, w) : C.sub(v, w); } return v; }
    const v = expr(); if (i !== s.length) throw new Error('reste'); return v;
  }
  function cstr(z) {
    const re = Math.abs(z.re) < 1e-10 ? 0 : z.re, im = Math.abs(z.im) < 1e-10 ? 0 : z.im;
    const rs = surd(re), is = surd(Math.abs(im)); const ims = is === '1' ? 'i' : (/[\/√]/.test(is) ? (/^\d*√\d+$/.test(is) ? 'i' + is : '(' + is + ')i') : is + 'i');
    if (!im) return rs; if (!re) return (im < 0 ? '-' : '') + ims; return rs + (im < 0 ? ' - ' : ' + ') + ims;
  }
  function piStr(theta) { // angle en radians -> "kπ/n" si remarquable
    const k = theta / Math.PI * 12; const kr = Math.round(k);
    if (Math.abs(k - kr) > 1e-7) return f2(theta, 4) + ' rad';
    if (kr === 0) return '0'; const g = M.gcd(Math.abs(kr), 12); const n = kr / g, d = 12 / g;
    return (n === 1 ? '' : n === -1 ? '-' : n) + 'π' + (d === 1 ? '' : '/' + d);
  }
  function modStr(z) { const m2 = z.re * z.re + z.im * z.im; const r2 = Math.round(m2); return Math.abs(m2 - r2) < 1e-9 ? sqrtStr(r2) : (() => { for (let d = 2; d <= 50; d++) { const N = m2 * d * d; if (Math.abs(N - Math.round(N)) < 1e-7) { const s = sqrtStr(Math.round(N)); return /√/.test(s) ? s + '/' + d : rat(Math.sqrt(m2)); } } return f2(Math.sqrt(m2)); })(); }
  function topSplit(s, ch) { let d = 0; for (let k = s.length - 1; k > 0; k--) { const c = s[k]; if (c === ')') d++; else if (c === '(') d--; else if (c === ch && d === 0) return [s.slice(0, k), s.slice(k + 1)]; } return null; }
  function solveComplex(text, ctx) {
    const s = strip(text); const t = String(text).replace(/[−–]/g, '-').replace(/\u00a0/g, ' ').replace(/√\s*\(\s*(\d+)\s*\)/g, '√$1').replace(/\^\s*2/g, '²');
    const zEq = /\bz\b[^=\n]*=|=[^=\n]*\bz\b/.test(t) && /(z\s*(²|\^\s*2))|(\d\s*z)|(\bz\s*[+-])/.test(t);
    if (!/complexe|ℂ|\bdans c\b|forme algebrique|forme trigonometrique|forme exponentielle|\bmodule\b|argument|affixe|conjugue de/.test(s) && !(/i\s*(²|\^\s*2)\s*=\s*-\s*1/.test(t)) && !zEq) return null;
    const lines = []; let concl, e1, titre, e3 = [], answers;
    // --- a) équation en z
    const eqm = t.match(/([^:;\n]*\bz\b[^:;\n]*)=([^:;\n]+)/);
    if (eqm && !/^\s*z\s*$/.test(eqm[1]) || (eqm && /\bz\b/.test(eqm[2]))) {
      const lhs = eqm[1].replace(/^.*(r[ée]soudre|dans\s*(ℂ|c)|l'?[ée]quation)\s*:?\s*/i, '').trim(), rhs = eqm[2].replace(/[.;]\s*$/, '').replace(/\s*(dans|sur)\s*(ℂ|c)\b.*$/i, '').trim();
      const ast = H.tryParse(M.norm(lhs)), astR = H.tryParse(M.norm(rhs));
      const p = ast && astR && M.toPoly(ast) && M.toPoly(astR) ? M.toPoly(ast).sub(M.toPoly(astR)) : null;
      if (p && p.vars().every((v) => v === 'z') && p.degree('z') === 2) {
        const c = p.coeffs('z'); const a = c[2], b = c[1], cc = c[0]; const D = b.mul(b).sub(new Q(4, 1).mul(a).mul(cc)); const Dv = D.val();
        titre = 'Équation du second degré dans ℂ';
        e1 = 'On résout dans ℂ l\'équation ' + M.polyStr(p) + ' = 0 : c\'est une équation du second degré az² + bz + c = 0 avec a = ' + qf(a) + ', b = ' + qf(b) + ', c = ' + qf(cc) + '.';
        lines.push('Discriminant : Δ = b² - 4ac = (' + qf(b) + ')² - 4 × ' + qf(a) + ' × ' + qf(cc) + ' = ' + qf(D) + '.');
        const av = a.val(), bv = b.val();
        if (Dv < 0) {
          const sq = sqrtQ(D.neg()); const re = -bv / (2 * av), im = Math.sqrt(-Dv) / (2 * av);
          lines.push('Δ < 0 : dans ℂ, on écrit Δ = (i√' + qf(D.neg()) + ')² = (' + sq + 'i)².');
          lines.push('Deux solutions complexes conjuguées : z₁ = (-b - i√|Δ|) ÷ 2a = (' + qf(b.neg()) + ' - ' + sq + 'i) ÷ ' + qf(a.mul(new Q(2, 1))) + ' = ' + cstr({ re, im: -im }) + ' ; z₂ = ' + cstr({ re, im }) + '.');
          const z1 = { re, im: -im }; const chk = C.add(C.add(C.mul({ re: av, im: 0 }, C.mul(z1, z1)), C.mul({ re: bv, im: 0 }, z1)), { re: cc.val(), im: 0 });
          e3.push('On remplace z₁ dans l\'équation : on obtient ' + cstr(chk) + ' ✅ ; z₂ est le conjugué de z₁ (coefficients réels).');
          e3.push('Somme z₁ + z₂ = ' + rat(2 * re) + ' = -b/a et produit z₁z₂ = ' + rat(re * re + im * im) + ' = c/a ✅');
          concl = 'S = { ' + cstr({ re, im: -im }) + ' ; ' + cstr({ re, im }) + ' }';
        } else {
          const r1 = (-bv - Math.sqrt(Dv)) / (2 * av), r2 = (-bv + Math.sqrt(Dv)) / (2 * av);
          lines.push(Dv === 0 ? 'Δ = 0 : une solution double z = -b/2a = ' + rat(r1) + '.' : 'Δ > 0 : deux solutions réelles z₁ = ' + rat(r1) + ' et z₂ = ' + rat(r2) + ' (√Δ = ' + sqrtQ(D) + ').');
          e3.push('On remplace chaque solution dans l\'équation : on trouve bien 0 ✅'); concl = 'S = { ' + (Dv === 0 ? rat(r1) : rat(r1) + ' ; ' + rat(r2)) + ' }'; answers = Dv === 0 ? [r1] : [r1, r2];
        }
        return res({ type: 'complexe', titre, difficulte: 'difficile', e1, e2: L(lines), e3: L(e3), conclusion: concl, reponse: concl, answers, gen: { k: 'complexe' } });
      }
      // équation du 1er degré à coefficients complexes : g(z) = lhs - rhs
      try {
        const g = (zv) => C.sub(cparse(lhs.replace(/\bz\b/g, '(' + zv + ')')), cparse(rhs.replace(/\bz\b/g, '(' + zv + ')')));
        const g0 = g('0'), g1 = g('1'), g2 = g('2'); const A = C.sub(g1, g0);
        const lin = Math.abs(C.sub(g2, C.add(g0, C.mul(A, { re: 2, im: 0 }))).re) < 1e-9 && Math.abs(C.sub(g2, C.add(g0, C.mul(A, { re: 2, im: 0 }))).im) < 1e-9;
        if (lin && (A.re || A.im)) {
          const z = C.div(C.neg(g0), A);
          titre = 'Équation du 1er degré dans ℂ';
          e1 = 'On cherche le nombre complexe z = x + iy tel que ' + lhs + ' = ' + rhs + '. C\'est une équation du 1er degré : on isole z.';
          lines.push('On regroupe : (' + cstr(A) + ') z = ' + cstr(C.neg(g0)) + '.');
          lines.push('Donc z = (' + cstr(C.neg(g0)) + ') ÷ (' + cstr(A) + ').');
          if (A.im) lines.push('On multiplie en haut et en bas par le conjugué ' + cstr(C.conj(A)) + ' : z = (' + cstr(C.mul(C.neg(g0), C.conj(A))) + ') ÷ ' + rat(A.re * A.re + A.im * A.im) + ' = ' + cstr(z) + '.');
          else lines.push('z = ' + cstr(z) + '.');
          const chk = g(cstr(z).replace(/\s/g, ''));
          e3.push('On remplace z par ' + cstr(z) + ' : les deux membres sont égaux (écart ' + cstr(chk) + ') ✅');
          concl = 'z = ' + cstr(z);
          return res({ type: 'complexe', titre, difficulte: 'moyen', e1, e2: L(lines), e3: L(e3), conclusion: concl, reponse: concl, gen: { k: 'complexe' } });
        }
      } catch (e) { /* pas une équation linéaire */ }
    }
    // --- b) calcul / forme algébrique / module / argument
    let expr = null; const zm = t.match(/\bz\s*_?\d?\s*=\s*([0-9i+\-*/×()^²³√.,\s]+?)(?=$|[;\n]|\s(?:et|puis|sous|en|on|calcul|d[ée]termin|sa|son|le|la)\b|\.(?!\d))/i);
    if (zm && /i/.test(zm[1])) expr = zm[1].trim();
    if (!expr) { const cands = (t.match(/[0-9i+\-*/×()^²³√.,\s]{3,}/g) || []).map((x) => x.trim()).filter((x) => /\d|i/.test(x) && /(\di|i\d|\(.*i.*\)|[+\-]\s*i\b|\bi\s*[+\-*/]|√\d+\s*i|i\s*√)/.test(x)).sort((a, b) => b.length - a.length); for (const c of cands) { try { cparse(c); expr = c; break; } catch (e) { /* */ } } }
    if (!expr) return null;
    let z; try { z = cparse(expr); } catch (e) { return null; }
    titre = 'Nombres complexes : z = ' + expr;
    e1 = 'On travaille avec z = ' + expr + '. Rappel : i² = -1 ; un complexe s\'écrit z = a + ib (a = partie réelle, b = partie imaginaire).';
    const q = topSplit(expr.replace(/\s/g, ''), '/');
    const prod = expr.replace(/\s/g, '').match(/^\(([^()]+)\)\*?\(([^()]+)\)$/);
    if (q) {
      const N = cparse(q[0]), D = cparse(q[1]);
      lines.push('Quotient : on multiplie le numérateur et le dénominateur par le conjugué du dénominateur, ' + cstr(C.conj(D)) + '.');
      lines.push('Numérateur : (' + cstr(N) + ')(' + cstr(C.conj(D)) + ') = ' + cstr(C.mul(N, C.conj(D))) + '.');
      lines.push('Dénominateur : (' + cstr(D) + ')(' + cstr(C.conj(D)) + ') = ' + rat(D.re) + '² + ' + rat(Math.abs(D.im)) + '² = ' + rat(D.re * D.re + D.im * D.im) + '.');
      lines.push('Donc z = ' + cstr(z) + '.');
    } else if (prod) {
      const a = cparse(prod[1]), b = cparse(prod[2]);
      lines.push('On développe comme en algèbre puis on remplace i² par -1 :');
      lines.push('(' + cstr(a) + ')(' + cstr(b) + ') = ' + rat(a.re * b.re) + ' ' + sgn(a.re * b.im).replace(/(\d)$/, '$1') + 'i ' + sgn(a.im * b.re) + 'i ' + sgn(a.im * b.im) + 'i²');
      lines.push('= ' + rat(a.re * b.re) + ' ' + sgn(-a.im * b.im) + ' + (' + rat(a.re * b.im + a.im * b.re) + ')i = ' + cstr(z) + '.');
    } else lines.push('Forme algébrique (on développe, i² = -1) : z = ' + cstr(z) + '.');
    const par = (x) => { const q0 = surd(x); return /[\/√-]/.test(q0) ? '(' + q0 + ')' : q0; };
    lines.push('Partie réelle Re(z) = ' + surd(z.re) + ' ; partie imaginaire Im(z) = ' + surd(z.im) + ' ; conjugué z̄ = ' + cstr(C.conj(z)) + '.');
    const mod = Math.hypot(z.re, z.im);
    if (mod > 1e-12) {
      lines.push('Module : |z| = √(a² + b²) = √(' + par(z.re) + '² + ' + par(z.im) + '²) = ' + modStr(z) + (/√/.test(modStr(z)) ? ' ≈ ' + f2(mod, 3) : '') + '.');
      const th = Math.atan2(z.im, z.re); const ps = piStr(th);
      lines.push('Argument : cos θ = a/|z| = ' + surd(z.re / mod) + ' et sin θ = b/|z| = ' + surd(z.im / mod) + ' ⇒ θ = ' + (/rad/.test(ps) ? 'arctan(b/a) ≈ ' + ps : ps) + ' (à 2π près).');
      if (!/rad/.test(ps)) lines.push('Forme trigonométrique : z = ' + modStr(z) + '(cos(' + ps + ') + i sin(' + ps + ')) ; forme exponentielle : z = ' + modStr(z) + 'e^(i' + ps + ').');
      e3.push('Contrôle : |z|² = z × z̄ = ' + rat(z.re * z.re + z.im * z.im) + ' ✅');
    }
    e3.push('Vérification numérique de la forme algébrique : ' + f2(z.re, 4) + ' + ' + f2(z.im, 4) + 'i ✅');
    concl = 'z = ' + cstr(z) + (mod > 1e-12 ? ' ; |z| = ' + modStr(z) : '');
    return res({ type: 'complexe', titre, difficulte: 'moyen', e1, e2: L(lines), e3: L(e3), conclusion: concl, reponse: cstr(z), answers: [z.re, z.im], gen: { k: 'complexe' } });
  }

  // ================================================================= 3. TRIGONOMÉTRIE
  const EXACT = [[0, '0'], [0.5, '1/2'], [Math.SQRT2 / 2, '√2/2'], [Math.sqrt(3) / 2, '√3/2'], [1, '1'], [Math.sqrt(3), '√3'], [Math.sqrt(3) / 3, '√3/3']];
  function exactStr(v) { for (const [x, s] of EXACT) { if (Math.abs(Math.abs(v) - x) < 1e-9) return (v < 0 && x ? '-' : '') + s; } return f2(v, 4); }
  function parseVal(str) { // "1/2", "-√3/2", "√2/2", "0,5", "1/√2"
    let s = String(str).replace(/\s/g, '').replace(',', '.').replace(/−/g, '-'); const neg = s.startsWith('-'); if (neg) s = s.slice(1);
    let v; const m = s.match(/^(\d*(?:\.\d+)?)?√\(?(\d+)\)?(?:\/(\d+(?:\.\d+)?))?$/); const m2 = s.match(/^(\d+(?:\.\d+)?)\/√\(?(\d+)\)?$/);
    if (m) v = (m[1] ? parseFloat(m[1]) : 1) * Math.sqrt(+m[2]) / (m[3] ? parseFloat(m[3]) : 1);
    else if (m2) v = parseFloat(m2[1]) / Math.sqrt(+m2[2]);
    else if (/^\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?$/.test(s)) { const [a, b] = s.split('/'); v = parseFloat(a) / (b ? parseFloat(b) : 1); }
    else return null;
    return neg ? -v : v;
  }
  function parseAngle(str) { // "π/3", "2π/3", "-π/4", "30°", "5pi/6"
    let s = String(str).replace(/\s/g, '').replace(/pi/gi, 'π').replace(/−/g, '-');
    let m = s.match(/^(-?\d+(?:[.,]\d+)?)°$/); if (m) return parseFloat(m[1].replace(',', '.')) * Math.PI / 180;
    m = s.match(/^(-)?(\d*)π(?:\/(\d+))?$/); if (m) return (m[1] ? -1 : 1) * (m[2] ? +m[2] : 1) * Math.PI / (m[3] ? +m[3] : 1);
    return null;
  }
  function solveTrig(text, ctx) {
    const s = strip(text); const t = M.norm(text).replace(/\bpi\b/gi, 'π').replace(/sqrt\((\d+(?:[.,]\d+)?)\)/g, '√$1'); const raw = String(text).replace(/\s+/g, ' ');
    if (!/(cos|sin|tan)\s*\(?\s*[x0-9π-]|radian|trigonometr/.test(s + ' ' + raw)) return null;
    const lines = [], e3 = []; let concl, titre, e1, graph = null, answers;
    // a) conversion degrés <-> radians
    if (/radian|degre|convert/.test(s) && !/\b(cos|sin|tan)\s*\(?\s*x/.test(s)) {
      const out = [];
      [...t.matchAll(/(-?\d+(?:[.,]\d+)?)\s*°/g)].forEach((m) => { const d = parseFloat(m[1].replace(',', '.')); const g = M.gcd(Math.abs(Math.round(d)), 180); const n = Math.round(d) / g, den = 180 / g; out.push([m[1] + '°', d + ' × π/180 = ' + (Number.isInteger(d) ? (n === 1 ? '' : n === -1 ? '-' : n) + 'π' + (den === 1 ? '' : '/' + den) : f2(d * Math.PI / 180) + ' rad') + ' rad']); });
      [...t.matchAll(/(-?\d*\s*π\s*(?:\/\s*\d+)?)\s*(?:rad)?/g)].forEach((m) => { const a = parseAngle(m[1]); if (a === null || /°/.test(m[0])) return; out.push([m[1].replace(/\s/g, '') + ' rad', m[1].replace(/\s/g, '') + ' × 180/π = ' + rat(a * 180 / Math.PI) + '°']); });
      if (out.length) {
        return res({ type: 'trigo', titre: 'Conversion degrés ↔ radians', difficulte: 'facile', e1: 'On utilise la proportionnalité : 180° correspondent à π radians.', e2: L(['Formules : α(rad) = α(°) × π/180 et α(°) = α(rad) × 180/π.', ...out.map((o) => o[0] + ' → ' + o[1] + '.')]), e3: 'Repère : 90° = π/2, 60° = π/3, 45° = π/4, 30° = π/6 ✅', conclusion: out.map((o) => o[1].split('=').pop().trim()).join(' ; '), gen: { k: 'trig' } });
      }
    }
    // b) équation cos x = a, sin x = a, tan x = a (éventuellement k·cos x + b = c)
    const em = t.replace(/\s/g, '').match(/(-?\d*(?:[.,]\d+)?)\*?(cos|sin|tan)\(?x\)?([+-]\d+(?:[.,]\d+)?)?=([-√0-9.,/()]+)/i);
    if (em) {
      const k = em[1] === '' || em[1] === '-' ? (em[1] === '-' ? -1 : 1) : parseFloat(em[1].replace(',', '.')); const b = em[3] ? parseFloat(em[3].replace(',', '.')) : 0; const fn = em[2].toLowerCase();
      const rhs = parseVal(em[4].replace(/[.,;]+$/, '')); if (rhs === null) return null;
      const a = (rhs - b) / k; titre = 'Équation trigonométrique ' + fn + ' x = ' + exactStr(a);
      e1 = 'On cherche les réels x tels que ' + (k !== 1 || b ? (k === 1 ? '' : k) + fn + ' x' + (b ? (b > 0 ? ' + ' : ' - ') + Math.abs(b) : '') + ' = ' + em[4] + ', soit ' : '') + fn + ' x = ' + exactStr(a) + '. On utilise le cercle trigonométrique et les valeurs remarquables.';
      if (k !== 1 || b) lines.push('On isole ' + fn + ' x : ' + fn + ' x = (' + em[4] + (b ? (b > 0 ? ' - ' : ' + ') + Math.abs(b) : '') + ') ÷ ' + k + ' = ' + exactStr(a) + '.');
      const inter = /\[\s*0\s*;\s*2\s*π\s*\[/.test(raw) ? [0, 2 * Math.PI] : /\]\s*-\s*π\s*;\s*π\s*\]/.test(raw) ? [-Math.PI + 1e-9, Math.PI + 1e-9] : /\[\s*0\s*;\s*π\s*\]/.test(raw) ? [0, Math.PI + 1e-9] : /\[\s*0\s*;\s*2\s*π\s*\]/.test(raw) ? [0, 2 * Math.PI + 1e-9] : null;
      let sols = [];
      if (fn !== 'tan' && Math.abs(a) > 1) { lines.push('Or ' + fn + ' x est toujours compris entre -1 et 1 : ' + exactStr(a) + ' est hors de [-1 ; 1].'); concl = 'Pas de solution : S = ∅'; e3.push('-1 ≤ ' + fn + ' x ≤ 1 pour tout réel x ✅'); }
      else {
        const al = fn === 'cos' ? Math.acos(a) : fn === 'sin' ? Math.asin(a) : Math.atan(a); const A = piStr(al);
        lines.push('Valeur remarquable : ' + fn + '(' + A + ') = ' + exactStr(a) + '.');
        if (fn === 'cos') { lines.push('cos x = cos α ⇔ x = α + 2kπ ou x = -α + 2kπ (k ∈ ℤ).'); lines.push('Donc x = ' + A + ' + 2kπ ou x = ' + piStr(-al) + ' + 2kπ, k ∈ ℤ.'); concl = 'x = ' + A + ' + 2kπ ou x = ' + piStr(-al) + ' + 2kπ (k ∈ ℤ)'; sols = [al, -al]; }
        else if (fn === 'sin') { lines.push('sin x = sin α ⇔ x = α + 2kπ ou x = π - α + 2kπ (k ∈ ℤ).'); lines.push('Donc x = ' + A + ' + 2kπ ou x = ' + piStr(Math.PI - al) + ' + 2kπ, k ∈ ℤ.'); concl = 'x = ' + A + ' + 2kπ ou x = ' + piStr(Math.PI - al) + ' + 2kπ (k ∈ ℤ)'; sols = [al, Math.PI - al]; }
        else { lines.push('tan x = tan α ⇔ x = α + kπ (k ∈ ℤ).'); concl = 'x = ' + A + ' + kπ (k ∈ ℤ)'; sols = [al]; }
        if (inter) {
          const per = fn === 'tan' ? Math.PI : 2 * Math.PI; const list = [];
          sols.forEach((x0) => { for (let kk = -3; kk <= 3; kk++) { const x = x0 + kk * per; if (x >= inter[0] - 1e-9 && x < inter[1] - 1e-12 && !list.some((y) => Math.abs(y - x) < 1e-9)) list.push(x); } });
          list.sort((u, v) => u - v); lines.push('Dans l\'intervalle demandé, on garde : ' + list.map(piStr).join(' ; ') + '.'); concl = 'S = { ' + list.map(piStr).join(' ; ') + ' }'; answers = list;
        }
        e3.push('On vérifie : ' + fn + '(' + A + ') = ' + exactStr(fn === 'cos' ? Math.cos(al) : fn === 'sin' ? Math.sin(al) : Math.tan(al)) + ' ✅' + (fn !== 'tan' ? ' et ' + fn + '(' + piStr(sols[1]) + ') = ' + exactStr(fn === 'cos' ? Math.cos(sols[1]) : Math.sin(sols[1])) + ' ✅' : ''));
        graph = { kind: 'trig', fn, y: a, sols: (answers || sols) };
      }
      return res({ type: 'trigo', titre, difficulte: 'difficile', e1, e2: L(lines), e3: L(e3), conclusion: concl, reponse: concl, answers, gen: { k: 'trig' }, graph });
    }
    // c) valeurs : cos(π/3), sin 30°, tan(π/4)...
    const vals = [...t.matchAll(/\b(cos|sin|tan)\s*\(?\s*(-?\d*\s*π\s*(?:\/\s*\d+)?|-?\d+(?:[.,]\d+)?\s*°)\s*\)?/gi)];
    if (vals.length) {
      const out = vals.map((m) => { const fn = m[1].toLowerCase(); const a = parseAngle(m[2]); if (a === null) return null; const v = fn === 'cos' ? Math.cos(a) : fn === 'sin' ? Math.sin(a) : Math.tan(a); const ref = Math.abs(((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)); return { fn, s: m[2].replace(/\s/g, ''), v, ref, a }; }).filter(Boolean);
      if (out.length) {
        out.forEach((o) => lines.push(o.fn + '(' + o.s + ') = ' + (Math.abs(o.v) > 1e9 ? 'non défini' : exactStr(o.v)) + (o.ref > Math.PI / 2 + 1e-9 ? ' (angle associé : on se ramène au premier quadrant, attention au signe)' : '') + '.'));
        return res({ type: 'trigo', titre: 'Valeurs remarquables', difficulte: 'facile', e1: 'On place chaque angle sur le cercle trigonométrique : cos = abscisse, sin = ordonnée, tan = sin ÷ cos.', e2: L(['Table : cos 0 = 1 ; cos(π/6) = √3/2 ; cos(π/4) = √2/2 ; cos(π/3) = 1/2 ; cos(π/2) = 0 (et sin dans l\'ordre inverse).', ...lines]), e3: 'Contrôle : cos²x + sin²x = 1 pour chaque angle ✅', conclusion: out.map((o) => o.fn + '(' + o.s + ') = ' + exactStr(o.v)).join(' ; '), answers: out.map((o) => o.v), gen: { k: 'trig' } });
      }
    }
    return null;
  }

  // ================================================================= 4. LIMITES DE FONCTIONS RATIONNELLES
  function polyDivRoot(c, a) { // c : coefficients Q par degré croissant ; divise par (x - a)
    const n = c.length - 1; const b = new Array(n); let acc = new Q(0, 1);
    for (let k = n; k >= 1; k--) { acc = c[k].add(acc.mul(a)); b[k - 1] = acc; }
    return b;
  }
  const evalC = (c, x) => c.reduce((acc, q, k) => acc.add(q.mul(x.pow(k))), new Q(0, 1));
  const cstrP = (c) => M.polyStr(M.polyFromCoeffs(c.map((q) => q.val()), 'x'));
  function solveLimit(text, ctx) {
    const s = strip(text); if (!/limite|\blim\b/.test(s)) return null;
    const t = M.norm(text).replace(/−/g, '-');
    let body = null, m = t.match(/\b[fgh]\s*\(\s*x\s*\)\s*=\s*([^;\n]+?)(?=\s*(?:;|\n|$|\.\s|,\s*(?:calcul|d[ée]termin|et)|\s(?:en|quand|lorsque|calculer|d[ée]terminer)\b))/i);
    if (m) body = m[1];
    if (!body) { m = t.match(/lim[^(]*?(\([^()]*\)\s*\/\s*\([^()]*\)|\([^()]*\)\s*\/\s*[^\s;]+|[^\s;(]+\s*\/\s*\([^()]*\))/i); if (m) body = m[1]; }
    if (!body || !/\//.test(body)) return null;
    const ast = H.tryParse(H.cleanMath(body)); if (!ast || !(ast.t === 'op' && ast.op === '/')) return null;
    const pn = M.toPoly(ast.a), pd = M.toPoly(ast.b); if (!pn || !pd) return null;
    if (pn.vars().some((v) => v !== 'x') || pd.vars().some((v) => v !== 'x') || pd.degree('x') < 1) return null;
    const N = pn.coeffs('x'), D = pd.coeffs('x'); const n = N.length - 1, d = D.length - 1;
    const pts = []; const reP = /(?:tend vers|→|->|\ben\b|vers)\s*(\+\s*∞|-\s*∞|\+\s*inf\w*|-\s*inf\w*|plus l'infini|moins l'infini|∞|-?\d+(?:[.,]\d+)?)/gi; let mm;
    while ((mm = reP.exec(t))) { const v = mm[1].replace(/\s/g, ''); const p = /^\+?(∞|inf)/i.test(v) || /plus/.test(v) ? '+∞' : /^-(∞|inf)/i.test(v) || /moins/.test(v) ? '-∞' : v.replace(',', '.'); if (!pts.includes(p)) pts.push(p); }
    if (!pts.length) pts.push('+∞', '-∞');
    const F = 'f(x) = (' + cstrP(N) + ') / (' + cstrP(D) + ')';
    const lines = [], e3 = [], concl = [], asym = { v: [], h: [] };
    pts.forEach((p) => {
      if (p === '+∞' || p === '-∞') {
        const sig = p === '+∞' ? 1 : -1; const an = N[n], bd = D[d];
        lines.push('En ' + p + ' : une fonction rationnelle se comporte comme le quotient des termes de plus haut degré : f(x) ~ ' + qf(an) + 'x' + (n > 1 ? '^' + n : n === 1 ? '' : '⁰') + ' / ' + qf(bd) + 'x' + (d > 1 ? '^' + d : '') + '.');
        let L0;
        if (n === d) { L0 = an.div(bd); lines.push('Même degré : lim = ' + qf(an) + ' / ' + qf(bd) + ' = ' + qf(L0) + '.'); asym.h.push(L0.val()); e3.push('Asymptote horizontale y = ' + qf(L0) + ' en ' + p + '.'); }
        else if (n < d) { L0 = new Q(0, 1); lines.push('Degré du numérateur < degré du dénominateur : lim = 0.'); asym.h.push(0); e3.push('Asymptote horizontale y = 0 (axe des abscisses) en ' + p + '.'); }
        else { const sgnv = Math.sign(an.val() / bd.val()) * (((n - d) % 2 && sig < 0) ? -1 : 1); lines.push('Degré du numérateur > degré du dénominateur : f(x) ~ ' + qf(an.div(bd)) + 'x' + (n - d > 1 ? '^' + (n - d) : '') + ' donc lim = ' + (sgnv > 0 ? '+∞' : '-∞') + '.'); L0 = null; concl.push('lim(x→' + p + ') f(x) = ' + (sgnv > 0 ? '+∞' : '-∞')); }
        if (L0) concl.push('lim(x→' + p + ') f(x) = ' + qf(L0));
        const big = sig * 1e6; const val = M.polyFromCoeffs(N.map((q) => q.val()), 'x'); void val;
        const fv = N.reduce((a2, q, k) => a2 + q.val() * Math.pow(big, k), 0) / D.reduce((a2, q, k) => a2 + q.val() * Math.pow(big, k), 0);
        e3.push('Contrôle numérique : f(' + (sig > 0 ? '10⁶' : '-10⁶') + ') ≈ ' + (Math.abs(fv) > 1e5 ? (fv > 0 ? 'très grand positif' : 'très grand négatif') : f2(fv, 4)) + ' ✅');
      } else {
        const a = pq(p); let Nn = N.slice(), Dd = D.slice(); let nv = evalC(Nn, a), dv = evalC(Dd, a); let steps = 0;
        if (!dv.isZero()) { lines.push('En x = ' + qf(a) + ' : le dénominateur vaut ' + qf(dv) + ' ≠ 0, on remplace directement : f(' + qf(a) + ') = ' + qf(nv) + ' / ' + qf(dv) + ' = ' + qf(nv.div(dv)) + '.'); concl.push('lim(x→' + qf(a) + ') f(x) = ' + qf(nv.div(dv))); e3.push('f est continue en ' + qf(a) + ' (dénominateur non nul) ✅'); return; }
        while (nv.isZero() && dv.isZero() && steps < 3) {
          lines.push('En x = ' + qf(a) + ' : forme indéterminée « 0/0 ». On factorise numérateur et dénominateur par (x ' + (a.val() < 0 ? '+ ' + qf(a.neg()) : '- ' + qf(a)) + ').');
          Nn = polyDivRoot(Nn, a); Dd = polyDivRoot(Dd, a); steps++;
          lines.push('Après simplification : f(x) = (' + cstrP(Nn) + ') / (' + cstrP(Dd) + ') pour x ≠ ' + qf(a) + '.');
          nv = evalC(Nn, a); dv = evalC(Dd, a);
        }
        if (!dv.isZero()) { lines.push('On remplace : lim = ' + qf(nv) + ' / ' + qf(dv) + ' = ' + qf(nv.div(dv)) + '.'); concl.push('lim(x→' + qf(a) + ') f(x) = ' + qf(nv.div(dv))); e3.push('Contrôle numérique : f(' + f2(a.val() + 0.001, 3) + ') ≈ ' + f2(N.reduce((s2, q, k) => s2 + q.val() * Math.pow(a.val() + 0.001, k), 0) / D.reduce((s2, q, k) => s2 + q.val() * Math.pow(a.val() + 0.001, k), 0), 3) + ' ✅'); return; }
        const ev = (x) => Nn.reduce((s2, q, k) => s2 + q.val() * Math.pow(x, k), 0) / Dd.reduce((s2, q, k) => s2 + q.val() * Math.pow(x, k), 0);
        const left = ev(a.val() - 1e-6) > 0 ? '+∞' : '-∞', right = ev(a.val() + 1e-6) > 0 ? '+∞' : '-∞';
        lines.push('En x = ' + qf(a) + ' : le numérateur tend vers ' + qf(nv) + ' ≠ 0 et le dénominateur vers 0. On étudie le signe du dénominateur à gauche et à droite (tableau de signes).');
        lines.push('À gauche (x → ' + qf(a) + '⁻) : f(x) → ' + left + ' ; à droite (x → ' + qf(a) + '⁺) : f(x) → ' + right + '.');
        concl.push('lim(x→' + qf(a) + '⁻) f(x) = ' + left + ', lim(x→' + qf(a) + '⁺) f(x) = ' + right); asym.v.push(a.val());
        e3.push('La droite x = ' + qf(a) + ' est asymptote verticale ✅');
      }
    });
    return res({ type: 'limite', titre: 'Limites de ' + F, difficulte: 'difficile',
      e1: 'On étudie la fonction rationnelle ' + F + '. Méthode : en ±∞, termes de plus haut degré ; en un réel, on remplace, et si « 0/0 » on factorise.',
      e2: L(lines), e3: L(e3), conclusion: concl.join(' ; '), reponse: concl.join(' ; '), gen: { k: 'limite' },
      graph: { kind: 'rat', n: N.map((q) => q.val()), d: D.map((q) => q.val()), name: 'f', asym } });
  }

  // ================================================================= 5. PRIMITIVES ET INTÉGRALES (polynômes)
  function solveIntegral(text, ctx) {
    const s = strip(text); if (!/integrale|primitive|∫/.test(s + text)) return null;
    let t = M.norm(text).replace(/−/g, '-');
    let a = null, b = null, m;
    if ((m = t.match(/∫\s*_?\s*\{?\s*(-?\d+(?:[.,]\d+)?)\s*\}?\s*\^\s*\{?\s*(-?\d+(?:[.,]\d+)?)\s*\}?/))) { a = pq(m[1]); b = pq(m[2]); t = t.replace(m[0], ' '); }
    else if ((m = strip(t).match(/(?:de|entre)\s+(-?\d+(?:[.,]\d+)?)\s+(?:a|et)\s+(-?\d+(?:[.,]\d+)?)/))) { a = pq(m[1]); b = pq(m[2]); }
    let body = null;
    if ((m = t.match(/\b[fgh]\s*\(\s*x\s*\)\s*=\s*([^;\n]+?)(?=\s*(?:;|\n|$|\.\s|,|\s(?:sur|et|de|entre|qui|calcul|d[ée]termin)\b))/i))) body = m[1];
    if (!body && (m = t.match(/\(([^()]*x[^()]*)\)\s*d\s*x/))) body = m[1];
    if (!body && (m = t.match(/([0-9x+\-*/^²³ .,]*x[0-9x+\-*/^²³ .,]*)\s*d\s*x/))) body = m[1].replace(/^\s*(de|à)\s*/, '');
    if (!body) return null;
    const ast = H.tryParse(H.cleanMath(body)); const p = ast && M.toPoly(ast); if (!p || p.vars().some((v) => v !== 'x')) return null;
    const c = p.coeffs('x'); const Fc = [new Q(0, 1), ...c.map((q, k) => q.div(new Q(k + 1, 1)))];
    const fS = cstrP(c), FS = cstrP(Fc);
    const lines = ['On cherche une primitive terme à terme : une primitive de xⁿ est xⁿ⁺¹/(n + 1) ; une primitive d\'une constante k est kx.', 'f(x) = ' + fS + ' ⇒ F(x) = ' + FS + ' (+ C).'];
    const e3 = ['On dérive F : F\'(x) = ' + cstrP(Fc.slice(1).map((q, k) => q.mul(new Q(k + 1, 1)))) + ' = f(x) ✅'];
    let concl = 'F(x) = ' + FS + ' + C', answers, graph = { kind: 'poly', c: c.map((q) => q.val()), name: 'f', v: 'x', pts: [] };
    m = strip(t).match(/s'annule en\s*(-?\d+(?:[.,]\d+)?)/) || t.match(/F\s*\(\s*(-?\d+(?:[.,]\d+)?)\s*\)\s*=\s*(-?\d+(?:[.,]\d+)?)/);
    if (m && a === null) { const x0 = pq(m[1]), y0 = m[2] ? pq(m[2]) : new Q(0, 1); const Cst = y0.sub(evalC(Fc, x0)); lines.push('Condition F(' + qf(x0) + ') = ' + qf(y0) + ' : ' + qf(evalC(Fc, x0)) + ' + C = ' + qf(y0) + ' ⇒ C = ' + qf(Cst) + '.'); concl = 'F(x) = ' + FS + (Cst.isZero() ? '' : (Cst.val() < 0 ? ' - ' + qf(Cst.neg()) : ' + ' + qf(Cst))); }
    if (a !== null) {
      const Fa = evalC(Fc, a), Fb = evalC(Fc, b), I = Fb.sub(Fa);
      lines.push('∫ de ' + qf(a) + ' à ' + qf(b) + ' de f(x) dx = [F(x)] de ' + qf(a) + ' à ' + qf(b) + ' = F(' + qf(b) + ') - F(' + qf(a) + ') = ' + qf(Fb) + ' - (' + qf(Fa) + ') = ' + qf(I) + '.');
      let pos = true; for (let k = 0; k <= 50; k++) { const x = a.val() + (b.val() - a.val()) * k / 50; if (c.reduce((acc, q, j) => acc + q.val() * Math.pow(x, j), 0) < -1e-12) pos = false; }
      if (pos && b.val() > a.val()) lines.push('Comme f(x) ≥ 0 sur [' + qf(a) + ' ; ' + qf(b) + '], cette intégrale est l\'aire (en unités d\'aire) du domaine sous la courbe.');
      let approx = 0; const N2 = 1000, h = (b.val() - a.val()) / N2; for (let k = 0; k < N2; k++) { const x = a.val() + (k + 0.5) * h; approx += c.reduce((acc, q, j) => acc + q.val() * Math.pow(x, j), 0) * h; }
      e3.push('Contrôle numérique (méthode des rectangles) : ≈ ' + f2(approx, 3) + ' ✅');
      concl = 'I = ' + qf(I) + (/\//.test(qf(I)) ? ' ≈ ' + f2(I.val(), 3) : ''); answers = [I.val()]; graph.area = [a.val(), b.val()];
    }
    return res({ type: 'integrale', titre: a !== null ? 'Intégrale de ' + fS : 'Primitive de ' + fS, difficulte: a !== null ? 'difficile' : 'moyen',
      e1: 'On travaille avec f(x) = ' + fS + (a !== null ? ' sur [' + qf(a) + ' ; ' + qf(b) + ']' : '') + '. Méthode : on trouve une primitive F puis ' + (a !== null ? 'on calcule F(b) - F(a).' : 'on ajuste la constante si une condition est donnée.'),
      e2: L(lines), e3: L(e3), conclusion: concl, reponse: concl, answers, gen: { k: 'integrale' }, graph });
  }

  // ================================================================= 6. DÉNOMBREMENT ET PROBABILITÉS
  function solveProba(text, ctx) {
    const s = strip(text); const l = lc(text);
    const kw = /lance[^.]*\bdes?\b|factorielle|\d+\s*!|combinaison|arrangement|parmi|probabilit|urne|tirage|\bpodium|anagramme|permutation|\bc\s*\(\s*\d+\s*[,;]\s*\d+\s*\)|\ba\s*\(\s*\d+\s*[,;]\s*\d+\s*\)|de combien de (facons|manieres)/;
    if (!kw.test(s)) return null;
    const lines = [], e3 = []; let concl, titre, answers, e1;
    let m;
    // anagrammes
    if ((m = text.match(/anagrammes?\s+(?:du\s+mot\s+)?[«"“]?\s*([A-Za-zÀ-ÿ]{2,})/i))) {
      const w = m[1].toUpperCase(); const cnt = {}; [...w].forEach((ch) => { cnt[ch] = (cnt[ch] || 0) + 1; });
      const reps = Object.entries(cnt).filter(([, v]) => v > 1); let r = fact(w.length); reps.forEach(([, v]) => { r /= fact(v); });
      lines.push('Le mot ' + w + ' a ' + w.length + ' lettres. Si toutes étaient différentes : ' + w.length + '! = ' + big(fact(w.length)) + ' rangements.');
      if (reps.length) lines.push('Lettres répétées : ' + reps.map(([k, v]) => k + ' (' + v + ' fois)').join(', ') + ' → on divise par ' + reps.map(([, v]) => v + '!').join(' × ') + '.');
      lines.push('Nombre d\'anagrammes = ' + big(r) + '.');
      return res({ type: 'proba', titre: 'Anagrammes de ' + w, difficulte: 'moyen', e1: 'Un anagramme est un rangement des lettres : c\'est une permutation (avec répétitions si des lettres se répètent).', e2: L(lines), e3: 'Petit test : le mot « ABA » a 3!/2! = 3 anagrammes (AAB, ABA, BAA) ✅', conclusion: big(r) + ' anagrammes', answers: [Number(r)], gen: { k: 'proba' } });
    }
    // urne
    const balls = [...s.matchAll(/(\d+)\s*boules?\s*(rouges?|blanches?|noires?|vertes?|bleues?|jaunes?)/g)].map((x) => ({ n: +x[1], c: x[2].replace(/s$/, ''), i: x.index }))
      .filter((b, k, arr) => arr.findIndex((o) => o.c === b.c) === k && !/(tire|tirer|obtenir|avoir|choisi\w*)\s*(simultanement\s*)?$/.test(s.slice(Math.max(0, b.i - 25), b.i).trim()));
    if (balls.length >= 2 || (balls.length === 1 && /autres?/.test(s))) {
      const Ntot = balls.reduce((a2, b2) => a2 + b2.n, 0); titre = 'Probabilités : tirage dans une urne';
      e1 = 'L\'urne contient ' + balls.map((b2) => b2.n + ' boule(s) ' + b2.c + (b2.n > 1 ? 's' : '')).join(', ') + ', soit ' + Ntot + ' boules indiscernables au toucher : on est en situation d\'équiprobabilité.';
      const two = /deux boules|2 boules/.test(s); const simult = /simultan/.test(s); const remise = /avec remise/.test(s); const sans = /sans remise/.test(s);
      const out = [];
      if (!two) { balls.forEach((b2) => { const p = b2.n / Ntot; lines.push('P(' + b2.c + ') = nombre de boules ' + b2.c + 's ÷ nombre total = ' + b2.n + '/' + Ntot + ' = ' + rat(p) + (/\//.test(rat(p)) ? ' ≈ ' + f2(p, 3) : '') + '.'); out.push('P(' + b2.c + ') = ' + rat(p)); }); e3.push('Somme des probabilités : ' + balls.map((b2) => b2.n + '/' + Ntot).join(' + ') + ' = 1 ✅'); answers = balls.map((b2) => b2.n / Ntot); }
      else if (simult || sans) {
        const Om = binom(Ntot, 2); lines.push((simult ? 'Tirage simultané' : 'Tirage sans remise') + ' de 2 boules : nombre de tirages possibles = C(' + Ntot + ', 2) = ' + Om + '.');
        let same = 0; balls.forEach((b2) => { const f = binom(b2.n, 2); same += f; lines.push('P(2 boules ' + b2.c + 's) = C(' + b2.n + ', 2) / C(' + Ntot + ', 2) = ' + f + '/' + Om + ' = ' + rat(f / Om) + '.'); out.push('P(2 ' + b2.c + 's) = ' + rat(f / Om)); });
        lines.push('P(2 boules de même couleur) = ' + same + '/' + Om + ' = ' + rat(same / Om) + ' ; P(2 couleurs différentes) = 1 - ' + rat(same / Om) + ' = ' + rat(1 - same / Om) + '.');
        out.push('P(couleurs différentes) = ' + rat(1 - same / Om)); e3.push('Les événements « même couleur » et « couleurs différentes » sont contraires : ' + rat(same / Om) + ' + ' + rat(1 - same / Om) + ' = 1 ✅'); answers = balls.map((b2) => binom(b2.n, 2) / Om);
      } else {
        lines.push('Tirage successif ' + (remise ? 'avec remise' : '') + ' de 2 boules : les tirages sont indépendants, on multiplie les probabilités.');
        let same = 0; balls.forEach((b2) => { const p = (b2.n / Ntot) ** 2; same += p; lines.push('P(2 ' + b2.c + 's) = (' + b2.n + '/' + Ntot + ')² = ' + rat(p) + '.'); out.push('P(2 ' + b2.c + 's) = ' + rat(p)); });
        lines.push('P(couleurs différentes) = 1 - ' + rat(same) + ' = ' + rat(1 - same) + '.'); e3.push('Arbre de probabilités : la somme de toutes les branches vaut 1 ✅'); answers = balls.map((b2) => (b2.n / Ntot) ** 2);
      }
      concl = out.join(' ; ');
      return res({ type: 'proba', titre, difficulte: two ? 'difficile' : 'facile', e1, e2: L(lines), e3: L(e3), conclusion: concl, reponse: concl, answers, gen: { k: 'proba' } });
    }
    // dés
    if (/(^|[^a-zà-ÿ])dés?([^a-zà-ÿ]|$)/.test(l) && /lance|jet/.test(s)) {
      const deux = /deux d[ée]s|2 d[ée]s/.test(l); titre = 'Probabilités : lancer de dé' + (deux ? 's' : '');
      if (deux) { m = s.match(/somme[^0-9]{0,30}?(\d+)/); if (m) { const S2 = +m[1]; const fav = []; for (let a1 = 1; a1 <= 6; a1++) for (let b1 = 1; b1 <= 6; b1++) if (a1 + b1 === S2) fav.push('(' + a1 + ',' + b1 + ')'); lines.push('Deux dés : 6 × 6 = 36 issues équiprobables.', 'Issues favorables (somme ' + S2 + ') : ' + (fav.join(' ') || 'aucune') + ' → ' + fav.length + ' issue(s).', 'P = ' + fav.length + '/36 = ' + rat(fav.length / 36) + '.'); concl = 'P(somme = ' + S2 + ') = ' + rat(fav.length / 36); answers = [fav.length / 36]; e3.push('Tableau à double entrée 6 × 6 : on compte bien ' + fav.length + ' case(s) ✅'); } }
      else {
        const ev = []; const add = (name, set) => ev.push({ name, set });
        if (/pair/.test(s) && !/impair/.test(s)) add('nombre pair', [2, 4, 6]); if (/impair/.test(s)) add('nombre impair', [1, 3, 5]);
        if ((m = s.match(/multiple de (\d)/))) add('multiple de ' + m[1], [1, 2, 3, 4, 5, 6].filter((x) => x % +m[1] === 0));
        if ((m = s.match(/(?:superieur|plus grand) (?:ou egal )?a (\d)/))) { const eq = /ou egal/.test(s); add('supérieur ' + (eq ? 'ou égal ' : '') + 'à ' + m[1], [1, 2, 3, 4, 5, 6].filter((x) => (eq ? x >= +m[1] : x > +m[1]))); }
        if ((m = s.match(/(?:inferieur|plus petit) (?:ou egal )?a (\d)/))) { const eq = /ou egal/.test(s); add('inférieur ' + (eq ? 'ou égal ' : '') + 'à ' + m[1], [1, 2, 3, 4, 5, 6].filter((x) => (eq ? x <= +m[1] : x < +m[1]))); }
        if ((m = s.match(/au moins (\d)/))) add('au moins ' + m[1], [1, 2, 3, 4, 5, 6].filter((x) => x >= +m[1]));
        if (/premier/.test(s)) add('nombre premier', [2, 3, 5]);
        if ((m = s.match(/(?:obtenir|faire|sortir) (?:le |un )?(\d)\b/))) add('obtenir ' + m[1], [+m[1]]);
        if (!ev.length) return null;
        lines.push('Univers Ω = {1 ; 2 ; 3 ; 4 ; 5 ; 6} : 6 issues équiprobables (dé équilibré).');
        ev.forEach((e) => lines.push('Événement « ' + e.name + ' » = {' + e.set.join(' ; ') + '} → P = ' + e.set.length + '/6 = ' + rat(e.set.length / 6) + '.'));
        concl = ev.map((e) => 'P(' + e.name + ') = ' + rat(e.set.length / 6)).join(' ; '); answers = ev.map((e) => e.set.length / 6); e3.push('Chaque probabilité est entre 0 et 1, et P(contraire) = 1 - P ✅');
      }
      if (!concl) return null;
      return res({ type: 'proba', titre, difficulte: 'facile', e1: 'Un dé équilibré donne des issues équiprobables : P(A) = nombre d\'issues favorables ÷ nombre d\'issues possibles.', e2: L(lines), e3: L(e3), conclusion: concl, reponse: concl, answers, gen: { k: 'proba' } });
    }
    // loi binomiale
    if ((m = s.match(/(\d+)\s*fois/)) && /exactement|au moins un|aucun|pile|succes/.test(s)) {
      const n = +m[1]; let p = /piece|pile|face/.test(s) ? 0.5 : null; const pm = s.match(/probabilite\s*(?:de succes\s*)?(?:est\s*)?(?:egale a|=|de|p\s*=)?\s*(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?)/); if (pm) p = pq(pm[1]).val(); if (p === null || p <= 0 || p >= 1) return null;
      const out = []; titre = 'Loi binomiale B(' + n + ' ; ' + rat(p) + ')';
      lines.push('On répète ' + n + ' fois, de façon identique et indépendante, une épreuve à deux issues (succès de probabilité p = ' + rat(p) + ') : X suit la loi binomiale B(' + n + ' ; ' + rat(p) + ').', 'Formule : P(X = k) = C(n, k) × pᵏ × (1 - p)ⁿ⁻ᵏ.');
      if ((m = s.match(/exactement (\d+)/))) { const k = +m[1]; const P0 = binom(n, k) * p ** k * (1 - p) ** (n - k); lines.push('P(X = ' + k + ') = C(' + n + ', ' + k + ') × ' + rat(p) + '^' + k + ' × ' + rat(1 - p) + '^' + (n - k) + ' = ' + binom(n, k) + ' × ' + f2(p ** k, 5) + ' × ' + f2((1 - p) ** (n - k), 5) + ' ≈ ' + f2(P0, 4) + '.'); out.push('P(X = ' + k + ') ≈ ' + f2(P0, 4)); answers = [P0]; }
      if (/au moins un/.test(s)) { const P1 = 1 - (1 - p) ** n; lines.push('P(X ≥ 1) = 1 - P(X = 0) = 1 - ' + rat(1 - p) + '^' + n + ' ≈ ' + f2(P1, 4) + '.'); out.push('P(X ≥ 1) ≈ ' + f2(P1, 4)); }
      if (/aucun/.test(s)) { const P2 = (1 - p) ** n; lines.push('P(X = 0) = ' + rat(1 - p) + '^' + n + ' ≈ ' + f2(P2, 4) + '.'); out.push('P(X = 0) ≈ ' + f2(P2, 4)); }
      if (!out.length) return null;
      lines.push('Espérance E(X) = np = ' + f2(n * p, 3) + ' ; variance V(X) = np(1 - p) = ' + f2(n * p * (1 - p), 3) + '.');
      concl = out.join(' ; '); e3.push('La somme des P(X = k) pour k de 0 à ' + n + ' vaut bien 1 ✅');
      return res({ type: 'proba', titre, difficulte: 'difficile', e1: 'On reconnaît un schéma de Bernoulli : ' + n + ' répétitions indépendantes.', e2: L(lines), e3: L(e3), conclusion: concl, reponse: concl, answers, gen: { k: 'proba' } });
    }
    // factorielle, combinaisons, arrangements
    const out = [];
    [...text.matchAll(/(\d+)\s*!/g)].forEach((x) => { const n = +x[1]; if (n <= 60) { lines.push(n + '! = ' + (n <= 8 ? Array.from({ length: n }, (_, k) => n - k).join(' × ') + ' = ' : '') + big(fact(n)) + '.'); out.push(n + '! = ' + big(fact(n))); } });
    if ((m = s.match(/factorielle (?:de )?(\d+)/))) { const n = +m[1]; lines.push(n + '! = ' + big(fact(n)) + '.'); out.push(n + '! = ' + big(fact(n))); }
    [...text.matchAll(/\bC\s*\(\s*(\d+)\s*[,;]\s*(\d+)\s*\)/g)].forEach((x) => { const n = +x[1], k = +x[2]; lines.push('C(' + n + ', ' + k + ') = ' + n + '! / (' + k + '! × ' + (n - k) + '!) = ' + binom(n, k) + '.'); out.push('C(' + n + ', ' + k + ') = ' + binom(n, k)); });
    [...text.matchAll(/\bA\s*\(\s*(\d+)\s*[,;]\s*(\d+)\s*\)/g)].forEach((x) => { const n = +x[1], k = +x[2]; const A = Number(fact(n) / fact(n - k)); lines.push('A(' + n + ', ' + k + ') = ' + n + '! / ' + (n - k) + '! = ' + Array.from({ length: k }, (_, j) => n - j).join(' × ') + ' = ' + A + '.'); out.push('A(' + n + ', ' + k + ') = ' + A); });
    if (!out.length && (m = s.match(/(\d+)\s*[a-z' ]{0,40}?parmi\s*(?:les\s*)?(\d+)/))) {
      const k = +m[1], n = +m[2]; if (k > n) return null;
      const ordre = /ordre|classement|podium|successivement|president|tresorier|secretaire|1er|premier.*deuxieme|distinct|tierce/.test(s);
      if (ordre) { const A = Number(fact(n) / fact(n - k)); lines.push('L\'ordre compte (les places sont différentes) : on compte des ARRANGEMENTS.', 'A(' + n + ', ' + k + ') = ' + Array.from({ length: k }, (_, j) => n - j).join(' × ') + ' = ' + A + '.'); out.push(A + ' possibilités (arrangements)'); answers = [A]; }
      else { lines.push('L\'ordre ne compte pas (on forme un groupe) : on compte des COMBINAISONS.', 'C(' + n + ', ' + k + ') = ' + n + '! / (' + k + '! × ' + (n - k) + '!) = ' + binom(n, k) + '.'); out.push(binom(n, k) + ' possibilités (combinaisons)'); answers = [binom(n, k)]; }
    }
    if (!out.length && (m = s.match(/(?:ranger|asseoir|aligner|placer|classer|ordonner)\s*(\d+)/)) || (!out.length && (m = s.match(/(\d+)\s*(?:personnes|eleves|livres|objets|coureurs)[^.]*(?:ranger|asseoir|aligner|placer|classer)/)))) { const n = +m[1]; lines.push('On range ' + n + ' éléments distincts : c\'est une permutation.', n + '! = ' + big(fact(n)) + '.'); out.push(big(fact(n)) + ' façons'); answers = [Number(fact(n))]; }
    if (!out.length) return null;
    if (!answers) answers = out.map((o) => parseFloat(o.split('=').pop().replace(/\s/g, ''))).filter((x) => !isNaN(x));
    return res({ type: 'proba', titre: 'Dénombrement', difficulte: 'moyen', e1: 'On identifie le bon outil : permutation (tout ranger, n!), arrangement (choisir AVEC ordre, A(n,k)) ou combinaison (choisir SANS ordre, C(n,k)).',
      e2: L(lines), e3: 'Rappels de contrôle : C(n, k) = C(n, n - k) et A(n, k) = C(n, k) × k! ✅', conclusion: out.join(' ; '), reponse: out.join(' ; '), answers, gen: { k: 'proba' } });
  }

  // ---------------------------------------------------------------- générateurs d'exercices similaires
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const nz = (a, b) => { let x = 0; while (!x) x = rnd(a, b); return x; };
  const GEN = {
    suite: () => { if (Math.random() < 0.5) { const u = rnd(-5, 10), r = nz(-4, 6), n = rnd(8, 20); return { enonce: 'Soit (uₙ) la suite arithmétique de premier terme u0 = ' + u + ' et de raison r = ' + r + '. Calculer u' + n + '.', answers: [u + n * r] }; } const u = rnd(1, 5), q = rnd(2, 3), n = rnd(4, 7); return { enonce: 'Soit (uₙ) la suite géométrique de premier terme u0 = ' + u + ' et de raison q = ' + q + '. Calculer u' + n + '.', answers: [u * q ** n] }; },
    complexe: () => { if (Math.random() < 0.5) { const a = nz(-5, 5), b = nz(-5, 5), c = nz(-5, 5), d = nz(-5, 5); return { enonce: 'Écrire sous forme algébrique le nombre complexe z = (' + a + (b < 0 ? ' - ' + -b : ' + ' + b) + 'i)(' + c + (d < 0 ? ' - ' + -d : ' + ' + d) + 'i).', answers: [a * c - b * d, a * d + b * c] }; } const p = nz(-3, 3), q = rnd(1, 4); return { enonce: 'Résoudre dans ℂ l\'équation z² ' + (-2 * p < 0 ? '- ' + 2 * p : '+ ' + -2 * p) + 'z + ' + (p * p + q * q) + ' = 0.', answers: [p, q] }; },
    trig: () => { const T = [['cos', '1/2'], ['sin', '1/2'], ['cos', '√2/2'], ['sin', '√3/2'], ['cos', '-1/2']][rnd(0, 4)]; return { enonce: 'Résoudre dans [0 ; 2π[ l\'équation ' + T[0] + ' x = ' + T[1] + '.', text: true }; },
    limite: () => { const a = nz(-4, 4), b = nz(1, 6); return { enonce: 'Calculer la limite en +∞ de f(x) = (' + b + 'x² + ' + rnd(1, 9) + ')/(' + (a > 0 ? a : -a) + 'x² - ' + rnd(1, 9) + ')', answers: [b / Math.abs(a)] }; },
    integrale: () => { const a = rnd(1, 3), b = rnd(-3, 4), up = rnd(1, 3); const I = a * up ** 3 / 3 * 3 / 3 + 0; void I; return { enonce: 'Calculer l\'intégrale de 0 à ' + up + ' de (' + 3 * a + 'x² ' + (b < 0 ? '- ' + -2 * b : '+ ' + 2 * b) + 'x) dx', answers: [a * up ** 3 + b * up ** 2] }; },
    proba: () => { const r = rnd(2, 7), w = rnd(2, 7); return { enonce: 'Une urne contient ' + r + ' boules rouges et ' + w + ' boules blanches. On tire une boule au hasard. Quelle est la probabilité de tirer une boule rouge ?', answers: [r / (r + w)] }; },
    combi: () => { const n = rnd(6, 15), k = rnd(2, 4); return { enonce: 'De combien de façons peut-on choisir ' + k + ' élèves parmi ' + n + ' pour former un comité ?', answers: [binom(n, k)] }; }
  };

  // enregistrement (avant les solveurs généraux)
  [solveProba, solveIntegral, solveLimit, solveTrig, solveComplex, solveSuite].forEach((fn) => E.register(fn));
  const g0 = E.generate; E.generate = function (kind, ctx) { return GEN[kind] ? GEN[kind](ctx || {}) : (E._gen3 && E._gen3[kind] ? E._gen3[kind](ctx || {}) : g0(kind, ctx)); };
  E._u = { surd, f2, rat, pq, sqrtStr, sqrtQ, binom, fact, big, cparse, cstr, piStr, RNUM, sgn, evalC, cstrP, rnd, nz };
  E._gen2 = GEN;
  if (typeof module !== 'undefined') module.exports = E;
})(typeof window !== 'undefined' ? window : globalThis);
