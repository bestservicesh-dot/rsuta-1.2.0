/* RSuta v1.1 — app2.js : module de révision
   Réviser (hub) • Diagnostic • Plan de révision • Examen blanc chronométré • Fiches • Cartes mémoire (Leitner) • Points faibles
   Éditeur : BSH - Best Services and House */
(function () {
  'use strict';
  const App = window.RSutaApp; if (!App || !App._) return;
  const X = App._;
  const { R, shell, phead, paginate, pager, modal, toast, esc, NIV, fmtDate, mx, stepsHTML, KINDS, confirmBox } = X;
  const D = window.RSutaData, DB = window.RSutaDB, Auth = window.RSutaAuth, Eng = window.RSutaEngine, Prof = window.RSutaProf, I = window.I, FI = window.RSutaFiches;
  const $ = (s) => document.querySelector(s);

  // ---------------------------------------------------------------- constantes
  // Dates indicatives (modifiables par l'élève dans « Mon plan »)
  const EXAM_DATES = { CEP: '2027-06-08', BEPC: '2027-06-15', BAC: '2027-06-21', LICENCE: '2027-07-01' };
  const EXAM_LABEL = { CEP: 'CEP', BEPC: 'BEPC', BAC: 'BAC', LICENCE: 'examens de Licence' };
  const EXAM_MIN = { CEP: 60, BEPC: 90, BAC: 120, LICENCE: 120 };
  const EXPRESS_MIN = 20;
  const LEITNER = [0, 1, 2, 4, 8, 16]; // intervalle (jours) par boîte 1..5
  const NEW_PER_DAY = 10;

  // ---------------------------------------------------------------- utilitaires
  const uid = () => Auth.current.id;
  const niv = () => Auth.current.niveau;
  const pad = (n) => String(n).padStart(2, '0');
  const dayStr = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = () => dayStr(new Date());
  const addDays = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return dayStr(d); };
  const diffDays = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const chapters = (n) => D.chapitres.filter((c) => c.niveau === (n || niv()));
  const chap = (id) => D.chapitres.find((c) => c.id === id);
  const matOf = (c) => { const m = D.matieres.find((x) => x.id === c.matiere_id); return m ? m.nom : ''; };
  const quizOf = (cid) => D.quiz.find((q) => q.chapitre_id === cid);
  const examDate = (n) => localStorage.getItem('rsuta.examdate.' + uid() + '.' + (n || niv())) || EXAM_DATES[n || niv()];
  const daysLeft = (n) => Math.max(0, diffDays(today(), examDate(n)));
  const pct = (x) => Math.round(x * 100);

  // ---------------------------------------------------------------- maîtrise par chapitre
  function mastery(n) {
    n = n || niv();
    const T = DB.where('tentatives', (t) => t.user_id === uid() && t.chapitre_id);
    const diag = DB.where('diagnostics', (d) => d.user_id === uid() && d.niveau === n).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    return chapters(n).map((c) => {
      const t = T.filter((x) => x.chapitre_id === c.id).slice(-20); // 20 dernières tentatives
      const ok = t.filter((x) => x.ok).length;
      const dm = diag && diag.scores ? diag.scores[matOf(c)] : undefined;
      let m = null;
      if (t.length) m = ok / t.length; if (dm !== undefined) m = m === null ? dm : (m * t.length + dm * 2) / (t.length + 2);
      return { c, n: t.length, ok, m, mat: matOf(c) };
    });
  }

  // ---------------------------------------------------------------- cartes mémoire (Leitner)
  function cardRows() { return DB.where('cartes', (r) => r.user_id === uid()); }
  function newSeenToday() { const t = today(); return cardRows().filter((r) => r.seen_on === t).length; }
  function dueQueue(chapId) {
    const all = chapId ? FI.cards(chapId) : FI.allCards(niv());
    const rows = cardRows(); const byId = {}; rows.forEach((r) => { byId[r.card_id] = r; });
    const t = today();
    const due = all.filter((c) => byId[c.id] && byId[c.id].due <= t).sort((a, b) => byId[a.id].box - byId[b.id].box);
    const quota = Math.max(0, NEW_PER_DAY - newSeenToday());
    const fresh = all.filter((c) => !byId[c.id]).slice(0, quota);
    return { due, fresh, total: all.length, known: all.filter((c) => byId[c.id] && byId[c.id].box >= 4).length };
  }
  function boxStats() { const s = [0, 0, 0, 0, 0, 0]; const ids = new Set(FI.allCards(niv()).map((c) => c.id)); cardRows().forEach((r) => { if (ids.has(r.card_id)) s[r.box]++; }); return s; }
  function grade(card, ok) {
    let r = DB.find('cartes', (x) => x.user_id === uid() && x.card_id === card.id);
    if (!r) r = DB.insert('cartes', { user_id: uid(), card_id: card.id, chap: card.chap, box: 1, due: today(), seen_on: today(), reviews: 0, lapses: 0 });
    const box = ok ? Math.min(5, (r.box || 1) + 1) : 1;
    DB.update('cartes', r.id, { box, due: addDays(today(), ok ? LEITNER[box] : 1), reviews: (r.reviews || 0) + 1, lapses: (r.lapses || 0) + (ok ? 0 : 1), last: new Date().toISOString() });
    if (card.chap) DB.insert('tentatives', { user_id: uid(), source: 'carte', chapitre_id: card.chap, niveau: niv(), ok: !!ok });
  }

  // ---------------------------------------------------------------- plan de révision
  function currentPlan() { return DB.where('plans', (p) => p.user_id === uid() && p.niveau === niv()).sort((a, b) => b.created_at.localeCompare(a.created_at))[0]; }
  function buildPlan() {
    const n = niv(); const start = today(); const end = examDate(n); let len = diffDays(start, end);
    if (len < 1) len = 14; len = Math.min(len, 270);
    const ms = mastery(n).sort((a, b) => (a.m === null ? 0.5 : a.m) - (b.m === null ? 0.5 : b.m));
    // les chapitres faibles (< 50 %) reviennent deux fois plus souvent
    const cycle = []; ms.forEach((x) => { cycle.push(x.c.id); }); ms.filter((x) => x.m !== null && x.m < 0.5).forEach((x) => cycle.push(x.c.id));
    const days = []; let k = 0;
    for (let i = 0; i < len; i++) {
      const date = addDays(start, i);
      if ((i + 1) % 7 === 0) days.push({ date, type: 'examen', done: false });
      else { days.push({ date, type: 'chap', chapitre_id: cycle[k % cycle.length], done: false }); k++; }
    }
    DB.where('plans', (p) => p.user_id === uid() && p.niveau === n).forEach((p) => DB.remove('plans', p.id));
    return DB.insert('plans', { user_id: uid(), niveau: n, exam_date: end, days });
  }
  function todayTask() { const p = currentPlan(); if (!p) return null; const t = today(); const i = p.days.findIndex((d) => d.date === t); return i < 0 ? null : { plan: p, day: p.days[i], i }; }

  // ---------------------------------------------------------------- carte d'accueil
  function homeCard() {
    try {
      const n = niv(), left = daysLeft(n), q = dueQueue(), tt = todayTask();
      const task = tt ? (tt.day.type === 'examen' ? '📝 Examen blanc express' : '📘 ' + esc(chap(tt.day.chapitre_id).titre)) : 'Crée ton plan de révision personnalisé';
      return `<div class="revcard" id="revcard"><div class="rc-top"><div class="cd"><b>J-${left}</b><small>avant le ${EXAM_LABEL[n]}</small></div><div class="rc-tx"><small>Plan du jour${tt && tt.day.done ? ' ✅' : ''}</small><b>${task}</b></div></div>
        <div class="rc-act"><button class="btn y sm" onclick="A.go('${tt ? (tt.day.type === 'examen' ? 'examen' : 'fiche/' + tt.day.chapitre_id) : 'plan'}')">${tt ? 'Commencer' : 'Créer mon plan'}</button><button class="btn sm o" onclick="A.go('cartes')">🃏 ${q.due.length + q.fresh.length} carte(s)</button><button class="btn sm o" onclick="A.go('revision')">Réviser</button></div></div>`;
    } catch (e) { return ''; }
  }

  // ================================================================= HUB « RÉVISER »
  R.revision = () => {
    const n = niv(), left = daysLeft(n), q = dueQueue(), ms = mastery(n), known = ms.filter((x) => x.m !== null);
    const avg = known.length ? pct(known.reduce((a, x) => a + x.m, 0) / known.length) : null;
    const ex = DB.where('examens', (e) => e.user_id === uid()).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    const tile = (r, ic, t, s, y) => `<button class="tile ${y ? 'y' : ''}" onclick="A.go('${r}')"><span class="ti">${ic}</span><b>${t}</b><small>${s}</small></button>`;
    shell('revision', phead('Réviser') + `<div class="body scroll"><div class="wrap">
      <div class="countdown"><div><b>J-${left}</b><span>avant le ${EXAM_LABEL[n]}</span></div><div class="cd-meta"><small>Date indicative : ${fmtDate(examDate(n))}</small><button class="btn sm y" onclick="A.go('plan')">Mon plan</button></div></div>
      <div class="statrow"><div><b>${avg === null ? '—' : avg + ' %'}</b><small>Maîtrise moyenne</small></div><div><b>${q.due.length + q.fresh.length}</b><small>Cartes du jour</small></div><div><b>${ex ? String(ex.score).replace('.', ',') + '/20' : '—'}</b><small>Dernier examen</small></div></div>
      <div class="tiles">
        ${tile('diag', '🎯', 'Diagnostic', 'Teste ton niveau en 10 min')}
        ${tile('plan', '🗓️', 'Mon plan', 'Un chapitre par jour jusqu\'à l\'examen', true)}
        ${tile('examen', '⏱️', 'Examen blanc', EXAM_MIN[n] + ' min ou express ' + EXPRESS_MIN + ' min, noté /20', true)}
        ${tile('fiches', '📄', 'Fiches', 'L\'essentiel, formules, pièges')}
        ${tile('cartes', '🃏', 'Cartes mémoire', 'Répétition espacée (Leitner)')}
        ${tile('faiblesses', '📉', 'Points faibles', 'Ce qu\'il faut retravailler', true)}
      </div></div></div>`);
  };

  // ================================================================= DIAGNOSTIC
  let DG = null;
  R.diag = (step) => {
    const n = niv();
    if (step === 'r') return diagResult();
    if (!DG || DG.niv !== n) {
      const mats = D.matieres.filter((m) => m.niveau === n); const qs = [];
      mats.forEach((m) => {
        const cids = D.chapitres.filter((c) => c.matiere_id === m.id).map((c) => c.id);
        const pool = D.questions.filter((q) => q.type !== 'ouverte' && cids.some((cid) => { const z = quizOf(cid); return z && z.id === q.quiz_id; }));
        shuffle(pool).slice(0, mats.length > 6 ? 1 : 2).forEach((q) => qs.push({ q, mat: m.nom, chap: (D.quiz.find((z) => z.id === q.quiz_id) || {}).chapitre_id }));
      });
      DG = { niv: n, qs: qs.slice(0, 12), ans: {} };
    }
    shell('revision', phead('Diagnostic', 'revision') + `<div class="body scroll"><div class="wrap" style="max-width:780px">
      <div class="card mb"><b>🎯 ${DG.qs.length} questions couvrant toutes tes matières (${n}).</b><p class="muted" style="margin:6px 0 0">Réponds sans regarder le cours : on cherche tes vrais points forts et points faibles. Ensuite, je te prépare un plan sur mesure.</p></div>
      ${DG.qs.map((x, i) => `<div class="card mb exq"><small class="pill">${esc(x.mat)}</small><p class="qt"><b>${i + 1}.</b> ${mx(x.q.enonce)}</p><div class="opts">${(x.q.type === 'vf' ? ['Vrai', 'Faux'] : x.q.options).map((o) => `<label class="ro"><input type="radio" name="dg${i}" value="${esc(o)}" ${DG.ans[i] === o ? 'checked' : ''} onchange="A.dgAns(${i}, this.value)"> <span>${mx(o)}</span></label>`).join('')}</div></div>`).join('')}
      <button class="btn block y" onclick="A.dgSubmit()">Voir mon diagnostic</button></div></div>`);
  };
  function diagResult() {
    const d = DB.where('diagnostics', (x) => x.user_id === uid() && x.niveau === niv()).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    if (!d) return A.go('diag');
    const rows = Object.entries(d.scores).sort((a, b) => a[1] - b[1]);
    shell('revision', phead('Mon diagnostic', 'revision') + `<div class="body scroll"><div class="wrap" style="max-width:780px">
      <div class="card center mb"><div class="score">${d.total}%</div><p class="muted" style="margin:0">Score global • ${fmtDate(d.created_at)}</p></div>
      <h3 class="sub">Par matière</h3><div class="list">${rows.map(([m, v]) => `<div class="item"><span class="tx"><b>${esc(m)}</b><span class="meter"><i style="width:${Math.max(3, pct(v))}%" class="${v < 0.5 ? 'lo' : v < 0.75 ? 'mid' : 'hi'}"></i></span></span><b>${pct(v)}%</b></div>`).join('')}</div>
      <p class="muted">${rows.length && rows[0][1] < 0.5 ? 'Priorité : ' + esc(rows[0][0]) + '. Ton plan commencera par là. 💪' : 'Beau travail ! On va consolider avec un plan régulier.'}</p>
      <div class="row2 mt"><button class="btn o" onclick="A.dgRetry()">Refaire</button><button class="btn y" onclick="A.planBuild()">Générer mon plan</button></div></div></div>`);
  }

  // ================================================================= PLAN
  R.plan = () => {
    const n = niv(); const p = currentPlan();
    const head = `<div class="card mb"><div class="field" style="margin:0"><label>Date de ton examen (${EXAM_LABEL[n]})</label><div class="search" style="margin:0"><input type="date" class="input" id="exd" value="${examDate(n)}"><button class="btn sm" onclick="A.setExamDate()">Enregistrer</button></div><small class="muted">Date indicative pré-remplie : vérifie le calendrier officiel publié par le ministère et corrige-la si besoin.</small></div></div>`;
    if (!p) {
      shell('revision', phead('Mon plan', 'revision') + `<div class="body scroll"><div class="wrap" style="max-width:820px">${head}
        <div class="card center"><div style="font-size:44px">🗓️</div><p><b>Pas encore de plan.</b><br><span class="muted">Je répartis tes ${chapters(n).length} chapitres jusqu'à l'examen, en commençant par tes points faibles, avec un examen blanc chaque semaine.</span></p>
        <div class="row2"><button class="btn o" onclick="A.go('diag')">Faire le diagnostic d'abord</button><button class="btn y" onclick="A.planBuild()">Créer mon plan</button></div></div></div></div>`);
      return;
    }
    const t = today(); const upcoming = p.days.filter((d) => d.date >= t); const doneN = p.days.filter((d) => d.done).length;
    const pg = paginate('plan', upcoming);
    shell('revision', phead('Mon plan', 'revision') + `<div class="body scroll"><div class="wrap" style="max-width:820px">${head}
      <div class="statrow"><div><b>${doneN}/${p.days.length}</b><small>Jours faits</small></div><div><b>J-${daysLeft(n)}</b><small>Avant l'examen</small></div><div><b>${upcoming.filter((d) => d.type === 'examen').length}</b><small>Examens blancs</small></div></div>
      <div class="list">${pg.rows.map((d) => { const i = p.days.indexOf(d); const c = d.chapitre_id && chap(d.chapitre_id); const isT = d.date === t; return `<div class="item plan-day ${isT ? 'today' : ''} ${d.done ? 'done' : ''}"><span class="ic ${d.type === 'examen' ? 'y' : ''}">${d.type === 'examen' ? '⏱️' : '📘'}</span><span class="tx"><b>${isT ? 'Aujourd\'hui • ' : ''}${fmtDate(d.date)}</b><small>${d.type === 'examen' ? 'Examen blanc express (' + EXPRESS_MIN + ' min)' : esc(c ? c.titre : '') + ' • fiche, cartes et quiz'}</small></span>
        <span class="pd-act"><button class="btn sm ${d.done ? 'o' : ''}" onclick="A.go('${d.type === 'examen' ? 'examen' : 'fiche/' + d.chapitre_id}')">${d.type === 'examen' ? 'Passer' : 'Réviser'}</button><button class="btn sm o" onclick="A.planDone(${i})" aria-label="Marquer comme fait">${d.done ? '✅' : '☐'}</button></span></div>`; }).join('')}</div>
      ${pager('plan', pg)}
      <button class="btn o block mt" onclick="A.planRebuild()">Recalculer le plan (selon mes derniers résultats)</button></div></div>`);
  };

  // ================================================================= EXAMEN BLANC
  const EXKEY = () => 'rsuta.exam.' + uid();
  const exState = () => { try { return JSON.parse(localStorage.getItem(EXKEY()) || 'null'); } catch (e) { return null; } };
  const exSave = (s) => localStorage.setItem(EXKEY(), JSON.stringify(s));
  let exTimer = null;
  function buildExam(mode) {
    const n = niv(); const nGen = mode === 'express' ? 3 : 6, nQ = mode === 'express' ? 2 : 4;
    const kinds = shuffle(KINDS[n] || KINDS.BEPC); const qs = [];
    for (const k of kinds) { if (qs.length >= nGen) break; try { const g = Eng.generate(k, { niveau: n }); if (g && (g.answers || g.poly) && !g.text) qs.push({ t: 'gen', enonce: g.enonce, gen: g }); } catch (e) { /* */ } }
    let guard = 0; while (qs.length < nGen && guard++ < 20) { const g = Eng.generate(kinds[guard % kinds.length], { niveau: n }); if (g && (g.answers || g.poly) && !g.text) qs.push({ t: 'gen', enonce: g.enonce, gen: g }); }
    const qids = new Set(chapters(n).map((c) => (quizOf(c.id) || {}).id));
    shuffle(D.questions.filter((q) => qids.has(q.quiz_id) && q.type !== 'ouverte')).slice(0, nQ).forEach((q) => qs.push({ t: q.type, enonce: q.enonce, options: q.type === 'vf' ? ['Vrai', 'Faux'] : q.options, good: q.reponse_correcte, qid: q.id, chap: (D.quiz.find((z) => z.id === q.quiz_id) || {}).chapitre_id, expl: q.explication || '' }));
    const min = mode === 'express' ? EXPRESS_MIN : EXAM_MIN[n];
    const now = Date.now();
    return { id: 'ex' + now, mode, niv: n, start: now, end: now + min * 60000, min, qs, ans: {}, pts: 20 / qs.length };
  }
  R.examen = (a, b) => {
    if (a === 'r' && b) return examResult(b);
    const st = exState();
    if (st && a === 'go') return examPlay(st);
    const hist = DB.where('examens', (e) => e.user_id === uid()).sort((x, y) => y.created_at.localeCompare(x.created_at));
    const pg = paginate('examens', hist); const n = niv();
    shell('revision', phead('Examen blanc', 'revision') + `<div class="body scroll"><div class="wrap" style="max-width:820px">
      ${st ? `<div class="card mb warnc"><b>⏳ Un examen est en cours</b><p class="muted" style="margin:4px 0 10px">Le chrono continue même si tu quittes la page.</p><div class="row2"><button class="btn o" onclick="A.exAbandon()">Abandonner</button><button class="btn y" onclick="A.go('examen/go')">Reprendre</button></div></div>` : ''}
      <div class="tiles two">
        <button class="tile y" onclick="A.exStart('blanc')"><span class="ti">📝</span><b>Examen blanc ${n}</b><small>${EXAM_MIN[n]} min • 10 questions • noté /20 • conditions réelles</small></button>
        <button class="tile" onclick="A.exStart('express')"><span class="ti">⚡</span><b>Express</b><small>${EXPRESS_MIN} min • 5 questions • noté /20</small></button>
      </div>
      <p class="muted" style="font-size:13px">Règles : pas de cours, calculatrice autorisée pour BAC et Licence. À la fin du temps, ta copie est ramassée automatiquement. Les sujets sont des <b>sujets types (non officiels)</b> conformes au programme.</p>
      <h3 class="sub">Mes examens</h3>
      ${hist.length ? `<div class="list">${pg.rows.map((e) => `<button class="item" onclick="A.go('examen/r/${e.id}')"><span class="ic ${e.score >= 10 ? '' : 'y'}">${e.score >= 10 ? '🏅' : '📌'}</span><span class="tx"><b>${String(e.score).replace('.', ',')}/20 • ${mention(e.score)}</b><small>${e.mode === 'express' ? 'Express' : 'Examen blanc'} ${e.niveau} • ${fmtDate(e.created_at)} • ${Math.round(e.duree_s / 60)} min</small></span><span class="chev">${I.chev()}</span></button>`).join('')}</div>${pager('examens', pg)}` : '<p class="muted">Aucun examen pour l\'instant. Lance-toi !</p>'}
    </div></div>`);
  };
  function mention(s) { return s >= 16 ? 'Très bien' : s >= 14 ? 'Bien' : s >= 12 ? 'Assez bien' : s >= 10 ? 'Passable' : 'Insuffisant'; }
  function fmtLeft(ms) { ms = Math.max(0, ms); const s = Math.floor(ms / 1000); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? h + ':' + pad(m) : m) + ':' + pad(x); }
  function examPlay(st) {
    if (Date.now() >= st.end) return examSubmit(true);
    shell('revision', `<header class="phead">${I.pattern()}<h1>${st.mode === 'express' ? 'Express' : 'Examen blanc'} ${st.niv}</h1></header>
      <div class="extimer" id="extimer-bar"><span>⏱️ Temps restant</span><b id="extimer">${fmtLeft(st.end - Date.now())}</b><button class="btn sm y" onclick="A.exSubmitAsk()">Rendre ma copie</button></div>
      <div class="body scroll"><div class="wrap" style="max-width:820px">
      ${st.qs.map((q, i) => `<div class="card mb exq"><div class="exh"><b>Question ${i + 1}</b><span class="pill">${(st.pts).toFixed(st.pts % 1 ? 1 : 0).replace('.', ',')} pt${st.pts > 1 ? 's' : ''}</span></div><p class="qt">${mx(q.enonce)}</p>
        ${q.t === 'gen' ? `<div class="search" style="margin:0"><input class="input" id="exa${i}" placeholder="Ta réponse (valeur ou expression)" value="${esc(st.ans[i] || '')}" oninput="A.exAns(${i}, this.value)"><button class="btn sm o mkb" onclick="RSutaView.toggle('exa${i}', this)" aria-label="Clavier mathématique">√x</button></div>${window.RSutaView ? RSutaView.keypad('exa' + i) : ''}`
          : `<div class="opts">${q.options.map((o) => `<label class="ro"><input type="radio" name="exr${i}" value="${esc(o)}" ${st.ans[i] === o ? 'checked' : ''} onchange="A.exAns(${i}, this.value)"> <span>${mx(o)}</span></label>`).join('')}</div>`}</div>`).join('')}
      <button class="btn block y" onclick="A.exSubmitAsk()">Rendre ma copie</button></div></div>`, false);
    clearInterval(exTimer);
    exTimer = setInterval(() => {
      const el = document.getElementById('extimer'); const s = exState();
      if (!el || !s) { clearInterval(exTimer); return; }
      const left = s.end - Date.now(); el.textContent = fmtLeft(left);
      document.getElementById('extimer-bar').classList.toggle('late', left < 5 * 60000);
      if (left <= 0) { clearInterval(exTimer); examSubmit(true); }
    }, 1000);
  }
  function examSubmit(auto) {
    clearInterval(exTimer);
    const st = exState(); if (!st) return A.go('examen');
    let score = 0; const det = st.qs.map((q, i) => {
      const v = st.ans[i] || ''; let ok = false;
      if (q.t === 'gen') ok = !!(v && Eng.checkAnswer(q.gen, v)); else ok = v === q.good;
      if (ok) score += st.pts;
      DB.insert('tentatives', { user_id: uid(), source: 'examen', chapitre_id: q.chap || null, question_id: q.qid || null, kind: q.gen ? q.gen.k || null : null, niveau: st.niv, ok });
      return { enonce: q.enonce, t: q.t, v, ok, good: q.t === 'gen' ? (q.gen.answers || [q.gen.poly]).map((x) => typeof x === 'number' ? String(Math.round(x * 1000) / 1000).replace('.', ',') : x).join(' ; ') : q.good, expl: q.expl || '' };
    });
    score = Math.round(score * 4) / 4; // au quart de point
    const row = DB.insert('examens', { user_id: uid(), niveau: st.niv, mode: st.mode, score, details: det, duree_s: Math.round((Math.min(Date.now(), st.end) - st.start) / 1000), auto: !!auto });
    localStorage.removeItem(EXKEY());
    // coche l'examen du jour dans le plan
    const tt = todayTask(); if (tt && tt.day.type === 'examen') { tt.plan.days[tt.i].done = true; DB.save('plans'); }
    if (score >= 16) DB.notify(uid(), 'Examen blanc : ' + String(score).replace('.', ',') + '/20 🏆', 'Mention ' + mention(score) + ' ! Continue comme ça.', 'succes');
    if (auto) toast('⏰ Temps écoulé : copie ramassée automatiquement.', 3500);
    A.go('examen/r/' + row.id);
  }
  function examResult(id) {
    const e = DB.find('examens', (x) => x.id === id && x.user_id === uid()); if (!e) return A.go('examen');
    const msg = e.score >= 14 ? 'Excellent travail ! ' + Prof.pick(Prof.ENC[e.niveau]) : e.score >= 10 ? 'C\'est la moyenne : revois les erreurs ci-dessous et tu passes au niveau supérieur.' : 'Pas de panique mon enfant : chaque erreur corrigée aujourd\'hui, c\'est un point gagné le jour J. Revois les corrections !';
    shell('revision', phead('Résultat', 'examen') + `<div class="body scroll"><div class="wrap" style="max-width:820px">
      <div class="card center mb"><div class="score">${String(e.score).replace('.', ',')}<small>/20</small></div><p style="font-weight:800;margin:0">${mention(e.score)} • ${e.details.filter((d) => d.ok).length}/${e.details.length} juste(s)</p><p class="muted">${esc(msg)}</p>${e.auto ? '<small class="pill y">Copie ramassée à la fin du temps</small>' : ''}${window.RSutaApp3 ? `<div><button class="btn y sm mt" onclick="RSutaApp3.share('examen','${e.id}')" id="btn-share-exam">${I.share()} Partager ma note</button></div>` : ''}</div>
      <h3 class="sub">Correction</h3><div class="list">${e.details.map((d, i) => `<div class="item exc"><span class="ic ${d.ok ? '' : 'y'}">${d.ok ? '✅' : '❌'}</span><span class="tx"><b>${i + 1}. ${mx(d.enonce)}</b><small>Ta réponse : ${esc(d.v || '—')} • Attendu : ${mx(d.good)}${d.expl ? ' • ' + esc(d.expl) : ''}</small>${d.t === 'gen' ? `<button class="btn sm o" style="margin-top:8px" onclick="A.exCorr('${e.id}', ${i})">Voir la correction détaillée</button>` : ''}</span></div>`).join('')}</div>
      <div class="row2 mt"><button class="btn o" onclick="A.go('faiblesses')">Mes points faibles</button><button class="btn y" onclick="A.go('examen')">Nouvel examen</button></div></div></div>`);
  }

  // ================================================================= FICHES
  R.fiches = () => {
    const n = window._fniv || niv(); const mats = D.matieres.filter((m) => m.niveau === n); const fm = window._fmat || '';
    const q = (window._fsearch || '').toLowerCase();
    const list = chapters(n).filter((c) => FI.has(c.id) && (!fm || c.matiere_id === fm) && (!q || (c.titre + ' ' + matOf(c)).toLowerCase().includes(q)));
    const pg = paginate('fiches-' + n + fm, list);
    shell('revision', phead('Fiches de révision', 'revision') + `<div class="body scroll"><div class="wrap">
      <div class="tabs">${NIV.map((x) => `<button class="tab ${x === n ? 'on' : ''}" onclick="window._fniv='${x}';window._fmat='';A.go('fiches')">${x}</button>`).join('')}</div>
      <div class="search"><select class="input" style="max-width:240px" onchange="window._fmat=this.value;A.go('fiches')"><option value="">Toutes les matières</option>${mats.map((m) => `<option value="${m.id}" ${m.id === fm ? 'selected' : ''}>${esc(m.nom)}</option>`).join('')}</select><input class="input" placeholder="Rechercher une fiche…" value="${esc(window._fsearch || '')}" oninput="window._fsearch=this.value;clearTimeout(window._ft);window._ft=setTimeout(()=>A.page('fiches-${n}${fm}',1),350)"></div>
      <div class="list grid">${pg.rows.map((c) => `<button class="item" onclick="A.go('fiche/${c.id}')"><span class="ic y">${I.doc(22)}</span><span class="tx"><b>${esc(c.titre)}</b><small>${esc(matOf(c))} • ${FI.cards(c.id).length} cartes</small></span><span class="chev">${I.chev()}</span></button>`).join('') || '<p class="muted">Aucune fiche ne correspond.</p>'}</div>
      ${pager('fiches-' + n + fm, pg)}</div></div>`);
  };
  R.fiche = (id) => {
    const c = chap(id); const f = FI.get(id); if (!c || !f) return A.go('fiches');
    const qz = quizOf(id); const q = dueQueue(id);
    const ul = (arr, cls) => `<ul class="fl ${cls || ''}">${arr.map((x) => `<li>${mx(x)}</li>`).join('')}</ul>`;
    shell('revision', phead('Fiche', 'fiches', `<button class="act" onclick="A.ficheSpeak('${id}')" aria-label="Écouter la fiche">${I.speaker(24)}</button>`) + `<div class="body scroll"><div class="wrap" style="max-width:860px">
      <div class="fiche"><span class="pill">${esc(matOf(c))} • ${c.niveau}</span><h2>${esc(c.titre)}</h2>
        <section><h3>⭐ L'essentiel</h3>${ul(f.essentiel)}</section>
        <section class="fx"><h3>🧮 Formulaire</h3>${ul(f.formules, 'mono')}</section>
        <section class="px"><h3>⚠️ Pièges à éviter</h3>${ul(f.pieges)}</section>
        <section><h3>🃏 Cartes mémoire <small class="muted">(${f.cartes.length})</small></h3><div class="minicards">${f.cartes.slice(0, 3).map((k) => `<details class="mc"><summary>${mx(k.q)}</summary><p>${mx(k.a)}</p></details>`).join('')}</div></section>
      </div>
      <div class="ficheact"><button class="btn y" onclick="A.go('cartes/${id}')">🃏 Réviser les cartes (${q.due.length + q.fresh.length})</button>${qz ? `<button class="btn" onclick="A.go('quiz/${qz.id}')">${I.trophy(20)} Quiz du chapitre</button>` : ''}<button class="btn o" onclick="A.go('chapitre/${id}')">${I.book(20)} Leçons</button><button class="btn o" onclick="window.print()">${I.download(20)} Imprimer</button></div>
    </div></div>`);
  };

  // ================================================================= CARTES (Leitner)
  let CS = null;
  R.cartes = (chapId) => {
    chapId = chapId || '';
    if (!CS || CS.chap !== chapId || CS.done) { const q = dueQueue(chapId || null); CS = { chap: chapId, queue: q.due.concat(q.fresh), i: 0, flip: false, ok: 0, ko: 0, requeued: new Set(), done: false }; }
    const st = boxStats(); const card = CS.queue[CS.i];
    const back = chapId ? 'fiche/' + chapId : 'revision';
    const boxes = `<div class="boxes">${[1, 2, 3, 4, 5].map((b) => `<div><b>${st[b]}</b><small>Boîte ${b}<br>${LEITNER[b]} j</small></div>`).join('')}</div>`;
    if (!card) {
      CS.done = true;
      shell('revision', phead('Cartes mémoire', back) + `<div class="body scroll"><div class="wrap" style="max-width:640px">${boxes}
        <div class="card center"><div style="font-size:46px">🎉</div><p><b>${CS.ok + CS.ko ? 'Session terminée !' : 'Rien à réviser pour le moment.'}</b><br><span class="muted">${CS.ok + CS.ko ? CS.ok + ' sue(s), ' + CS.ko + ' à revoir. ' : ''}Reviens demain : les cartes reviennent au bon moment (1, 2, 4, 8 puis 16 jours). Maximum ${NEW_PER_DAY} nouvelles cartes par jour.</span></p><button class="btn y" onclick="A.go('${back}')">Terminer</button></div></div></div>`);
      return;
    }
    const c = chap(card.chap);
    shell('revision', phead('Cartes mémoire', back) + `<div class="body scroll"><div class="wrap" style="max-width:640px">${boxes}
      <div style="display:flex;justify-content:space-between;font-weight:800"><span>Carte ${CS.i + 1} / ${CS.queue.length}</span><span class="pill y">✅ ${CS.ok} • ❌ ${CS.ko}</span></div>
      <div class="qprog"><i style="width:${CS.i / CS.queue.length * 100}%"></i></div>
      <div class="flash ${CS.flip ? 'flip' : ''}" onclick="A.cardFlip()" role="button" tabindex="0" aria-label="Retourner la carte"><small>${esc(c ? c.titre : '')}</small><div class="fq">${mx(card.q)}</div>${CS.flip ? `<div class="fa">${mx(card.a)}</div>` : '<div class="hint">Touche pour voir la réponse</div>'}</div>
      ${CS.flip ? `<div class="row2 mt"><button class="btn r" onclick="A.cardGrade(false)">❌ À revoir</button><button class="btn" style="background:var(--ok)" onclick="A.cardGrade(true)">✅ Je savais</button></div>` : `<button class="btn block y mt" onclick="A.cardFlip()">Voir la réponse</button>`}
    </div></div>`);
  };

  // ================================================================= POINTS FAIBLES
  R.faiblesses = () => {
    const ms = mastery().filter((x) => x.m !== null).sort((a, b) => a.m - b.m);
    const pg = paginate('faiblesses', ms);
    const byMat = {}; ms.forEach((x) => { (byMat[x.mat] = byMat[x.mat] || []).push(x.m); });
    shell('revision', phead('Points faibles', 'revision') + `<div class="body scroll"><div class="wrap" style="max-width:820px">
      ${ms.length ? `<div class="card mb"><b>Par matière</b>${Object.entries(byMat).map(([m, v]) => { const a = v.reduce((s, x) => s + x, 0) / v.length; return `<div class="mrow"><span>${esc(m)}</span><span class="meter"><i class="${a < 0.5 ? 'lo' : a < 0.75 ? 'mid' : 'hi'}" style="width:${Math.max(3, pct(a))}%"></i></span><b>${pct(a)}%</b></div>`; }).join('')}</div>
      <h3 class="sub">Chapitres à retravailler en priorité</h3>
      <div class="list">${pg.rows.map((x) => { const qz = quizOf(x.c.id); return `<div class="item"><span class="ic ${x.m < 0.5 ? 'y' : ''}">${x.m < 0.5 ? '🔴' : x.m < 0.75 ? '🟠' : '🟢'}</span><span class="tx"><b>${esc(x.c.titre)}</b><small>${esc(x.mat)} • ${pct(x.m)} % de réussite • ${x.n} réponse(s)</small><span class="meter"><i class="${x.m < 0.5 ? 'lo' : x.m < 0.75 ? 'mid' : 'hi'}" style="width:${Math.max(3, pct(x.m))}%"></i></span></span><span class="pd-act"><button class="btn sm o" onclick="A.go('fiche/${x.c.id}')">Fiche</button>${qz ? `<button class="btn sm" onclick="A.go('quiz/${qz.id}')">Quiz</button>` : ''}</span></div>`; }).join('')}</div>${pager('faiblesses', pg)}`
        : `<div class="card center"><div style="font-size:44px">📊</div><p><b>Pas encore assez de données.</b><br><span class="muted">Fais le diagnostic, des quiz ou un examen blanc : je repère tout seul ce qu'il faut retravailler.</span></p><div class="row2"><button class="btn y" onclick="A.go('diag')">Diagnostic</button><button class="btn o" onclick="A.go('quiz')">Quiz</button></div></div>`}
    </div></div>`);
  };

  // ================================================================= ACTIONS
  Object.assign(window.A, {
    dgAns: (i, v) => { if (DG) DG.ans[i] = v; },
    dgRetry: () => { DG = null; A.go('diag'); },
    dgSubmit: () => {
      if (!DG) return; const miss = DG.qs.length - Object.keys(DG.ans).length;
      const go = () => {
        const per = {}; DG.qs.forEach((x, i) => { const ok = DG.ans[i] === x.q.reponse_correcte; (per[x.mat] = per[x.mat] || []).push(ok ? 1 : 0); DB.insert('tentatives', { user_id: uid(), source: 'diag', chapitre_id: x.chap, question_id: x.q.id, niveau: DG.niv, matiere: x.mat, ok }); });
        const scores = {}; Object.keys(per).forEach((m) => { scores[m] = per[m].reduce((a, b) => a + b, 0) / per[m].length; });
        const all = Object.values(per).flat(); DB.insert('diagnostics', { user_id: uid(), niveau: DG.niv, scores, total: pct(all.reduce((a, b) => a + b, 0) / all.length) });
        DG = null; A.go('diag/r');
      };
      if (miss > 0) confirmBox(miss + ' question(s) sans réponse : elles compteront comme fausses. Continuer ?', go, 'Valider'); else go();
    },
    planBuild: () => { buildPlan(); toast('🗓️ Plan créé : un chapitre par jour, examen blanc chaque semaine'); A.go('plan'); },
    planRebuild: () => confirmBox('Recalculer le plan selon tes derniers résultats ? Les cases déjà cochées seront remises à zéro.', () => { buildPlan(); A.go('plan'); }, 'Recalculer'),
    planDone: (i) => { const p = currentPlan(); if (!p || !p.days[i]) return; p.days[i].done = !p.days[i].done; DB.save('plans'); if (p.days[i].done) toast('Bravo ! Une journée de plus validée 💪'); App.route(); },
    setExamDate: () => { const v = $('#exd').value; if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return toast('Date invalide'); localStorage.setItem('rsuta.examdate.' + uid() + '.' + niv(), v); toast('Date enregistrée ✅'); const p = currentPlan(); if (p) confirmBox('Recalculer ton plan avec cette nouvelle date ?', () => { buildPlan(); A.go('plan'); }, 'Recalculer'); else App.route(); },
    exStart: (mode) => { const go = () => { const st = buildExam(mode); exSave(st); A.go('examen/go'); }; if (exState()) confirmBox('Un examen est déjà en cours. Le remplacer par un nouveau ?', go, 'Nouveau'); else go(); },
    exAns: (i, v) => { const s = exState(); if (!s) return; s.ans[i] = v; exSave(s); },
    exSubmitAsk: () => { const s = exState(); if (!s) return; const miss = s.qs.length - Object.keys(s.ans).filter((k) => String(s.ans[k]).trim()).length; confirmBox((miss ? miss + ' question(s) sans réponse. ' : '') + 'Rendre ta copie maintenant ?', () => examSubmit(false), 'Rendre'); },
    exAbandon: () => confirmBox('Abandonner l\'examen en cours ? Il ne sera pas noté.', () => { localStorage.removeItem(EXKEY()); clearInterval(exTimer); App.route(); }, 'Abandonner'),
    exCorr: (id, i) => { const e = DB.find('examens', (x) => x.id === id); if (!e) return; const r = Eng.solve(e.details[i].enonce, { niveau: e.niveau }); if (!r) return toast('Correction indisponible'); const f = Prof.format(r, e.niveau); modal('Correction détaillée', `<div class="thread" style="padding:0">${stepsHTML(f, { chips: false })}</div>`, [{ label: 'Fermer' }]); },
    ficheSpeak: (id) => { const f = FI.get(id); const c = chap(id); if (!f) return; if ('speechSynthesis' in window && speechSynthesis.speaking) { Prof.stopSpeak(); return; } Prof.speak(c.titre + '. L\'essentiel. ' + f.essentiel.join(' ') + ' Attention aux pièges. ' + f.pieges.join(' ')); },
    cardFlip: () => { if (!CS || CS.flip) return; CS.flip = true; App.route(); },
    cardGrade: (ok) => {
      if (!CS) return; const card = CS.queue[CS.i]; if (!card) return;
      grade(card, ok); if (ok) CS.ok++; else { CS.ko++; if (!CS.requeued.has(card.id)) { CS.requeued.add(card.id); CS.queue.push(card); } }
      CS.i++; CS.flip = false; App.route();
    }
  });

  window.RSutaApp2 = { homeCard, mastery, dueQueue, buildPlan, buildExam, EXAM_DATES, EXAM_MIN, LEITNER, NEW_PER_DAY, mention, todayTask };
})();
