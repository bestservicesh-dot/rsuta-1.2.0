/* RSuta — Moteur mathématique hors-ligne (rationnels, parseur, polynômes, calcul pas à pas)
   Aucune dépendance. Fonctionne dans le navigateur, Electron, Capacitor et Node. */
(function (G) {
  'use strict';

  // ---------- Rationnels ----------
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; }
  function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }

  function toFrac(x) {
    if (Number.isInteger(x)) return [x, 1];
    for (let k = 1; k <= 9; k++) {
      const p = Math.pow(10, k), v = x * p;
      if (Math.abs(v - Math.round(v)) < 1e-9) return [Math.round(v), p];
    }
    // approximation par fractions continues
    let h1 = 1, h0 = 0, k1 = 0, k0 = 1, b = x;
    for (let i = 0; i < 30; i++) {
      const a = Math.floor(b);
      [h1, h0] = [a * h1 + h0, h1]; [k1, k0] = [a * k1 + k0, k1];
      if (Math.abs(x - h1 / k1) < 1e-12 || k1 > 1e8) break;
      b = 1 / (b - a);
    }
    return [h1, k1];
  }

  class Q {
    constructor(n, d) {
      if (d === undefined) d = 1;
      if (!Number.isInteger(n) || !Number.isInteger(d)) {
        const [a, b] = toFrac(n / d); n = a; d = b;
      }
      if (d === 0) throw new Error('DIV0');
      if (d < 0) { n = -n; d = -d; }
      const g = gcd(n, d); this.n = n / g; this.d = d / g;
      if (this.n === 0) this.n = 0; // évite -0
    }
    static of(x) { return x instanceof Q ? x : new Q(x, 1); }
    add(o) { o = Q.of(o); return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o) { o = Q.of(o); return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o) { o = Q.of(o); return new Q(this.n * o.n, this.d * o.d); }
    div(o) { o = Q.of(o); if (o.n === 0) throw new Error('DIV0'); return new Q(this.n * o.d, this.d * o.n); }
    neg() { return new Q(-this.n, this.d); }
    pow(k) {
      if (!Number.isInteger(k)) throw new Error('POW');
      let r = new Q(1), b = k < 0 ? new Q(this.d, this.n) : this; k = Math.abs(k);
      for (let i = 0; i < k; i++) r = r.mul(b);
      return r;
    }
    abs() { return new Q(Math.abs(this.n), this.d); }
    cmp(o) { o = Q.of(o); return Math.sign(this.n * o.d - o.n * this.d); }
    eq(o) { return this.cmp(o) === 0; }
    isZero() { return this.n === 0; }
    isInt() { return this.d === 1; }
    sign() { return Math.sign(this.n); }
    val() { return this.n / this.d; }
    // racine carrée exacte si possible
    sqrt() {
      if (this.n < 0) return null;
      const a = Math.round(Math.sqrt(this.n)), b = Math.round(Math.sqrt(this.d));
      if (a * a === this.n && b * b === this.d) return new Q(a, b);
      return null;
    }
  }

  // ---------- Formatage français ----------
  function fmtNum(x, dec) {
    if (dec === undefined) dec = 2;
    if (!isFinite(x)) return String(x);
    const r = Math.round(x * Math.pow(10, dec)) / Math.pow(10, dec);
    let s = String(r);
    if (Math.abs(r) >= 10000) { const [ip, dp] = s.split('.'); s = ip.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (dp ? '.' + dp : ''); }
    return s.replace('.', ',');
  }
  function finiteDecimal(d) { while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; }
  const FMT = { preferDecimal: false };
  function fmt(q) {
    q = Q.of(q);
    if (q.d === 1) return String(q.n);
    if (FMT.preferDecimal && finiteDecimal(q.d)) return fmtNum(q.val(), 6);
    return q.n + '/' + q.d;
  }
  function fmtBoth(q) {
    q = Q.of(q);
    if (q.d === 1) return String(q.n);
    if (finiteDecimal(q.d)) {
      const dstr = fmtNum(q.val(), 6);
      return FMT.preferDecimal ? dstr : (q.n + '/' + q.d + ' = ' + dstr);
    }
    return q.n + '/' + q.d + ' ≈ ' + fmtNum(q.val(), 2);
  }
  function sup(k) { const m = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }; return String(k).split('').map(c => m[c] || c).join(''); }

  // ---------- Normalisation du texte mathématique ----------
  function norm(s) {
    let t = String(s);
    // nombres écrits avec espaces de milliers : « 1 250 » → 1250 (v1.1)
    t = t.replace(/(^|[^\d.,])(\d{1,3}(?:[ \u00a0\u202f]\d{3})+)(?!\d)/g, (m, a, b) => a + b.replace(/[ \u00a0\u202f]/g, ''));
    t = t.replace(/[−–—]/g, '-').replace(/[×✕·∙⋅]/g, '*').replace(/÷/g, '/')
      .replace(/²/g, '^2').replace(/³/g, '^3').replace(/<=|=</g, '≤').replace(/>=|=>/g, '≥')
      .replace(/√\s*\(/g, 'sqrt(').replace(/√\s*(\d+(?:[.,]\d+)?)/g, 'sqrt($1)')
      .replace(/(\d),(\d)/g, '$1.$2')
      .replace(/(\d|\))\s*:\s*(\d|\()/g, '$1/$2')
      .replace(/\[/g, '(').replace(/\]/g, ')').replace(/\{/g, '(').replace(/\}/g, ')');
    return t;
  }

  // ---------- Tokeniseur / parseur ----------
  const FUNCS = ['sqrt', 'racine', 'ln', 'exp', 'log', 'sin', 'cos', 'tan'];
  function tokenize(s) {
    const out = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++;
        const raw = s.slice(i, j); if (raw === '.') throw new Error('SYNTAX');
        out.push({ k: 'num', v: parseFloat(raw), raw, dec: raw.includes('.') }); i = j; continue;
      }
      if (/[a-zA-Z]/.test(c)) {
        let j = i; while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
        const w = s.slice(i, j).toLowerCase();
        const f = FUNCS.find(fn => w === fn);
        if (f) { out.push({ k: 'fn', v: f === 'racine' ? 'sqrt' : f }); i = j; continue; }
        // suite de lettres = produit de variables (ex: xy)
        for (const ch of s.slice(i, j)) out.push({ k: 'var', v: ch });
        i = j; continue;
      }
      if ('+-*/^()'.includes(c)) { out.push({ k: 'op', v: c }); i++; continue; }
      throw new Error('SYNTAX');
    }
    return out;
  }

  function parse(str) {
    const toks = tokenize(norm(str)); let p = 0;
    const peek = () => toks[p], next = () => toks[p++];
    const isOp = (v) => peek() && peek().k === 'op' && peek().v === v;
    function expr() {
      let a = term();
      while (isOp('+') || isOp('-')) { const op = next().v; const b = term(); a = { t: 'op', op, a, b }; }
      return a;
    }
    function startsAtom() { const t = peek(); return t && (t.k === 'num' || t.k === 'var' || t.k === 'fn' || (t.k === 'op' && t.v === '(')); }
    function term() {
      let a = factor();
      for (;;) {
        if (isOp('*') || isOp('/')) { const op = next().v; const b = factor(); a = { t: 'op', op, a, b }; }
        else if (startsAtom()) { const b = power(); a = { t: 'op', op: '*', a, b, imp: true }; }
        else break;
      }
      return a;
    }
    function factor() {
      if (isOp('-')) { next(); return { t: 'neg', a: factor() }; }
      if (isOp('+')) { next(); return factor(); }
      return power();
    }
    function power() {
      const a = atom();
      if (isOp('^')) { next(); const b = factor(); return { t: 'op', op: '^', a, b }; }
      return a;
    }
    function atom() {
      const t = next();
      if (!t) throw new Error('SYNTAX');
      if (t.k === 'num') return { t: 'num', q: new Q(t.v), dec: t.dec };
      if (t.k === 'var') return { t: 'var', n: t.v };
      if (t.k === 'fn') {
        let a;
        if (isOp('(')) { next(); a = expr(); if (!isOp(')')) throw new Error('SYNTAX'); next(); a.p = true; }
        else a = power();
        return { t: 'fn', f: t.v, a };
      }
      if (t.k === 'op' && t.v === '(') {
        const e = expr(); if (!isOp(')')) throw new Error('PAREN'); next(); e.p = true; return e;
      }
      throw new Error('SYNTAX');
    }
    const r = expr();
    if (p < toks.length) throw new Error('SYNTAX');
    return r;
  }

  function hasDecimal(ast) { if (!ast) return false; if (ast.t === 'num') return !!ast.dec; return hasDecimal(ast.a) || hasDecimal(ast.b); }
  function varsOf(ast, set) {
    set = set || new Set();
    if (!ast) return set;
    if (ast.t === 'var') set.add(ast.n);
    varsOf(ast.a, set); varsOf(ast.b, set);
    return set;
  }

  // ---------- Affichage d'un arbre ----------
  const PREC = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 4 };
  function prec(n) { if (n.t === 'op') return PREC[n.op]; if (n.t === 'neg') return 3; return 5; }
  function toStr(n, o) {
    o = o || {};
    const S = (x, par) => toStr(x, Object.assign({}, o, { top: false, par: par }));
    let s;
    switch (n.t) {
      case 'num': s = fmt(n.q); if ((n.q.sign() < 0 && !o.top) || (s.includes('/') && (o.par === '^' || o.par === '*' || o.par === '/'))) s = '(' + s + ')'; break;
      case 'var': s = n.n; break;
      case 'neg': { const inner = prec(n.a) < 3 ? '(' + toStr(n.a, Object.assign({}, o, { top: true })) + ')' : S(n.a); s = '-' + inner; break; }
      case 'fn': s = (n.f === 'sqrt' ? '√' : n.f) + '(' + toStr(n.a, Object.assign({}, o, { top: true, noParen: true })) + ')'; break;
      case 'op': {
        const pp = PREC[n.op];
        let L = toStr(n.a, Object.assign({}, o, { top: o.top && !n.p, par: n.op })), R = S(n.b, n.op);
        if (prec(n.a) < pp || (n.op === '^' && prec(n.a) <= pp)) { if (!n.a.p) L = '(' + L + ')'; }
        if (prec(n.b) < pp || (prec(n.b) === pp && (n.op === '-' || n.op === '/')) || (n.op !== '^' && n.b.t === 'neg')) { if (!n.b.p) R = '(' + R + ')'; }
        if (n.op === '^') {
          if (n.b.t === 'num' && n.b.q.isInt() && n.b.q.n >= 0 && n.b.q.n < 10) s = L + sup(n.b.q.n);
          else s = L + '^' + R;
        } else if (n.op === '*') {
          if (n.imp && (n.b.t === 'var' || n.b.p || (n.b.t === 'op' && n.b.op === '^' && n.b.a.t === 'var') || n.b.t === 'fn') && n.a.t !== 'var' || (n.imp && n.a.t === 'var' && n.b.t === 'var')) s = L + R;
          else s = L + ' × ' + R;
        } else if (n.op === '/') s = L + (o.div || ' ÷ ') + R;
        else s = L + ' ' + n.op + ' ' + R;
        break;
      }
    }
    if (n.p && !o.noParen && n.t !== 'num' && n.t !== 'var') s = '(' + s.replace(/^\((.*)\)$/, (m, x) => balanced(x) ? x : m) + ')';
    return s;
  }
  function balanced(s) { let d = 0; for (const c of s) { if (c === '(') d++; if (c === ')') { d--; if (d < 0) return false; } } return d === 0; }
  function show(ast, o) { return toStr(ast, Object.assign({ top: true }, o || {})); }

  // ---------- Évaluation ----------
  function evalQ(n, env) {
    env = env || {};
    switch (n.t) {
      case 'num': return n.q;
      case 'var': if (env[n.n] === undefined) throw new Error('VAR'); return Q.of(env[n.n]);
      case 'neg': return evalQ(n.a, env).neg();
      case 'fn': {
        const a = evalQ(n.a, env);
        if (n.f === 'sqrt') { if (a.sign() < 0) throw new Error('SQRTNEG'); const r = a.sqrt(); return r || new Q(Math.sqrt(a.val())); }
        const fns = { ln: Math.log, exp: Math.exp, log: Math.log10, sin: Math.sin, cos: Math.cos, tan: Math.tan };
        return new Q(fns[n.f](a.val()));
      }
      case 'op': {
        const a = evalQ(n.a, env), b = evalQ(n.b, env);
        if (n.op === '+') return a.add(b); if (n.op === '-') return a.sub(b);
        if (n.op === '*') return a.mul(b); if (n.op === '/') return a.div(b);
        if (n.op === '^') { if (b.isInt()) return a.pow(b.n); return new Q(Math.pow(a.val(), b.val())); }
      }
    }
    throw new Error('EVAL');
  }
  function evalNum(n, env) { const e = {}; for (const k in env) e[k] = env[k]; return evalQ(n, e).val(); }

  // ---------- Calcul pas à pas (priorités opératoires) ----------
  function clone(n) { return n ? JSON.parse(JSON.stringify(n), (k, v) => (v && v.n !== undefined && v.d !== undefined && Object.keys(v).length === 2) ? new Q(v.n, v.d) : v) : n; }
  function isReady(n) {
    if (n.t === 'neg') return n.a.t === 'num';
    if (n.t === 'fn') return n.a.t === 'num';
    if (n.t === 'op') return n.a.t === 'num' && n.b.t === 'num';
    return false;
  }
  function cls(n) { if (n.t === 'fn' || (n.t === 'op' && n.op === '^')) return 3; if (n.t === 'op' && (n.op === '*' || n.op === '/')) return 2; if (n.t === 'neg') return 2.5; return 1; }
  function arithSteps(ast) {
    let cur = clone(ast); const steps = []; let guard = 0;
    const ops = [];
    while (cur.t !== 'num' && guard++ < 40) {
      const ready = [];
      (function walk(n, depth) {
        if (!n || n.t === 'num' || n.t === 'var') return;
        const d = depth + (n.p ? 1 : 0);
        if (isReady(n)) ready.push({ n, d, c: cls(n) });
        else { walk(n.a, d); walk(n.b, d); }
      })(cur, 0);
      if (!ready.length) break;
      ready.sort((x, y) => (y.d - x.d) || (y.c - x.c));
      const best = ready[0];
      let chosen = ready.filter(r => r.d === best.d && r.c === best.c);
      if (best.c === 1) chosen = [chosen[0]]; // additions : de gauche à droite, une à la fois
      const kinds = new Set();
      for (const r of chosen) {
        const before = show(r.n);
        const val = evalQ(r.n);
        const was = r.n.p;
        Object.keys(r.n).forEach(k => delete r.n[k]);
        r.n.t = 'num'; r.n.q = val; if (was) r.n.wasParen = true;
        ops.push(before + ' = ' + fmt(val));
        kinds.add(best.d > 0 ? 'paren' : best.c === 3 ? 'pow' : best.c >= 2 ? 'mul' : 'add');
      }
      steps.push({ expr: show(cur), ops: ops.splice(0), kind: [...kinds][0] });
    }
    return { steps, result: cur.t === 'num' ? cur.q : null };
  }

  // ---------- Polynômes multivariés ----------
  // monôme : clé "x2" ou "x1y1" (variables triées). Constante : clé "".
  function monoKey(m) { return Object.keys(m).filter(v => m[v]).sort().map(v => v + m[v]).join(''); }
  function keyToMono(k) { const m = {}; (k.match(/[a-z]\d+/gi) || []).forEach(t => { m[t[0]] = parseInt(t.slice(1)); }); return m; }
  class P {
    constructor(map) { this.m = new Map(); if (map) for (const [k, v] of map) if (!v.isZero()) this.m.set(k, v); }
    static c(q) { const p = new P(); if (!Q.of(q).isZero()) p.m.set('', Q.of(q)); return p; }
    static v(name) { const p = new P(); p.m.set(name + '1', new Q(1)); return p; }
    add(o) { const r = new P(this.m); for (const [k, v] of o.m) { const s = (r.m.get(k) || new Q(0)).add(v); if (s.isZero()) r.m.delete(k); else r.m.set(k, s); } return r; }
    neg() { const r = new P(); for (const [k, v] of this.m) r.m.set(k, v.neg()); return r; }
    sub(o) { return this.add(o.neg()); }
    scale(q) { const r = new P(); q = Q.of(q); if (q.isZero()) return r; for (const [k, v] of this.m) r.m.set(k, v.mul(q)); return r; }
    mul(o) {
      let r = new P();
      for (const [k1, v1] of this.m) for (const [k2, v2] of o.m) {
        const a = keyToMono(k1), b = keyToMono(k2);
        for (const x in b) a[x] = (a[x] || 0) + b[x];
        r = r.add(new P(new Map([[monoKey(a), v1.mul(v2)]])));
      }
      return r;
    }
    pow(k) { let r = P.c(1); for (let i = 0; i < k; i++) r = r.mul(this); return r; }
    isConst() { return [...this.m.keys()].every(k => k === ''); }
    constVal() { return this.m.get('') || new Q(0); }
    vars() { const s = new Set(); for (const k of this.m.keys()) Object.keys(keyToMono(k)).forEach(v => s.add(v)); return [...s].sort(); }
    degree(v) { let d = 0; for (const k of this.m.keys()) { const m = keyToMono(k); const s = v ? (m[v] || 0) : Object.values(m).reduce((a, b) => a + b, 0); d = Math.max(d, s); } return d; }
    coeffs(v) { const arr = []; const deg = this.degree(v); for (let i = 0; i <= deg; i++) arr.push(new Q(0)); for (const [k, q] of this.m) { const m = keyToMono(k); arr[m[v] || 0] = arr[m[v] || 0].add(q); } return arr; }
    coef(k) { return this.m.get(k) || new Q(0); }
    isZero() { return this.m.size === 0; }
    deriv(v) { const r = new P(); for (const [k, q] of this.m) { const m = keyToMono(k); const e = m[v] || 0; if (!e) continue; m[v] = e - 1; r.m.set(monoKey(m), q.mul(e)); } return r; }
    evalAt(env) { let s = new Q(0); for (const [k, q] of this.m) { const m = keyToMono(k); let t = q; for (const x in m) t = t.mul(Q.of(env[x]).pow(m[x])); s = s.add(t); } return s; }
    toString() { return polyStr(this); }
  }
  function polyFromCoeffs(c, v) { const p = new P(); c.forEach((q, i) => { q = Q.of(q); if (!q.isZero()) p.m.set(i ? v + i : '', q); }); return p; }
  function monoStr(k) { const m = keyToMono(k); return Object.keys(m).sort().map(v => v + (m[v] > 1 ? sup(m[v]) : '')).join(''); }
  function polyStr(p, order) {
    if (p.isZero()) return '0';
    const keys = [...p.m.keys()].sort((a, b) => {
      const da = Object.values(keyToMono(a)).reduce((s, x) => s + x, 0), db = Object.values(keyToMono(b)).reduce((s, x) => s + x, 0);
      if (db !== da) return db - da; return a < b ? -1 : 1;
    });
    let s = '';
    keys.forEach((k, i) => {
      const q = p.m.get(k), neg = q.sign() < 0, a = q.abs();
      const ms = monoStr(k);
      let body;
      if (!ms) body = fmt(a);
      else if (a.eq(1)) body = ms;
      else body = (a.isInt() || FMT.preferDecimal && finiteDecimal(a.d) ? fmt(a) : '(' + fmt(a) + ')') + ms;
      if (i === 0) s += (neg ? '-' : '') + body; else s += (neg ? ' - ' : ' + ') + body;
    });
    return s;
  }
  function toPoly(n) {
    switch (n.t) {
      case 'num': return P.c(n.q);
      case 'var': return P.v(n.n);
      case 'neg': { const a = toPoly(n.a); return a && a.neg(); }
      case 'fn': return null;
      case 'op': {
        const a = toPoly(n.a), b = toPoly(n.b); if (!a || !b) return null;
        if (n.op === '+') return a.add(b); if (n.op === '-') return a.sub(b); if (n.op === '*') return a.mul(b);
        if (n.op === '/') { if (!b.isConst() || b.constVal().isZero()) return null; return a.scale(new Q(1).div(b.constVal())); }
        if (n.op === '^') { if (!b.isConst()) return null; const e = b.constVal(); if (!e.isInt() || e.n < 0 || e.n > 12) return null; return a.pow(e.n); }
      }
    }
    return null;
  }

  // racines rationnelles d'un polynôme à coefficients rationnels
  function divisors(n) { n = Math.abs(n); const r = []; for (let i = 1; i <= Math.min(n, 100000); i++) if (n % i === 0) r.push(i); return r; }
  function rationalRoots(c) { // c[i] coeff de x^i
    let den = 1; c.forEach(q => { den = lcm(den, q.d); });
    const ints = c.map(q => q.mul(den).n);
    // retire racine 0
    const roots = []; let k = 0; while (k < ints.length - 1 && ints[k] === 0) k++;
    if (k > 0) roots.push(new Q(0));
    const a0 = ints[k], an = ints[ints.length - 1];
    if (!a0 || !an) return roots;
    const ps = divisors(a0), qs = divisors(an), seen = new Set();
    for (const p of ps) for (const q of qs) for (const s of [1, -1]) {
      const r = new Q(s * p, q), key = r.n + '/' + r.d; if (seen.has(key)) continue; seen.add(key);
      let v = new Q(0); for (let i = c.length - 1; i >= 0; i--) v = v.mul(r).add(c[i]);
      if (v.isZero()) roots.push(r);
    }
    return roots;
  }
  function syntheticDiv(c, r) { // divise par (x - r) ; c[i] coeff x^i
    const n = c.length - 1, out = new Array(n); let acc = new Q(0);
    for (let i = n; i >= 1; i--) { acc = acc.mul(r).add(c[i]); out[i - 1] = acc; }
    return out;
  }

  // ---------- Arithmétique ----------
  function primeFactors(n) { const f = []; let d = 2; while (n > 1 && d * d <= n) { while (n % d === 0) { f.push(d); n /= d; } d++; } if (n > 1) f.push(n); return f; }
  function isPrime(n) { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; }

  const RMath = { Q, P, gcd, lcm, fmt, fmtBoth, fmtNum, FMT, sup, norm, tokenize, parse, show, toStr, evalQ, evalNum, arithSteps, toPoly, polyStr, polyFromCoeffs, rationalRoots, syntheticDiv, primeFactors, isPrime, hasDecimal, varsOf, clone, finiteDecimal };
  G.RMath = RMath;
  if (typeof module !== 'undefined') module.exports = RMath;
})(typeof window !== 'undefined' ? window : globalThis);
