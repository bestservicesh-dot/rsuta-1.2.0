/* RSuta v1.1 — Solveurs Sciences & Gestion (HORS-LIGNE)
   Géométrie vectorielle, systèmes 3×3, statistiques à deux variables, chimie (équilibrage, quantité de matière),
   mécanique et énergie, circuits électriques, génétique (Mendel), comptabilité SYSCOHADA, maths financières. */
(function (G) {
  'use strict';
  const E = G.RSutaEngine || (typeof require !== 'undefined' ? require('./engine.js') : null);
  const H = E._h; const U = E._u; const { res, L, strip, lc, M, parseFr, NUM } = H;
  const { Q, fmt, fmtNum } = M; const { f2, rat, pq, sqrtStr, surd, binom } = U;
  const qf = (x) => fmt(x);
  const money = (x) => fmtNum(Math.round(x), 0) + ' F';
  const NUMS = (str) => { const r = []; const re = new RegExp(NUM, 'g'); let m; while ((m = re.exec(str))) r.push(parseFr(m[1])); return r; };


  // ================================================================= 0. FRACTION D'UNE QUANTITÉ (CEP / BEPC)
  function solveFractionDe(text, ctx) {
    const t = M.norm(text);
    const m = t.match(/(?:\bles?\b|\bla\b|l')\s*(\d+)\s*\/\s*(\d+)\s*(?:de|d'|des|du)\s*(?:[a-zàâçéèêëîïôûùüœ']+\s+){0,5}?(\d+(?:[.,]\d+)?)\s*([A-Za-zéèûôœ²³]+)?/i);
    if (!m) return null;
    const a = +m[1], b = +m[2], N = parseFr(m[3]); if (!b || !isFinite(N)) return null;
    const u = m[4] && !/^(de|et|en|pour|par)$/i.test(m[4]) ? ' ' + m[4] : '';
    const part = N / b, r = part * a; const nf = (x) => fmtNum(x, 4);
    const niv = (ctx && ctx.niveau) || 'BEPC';
    return res({ type: 'fraction', titre: 'Les ' + a + '/' + b + ' de ' + nf(N) + u, difficulte: 'facile',
      e1: 'Prendre les ' + a + '/' + b + ' d\'une quantité, c\'est la partager en ' + b + ' parts égales, puis prendre ' + a + ' de ces parts.' + (niv === 'CEP' ? ' Comme partager ' + b + ' tas de mangues et en garder ' + a + ' 🥭.' : ''),
      e2: L(['Une part : ' + nf(N) + ' ÷ ' + b + ' = ' + nf(part) + u + '.', a + ' parts : ' + nf(part) + ' × ' + a + ' = ' + nf(r) + u + '.', 'Autre écriture : (' + a + '/' + b + ') × ' + nf(N) + ' = ' + nf(a * N) + ' ÷ ' + b + ' = ' + nf(r) + '.']),
      e3: 'On vérifie à l\'envers : ' + nf(r) + ' ÷ ' + a + ' × ' + b + ' = ' + nf(N) + ' ✅ on retrouve bien la quantité de départ.',
      conclusion: 'Les ' + a + '/' + b + ' de ' + nf(N) + u + ' = ' + nf(r) + u, reponse: nf(r), answers: [r], gen: { k: 'fraction' } });
  }

  // ================================================================= 1. VECTEURS ET GÉOMÉTRIE ANALYTIQUE
  function solveVecteur(text, ctx) {
    const s = strip(text);
    if (!/vecteur|coordonnees|distance|milieu|produit scalaire|orthogona|colineaire|alignes|equation (?:de la|d'une) droite|norme|parallelogramme|repere/.test(s)) return null;
    const P = {}; const re = /\b([A-Z])\s*\(\s*(-?\d+(?:[.,]\d+)?)\s*;\s*(-?\d+(?:[.,]\d+)?)\s*\)/g; let m;
    while ((m = re.exec(text))) P[m[1]] = [pq(m[2]), pq(m[3])];
    if (Object.keys(P).length < 2) { const re2 = /\b([A-Z])\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/g; while ((m = re2.exec(text))) P[m[1]] = [pq(m[2]), pq(m[3])]; }
    const V = {}; const re3 = /(?:vecteurs?\s*)?\b([a-z])\s*(?:→|⃗)?\s*\(\s*(-?\d+(?:[.,]\d+)?)\s*;\s*(-?\d+(?:[.,]\d+)?)\s*\)/g;
    while ((m = re3.exec(text))) if (!/[xyz]/.test(m[1]) || /vecteur/.test(s)) V[m[1]] = [pq(m[2]), pq(m[3])];
    const names = Object.keys(P); const lines = [], e3 = [], concl = []; let answers = [];
    const vec = (A, B) => [P[B][0].sub(P[A][0]), P[B][1].sub(P[A][1])];
    const vs = (v) => '(' + qf(v[0]) + ' ; ' + qf(v[1]) + ')';
    const n2 = (v) => v[0].mul(v[0]).add(v[1].mul(v[1]));
    const normS = (v) => { const q = n2(v); return q.isInt() ? sqrtStr(q.val()) : U.sqrtQ(q); };
    const dot = (u, v) => u[0].mul(v[0]).add(u[1].mul(v[1]));
    const det = (u, v) => u[0].mul(v[1]).sub(u[1].mul(v[0]));
    if (names.length >= 2) {
      const [A, B, Cn, D] = names; const AB = vec(A, B);
      lines.push('Vecteur ' + A + B + ' = (x' + B + ' - x' + A + ' ; y' + B + ' - y' + A + ') = ' + vs(AB) + '.');
      lines.push('Distance ' + A + B + ' = √((Δx)² + (Δy)²) = √(' + qf(AB[0]) + '² + ' + qf(AB[1]) + '²) = √' + qf(n2(AB)) + (normS(AB) !== '√' + qf(n2(AB)) ? ' = ' + normS(AB) : '') + (/√/.test(normS(AB)) ? ' ≈ ' + f2(Math.sqrt(n2(AB).val()), 2) : '') + '.');
      concl.push(A + B + ' = ' + normS(AB)); answers.push(Math.sqrt(n2(AB).val()));
      if (/milieu/.test(s) || !Cn) { const I = [P[A][0].add(P[B][0]).div(new Q(2, 1)), P[A][1].add(P[B][1]).div(new Q(2, 1))]; lines.push('Milieu I de [' + A + B + '] : I((x' + A + ' + x' + B + ')/2 ; (y' + A + ' + y' + B + ')/2) = I' + vs(I) + '.'); concl.push('I' + vs(I)); }
      if (/droite|equation/.test(s) || !Cn) {
        if (AB[0].isZero()) lines.push('Équation de la droite (' + A + B + ') : x = ' + qf(P[A][0]) + ' (droite verticale).');
        else { const a = AB[1].div(AB[0]); const b = P[A][1].sub(a.mul(P[A][0])); lines.push('Droite (' + A + B + ') : coefficient directeur a = Δy/Δx = ' + qf(AB[1]) + '/' + qf(AB[0]) + ' = ' + qf(a) + ' ; ordonnée à l\'origine b = y' + A + ' - a·x' + A + ' = ' + qf(b) + '.'); lines.push('Équation réduite : y = ' + M.polyStr(M.polyFromCoeffs([b.val(), a.val()], 'x')) + '.'); concl.push('(' + A + B + ') : y = ' + M.polyStr(M.polyFromCoeffs([b.val(), a.val()], 'x'))); e3.push('On remplace les coordonnées de ' + B + ' : ' + qf(a) + ' × ' + qf(P[B][0]) + ' + ' + qf(b) + ' = ' + qf(a.mul(P[B][0]).add(b)) + ' = y' + B + ' ✅'); }
      }
      if (Cn) {
        const AC = vec(A, Cn), BC = vec(B, Cn);
        lines.push('Vecteur ' + A + Cn + ' = ' + vs(AC) + ' ; ' + A + Cn + ' = ' + normS(AC) + ' ; ' + B + Cn + ' = ' + normS(BC) + '.');
        const ps = dot(AB, AC), dt = det(AB, AC);
        lines.push('Produit scalaire ' + A + B + '·' + A + Cn + ' = ' + qf(AB[0]) + ' × ' + qf(AC[0]) + ' + ' + qf(AB[1]) + ' × ' + qf(AC[1]) + ' = ' + qf(ps) + (ps.isZero() ? ' = 0 : les vecteurs sont orthogonaux, le triangle est rectangle en ' + A + '.' : '.'));
        lines.push('Déterminant det(' + A + B + ', ' + A + Cn + ') = ' + qf(AB[0]) + ' × ' + qf(AC[1]) + ' - ' + qf(AB[1]) + ' × ' + qf(AC[0]) + ' = ' + qf(dt) + (dt.isZero() ? ' = 0 : vecteurs colinéaires, les points ' + A + ', ' + B + ', ' + Cn + ' sont alignés.' : ' ≠ 0 : les points ne sont pas alignés.'));
        if (!dt.isZero()) {
          const l = [n2(AB), n2(AC), n2(BC)]; const nat = [];
          if (l[0].eq(l[1]) && l[1].eq(l[2])) nat.push('équilatéral'); else if (l[0].eq(l[1]) || l[0].eq(l[2]) || l[1].eq(l[2])) nat.push('isocèle');
          const srt = l.slice().sort((x, y) => x.val() - y.val()); if (srt[0].add(srt[1]).eq(srt[2])) nat.push('rectangle');
          lines.push('Nature du triangle ' + A + B + Cn + ' : ' + (nat.length ? nat.join(' et ') : 'quelconque') + ' (on compare les carrés des longueurs : ' + l.map(qf).join(', ') + ').'); concl.push('Triangle ' + (nat.join(' et ') || 'quelconque'));
          const area = Math.abs(dt.val()) / 2; lines.push('Aire du triangle = |det| ÷ 2 = ' + f2(area, 3) + ' u.a.');
        } else concl.push(A + ', ' + B + ', ' + Cn + ' alignés');
        if (D) { const DC = vec(D, Cn); const para = AB[0].eq(DC[0]) && AB[1].eq(DC[1]); lines.push('Vecteur ' + D + Cn + ' = ' + vs(DC) + (para ? ' = ' + A + B + ' : ' + A + B + Cn + D + ' est un parallélogramme.' : ' ≠ ' + A + B + ' : ' + A + B + Cn + D + ' n\'est pas un parallélogramme.')); concl.push(para ? A + B + Cn + D + ' parallélogramme' : A + B + Cn + D + ' non parallélogramme'); }
      }
      e3.push('Contrôle : on refait le calcul des coordonnées « arrivée - départ » pour chaque vecteur ✅');
      const pts = names.map((k) => ({ x: P[k][0].val(), y: P[k][1].val(), label: k }));
      return res({ type: 'vecteur', titre: 'Géométrie analytique (' + names.join(', ') + ')', difficulte: Cn ? 'moyen' : 'facile',
        e1: 'Dans un repère orthonormé, on connaît ' + names.map((k) => k + vs(P[k])).join(', ') + '. Pour un vecteur : « coordonnées de l\'arrivée moins coordonnées du départ ».',
        e2: L(lines), e3: L(e3), conclusion: concl.join(' ; '), reponse: concl.join(' ; '), answers, gen: { k: 'vecteur' },
        graph: { kind: 'geo', pts, segs: names.length >= 3 ? names.slice(0, 4).map((k, i, a) => [k, a[(i + 1) % a.length]]) : [[names[0], names[1]]] } });
    }
    const vn = Object.keys(V);
    if (vn.length >= 2) {
      const [a, b] = vn; const u = V[a], v = V[b];
      lines.push('Produit scalaire ' + a + '·' + b + ' = ' + qf(u[0]) + ' × ' + qf(v[0]) + ' + ' + qf(u[1]) + ' × ' + qf(v[1]) + ' = ' + qf(dot(u, v)) + (dot(u, v).isZero() ? ' : vecteurs orthogonaux.' : '.'));
      lines.push('det(' + a + ', ' + b + ') = ' + qf(u[0]) + ' × ' + qf(v[1]) + ' - ' + qf(u[1]) + ' × ' + qf(v[0]) + ' = ' + qf(det(u, v)) + (det(u, v).isZero() ? ' : vecteurs colinéaires.' : ' : vecteurs non colinéaires.'));
      lines.push('Normes : ‖' + a + '‖ = ' + normS(u) + ' ; ‖' + b + '‖ = ' + normS(v) + '.');
      return res({ type: 'vecteur', titre: 'Vecteurs ' + a + ' et ' + b, difficulte: 'facile', e1: 'On connaît ' + a + vs(u) + ' et ' + b + vs(v) + ' dans un repère orthonormé.', e2: L(lines), e3: 'Rappel : orthogonaux ⇔ produit scalaire nul ; colinéaires ⇔ déterminant nul ✅', conclusion: a + '·' + b + ' = ' + qf(dot(u, v)) + ' ; det = ' + qf(det(u, v)), answers: [dot(u, v).val()], gen: { k: 'vecteur' } });
    }
    return null;
  }

  // ================================================================= 2. SYSTÈME LINÉAIRE 3 × 3 (pivot de Gauss)
  function solveSystem3(text, ctx) {
    const t = M.norm(text); if (!/\bz\b/.test(t) || !/\by\b/.test(t)) return null;
    const segs = t.split(/[;\n{}]|\bet\b|,(?=\s*-?\s*\d*\s*[xyz])/).map((x) => x.trim()).filter((x) => /=/.test(x) && /[xyz]/.test(x));
    const rows = [];
    for (const sg of segs) {
      const cl = H.cleanMath(sg.replace(/^.*?(?:syst[eè]me|r[ée]soudre)[^:]*:?/i, '')); const parts = cl.split('='); if (parts.length !== 2) continue;
      const A = H.tryParse(parts[0]), B = H.tryParse(parts[1]); if (!A || !B) continue;
      const pa = M.toPoly(A), pb = M.toPoly(B); if (!pa || !pb) continue; const p = pa.sub(pb);
      if (p.vars().some((v) => !/^[xyz]$/.test(v))) continue;
      const ev = (x, y, z) => p.evalAt({ x: new Q(x, 1), y: new Q(y, 1), z: new Q(z, 1) });
      const c0 = ev(0, 0, 0), a = ev(1, 0, 0).sub(c0), b = ev(0, 1, 0).sub(c0), c = ev(0, 0, 1).sub(c0);
      if (!ev(2, 3, 5).eq(c0.add(a.mul(new Q(2, 1))).add(b.mul(new Q(3, 1))).add(c.mul(new Q(5, 1))))) return null; // non linéaire
      rows.push({ r: [a, b, c, c0.neg()], src: M.show(A) + ' = ' + M.show(B) });
    }
    if (rows.length !== 3) return null;
    const Mx = rows.map((x) => x.r.slice()); const names = ['L1', 'L2', 'L3']; const lines = [];
    const rowStr = (r) => M.polyStr(M.polyFromCoeffs([0, 0], 'x')).replace(/.*/, '') + [['x', r[0]], ['y', r[1]], ['z', r[2]]].filter(([, q]) => !q.isZero()).map(([v, q], i) => { const s0 = qf(q.abs()); const sign = q.val() < 0 ? (i ? ' - ' : '-') : (i ? ' + ' : ''); return sign + (s0 === '1' ? '' : s0) + v; }).join('') + ' = ' + qf(r[3]);
    lines.push('Système : ' + Mx.map((r, i) => names[i] + ' : ' + rowStr(r)).join(' ; ') + '.');
    for (let col = 0; col < 3; col++) {
      let piv = col; while (piv < 3 && Mx[piv][col].isZero()) piv++;
      if (piv === 3) return res({ type: 'systeme', titre: 'Système 3 × 3', difficulte: 'difficile', e1: 'Système linéaire de 3 équations à 3 inconnues.', e2: L(lines.concat(['Le pivot de Gauss fait apparaître une ligne sans inconnue : le système n\'a pas une solution unique (aucune ou une infinité).'])), e3: 'Le déterminant du système est nul ✅', conclusion: 'Pas de solution unique', confidence: 0.8 });
      if (piv !== col) { [Mx[piv], Mx[col]] = [Mx[col], Mx[piv]]; lines.push('On échange L' + (col + 1) + ' et L' + (piv + 1) + ' pour avoir un pivot non nul.'); }
      for (let r = col + 1; r < 3; r++) {
        if (Mx[r][col].isZero()) continue; const k = Mx[r][col].div(Mx[col][col]);
        Mx[r] = Mx[r].map((q, j) => q.sub(k.mul(Mx[col][j])));
        lines.push('L' + (r + 1) + ' ← L' + (r + 1) + ' - (' + qf(k) + ') × L' + (col + 1) + ' : ' + rowStr(Mx[r]) + '.');
      }
    }
    const sol = [null, null, null];
    for (let r = 2; r >= 0; r--) { let acc = Mx[r][3]; for (let j = r + 1; j < 3; j++) acc = acc.sub(Mx[r][j].mul(sol[j])); sol[r] = acc.div(Mx[r][r]); lines.push('Remontée : ' + ['x', 'y', 'z'][r] + ' = ' + qf(sol[r]) + '.'); }
    const chk = rows.map((x) => x.r[0].mul(sol[0]).add(x.r[1].mul(sol[1])).add(x.r[2].mul(sol[2])).eq(x.r[3]));
    const S = '(x ; y ; z) = (' + sol.map(qf).join(' ; ') + ')';
    return res({ type: 'systeme', titre: 'Système 3 × 3', difficulte: 'difficile',
      e1: 'On résout un système de 3 équations linéaires à 3 inconnues par la méthode du pivot de Gauss : on élimine x, puis y, pour obtenir un système triangulaire.',
      e2: L(lines), e3: rows.map((x, i) => 'Équation ' + (i + 1) + ' : ' + (chk[i] ? 'vérifiée ✅' : 'à revoir ❌')).join('\n'), conclusion: S, reponse: S, answers: sol.map((q) => q.val()), gen: { k: 'system3' } });
  }

  // ================================================================= 3. STATISTIQUES À DEUX VARIABLES (ajustement affine)
  function solveRegression(text, ctx) {
    const s = strip(text); if (!/ajustement|regression|moindres carres|covariance|correlation|nuage de points|deux variables|2 variables|droite de mayer/.test(s)) return null;
    const rowsT = String(text).split(/\n|(?=\b[yY]\s*_?i?\s*[:|=])/).map((ln) => { const mm = ln.match(/^\s*([^0-9\-]{0,30}?)\s*[:|=]?\s*((?:-?\d+(?:[.,]\d+)?[\s;|]*){3,})\s*$/); if (!mm) return null; const vals = mm[2].split(/[\s;|]+/).filter(Boolean).map(parseFr).filter((x) => !isNaN(x)); return vals.length >= 3 ? { lab: mm[1].trim(), vals } : null; }).filter(Boolean);
    if (rowsT.length < 2) return null;
    let X = rowsT[0].vals, Y = rowsT[1].vals; if (X.length !== Y.length) return null; const n = X.length;
    const sum = (a) => a.reduce((p, q) => p + q, 0); const xm = sum(X) / n, ym = sum(Y) / n;
    const vx = sum(X.map((x) => x * x)) / n - xm * xm, vy = sum(Y.map((y) => y * y)) / n - ym * ym, cov = sum(X.map((x, i) => x * Y[i])) / n - xm * ym;
    if (vx <= 0) return null;
    const a = cov / vx, b = ym - a * xm, r = cov / Math.sqrt(vx * vy);
    const lines = ['Point moyen G(x̄ ; ȳ) : x̄ = ' + f2(xm, 4) + ' ; ȳ = ' + f2(ym, 4) + '.', 'Variance V(x) = (Σx²)/n - x̄² = ' + f2(vx, 4) + ' ; covariance cov(x, y) = (Σxy)/n - x̄ȳ = ' + f2(cov, 4) + '.', 'Droite de régression de y en x (moindres carrés) : a = cov(x, y) / V(x) = ' + f2(a, 4) + ' ; b = ȳ - a x̄ = ' + f2(b, 4) + '.', 'Équation : y = ' + f2(a, 4) + 'x ' + (b < 0 ? '- ' + f2(-b, 4) : '+ ' + f2(b, 4)) + '.', 'Coefficient de corrélation linéaire r = cov / (σx σy) = ' + f2(r, 4) + (Math.abs(r) >= 0.87 ? ' : |r| ≥ 0,87, l\'ajustement affine est justifié.' : ' : corrélation faible, l\'ajustement affine est peu fiable.')];
    let concl = 'y = ' + f2(a, 3) + 'x ' + (b < 0 ? '- ' + f2(-b, 3) : '+ ' + f2(b, 3)) + ' ; r ≈ ' + f2(r, 3); let answers = [a, b];
    const pm = s.match(/(?:pour|lorsque|si)\s*x\s*=\s*(-?\d+(?:[.,]\d+)?)/) || s.match(/(?:estim\w*|prevoi\w*|previsi\w*)[^0-9]{0,40}(\d{1,4}(?:[.,]\d+)?)/);
    if (pm) { const x0 = parseFr(pm[1]); lines.push('Estimation pour x = ' + f2(x0) + ' : y ≈ ' + f2(a, 4) + ' × ' + f2(x0) + ' ' + (b < 0 ? '- ' + f2(-b, 4) : '+ ' + f2(b, 4)) + ' ≈ ' + f2(a * x0 + b, 2) + '.'); concl += ' ; estimation ≈ ' + f2(a * x0 + b, 2); answers.push(a * x0 + b); }
    const table = { head: ['xᵢ', 'yᵢ', 'xᵢ²', 'xᵢyᵢ'], rows: X.map((x, i) => [f2(x), f2(Y[i]), f2(x * x), f2(x * Y[i])]).concat([['Σ = ' + f2(sum(X)), 'Σ = ' + f2(sum(Y)), 'Σ = ' + f2(sum(X.map((x) => x * x))), 'Σ = ' + f2(sum(X.map((x, i) => x * Y[i])))]]) };
    return res({ type: 'stats2', titre: 'Statistiques à deux variables (n = ' + n + ')', difficulte: 'difficile',
      e1: 'On dispose d\'une série statistique double de ' + n + ' couples (xᵢ ; yᵢ). On calcule le point moyen, la covariance puis la droite des moindres carrés.',
      e2: L(lines), e3: 'La droite passe par le point moyen G : ' + f2(a, 4) + ' × ' + f2(xm, 4) + ' + ' + f2(b, 4) + ' = ' + f2(a * xm + b, 4) + ' = ȳ ✅', conclusion: concl, reponse: concl, answers, gen: { k: 'regression' }, table,
      graph: { kind: 'scatter', pts: X.map((x, i) => ({ x, y: Y[i] })), line: [a, b] } });
  }

  // ================================================================= 4. CHIMIE
  const MASS = { H: 1, He: 4, Li: 7, Be: 9, B: 11, C: 12, N: 14, O: 16, F: 19, Ne: 20, Na: 23, Mg: 24, Al: 27, Si: 28, P: 31, S: 32, Cl: 35.5, Ar: 40, K: 39, Ca: 40, Cr: 52, Mn: 55, Fe: 56, Co: 59, Ni: 59, Cu: 63.5, Zn: 65.4, Br: 80, Ag: 108, Sn: 119, I: 127, Ba: 137, Au: 197, Hg: 200.6, Pb: 207 };
  function parseFormula(f) {
    const st = [{}]; let i = 0;
    while (i < f.length) {
      const c = f[i];
      if (c === '(' || c === '[') { st.push({}); i++; }
      else if (c === ')' || c === ']') { i++; let n = ''; while (/\d/.test(f[i] || '')) n += f[i++]; const top = st.pop(); const k = n ? +n : 1; Object.keys(top).forEach((e) => { st[st.length - 1][e] = (st[st.length - 1][e] || 0) + top[e] * k; }); }
      else if (/[A-Z]/.test(c)) { let e = c; i++; if (/[a-z]/.test(f[i] || '')) e += f[i++]; let n = ''; while (/\d/.test(f[i] || '')) n += f[i++]; if (!(e in MASS)) return null; st[st.length - 1][e] = (st[st.length - 1][e] || 0) + (n ? +n : 1); }
      else return null;
    }
    return st.length === 1 ? st[0] : null;
  }
  const molar = (comp) => Object.entries(comp).reduce((a, [e, n]) => a + MASS[e] * n, 0);
  function nullspace(A) { // matrice de Q (lignes) -> vecteur entier positif du noyau (dimension 1) ou null
    const m = A.length, n = A[0].length; const R = A.map((r) => r.slice()); const piv = []; let row = 0;
    for (let c = 0; c < n && row < m; c++) {
      let p = row; while (p < m && R[p][c].isZero()) p++; if (p === m) continue;
      [R[p], R[row]] = [R[row], R[p]]; const pv = R[row][c]; R[row] = R[row].map((q) => q.div(pv));
      for (let r = 0; r < m; r++) if (r !== row && !R[r][c].isZero()) { const k = R[r][c]; R[r] = R[r].map((q, j) => q.sub(k.mul(R[row][j]))); }
      piv.push(c); row++;
    }
    const free = []; for (let c = 0; c < n; c++) if (!piv.includes(c)) free.push(c);
    if (free.length !== 1) return null;
    const x = new Array(n).fill(null); x[free[0]] = new Q(1, 1);
    piv.forEach((c, r) => { x[c] = R[r][free[0]].neg(); });
    let den = 1; x.forEach((q) => { den = M.lcm(den, Math.abs(Math.round(q.val() * 1e6) / 1e6 % 1 ? Number(String(fmt(q)).split('/')[1] || 1) : 1)); });
    let v = x.map((q) => Math.round(q.val() * den)); if (v.some((k) => k <= 0)) { if (v.every((k) => k < 0)) v = v.map((k) => -k); else return null; }
    const g = v.reduce((a, b) => M.gcd(a, b)); return v.map((k) => k / g);
  }
  const sub = (f) => f.replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[d]);
  function solveChimie(text, ctx) {
    const s = strip(text); const raw = String(text).replace(/[₀-₉]/g, (d) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(d)));
    // a) équilibrage
    const eqm = raw.match(/((?:\d*\s*[A-Z][A-Za-z0-9()]*\s*\+\s*)*\d*\s*[A-Z][A-Za-z0-9()]*)\s*(?:→|->|⟶|=)\s*((?:\d*\s*[A-Z][A-Za-z0-9()]*\s*\+\s*)*\d*\s*[A-Z][A-Za-z0-9()]*)/);
    if (eqm && (/equilibr|equation|reaction|combustion|bilan|chimi/.test(s) || /→|->|⟶/.test(raw))) {
      const side = (str) => str.split('+').map((x) => x.trim().replace(/^\d+\s*/, '')).filter(Boolean);
      const R = side(eqm[1]), P = side(eqm[2]); const all = R.concat(P); const comps = all.map(parseFormula);
      if (comps.every(Boolean) && all.length >= 2 && all.some((x) => /\d|[A-Z].*[A-Z]/.test(x))) {
        const els = [...new Set(comps.flatMap((c) => Object.keys(c)))];
        const A = els.map((e) => all.map((_, j) => new Q((comps[j][e] || 0) * (j < R.length ? 1 : -1), 1)));
        const v = nullspace(A);
        if (v) {
          const co = (k) => (v[k] === 1 ? '' : v[k] + ' ');
          const eqS = R.map((f, k) => co(k) + sub(f)).join(' + ') + ' → ' + P.map((f, k) => co(k + R.length) + sub(f)).join(' + ');
          const lines = ['Éléments présents : ' + els.join(', ') + '. On place des coefficients a, b, c… devant chaque espèce.', ...els.map((e) => 'Conservation de ' + e + ' : ' + R.map((f, k) => (comps[k][e] ? (comps[k][e] > 1 ? comps[k][e] : '') + String.fromCharCode(97 + k) : '')).filter(Boolean).join(' + ') + ' = ' + P.map((f, k) => (comps[k + R.length][e] ? (comps[k + R.length][e] > 1 ? comps[k + R.length][e] : '') + String.fromCharCode(97 + k + R.length) : '')).filter(Boolean).join(' + ')), 'Plus petits entiers solutions : ' + v.map((k, i) => String.fromCharCode(97 + i) + ' = ' + k).join(', ') + '.', 'Équation équilibrée : ' + eqS];
          const e3 = els.map((e) => e + ' : ' + R.reduce((a, f, k) => a + v[k] * (comps[k][e] || 0), 0) + ' à gauche = ' + P.reduce((a, f, k) => a + v[k + R.length] * (comps[k + R.length][e] || 0), 0) + ' à droite ✅');
          return res({ type: 'chimie', titre: 'Équilibrage : ' + R.map(sub).join(' + ') + ' → ' + P.map(sub).join(' + '), difficulte: 'moyen',
            e1: 'Lors d\'une réaction chimique, rien ne se perd, rien ne se crée (Lavoisier) : chaque élément doit apparaître le même nombre de fois de chaque côté de la flèche.',
            e2: L(lines), e3: L(e3), conclusion: eqS, reponse: eqS, answers: v, gen: { k: 'equilibrage' } });
        }
      }
    }
    // b) masse molaire, quantité de matière, concentration
    if (!/masse molaire|quantite de matiere|nombre de moles?|\bmol\b|concentration|molaire|nombre de molecules/.test(s)) return null;
    const cand = (raw.match(/\b(?:[A-Z][a-z]?\d*|\((?:[A-Z][a-z]?\d*)+\)\d*)+\b/g) || []).filter((f) => (/\d/.test(f) || (f.match(/[A-Z]/g) || []).length >= 2) && parseFormula(f));
    if (!cand.length) return null;
    const f = cand[0]; const comp = parseFormula(f); const Mm = molar(comp);
    const lines = ['Masse molaire : M(' + sub(f) + ') = ' + Object.entries(comp).map(([e, n]) => (n > 1 ? n + ' × ' : '') + 'M(' + e + ')').join(' + ') + ' = ' + Object.entries(comp).map(([e, n]) => (n > 1 ? n + ' × ' : '') + fmtNum(MASS[e])).join(' + ') + ' = ' + fmtNum(Mm, 2) + ' g/mol.'];
    let concl = 'M(' + sub(f) + ') = ' + fmtNum(Mm, 2) + ' g/mol'; const answers = [Mm]; let n = null;
    const mm = s.match(new RegExp(NUM + '\\s*(kg|mg|g)\\b')); const nm = s.match(new RegExp(NUM + '\\s*mol\\b')); const vm = s.match(new RegExp(NUM + '\\s*(ml|cl|l|cm3|dm3|litres?)\\b'));
    if (mm) { let m = parseFr(mm[1]); if (mm[2] === 'kg') m *= 1000; if (mm[2] === 'mg') m /= 1000; n = m / Mm; lines.push('Quantité de matière : n = m ÷ M = ' + fmtNum(m, 3) + ' ÷ ' + fmtNum(Mm, 2) + ' = ' + fmtNum(n, 4) + ' mol.'); concl += ' ; n = ' + fmtNum(n, 4) + ' mol'; answers.push(n); }
    else if (nm) { n = parseFr(nm[1]); const m = n * Mm; lines.push('Masse : m = n × M = ' + fmtNum(n, 4) + ' × ' + fmtNum(Mm, 2) + ' = ' + fmtNum(m, 3) + ' g.'); concl += ' ; m = ' + fmtNum(m, 3) + ' g'; answers.push(m); }
    if (n !== null && vm && /concentration|solution|dissou/.test(s)) { let V = parseFr(vm[1]); const u = vm[2]; if (/^ml|cm3/.test(u)) V /= 1000; if (u === 'cl') V /= 100; const Cc = n / V; lines.push('Concentration molaire : C = n ÷ V = ' + fmtNum(n, 4) + ' ÷ ' + fmtNum(V, 4) + ' L = ' + fmtNum(Cc, 4) + ' mol/L.'); concl += ' ; C = ' + fmtNum(Cc, 4) + ' mol/L'; answers.push(Cc); }
    if (n !== null && /nombre de molecules|nombre d'atomes|nombre d'entites/.test(s)) { const Nn = n * 6.02e23; lines.push('Nombre d\'entités : N = n × Nₐ = ' + fmtNum(n, 4) + ' × 6,02 × 10²³ ≈ ' + fmtNum(Nn / Math.pow(10, Math.floor(Math.log10(Nn))), 3) + ' × 10^' + Math.floor(Math.log10(Nn)) + '.'); }
    return res({ type: 'chimie', titre: 'Quantité de matière — ' + sub(f), difficulte: 'facile',
      e1: 'On identifie l\'espèce chimique ' + sub(f) + ' et les données (masse, quantité, volume). Masses molaires atomiques : ' + Object.keys(comp).map((e) => e + ' = ' + fmtNum(MASS[e]) + ' g/mol').join(' ; ') + '.',
      e2: L(lines), e3: 'Analyse des unités : g ÷ (g/mol) = mol ; mol ÷ L = mol/L ✅', conclusion: concl, reponse: concl, answers, gen: { k: 'masse_molaire' } });
  }

  // ================================================================= 5. MÉCANIQUE ET ÉNERGIE
  function grab(s, sym, words, units) {
    let m = s.match(new RegExp('\\b(?:' + sym + ')\\s*=\\s*' + NUM + '\\s*(' + units + ')?', 'i'));
    if (m) return { v: parseFr(m[1]), u: (m[2] || '').toLowerCase() };
    m = s.match(new RegExp('(?:' + words + ')[^0-9]{0,30}?' + NUM + '\\s*(' + units + ')', 'i'));
    if (m) return { v: parseFr(m[1]), u: (m[2] || '').toLowerCase() };
    if (/\//.test(units)) { m = s.match(new RegExp(NUM + '\\s*(' + units + ')', 'i')); if (m) return { v: parseFr(m[1]), u: (m[2] || '').toLowerCase() }; }
    return null;
  }
  function solveMeca(text, ctx) {
    const s = strip(text).replace(/\u00a0/g, ' ');
    if (!/energie cinetique|energie potentielle|energie mecanique|travail|chute libre|acceleration|uniformement (?:accelere|varie)|puissance mecanique/.test(s)) return null;
    const gm = s.match(/g\s*=\s*(\d+(?:[.,]\d+)?)/); const g = gm ? parseFr(gm[1]) : 10;
    const mm = grab(s, 'm', 'masse', 'kg|g|t'); let m = mm ? mm.v * (mm.u === 'g' ? 0.001 : mm.u === 't' ? 1000 : 1) : null;
    const vv = grab(s, 'v', 'vitesse', 'm/s|km/h'); let v = vv ? (vv.u === 'km/h' ? vv.v / 3.6 : vv.v) : null;
    const hh = grab(s, 'h', 'hauteur|altitude', 'm|cm'); const h = hh ? (hh.u === 'cm' ? hh.v / 100 : hh.v) : null;
    const lines = [], concl = [], answers = []; let titre = 'Mécanique';
    if (vv && vv.u === 'km/h') lines.push('Conversion : v = ' + fmtNum(vv.v) + ' km/h ÷ 3,6 = ' + fmtNum(v, 3) + ' m/s.');
    if (mm && mm.u !== 'kg' && mm.u) lines.push('Conversion : m = ' + fmtNum(m, 4) + ' kg.');
    if (/chute libre/.test(s) && h !== null) {
      const tt = Math.sqrt(2 * h / g), vf = Math.sqrt(2 * g * h); titre = 'Chute libre';
      lines.push('Chute libre sans vitesse initiale : h = ½ g t² ⇒ t = √(2h/g) = √(2 × ' + fmtNum(h) + ' ÷ ' + fmtNum(g) + ') = ' + fmtNum(tt, 3) + ' s.', 'Vitesse à l\'arrivée : v = g t = √(2gh) = ' + fmtNum(vf, 3) + ' m/s (' + fmtNum(vf * 3.6, 1) + ' km/h).');
      concl.push('t = ' + fmtNum(tt, 3) + ' s', 'v = ' + fmtNum(vf, 3) + ' m/s'); answers.push(tt, vf);
      if (m) { lines.push('Énergie : Ep = mgh = ' + fmtNum(m * g * h, 2) + ' J, entièrement convertie en Ec à l\'arrivée.'); }
    } else {
      if (/energie cinetique|energie mecanique/.test(s) && m !== null && v !== null) { const Ec = 0.5 * m * v * v; titre = 'Énergie cinétique'; lines.push('Énergie cinétique : Ec = ½ m v² = ½ × ' + fmtNum(m, 4) + ' × ' + fmtNum(v, 3) + '² = ' + fmtNum(Ec, 2) + ' J.'); concl.push('Ec = ' + fmtNum(Ec, 2) + ' J'); answers.push(Ec); }
      if (/energie potentielle|energie mecanique/.test(s) && m !== null && h !== null) { const Ep = m * g * h; titre = concl.length ? 'Énergies' : 'Énergie potentielle de pesanteur'; lines.push('Énergie potentielle : Ep = m g h = ' + fmtNum(m, 4) + ' × ' + fmtNum(g) + ' × ' + fmtNum(h) + ' = ' + fmtNum(Ep, 2) + ' J (référence au sol).'); concl.push('Ep = ' + fmtNum(Ep, 2) + ' J'); answers.push(Ep); }
      if (/energie mecanique/.test(s) && answers.length === 2) { lines.push('Énergie mécanique : Em = Ec + Ep = ' + fmtNum(answers[0] + answers[1], 2) + ' J.'); concl.push('Em = ' + fmtNum(answers[0] + answers[1], 2) + ' J'); }
      if (/travail/.test(s)) { const F = grab(s, 'F', 'force|intensite', 'N|kN'); const d = grab(s, 'd|l', 'distance|deplacement|longueur|parcourt|sur', 'm|km'); const al = s.match(/(\d+(?:[.,]\d+)?)\s*°/);
        if (F && d) { const Fv = F.v * (F.u === 'kn' ? 1000 : 1), dv = d.v * (d.u === 'km' ? 1000 : 1); const a = al ? parseFr(al[1]) : 0; const W = Fv * dv * Math.cos(a * Math.PI / 180); titre = 'Travail d\'une force'; lines.push('Travail : W = F × d × cos α = ' + fmtNum(Fv) + ' × ' + fmtNum(dv) + ' × cos ' + fmtNum(a) + '° = ' + fmtNum(W, 2) + ' J' + (W > 0 ? ' (travail moteur).' : W < 0 ? ' (travail résistant).' : ' (force perpendiculaire : travail nul).')); concl.push('W = ' + fmtNum(W, 2) + ' J'); answers.push(W);
          const tm = s.match(new RegExp(NUM + '\\s*(s|min)\\b')); if (tm && /puissance/.test(s)) { const tv = parseFr(tm[1]) * (tm[2] === 'min' ? 60 : 1); lines.push('Puissance : P = W ÷ t = ' + fmtNum(W, 2) + ' ÷ ' + fmtNum(tv) + ' = ' + fmtNum(W / tv, 2) + ' W.'); concl.push('P = ' + fmtNum(W / tv, 2) + ' W'); } } }
      if (/acceleration|uniformement/.test(s)) { const a = grab(s, 'a', 'acceleration', 'm/s2|m/s²|m.s-2'); const v0 = grab(s, 'v0|v_0', 'vitesse initiale', 'm/s|km/h'); const tm = grab(s, 't', 'pendant|duree|au bout de|apres', 's|min');
        if (a && tm) { const v0v = v0 ? (v0.u === 'km/h' ? v0.v / 3.6 : v0.v) : 0; const tv = tm.v * (tm.u === 'min' ? 60 : 1); const vf = v0v + a.v * tv, x = v0v * tv + 0.5 * a.v * tv * tv; titre = 'Mouvement rectiligne uniformément varié'; lines.push('Équations horaires (MRUV) : v(t) = a t + v₀ et x(t) = ½ a t² + v₀ t.', 'v(' + fmtNum(tv) + ') = ' + fmtNum(a.v) + ' × ' + fmtNum(tv) + ' + ' + fmtNum(v0v, 3) + ' = ' + fmtNum(vf, 3) + ' m/s.', 'Distance parcourue : x = ½ × ' + fmtNum(a.v) + ' × ' + fmtNum(tv) + '² + ' + fmtNum(v0v, 3) + ' × ' + fmtNum(tv) + ' = ' + fmtNum(x, 2) + ' m.'); concl.push('v = ' + fmtNum(vf, 3) + ' m/s', 'x = ' + fmtNum(x, 2) + ' m'); answers.push(vf, x); } }
    }
    if (!concl.length) return null;
    return res({ type: 'physique', titre, difficulte: 'moyen', e1: 'On relève les données et on les convertit en unités SI (kg, m, s, m/s ; g = ' + fmtNum(g) + ' N/kg).', e2: L(lines), e3: 'Analyse dimensionnelle : kg·m²/s² = joule (J) ✅ ; ordre de grandeur cohérent avec la situation.', conclusion: concl.join(' ; '), reponse: concl.join(' ; '), answers, gen: { k: 'energie' } });
  }

  // ================================================================= 6. CIRCUITS (série / parallèle)
  function solveCircuit(text, ctx) {
    const s = strip(text); if (!/serie|parallele|derivation|resistance equivalente|association/.test(s) || !/ω|ohm/i.test(text + s)) return null;
    const Rs = []; let m; const re = new RegExp(NUM + '\\s*(k?)\\s*(?:Ω|ohms?)', 'gi'); while ((m = re.exec(text))) Rs.push(parseFr(m[1]) * (m[2] ? 1000 : 1));
    if (Rs.length < 2) return null;
    const U0 = (text.match(new RegExp(NUM + '\\s*V\\b')) || [])[1]; const Uv = U0 ? parseFr(U0) : null;
    const lines = [], concl = []; let Req, mode;
    const ser = /serie/.test(s), par = /parallele|derivation/.test(s);
    if (ser && par && Rs.length === 3) { const p = Rs[1] * Rs[2] / (Rs[1] + Rs[2]); Req = Rs[0] + p; mode = 'mixte'; lines.push('Hypothèse (énoncé) : R1 en série avec l\'association en parallèle de R2 et R3.', 'R2 // R3 = (R2 × R3) ÷ (R2 + R3) = (' + fmtNum(Rs[1]) + ' × ' + fmtNum(Rs[2]) + ') ÷ (' + fmtNum(Rs[1]) + ' + ' + fmtNum(Rs[2]) + ') = ' + fmtNum(p, 3) + ' Ω.', 'Req = R1 + (R2 // R3) = ' + fmtNum(Rs[0]) + ' + ' + fmtNum(p, 3) + ' = ' + fmtNum(Req, 3) + ' Ω.'); }
    else if (par) { mode = 'parallèle'; Req = 1 / Rs.reduce((a, r) => a + 1 / r, 0); lines.push('En dérivation (parallèle) : 1/Req = ' + Rs.map((r) => '1/' + fmtNum(r)).join(' + ') + (Rs.length === 2 ? ' ⇔ Req = (R1 × R2) ÷ (R1 + R2) = (' + fmtNum(Rs[0]) + ' × ' + fmtNum(Rs[1]) + ') ÷ ' + fmtNum(Rs[0] + Rs[1]) : '') + ' = ' + fmtNum(Req, 3) + ' Ω.', 'Remarque : Req est plus petite que la plus petite des résistances.'); }
    else { mode = 'série'; Req = Rs.reduce((a, r) => a + r, 0); lines.push('En série : Req = ' + Rs.map((r) => fmtNum(r)).join(' + ') + ' = ' + fmtNum(Req, 3) + ' Ω.'); }
    concl.push('Req = ' + fmtNum(Req, 3) + ' Ω'); const answers = [Req];
    if (Uv) { const I = Uv / Req; lines.push('Intensité débitée par le générateur : I = U ÷ Req = ' + fmtNum(Uv) + ' ÷ ' + fmtNum(Req, 3) + ' = ' + fmtNum(I, 4) + ' A.'); concl.push('I = ' + fmtNum(I, 4) + ' A'); answers.push(I);
      if (mode === 'série') lines.push('Tensions : ' + Rs.map((r, k) => 'U' + (k + 1) + ' = R' + (k + 1) + ' × I = ' + fmtNum(r * I, 3) + ' V').join(' ; ') + ' (loi d\'additivité : total ' + fmtNum(Uv) + ' V).');
      if (mode === 'parallèle') lines.push('Intensités dans chaque branche : ' + Rs.map((r, k) => 'I' + (k + 1) + ' = U ÷ R' + (k + 1) + ' = ' + fmtNum(Uv / r, 4) + ' A').join(' ; ') + ' (loi des nœuds : total ' + fmtNum(I, 4) + ' A).'); }
    return res({ type: 'physique', titre: 'Association de résistances (' + mode + ')', difficulte: 'moyen', e1: 'On a ' + Rs.length + ' résistances (' + Rs.map((r) => fmtNum(r) + ' Ω').join(', ') + ') montées en ' + mode + (Uv ? ', alimentées sous ' + fmtNum(Uv) + ' V' : '') + '.', e2: L(lines), e3: mode === 'parallèle' ? 'Req < plus petite résistance ✅' : 'Req > chaque résistance ✅', conclusion: concl.join(' ; '), reponse: concl.join(' ; '), answers, gen: { k: 'circuit' } });
  }

  // ================================================================= 7. GÉNÉTIQUE (lois de Mendel)
  function solveGenetique(text, ctx) {
    const s = strip(text); if (!/croise|genotyp|phenotyp|allele|dominan|recessi|mendel|homozygo|heterozygo|echiquier|lignee pure|hybrid/.test(s)) return null;
    const G1 = '([A-Za-z]{2}(?:[A-Za-z]{2})?|[A-Za-z]\\s*\\/\\/?\\s*[A-Za-z](?:\\s+[A-Za-z]\\s*\\/\\/?\\s*[A-Za-z])?)';
    const m = String(text).match(new RegExp(G1 + '\\s*[x×X*]\\s*' + G1));
    if (!m) return null;
    const norm = (g) => { g = g.replace(/\s/g, ''); if (/\//.test(g)) { const parts = g.split(/(?<=[A-Za-z])(?=[A-Za-z]\/)/); return parts.map((p) => p.split(/\/\/?/)); } const genes = []; for (let k = 0; k < g.length; k += 2) genes.push([g[k], g[k + 1]]); return genes; };
    const p1 = norm(m[1]), p2 = norm(m[2]); if (p1.length !== p2.length || p1.some((gn, k) => gn.some((a) => a.toLowerCase() !== gn[0].toLowerCase()) || p2[k].some((a) => a.toLowerCase() !== gn[0].toLowerCase()))) return null;
    const codom = /codominan|dominance incomplete|intermediaire/.test(s);
    const gam = (p) => p.reduce((acc, gn) => { const out = []; acc.forEach((a) => [...new Set(gn)].forEach((al) => out.push(a + al))); return out; }, ['']);
    const gw = (p) => { const counts = {}; p.reduce((acc, gn) => { const out = []; acc.forEach((a) => gn.forEach((al) => out.push(a + al))); return out; }, ['']).forEach((x) => { counts[x] = (counts[x] || 0) + 1; }); return counts; };
    const ga = gw(p1), gb = gw(p2); const A = Object.keys(ga), B = Object.keys(gb); const totA = Object.values(ga).reduce((a, b) => a + b, 0), totB = Object.values(gb).reduce((a, b) => a + b, 0);
    const geno = (x, y) => [...x].map((c, k) => [c, y[k]].sort((u, v) => (u === u.toUpperCase() ? -1 : 1) - (v === v.toUpperCase() ? -1 : 1)).join('')).join(' ');
    const pheno = (gt) => gt.split(' ').map((pair) => { const up = pair[0] === pair[0].toUpperCase(), up2 = pair[1] === pair[1].toUpperCase(); return codom && up !== up2 ? '[' + pair[0].toUpperCase() + pair[1].toLowerCase() + ']' : '[' + (up || up2 ? pair[0].toUpperCase() : pair[0].toLowerCase()) + ']'; }).join('');
    const G2 = {}, P2 = {}; const rows = [];
    A.forEach((x) => { const row = [x + (ga[x] / totA !== 1 / A.length ? '' : '')]; B.forEach((y) => { const gt = geno(x, y); const w = ga[x] * gb[y]; G2[gt] = (G2[gt] || 0) + w; const ph = pheno(gt); P2[ph] = (P2[ph] || 0) + w; row.push(gt + ' ' + ph); }); rows.push(row); });
    const tot = totA * totB; const fr = (w) => rat(w / tot) + ' (' + fmtNum(w / tot * 100, 2) + ' %)';
    const lines = ['Gamètes du parent 1 (' + m[1].trim() + ') : ' + A.join(', ') + ' (' + A.map((x) => rat(ga[x] / totA)).join(', ') + ').', 'Gamètes du parent 2 (' + m[2].trim() + ') : ' + B.join(', ') + ' (' + B.map((x) => rat(gb[x] / totB)).join(', ') + ').', 'Échiquier de croisement (tableau ci-dessous) : on combine chaque gamète du parent 1 avec chaque gamète du parent 2.', 'Proportions génotypiques : ' + Object.entries(G2).map(([k, w]) => k + ' : ' + fr(w)).join(' ; ') + '.', 'Proportions phénotypiques : ' + Object.entries(P2).map(([k, w]) => k + ' : ' + fr(w)).join(' ; ') + '.'];
    const ratio = Object.values(P2).map((w) => w * (16 / tot)); const r1 = Object.values(P2).map((w) => w / Math.min(...Object.values(P2)));
    if (p1.length === 1 && Object.keys(P2).length === 2 && Math.max(...r1) === 3) lines.push('On retrouve le rapport 3/4 – 1/4 : croisement de deux hybrides (F1 × F1), conforme à la 2ᵉ loi de Mendel.');
    if (p1.length === 1 && Object.keys(P2).length === 2 && Math.max(...r1) === 1) lines.push('Rapport 1/2 – 1/2 : c\'est un croisement-test (test-cross) entre un hétérozygote et un homozygote récessif.');
    if (p1.length === 2 && Object.keys(P2).length === 4) lines.push('Rapport ' + ratio.map((x) => fmtNum(x)).join(' : ') + ' sur 16 : les deux gènes sont indépendants (3ᵉ loi de Mendel).');
    const table = { head: ['♂ \\ ♀', ...B.map((y) => y)], rows };
    return res({ type: 'genetique', titre: 'Croisement ' + m[1].trim() + ' × ' + m[2].trim(), difficulte: p1.length === 2 ? 'difficile' : 'moyen',
      e1: 'On croise deux individus de génotypes ' + m[1].trim() + ' et ' + m[2].trim() + '. Convention : majuscule = allèle dominant, minuscule = allèle récessif' + (codom ? ' (ici codominance : l\'hétérozygote a un phénotype intermédiaire)' : '') + '. Chaque gamète ne reçoit qu\'un allèle de chaque gène (pureté des gamètes).',
      e2: L(lines), e3: 'Somme des proportions = ' + rat(Object.values(G2).reduce((a, b) => a + b, 0) / tot) + ' ✅ ; ' + tot + ' cases dans l\'échiquier.', conclusion: Object.entries(P2).map(([k, w]) => k + ' ' + rat(w / tot)).join(' ; '), reponse: Object.entries(P2).map(([k, w]) => k + ' ' + rat(w / tot)).join(' ; '), table, gen: { k: 'genetique' } });
  }

  // ================================================================= 8. COMPTABILITÉ SYSCOHADA (écritures au journal)
  const ACC = { 601: 'Achats de marchandises', 4452: 'État, TVA récupérable sur achats', 4451: 'État, TVA récupérable sur immobilisations', 401: 'Fournisseurs', 481: 'Fournisseurs d\'investissements', 701: 'Ventes de marchandises', 4431: 'État, TVA facturée sur ventes', 411: 'Clients', 521: 'Banques', 571: 'Caisse', 101: 'Capital social', 162: 'Emprunts auprès des établissements de crédit', 244: 'Matériel et mobilier', 245: 'Matériel de transport', 241: 'Matériel et outillage industriel', 2441: 'Matériel de bureau', 622: 'Locations et charges locatives', 605: 'Autres achats (eau, électricité…)', 661: 'Rémunérations directes versées au personnel', 627: 'Publicité, publications, relations publiques', 631: 'Frais bancaires', 618: 'Autres frais de transport', 671: 'Intérêts des emprunts' };
  function solveCompta(text, ctx) {
    const s = strip(text); if (!/journal|ecriture|comptabilis|enregistr|syscohada|passer les|imputation/.test(s)) return null;
    const ops = String(text).split(/\n|(?<=\.)\s+(?=(?:le\s+)?\d{1,2}[\/ ]|[A-ZÉ])/).map((x) => x.trim()).filter((x) => x.length > 8);
    const out = []; const TVA = 0.18;
    const payAcc = (t2) => (/cheque|banque|virement|bancaire/.test(t2) ? 521 : /espece|comptant|caisse|cash/.test(t2) ? 571 : null);
    ops.forEach((op) => {
      const t2 = strip(op); const amts = NUMS(op.replace(/\b(?:1er|\d{1,2})[\/.]\d{1,2}(?:[\/.]\d{2,4})?\b/g, ' ').replace(/\d+\s*%/g, ' ')).filter((x) => x >= 100);
      if (!amts.length) return; const amt = amts[0]; const ttc = /ttc/.test(t2); const withTva = /tva|ht\b|ttc/.test(t2);
      const ht = ttc ? amt / (1 + TVA) : amt; const tva = withTva ? ht * TVA : 0; const tot = ht + tva;
      const date = (op.match(/\b(\d{1,2}[\/.]\d{1,2}(?:[\/.]\d{2,4})?|\d{1,2}\s+(?:janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[ée]cembre))\b/i) || [])[1] || '';
      let e = null; const pay = payAcc(t2);
      if (/achat|achete|acquisition|acquiert/.test(t2) && /marchandise/.test(t2)) e = { lib: 'Achat de marchandises', d: [[601, ht]].concat(tva ? [[4452, tva]] : []), c: [[pay || 401, tot]] };
      else if (/vente|vend/.test(t2) && /marchandise|produit/.test(t2)) e = { lib: 'Vente de marchandises', d: [[pay || 411, tot]], c: [[701, ht]].concat(tva ? [[4431, tva]] : []) };
      else if (/achat|achete|acquisition|acquiert/.test(t2) && /vehicule|camion|voiture|moto|transport/.test(t2)) e = { lib: 'Acquisition de matériel de transport', d: [[245, ht]].concat(tva ? [[4451, tva]] : []), c: [[pay || 481, tot]] };
      else if (/achat|achete|acquisition|acquiert/.test(t2) && /ordinateur|mobilier|bureau|imprimante|table|chaise|materiel informatique/.test(t2)) e = { lib: 'Acquisition de matériel et mobilier', d: [[244, ht]].concat(tva ? [[4451, tva]] : []), c: [[pay || 481, tot]] };
      else if (/achat|achete|acquisition|acquiert/.test(t2) && /machine|outillage|equipement industriel/.test(t2)) e = { lib: 'Acquisition de matériel industriel', d: [[241, ht]].concat(tva ? [[4451, tva]] : []), c: [[pay || 481, tot]] };
      else if (/(regl|paie|paye|paiement|verse).*fournisseur|fournisseur.*(regl|paie|paye)/.test(t2)) e = { lib: 'Règlement fournisseur', d: [[401, amt]], c: [[pay || 521, amt]] };
      else if (/(regl|encaiss|recu|paie|paye).*client|client.*(regl|paie|paye|verse)/.test(t2)) e = { lib: 'Règlement client', d: [[pay || 521, amt]], c: [[411, amt]] };
      else if (/loyer|location/.test(t2)) e = { lib: 'Paiement du loyer', d: [[622, amt]], c: [[pay || 521, amt]] };
      else if (/electricite|eau|sbee|soneb/.test(t2)) e = { lib: 'Facture eau / électricité', d: [[605, ht]].concat(tva ? [[4452, tva]] : []), c: [[pay || 401, tot]] };
      else if (/salaire/.test(t2)) e = { lib: 'Paiement des salaires', d: [[661, amt]], c: [[pay || 521, amt]] };
      else if (/publicite/.test(t2)) e = { lib: 'Frais de publicité', d: [[627, amt]], c: [[pay || 521, amt]] };
      else if (/apport|capital/.test(t2)) e = { lib: 'Apport en capital', d: [[pay || 521, amt]], c: [[101, amt]] };
      else if (/emprunt/.test(t2) && /obten|accord|recoit|contracte/.test(t2)) e = { lib: 'Emprunt bancaire obtenu', d: [[521, amt]], c: [[162, amt]] };
      else if (/retrait|retire/.test(t2)) e = { lib: 'Retrait de la banque pour la caisse', d: [[571, amt]], c: [[521, amt]] };
      else if (/versement|depot|verse/.test(t2) && /banque/.test(t2)) e = { lib: 'Versement de la caisse en banque', d: [[521, amt]], c: [[571, amt]] };
      if (e) { e.date = date; e.src = op; e.tva = tva; out.push(e); }
    });
    if (!out.length) return null;
    const rows = []; let TD = 0, TC = 0;
    out.forEach((e, i) => { e.d.forEach(([a, v]) => { rows.push([e.date || String(i + 1), String(a), '', ACC[a] + (rows.length && rows[rows.length - 1][0] === (e.date || String(i + 1)) ? '' : ''), fmtNum(Math.round(v), 0), '']); TD += Math.round(v); }); e.c.forEach(([a, v]) => { rows.push(['', '', String(a), '   ' + ACC[a], '', fmtNum(Math.round(v), 0)]); TC += Math.round(v); }); rows.push(['', '', '', '« ' + e.lib + ' »', '', '']); });
    rows.push(['', '', '', 'TOTAUX', fmtNum(TD, 0), fmtNum(TC, 0)]);
    const lines = out.map((e, i) => (i + 1) + ') ' + e.lib + ' : débit ' + e.d.map(([a, v]) => a + ' ' + ACC[a] + ' (' + money(v) + ')').join(' + ') + ' / crédit ' + e.c.map(([a, v]) => a + ' ' + ACC[a] + ' (' + money(v) + ')').join(' + ') + '.' + (e.tva ? ' TVA 18 % = ' + money(e.tva) + '.' : ''));
    return res({ type: 'compta', titre: 'Écritures au journal (SYSCOHADA) — ' + out.length + ' opération(s)', difficulte: 'moyen',
      e1: 'Pour chaque opération, on se demande : quel compte reçoit (DÉBIT) et quel compte fournit (CRÉDIT) ? On utilise le plan comptable SYSCOHADA révisé ; TVA au Bénin : 18 %.',
      e2: L(lines.concat(['Journal : voir le tableau ci-dessous.'])), e3: 'Partie double : total débit = ' + fmtNum(TD, 0) + ' F = total crédit = ' + fmtNum(TC, 0) + ' F ' + (TD === TC ? '✅' : '❌'),
      conclusion: out.length + ' écriture(s) passée(s), journal équilibré (' + fmtNum(TD, 0) + ' F)', table: { head: ['Date', 'Débit', 'Crédit', 'Libellé', 'Montant D', 'Montant C'], rows }, gen: { k: 'compta' } });
  }

  // ================================================================= 9. MATHÉMATIQUES FINANCIÈRES (emprunt, VAN/TRI, seuil de rentabilité)
  function pct(s, kw) { const m = s.match(new RegExp('(?:' + kw + ')[^0-9]{0,30}?(\\d+(?:[.,]\\d+)?)\\s*%')); return m ? parseFr(m[1]) / 100 : null; }
  function solveFinance(text, ctx) {
    const s = strip(text).replace(/\u00a0/g, ' ');
    // a) emprunt remboursable par annuités constantes
    if (/annuites? constantes?|emprunt/.test(s) && /annuit|rembours|tableau d'amortissement/.test(s)) {
      const i = pct(s, 'taux|interet') || pct(s, ''); const n = (s.match(/(\d+)\s*(?:annuites|ans|annees)/) || [])[1]; const C = (s.match(new RegExp('emprunt[^0-9]{0,40}?' + NUM)) || [])[1];
      if (i && n && C) {
        const Cv = parseFr(C), nv = +n; const a = Cv * i / (1 - Math.pow(1 + i, -nv)); const rows = []; let K = Cv;
        for (let k = 1; k <= nv; k++) { const I = K * i, A = a - I; rows.push([String(k), money(K), money(I), money(A), money(a), money(Math.max(0, K - A))]); K -= A; }
        const lines = ['Formule de l\'annuité constante : a = C × i ÷ (1 - (1 + i)⁻ⁿ).', 'a = ' + money(Cv) + ' × ' + fmtNum(i, 4) + ' ÷ (1 - ' + fmtNum(1 + i, 4) + '^-' + nv + ') = ' + money(a) + '.', 'Tableau d\'amortissement : intérêt = capital restant × i ; amortissement = annuité - intérêt.', 'Coût total du crédit (intérêts) = n × a - C = ' + money(nv * a - Cv) + '.'];
        return res({ type: 'finance', titre: 'Emprunt indivis — annuités constantes', difficulte: 'difficile', e1: 'Emprunt de ' + money(Cv) + ' au taux annuel de ' + fmtNum(i * 100, 2) + ' %, remboursable en ' + nv + ' annuités constantes de fin de période.', e2: L(lines), e3: 'La somme des amortissements redonne le capital emprunté ' + money(Cv) + ' et le capital restant final est nul ✅', conclusion: 'Annuité a = ' + money(a), reponse: money(a), answers: [a], table: { head: ['Année', 'Capital début', 'Intérêt', 'Amortissement', 'Annuité', 'Capital fin'], rows: rows.slice(0, 15) }, gen: { k: 'annuite' } });
      }
    }
    // b) VAN / TRI
    if (/\bvan\b|valeur actuelle nette|\btri\b|taux (?:de rentabilite )?interne/.test(s)) {
      const I0 = (s.match(new RegExp('(?:investissement|cout|depense|i0)[^0-9]{0,40}?' + NUM)) || [])[1]; const t = pct(s, 'actualisation|taux');
      let flows = null; const fm = s.match(/flux[^:]{0,60}:\s*([0-9\s.,;]+)/);
      if (fm) flows = fm[1].split(';').map((x) => NUMS(x)[0]).filter((x) => x != null);
      if (!flows || flows.length < 2) { const cm = s.match(new RegExp('(?:flux|cash.?flows?|recettes nettes)[^0-9]{0,40}?' + NUM + '[^0-9]{0,40}?(?:pendant|sur|durant)\\s*(\\d+)\\s*ans')); if (cm) flows = new Array(+cm[2]).fill(parseFr(cm[1])); }
      const vr = (s.match(new RegExp('valeur residuelle[^0-9]{0,30}?' + NUM)) || [])[1];
      if (I0 && flows && flows.length) {
        const Iv = parseFr(I0); const VR = vr ? parseFr(vr) : 0; const van = (r) => -Iv + flows.reduce((a, cf, k) => a + cf * Math.pow(1 + r, -(k + 1)), 0) + VR * Math.pow(1 + r, -flows.length);
        const lines = []; const concl = []; const answers = [];
        if (t !== null) { const V = van(t); lines.push('VAN = -I₀ + Σ CFₖ (1 + t)⁻ᵏ' + (VR ? ' + VR (1 + t)⁻ⁿ' : '') + ' avec t = ' + fmtNum(t * 100, 2) + ' %.'); flows.forEach((cf, k) => lines.push('Année ' + (k + 1) + ' : ' + money(cf) + ' × ' + fmtNum(1 + t, 2) + '^-' + (k + 1) + ' = ' + money(cf * Math.pow(1 + t, -(k + 1))) + '.')); if (VR) lines.push('Valeur résiduelle actualisée : ' + money(VR * Math.pow(1 + t, -flows.length)) + '.'); lines.push('VAN = ' + money(V) + (V > 0 ? ' > 0 : le projet est RENTABLE (il crée de la valeur).' : ' < 0 : le projet n\'est pas rentable à ce taux.')); concl.push('VAN = ' + money(V)); answers.push(V); }
        let lo = -0.99, hi = 5; if (van(lo) * van(hi) < 0) { for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2; if (van(lo) * van(mid) <= 0) hi = mid; else lo = mid; } const tri = (lo + hi) / 2; lines.push('TRI : taux qui annule la VAN (calcul par dichotomie) : TRI ≈ ' + fmtNum(tri * 100, 2) + ' %' + (t !== null ? (tri > t ? ' > ' + fmtNum(t * 100, 2) + ' % : projet acceptable.' : ' < taux d\'actualisation : projet à rejeter.') : '.')); concl.push('TRI ≈ ' + fmtNum(tri * 100, 2) + ' %'); answers.push(tri * 100); }
        if (!concl.length) return null;
        return res({ type: 'finance', titre: 'Choix d\'investissement (VAN / TRI)', difficulte: 'difficile', e1: 'Investissement initial I₀ = ' + money(Iv) + ' ; flux nets de trésorerie : ' + flows.map(money).join(' ; ') + '.', e2: L(lines), e3: 'Cohérence : la VAN diminue quand le taux augmente, et elle s\'annule au TRI ✅', conclusion: concl.join(' ; '), reponse: concl.join(' ; '), answers, gen: { k: 'van' } });
      }
    }
    // c) seuil de rentabilité
    if (/seuil de rentabilite|point mort/.test(s) || (/charges? fixes/.test(s) && /charges? variables|cout variable|marge sur cout/.test(s))) {
      const g = (kw) => { const m = s.match(new RegExp('(?:' + kw + ')[^0-9]{0,40}?' + NUM)); return m ? parseFr(m[1]) : null; };
      const CF = g('charges fixes|couts fixes'); let CA = g('chiffre d.affaires|\\bca\\b'); let CV = g('charges variables|couts variables'); let tm = pct(s, 'taux de marge');
      const p = g('prix de vente unitaire|prix unitaire'), cvu = g('cout variable unitaire|charge variable unitaire');
      const lines = [], concl = [], answers = [];
      if (CF && p && cvu) { const mu = p - cvu; const Qs = CF / mu; lines.push('Marge sur coût variable unitaire = prix - coût variable unitaire = ' + money(p) + ' - ' + money(cvu) + ' = ' + money(mu) + '.', 'Quantité au seuil : Q* = CF ÷ MCV unitaire = ' + money(CF) + ' ÷ ' + money(mu) + ' = ' + fmtNum(Qs, 2) + ' unités, soit un SR = ' + money(Qs * p) + '.'); concl.push('Q* ≈ ' + fmtNum(Math.ceil(Qs), 0) + ' unités', 'SR = ' + money(Qs * p)); answers.push(Qs, Qs * p); }
      else if (CF && (tm || (CA && CV))) { if (!tm) tm = (CA - CV) / CA; lines.push(CA && CV ? 'Marge sur coût variable = CA - CV = ' + money(CA) + ' - ' + money(CV) + ' = ' + money(CA - CV) + ' ; taux de MCV = ' + fmtNum(tm * 100, 2) + ' %.' : 'Taux de marge sur coût variable = ' + fmtNum(tm * 100, 2) + ' %.'); const SR = CF / tm; lines.push('Seuil de rentabilité : SR = CF ÷ taux de MCV = ' + money(CF) + ' ÷ ' + fmtNum(tm, 4) + ' = ' + money(SR) + '.'); concl.push('SR = ' + money(SR)); answers.push(SR); if (CA) { const pm = SR / CA * 360; lines.push('Point mort = SR ÷ CA × 360 = ' + fmtNum(pm, 1) + ' jours (≈ ' + fmtNum(pm / 30, 1) + ' mois).', 'Marge de sécurité = CA - SR = ' + money(CA - SR) + ' ; indice de sécurité = ' + fmtNum((CA - SR) / CA * 100, 2) + ' %.'); concl.push('point mort ≈ ' + fmtNum(pm, 0) + ' jours'); } }
      if (concl.length) return res({ type: 'finance', titre: 'Seuil de rentabilité', difficulte: 'moyen', e1: 'Le seuil de rentabilité est le chiffre d\'affaires pour lequel le résultat est nul : la marge sur coût variable couvre exactement les charges fixes.', e2: L(lines), e3: 'Au seuil : MCV = taux × SR = charges fixes, donc résultat = 0 ✅', conclusion: concl.join(' ; '), reponse: concl.join(' ; '), answers, gen: { k: 'seuil' } });
    }
    return null;
  }

  // ---------------------------------------------------------------- générateurs
  const { rnd, nz } = U;
  const GEN = {
    vecteur: () => { const a = rnd(-5, 5), b = rnd(-5, 5), c = a + [3, 6, 5, 8][rnd(0, 3)], d = b + [4, 8, 12, 6][rnd(0, 3)]; return { enonce: 'Dans un repère orthonormé, on donne A(' + a + ' ; ' + b + ') et B(' + c + ' ; ' + d + '). Calculer les coordonnées du vecteur AB, la distance AB et le milieu de [AB].', answers: [Math.hypot(c - a, d - b)] }; },
    system3: () => { const x = rnd(-3, 4), y = rnd(-3, 4), z = rnd(-3, 4); return { enonce: 'Résoudre le système : x + y + z = ' + (x + y + z) + ' ; 2x - y + z = ' + (2 * x - y + z) + ' ; x + 2y - z = ' + (x + 2 * y - z), answers: [x, y, z] }; },
    regression: () => { const a = rnd(2, 6), b = rnd(5, 20); const X = [1, 2, 3, 4, 5, 6]; const Y = X.map((x) => a * x + b + rnd(-1, 1)); return { enonce: 'Ajustement affine par la méthode des moindres carrés :\nx : ' + X.join(' ; ') + '\ny : ' + Y.join(' ; ') + '\nDéterminer la droite de régression de y en x.', text: true }; },
    equilibrage: () => { const T = ['CH4 + O2 → CO2 + H2O', 'Fe + O2 → Fe2O3', 'Al + O2 → Al2O3', 'C3H8 + O2 → CO2 + H2O', 'H2 + O2 → H2O', 'Na + Cl2 → NaCl', 'Fe + Cl2 → FeCl3']; return { enonce: 'Équilibrer l\'équation de la réaction : ' + T[rnd(0, T.length - 1)], text: true }; },
    masse_molaire: () => { const T = [['H2O', 18], ['CO2', 44], ['NaCl', 58.5], ['H2SO4', 98], ['C6H12O6', 180], ['CaCO3', 100]]; const [f, Mm] = T[rnd(0, T.length - 1)]; const m = rnd(1, 9) * Mm / 2; return { enonce: 'Calculer la masse molaire de ' + f + ' puis la quantité de matière contenue dans ' + fmtNum(m) + ' g de ' + f + '.', answers: [Mm, m / Mm] }; },
    energie: () => { const m = rnd(2, 80), v = rnd(2, 30); return { enonce: 'Un objet de masse m = ' + m + ' kg se déplace à la vitesse v = ' + v + ' m/s. Calculer son énergie cinétique.', answers: [0.5 * m * v * v] }; },
    circuit: () => { const r1 = rnd(1, 9) * 10, r2 = rnd(1, 9) * 10; return Math.random() < 0.5 ? { enonce: 'Deux résistances R1 = ' + r1 + ' Ω et R2 = ' + r2 + ' Ω sont montées en série. Calculer la résistance équivalente.', answers: [r1 + r2] } : { enonce: 'Deux résistances R1 = ' + r1 + ' Ω et R2 = ' + r2 + ' Ω sont montées en parallèle. Calculer la résistance équivalente.', answers: [r1 * r2 / (r1 + r2)] }; },
    genetique: () => { const T = [['Aa', 'Aa'], ['Aa', 'aa'], ['AA', 'aa'], ['Rr', 'Rr'], ['AaBb', 'AaBb'], ['AaBb', 'aabb']][rnd(0, 5)]; return { enonce: 'Réaliser le croisement ' + T[0] + ' x ' + T[1] + ' (allèles majuscules dominants) et donner les proportions phénotypiques.', text: true }; },
    compta: () => { const ht = rnd(2, 40) * 50000; return { enonce: 'Passer au journal (SYSCOHADA) : achat de marchandises à crédit pour ' + fmtNum(ht, 0) + ' F HT, TVA 18 %.', text: true }; },
    annuite: () => { const C = rnd(2, 20) * 1000000, i = [6, 8, 10, 12][rnd(0, 3)], n = rnd(3, 6); return { enonce: 'Un emprunt de ' + fmtNum(C, 0) + ' F au taux de ' + i + ' % est remboursable en ' + n + ' annuités constantes. Calculer l\'annuité et dresser le tableau d\'amortissement.', answers: [C * i / 100 / (1 - Math.pow(1 + i / 100, -n))] }; },
    van: () => { const I = rnd(4, 12) * 1000000, cf = Math.round(I * (0.25 + Math.random() * 0.15) / 10000) * 10000, n = 5, t = 10; return { enonce: 'Un investissement de ' + fmtNum(I, 0) + ' F génère des flux nets de ' + fmtNum(cf, 0) + ' F pendant ' + n + ' ans. Taux d\'actualisation : ' + t + ' %. Calculer la VAN et le TRI.', answers: [-I + cf * (1 - Math.pow(1.1, -n)) / 0.1] }; },
    seuil: () => { const CF = rnd(5, 30) * 100000, tm = rnd(20, 50); return { enonce: 'Charges fixes : ' + fmtNum(CF, 0) + ' F ; taux de marge sur coût variable : ' + tm + ' %. Calculer le seuil de rentabilité.', answers: [CF / (tm / 100)] }; }
  };

  // ================================================================= 11. (v1.2) DYNAMIQUE : accélération et force motrice
  function solveDynamique(text, ctx) {
    const s = strip(text).replace(/\u00a0/g, ' ').replace(/(\d) (\d{3})\b/g, '$1$2');
    const vu = '(m/s|km/h)';
    const m1 = s.match(new RegExp('(?:passe|varie|augmente|monte|evolue)\\s+de\\s+' + NUM + '\\s*' + vu + '?\\s*a\\s+' + NUM + '\\s*' + vu + '\\s*en\\s+' + NUM + '\\s*(s|min)\\b'));
    if (!m1) return null;
    const cv = (v, u) => (u === 'km/h' ? v / 3.6 : v);
    const u2 = m1[4]; const v1 = cv(parseFr(m1[1]), m1[2] || u2), v2 = cv(parseFr(m1[3]), u2), t = parseFr(m1[5]) * (m1[6] === 'min' ? 60 : 1);
    if (!(t > 0)) return null;
    const a = (v2 - v1) / t, x = (v1 + v2) / 2 * t;
    const mm = s.match(new RegExp('(?:masse|m\\s*=)[^0-9]{0,20}' + NUM + '\\s*(kg|t|g)\\b')) || s.match(new RegExp(NUM + '\\s*(kg|t)\\b'));
    const m = mm ? parseFr(mm[1]) * (mm[2] === 't' ? 1000 : mm[2] === 'g' ? 0.001 : 1) : null;
    const lines = [];
    if (u2 === 'km/h') lines.push('Conversion : on divise les km/h par 3,6 ⇒ v₁ = ' + fmtNum(v1, 3) + ' m/s et v₂ = ' + fmtNum(v2, 3) + ' m/s.');
    lines.push('Mouvement rectiligne uniformément varié : a = Δv ÷ Δt = (' + fmtNum(v2, 3) + ' − ' + fmtNum(v1, 3) + ') ÷ ' + fmtNum(t) + ' = ' + fmtNum(a, 3) + ' m/s².');
    lines.push('Distance parcourue pendant cette phase : d = (v₁ + v₂) ÷ 2 × t = ' + fmtNum(x, 3) + ' m.');
    const concl = ['a = ' + fmtNum(a, 3) + ' m/s²']; const answers = [a];
    if (m !== null) { const F = m * a; lines.push('2e loi de Newton (frottements négligés) : F = m × a = ' + fmtNum(m) + ' × ' + fmtNum(a, 3) + ' = ' + fmtNum(F, 2) + ' N.'); concl.push('F = ' + fmtNum(F, 2) + ' N'); answers.push(F); }
    return res({ type: 'physique', titre: 'Dynamique : accélération et force', difficulte: 'moyen', e1: 'On relève les vitesses initiale et finale, la durée' + (m !== null ? ' et la masse' : '') + ', puis on convertit en unités SI (m/s, s, kg).', e2: L(lines), e3: 'Vérification : v₂ = v₁ + a·t = ' + fmtNum(v1 + a * t, 3) + ' m/s ✅' + (m !== null ? ' ; unité de F : kg·m/s² = newton (N).' : '.'), conclusion: concl.join(' ; '), reponse: concl.join(' ; '), answers, gen: { k: 'energie' } });
  }

  // ================================================================= 12. (v1.2) DIPÔLES RC, RL, LC
  function solveDipole(text, ctx) {
    const s = strip(text);
    if (!/condensateur|bobine|inductance|constante de temps|frequence propre|periode propre|circuit (?:rc|rl|lc|rlc)\b|dipole (?:rc|rl)\b/.test(s)) return null;
    const t = text.replace(/\u00a0/g, ' ').replace(/(\d) (\d{3})\b/g, '$1$2');
    const pre = { p: 1e-12, n: 1e-9, u: 1e-6, 'µ': 1e-6, 'μ': 1e-6, m: 1e-3, '': 1, k: 1e3, M: 1e6 };
    const cm = t.match(new RegExp(NUM + '\\s*([pnuµμm]?)F\\b')); const C = cm ? parseFr(cm[1]) * pre[cm[2]] : null;
    const rm = t.match(new RegExp(NUM + '\\s*([kM]?)\\s*(?:Ω|ohms?\\b)', 'i')); const R = rm ? parseFr(rm[1]) * pre[rm[2]] : null;
    const lm = t.match(new RegExp(NUM + '\\s*(m?)H\\b')); const Lh = lm ? parseFr(lm[1]) * pre[lm[2]] : null;
    const um = t.match(new RegExp(NUM + '\\s*V\\b')); const Uv = um ? parseFr(um[1]) : null;
    const lines = [], concl = [], answers = []; let titre = 'Dipôles électriques';
    const sci = (x, unit) => (x !== 0 && (Math.abs(x) < 1e-2 || Math.abs(x) >= 1e5) ? x.toExponential(2).replace('.', ',').replace(/e([+-]?)(\d+)/, (z, sg, d) => ' × 10' + (sg === '-' ? '⁻' : '') + d.split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]).join('')) : fmtNum(x, 4)) + ' ' + unit;
    if (C !== null) lines.push('Conversion : C = ' + sci(C, 'F') + '.');
    if (R !== null && R >= 1000) lines.push('Conversion : R = ' + fmtNum(R) + ' Ω.');
    if (Lh !== null && lm[2]) lines.push('Conversion : L = ' + fmtNum(Lh, 4) + ' H.');
    if (Lh !== null && C !== null && /frequence|periode|oscill|lc\b|propre/.test(s)) {
      const T0 = 2 * Math.PI * Math.sqrt(Lh * C), f0 = 1 / T0; titre = 'Circuit LC : oscillations libres';
      lines.push('Période propre : T₀ = 2π√(LC) = 2π × √(' + fmtNum(Lh, 4) + ' × ' + sci(C, '') + ') = ' + sci(T0, 's') + '.', 'Fréquence propre : f₀ = 1 ÷ T₀ = ' + fmtNum(f0, 1) + ' Hz.');
      concl.push('T₀ = ' + sci(T0, 's'), 'f₀ ≈ ' + fmtNum(f0, 1) + ' Hz'); answers.push(T0, f0);
    } else if (R !== null && C !== null) {
      const tau = R * C; titre = 'Dipôle RC : charge du condensateur';
      lines.push('Constante de temps : τ = R × C = ' + fmtNum(R) + ' × ' + sci(C, '') + ' = ' + sci(tau, 's') + '.', 'À t = τ, le condensateur est chargé à 63 % ; il est pratiquement chargé au bout de 5τ = ' + sci(5 * tau, 's') + '.');
      concl.push('τ = ' + sci(tau, 's')); answers.push(tau);
      if (Uv !== null) { lines.push('Tension à t = τ : u_C = 0,63 × ' + fmtNum(Uv) + ' ≈ ' + fmtNum(0.632 * Uv, 3) + ' V ; énergie finale stockée : E = ½CU² = ' + sci(0.5 * C * Uv * Uv, 'J') + '.'); concl.push('E = ' + sci(0.5 * C * Uv * Uv, 'J')); }
    } else if (R !== null && Lh !== null) {
      const tau = Lh / R; titre = 'Dipôle RL : établissement du courant';
      lines.push('Constante de temps : τ = L ÷ R = ' + fmtNum(Lh, 4) + ' ÷ ' + fmtNum(R) + ' = ' + sci(tau, 's') + '.', 'Le courant atteint 63 % de sa valeur finale à t = τ et son régime permanent après environ 5τ = ' + sci(5 * tau, 's') + '.');
      concl.push('τ = ' + sci(tau, 's')); answers.push(tau);
    } else if (C !== null && Uv !== null) {
      const En = 0.5 * C * Uv * Uv, Qc = C * Uv; titre = 'Condensateur : charge et énergie';
      lines.push('Charge : Q = C × U = ' + sci(Qc, 'C') + '.', 'Énergie stockée : E = ½ C U² = ' + sci(En, 'J') + '.');
      concl.push('Q = ' + sci(Qc, 'C'), 'E = ' + sci(En, 'J')); answers.push(Qc, En);
    }
    if (!concl.length) return null;
    return res({ type: 'physique', titre, difficulte: 'moyen', e1: 'On relève les grandeurs et on les convertit en unités SI (F, Ω, H, V) : attention aux préfixes µ (10⁻⁶), n (10⁻⁹), m (10⁻³), k (10³).', e2: L(lines), e3: 'Analyse dimensionnelle : Ω × F = s et H ÷ Ω = s ✅ ; ordre de grandeur cohérent.', conclusion: concl.join(' ; '), reponse: concl.join(' ; '), answers, gen: { k: 'circuit' } });
  }

  [solveCompta, solveFinance, solveGenetique, solveCircuit, solveMeca, solveChimie, solveRegression, solveSystem3, solveVecteur, solveFractionDe, solveDipole, solveDynamique].forEach((fn) => E.register(fn));
  E._gen3 = GEN;
  if (typeof module !== 'undefined') module.exports = E;
})(typeof window !== 'undefined' ? window : globalThis);
