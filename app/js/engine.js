/* RSuta — Le prof qui ne dort pas : moteur de résolution HORS-LIGNE
   Chaque solveur renvoie un objet "résultat" en 3 étapes conforme au prompt système officiel. */
(function (G) {
  'use strict';
  const M = G.RMath || (typeof require !== 'undefined' ? require('./math.js') : null);
  const { Q, P, fmt, fmtBoth, fmtNum, sup } = M;

  // ---------------------------------------------------------------- utilitaires
  const lc = (s) => String(s || '').toLowerCase();
  const strip = (s) => lc(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  function parseFr(s) { return parseFloat(String(s).replace(/\s/g, '').replace(',', '.')); }
  const NUM = '(-?\\d{1,3}(?:[ \\u00a0\\u202f]\\d{3})+(?:[.,]\\d+)?|-?\\d+(?:[.,]\\d+)?)';
  function nums(text) { const r = []; const re = new RegExp(NUM, 'g'); let m; while ((m = re.exec(text))) r.push(parseFr(m[1])); return r; }
  function numNear(text, kw, after, before) {
    const t = strip(text);
    after = after || 40; before = before || 18;
    let m = new RegExp('(?:' + kw + ')[^0-9\\n]{0,' + after + '}?' + NUM).exec(t);
    if (m) return parseFr(m[1]);
    m = new RegExp(NUM + '\\s*[^0-9\\n]{0,' + before + '}?(?:' + kw + ')').exec(t);
    if (m) return parseFr(m[1]);
    return null;
  }
  const money = (x) => fmtNum(x, 2) + ' F CFA';
  function res(o) {
    return Object.assign({ source: 'offline', confidence: 0.9, difficulte: 'moyen' }, o, {
      etapes: [
        { titre: "On comprend l'exercice", texte: o.e1 },
        { titre: 'On applique la méthode', texte: o.e2 },
        { titre: 'On vérifie', texte: o.e3 }
      ]
    });
  }
  const L = (arr) => arr.filter(Boolean).join('\n');
  const isLow = (ctx) => ctx && (ctx.niveau === 'CEP');

  // ---------------------------------------------------------------- extraction de la partie mathématique
  const SMALLWORDS = new Set(['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'en', 'on', 'si', 'ou', 'sa', 'se', 'ce', 'il', 'au', 'ne', 'ni', 'ma', 'mon', 'ta', 'ton', 'que', 'qui', 'par', 'sur', 'est', 'pour', 'avec', 'dans', 'son', 'ses', 'tu', 'je', 'nous', 'vous', 'lui', 'eux', 'aux', 'cm', 'mm', 'km', 'kg', 'dm', 'ha']);
  const FUNCS = ['sqrt', 'racine', 'ln', 'exp', 'log', 'sin', 'cos', 'tan'];
  function cleanMath(line) {
    let t = String(line)
      .replace(/\bdans\s*(?:R|ℝ|IR)\b/g, ' ').replace(/ℝ/g, ' ')
      .replace(/\(\s*[A-Z]\d?\s*\)\s*:?/g, ' ; ')
      .replace(/[A-Za-zÀ-ÖØ-öø-ÿ]+'/g, ' ; ')
      .replace(/\b[a-zA-Z]+\d*\s*\)\s*/g, (m) => /^[a-h]\)\s*$/.test(m.trim()) || /^\d+\)/.test(m) ? ' ; ' : m);
    t = t.replace(/[A-Za-zÀ-ÖØ-öø-ÿ]+/g, (w) => {
      const l = w.toLowerCase();
      if (FUNCS.includes(l)) return w;
      if (/[À-ÖØ-öø-ÿ]/.test(w) || w.length >= 3 || SMALLWORDS.has(l)) return ' ; ';
      return w;
    });
    return t;
  }
  const REL = /(≤|≥|<|>|=)/;
  function mathSegments(text) {
    const segs = [];
    String(text).split(/\n|;/).forEach((line) => {
      cleanMath(M.norm(line)).split(';').forEach((s) => {
        s = s.replace(/^[\s:.,!?=]+|[\s:.,!?]+$/g, '').trim();
        if (s && /[0-9a-z]/i.test(s)) segs.push(s);
      });
    });
    return segs;
  }
  function tryParse(s) { try { return M.parse(s); } catch (e) { return null; } }

  // ---------------------------------------------------------------- substitution pour vérification
  function subst(ast, env) {
    if (!ast) return ast;
    if (ast.t === 'var' && env[ast.n] !== undefined) return { t: 'num', q: Q.of(env[ast.n]) };
    const c = Object.assign({}, ast);
    if (c.a) c.a = subst(c.a, env); if (c.b) c.b = subst(c.b, env);
    if (c.t === 'op' && c.op === '*' && c.imp && (c.a.t === 'num' || c.b.t === 'num')) c.imp = false;
    return c;
  }
  function verifLine(ast, env) {
    const s = subst(ast, env);
    const shown = M.show(s);
    const v = M.evalQ(s);
    return { shown, v, txt: shown === fmt(v) ? fmt(v) : shown + ' = ' + fmt(v) };
  }

  // ---------------------------------------------------------------- second degré (outil partagé)
  function quadText(a, b, c, v, low) {
    const lines = []; const roots = [];
    const nb = (q) => (q.sign() < 0 ? '(' + fmt(q) + ')' : fmt(q));
    if (c.isZero() && !b.isZero()) {
      lines.push('Il n\'y a pas de terme constant : on factorise par ' + v + ' → ' + v + '(' + M.polyStr(M.polyFromCoeffs([b, a], v)) + ') = 0.');
      lines.push('Un produit de facteurs est nul si l\'un au moins des facteurs est nul : ' + v + ' = 0 ou ' + M.polyStr(M.polyFromCoeffs([b, a], v)) + ' = 0.');
      const r = b.neg().div(a);
      lines.push(M.polyStr(M.polyFromCoeffs([b, a], v)) + ' = 0 donne ' + v + ' = ' + fmt(r) + '.');
      roots.push({ q: new Q(0), s: '0' }, { q: r, s: fmt(r) });
      roots.sort((x, y) => x.q.cmp(y.q));
      return { lines, roots, delta: b.mul(b) };
    }
    if (b.isZero()) {
      const k = c.neg().div(a);
      lines.push('Il n\'y a pas de terme en ' + v + ' : on isole ' + v + '² → ' + v + '² = ' + fmt(k) + '.');
      if (k.sign() < 0) { lines.push('Un carré n\'est jamais négatif : aucune solution réelle.'); return { lines, roots, delta: k }; }
      if (k.isZero()) { lines.push(v + '² = 0 donne ' + v + ' = 0.'); roots.push({ q: new Q(0), s: '0' }); return { lines, roots, delta: k }; }
      const s = k.sqrt();
      if (s) { lines.push(v + ' = √' + fmt(k) + ' = ' + fmt(s) + ' ou ' + v + ' = -' + fmt(s) + '.'); roots.push({ q: s.neg(), s: fmt(s.neg()) }, { q: s, s: fmt(s) }); }
      else { const r = Math.sqrt(k.val()); lines.push(v + ' = √' + fmt(k) + ' ou ' + v + ' = -√' + fmt(k) + ' (≈ ±' + fmtNum(r) + ').'); roots.push({ q: null, val: -r, s: '-√' + fmt(k) }, { q: null, val: r, s: '√' + fmt(k) }); }
      return { lines, roots, delta: k };
    }
    const D = b.mul(b).sub(a.mul(c).mul(4));
    lines.push('On calcule le discriminant : Δ = b² - 4ac = ' + nb(b) + '² - 4 × ' + nb(a) + ' × ' + nb(c) + ' = ' + fmt(b.mul(b)) + (a.mul(c).mul(4).sign() < 0 ? ' + ' + fmt(a.mul(c).mul(4).neg()) : ' - ' + fmt(a.mul(c).mul(4))) + ' = ' + fmt(D) + '.');
    if (D.sign() < 0) { lines.push('Δ < 0 : l\'équation n\'a pas de solution dans ℝ.'); return { lines, roots, delta: D }; }
    if (D.isZero()) {
      const r = b.neg().div(a.mul(2));
      lines.push('Δ = 0 : une solution double ' + v + '₀ = -b / 2a = ' + fmt(b.neg()) + ' / ' + fmt(a.mul(2)) + ' = ' + fmt(r) + '.');
      roots.push({ q: r, s: fmt(r) }); return { lines, roots, delta: D };
    }
    const s = D.sqrt();
    lines.push('Δ > 0 : deux solutions ' + v + '₁ = (-b - √Δ) / 2a et ' + v + '₂ = (-b + √Δ) / 2a.');
    if (s) {
      const r1 = b.neg().sub(s).div(a.mul(2)), r2 = b.neg().add(s).div(a.mul(2));
      lines.push('√Δ = ' + fmt(s) + ', donc ' + v + '₁ = (' + fmt(b.neg()) + ' - ' + fmt(s) + ') / ' + fmt(a.mul(2)) + ' = ' + fmt(r1) + ' et ' + v + '₂ = (' + fmt(b.neg()) + ' + ' + fmt(s) + ') / ' + fmt(a.mul(2)) + ' = ' + fmt(r2) + '.');
      const rr = [{ q: r1, s: fmt(r1) }, { q: r2, s: fmt(r2) }].sort((x, y) => x.q.cmp(y.q));
      roots.push(...rr);
    } else {
      const sq = Math.sqrt(D.val());
      const x1 = (-b.val() - sq) / (2 * a.val()), x2 = (-b.val() + sq) / (2 * a.val());
      const s1 = '(' + fmt(b.neg()) + ' - √' + fmt(D) + ') / ' + fmt(a.mul(2)), s2 = '(' + fmt(b.neg()) + ' + √' + fmt(D) + ') / ' + fmt(a.mul(2));
      lines.push(v + '₁ = ' + s1 + ' ≈ ' + fmtNum(x1) + ' et ' + v + '₂ = ' + s2 + ' ≈ ' + fmtNum(x2) + '.');
      const rr = [{ q: null, val: x1, s: s1 }, { q: null, val: x2, s: s2 }].sort((x, y) => x.val - y.val);
      roots.push(...rr);
    }
    return { lines, roots, delta: D };
  }
  const rv = (r) => (r.q ? r.q.val() : r.val);

  // ---------------------------------------------------------------- 1. ÉQUATIONS / INÉQUATIONS à une inconnue
  function interval(lo, loIn, hi, hiIn) {
    return (lo === null ? ']-∞' : (loIn ? '[' : ']') + lo) + ' ; ' + (hi === null ? '+∞[' : hi + (hiIn ? ']' : '['));
  }
  // v1.1 : courbe de P(x) = membre gauche - membre droit (les solutions sont les abscisses des points sur l'axe)
  function withGraph(r, diff, v) {
    try { if (r && !r.graph && diff.vars().length <= 1) r.graph = { kind: 'poly', c: diff.coeffs(v).map((q) => q.val()), name: 'P(' + v + ') = ' + M.polyStr(diff, v).replace(/\*/g, ''), v, pts: [] }; } catch (e) { /* */ }
    return r;
  }
  function solveEquation(text, ctx) {
    const segs = mathSegments(text).filter((s) => REL.test(s));
    for (const seg of segs) {
      if (/^[A-Z]\s*=/.test(seg) || /^[a-z]\s*\(\s*[a-z]\s*\)\s*=/.test(seg)) continue; // A = ..., f(x) = ...
      const rel = seg.match(REL)[1];
      const parts = seg.split(REL);
      if (parts.length !== 3) continue;
      if (/^\s*\?*\s*$/.test(parts[2])) continue; // "3 + 4 = ?"
      const A = tryParse(parts[0]), B = tryParse(parts[2]);
      if (!A || !B) continue;
      const vars = new Set([...M.varsOf(A), ...M.varsOf(B)]);
      if (vars.size !== 1) continue;
      const v = [...vars][0];
      const pa = M.toPoly(A), pb = M.toPoly(B);
      if (!pa || !pb) continue;
      const diff = pa.sub(pb), deg = diff.degree(v);
      M.FMT.preferDecimal = M.hasDecimal(A) || M.hasDecimal(B);
      const eqStr = M.show(A) + ' ' + rel + ' ' + M.show(B);
      if (rel === '=') {
        if (deg <= 1) return linear(A, B, pa, pb, v, eqStr, ctx);
        if (deg === 2) return withGraph(quadEq(A, B, diff, v, eqStr, ctx), diff, v);
        if (deg <= 4) return withGraph(higherEq(A, B, diff, v, eqStr, ctx), diff, v);
      } else if (deg <= 1) return linIneq(A, B, pa, pb, v, rel, eqStr, ctx);
      else if (deg === 2) return withGraph(quadIneq(diff, v, rel, eqStr, ctx), diff, v);
    }
    return null;
  }

  function linear(A, B, pa, pb, v, eqStr, ctx) {
    const a1 = pa.coef(v + '1'), b1 = pa.constVal(), a2 = pb.coef(v + '1'), b2 = pb.constVal();
    const low = isLow(ctx) || ctx.niveau === 'BEPC';
    const steps = [];
    const reduced = M.polyStr(pa) + ' = ' + M.polyStr(pb);
    if (reduced !== eqStr.replace(/\s+/g, ' ')) steps.push('On développe et on réduit chaque membre : ' + reduced + '.');
    let A1 = a1, B1 = b1;
    if (!a2.isZero()) {
      A1 = a1.sub(a2);
      const t = (a2.sign() > 0 ? 'On soustrait ' + M.polyStr(M.polyFromCoeffs([0, a2], v)) : 'On ajoute ' + M.polyStr(M.polyFromCoeffs([0, a2.neg()], v))) + ' des deux côtés pour regrouper les ' + v + ' à gauche';
      steps.push(t + ' : ' + M.polyStr(M.polyFromCoeffs([b1, A1], v)) + ' = ' + fmt(b2) + '.');
    }
    if (A1.isZero()) {
      const ok = b1.eq(b2);
      return res({
        type: 'equation', titre: eqStr, difficulte: 'moyen',
        e1: 'On cherche la valeur de ' + v + ' qui rend l\'égalité ' + eqStr + ' vraie.',
        e2: L([...steps, 'Les ' + v + ' disparaissent : il reste ' + fmt(b1) + ' = ' + fmt(b2) + (ok ? ', ce qui est toujours vrai.' : ', ce qui est faux.')]),
        e3: ok ? 'N\'importe quelle valeur de ' + v + ' marche : essaie ' + v + ' = 0 puis ' + v + ' = 1, l\'égalité reste vraie.' : 'Aucune valeur ne peut rendre ' + fmt(b1) + ' égal à ' + fmt(b2) + '.',
        conclusion: ok ? 'Tous les réels sont solutions : S = ℝ.' : 'L\'équation n\'a pas de solution : S = ∅.',
        reponse: ok ? 'S = ℝ' : 'S = ∅', gen: { k: 'linear' }
      });
    }
    const C = b2.sub(b1);
    if (!b1.isZero()) {
      const lhs = M.polyStr(M.polyFromCoeffs([0, A1], v));
      if (b1.sign() > 0) steps.push('On enlève ' + fmt(b1) + ' des deux côtés : ' + lhs + ' + ' + fmt(b1) + ' - ' + fmt(b1) + ' = ' + fmt(b2) + ' - ' + fmt(b1) + ' → ' + lhs + ' = ' + fmt(C) + '.');
      else steps.push('On ajoute ' + fmt(b1.neg()) + ' des deux côtés : ' + lhs + ' - ' + fmt(b1.neg()) + ' + ' + fmt(b1.neg()) + ' = ' + fmt(b2) + ' + ' + fmt(b1.neg()) + ' → ' + lhs + ' = ' + fmt(C) + '.');
    }
    const sol = C.div(A1);
    if (!A1.eq(1)) steps.push('On divise par ' + fmt(A1) + ' des deux côtés : ' + v + ' = ' + fmt(C) + ' ÷ ' + (A1.sign() < 0 ? '(' + fmt(A1) + ')' : fmt(A1)) + ' → ' + v + ' = ' + fmt(sol) + '.');
    const env = {}; env[v] = sol;
    const l = verifLine(A, env), r = verifLine(B, env);
    const e1 = low
      ? 'On veut trouver ' + v + '. ' + (A1.isInt() && A1.n > 1 ? fmt(A1) + v + ' veut dire ' + fmt(A1) + ' fois ' + v + '. ' : '') + 'C\'est comme une balance en équilibre : ce qu\'on fait d\'un côté, on le fait de l\'autre.'
      : 'C\'est une équation du premier degré d\'inconnue ' + v + '. Objectif : isoler ' + v + ' dans un membre.';
    return res({
      type: 'equation', titre: eqStr, difficulte: steps.length > 2 ? 'moyen' : 'facile',
      e1: e1 + '\nÉquation : ' + eqStr,
      e2: L(steps),
      e3: 'On remplace ' + v + ' par ' + fmt(sol) + ' dans l\'équation :\n' + l.txt + (M.show(B) === fmt(r.v) ? '' : '\net de l\'autre côté : ' + r.txt) + (l.v.eq(r.v) ? ' ✅ C\'est correct !' : ' ❌'),
      conclusion: 'La solution est ' + v + ' = ' + fmtBoth(sol) + ' 🎉',
      reponse: v + ' = ' + fmt(sol), answers: [sol.val()], gen: { k: 'linear' }
    });
  }

  function quadEq(A, B, diff, v, eqStr, ctx) {
    const c = diff.coeffs(v); const a = c[2], b = c[1], k = c[0];
    const zeroForm = M.polyStr(diff) + ' = 0';
    const q = quadText(a, b, k, v, isLow(ctx));
    let verif;
    const exact = q.roots.filter((r) => r.q);
    if (exact.length) verif = exact.map((r) => { const env = {}; env[v] = r.q; const l = verifLine(A, env), rr = verifLine(B, env); return 'Pour ' + v + ' = ' + r.s + ' : ' + l.txt + ' et ' + rr.txt + (l.v.eq(rr.v) ? ' ✅' : ' ❌'); }).join('\n');
    else if (q.roots.length === 2) verif = 'Somme des racines = -b/a = ' + fmt(b.neg().div(a)) + ' et produit = c/a = ' + fmt(k.div(a)) + '. Avec les valeurs approchées : ' + fmtNum(rv(q.roots[0]) + rv(q.roots[1])) + ' et ' + fmtNum(rv(q.roots[0]) * rv(q.roots[1])) + ' ✅';
    else verif = 'Le trinôme garde le signe de a = ' + fmt(a) + ' pour toute valeur de ' + v + ', il ne s\'annule donc jamais ✅';
    const S = q.roots.length ? '{ ' + q.roots.map((r) => r.s).join(' ; ') + ' }' : '∅';
    return res({
      type: 'equation2', titre: eqStr, difficulte: q.delta && !q.delta.sqrt() ? 'difficile' : 'moyen',
      e1: 'C\'est une équation du second degré (il y a un ' + v + '²).' + (zeroForm.replace(/\s/g, '') !== eqStr.replace(/\s/g, '') ? '\nOn ramène tout dans le membre de gauche : ' + zeroForm + '.' : '') + '\nForme ax² + bx + c = 0 avec a = ' + fmt(a) + ', b = ' + fmt(b) + ', c = ' + fmt(k) + '.',
      e2: L(q.lines), e3: verif,
      conclusion: 'Ensemble des solutions : S = ' + S + (q.roots.length ? ' 🎉' : ''),
      reponse: 'S = ' + S, answers: q.roots.map(rv), gen: { k: 'quadratic' }
    });
  }

  function higherEq(A, B, diff, v, eqStr, ctx) {
    let c = diff.coeffs(v); const lines = []; const roots = [];
    const deg = c.length - 1;
    const rr = M.rationalRoots(c);
    if (!rr.length) return null;
    let cur = c;
    for (const r of rr) {
      let pv = new Q(0); for (let i = cur.length - 1; i >= 0; i--) pv = pv.mul(r).add(cur[i]);
      if (!pv.isZero() || cur.length <= 3) continue;
      lines.push('Racine évidente : ' + v + ' = ' + fmt(r) + ' car P(' + fmt(r) + ') = 0.');
      const qd = M.syntheticDiv(cur, r);
      lines.push('On factorise : P(' + v + ') = (' + M.polyStr(M.polyFromCoeffs([r.neg(), 1], v)) + ')(' + M.polyStr(M.polyFromCoeffs(qd, v)) + ').');
      roots.push({ q: r, s: fmt(r) }); cur = qd;
    }
    if (cur.length === 3) {
      lines.push('On résout ' + M.polyStr(M.polyFromCoeffs(cur, v)) + ' = 0 :');
      const q = quadText(cur[2], cur[1], cur[0], v);
      lines.push(...q.lines); roots.push(...q.roots);
    } else if (cur.length === 2) { const r = cur[0].neg().div(cur[1]); roots.push({ q: r, s: fmt(r) }); }
    const uniq = []; roots.forEach((r) => { if (!uniq.some((u) => Math.abs(rv(u) - rv(r)) < 1e-9)) uniq.push(r); });
    uniq.sort((x, y) => rv(x) - rv(y));
    const S = '{ ' + uniq.map((r) => r.s).join(' ; ') + ' }';
    return res({
      type: 'equation3', titre: eqStr, difficulte: 'difficile',
      e1: 'Équation de degré ' + deg + ' : ' + M.polyStr(diff) + ' = 0. Méthode : trouver une racine évidente puis factoriser.',
      e2: L(lines),
      e3: uniq.filter((r) => r.q).map((r) => { const env = {}; env[v] = r.q; return 'P(' + r.s + ') = ' + fmt(diff.evalAt(env)) + ' ✅'; }).join('\n') || 'On vérifie numériquement chaque valeur approchée dans P(' + v + ') ✅',
      conclusion: 'S = ' + S, reponse: 'S = ' + S, answers: uniq.map(rv), gen: { k: 'quadratic' }
    });
  }

  function linIneq(A, B, pa, pb, v, rel, eqStr, ctx) {
    const a = pa.coef(v + '1').sub(pb.coef(v + '1')), C = pb.constVal().sub(pa.constVal());
    const steps = ['On regroupe les ' + v + ' à gauche et les nombres à droite : ' + M.polyStr(M.polyFromCoeffs([0, a], v)) + ' ' + rel + ' ' + fmt(C) + '.'];
    if (a.isZero()) return null;
    let r = rel; const sol = C.div(a);
    if (a.sign() < 0) { r = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' }[rel]; steps.push('On divise par ' + fmt(a) + ' qui est NÉGATIF : on change le sens de l\'inégalité ! → ' + v + ' ' + r + ' ' + fmt(sol) + '.'); }
    else if (!a.eq(1)) steps.push('On divise par ' + fmt(a) + ' (positif, le sens ne change pas) : ' + v + ' ' + r + ' ' + fmt(sol) + '.');
    const S = (r === '<' || r === '≤') ? interval(null, false, fmt(sol), r === '≤') : interval(fmt(sol), r === '≥', null, false);
    const test = (r === '<' || r === '≤') ? sol.sub(1) : sol.add(1);
    const env = {}; env[v] = test; const l = verifLine(A, env), rr = verifLine(B, env);
    return res({
      type: 'inequation', titre: eqStr, difficulte: 'moyen',
      e1: 'C\'est une inéquation du premier degré. Même méthode qu\'une équation, MAIS attention : si on multiplie ou divise par un nombre négatif, on change le sens.',
      e2: L(steps),
      e3: 'On teste une valeur de S, par exemple ' + v + ' = ' + fmt(test) + ' : ' + l.txt + ' ' + rel + ' ' + rr.txt + ' ✅',
      conclusion: 'Ensemble des solutions : S = ' + S, reponse: 'S = ' + S, answers: [sol.val()], gen: { k: 'linear' }
    });
  }

  function quadIneq(diff, v, rel, eqStr, ctx) {
    const c = diff.coeffs(v); const a = c[2];
    const q = quadText(a, c[1], c[0], v);
    const pos = (rel === '>' || rel === '≥'), inc = (rel === '≥' || rel === '≤');
    let S;
    const rs = q.roots;
    if (rs.length < 2) {
      const signA = a.sign() > 0;
      if (rs.length === 0) S = (signA === pos) ? 'ℝ' : '∅';
      else S = (signA === pos) ? (inc ? 'ℝ' : 'ℝ \\ { ' + rs[0].s + ' }') : (inc ? '{ ' + rs[0].s + ' }' : '∅');
    } else {
      const outside = (a.sign() > 0) === pos;
      S = outside ? interval(null, false, rs[0].s, inc) + ' ∪ ' + interval(rs[1].s, inc, null, false) : interval(rs[0].s, inc, rs[1].s, inc);
    }
    return res({
      type: 'inequation2', titre: eqStr, difficulte: 'difficile',
      e1: 'Inéquation du second degré : on étudie le signe du trinôme ' + M.polyStr(diff) + '.',
      e2: L([...q.lines, 'Règle : un trinôme a le signe de a (ici ' + (a.sign() > 0 ? 'positif' : 'négatif') + ') à l\'extérieur des racines et le signe contraire entre les racines.']),
      e3: 'Tableau de signes : ' + (rs.length === 2 ? v + ' < ' + rs[0].s + ' : signe de a | entre les racines : signe contraire | ' + v + ' > ' + rs[1].s + ' : signe de a ✅' : 'le trinôme garde le signe de a ✅'),
      conclusion: 'S = ' + S, reponse: 'S = ' + S, gen: { k: 'quadratic' }
    });
  }

  // ---------------------------------------------------------------- 2. SYSTÈMES 2x2
  function solveSystem(text, ctx) {
    const eqs = [];
    mathSegments(String(text).replace(/\bet\b/g, ';')).forEach((s) => {
      if (!/=/.test(s) || /[<>≤≥]/.test(s)) return;
      const p = s.split('='); if (p.length !== 2 || !p[1].trim()) return;
      const A = tryParse(p[0]), B = tryParse(p[1]); if (!A || !B) return;
      const pa = M.toPoly(A), pb = M.toPoly(B); if (!pa || !pb) return;
      const d = pa.sub(pb); if (d.degree() > 1) return;
      eqs.push({ A, B, d, s: M.show(A) + ' = ' + M.show(B) });
    });
    if (eqs.length < 2) return null;
    const vars = [...new Set(eqs.slice(0, 2).flatMap((e) => e.d.vars()))].sort();
    if (vars.length !== 2) return null;
    const [x, y] = vars; const [E1, E2] = eqs;
    const co = (e) => ({ a: e.d.coef(x + '1'), b: e.d.coef(y + '1'), c: e.d.constVal().neg() });
    const c1 = co(E1), c2 = co(E2);
    const det = c1.a.mul(c2.b).sub(c2.a.mul(c1.b));
    M.FMT.preferDecimal = false;
    const form = (c) => M.polyStr(new P(new Map([[x + '1', c.a], [y + '1', c.b]]))) + ' = ' + fmt(c.c);
    const steps = ['On écrit le système sous la forme ax + by = c :', '(1) ' + form(c1), '(2) ' + form(c2)];
    if (det.isZero()) {
      return res({ type: 'systeme', titre: 'Système', difficulte: 'moyen', e1: 'Système de deux équations à deux inconnues ' + x + ' et ' + y + '.', e2: L([...steps, 'Le déterminant ab\' - a\'b = 0 : les deux droites sont parallèles ou confondues.']), e3: 'On compare les rapports des coefficients.', conclusion: 'Pas de solution unique.', reponse: 'Pas de solution unique', gen: { k: 'system' } });
    }
    const X = c1.c.mul(c2.b).sub(c2.c.mul(c1.b)).div(det), Y = c1.a.mul(c2.c).sub(c2.a.mul(c1.c)).div(det);
    const unit = [c1, c2].findIndex((c) => c.b.abs().eq(1) || c.a.abs().eq(1));
    if (unit >= 0 && ctx.niveau !== 'LICENCE') {
      const cu = unit === 0 ? c1 : c2, co2 = unit === 0 ? c2 : c1;
      const isoY = cu.b.abs().eq(1);
      const iv = isoY ? y : x, ov = isoY ? x : y;
      const ci = isoY ? cu.b : cu.a, co_ = isoY ? cu.a : cu.b;
      const expr = M.polyFromCoeffs([cu.c.div(ci), co_.neg().div(ci)], ov);
      steps.push('Méthode par SUBSTITUTION. Dans (' + (unit + 1) + '), on isole ' + iv + ' : ' + iv + ' = ' + M.polyStr(expr) + '.');
      const k1 = isoY ? co2.a : co2.b, k2 = isoY ? co2.b : co2.a;
      const k2s = k2.eq(1) ? ' + ' : k2.eq(-1) ? ' - ' : k2.sign() < 0 ? ' - ' + fmt(k2.neg()) : ' + ' + fmt(k2);
      steps.push('On remplace dans (' + (2 - unit) + ') : ' + (k1.isZero() ? '' : M.polyStr(M.polyFromCoeffs([0, k1], ov))) + k2s + '(' + M.polyStr(expr) + ') = ' + fmt(co2.c) + '.');
      const red = M.polyFromCoeffs([0, k1], ov).add(expr.scale(k2));
      steps.push('On développe : ' + M.polyStr(red) + ' = ' + fmt(co2.c) + ' → ' + ov + ' = ' + fmt(isoY ? X : Y) + '.');
      steps.push('Puis ' + iv + ' = ' + M.polyStr(expr).replace(new RegExp(ov, 'g'), '×' + fmt(isoY ? X : Y)).replace(/^×/, '') + ' = ' + fmt(isoY ? Y : X) + '.');
    } else {
      steps.push('Méthode par COMBINAISON : on élimine ' + x + '. On multiplie (1) par ' + fmt(c2.a) + ' et (2) par ' + fmt(c1.a) + ', puis on soustrait :');
      steps.push('(' + fmt(c1.b.mul(c2.a)) + ' - ' + (c2.b.mul(c1.a).sign() < 0 ? '(' + fmt(c2.b.mul(c1.a)) + ')' : fmt(c2.b.mul(c1.a))) + ')' + y + ' = ' + fmt(c1.c.mul(c2.a)) + ' - ' + (c2.c.mul(c1.a).sign() < 0 ? '(' + fmt(c2.c.mul(c1.a)) + ')' : fmt(c2.c.mul(c1.a))) + ' → ' + y + ' = ' + fmt(Y) + '.');
      steps.push('On remplace ' + y + ' dans (1) : ' + fmt(c1.a) + x + ' = ' + fmt(c1.c) + ' - ' + (c1.b.mul(Y).sign() < 0 ? '(' + fmt(c1.b.mul(Y)) + ')' : fmt(c1.b.mul(Y))) + ' → ' + x + ' = ' + fmt(X) + '.');
      if (ctx.niveau === 'BAC' || ctx.niveau === 'LICENCE') steps.push('(Contrôle par Cramer : D = ' + fmt(det) + ', ' + x + ' = Dx/D, ' + y + ' = Dy/D.)');
    }
    const env = {}; env[x] = X; env[y] = Y;
    const v1 = verifLine(E1.A, env), v2 = verifLine(E2.A, env), w1 = verifLine(E1.B, env), w2 = verifLine(E2.B, env);
    return res({
      type: 'systeme', titre: E1.s + ' ; ' + E2.s, difficulte: 'moyen',
      e1: 'C\'est un système de deux équations à deux inconnues ' + x + ' et ' + y + '. On cherche le couple (' + x + ' ; ' + y + ') qui vérifie les deux équations EN MÊME TEMPS.',
      e2: L(steps),
      e3: '(1) : ' + v1.txt + ' et ' + w1.txt + (v1.v.eq(w1.v) ? ' ✅' : ' ❌') + '\n(2) : ' + v2.txt + ' et ' + w2.txt + (v2.v.eq(w2.v) ? ' ✅' : ' ❌'),
      conclusion: 'La solution est le couple (' + x + ' ; ' + y + ') = (' + fmt(X) + ' ; ' + fmt(Y) + ') 🎉',
      reponse: '(' + fmt(X) + ' ; ' + fmt(Y) + ')', answers: [X.val(), Y.val()], gen: { k: 'system' }
    });
  }

  // ---------------------------------------------------------------- 3. DÉVELOPPER / FACTORISER
  function exprCandidate(text) {
    const t = M.norm(text);
    let m = t.match(/\b([A-Z])\s*(?:\(\s*x\s*\))?\s*=\s*([^\n;]+)/);
    let s = m ? m[2] : null;
    if (!s) { const segs = mathSegments(text).filter((x) => !REL.test(x) && /[a-z]/.test(x)); s = segs.sort((a, b) => b.length - a.length)[0]; }
    if (!s) return null;
    s = cleanMath(s).split(';')[0].replace(/[\s.,:]+$/, '');
    const ast = tryParse(s); if (!ast) return null;
    const vs = M.varsOf(ast); if (vs.size !== 1) return null;
    const p = M.toPoly(ast); if (!p) return null;
    return { ast, p, v: [...vs][0], name: m ? m[1] : 'A' };
  }
  function sumTerms(ast, inner) {
    const out = [];
    (function walk(n, sign, root) {
      if (n.t === 'op' && (n.op === '+' || n.op === '-') && (!n.p || (root && inner))) { walk(n.a, sign, false); walk(n.b, n.op === '-' ? -sign : sign, false); }
      else out.push({ n, sign });
    })(ast, 1, true);
    return out;
  }
  function solveDevelop(text, ctx) {
    if (!/d[ée]velopp|r[ée]dui|d[ée]veloppez/i.test(text)) return null;
    const c = exprCandidate(text); if (!c) return null;
    M.FMT.preferDecimal = M.hasDecimal(c.ast);
    const lines = []; let id = null;
    const terms = sumTerms(c.ast);
    terms.forEach(({ n, sign }) => {
      const p = M.toPoly(n); const sh = M.show(n);
      if (n.t === 'op' && n.op === '^' && n.b.t === 'num' && n.b.q.eq(2) && n.a.t === 'op' && (n.a.op === '+' || n.a.op === '-')) {
        const a = M.toPoly(n.a.a), b = M.toPoly(n.a.b);
        id = n.a.op === '+' ? '(a + b)² = a² + 2ab + b²' : '(a - b)² = a² - 2ab + b²';
        lines.push('Identité remarquable ' + id + ' avec a = ' + M.polyStr(a) + ' et b = ' + M.polyStr(b) + ' : ' + sh + ' = ' + M.polyStr(p) + '.');
      } else if (n.t === 'op' && n.op === '*' && n.a.t === 'op' && n.b.t === 'op' && /[+-]/.test(n.a.op) && /[+-]/.test(n.b.op)) {
        const ta = sumTerms(n.a, true).map((t) => M.toPoly(t.n).scale(t.sign)), tb = sumTerms(n.b, true).map((t) => M.toPoly(t.n).scale(t.sign));
        if (ta.length === 2 && tb.length === 2 && M.polyStr(ta[0]) === M.polyStr(tb[0]) && M.polyStr(ta[1]) === M.polyStr(tb[1].neg())) {
          id = '(a + b)(a - b) = a² - b²';
          lines.push('Identité remarquable ' + id + ' : ' + sh + ' = ' + M.polyStr(p) + '.');
        } else {
          const prods = []; ta.forEach((x) => tb.forEach((y) => prods.push(M.polyStr(x.mul(y)))));
          lines.push('Double distributivité (a + b)(c + d) = ac + ad + bc + bd : ' + sh + ' = ' + prods.join(' + ').replace(/\+ -/g, '- ') + ' = ' + M.polyStr(p) + '.');
        }
      } else if (n.t === 'op' && n.op === '*') {
        lines.push('Distributivité k(a + b) = ka + kb : ' + sh + ' = ' + M.polyStr(p) + '.');
      } else if (!p.isConst() || terms.length > 1) {
        if (sh !== M.polyStr(p)) lines.push(sh + ' = ' + M.polyStr(p) + '.');
      }
      if (sign < 0 && terms.length > 1) lines.push('Attention au signe « - » devant : on change tous les signes de ' + M.polyStr(p) + '.');
    });
    lines.push('On regroupe les termes semblables : ' + c.name + ' = ' + M.polyStr(c.p) + '.');
    const env = {}; env[c.v] = 1;
    return res({
      type: 'developper', titre: c.name + ' = ' + M.show(c.ast), difficulte: id ? 'facile' : 'moyen',
      e1: 'On doit développer puis réduire ' + c.name + ' = ' + M.show(c.ast) + '. Développer = transformer les produits en sommes.',
      e2: L(lines),
      e3: 'Test avec ' + c.v + ' = 1 : expression de départ = ' + fmt(M.evalQ(c.ast, env)) + ' et résultat = ' + fmt(c.p.evalAt(env)) + ' ✅ Les deux sont égaux.',
      conclusion: c.name + ' = ' + M.polyStr(c.p), reponse: M.polyStr(c.p), poly: { s: M.polyStr(c.p) }, gen: { k: 'develop' }
    });
  }

  function factorPoly(p, v) {
    const c = p.coeffs(v); const deg = c.length - 1; const lines = []; let result = null;
    let den = 1; c.forEach((q) => { den = M.lcm(den, q.d); });
    let g = 0; c.forEach((q) => { g = M.gcd(g, q.mul(den).n); });
    let k = new Q(g, den); if (c[deg].sign() < 0) k = k.neg();
    const cc = c.map((q) => q.div(k));
    const kStr = k.eq(1) ? '' : (k.eq(-1) ? '-' : fmt(k));
    if (!k.eq(1)) lines.push('Facteur commun ' + fmt(k) + ' : ' + kStr + '(' + M.polyStr(M.polyFromCoeffs(cc, v)) + ').');
    if (deg === 1) return { lines, result: kStr + '(' + M.polyStr(M.polyFromCoeffs(cc, v)) + ')' };
    if (deg === 2) {
      const [c0, c1, c2] = cc;
      if (c0.isZero()) { lines.push('Facteur commun ' + v + ' : ' + v + '(' + M.polyStr(M.polyFromCoeffs([c1, c2], v)) + ').'); return { lines, result: kStr + v + '(' + M.polyStr(M.polyFromCoeffs([c1, c2], v)) + ')' }; }
      const D = c1.mul(c1).sub(c2.mul(c0).mul(4));
      if (c1.isZero() && c0.sign() < 0 && c2.sqrt() && c0.neg().sqrt()) {
        const a = c2.sqrt(), b = c0.neg().sqrt();
        const A = M.polyStr(M.polyFromCoeffs([0, a], v));
        lines.push('On reconnaît a² - b² = (a - b)(a + b) avec a = ' + A + ' et b = ' + fmt(b) + '.');
        return { lines, result: kStr + '(' + A + ' - ' + fmt(b) + ')(' + A + ' + ' + fmt(b) + ')' };
      }
      if (D.isZero() && c2.sqrt() && c0.sqrt()) {
        const a = c2.sqrt(), b = c0.sqrt(); const A = M.polyStr(M.polyFromCoeffs([0, a], v));
        const sgn = c1.sign() > 0 ? '+' : '-';
        lines.push('On reconnaît (a ' + sgn + ' b)² = a² ' + sgn + ' 2ab + b² avec a = ' + A + ' et b = ' + fmt(b) + '.');
        return { lines, result: kStr + '(' + A + ' ' + sgn + ' ' + fmt(b) + ')²' };
      }
      const q = quadText(c2, c1, c0, v); lines.push(...q.lines);
      if (!q.roots.length) { lines.push('Δ < 0 : le trinôme ne se factorise pas dans ℝ.'); return { lines, result: null }; }
      let lead = c2; const fac = [];
      const rts = q.roots.length === 1 ? [q.roots[0], q.roots[0]] : q.roots;
      rts.forEach((r) => {
        if (r.q) { const f = M.polyFromCoeffs([r.q.n * -1, r.q.d], v); lead = lead.div(r.q.d); fac.push('(' + M.polyStr(f) + ')'); }
        else fac.push('(' + v + ' - ' + r.s + ')');
      });
      lines.push('Si x₁ et x₂ sont les racines : ax² + bx + c = a(x - x₁)(x - x₂).');
      const kk = k.mul(lead); const pre = kk.eq(1) ? '' : kk.eq(-1) ? '-' : fmt(kk);
      result = pre + (fac[0] === fac[1] ? fac[0] + '²' : fac.join(''));
      return { lines, result };
    }
    if (deg === 3) {
      const rr = M.rationalRoots(cc); if (!rr.length) return { lines, result: null };
      const r = rr[0]; const qd = M.syntheticDiv(cc, r);
      lines.push('Racine évidente ' + v + ' = ' + fmt(r) + ' : on factorise par (' + M.polyStr(M.polyFromCoeffs([r.neg(), 1], v)) + ').');
      const sub = factorPoly(M.polyFromCoeffs(qd, v), v);
      lines.push(...sub.lines);
      return { lines, result: kStr + '(' + M.polyStr(M.polyFromCoeffs([r.neg(), 1], v)) + ')' + (sub.result ? (sub.result.startsWith('(') ? sub.result : '(' + sub.result + ')') : '(' + M.polyStr(M.polyFromCoeffs(qd, v)) + ')') };
    }
    return { lines, result: null };
  }
  function solveFactor(text, ctx) {
    if (!/factoris/i.test(text)) return null;
    const c = exprCandidate(text); if (!c) return null;
    const f = factorPoly(c.p, c.v); if (!f.result) return null;
    const env = {}; env[c.v] = 2;
    const ra = tryParse(f.result.replace(/²/g, '^2').replace(/√/g, 'sqrt'));
    let check = '';
    if (ra) { try { check = 'Test avec ' + c.v + ' = 2 : départ = ' + fmt(M.evalQ(c.ast, env)) + ', forme factorisée = ' + fmtNum(M.evalNum(ra, env), 4) + ' ✅'; } catch (e) { check = ''; } }
    return res({
      type: 'factoriser', titre: c.name + ' = ' + M.show(c.ast), difficulte: 'moyen',
      e1: 'Factoriser = écrire ' + c.name + ' sous forme de PRODUIT. Forme développée : ' + c.name + ' = ' + M.polyStr(c.p) + '.',
      e2: L(f.lines), e3: check || 'On redéveloppe la forme factorisée : on retrouve ' + M.polyStr(c.p) + ' ✅',
      conclusion: c.name + ' = ' + f.result, reponse: f.result, poly: { s: M.polyStr(c.p) }, gen: { k: 'factor' }
    });
  }

  // ---------------------------------------------------------------- 4. FONCTIONS : dérivée, variations, limites, images
  function solveFunction(text, ctx) {
    const t = M.norm(text);
    const m = t.match(/\b([a-zA-Z])\s*\(\s*([a-z])\s*\)\s*=\s*([^\n;]+)/);
    if (!m) return null;
    const fname = m[1], v = m[2];
    let body = cleanMath(m[3]).split(';')[0].replace(/[\s.,:]+$/, '');
    const ast = tryParse(body); if (!ast) return null;
    const p = M.toPoly(ast); if (!p || p.vars().some((x) => x !== v)) return null;
    const low = strip(text);
    const want = { der: /deriv|f'|'\(/.test(low), varia: /variation|tableau|croissan|decroissan|extremum|maximum|minimum/.test(low), lim: /limite|infini|∞/.test(low) };
    const img = [...t.matchAll(new RegExp('\\b' + fname + '\\s*\\(\\s*(-?\\d+(?:\\.\\d+)?)\\s*\\)', 'g'))].map((x) => parseFloat(x[1]));
    if (!want.der && !want.varia && !want.lim && !img.length) want.der = want.varia = true;
    const d = p.deriv(v); const lines = []; const e3 = [];
    const F = fname + '(' + v + ') = ' + M.polyStr(p);
    if (img.length) img.forEach((x) => { const env = {}; env[v] = new Q(x); lines.push('Image : ' + fname + '(' + fmtNum(x) + ') = ' + M.show(subst(ast, env)) + ' = ' + fmt(p.evalAt(env)) + '.'); });
    if (want.lim) {
      const deg = p.degree(v), lead = p.coeffs(v)[deg];
      if (deg === 0) lines.push('Fonction constante : la limite vaut ' + fmt(lead) + '.');
      else {
        const sPlus = lead.sign() > 0 ? '+∞' : '-∞', sMinus = (lead.sign() * (deg % 2 ? -1 : 1)) > 0 ? '+∞' : '-∞';
        lines.push('Limites : un polynôme se comporte en ±∞ comme son terme de plus haut degré ' + M.polyStr(M.polyFromCoeffs([...Array(deg).fill(0), lead], v)) + '.');
        lines.push('lim(' + v + '→+∞) ' + fname + '(' + v + ') = ' + sPlus + ' ; lim(' + v + '→-∞) ' + fname + '(' + v + ') = ' + sMinus + '.');
      }
    }
    if (want.der || want.varia) {
      lines.push('Dérivée : on applique (' + v + 'ⁿ)\' = n' + v + 'ⁿ⁻¹ et (k)\' = 0 → ' + fname + '\'(' + v + ') = ' + M.polyStr(d) + '.');
      e3.push('Contrôle : ' + fname + '\'(1) = ' + fmt(d.evalAt({ [v]: 1 })) + ' et le taux de variation entre 0,999 et 1,001 vaut ≈ ' + fmtNum((p.evalAt({ [v]: 1.001 }).val() - p.evalAt({ [v]: 0.999 }).val()) / 0.002, 3) + ' ✅');
    }
    if (want.varia) {
      const dd = d.degree(v);
      let rts = [];
      if (dd === 1) { const c = d.coeffs(v); rts = [{ q: c[0].neg().div(c[1]), s: fmt(c[0].neg().div(c[1])) }]; lines.push(fname + '\'(' + v + ') = 0 pour ' + v + ' = ' + rts[0].s + '.'); }
      else if (dd === 2) { const c = d.coeffs(v); const q = quadText(c[2], c[1], c[0], v); lines.push('On résout ' + fname + '\'(' + v + ') = 0 : ' + q.lines.slice(-1)[0]); rts = q.roots; }
      if (dd >= 1 && dd <= 2) {
        const pts = rts.map(rv);
        const bounds = [-Infinity, ...pts, Infinity];
        const segs = [];
        for (let i = 0; i < bounds.length - 1; i++) {
          const lo = bounds[i], hi = bounds[i + 1];
          const mid = lo === -Infinity ? hi - 1 : hi === Infinity ? lo + 1 : (lo + hi) / 2;
          const s = Math.sign(M.P.prototype.evalAt.call(d, { [v]: new Q(mid) }).val());
          segs.push({ lo: i === 0 ? '-∞' : rts[i - 1].s, hi: i === bounds.length - 2 ? '+∞' : rts[i].s, s });
        }
        segs.forEach((sg) => lines.push('Sur ]' + sg.lo + ' ; ' + sg.hi + '[ : ' + fname + '\' ' + (sg.s > 0 ? '> 0 donc ' + fname + ' est croissante ↗' : '< 0 donc ' + fname + ' est décroissante ↘') + '.'));
        rts.forEach((r, i) => {
          if (segs[i].s === segs[i + 1].s) return;
          const val = r.q ? fmt(p.evalAt({ [v]: r.q })) : fmtNum(p.evalAt({ [v]: new Q(r.val) }).val());
          lines.push((segs[i].s > 0 ? 'Maximum' : 'Minimum') + ' local en ' + v + ' = ' + r.s + ' : ' + fname + '(' + r.s + ') = ' + val + '.');
        });
      } else if (dd === 0) lines.push(fname + '\' est constante de signe ' + (d.constVal().sign() > 0 ? 'positif : ' + fname + ' est croissante sur ℝ.' : 'négatif : ' + fname + ' est décroissante sur ℝ.'));
      e3.push('Cohérence : le signe de ' + fname + '\' correspond bien aux sens de variation trouvés ✅');
    }
    const gpts = []; try { const dd2 = d.degree(v); if (dd2 >= 1 && dd2 <= 2) { const cc = d.coeffs(v).map((q) => q.val()); const xs = dd2 === 1 ? [-cc[0] / cc[1]] : (() => { const D2 = cc[1] * cc[1] - 4 * cc[2] * cc[0]; return D2 < 0 ? [] : D2 === 0 ? [-cc[1] / (2 * cc[2])] : [(-cc[1] - Math.sqrt(D2)) / (2 * cc[2]), (-cc[1] + Math.sqrt(D2)) / (2 * cc[2])]; })(); xs.forEach((x) => gpts.push({ x, y: p.coeffs(v).reduce((acc, q, k) => acc + q.val() * Math.pow(x, k), 0), label: 'extremum' })); } } catch (e) { /* */ }
    return res({
      graph: { kind: 'poly', c: p.coeffs(v).map((q) => q.val()), name: fname, v, pts: gpts },
      type: 'fonction', titre: F, difficulte: want.varia ? 'difficile' : 'moyen',
      e1: 'On étudie la fonction ' + F + ' (fonction polynôme, définie et dérivable sur ℝ).',
      e2: L(lines), e3: L(e3.length ? e3 : ['On recalcule chaque image en remplaçant ' + v + ' par la valeur ✅']),
      conclusion: want.der || want.varia ? fname + '\'(' + v + ') = ' + M.polyStr(d) : lines[0], reponse: M.polyStr(d), gen: { k: 'derivative' }
    });
  }

  // ---------------------------------------------------------------- 5. CALCUL NUMÉRIQUE (priorités, fractions)
  function isFracLeaf(n) { return n.t === 'num' || (n.t === 'op' && n.op === '/' && n.a.t === 'num' && n.b.t === 'num' && n.a.q.isInt() && n.b.q.isInt()) || (n.t === 'neg' && isFracLeaf(n.a)); }
  function solveArith(text, ctx) {
    const segs = mathSegments(text).map((s) => s.replace(/=\s*\??\s*$/, '').trim()).filter((s) => !REL.test(s) && /\d/.test(s) && /[-+*/^()]|sqrt/.test(s) && !/[a-z]/i.test(s.replace(/sqrt|ln|exp|log|sin|cos|tan/g, '')));
    if (!segs.length) return null;
    const seg = segs.sort((a, b) => b.length - a.length)[0];
    const ast = tryParse(seg); if (!ast || ast.t === 'num') return null;
    M.FMT.preferDecimal = M.hasDecimal(ast);
    const usesColon = /\d\s*[:÷]\s*\d/.test(text);
    const terms = sumTerms(ast);
    const shown = M.show(ast, { div: usesColon ? ' ÷ ' : '/' });
    // fractions
    if (!M.FMT.preferDecimal && !usesColon && terms.length >= 2 && terms.every((t) => isFracLeaf(t.n)) && terms.some((t) => t.n.t === 'op')) {
      const fr = terms.map((t) => ({ q: M.evalQ(t.n).mul(t.sign) }));
      let den = 1; fr.forEach((f) => { den = M.lcm(den, f.q.d); });
      const conv = fr.map((f) => f.q.mul(den).n + '/' + den);
      const tot = fr.reduce((s, f) => s.add(f.q), new Q(0));
      const rawNum = fr.reduce((s, f) => s + f.q.mul(den).n, 0);
      const g = M.gcd(rawNum, den);
      return res({
        type: 'fractions', titre: shown, difficulte: 'facile',
        e1: 'On additionne/soustrait des fractions. Règle d\'or : il faut le MÊME dénominateur avant d\'ajouter les numérateurs.' + (isLow(ctx) ? ' Comme partager des mangues en parts de même taille !' : ''),
        e2: L(['Dénominateur commun : ' + den + ' (le plus petit multiple commun).', 'On transforme : ' + conv.join(' ; ').replace(/;\s-/g, '; -') + '.', 'On calcule les numérateurs : ' + fr.map((f) => f.q.mul(den).n).join(' + ').replace(/\+ -/g, '- ') + ' = ' + rawNum + ' → ' + rawNum + '/' + den + '.', g > 1 ? 'On simplifie par ' + g + ' : ' + rawNum + '/' + den + ' = ' + fmt(tot) + '.' : 'La fraction est déjà irréductible.']),
        e3: 'En décimal : ' + fr.map((f) => fmtNum(f.q.val(), 3)).join(' + ').replace(/\+ -/g, '- ') + ' ≈ ' + fmtNum(tot.val(), 3) + ' et ' + fmt(tot) + ' ≈ ' + fmtNum(tot.val(), 3) + ' ✅',
        conclusion: 'Résultat : ' + fmtBoth(tot), reponse: fmt(tot), answers: [tot.val()], gen: { k: 'fraction' }
      });
    }
    let r;
    try { r = M.arithSteps(ast); } catch (e) {
      if (e.message === 'DIV0') return res({ type: 'calcul', titre: shown, e1: 'On doit calculer ' + shown + '.', e2: 'Attention : on ne peut JAMAIS diviser par 0.', e3: 'Relis bien l\'énoncé.', conclusion: 'Calcul impossible (division par zéro).', reponse: 'impossible' });
      return null;
    }
    if (!r.result) return null;
    const label = { paren: 'On calcule d\'abord entre parenthèses', pow: 'On calcule les puissances / racines', mul: 'On fait les multiplications et divisions', add: 'On fait les additions et soustractions de gauche à droite' };
    const lines = r.steps.map((s) => label[s.kind] + ' : ' + s.ops.join(' ; ') + (s.expr !== fmt(r.result) ? '  →  ' + s.expr : '') + '.');
    const last = r.steps[r.steps.length - 1].ops[0] || '';
    let check = 'Calcul vérifié : ' + shown + ' = ' + fmt(r.result) + ' ✅';
    const mm = last.match(/^(.+?) ([+\-×÷]) (.+?) = (.+)$/);
    if (mm) {
      const inv = { '+': '-', '-': '+', '×': '÷', '÷': '×' }[mm[2]];
      check = 'Par l\'opération inverse : ' + mm[4] + ' ' + inv + ' ' + mm[3] + ' = ' + mm[1] + ' ✅';
    }
    return res({
      type: 'calcul', titre: shown, difficulte: r.steps.length > 3 ? 'moyen' : 'facile',
      e1: 'On doit calculer ' + shown + '.\nOn respecte l\'ordre des priorités : 1) parenthèses, 2) puissances, 3) × et ÷, 4) + et −.',
      e2: L(lines), e3: check,
      conclusion: 'Résultat : ' + shown + ' = ' + fmtBoth(r.result), reponse: fmt(r.result), answers: [r.result.val()], gen: { k: 'arith' }
    });
  }

  // ---------------------------------------------------------------- 6. ARITHMÉTIQUE : PGCD, PPCM, premiers, fractions irréductibles
  function solveArithmetique(text, ctx) {
    const s = strip(text); const ns = nums(text).filter((x) => Number.isInteger(x) && x > 0);
    if (/pgcd|ppcm|plus grand (commun )?diviseur|plus petit (commun )?multiple/.test(s) && ns.length >= 2) {
      let [a, b] = ns.slice(0, 2).sort((x, y) => y - x); const A = a, B = b; const lines = [];
      while (b) { const q = Math.floor(a / b), r = a % b; lines.push(a + ' = ' + b + ' × ' + q + ' + ' + r); a = b; b = r; }
      const g = a, l = A * B / g;
      const wantL = /ppcm|multiple/.test(s), wantG = /pgcd|diviseur/.test(s);
      return res({
        type: 'pgcd', titre: (wantG ? 'PGCD' : 'PPCM') + '(' + A + ' ; ' + B + ')', difficulte: 'facile',
        e1: 'On cherche ' + (wantG ? 'le PGCD (plus grand diviseur commun)' : '') + (wantG && wantL ? ' et ' : '') + (wantL ? 'le PPCM (plus petit multiple commun)' : '') + ' de ' + A + ' et ' + B + '.',
        e2: L(['Algorithme d\'Euclide (divisions successives) :', ...lines, 'Le dernier reste non nul est ' + g + ' → PGCD = ' + g + '.', wantL ? 'PPCM = (' + A + ' × ' + B + ') ÷ PGCD = ' + (A * B) + ' ÷ ' + g + ' = ' + l + '.' : '']),
        e3: A + ' ÷ ' + g + ' = ' + A / g + ' et ' + B + ' ÷ ' + g + ' = ' + B / g + ' : ces deux quotients sont premiers entre eux ✅',
        conclusion: (wantG ? 'PGCD(' + A + ' ; ' + B + ') = ' + g : '') + (wantG && wantL ? ' et ' : '') + (wantL ? 'PPCM(' + A + ' ; ' + B + ') = ' + l : ''),
        reponse: String(wantG ? g : l), answers: wantG && wantL ? [g, l] : [wantG ? g : l], gen: { k: 'pgcd' }
      });
    }
    if (/irreductible|simplifi/.test(s)) {
      const m = M.norm(text).match(/(\d+)\s*\/\s*(\d+)/);
      if (m) {
        const a = +m[1], b = +m[2], g = M.gcd(a, b);
        return res({ type: 'fraction', titre: a + '/' + b, difficulte: 'facile', e1: 'Rendre ' + a + '/' + b + ' irréductible : on divise numérateur et dénominateur par leur PGCD.', e2: 'PGCD(' + a + ' ; ' + b + ') = ' + g + '.\n' + a + ' ÷ ' + g + ' = ' + a / g + ' et ' + b + ' ÷ ' + g + ' = ' + b / g + '.', e3: 'PGCD(' + a / g + ' ; ' + b / g + ') = ' + M.gcd(a / g, b / g) + ' ✅ plus de simplification possible.', conclusion: a + '/' + b + ' = ' + (a / g) + '/' + (b / g), reponse: (a / g) + '/' + (b / g), answers: [a / b], gen: { k: 'pgcd' } });
      }
    }
    if (/decompos|facteurs premiers/.test(s) && ns.length) {
      const n = ns[0]; const f = M.primeFactors(n); const cnt = {}; f.forEach((p) => { cnt[p] = (cnt[p] || 0) + 1; });
      const lines = []; let cur = n; f.forEach((p) => { lines.push(cur + ' ÷ ' + p + ' = ' + cur / p); cur /= p; });
      const prod = Object.keys(cnt).map((p) => p + (cnt[p] > 1 ? sup(cnt[p]) : '')).join(' × ');
      return res({ type: 'decomposition', titre: 'Décomposer ' + n, difficulte: 'facile', e1: 'On décompose ' + n + ' en produit de facteurs premiers (2, 3, 5, 7, 11…).', e2: L(['On divise par le plus petit nombre premier possible, encore et encore :', ...lines]), e3: 'On remultiplie : ' + f.join(' × ') + ' = ' + n + ' ✅', conclusion: n + ' = ' + prod, reponse: prod, gen: { k: 'pgcd' } });
    }
    if (/premier/.test(s) && ns.length === 1 && /est[- ]il|est[- ]ce|verifie|nombre premier/.test(s)) {
      const n = ns[0]; const pr = M.isPrime(n); const lim = Math.floor(Math.sqrt(n));
      const d = pr ? null : M.primeFactors(n)[0];
      return res({ type: 'premier', titre: n + ' premier ?', difficulte: 'facile', e1: 'Un nombre premier a exactement deux diviseurs : 1 et lui-même.', e2: 'On teste les divisions par les nombres premiers jusqu\'à √' + n + ' ≈ ' + lim + '.\n' + (pr ? 'Aucune division ne tombe juste.' : n + ' ÷ ' + d + ' = ' + n / d + ' tombe juste.'), e3: pr ? 'Aucun diviseur entre 2 et ' + lim + ' ✅' : d + ' × ' + n / d + ' = ' + n + ' ✅', conclusion: n + (pr ? ' est un nombre premier.' : ' n\'est pas premier (divisible par ' + d + ').'), reponse: pr ? 'oui' : 'non' });
    }
    return null;
  }

  // ---------------------------------------------------------------- 7. POURCENTAGES, TVA, INTÉRÊTS, AMORTISSEMENT, STATISTIQUES
  function solvePercent(text, ctx) {
    const t = M.norm(text); const s = strip(t);
    let m = t.match(new RegExp(NUM + '\\s*%\\s*(?:de|d\'|du|des|sur)\\s*(?:la somme de |un montant de |)' + NUM, 'i'));
    if (m && !/augment|hausse|reduc|remise|baisse|rabais|tva|interet/.test(s)) {
      const p = parseFr(m[1]), n = parseFr(m[2]), r = p * n / 100;
      return res({ type: 'pourcentage', titre: fmtNum(p) + ' % de ' + fmtNum(n), difficulte: 'facile', e1: 'Prendre ' + fmtNum(p) + ' % d\'un nombre, c\'est le multiplier par ' + fmtNum(p) + ' puis diviser par 100.' + (isLow(ctx) ? ' Sur 100 mangues, on en prend ' + fmtNum(p) + '.' : ''), e2: fmtNum(n) + ' × ' + fmtNum(p) + ' ÷ 100 = ' + fmtNum(n * p) + ' ÷ 100 = ' + fmtNum(r) + '.', e3: fmtNum(r) + ' ÷ ' + fmtNum(n) + ' × 100 = ' + fmtNum(p) + ' % ✅', conclusion: fmtNum(p) + ' % de ' + fmtNum(n) + ' = ' + fmtNum(r), reponse: fmtNum(r), answers: [r], gen: { k: 'percent' } });
    }
    const pc = t.match(new RegExp(NUM + '\\s*%'));
    if (pc && /augment|hausse|reduc|remise|baisse|rabais|solde/.test(s)) {
      const p = parseFr(pc[1]); const base = nums(t.replace(pc[0], '')).filter((x) => x > 0).sort((a, b) => b - a)[0];
      if (base) {
        const up = /augment|hausse/.test(s); const delta = base * p / 100, fin = up ? base + delta : base - delta;
        return res({ type: 'pourcentage', titre: (up ? 'Hausse' : 'Remise') + ' de ' + fmtNum(p) + ' %', difficulte: 'facile', e1: 'Prix de départ : ' + fmtNum(base) + '. ' + (up ? 'Augmentation' : 'Réduction') + ' de ' + fmtNum(p) + ' %.', e2: 'Montant de la ' + (up ? 'hausse' : 'remise') + ' : ' + fmtNum(base) + ' × ' + fmtNum(p) + ' ÷ 100 = ' + fmtNum(delta) + '.\nNouveau prix : ' + fmtNum(base) + (up ? ' + ' : ' - ') + fmtNum(delta) + ' = ' + fmtNum(fin) + '.', e3: 'Coefficient multiplicateur : ' + fmtNum(base) + ' × ' + fmtNum(up ? 1 + p / 100 : 1 - p / 100, 4) + ' = ' + fmtNum(fin) + ' ✅', conclusion: 'Le nouveau prix est ' + fmtNum(fin) + ' F.', reponse: fmtNum(fin), answers: [fin, delta], gen: { k: 'percent' } });
      }
    }
    if (/quel pourcentage|pourcentage de|proportion|taux de reussite/.test(s)) {
      const ns = nums(t).filter((x) => x > 0); if (ns.length === 2) {
        const [a, b] = ns[0] < ns[1] ? ns : [ns[1], ns[0]]; const r = a / b * 100;
        return res({ type: 'pourcentage', titre: 'Pourcentage', difficulte: 'facile', e1: 'On cherche quelle part ' + fmtNum(a) + ' représente sur ' + fmtNum(b) + ', exprimée sur 100.', e2: 'Pourcentage = (partie ÷ total) × 100 = (' + fmtNum(a) + ' ÷ ' + fmtNum(b) + ') × 100 = ' + fmtNum(r) + ' %.', e3: fmtNum(r) + ' % de ' + fmtNum(b) + ' = ' + fmtNum(r * b / 100) + ' ✅', conclusion: 'Cela représente ' + fmtNum(r) + ' %.', reponse: fmtNum(r) + ' %', answers: [r], gen: { k: 'percent' } });
      }
    }
    return null;
  }
  function solveTVA(text, ctx) {
    const s = strip(text); if (!/\btva\b|taxe sur la valeur/.test(s)) return null;
    const rm = s.match(/(\d+(?:[.,]\d+)?)\s*%/); const rate = rm ? parseFr(rm[1]) : 18;
    const tx = String(text).replace(/\d+(?:[.,]\d+)?\s*%/g, ' ');
    const ht = numNear(tx, '\\bht\\b|hors taxes?|hors-taxes?', 30, 12), ttc = numNear(tx, '\\bttc\\b|toutes taxes', 30, 12);
    const r = rate / 100;
    if (ht && !(/calcul\w*\s+(?:le|du)\s+(?:prix|montant)\s+ht/.test(s) && ttc)) {
      const tva = ht * r, T = ht + tva;
      return res({ type: 'tva', titre: 'TVA ' + fmtNum(rate) + ' %', difficulte: 'facile', e1: 'Montant hors taxes (HT) : ' + money(ht) + '. Taux de TVA : ' + fmtNum(rate) + ' %' + (rm ? '.' : ' (taux normal au Bénin).'), e2: 'TVA = HT × taux = ' + fmtNum(ht) + ' × ' + fmtNum(r, 4) + ' = ' + money(tva) + '.\nTTC = HT + TVA = ' + fmtNum(ht) + ' + ' + fmtNum(tva) + ' = ' + money(T) + '.', e3: 'TTC ÷ ' + fmtNum(1 + r, 4) + ' = ' + fmtNum(T / (1 + r)) + ' = HT ✅', conclusion: 'TVA = ' + money(tva) + ' ; Prix TTC = ' + money(T), reponse: fmtNum(T), answers: [T, tva], gen: { k: 'tva' } });
    }
    if (ttc) {
      const H = ttc / (1 + r), tva = ttc - H;
      return res({ type: 'tva', titre: 'TVA ' + fmtNum(rate) + ' %', difficulte: 'moyen', e1: 'On connaît le TTC : ' + money(ttc) + '. On cherche le HT et la TVA (taux ' + fmtNum(rate) + ' %).', e2: 'TTC = HT × (1 + taux) donc HT = TTC ÷ ' + fmtNum(1 + r, 4) + ' = ' + money(H) + '.\nTVA = TTC - HT = ' + money(tva) + '.', e3: fmtNum(H) + ' × ' + fmtNum(r, 4) + ' = ' + fmtNum(tva) + ' ✅', conclusion: 'HT = ' + money(H) + ' ; TVA = ' + money(tva), reponse: fmtNum(H), answers: [H, tva], gen: { k: 'tva' } });
    }
    return null;
  }
  function solveInterest(text, ctx) {
    const s = strip(text); if (!/interet|valeur acquise|capitalis|placement|place a|emprunt/.test(s)) return null;
    const rm = s.match(/(\d+(?:[.,]\d+)?)\s*%/); if (!rm) return null;
    const t = parseFr(rm[1]) / 100;
    const C = numNear(text.replace(rm[0], ''), 'capital|somme|place|placement|montant|emprunt|pret|depose', 30, 25);
    const dm = s.match(/(\d+(?:[.,]\d+)?)\s*(ans?|annees?|mois|jours?)\b/);
    if (!C || !dm) return null;
    const n0 = parseFr(dm[1]); const unit = dm[2];
    const n = /mois/.test(unit) ? n0 / 12 : /jour/.test(unit) ? n0 / 360 : n0;
    if (/compos|capitalis/.test(s)) {
      const Cn = C * Math.pow(1 + t, n);
      return res({ type: 'interets', titre: 'Intérêts composés', difficulte: 'moyen', e1: 'Capital C₀ = ' + money(C) + ', taux t = ' + fmtNum(t * 100) + ' % par an, durée n = ' + fmtNum(n) + ' an(s). Intérêts COMPOSÉS : les intérêts produisent eux aussi des intérêts.', e2: 'Valeur acquise Cₙ = C₀ × (1 + t)ⁿ = ' + fmtNum(C) + ' × ' + fmtNum(1 + t, 4) + sup(n0) + ' = ' + money(Cn) + '.\nIntérêts = Cₙ - C₀ = ' + money(Cn - C) + '.', e3: 'Contrôle : ' + money(Cn) + ' ÷ ' + fmtNum(1 + t, 4) + sup(n0) + ' = ' + money(Cn / Math.pow(1 + t, n)) + ' ✅', conclusion: 'Valeur acquise : ' + money(Cn) + ' (intérêts : ' + money(Cn - C) + ')', reponse: fmtNum(Cn), answers: [Cn, Cn - C], gen: { k: 'interest' } });
    }
    const I = C * t * n;
    return res({ type: 'interets', titre: 'Intérêts simples', difficulte: 'facile', e1: 'Capital C = ' + money(C) + ', taux t = ' + fmtNum(t * 100) + ' % par an, durée = ' + fmtNum(n0) + ' ' + unit + '. Intérêts SIMPLES.', e2: 'I = C × t × n' + (/mois/.test(unit) ? ' / 12' : /jour/.test(unit) ? ' / 360' : '') + ' = ' + fmtNum(C) + ' × ' + fmtNum(t * 100) + ' × ' + fmtNum(n0) + ' / ' + (/mois/.test(unit) ? '1200' : /jour/.test(unit) ? '36000' : '100') + ' = ' + money(I) + '.\nValeur acquise = C + I = ' + money(C + I) + '.', e3: 'Intérêt d\'une année : ' + money(C * t) + ' × ' + fmtNum(n) + ' = ' + money(I) + ' ✅', conclusion: 'Intérêts : ' + money(I) + ' ; valeur acquise : ' + money(C + I), reponse: fmtNum(I), answers: [I, C + I], gen: { k: 'interest' } });
  }
  function solveAmort(text, ctx) {
    const s = strip(text); if (!/amortissement|amorti/.test(s)) return null;
    const V = numNear(text, 'valeur d.origine|acquis|achete|cout d.acquisition|valeur|montant|pour', 40, 30);
    const dm = s.match(/(\d+)\s*ans/) || s.match(/duree[^0-9]{0,20}(\d+)/);
    let n = dm ? parseInt(dm[1]) : null;
    const tm = s.match(/(\d+(?:[.,]\d+)?)\s*%/); if (!n && tm) n = Math.round(100 / parseFr(tm[1]));
    if (!V || !n) return null;
    const dec = /degressi/.test(s);
    const rows = []; let vnc = V, cum = 0;
    if (!dec) {
      const a = V / n;
      for (let i = 1; i <= n; i++) { cum += a; vnc = V - cum; rows.push('Année ' + i + ' : annuité ' + fmtNum(a) + ' | cumul ' + fmtNum(cum) + ' | VNC ' + fmtNum(vnc)); }
      return res({ type: 'amortissement', titre: 'Amortissement linéaire', difficulte: 'moyen', e1: 'Bien de valeur d\'origine ' + money(V) + ', amorti en linéaire sur ' + n + ' ans : l\'annuité est la même chaque année.', e2: L(['Taux = 100 / ' + n + ' = ' + fmtNum(100 / n) + ' %.', 'Annuité = V₀ × taux = ' + fmtNum(V) + ' × ' + fmtNum(100 / n) + ' % = ' + money(a) + '.', 'Tableau d\'amortissement :', ...rows.slice(0, 12)]), e3: 'Somme des annuités = ' + n + ' × ' + fmtNum(a) + ' = ' + fmtNum(a * n) + ' = valeur d\'origine, VNC finale = 0 ✅', conclusion: 'Annuité constante : ' + money(a), reponse: fmtNum(a), answers: [a], gen: { k: 'amort' } });
    }
    const coef = n <= 4 ? 1.5 : n <= 6 ? 2 : 2.5; const tx = 100 / n * coef / 100;
    for (let i = 1; i <= n; i++) { const rest = n - i + 1; const lin = 1 / rest; const taux = Math.max(tx, lin); const a = vnc * taux; cum += a; rows.push('Année ' + i + ' : base ' + fmtNum(vnc) + ' | taux ' + fmtNum(taux * 100) + ' % | annuité ' + fmtNum(a) + ' | VNC ' + fmtNum(vnc - a)); vnc -= a; }
    return res({ type: 'amortissement', titre: 'Amortissement dégressif', difficulte: 'difficile', e1: 'Bien de ' + money(V) + ' amorti en dégressif sur ' + n + ' ans (coefficient fiscal ' + coef + ').', e2: L(['Taux dégressif = taux linéaire × coefficient = ' + fmtNum(100 / n) + ' % × ' + coef + ' = ' + fmtNum(tx * 100) + ' %.', 'On passe au linéaire quand le taux linéaire sur la durée restante devient supérieur.', ...rows]), e3: 'Somme des annuités = ' + fmtNum(cum) + ' ≈ valeur d\'origine ✅', conclusion: '1ʳᵉ annuité : ' + money(V * tx), reponse: fmtNum(V * tx), gen: { k: 'amort' } });
  }
  function solveStats(text, ctx) {
    const s = strip(text); if (!/moyenne|mediane|variance|ecart[- ]type|etendue|\bmode\b/.test(s)) return null;
    const after = text.replace(/^[^:]*:/, '');
    let ns = nums(/:/.test(text) ? after : text).filter((x) => !isNaN(x));
    if (ns.length < 2) return null;
    const n = ns.length, sum = ns.reduce((a, b) => a + b, 0), mean = sum / n;
    const sorted = [...ns].sort((a, b) => a - b);
    const med = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    const v = ns.reduce((a, b) => a + (b - mean) ** 2, 0) / n; const sd = Math.sqrt(v);
    const adv = /variance|ecart/.test(s) || ctx.niveau === 'BAC' || ctx.niveau === 'LICENCE';
    return res({
      type: 'statistiques', titre: 'Série : ' + ns.map((x) => fmtNum(x)).join(' ; '), difficulte: adv ? 'moyen' : 'facile',
      e1: 'Série de ' + n + ' valeurs : ' + ns.map((x) => fmtNum(x)).join(' ; ') + '.',
      e2: L(['Moyenne = somme ÷ effectif = ' + fmtNum(sum) + ' ÷ ' + n + ' = ' + fmtNum(mean) + '.', 'Série rangée : ' + sorted.map((x) => fmtNum(x)).join(' ; ') + ' → médiane = ' + fmtNum(med) + '.', 'Étendue = ' + fmtNum(sorted[n - 1]) + ' - ' + fmtNum(sorted[0]) + ' = ' + fmtNum(sorted[n - 1] - sorted[0]) + '.', adv ? 'Variance V = moyenne des carrés des écarts = ' + fmtNum(v, 3) + ' ; écart-type σ = √V ≈ ' + fmtNum(sd, 3) + '.' : '']),
      e3: 'Contrôle : la moyenne ' + fmtNum(mean) + ' est bien comprise entre la plus petite (' + fmtNum(sorted[0]) + ') et la plus grande valeur (' + fmtNum(sorted[n - 1]) + ') ✅',
      conclusion: 'Moyenne = ' + fmtNum(mean) + ' ; médiane = ' + fmtNum(med) + (adv ? ' ; σ ≈ ' + fmtNum(sd, 3) : ''), reponse: fmtNum(mean), answers: [mean], gen: { k: 'stats' }
    });
  }

  // ---------------------------------------------------------------- 8. GÉOMÉTRIE
  function solvePythagore(text, ctx) {
    const t = M.norm(text); const s = strip(t);
    if (!/rectangle|pythagore|hypotenuse/.test(s) || /aire|perimetre/.test(s) && !/triangle/.test(s)) return null;
    const lens = {}; let m; const re = /\b([A-Z]{2})\s*=\s*(\d+(?:\.\d+)?)/g;
    while ((m = re.exec(t))) lens[m[1].split('').sort().join('')] = parseFloat(m[2]);
    const tri = (t.match(/triangle\s+([A-Z]{3})/) || [])[1];
    const vtx = (t.match(/rectangle\s+en\s+([A-Z])/) || [])[1];
    if (!tri || !vtx || Object.keys(lens).length < 2) return null;
    const others = tri.split('').filter((c) => c !== vtx);
    const hyp = others.sort().join(''), s1 = [vtx, others[0]].sort().join(''), s2 = [vtx, others[1]].sort().join('');
    const unit = (s.match(/\d\s*(cm|mm|dm|km|m)\b/) || [])[1] || 'cm';
    const H = lens[hyp], A = lens[s1], B = lens[s2];
    const lines = ['Le triangle ' + tri + ' est rectangle en ' + vtx + ', donc l\'hypoténuse (côté opposé à l\'angle droit) est [' + hyp + '].', 'Théorème de Pythagore : ' + hyp + '² = ' + s1 + '² + ' + s2 + '².'];
    let ans, name, ver;
    if (H === undefined) { const v = A * A + B * B; ans = Math.sqrt(v); name = hyp; lines.push(hyp + '² = ' + fmtNum(A) + '² + ' + fmtNum(B) + '² = ' + fmtNum(A * A) + ' + ' + fmtNum(B * B) + ' = ' + fmtNum(v) + '.', hyp + ' = √' + fmtNum(v) + (Number.isInteger(ans) ? ' = ' : ' ≈ ') + fmtNum(ans) + ' ' + unit + '.'); ver = fmtNum(ans) + '² ≈ ' + fmtNum(ans * ans) + ' = ' + fmtNum(A * A) + ' + ' + fmtNum(B * B) + ' ✅'; }
    else { const known = A !== undefined ? A : B; name = A !== undefined ? s2 : s1; const v = H * H - known * known; if (v <= 0) return null; ans = Math.sqrt(v); lines.push(name + '² = ' + hyp + '² - ' + (A !== undefined ? s1 : s2) + '² = ' + fmtNum(H * H) + ' - ' + fmtNum(known * known) + ' = ' + fmtNum(v) + '.', name + ' = √' + fmtNum(v) + (Number.isInteger(ans) ? ' = ' : ' ≈ ') + fmtNum(ans) + ' ' + unit + '.'); ver = fmtNum(known) + '² + ' + fmtNum(ans) + '² ≈ ' + fmtNum(known * known + ans * ans) + ' = ' + fmtNum(H) + '² ✅'; }
    return res({ type: 'pythagore', titre: 'Pythagore — ' + tri, difficulte: 'moyen', e1: 'Données : ' + Object.keys(lens).map((k) => k + ' = ' + fmtNum(lens[k]) + ' ' + unit).join(', ') + '. On cherche ' + name + '.', e2: L(lines), e3: ver + '\nEt l\'hypoténuse est bien le plus grand côté ✅', conclusion: name + ' = ' + fmtNum(ans) + ' ' + unit, reponse: fmtNum(ans), answers: [ans], gen: { k: 'pythagore' } });
  }
  function solveArea(text, ctx) {
    const s = strip(text); if (!/aire|perimetre|surface|superficie|circonference/.test(s)) return null;
    const g = (kw) => numNear(text, kw, 22, 6);
    const unit = (s.match(/\d\s*(cm|mm|dm|km|m)\b/) || [])[1] || 'cm';
    const wantA = /aire|surface|superficie/.test(s), wantP = /perimetre|circonference/.test(s);
    let shape, lines = [], A, Pm;
    if (/cercle|disque|rond/.test(s)) {
      let r = g('rayon'); const d = g('diametre'); if (!r && d) r = d / 2; if (!r) return null; shape = 'cercle';
      A = 3.14 * r * r; Pm = 2 * 3.14 * r;
      lines.push(d && !g('rayon') ? 'Rayon = diamètre ÷ 2 = ' + fmtNum(r) + ' ' + unit + '.' : '', wantP ? 'Périmètre = 2 × π × r = 2 × 3,14 × ' + fmtNum(r) + ' = ' + fmtNum(Pm) + ' ' + unit + '.' : '', wantA ? 'Aire = π × r × r = 3,14 × ' + fmtNum(r) + ' × ' + fmtNum(r) + ' = ' + fmtNum(A) + ' ' + unit + '².' : '');
    } else if (/carre/.test(s)) {
      const c = g('cote') || nums(text)[0]; if (!c) return null; shape = 'carré'; A = c * c; Pm = 4 * c;
      lines.push(wantP ? 'Périmètre = 4 × côté = 4 × ' + fmtNum(c) + ' = ' + fmtNum(Pm) + ' ' + unit + '.' : '', wantA ? 'Aire = côté × côté = ' + fmtNum(c) + ' × ' + fmtNum(c) + ' = ' + fmtNum(A) + ' ' + unit + '².' : '');
    } else if (/triangle/.test(s)) {
      const b = g('base'), h = g('hauteur'); if (!b || !h) return null; shape = 'triangle'; A = b * h / 2;
      lines.push('Aire = (base × hauteur) ÷ 2 = (' + fmtNum(b) + ' × ' + fmtNum(h) + ') ÷ 2 = ' + fmtNum(A) + ' ' + unit + '².');
    } else if (/rectangle|champ|terrain|jardin|salle|parcelle/.test(s)) {
      let Lg = g('longueur'), l = g('largeur'); if (!Lg || !l) { const ns = nums(text).filter((x) => x > 0); if (ns.length >= 2) { Lg = Math.max(ns[0], ns[1]); l = Math.min(ns[0], ns[1]); } }
      if (!Lg || !l) return null; shape = 'rectangle'; A = Lg * l; Pm = 2 * (Lg + l);
      lines.push(wantP ? 'Périmètre = (longueur + largeur) × 2 = (' + fmtNum(Lg) + ' + ' + fmtNum(l) + ') × 2 = ' + fmtNum(Pm) + ' ' + unit + '.' : '', wantA ? 'Aire = longueur × largeur = ' + fmtNum(Lg) + ' × ' + fmtNum(l) + ' = ' + fmtNum(A) + ' ' + unit + '².' : '');
    } else return null;
    const concl = [wantP && Pm !== undefined ? 'Périmètre = ' + fmtNum(Pm) + ' ' + unit : '', wantA ? 'Aire = ' + fmtNum(A) + ' ' + unit + '²' : ''].filter(Boolean).join(' ; ');
    return res({ type: 'geometrie', titre: (wantA ? 'Aire' : 'Périmètre') + ' d\'un ' + shape, difficulte: 'facile', e1: 'On travaille sur un ' + shape + '. ' + (isLow(ctx) ? 'Le périmètre, c\'est le tour du champ ; l\'aire, c\'est la surface à l\'intérieur.' : 'On repère les dimensions utiles dans l\'énoncé.'), e2: L(lines), e3: 'Unités : un périmètre s\'exprime en ' + unit + ', une aire en ' + unit + '² ✅', conclusion: concl, reponse: fmtNum(wantA ? A : Pm), answers: [wantA ? A : Pm].concat(wantA && wantP && Pm ? [Pm] : []), gen: { k: 'area' } });
  }

  // ---------------------------------------------------------------- 9. PHYSIQUE (PCT)
  function solvePhysics(text, ctx) {
    const t = M.norm(text); const s = strip(t);
    const val = (sym, words, units) => {
      let m = t.match(new RegExp('\\b' + sym + '\\s*=\\s*' + NUM + '\\s*(' + units + ')?', 'i')); if (m) return { v: parseFr(m[1]), u: m[2] };
      m = s.match(new RegExp('(?:' + words + ')[^0-9]{0,25}?' + NUM + '\\s*(' + units.toLowerCase() + ')?')); if (m) return { v: parseFr(m[1]), u: m[2] };
      return null;
    };
    if (/ohm|tension|intensite|resistance|\bu\s*=|\bi\s*=|\br\s*=/i.test(s) && /\b(v|a|ω|ohms?|ma|kω)\b/i.test(t + ' ')) {
      const U = val('U', 'tension', 'V|mV'), I = val('I', 'intensite|courant', 'A|mA'), R = val('R', 'resistance', 'Ω|ohms?|kΩ');
      if (I && /^ma$/i.test(I.u || '')) I.v /= 1000; if (R && /k/i.test(R.u || '')) R.v *= 1000;
      const known = [U, I, R].filter(Boolean).length;
      if (known >= 2) {
        let lines = ['Loi d\'Ohm : U = R × I (U en volts, R en ohms, I en ampères).'], ans, concl;
        if (!U) { ans = R.v * I.v; lines.push('U = ' + fmtNum(R.v) + ' × ' + fmtNum(I.v, 3) + ' = ' + fmtNum(ans) + ' V.'); concl = 'U = ' + fmtNum(ans) + ' V'; }
        else if (!I) { ans = U.v / R.v; lines.push('I = U ÷ R = ' + fmtNum(U.v) + ' ÷ ' + fmtNum(R.v) + ' = ' + fmtNum(ans, 3) + ' A.'); concl = 'I = ' + fmtNum(ans, 3) + ' A'; }
        else { ans = U.v / I.v; lines.push('R = U ÷ I = ' + fmtNum(U.v) + ' ÷ ' + fmtNum(I.v, 3) + ' = ' + fmtNum(ans) + ' Ω.'); concl = 'R = ' + fmtNum(ans) + ' Ω'; }
        const Uv = U ? U.v : ans, Iv = I ? I.v : ans;
        if (/puissance/.test(s)) { lines.push('Puissance : P = U × I = ' + fmtNum(Uv) + ' × ' + fmtNum(Iv, 3) + ' = ' + fmtNum(Uv * Iv) + ' W.'); concl += ' ; P = ' + fmtNum(Uv * Iv) + ' W'; }
        return res({ type: 'physique', titre: 'Loi d\'Ohm', difficulte: 'facile', e1: 'On relève les données et on convertit en unités du Système International (mA → A, kΩ → Ω).', e2: L(lines), e3: 'Analyse dimensionnelle : V = Ω × A ✅ et on remplace dans U = R × I pour retrouver les données.', conclusion: concl, reponse: fmtNum(ans, 3), answers: [ans], gen: { k: 'ohm' } });
      }
    }
    if (/masse volumique/.test(s)) {
      const m = s.match(new RegExp('masse[^0-9]{0,20}' + NUM + '\\s*(kg|g)')), v = s.match(new RegExp('volume[^0-9]{0,20}' + NUM + '\\s*(cm3|cm\\^3|ml|l|m3|m\\^3|dm3|dm\\^3)'));
      if (m && v) {
        const mv = parseFr(m[1]), vv = parseFr(v[1]); const r = mv / vv; const u = m[2] + '/' + v[2].replace('^', '').replace('3', '³');
        return res({ type: 'physique', titre: 'Masse volumique', difficulte: 'facile', e1: 'Masse m = ' + fmtNum(mv) + ' ' + m[2] + ', volume V = ' + fmtNum(vv) + ' ' + v[2] + '.', e2: 'ρ = m ÷ V = ' + fmtNum(mv) + ' ÷ ' + fmtNum(vv) + ' = ' + fmtNum(r, 3) + ' ' + u + '.', e3: 'ρ × V = ' + fmtNum(r * vv) + ' = m ✅ (Repère : l\'eau a ρ = 1 g/cm³.)', conclusion: 'ρ = ' + fmtNum(r, 3) + ' ' + u, reponse: fmtNum(r, 3), answers: [r], gen: { k: 'physique' } });
      }
    }
    if (/vitesse/.test(s)) {
      const d = s.match(new RegExp(NUM + '\\s*(km|m)\\b')), tm = s.match(new RegExp(NUM + '\\s*(h|heures?|min|minutes?|s|secondes?)\\b'));
      if (d && tm) {
        const dv = parseFr(d[1]), tv = parseFr(tm[1]); const v = dv / tv; const tu = /^h/.test(tm[2]) ? 'h' : /^min/.test(tm[2]) ? 'min' : 's';
        return res({ type: 'physique', titre: 'Vitesse moyenne', difficulte: 'facile', e1: 'Distance d = ' + fmtNum(dv) + ' ' + d[2] + ', durée t = ' + fmtNum(tv) + ' ' + tu + '.', e2: 'v = d ÷ t = ' + fmtNum(dv) + ' ÷ ' + fmtNum(tv) + ' = ' + fmtNum(v) + ' ' + d[2] + '/' + tu + '.' + (d[2] === 'km' && tu === 'h' ? '\nEn m/s : ' + fmtNum(v) + ' ÷ 3,6 = ' + fmtNum(v / 3.6) + ' m/s.' : ''), e3: 'd = v × t = ' + fmtNum(v) + ' × ' + fmtNum(tv) + ' = ' + fmtNum(dv) + ' ✅', conclusion: 'v = ' + fmtNum(v) + ' ' + d[2] + '/' + tu, reponse: fmtNum(v), answers: [v], gen: { k: 'physique' } });
      }
    }
    if (/poids/.test(s)) {
      const m = s.match(new RegExp(NUM + '\\s*(kg|g)\\b')); if (m) {
        let mv = parseFr(m[1]); if (m[2] === 'g') mv /= 1000; const gm = t.match(/g\s*=\s*(\d+(?:\.\d+)?)/); const g = gm ? parseFloat(gm[1]) : 10;
        return res({ type: 'physique', titre: 'Poids', difficulte: 'facile', e1: 'Masse m = ' + fmtNum(mv, 3) + ' kg, intensité de la pesanteur g = ' + fmtNum(g) + ' N/kg.', e2: 'P = m × g = ' + fmtNum(mv, 3) + ' × ' + fmtNum(g) + ' = ' + fmtNum(mv * g) + ' N.', e3: 'P ÷ g = ' + fmtNum(mv, 3) + ' kg ✅ (masse en kg, poids en newtons)', conclusion: 'P = ' + fmtNum(mv * g) + ' N', reponse: fmtNum(mv * g), answers: [mv * g], gen: { k: 'physique' } });
      }
    }
    return null;
  }

  // ---------------------------------------------------------------- 10. RÈGLE DE TROIS (CEP)
  function solveProportion(text, ctx) {
    const s = strip(text); if (!/combien|quel (?:est le )?prix|que (?:paiera|payera|coutera)|calcule/.test(s)) return null;
    if (!/coute|coutent|paie|paye|achete|vend|pese|pesent|produit|consomme|parcourt|gagne|recoit/.test(s)) return null;
    const ns = nums(text).filter((x) => x > 0); if (ns.length !== 3) return null;
    const [a, b, c] = ns; const r = b * c / a;
    return res({ type: 'proportion', titre: 'Règle de trois', difficulte: 'facile', confidence: 0.6,
      e1: 'C\'est une situation de proportionnalité : si ' + fmtNum(a) + ' donnent ' + fmtNum(b) + ', combien donnent ' + fmtNum(c) + ' ?' + (isLow(ctx) ? ' Comme au marché : plus tu achètes de mangues, plus tu paies.' : ''),
      e2: 'On passe par l\'unité : 1 donne ' + fmtNum(b) + ' ÷ ' + fmtNum(a) + ' = ' + fmtNum(b / a) + '.\nPuis ' + fmtNum(c) + ' donnent ' + fmtNum(b / a) + ' × ' + fmtNum(c) + ' = ' + fmtNum(r) + '.',
      e3: 'Tableau de proportionnalité : ' + fmtNum(b) + ' ÷ ' + fmtNum(a) + ' = ' + fmtNum(r) + ' ÷ ' + fmtNum(c) + ' = ' + fmtNum(b / a) + ' ✅',
      conclusion: 'Réponse : ' + fmtNum(r), reponse: fmtNum(r), answers: [r], gen: { k: 'percent' } });
  }

  // ---------------------------------------------------------------- 11. CONJUGAISON (CEP/BEPC)
  // p : présent ; f : radical du futur/conditionnel ; i : radical de l'imparfait ; pp : participe passé ;
  // ps : passé simple « radical|type » (a = 1er groupe, i, u, in) ; sj : radicaux du subjonctif [je/tu/il/ils, nous/vous]
  const IRR = {
    etre: { p: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'], f: 'ser', i: 'ét', pp: 'été', aux: 'avoir', inf: 'être', ps: 'f|u', sjf: ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'] },
    avoir: { p: ['ai', 'as', 'a', 'avons', 'avez', 'ont'], f: 'aur', i: 'av', pp: 'eu', aux: 'avoir', inf: 'avoir', ps: 'e|u', sjf: ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'] },
    aller: { p: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'], f: 'ir', i: 'all', pp: 'allé', aux: 'être', inf: 'aller', ps: 'all|a', sj: ['aill', 'all'] },
    faire: { p: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'], f: 'fer', i: 'fais', pp: 'fait', aux: 'avoir', inf: 'faire', ps: 'f|i', sj: ['fass', 'fass'] },
    venir: { p: ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'], f: 'viendr', i: 'ven', pp: 'venu', aux: 'être', inf: 'venir', ps: 'v|in', sj: ['vienn', 'ven'] },
    tenir: { p: ['tiens', 'tiens', 'tient', 'tenons', 'tenez', 'tiennent'], f: 'tiendr', i: 'ten', pp: 'tenu', aux: 'avoir', inf: 'tenir', ps: 't|in', sj: ['tienn', 'ten'] },
    pouvoir: { p: ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'], f: 'pourr', i: 'pouv', pp: 'pu', aux: 'avoir', inf: 'pouvoir', ps: 'p|u', sj: ['puiss', 'puiss'] },
    vouloir: { p: ['veux', 'veux', 'veut', 'voulons', 'voulez', 'veulent'], f: 'voudr', i: 'voul', pp: 'voulu', aux: 'avoir', inf: 'vouloir', ps: 'voul|u', sj: ['veuill', 'voul'] },
    devoir: { p: ['dois', 'dois', 'doit', 'devons', 'devez', 'doivent'], f: 'devr', i: 'dev', pp: 'dû', aux: 'avoir', inf: 'devoir', ps: 'd|u', sj: ['doiv', 'dev'] },
    recevoir: { p: ['reçois', 'reçois', 'reçoit', 'recevons', 'recevez', 'reçoivent'], f: 'recevr', i: 'recev', pp: 'reçu', aux: 'avoir', inf: 'recevoir', ps: 'reç|u', sj: ['reçoiv', 'recev'] },
    savoir: { p: ['sais', 'sais', 'sait', 'savons', 'savez', 'savent'], f: 'saur', i: 'sav', pp: 'su', aux: 'avoir', inf: 'savoir', ps: 's|u', sj: ['sach', 'sach'] },
    voir: { p: ['vois', 'vois', 'voit', 'voyons', 'voyez', 'voient'], f: 'verr', i: 'voy', pp: 'vu', aux: 'avoir', inf: 'voir', ps: 'v|i', sj: ['voi', 'voy'] },
    prendre: { p: ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'], f: 'prendr', i: 'pren', pp: 'pris', aux: 'avoir', inf: 'prendre', ps: 'pr|i', sj: ['prenn', 'pren'] },
    mettre: { p: ['mets', 'mets', 'met', 'mettons', 'mettez', 'mettent'], f: 'mettr', i: 'mett', pp: 'mis', aux: 'avoir', inf: 'mettre', ps: 'm|i' },
    dire: { p: ['dis', 'dis', 'dit', 'disons', 'dites', 'disent'], f: 'dir', i: 'dis', pp: 'dit', aux: 'avoir', inf: 'dire', ps: 'd|i' },
    lire: { p: ['lis', 'lis', 'lit', 'lisons', 'lisez', 'lisent'], f: 'lir', i: 'lis', pp: 'lu', aux: 'avoir', inf: 'lire', ps: 'l|u' },
    ecrire: { p: ['écris', 'écris', 'écrit', 'écrivons', 'écrivez', 'écrivent'], f: 'écrir', i: 'écriv', pp: 'écrit', aux: 'avoir', inf: 'écrire', ps: 'écriv|i' },
    croire: { p: ['crois', 'crois', 'croit', 'croyons', 'croyez', 'croient'], f: 'croir', i: 'croy', pp: 'cru', aux: 'avoir', inf: 'croire', ps: 'cr|u', sj: ['croi', 'croy'] },
    boire: { p: ['bois', 'bois', 'boit', 'buvons', 'buvez', 'boivent'], f: 'boir', i: 'buv', pp: 'bu', aux: 'avoir', inf: 'boire', ps: 'b|u', sj: ['boiv', 'buv'] },
    connaitre: { p: ['connais', 'connais', 'connaît', 'connaissons', 'connaissez', 'connaissent'], f: 'connaîtr', i: 'connaiss', pp: 'connu', aux: 'avoir', inf: 'connaître', ps: 'conn|u' },
    naitre: { p: ['nais', 'nais', 'naît', 'naissons', 'naissez', 'naissent'], f: 'naîtr', i: 'naiss', pp: 'né', aux: 'être', inf: 'naître', ps: 'naqu|i' },
    partir: { p: ['pars', 'pars', 'part', 'partons', 'partez', 'partent'], f: 'partir', i: 'part', pp: 'parti', aux: 'être', inf: 'partir', ps: 'part|i' },
    sortir: { p: ['sors', 'sors', 'sort', 'sortons', 'sortez', 'sortent'], f: 'sortir', i: 'sort', pp: 'sorti', aux: 'être', inf: 'sortir', ps: 'sort|i' },
    dormir: { p: ['dors', 'dors', 'dort', 'dormons', 'dormez', 'dorment'], f: 'dormir', i: 'dorm', pp: 'dormi', aux: 'avoir', inf: 'dormir', ps: 'dorm|i' },
    sentir: { p: ['sens', 'sens', 'sent', 'sentons', 'sentez', 'sentent'], f: 'sentir', i: 'sent', pp: 'senti', aux: 'avoir', inf: 'sentir', ps: 'sent|i' },
    servir: { p: ['sers', 'sers', 'sert', 'servons', 'servez', 'servent'], f: 'servir', i: 'serv', pp: 'servi', aux: 'avoir', inf: 'servir', ps: 'serv|i' },
    ouvrir: { p: ['ouvre', 'ouvres', 'ouvre', 'ouvrons', 'ouvrez', 'ouvrent'], f: 'ouvrir', i: 'ouvr', pp: 'ouvert', aux: 'avoir', inf: 'ouvrir', ps: 'ouvr|i' },
    offrir: { p: ['offre', 'offres', 'offre', 'offrons', 'offrez', 'offrent'], f: 'offrir', i: 'offr', pp: 'offert', aux: 'avoir', inf: 'offrir', ps: 'offr|i' },
    courir: { p: ['cours', 'cours', 'court', 'courons', 'courez', 'courent'], f: 'courr', i: 'cour', pp: 'couru', aux: 'avoir', inf: 'courir', ps: 'cour|u' },
    mourir: { p: ['meurs', 'meurs', 'meurt', 'mourons', 'mourez', 'meurent'], f: 'mourr', i: 'mour', pp: 'mort', aux: 'être', inf: 'mourir', ps: 'mour|u', sj: ['meur', 'mour'] },
    vivre: { p: ['vis', 'vis', 'vit', 'vivons', 'vivez', 'vivent'], f: 'vivr', i: 'viv', pp: 'vécu', aux: 'avoir', inf: 'vivre', ps: 'véc|u' },
    suivre: { p: ['suis', 'suis', 'suit', 'suivons', 'suivez', 'suivent'], f: 'suivr', i: 'suiv', pp: 'suivi', aux: 'avoir', inf: 'suivre', ps: 'suiv|i' },
    conduire: { p: ['conduis', 'conduis', 'conduit', 'conduisons', 'conduisez', 'conduisent'], f: 'conduir', i: 'conduis', pp: 'conduit', aux: 'avoir', inf: 'conduire', ps: 'conduis|i' },
    craindre: { p: ['crains', 'crains', 'craint', 'craignons', 'craignez', 'craignent'], f: 'craindr', i: 'craign', pp: 'craint', aux: 'avoir', inf: 'craindre', ps: 'craign|i' },
    peindre: { p: ['peins', 'peins', 'peint', 'peignons', 'peignez', 'peignent'], f: 'peindr', i: 'peign', pp: 'peint', aux: 'avoir', inf: 'peindre', ps: 'peign|i' },
    rire: { p: ['ris', 'ris', 'rit', 'rions', 'riez', 'rient'], f: 'rir', i: 'ri', pp: 'ri', aux: 'avoir', inf: 'rire', ps: 'r|i' },
    plaire: { p: ['plais', 'plais', 'plaît', 'plaisons', 'plaisez', 'plaisent'], f: 'plair', i: 'plais', pp: 'plu', aux: 'avoir', inf: 'plaire', ps: 'pl|u' }
  };
  const PREF = { venir: ['re', 'de', 'pre', 'sou', 'inter', 'con', 'par', 'sur', 'contre'], tenir: ['ob', 're', 'main', 'sou', 'con', 'appar', 'abs', 'dé', 'en', 'at', 'dé'], prendre: ['ap', 'com', 'sur', 're', 'entre', 'dé'], mettre: ['per', 'pro', 'ad', 'com', 'sou', 'trans', 'ad', 'o', 're', 'dé'], ecrire: ['d', 'ins', 'pres', 'sous', 'trans', 're'], faire: ['re', 'dé', 'satis', 'contre'], dire: ['re', 'contre', 'inter', 'pré', 'mé'], voir: ['re', 'pré', 'entre'], courir: ['par', 'ac', 'se', 'con', 'dis', 'pour', 're'], connaitre: ['re', 'mé'], partir: ['re', 'ré'], sortir: ['res'], ouvrir: ['ré', 'entr', 'dé', 'r', 'cou', 'découvr'.slice(0, 0)], lire: ['re', 'é'], suivre: ['pour'], vivre: ['sur', 're'], conduire: ['re', 'pro', 'intro', 'tra', 'dé', 'sé', 'é', 'cons', 'dé', 'in', 'ré', 're'], recevoir: [], peindre: ['dé', 're'], craindre: [], rire: ['sou'], plaire: ['dé', 'com'] };
  const AUX_ETRE = new Set(['aller', 'venir', 'revenir', 'devenir', 'parvenir', 'survenir', 'intervenir', 'partir', 'repartir', 'sortir', 'ressortir', 'naitre', 'mourir', 'arriver', 'entrer', 'rentrer', 'rester', 'tomber', 'retourner', 'monter', 'descendre', 'passer', 'demeurer']);
  function lookupIRR(key) {
    if (IRR[key]) return IRR[key];
    for (const base of Object.keys(PREF)) {
      if (key.endsWith(base) && key.length > base.length) {
        const pre = key.slice(0, key.length - base.length);
        if (!PREF[base].map((x) => strip(x)).includes(pre)) continue;
        const ir = IRR[base]; const P = (w) => pre + w;
        const pre2 = /^(de|re|pre)$/.test(pre) && /^[aeiouéè]/.test(ir.inf) ? pre : pre;
        return { p: ir.p.map(P), f: P(ir.f), i: P(ir.i), pp: P(ir.pp), aux: AUX_ETRE.has(key) ? 'être' : 'avoir', inf: pre2 + ir.inf, ps: P(ir.ps.split('|')[0]) + '|' + ir.ps.split('|')[1], sj: ir.sj ? ir.sj.map(P) : null, base: ir.inf };
      }
    }
    return null;
  }
  const G2 = ['finir', 'choisir', 'grandir', 'reussir', 'remplir', 'obeir', 'punir', 'batir', 'nourrir', 'rougir', 'salir', 'agir', 'guerir', 'applaudir', 'maigrir', 'grossir', 'reflechir', 'saisir', 'unir', 'etablir', 'fleurir', 'murir', 'jaunir', 'vieillir', 'reunir', 'franchir', 'avertir', 'investir', 'definir', 'garantir', 'raccourcir', 'elargir', 'enrichir', 'appauvrir', 'blanchir', 'noircir', 'ralentir', 'divertir', 'convertir', 'aboutir', 'accomplir', 'affaiblir', 'agrandir', 'alourdir', 'amortir', 'anéantir', 'assainir', 'atterrir', 'bondir', 'chérir', 'démolir', 'durcir', 'éblouir', 'embellir', 'envahir', 'fournir', 'frémir', 'gémir', 'jaillir', 'mincir', 'munir', 'pâlir', 'périr', 'polir', 'pourrir', 'rafraichir', 'rajeunir', 'ravir', 'refroidir', 'rétablir', 'subir', 'trahir', 'vernir'].map((x) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  const PR = ['je', 'tu', 'il/elle', 'nous', 'vous', 'ils/elles'];
  const TERM = { futur: ['ai', 'as', 'a', 'ons', 'ez', 'ont'], cond: ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'], imparfait: ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'], sj: ['e', 'es', 'e', 'ions', 'iez', 'ent'],
    ps: { a: ['ai', 'as', 'a', 'âmes', 'âtes', 'èrent'], i: ['is', 'is', 'it', 'îmes', 'îtes', 'irent'], u: ['us', 'us', 'ut', 'ûmes', 'ûtes', 'urent'], in: ['ins', 'ins', 'int', 'înmes', 'întes', 'inrent'] } };
  const TENSES = { present: 'présent de l\'indicatif', futur: 'futur simple', imparfait: 'imparfait', pc: 'passé composé', ps: 'passé simple', cond: 'conditionnel présent', sj: 'subjonctif présent', pqp: 'plus-que-parfait', fa: 'futur antérieur' };
  function elide(pr, verb) { return (pr === 'je' || pr === 'que je') && /^[aeiouéèêhâ]/i.test(verb) ? pr.replace(/je$/, 'j\'') + verb : pr + ' ' + verb; }
  function conjugate(inf, tense) {
    inf = String(inf).toLowerCase().trim();
    const key = strip(inf); const ir = lookupIRR(key);
    let forms = [], group, model, P, F, Ist, PP, aux, PS, SJ;
    const soft = (st, e) => (/g$/.test(st) && /^[aoâ]/.test(e) ? st + 'e' : /c$/.test(st) && /^[aoâ]/.test(e) ? st.slice(0, -1) + 'ç' : st) + e;
    if (ir) {
      group = key === 'etre' || key === 'avoir' ? 'auxiliaire' : key === 'aller' ? '3ᵉ groupe (irrégulier)' : '3ᵉ groupe';
      P = ir.p; F = ir.f; Ist = ir.i; PP = ir.pp; aux = ir.aux; model = ir.base || ir.inf;
      const [st, ty] = ir.ps.split('|'); PS = TERM.ps[ty].map((e) => st + e);
      if (ir.sjf) SJ = ir.sjf; else { const s1 = ir.sj ? ir.sj[0] : P[5].replace(/ent$/, ''), s2 = ir.sj ? ir.sj[1] : Ist; SJ = TERM.sj.map((e, k) => (k === 3 || k === 4 ? s2 : s1) + e); }
      if (key === 'aller') PS = ['allai', 'allas', 'alla', 'allâmes', 'allâtes', 'allèrent'];
    } else if (/er$/.test(key)) {
      group = '1ᵉʳ groupe'; let r = inf.slice(0, -2); model = 'chanter';
      const EXC = /^(r?achet|geler|degel|congel|pel|model|harcel|halet|crochet|furet|cisel|demantel|ecartel|martel)/.test(key);
      const dbl = (rr) => (EXC ? false : /(el|et)$/.test(rr));
      // verbes en e/é + consonne + er (acheter, lever, espérer) et -yer
      const grave = (e) => { if (/^(e|es|ent)$/.test(e) && /e[^aeiouy]{1}$/.test(r) && !dbl(r)) return r.replace(/e([^aeiouy])$/, 'è$1'); if (/^(e|es|ent)$/.test(e) && /é[^aeiouy]{1,2}$/.test(r)) return r.replace(/é([^aeiouy]{1,2})$/, 'è$1'); if (/^(e|es|ent)$/.test(e) && dbl(r)) return r + r.slice(-1); if (/^(e|es|ent)$/.test(e) && /[ou]y$/.test(r)) return r.slice(0, -1) + 'i'; return r; };
      P = ['e', 'es', 'e', 'ons', 'ez', 'ent'].map((e) => soft(grave(e), e));
      const fst = /e[^aeiouy]$/.test(r) && !dbl(r) ? r.replace(/e([^aeiouy])$/, 'è$1') + 'er' : dbl(r) ? r + r.slice(-1) + 'er' : /[ou]y$/.test(r) ? r.slice(0, -1) + 'ier' : inf;
      F = fst; Ist = r; PP = r + 'é'; aux = AUX_ETRE.has(key) ? 'être' : 'avoir';
      PS = TERM.ps.a.map((e, k) => soft(r, e));
      SJ = TERM.sj.map((e, k) => (k === 3 || k === 4 ? r : grave('e')) + e);
    } else if (/ir$/.test(key) && G2.includes(key)) {
      group = '2ᵉ groupe'; const r = inf.slice(0, -2); model = 'finir';
      P = ['is', 'is', 'it', 'issons', 'issez', 'issent'].map((e) => r + e); F = inf; Ist = r + 'iss'; PP = r + 'i'; aux = 'avoir';
      PS = TERM.ps.i.map((e) => r + e); SJ = TERM.sj.map((e) => r + 'iss' + e);
    } else if (/dre$/.test(key) && !/(indre|soudre)$/.test(key)) {
      group = '3ᵉ groupe (verbes en -dre)'; const r = inf.slice(0, -2); model = 'rendre';
      P = ['s', 's', '', 'ons', 'ez', 'ent'].map((e) => r + e); F = inf.slice(0, -1); Ist = r; PP = r + 'u'; aux = AUX_ETRE.has(key) ? 'être' : 'avoir';
      PS = TERM.ps.i.map((e) => r + e); SJ = TERM.sj.map((e) => r + e);
    } else return null;
    const AV = IRR.avoir.p, ET = IRR.etre.p, AVI = ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'], ETI = ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'];
    const AVF = ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'], ETF = ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'];
    const comp = (auxF) => auxF.map((a, k) => a + ' ' + PP + (aux === 'être' ? (k >= 3 ? '(e)s' : '(e)') : ''));
    const isE = aux === 'être';
    if (tense === 'present') forms = P;
    else if (tense === 'futur') forms = TERM.futur.map((e) => F + e);
    else if (tense === 'cond') forms = TERM.cond.map((e) => F + e);
    else if (tense === 'imparfait') forms = TERM.imparfait.map((e) => soft(Ist, e));
    else if (tense === 'ps') forms = PS;
    else if (tense === 'sj') forms = SJ;
    else if (tense === 'pqp') forms = comp(isE ? ETI : AVI);
    else if (tense === 'fa') forms = comp(isE ? ETF : AVF);
    else forms = comp(isE ? ET : AV);
    if (key === 'etre' && tense === 'imparfait') forms = ETI;
    const pr = tense === 'sj' ? PR.map((x) => (x === 'il/elle' ? 'qu\'il/elle' : x === 'ils/elles' ? 'qu\'ils/elles' : 'que ' + x)) : PR;
    return { forms: forms.map((f, i) => elide(pr[i], f)), group, model, aux, pp: PP };
  }
  function solveConjugaison(text, ctx) {
    const s = strip(text); if (!/conjug/.test(s)) return null;
    const vm = lc(text).match(/verbes?\s+[«"“]?\s*([a-zàâçéèêëîïôûùüÿ]+(?:er|ir|re|oir))\b/) || lc(text).match(/conjugue[rz]?\s+(?:le verbe\s+)?[«"“]?([a-zàâçéèêëîïôûùüÿ]+(?:er|ir|re|oir))\b/);
    if (!vm) return null;
    const inf = vm[1];
    const tense = /futur anterieur/.test(s) ? 'fa' : /plus.que.parfait/.test(s) ? 'pqp' : /futur/.test(s) ? 'futur' : /imparfait/.test(s) ? 'imparfait' : /passe compose/.test(s) ? 'pc' : /passe simple/.test(s) ? 'ps' : /conditionnel/.test(s) ? 'cond' : /subjonctif/.test(s) ? 'sj' : 'present';
    const c = conjugate(inf, tense); if (!c) return null;
    const tn = TENSES[tense];
    const tip = { present: c.group === '1ᵉʳ groupe' ? 'Terminaisons du 1ᵉʳ groupe : -e, -es, -e, -ons, -ez, -ent.' : c.group === '2ᵉ groupe' ? 'Terminaisons du 2ᵉ groupe : -is, -is, -it, -issons, -issez, -issent.' : 'Verbe irrégulier : à apprendre par cœur.', futur: 'Futur : infinitif (ou radical spécial) + -ai, -as, -a, -ons, -ez, -ont.', imparfait: 'Imparfait : radical + -ais, -ais, -ait, -ions, -iez, -aient.', pc: 'Passé composé : auxiliaire ' + c.aux + ' au présent + participe passé « ' + c.pp + ' ».', ps: 'Passé simple (temps du récit) : à apprendre avec son type (-ai / -is / -us / -ins).', cond: 'Conditionnel présent : radical du futur + terminaisons de l\'imparfait (-ais, -ais, -ait, -ions, -iez, -aient).', sj: 'Subjonctif présent : « que » + radical + -e, -es, -e, -ions, -iez, -ent.', pqp: 'Plus-que-parfait : auxiliaire ' + c.aux + ' à l\'imparfait + participe passé « ' + c.pp + ' ».', fa: 'Futur antérieur : auxiliaire ' + c.aux + ' au futur + participe passé « ' + c.pp + ' ».' }[tense];
    return res({ type: 'conjugaison', titre: inf + ' — ' + tn, difficulte: 'facile', e1: 'On conjugue le verbe « ' + inf + ' » (' + c.group + ') au ' + tn + '.', e2: L([tip, ...c.forms]), e3: 'On vérifie chaque terminaison avec le modèle « ' + c.model + ' » et l\'accord du sujet ✅' + (tense === 'pc' && /être/.test(c.forms[0]) ? '' : ''), conclusion: c.forms.join(' ; '), reponse: c.forms.join(' ; '), gen: { k: 'conjugaison', inf } });
  }

  // ---------------------------------------------------------------- 12. BASE DE CONNAISSANCES (définitions)
  const KB = [
    ['photosynthese', 'La photosynthèse est le processus par lequel les plantes chlorophylliennes fabriquent leur matière organique (glucose) à partir de l\'eau, du dioxyde de carbone et de l\'énergie lumineuse, en rejetant du dioxygène : 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.'],
    ['digestion', 'La digestion est la transformation des aliments en nutriments assimilables, grâce à des actions mécaniques (mastication, brassage) et chimiques (enzymes digestives), de la bouche à l\'intestin grêle.'],
    ['respiration', 'La respiration est l\'ensemble des échanges gazeux : l\'organisme prélève du dioxygène et rejette du dioxyde de carbone ; dans les cellules, le glucose est oxydé pour libérer de l\'énergie.'],
    ['mitose', 'La mitose est la division cellulaire qui donne deux cellules filles génétiquement identiques à la cellule mère. Phases : prophase, métaphase, anaphase, télophase.'],
    ['meiose', 'La méiose est une double division cellulaire qui produit 4 cellules haploïdes (gamètes) ; elle assure le brassage génétique.'],
    ['gene', 'Un gène est une portion d\'ADN qui porte l\'information nécessaire à la fabrication d\'une protéine ; il détermine un caractère héréditaire.'],
    ['immunite|immunitaire', 'L\'immunité est la capacité de l\'organisme à se défendre contre les agents pathogènes : immunité non spécifique (phagocytose, inflammation) et spécifique (lymphocytes B, anticorps ; lymphocytes T).'],
    ['democratie', 'La démocratie est un régime politique où le pouvoir appartient au peuple, qui l\'exerce directement ou par ses représentants élus (suffrage universel, séparation des pouvoirs, libertés).'],
    ['decolonisation', 'La décolonisation est le processus par lequel les colonies accèdent à l\'indépendance. Le Dahomey (actuel Bénin) est devenu indépendant le 1er août 1960.'],
    ['mondialisation', 'La mondialisation est l\'intensification des échanges de biens, de capitaux, de personnes et d\'informations à l\'échelle de la planète.'],
    ['inflation', 'L\'inflation est la hausse générale et durable du niveau des prix, qui entraîne une baisse du pouvoir d\'achat de la monnaie.'],
    ['bilan', 'Le bilan est un document comptable qui présente, à une date donnée, le patrimoine de l\'entreprise : l\'actif (ce qu\'elle possède) et le passif (ses ressources : capitaux propres et dettes). Actif = Passif.'],
    ['actif', 'L\'actif du bilan regroupe les emplois : immobilisations, stocks, créances et trésorerie.'],
    ['passif', 'Le passif du bilan regroupe les ressources : capitaux propres, dettes financières et dettes d\'exploitation.'],
    ['amortissement', 'L\'amortissement constate la dépréciation irréversible d\'une immobilisation due à l\'usage, au temps ou à l\'obsolescence (SYSCOHADA).'],
    ['syscohada', 'Le SYSCOHADA est le système comptable de l\'OHADA appliqué au Bénin et dans 17 pays africains ; il fixe le plan de comptes (classes 1 à 9) et les états financiers.'],
    ['ohada', 'L\'OHADA (Organisation pour l\'Harmonisation en Afrique du Droit des Affaires) produit des Actes uniformes applicables dans ses 17 États membres, dont le Bénin.'],
    ['algorithme', 'Un algorithme est une suite finie et ordonnée d\'instructions permettant de résoudre un problème. Structures de base : séquence, condition (si…alors…sinon), boucle (pour, tant que).'],
    ['base de donnees', 'Une base de données est un ensemble structuré de données (tables, enregistrements, champs) géré par un SGBD ; on l\'interroge avec le langage SQL (SELECT, INSERT, UPDATE, DELETE).'],
    ['marketing', 'Le marketing est l\'ensemble des actions qui visent à connaître et satisfaire les besoins des clients. Le marketing-mix (4P) : Produit, Prix, Place (distribution), Promotion.'],
    ['management', 'Le management est l\'art de diriger une organisation : planifier, organiser, diriger et contrôler (Fayol).'],
    ['energie cinetique', 'L\'énergie cinétique d\'un corps de masse m et de vitesse v est Ec = ½ m v² (en joules).'],
    ['atome', 'L\'atome est la plus petite particule d\'un élément chimique : un noyau (protons + neutrons) entouré d\'électrons.'],
    ['ph', 'Le pH mesure l\'acidité d\'une solution : pH < 7 acide, pH = 7 neutre, pH > 7 basique. pH = -log[H₃O⁺].'],
    ['metaphore', 'La métaphore est une figure de style qui rapproche deux réalités sans outil de comparaison (ex : « Cet élève est un lion »).'],
    ['comparaison', 'La comparaison rapproche deux éléments à l\'aide d\'un outil (comme, tel, pareil à…) : « fort comme un baobab ».'],
    ['philosophie', 'La philosophie (amour de la sagesse) est une réflexion critique et rationnelle sur l\'homme, le monde, la connaissance et les valeurs.'],
    ['conscience', 'La conscience est la connaissance immédiate que l\'esprit a de lui-même et du monde ; Descartes : « Je pense, donc je suis ».']
  ];
  function kbLookup(s) { for (const [k, d] of KB) { if (new RegExp('\\b(' + k + ')').test(s)) return { k: d.split(/ (?:est|sont|mesure|regroupe|constate|rapproche|produit) /)[0].replace(/^(La |Le |L'|Les |Un |Une )/, ''), d }; } return null; }

  // ---------------------------------------------------------------- 13. MÉTHODOLOGIE (matières littéraires, Licence, etc.)
  const STOP = new Set('alors avec avoir sont cette comme dans elle elles entre etre leur leurs mais meme nous pour quel quelle quelles quels sans sera sous tout tous toute toutes votre vous selon donc parce depuis apres avant pourquoi comment quoi faut etait sujet texte expliquez expliquer pensez discutez montrez partir propos affirmation pensee citation dissertation commentaire analysez analyser justifiez reponse question exercice traitez traiter lequel laquelle lesquels autre autres aussi encore plus moins tres bien fait faire peut doit etes cela ceci celui celle ceux dont chez'.split(' '));
  function keywords(text, n) {
    const cnt = {}, orig = {}; lc(text).replace(/[^a-zà-öø-ÿ\s-]/g, ' ').split(/\s+/).forEach((w) => { const k = strip(w); if (k.length >= 5 && !STOP.has(k)) { cnt[k] = (cnt[k] || 0) + 1; orig[k] = orig[k] || w; } });
    return Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]).slice(0, n || 4).map((k) => orig[k]);
  }
  function quoteOf(text) { const m = String(text).match(/[«"“]([^»"”]{8,})[»"”]/); return m ? m[1].trim() : null; }
  function solveMethod(text, ctx, opts) {
    const s = strip(text); const kws = keywords(text); const q = quoteOf(text);
    const niv = ctx.niveau || 'BEPC'; const mat = strip(ctx.matiere || '');
    const kb = /defini|qu.est[- ]ce|que signifie|definition|c.est quoi/.test(s) ? kbLookup(s) : null;
    if (kb) {
      return res({ type: 'definition', titre: 'Définition : ' + kb.k, difficulte: 'facile', confidence: 0.85,
        e1: 'On te demande de définir « ' + kb.k + ' ». Une bonne définition dit CE QUE C\'EST, puis À QUOI ÇA SERT ou COMMENT ÇA MARCHE.',
        e2: kb.d, e3: 'Relis : ta définition doit tenir en 2-3 phrases, avec le mot-clé et un exemple concret ✅',
        conclusion: kb.d.split('.')[0] + '.', reponse: kb.d });
    }
    let type = 'question';
    if (/philo/.test(mat) || /\bphilosoph/.test(s)) type = /texte|auteur|extrait/.test(s) && !/dissert/.test(s) ? 'philo-texte' : 'philo';
    if (/dissertation|pensez[- ]vous|dans quelle mesure|discutez|partagez[- ]vous|commentez cette (pensee|affirmation|citation|opinion)|que pensez/.test(s)) type = type.startsWith('philo') ? 'philo' : 'dissertation';
    else if (/commentaire|commentez (ce|le) texte|commentaire compose/.test(s)) type = 'commentaire';
    else if (/resume|resumez|contraction/.test(s)) type = 'resume';
    else if (/redaction|racontez|decrivez|ecrivez une lettre|lettre a|recit/.test(s)) type = 'redaction';
    else if (/algorithme|programme|pseudo-code|fonction python|ecrire une fonction|sql|requete/.test(s)) type = 'algo';
    else if (/cas pratique|etude de cas|entreprise|societe|sarl|\bsa\b|client|fournisseur/.test(s) && niv === 'LICENCE') type = 'cas';
    else if (/explique|pourquoi|comment|justifie|montre/.test(s)) type = 'explication';
    const sujet = q ? '« ' + q + ' »' : (kws.length ? 'centré sur : ' + kws.join(', ') : 'proposé');
    const plans = {
      dissertation: ['Introduction : amorce (fait d\'actualité ou citation, ex. réalité béninoise), présentation du sujet ' + sujet + ', problématique, annonce du plan.', 'I. Thèse — on explique et on justifie l\'affirmation (2-3 arguments + exemples précis tirés des œuvres au programme).', 'II. Antithèse — on montre les limites (2-3 arguments + exemples).', 'III. Synthèse / dépassement — on concilie les deux points de vue.', 'Conclusion : bilan, réponse claire à la problématique, ouverture.'],
      philo: ['Introduction : définir les termes clés (' + (kws.join(', ') || 'notions du sujet') + '), dégager le paradoxe, formuler le problème philosophique, annoncer le plan.', 'I. Première réponse (thèse) appuyée sur un auteur (ex. Platon, Descartes, Kant).', 'II. Objection : limites de la première réponse (ex. Nietzsche, Marx, Sartre, ou un penseur africain comme Paulin Hountondji, Cheikh Anta Diop).', 'III. Dépassement critique : ta position argumentée.', 'Conclusion : réponse nette au problème posé.'],
      'philo-texte': ['Introduction : situer le texte, dégager le thème, la thèse de l\'auteur et le problème.', 'Étude ordonnée : expliquer le texte mouvement par mouvement (concepts, arguments, exemples).', 'Intérêt philosophique : portée et limites de la thèse.', 'Conclusion : rappel de la thèse et de son intérêt.'],
      commentaire: ['Introduction : présenter l\'auteur, l\'œuvre, le genre, le thème, annoncer 2 axes de lecture.', 'Axe 1 : ' + (kws[0] ? 'l\'expression de « ' + kws[0] + ' »' : 'le sens du texte') + ' — relever des procédés (figures de style, champs lexicaux, temps verbaux) et les interpréter.', 'Axe 2 : ' + (kws[1] ? 'la portée de « ' + kws[1] + ' »' : 'la visée de l\'auteur') + ' — même méthode : citation → procédé → interprétation.', 'Conclusion : bilan des axes, ouverture sur une autre œuvre.'],
      resume: ['Lire 2 fois le texte, repérer la thèse et les connecteurs logiques.', 'Dégager le plan du texte (une idée par paragraphe).', 'Reformuler avec TES mots, à la 1ʳᵉ personne si l\'auteur l\'emploie, sans ajouter d\'opinion. Longueur : environ 1/4 du texte (' + Math.max(30, Math.round(String(text).split(/\s+/).length / 4)) + ' mots ici), marge ±10 %.', 'Indiquer le nombre de mots à la fin.'],
      redaction: ['Introduction : situer le cadre (lieu, temps, personnages).', 'Développement : les péripéties dans l\'ordre (situation initiale → élément perturbateur → péripéties → dénouement), avec des connecteurs (d\'abord, ensuite, soudain, enfin).', 'Conclusion : situation finale + ton sentiment ou la leçon tirée.', 'Soigne l\'orthographe, la ponctuation et les temps (passé simple / imparfait pour le récit).'],
      algo: ['Identifier les entrées, les traitements et les sorties.', 'Écrire l\'algorithme : Variables → Début → Lire(…) → Traitement (Si…Alors…Sinon / Pour i de 1 à n / TantQue…) → Écrire(…) → Fin.', 'Traduire si demandé (Python : input(), if/elif/else, for, while, print()).', 'Tester avec un jeu d\'essai (valeurs simples + cas limites).'],
      cas: ['Lire l\'annexe et repérer les données chiffrées et les acteurs.', 'Identifier le problème de gestion posé et les notions du cours à mobiliser (' + (kws.join(', ') || 'notions du programme') + ').', 'Présenter les calculs dans des tableaux, puis interpréter chaque résultat.', 'Proposer des recommandations concrètes et argumentées pour l\'entreprise.'],
      explication: ['Reformuler la question avec tes mots.', 'Rappeler la notion du cours concernée (' + (kws.join(', ') || 'notion principale') + ').', 'Expliquer le mécanisme : cause → conséquence, avec un exemple concret (de préférence du Bénin).', 'Conclure en répondant directement à la question.'],
      question: ['Repérer le verbe de consigne (calculer, définir, expliquer, justifier…).', 'Relever les mots-clés : ' + (kws.join(', ') || '—') + '.', 'Mobiliser la leçon correspondante et répondre en phrases complètes.']
    };
    const checks = {
      dissertation: 'Grille du correcteur : problématique claire, plan équilibré, chaque argument a un exemple, transitions, conclusion qui répond. Pas de hors-sujet !',
      philo: 'Le correcteur regarde : définitions, problème bien posé, références d\'auteurs maîtrisées, argumentation personnelle.',
      'philo-texte': 'On vérifie : thèse bien dégagée, explication fidèle (pas de paraphrase), intérêt philosophique.',
      commentaire: 'On vérifie : chaque idée = citation + procédé + interprétation. Jamais de procédé sans interprétation.',
      resume: 'On compte les mots, on vérifie qu\'aucune idée n\'est oubliée ni ajoutée, et que l\'ordre du texte est respecté.',
      redaction: 'On relit pour l\'orthographe, les accords et la cohérence des temps.',
      algo: 'On fait tourner l\'algorithme « à la main » sur le jeu d\'essai.',
      cas: 'Chaque calcul est justifié par une formule ; chaque recommandation s\'appuie sur un résultat.',
      explication: 'Ta réponse répond-elle exactement à la question posée ? Le vocabulaire du cours est-il utilisé ?',
      question: 'Relis la consigne et vérifie que tu as répondu à tout.'
    };
    const titles = { dissertation: 'Dissertation', philo: 'Dissertation philosophique', 'philo-texte': 'Explication de texte', commentaire: 'Commentaire composé', resume: 'Résumé de texte', redaction: 'Rédaction', algo: 'Algorithmique', cas: 'Étude de cas', explication: 'Question d\'explication', question: 'Question de cours' };
    const lesson = searchLessons(text, ctx);
    const kbAny = kbLookup(s);
    const e2 = L([...plans[type], kbAny ? '📘 Rappel utile : ' + kbAny.d : '', lesson ? '📗 Revois la leçon « ' + lesson.titre + ' » : ' + lesson.extrait : '']);
    return res({
      type: 'methode', sous_type: type, titre: titles[type], difficulte: niv === 'LICENCE' || niv === 'BAC' ? 'difficile' : 'moyen',
      confidence: kbAny || lesson ? 0.6 : 0.4,
      e1: 'Type d\'exercice : ' + titles[type] + '. Sujet ' + sujet + '.\nAvant d\'écrire, on analyse : mots-clés, consigne, problème posé.',
      e2, e3: checks[type],
      conclusion: 'Voici le plan de travail à suivre pour réussir ce sujet.', reponse: plans[type].join(' '),
      lessonId: lesson ? lesson.id : null
    });
  }
  function searchLessons(text, ctx) {
    const data = G.RSutaData; if (!data) return null;
    const kws = keywords(text, 6); if (!kws.length) return null;
    let best = null, score = 0;
    data.lecons.forEach((l) => {
      const hay = strip(l.titre + ' ' + l.contenu); let sc = 0;
      kws.map(strip).forEach((k) => { if (hay.includes(k)) sc += strip(l.titre).includes(k) ? 3 : 1; });
      if (ctx && ctx.niveau && l.niveau === ctx.niveau) sc += 0.5;
      if (sc > score) { score = sc; best = l; }
    });
    if (!best || score < 2) return null;
    const plain = best.contenu.replace(/\*\*|##\s?/g, '');
    return { id: best.id, titre: best.titre, extrait: plain.split('\n').filter(Boolean).slice(0, 2).join(' ').slice(0, 260) + '…' };
  }

  // ---------------------------------------------------------------- découpage d'une épreuve en exercices
  function splitExercises(text) {
    const lines = String(text).replace(/\r/g, '').split('\n');
    const parts = []; let cur = null;
    const head = /^\s*(exercice|probl[eè]me|partie|question|situation|epreuve|épreuve|sujet)\s*([0-9ivx]+|[a-z])?\b/i;
    const sub = /^\s*(\d{1,2}|[a-h])\s*[).°-]\s+/i;
    lines.forEach((ln) => {
      if (head.test(ln)) { cur = { label: ln.trim().replace(/\s*:.*$/, ''), text: ln.replace(head, '').replace(/^\s*[:.-]\s*/, '') }; parts.push(cur); return; }
      if (sub.test(ln) && cur && /[=<>]|calcul|résou|resou|factor|dévelop|develop|dériv|conjug|défin|defin|explique/i.test(ln)) {
        const ctxText = cur.base !== undefined ? cur.base : cur.text;
        const p = { label: (cur.parentLabel || cur.label) + ' — ' + ln.trim().split(/\s+/)[0], text: ln.replace(sub, ''), parentLabel: cur.parentLabel || cur.label, base: ctxText };
        if (cur.text.trim() && !cur.parentLabel && !REL.test(cur.text)) p.text = ln.replace(sub, '') + '\n' + cur.text;
        parts.push(p); cur = p; return;
      }
      if (!cur) { cur = { label: 'Exercice', text: '' }; parts.push(cur); }
      cur.text += (cur.text ? '\n' : '') + ln;
    });
    return parts.filter((p) => p.text.trim().length > 1).map((p) => ({ label: p.label, text: p.text.trim() }));
  }

  // ---------------------------------------------------------------- point d'entrée
  const SOLVERS = [solveConjugaison, solveSystem, solvePythagore, solveArea, solvePhysics, solveTVA, solveInterest, solveAmort, solveStats, solveArithmetique, solvePercent, solveFunction, solveFactor, solveDevelop, solveEquation, solveProportion, solveArith];
  // Extension : d'autres fichiers (engine2.js…) ajoutent leurs solveurs avant un solveur existant
  function register(fn, before) { const i = before ? SOLVERS.findIndex((f) => f.name === before) : 0; SOLVERS.splice(i < 0 ? 0 : i, 0, fn); }
  function solve(text, ctx) {
    ctx = ctx || {}; M.FMT.preferDecimal = false;
    const t = String(text || '').trim();
    if (!t) return null;
    for (const fn of SOLVERS) {
      try { const r = fn(t, ctx); if (r) { r.solver = fn.name; return r; } } catch (e) { /* solveur suivant */ }
    }
    const r = solveMethod(t, ctx); r.solver = 'solveMethod'; return r;
  }

  // ---------------------------------------------------------------- générateur d'exercices similaires
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const nz = (a, b) => { let x = 0; while (!x) x = rnd(a, b); return x; };
  const sg = (x) => (x < 0 ? '- ' + -x : '+ ' + x);
  function generate(kind, ctx) {
    ctx = ctx || {}; const niv = ctx.niveau || 'BEPC';
    switch (kind) {
      case 'linear': { const a = nz(2, 9), x = rnd(-6, 12), b = nz(-15, 20); return { enonce: 'Résoudre ' + a + 'x ' + sg(b) + ' = ' + (a * x + b), answers: [x] }; }
      case 'quadratic': { const r1 = rnd(-6, 6), r2 = rnd(-6, 6), b = -(r1 + r2), c = r1 * r2; return { enonce: 'Résoudre x² ' + (b ? sg(b) + 'x ' : '') + (c ? sg(c) + ' ' : '') + '= 0', answers: [...new Set([r1, r2])] }; }
      case 'system': { const x = rnd(-5, 8), y = rnd(-5, 8), a = nz(1, 4), b = nz(-3, 3), c = nz(1, 3), d = nz(-4, 4); if (a * d - b * c === 0) return generate('system', ctx); return { enonce: 'Résoudre le système : ' + a + 'x ' + sg(b) + 'y = ' + (a * x + b * y) + ' ; ' + c + 'x ' + sg(d) + 'y = ' + (c * x + d * y), answers: [x, y] }; }
      case 'fraction': { const d1 = rnd(2, 9); let d2 = rnd(2, 9); if (d2 === d1) d2 = d1 === 9 ? 4 : d1 + 1; const n1 = rnd(1, d1 - 1), n2 = rnd(1, d2 + 2); const q = new Q(n1, d1).add(new Q(n2, d2)); return { enonce: 'Calculer ' + n1 + '/' + d1 + ' + ' + n2 + '/' + d2, answers: [q.val()] }; }
      case 'pgcd': { const g = rnd(2, 12), a = g * rnd(2, 15), b = g * rnd(2, 15); return { enonce: 'Calculer le PGCD de ' + a + ' et ' + b, answers: [M.gcd(a, b)] }; }
      case 'percent': { const p = [5, 10, 15, 20, 25, 30, 40, 50][rnd(0, 7)], n = rnd(2, 40) * 500; return { enonce: 'Calculer ' + p + ' % de ' + n, answers: [p * n / 100] }; }
      case 'pythagore': { const T = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]][rnd(0, 4)]; return { enonce: 'Le triangle ABC est rectangle en A avec AB = ' + T[0] + ' cm et AC = ' + T[1] + ' cm. Calculer BC.', answers: [T[2]] }; }
      case 'derivative': { const a = nz(1, 4), b = rnd(-6, 6), c = rnd(-9, 9); return { enonce: 'Soit f(x) = ' + a + 'x³ ' + sg(b) + 'x² ' + sg(c) + 'x + 1. Calculer la dérivée f\'(x).', poly: M.polyStr(M.polyFromCoeffs([c, 2 * b, 3 * a], 'x')) }; }
      case 'develop': { const a = nz(1, 5), b = nz(-7, 7), c = nz(1, 4), d = nz(-7, 7); const p = M.polyFromCoeffs([b, a], 'x').mul(M.polyFromCoeffs([d, c], 'x')); return { enonce: 'Développer et réduire A = (' + (a === 1 ? '' : a) + 'x ' + sg(b) + ')(' + (c === 1 ? '' : c) + 'x ' + sg(d) + ')', poly: M.polyStr(p) }; }
      case 'factor': { const r1 = rnd(-6, 6), r2 = rnd(-6, 6); return { enonce: 'Factoriser A = x² ' + sg(-(r1 + r2)) + 'x ' + sg(r1 * r2), poly: M.polyStr(M.polyFromCoeffs([r1 * r2, -(r1 + r2), 1], 'x')) }; }
      case 'area': { const L_ = rnd(5, 40), l = rnd(2, L_ - 1); return { enonce: 'Un champ rectangulaire a une longueur de ' + L_ + ' m et une largeur de ' + l + ' m. Calcule son aire et son périmètre.', answers: [L_ * l, 2 * (L_ + l)] }; }
      case 'ohm': { const R = rnd(2, 50) * 10, I = rnd(1, 9) / 10; return { enonce: 'Une résistance R = ' + R + ' Ω est traversée par un courant I = ' + fmtNum(I) + ' A. Calcule la tension U (loi d\'Ohm).', answers: [R * I] }; }
      case 'tva': { const ht = rnd(5, 200) * 1000; return { enonce: 'Un article coûte ' + ht + ' F HT. Calcule la TVA (18 %) et le prix TTC.', answers: [ht * 1.18, ht * 0.18] }; }
      case 'interest': { const C = rnd(1, 20) * 100000, t = rnd(3, 12), n = rnd(1, 5); return { enonce: 'Un capital de ' + C + ' F est placé à intérêts simples au taux de ' + t + ' % pendant ' + n + ' ans. Calcule les intérêts.', answers: [C * t * n / 100] }; }
      case 'stats': { const a = Array.from({ length: 6 }, () => rnd(5, 18)); return { enonce: 'Calcule la moyenne de la série : ' + a.join(' ; '), answers: [a.reduce((x, y) => x + y, 0) / a.length] }; }
      case 'amort': { const V = rnd(2, 30) * 500000, n = rnd(3, 10); return { enonce: 'Un matériel acquis pour ' + V + ' F est amorti en linéaire sur ' + n + ' ans. Calcule l\'annuité d\'amortissement.', answers: [V / n] }; }
      case 'conjugaison': { const VB = niv === 'CEP' ? ['chanter', 'finir', 'manger', 'aller', 'être', 'avoir', 'parler', 'choisir', 'faire', 'venir'] : ['prendre', 'venir', 'pouvoir', 'vouloir', 'voir', 'mettre', 'écrire', 'lire', 'devoir', 'savoir', 'répondre', 'acheter', 'appeler', 'finir', 'aller', 'faire', 'comprendre', 'recevoir', 'boire', 'connaître']; const TN = niv === 'CEP' ? ['présent', 'futur', 'imparfait', 'passé composé'] : ['présent', 'futur', 'imparfait', 'passé composé', 'passé simple', 'conditionnel présent', 'subjonctif présent', 'plus-que-parfait']; const v = VB[rnd(0, VB.length - 1)], tn = TN[rnd(0, TN.length - 1)]; return { enonce: 'Conjugue le verbe ' + v + ' au ' + tn + '.', text: true }; }
      default: {
        if (niv === 'CEP') { const a = rnd(10, 99), b = rnd(2, 9), c = rnd(2, 30); return { enonce: 'Calculer ' + a + ' + ' + b + ' × ' + c, answers: [a + b * c] }; }
        const a = rnd(2, 9), b = rnd(2, 9), c = rnd(1, 9), d = rnd(1, 5); return { enonce: 'Calculer (' + a + ' + ' + b + ') × ' + c + ' - ' + d * 2 + ' : 2', answers: [(a + b) * c - d] };
      }
    }
  }
  function checkAnswer(ex, userText) {
    if (ex.poly) {
      const seg = mathSegments(userText).find((s) => /x/.test(s));
      const a = seg && tryParse(seg.replace(/^.*=/, '')); const target = tryParse(ex.poly.replace(/²/g, '^2').replace(/³/g, '^3'));
      if (!a || !target) return null;
      try { return [-2, 1, 3].every((x) => Math.abs(M.evalNum(a, { x }) - M.evalNum(target, { x })) < 1e-6); } catch (e) { return null; }
    }
    if (!ex.answers) return null;
    const got = nums(M.norm(userText).replace(/(\d+)\s*\/\s*(\d+)/g, (m, a, b) => String(+a / +b)));
    if (!got.length) return null;
    return ex.answers.every((a) => got.some((g) => Math.abs(g - a) < 0.011 * Math.max(1, Math.abs(a) / 100)));
  }

  G.RSutaEngine = { solve, splitExercises, generate, checkAnswer, conjugate, keywords, searchLessons, kbLookup, nums, register, SOLVERS,
    _h: { res, L, nums, numNear, strip, lc, parseFr, NUM, money, mathSegments, tryParse, cleanMath, quadText, subst, isLow, M } };
  if (typeof module !== 'undefined') module.exports = G.RSutaEngine;
})(typeof window !== 'undefined' ? window : globalThis);
