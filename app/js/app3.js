/* RSuta v1.2 — app3.js
   Motivation (XP, niveaux, séries, badges) • Partage d'images • Rapport pour les parents
   Classe : devoirs enseignant → élèves (code, QR, fichier) et retour des copies • Exercices interactifs
   Éditeur : BSH - Best Services and House */
(function () {
  'use strict';
  const App = window.RSutaApp; if (!App || !App._) return;
  const X = App._;
  const { R, shell, phead, paginate, pager, modal, closeModal, toast, esc, NIV, fmtDate, fmtDT, confirmBox } = X;
  const D = window.RSutaData, DB = window.RSutaDB, Auth = window.RSutaAuth, Eng = window.RSutaEngine, Prof = window.RSutaProf, I = window.I;
  const EDITEUR = App.EDITEUR || { nom: 'BSH - Best Services and House', web: 'https://www.bestservicesandhouse.site', tel: '+229 01 48 52 45 90' };
  const $ = (s) => document.querySelector(s);
  const go = (r) => window.A.go(r);

  // ---------------------------------------------------------------- utilitaires
  const pad = (n) => String(n).padStart(2, '0');
  const dayStr = (d) => { d = new Date(d); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const today = () => dayStr(new Date());
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fr = (n, d) => (Math.round(n * Math.pow(10, d || 0)) / Math.pow(10, d || 0)).toString().replace('.', ',');
  const isProf = () => Auth.current && (Auth.current.role === 'enseignant' || Auth.current.role === 'admin');
  const chapOf = (id) => D.chapitres.find((c) => c.id === id);
  const matOfChap = (id) => { const c = chapOf(id); const m = c && D.matieres.find((x) => x.id === c.matiere_id); return m ? m.nom : ''; };
  function download(name, data, type) {
    const url = typeof data === 'string' && data.startsWith('blob:') ? data : URL.createObjectURL(data instanceof Blob ? data : new Blob([data], { type: type || 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 100);
  }
  function copy(text) { try { if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text); } else { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); } toast('Copié ✔'); } catch (e) { toast('Copie impossible : sélectionne le texte à la main.'); } }
  const wa = (text) => window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');

  // ================================================================= 1. MOTIVATION
  const LEVELS = [[0, 'Débutant', '🌱'], [100, 'Curieux', '🔎'], [250, 'Apprenti', '📘'], [500, 'Studieux', '✏️'], [900, 'Persévérant', '💪'], [1400, 'Brillant', '✨'], [2000, 'Expert', '🎯'], [2800, 'Champion', '🏅'], [3800, 'Maître', '🏆'], [5000, 'Légende', '👑']];
  const XP = { lecon: 20, quiz: 10, devoir: 5, carte: 2, exo: 3, defi: 15, examen: 30, diag: 20, classe: 25 };
  function level(xp) {
    let i = 0; while (i < LEVELS.length - 1 && xp >= LEVELS[i + 1][0]) i++;
    const lo = LEVELS[i][0], hi = i < LEVELS.length - 1 ? LEVELS[i + 1][0] : null;
    return { i, n: i + 1, nom: LEVELS[i][1], emoji: LEVELS[i][2], lo, hi, pct: hi ? Math.round((xp - lo) / (hi - lo) * 100) : 100, next: hi ? LEVELS[i + 1][1] : null, reste: hi ? hi - xp : 0 };
  }
  function stats(u) {
    u = u || Auth.current; const id = u.id;
    const prog = DB.where('progression', (p) => p.user_id === id && p.statut === 'termine');
    const quiz = DB.where('quiz_resultats', (r) => r.user_id === id);
    const dev = DB.where('devoirs', (d) => d.user_id === id);
    const T = DB.where('tentatives', (t) => t.user_id === id);
    const cartes = T.filter((t) => t.source === 'carte'), exos = T.filter((t) => t.source === 'exo'), defis = T.filter((t) => t.source === 'defi');
    const exams = DB.where('examens', (e) => e.user_id === id), diags = DB.where('diagnostics', (d) => d.user_id === id);
    const cls = DB.where('classe_recus', (c) => c.user_id === id && c.statut === 'rendu');
    const shares = +(localStorage.getItem('rsuta.shares.' + id) || 0);
    const rows = [
      ['📘', 'Leçons terminées', prog.length, prog.length * XP.lecon],
      ['❓', 'Quiz', quiz.length, quiz.reduce((a, r) => a + XP.quiz + Math.round((r.score || 0) / 10), 0)],
      ['📸', 'Devoirs résolus', dev.length, dev.length * XP.devoir],
      ['🧩', 'Exercices interactifs', exos.length, exos.filter((t) => t.ok).length * XP.exo],
      ['🃏', 'Cartes mémoire', cartes.length, cartes.length * XP.carte],
      ['🎯', 'Défis du jour réussis', defis.length, defis.length * XP.defi],
      ['📝', 'Examens blancs', exams.length, exams.reduce((a, e) => a + XP.examen + Math.round(e.score || 0), 0)],
      ['🩺', 'Diagnostics', diags.length, diags.length * XP.diag],
      ['🏫', 'Devoirs de classe rendus', cls.length, cls.length * XP.classe]
    ];
    const xp = rows.reduce((a, r) => a + r[3], 0);
    // jours d'activité (apprentissage réel, pas la simple connexion)
    const days = new Set();
    prog.forEach((p) => days.add(dayStr(p.date_scan || p.created_at)));
    [quiz, dev, T, exams, diags].forEach((L) => L.forEach((r) => r.created_at && days.add(dayStr(r.created_at))));
    cls.forEach((c) => days.add(dayStr(c.rendu_le || c.created_at)));
    const sorted = [...days].sort();
    let best = 0, run = 0, prev = null;
    sorted.forEach((d) => { const t = new Date(d + 'T12:00:00'); run = prev && Math.round((t - prev) / 864e5) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = t; });
    let streak = 0; const c = new Date(); c.setHours(12, 0, 0, 0);
    if (!days.has(dayStr(c))) c.setDate(c.getDate() - 1);
    while (days.has(dayStr(c))) { streak++; c.setDate(c.getDate() - 1); }
    const st = {
      xp, level: level(xp), rows, days, streak, best: Math.max(best, streak), activeToday: days.has(today()), shares,
      n: { lecons: prog.length, quiz: quiz.length, devoirs: dev.length, exos: exos.length, cartes: cartes.length, defis: defis.length, examens: exams.length, diags: diags.length, classe: cls.length },
      perfect: quiz.some((r) => r.score === 100), bestExam: exams.reduce((a, e) => Math.max(a, e.score || 0), 0), exoOk: exos.filter((t) => t.ok).length
    };
    return st;
  }
  const BADGES = [
    ['premier_pas', '🌱', 'Premier pas', 'Termine ta première leçon', (s) => s.n.lecons >= 1],
    ['lecteur', '📚', 'Grand lecteur', 'Termine 10 leçons', (s) => s.n.lecons >= 10],
    ['savant', '🎓', 'Savant', 'Termine 50 leçons', (s) => s.n.lecons >= 50],
    ['quiz1', '❓', 'Premier quiz', 'Termine un quiz', (s) => s.n.quiz >= 1],
    ['parfait', '💯', 'Sans faute', 'Obtiens 100 % à un quiz', (s) => s.perfect],
    ['scan1', '📸', 'Premier scan', 'Fais résoudre ton premier devoir', (s) => s.n.devoirs >= 1],
    ['scan10', '🧠', 'Chasseur de devoirs', 'Fais résoudre 10 devoirs', (s) => s.n.devoirs >= 10],
    ['serie3', '🔥', 'En feu', '3 jours d\'activité de suite', (s) => s.best >= 3],
    ['serie7', '⚡', 'Semaine parfaite', '7 jours d\'activité de suite', (s) => s.best >= 7],
    ['serie30', '🌟', 'Inarrêtable', '30 jours d\'activité de suite', (s) => s.best >= 30],
    ['examen1', '📝', 'Candidat', 'Passe un examen blanc', (s) => s.n.examens >= 1],
    ['mention', '🏅', 'Mention Bien', 'Obtiens 14/20 ou plus à un examen blanc', (s) => s.bestExam >= 14],
    ['memoire', '🃏', 'Mémoire d\'éléphant', 'Révise 100 cartes mémoire', (s) => s.n.cartes >= 100],
    ['diag', '🩺', 'Bilan fait', 'Fais ton diagnostic de niveau', (s) => s.n.diags >= 1],
    ['defi5', '🎯', 'Relève le défi', 'Réussis 5 défis du jour', (s) => s.n.defis >= 5],
    ['exo20', '🧩', 'Joueur malin', 'Réussis 20 exercices interactifs', (s) => s.exoOk >= 20],
    ['classe1', '🏫', 'Bon élève', 'Rends un devoir de classe', (s) => s.n.classe >= 1],
    ['ambassadeur', '📣', 'Ambassadeur', 'Partage un résultat avec tes amis', (s) => s.shares >= 1],
    ['niveau5', '💪', 'Persévérant', 'Atteins le niveau 5', (s) => s.level.i >= 4],
    ['legende', '👑', 'Légende', 'Atteins le niveau 10', (s) => s.level.i >= 9]
  ];
  const BKEY = () => 'rsuta.badges.' + Auth.current.id;
  function earned() { try { return JSON.parse(localStorage.getItem(BKEY()) || 'null'); } catch (e) { return null; } }
  function checkBadges(silent) {
    if (!Auth.current) return [];
    const st = stats(), got = earned(), first = got === null, map = got || {}, fresh = [];
    BADGES.forEach((b) => { if (!map[b[0]] && b[4](st)) { map[b[0]] = new Date().toISOString(); fresh.push(b); } });
    const lv = +(localStorage.getItem(BKEY() + '.lvl') || 0);
    if (fresh.length || first) localStorage.setItem(BKEY(), JSON.stringify(map));
    if (!first && !silent) {
      fresh.forEach((b, i) => { setTimeout(() => toast('🏅 Nouveau badge : ' + b[2] + ' ' + b[1], 3200), 500 + i * 1800); DB.notify(Auth.current.id, 'Nouveau badge : ' + b[2] + ' ' + b[1], b[3] + '. Bravo, continue comme ça !', 'succes'); });
      if (lv && st.level.n > lv) { setTimeout(() => toast(st.level.emoji + ' Niveau ' + st.level.n + ' : ' + st.level.nom + ' !', 3500), 300); DB.notify(Auth.current.id, 'Niveau ' + st.level.n + ' atteint ' + st.level.emoji, 'Tu es maintenant « ' + st.level.nom + ' ». ' + Prof.pick(Prof.ENC[Auth.current.niveau] || ['Bravo !']), 'succes'); }
    }
    localStorage.setItem(BKEY() + '.lvl', st.level.n);
    return fresh;
  }
  window.addEventListener('hashchange', () => setTimeout(() => { try { checkBadges(); } catch (e) { /* */ } }, 350));

  function homeStrip() {
    try {
      const st = stats(), lv = st.level;
      const teach = isProf() ? `<button class="item mt" onclick="A.go('classe')" id="home-classe"><span class="ic y">${I.group(22)}</span><span class="tx"><b>Ma classe</b><small>${DB.where('classes', (c) => c.user_id === Auth.current.id).length} classe(s) • ${DB.where('classe_resultats', (r) => r.user_id === Auth.current.id).length} copie(s) reçue(s)</small></span><span class="chev">${I.chev()}</span></button>` : '';
      return `<button class="xpstrip" onclick="A.go('progres')" id="xpstrip"><span class="fl ${st.activeToday ? 'on' : ''}">${I.flame(26)}<b>${st.streak}</b></span><span class="xt"><small>Niveau ${lv.n} • ${esc(lv.nom)} ${lv.emoji}</small><span class="pbar"><i style="width:${Math.max(4, lv.pct)}%"></i></span><small>${st.xp} XP${lv.hi ? ' • encore ' + lv.reste + ' XP pour « ' + lv.next + ' »' : ' • niveau maximum'}</small></span><span class="bc">🏅<b>${Object.keys(earned() || {}).length}</b></span></button>${teach}`;
    } catch (e) { return ''; }
  }
  function profilCard() {
    const st = stats(), lv = st.level;
    return `<div class="card mt xpcard" onclick="A.go('progres')" style="cursor:pointer"><div class="lvl">${lv.emoji}</div><div style="flex:1;min-width:0"><b>Niveau ${lv.n} • ${esc(lv.nom)}</b><div class="pbar" style="height:10px;margin:6px 0"><i style="width:${Math.max(4, lv.pct)}%"></i></div><small class="muted">${st.xp} XP • record de série : ${st.best} jour(s) • ${Object.keys(earned() || {}).length}/${BADGES.length} badges</small></div><span class="chev">${I.chev()}</span></div>`;
  }
  function defiOk() {
    const u = Auth.current; if (DB.find('tentatives', (t) => t.user_id === u.id && t.source === 'defi' && dayStr(t.created_at) === today())) return;
    DB.insert('tentatives', { user_id: u.id, source: 'defi', niveau: u.niveau, ok: true });
    setTimeout(() => toast('+' + XP.defi + ' XP 🎯 Défi du jour réussi !', 2600), 3600);
    checkBadges();
  }

  // ---------------------------------------------------------------- page « Mes progrès »
  function heatmap(days) {
    const cells = []; const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - 83);
    const off = (d.getDay() + 6) % 7; for (let i = 0; i < off; i++) cells.push('<i class="e"></i>');
    for (let i = 0; i < 84; i++) { const s = dayStr(d); cells.push(`<i class="${days.has(s) ? 'on' : ''}" title="${fmtDate(d)}"></i>`); d.setDate(d.getDate() + 1); }
    return `<div class="heat">${cells.join('')}</div><div class="heat-l"><span>il y a 12 semaines</span><span><i></i> pas d'activité <i class="on"></i> actif</span><span>aujourd'hui</span></div>`;
  }
  R.progres = () => {
    const st = stats(), lv = st.level; checkBadges(true); const got = earned() || {};
    shell('progres', phead('Mes progrès', 'profil', `<button class="act" onclick="RSutaApp3.share('progres')" aria-label="Partager" id="btn-share-prog">${I.share()}</button>`) + `<div class="body scroll"><div class="wrap" style="max-width:980px">
      <div class="lvcard"><div class="big">${lv.emoji}</div><div class="tx"><small>Niveau ${lv.n} sur ${LEVELS.length}</small><b>${esc(lv.nom)}</b><div class="pbar"><i style="width:${Math.max(4, lv.pct)}%"></i></div><small>${st.xp} XP${lv.hi ? ' • encore <b>' + lv.reste + ' XP</b> pour devenir « ' + lv.next + ' »' : ' • tu as atteint le sommet !'}</small></div></div>
      <div class="stats mt"><div class="stat"><b>${st.streak}🔥</b><small>Série actuelle</small></div><div class="stat"><b>${st.best}</b><small>Record (jours)</small></div><div class="stat"><b>${st.days.size}</b><small>Jours actifs</small></div><div class="stat"><b>${Object.keys(got).length}/${BADGES.length}</b><small>Badges</small></div></div>
      <p class="tip mt">${I.info()} <span>${st.activeToday ? 'Bravo, ta série continue aujourd\'hui ! Reviens demain pour la prolonger.' : st.streak ? 'Fais une leçon, un quiz ou un exercice aujourd\'hui pour ne pas perdre ta série de ' + st.streak + ' jour(s) !' : 'Fais une activité aujourd\'hui pour démarrer une nouvelle série 🔥'}</span></p>
      <h3 class="sub">Mon activité (12 dernières semaines)</h3><div class="card">${heatmap(st.days)}</div>
      <h3 class="sub">Mes badges</h3>
      <div class="badges-grid">${BADGES.map((b) => `<div class="bdg-it ${got[b[0]] ? 'on' : ''}" title="${esc(b[3])}"><span class="e">${b[1]}</span><b>${esc(b[2])}</b><small>${got[b[0]] ? 'Obtenu le ' + fmtDate(got[b[0]]) : esc(b[3])}</small></div>`).join('')}</div>
      <h3 class="sub">D'où viennent mes XP ?</h3>
      <div class="card" style="overflow-x:auto"><table class="tbl"><thead><tr><th>Activité</th><th>Nombre</th><th>XP</th></tr></thead><tbody>${st.rows.map((r) => `<tr><td>${r[0]} ${esc(r[1])}</td><td>${r[2]}</td><td><b>${r[3]}</b></td></tr>`).join('')}<tr><td><b>Total</b></td><td></td><td><b>${st.xp} XP</b></td></tr></tbody></table>
      <p class="muted" style="font-size:13px;margin:10px 0 0">Barème : leçon ${XP.lecon} XP • quiz ${XP.quiz} XP + score/10 • devoir ${XP.devoir} • exercice interactif réussi ${XP.exo} • carte ${XP.carte} • défi du jour ${XP.defi} • examen blanc ${XP.examen} + note • diagnostic ${XP.diag} • devoir de classe ${XP.classe}.</p></div>
      <div class="row2 mt"><button class="btn y" onclick="RSutaApp3.share('progres')">${I.share()} Partager ma progression</button><button class="btn o" onclick="A.go('rapport')">${I.doc()} Rapport pour les parents</button></div>
    </div></div>`);
  };

  // ================================================================= 2. PARTAGE (image 1080 × 1080)
  function wrapLines(ctx, text, maxW, maxLines) {
    const words = String(text).replace(/\s+/g, ' ').trim().split(' '); const lines = []; let cur = '';
    words.forEach((w) => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur);
    if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + ' …'; }
    return lines;
  }
  function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function star(ctx, cx, cy, r) { ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.28 : r; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
  function drawCard(sp) {
    const W = 1080, c = document.createElement('canvas'); c.width = W; c.height = W; const x = c.getContext('2d');
    const F = (w, s) => w + ' ' + s + 'px Inter, "Segoe UI", Roboto, Arial, sans-serif';
    const g = x.createLinearGradient(0, 0, W, W); g.addColorStop(0, '#2a5be0'); g.addColorStop(1, '#13348f'); x.fillStyle = g; x.fillRect(0, 0, W, W);
    // motif géométrique africain (triangles)
    x.globalAlpha = 0.09; x.fillStyle = '#fff';
    for (let row = 0; row < 3; row++) for (let i = -1; i < 20; i++) { const s = 60, ox = i * s + (row % 2) * s / 2, oy = 24 + row * 52; x.beginPath(); x.moveTo(ox, oy + 44); x.lineTo(ox + s / 2, oy); x.lineTo(ox + s, oy + 44); x.closePath(); x.fill(); }
    x.globalAlpha = 0.08; for (let i = 0; i < 12; i++) { x.beginPath(); x.arc(W - 90, W - 90, 60 + i * 34, 0, Math.PI * 2); x.lineWidth = 6; x.strokeStyle = '#fff'; x.stroke(); }
    x.globalAlpha = 1;
    // logo
    x.fillStyle = '#f8c42f'; rrect(x, 70, 62, 92, 92, 24); x.fill();
    x.fillStyle = '#0d2260'; x.font = F(900, 62); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('R', 116, 111);
    x.textAlign = 'left'; x.fillStyle = '#fff'; x.font = F(900, 66); x.fillText('RSuta', 182, 110);
    const lw = x.measureText('RSuta').width; x.fillStyle = '#f8c42f'; star(x, 182 + lw + 26, 84, 20);
    x.font = F(600, 28); x.fillStyle = 'rgba(255,255,255,.85)'; x.textAlign = 'right'; x.fillText(sp.niveau ? sp.niveau : '', W - 70, 110);
    // carte blanche
    x.fillStyle = '#fff'; x.shadowColor = 'rgba(0,0,0,.25)'; x.shadowBlur = 40; x.shadowOffsetY = 14; rrect(x, 70, 210, W - 140, 640, 40); x.fill(); x.shadowColor = 'transparent';
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    // badge
    x.font = F(800, 30); const bw = x.measureText(sp.badge).width + 56; x.fillStyle = '#e4edfd'; rrect(x, 120, 262, bw, 60, 30); x.fill(); x.fillStyle = '#1f4fd1'; x.fillText(sp.badge, 148, 303);
    let y = 400;
    if (sp.title) { x.font = F(800, 44); x.fillStyle = '#0d2260'; wrapLines(x, sp.title, W - 260, sp.big ? 3 : 5).forEach((l) => { x.fillText(l, 120, y); y += 58; }); y += 10; }
    if (sp.big) { x.font = F(900, sp.big.length > 8 ? 120 : 170); x.fillStyle = '#1f4fd1'; x.fillText(sp.big, 116, Math.min(y + 130, 720)); y = Math.min(y + 130, 720) + 70; }
    if (sp.answer) { x.font = F(700, 30); x.fillStyle = '#64748b'; x.fillText('Réponse', 120, y); y += 20; x.font = F(900, 50); const lines = wrapLines(x, sp.answer, W - 300, 2); const h = lines.length * 62 + 34; x.fillStyle = '#fde9a6'; rrect(x, 110, y, W - 220, h, 22); x.fill(); x.fillStyle = '#0d2260'; lines.forEach((l, i) => x.fillText(l, 140, y + 64 + i * 62)); y += h + 30; }
    if (sp.sub) { x.font = F(700, 34); x.fillStyle = '#334155'; wrapLines(x, sp.sub, W - 260, 3).forEach((l) => { if (y < 830) x.fillText(l, 120, y); y += 46; }); }
    // pied
    x.fillStyle = '#f8c42f'; rrect(x, 70, 892, W - 140, 104, 52); x.fill();
    x.fillStyle = '#0d2260'; x.font = F(900, 36); x.textAlign = 'center'; x.fillText('Ton prof IA qui ne dort pas 🌙', W / 2, 940); x.font = F(700, 24); x.fillText('CEP • BEPC • BAC • Licence pro — fonctionne même sans internet', W / 2, 976);
    x.fillStyle = 'rgba(255,255,255,.85)'; x.font = F(600, 22); x.fillText('Édité par ' + EDITEUR.nom + ' • www.bestservicesandhouse.site', W / 2, 1040);
    return c;
  }
  function shareSpec(kind, id) {
    const u = Auth.current, niv = u.niveau;
    if (kind === 'devoir') {
      const dv = DB.find('devoirs', (d) => d.id === id && d.user_id === u.id); if (!dv) return null;
      const p = dv.parts && dv.parts[0];
      return { niveau: dv.niveau, badge: (dv.parts && dv.parts.length > 1 ? 'Épreuve traitée' : 'Exercice résolu') + ' ✅', title: (p && p.enonce) || dv.enonce || dv.titre, answer: p && p.reponse ? String(p.reponse) : '', sub: dv.parts && dv.parts.length > 1 ? dv.parts.length + ' exercices expliqués étape par étape' : 'Expliqué en 3 étapes par mon prof RSuta', text: 'J\'ai compris mon exercice avec RSuta ✅' };
    }
    if (kind === 'quiz') {
      const r = DB.where('quiz_resultats', (q) => q.user_id === u.id).sort((a, b) => b.created_at.localeCompare(a.created_at))[0]; if (!r) return null;
      const z = D.quiz.find((q) => q.id === r.quiz_id);
      return { niveau: niv, badge: 'Quiz terminé 🏆', title: z ? z.titre : 'Quiz RSuta', big: r.score + ' %', sub: Math.round(r.score * r.total / 100) + ' / ' + r.total + ' bonnes réponses. Qui fait mieux ?', text: 'J\'ai eu ' + r.score + ' % au quiz « ' + (z ? z.titre : '') + ' » sur RSuta 🏆' };
    }
    if (kind === 'examen') {
      const e = DB.find('examens', (x) => x.id === id && x.user_id === u.id); if (!e) return null;
      const m = window.RSutaApp2 ? RSutaApp2.mention(e.score) : '';
      return { niveau: e.niveau, badge: (e.mode === 'express' ? 'Examen express' : 'Examen blanc') + ' ' + e.niveau + ' 📝', title: 'Ma note à l\'examen blanc', big: fr(e.score, 2) + '/20', sub: 'Mention ' + m + ' • ' + e.details.filter((d) => d.ok).length + '/' + e.details.length + ' réponses justes', text: 'J\'ai eu ' + fr(e.score, 2) + '/20 à mon examen blanc ' + e.niveau + ' sur RSuta 📝' };
    }
    if (kind === 'progres') {
      const st = stats();
      return { niveau: niv, badge: 'Ma progression ' + st.level.emoji, title: 'Niveau ' + st.level.n + ' : ' + st.level.nom, big: st.xp + ' XP', sub: '🔥 ' + st.streak + ' jour(s) de suite • 🏅 ' + Object.keys(earned() || {}).length + ' badges • ' + st.n.lecons + ' leçons terminées', text: 'Je suis niveau ' + st.level.n + ' (' + st.level.nom + ') sur RSuta avec ' + st.xp + ' XP 🔥' };
    }
    return null;
  }
  async function share(kind, id) {
    const sp = shareSpec(kind, id); if (!sp) return toast('Rien à partager pour l\'instant.');
    const cv = drawCard(sp);
    const blob = await new Promise((r) => cv.toBlob(r, 'image/png'));
    const name = 'RSuta-' + kind + '-' + today() + '.png';
    const text = sp.text + '\nRSuta, ton prof IA qui ne dort pas — CEP, BEPC, BAC, Licence pro. ' + EDITEUR.web;
    const k = 'rsuta.shares.' + Auth.current.id; const bump = () => { localStorage.setItem(k, +(localStorage.getItem(k) || 0) + 1); checkBadges(); };
    try {
      const file = new File([blob], name, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'RSuta', text }); bump(); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    const url = URL.createObjectURL(blob);
    modal('Partager mon résultat', `<img src="${url}" alt="Image à partager" class="share-prev" id="share-img"><p class="muted" style="font-size:13.5px">Télécharge l'image, puis envoie-la sur WhatsApp, Facebook ou TikTok. Le bouton WhatsApp ouvre un message prêt à envoyer.</p>`,
      [{ label: 'Fermer', cls: 'o' }, { label: 'WhatsApp', cls: 'o', on: () => { wa(text); bump(); return false; } }, { label: `${I.download(18)} Télécharger`, cls: 'y', on: () => { download(name, blob); bump(); toast('Image enregistrée 📥'); return false; } }]);
  }

  // ================================================================= 3. RAPPORT POUR LES PARENTS
  R.rapport = () => {
    const u = Auth.current, st = stats(), since = new Date(Date.now() - 29 * 864e5); since.setHours(0, 0, 0, 0);
    const in30 = (d) => new Date(d) >= since;
    const prog = DB.where('progression', (p) => p.user_id === u.id && p.statut === 'termine' && in30(p.date_scan));
    const quiz = DB.where('quiz_resultats', (r) => r.user_id === u.id && in30(r.created_at));
    const dev = DB.where('devoirs', (d) => d.user_id === u.id && in30(d.created_at));
    const ex = DB.where('examens', (e) => e.user_id === u.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
    const ex30 = ex.filter((e) => in30(e.created_at));
    const T = DB.where('tentatives', (t) => t.user_id === u.id && in30(t.created_at) && t.chapitre_id);
    const cls = DB.where('classe_recus', (c) => c.user_id === u.id && c.statut === 'rendu' && in30(c.rendu_le));
    // activité par jour
    const per = []; for (let i = 0; i < 30; i++) { const d = new Date(since); d.setDate(d.getDate() + i); per.push({ d: dayStr(d), n: 0 }); }
    const bump = (dt) => { const k = dayStr(dt); const r = per.find((p) => p.d === k); if (r) r.n++; };
    prog.forEach((p) => bump(p.date_scan)); quiz.forEach((r) => bump(r.created_at)); dev.forEach((d) => bump(d.created_at)); ex30.forEach((e) => bump(e.created_at)); T.forEach((t) => bump(t.created_at));
    const actifs = per.filter((p) => p.n).length, mx = Math.max(1, ...per.map((p) => p.n));
    const chart = `<svg viewBox="0 0 620 170" class="rchart" role="img" aria-label="Activité par jour"><line x1="20" y1="140" x2="610" y2="140" stroke="#cbd5e1"/>${per.map((p, i) => { const h = Math.round(p.n / mx * 115); return `<rect x="${22 + i * 19.6}" y="${140 - h}" width="14" height="${Math.max(h, p.n ? 3 : 0)}" rx="3" fill="${p.n ? '#1f4fd1' : '#e2e8f0'}"/>${i % 5 === 0 || i === 29 ? `<text x="${29 + i * 19.6}" y="160" font-size="10" text-anchor="middle" fill="#64748b">${p.d.slice(8)}/${p.d.slice(5, 7)}</text>` : ''}`; }).join('')}<text x="20" y="14" font-size="11" fill="#64748b">activités / jour (max ${mx})</text></svg>`;
    // maîtrise par matière
    const mats = {}; T.forEach((t) => { const m = t.matiere || matOfChap(t.chapitre_id) || 'Autre'; (mats[m] = mats[m] || []).push(t.ok ? 1 : 0); });
    const matRows = Object.keys(mats).map((m) => ({ m, n: mats[m].length, p: Math.round(mats[m].reduce((a, b) => a + b, 0) / mats[m].length * 100) })).sort((a, b) => b.p - a.p);
    const chs = {}; T.forEach((t) => { (chs[t.chapitre_id] = chs[t.chapitre_id] || []).push(t.ok ? 1 : 0); });
    const chRows = Object.keys(chs).filter((k) => chs[k].length >= 3).map((k) => ({ c: chapOf(k), p: Math.round(chs[k].reduce((a, b) => a + b, 0) / chs[k].length * 100), n: chs[k].length })).filter((r) => r.c);
    const weak = chRows.filter((r) => r.p < 60).sort((a, b) => a.p - b.p).slice(0, 3), strong = chRows.filter((r) => r.p >= 75).sort((a, b) => b.p - a.p).slice(0, 3);
    const qAvg = quiz.length ? Math.round(quiz.reduce((a, r) => a + r.score, 0) / quiz.length) : null;
    const eAvg = ex30.length ? ex30.reduce((a, e) => a + e.score, 0) / ex30.length : null;
    const got = earned() || {};
    const tips = [];
    if (actifs < 8) tips.push('Encouragez une séance courte mais régulière : 20 minutes par jour valent mieux que 3 heures la veille de l\'examen.');
    else tips.push('La régularité est excellente (' + actifs + ' jours actifs sur 30). Félicitez votre enfant pour cet effort !');
    if (weak.length) tips.push('Points à retravailler : ' + weak.map((w) => '« ' + w.c.titre + ' »').join(', ') + '. Proposez-lui de relire la fiche de révision et de refaire les exercices interactifs de ces chapitres.');
    if (eAvg !== null && eAvg < 10) tips.push('La moyenne aux examens blancs est en dessous de 10/20 : demandez-lui d\'utiliser « Points faibles » dans le module Réviser, puis de repasser un examen express.');
    if (!ex.length) tips.push('Aucun examen blanc pour l\'instant : un examen express de 20 minutes par semaine permet de s\'habituer aux conditions de l\'examen.');
    tips.push('Demandez-lui de vous expliquer une leçon avec ses mots : expliquer, c\'est la meilleure façon de vérifier qu\'on a compris.');
    const kpi = (v, l) => `<div class="rk"><b>${v}</b><small>${l}</small></div>`;
    shell('profil', phead('Rapport pour les parents', 'profil', `<button class="act" onclick="window.print()" aria-label="Imprimer" id="btn-print">${I.download()}</button>`) + `<div class="body scroll"><div class="wrap" style="max-width:900px">
      <div class="report" id="report">
        <div class="rhead"><div>${I.logo(30)}</div><div class="rt"><b>Rapport de progression</b><small>Généré le ${fmtDate(new Date())} • période du ${fmtDate(since)} au ${fmtDate(new Date())}</small></div></div>
        <div class="rid"><div><small>Élève</small><b>${esc(u.nom)}</b></div><div><small>Niveau</small><b>${esc(u.niveau)}${u.filiere ? ' • ' + esc(u.filiere) : ''}</b></div><div><small>Niveau RSuta</small><b>${st.level.emoji} ${st.level.n} — ${esc(st.level.nom)} (${st.xp} XP)</b></div><div><small>Série actuelle / record</small><b>${st.streak} / ${st.best} jour(s)</b></div></div>
        <div class="rkpis">${kpi(actifs + '/30', 'jours actifs')}${kpi(prog.length, 'leçons terminées')}${kpi(qAvg === null ? '—' : qAvg + ' %', quiz.length + ' quiz (moyenne)')}${kpi(dev.length, 'devoirs résolus')}${kpi(eAvg === null ? '—' : fr(eAvg, 1) + '/20', ex30.length + ' examen(s) blanc(s)')}${kpi(cls.length, 'devoirs de classe rendus')}</div>
        <h4>Activité des 30 derniers jours</h4>${chart}
        <h4>Maîtrise par matière <small class="muted">(réponses justes aux quiz, exercices, cartes et examens)</small></h4>
        ${matRows.length ? `<div class="rbars">${matRows.map((r) => `<div class="rb"><span>${esc(r.m)}</span><span class="pbar"><i style="width:${Math.max(3, r.p)}%;background:${r.p >= 70 ? '#16a34a' : r.p >= 50 ? '#f8c42f' : '#dc2626'}"></i></span><b>${r.p} %</b><small>${r.n} rép.</small></div>`).join('')}</div>` : '<p class="muted">Pas encore assez de réponses pour mesurer la maîtrise. Les quiz et exercices interactifs alimentent cette partie.</p>'}
        <div class="row2"><div><h4>👍 Points forts</h4>${strong.length ? '<ul>' + strong.map((r) => `<li>${esc(r.c.titre)} — ${r.p} %</li>`).join('') + '</ul>' : '<p class="muted">À découvrir au fil des exercices.</p>'}</div><div><h4>🎯 À retravailler</h4>${weak.length ? '<ul>' + weak.map((r) => `<li>${esc(r.c.titre)} — ${r.p} %</li>`).join('') + '</ul>' : '<p class="muted">Aucun point faible détecté pour l\'instant.</p>'}</div></div>
        <h4>Examens blancs</h4>${ex.length ? `<table class="tbl"><thead><tr><th>Date</th><th>Type</th><th>Note</th><th>Mention</th></tr></thead><tbody>${ex.slice(0, 5).map((e) => `<tr><td>${fmtDate(e.created_at)}</td><td>${e.mode === 'express' ? 'Express' : 'Examen blanc'} ${e.niveau}</td><td><b>${fr(e.score, 2)}/20</b></td><td>${window.RSutaApp2 ? RSutaApp2.mention(e.score) : ''}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">Aucun examen blanc passé.</p>'}
        <h4>Badges obtenus (${Object.keys(got).length}/${BADGES.length})</h4><p class="rbadges">${BADGES.filter((b) => got[b[0]]).map((b) => `<span>${b[1]} ${esc(b[2])}</span>`).join('') || '<span class="muted">Aucun badge pour l\'instant.</span>'}</p>
        <h4>Conseils pour les parents</h4><ul>${tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        <div class="rsign"><div>Observations des parents :<br><br>…………………………………………………………</div><div>Signature :<br><br>……………………</div></div>
        <p class="rfoot">RSuta — Ton prof IA qui ne dort pas • ${esc(EDITEUR.nom)} • ${esc(EDITEUR.tel)} • www.bestservicesandhouse.site</p>
      </div>
      <div class="row2 mt noprint"><button class="btn" onclick="window.print()">${I.download()} Imprimer / Enregistrer en PDF</button><button class="btn o" onclick="RSutaApp3.waReport()">Envoyer le résumé par WhatsApp</button></div>
    </div></div>`);
    window._rapportTxt = '📊 Rapport RSuta de ' + u.nom + ' (' + u.niveau + ') — 30 derniers jours\n• Jours actifs : ' + actifs + '/30\n• Leçons terminées : ' + prog.length + '\n• Quiz : ' + quiz.length + (qAvg !== null ? ' (moyenne ' + qAvg + ' %)' : '') + '\n• Devoirs résolus : ' + dev.length + '\n• Examens blancs : ' + ex30.length + (eAvg !== null ? ' (moyenne ' + fr(eAvg, 1) + '/20)' : '') + '\n• Niveau RSuta : ' + st.level.n + ' ' + st.level.nom + ' (' + st.xp + ' XP), série ' + st.streak + ' j' + (weak.length ? '\n• À retravailler : ' + weak.map((w) => w.c.titre).join(', ') : '');
  };

  // ================================================================= 4. CLASSE (enseignant ↔ élèves, sans serveur)
  const KEY = 'RSuta-BSH-2026';
  function fnv(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8).slice(2); }
  function encode(prefix, obj) {
    const b = new TextEncoder().encode(JSON.stringify(obj)), k = new TextEncoder().encode(KEY);
    let bin = ''; for (let i = 0; i < b.length; i++) bin += String.fromCharCode(b[i] ^ k[i % k.length]);
    const body = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return prefix + '.' + body + '.' + fnv(body);
  }
  function findCodes(text, prefix) {
    const re = new RegExp(prefix + '\\.[A-Za-z0-9_-]+\\.[0-9a-f]{6}', 'g');
    let m = String(text || '').match(re); if (!m) m = String(text || '').replace(/\s+/g, '').match(re);
    return m || [];
  }
  function decode(code, prefix) {
    const parts = code.split('.'); if (parts.length !== 3 || parts[0] !== prefix) throw new Error('Code non reconnu.');
    if (fnv(parts[1]) !== parts[2]) throw new Error('Code incomplet ou modifié : recopie-le en entier.');
    const bin = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')), k = new TextEncoder().encode(KEY);
    const b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i) ^ k[i % k.length];
    return JSON.parse(new TextDecoder().decode(b));
  }
  function devoirCode(dv) {
    const cl = DB.find('classes', (c) => c.id === dv.classe_id) || {};
    return encode('RSD1', { v: 1, id: dv.id, t: dv.titre, n: dv.niveau, c: cl.nom || '', p: Auth.current.nom, m: +dv.duree_min || 0, l: dv.date_limite || '', cs: dv.consignes || '', it: dv.items });
  }
  // ---- QR (qrcode-generator / jsQR embarqués)
  function qrCanvas(text, px) {
    if (!window.qrcode) return null;
    try { const q = qrcode(0, 'L'); q.addData(text); q.make(); const n = q.getModuleCount(), m = 4, s = Math.max(2, Math.floor((px || 360) / (n + m * 2))); const c = document.createElement('canvas'); c.width = c.height = (n + m * 2) * s; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#0d2260'; for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect((k + m) * s, (r + m) * s, s, s); return c; } catch (e) { return null; }
  }
  let qrStream = null, qrRAF = 0;
  function stopQR() { cancelAnimationFrame(qrRAF); if (qrStream) { qrStream.getTracks().forEach((t) => t.stop()); qrStream = null; } }
  function decodeImageQR(src, cb) {
    const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); const sc = Math.min(1, 1400 / Math.max(img.width, img.height)); c.width = img.width * sc; c.height = img.height * sc; const x = c.getContext('2d'); x.drawImage(img, 0, 0, c.width, c.height); const d = x.getImageData(0, 0, c.width, c.height); const r = window.jsQR && jsQR(d.data, c.width, c.height); cb(r ? r.data : null); }; img.onerror = () => cb(null); img.src = src;
  }
  function scanQR(onText) {
    modal('Scanner un QR code', `<div class="qrcam"><video id="qrv" playsinline muted></video><span class="qf"></span></div><p class="muted center" id="qrmsg" style="font-size:13.5px">Place le QR code dans le cadre jaune…</p><label class="btn o sm block">${I.image(18)} Choisir une photo du QR code<input type="file" accept="image/*" class="hidden" id="qrf"></label>`, [{ label: 'Fermer', cls: 'o', on: () => stopQR() }], { nofocus: true });
    $('#qrf').onchange = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => decodeImageQR(r.result, (t) => { if (t) { stopQR(); closeModal(); onText(t); } else $('#qrmsg').textContent = 'Aucun QR code lisible sur cette image. Reprends la photo bien à plat, à la lumière.'; }); r.readAsDataURL(f); };
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { $('#qrmsg').textContent = 'Caméra indisponible ici : choisis une photo du QR code.'; return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then((s) => {
      qrStream = s; const v = $('#qrv'); if (!v) return stopQR(); v.srcObject = s; v.play();
      const c = document.createElement('canvas'), x = c.getContext('2d', { willReadFrequently: true });
      const tick = () => {
        const vv = $('#qrv'); if (!vv) return stopQR();
        if (vv.videoWidth) { c.width = Math.min(640, vv.videoWidth); c.height = Math.round(vv.videoHeight * c.width / vv.videoWidth); x.drawImage(vv, 0, 0, c.width, c.height); const d = x.getImageData(0, 0, c.width, c.height); const r = window.jsQR && jsQR(d.data, c.width, c.height, { inversionAttempts: 'dontInvert' }); if (r && r.data) { if (navigator.vibrate) navigator.vibrate(60); stopQR(); closeModal(); onText(r.data); return; } }
        qrRAF = requestAnimationFrame(tick);
      }; tick();
    }).catch(() => { const m = $('#qrmsg'); if (m) m.textContent = 'Accès à la caméra refusé : choisis une photo du QR code.'; });
  }
  function codeModal(title, code, msg, fileName, waText) {
    const cv = qrCanvas(code, 300);
    modal(title, `${cv ? `<div class="qrbox" id="qrbox"></div>` : `<p class="tip">${I.info()} <span>Code trop long pour un QR : utilise le texte ou le fichier.</span></p>`}<p class="muted" style="font-size:13.5px;margin:8px 0">${msg}</p><textarea class="input code-ta" readonly id="code-ta" onclick="this.select()">${esc(code)}</textarea>`,
      [{ label: 'Fermer', cls: 'o' }, { label: 'Copier', cls: 'o', on: () => { copy(code); return false; } }, { label: 'Fichier', cls: 'o', on: () => { download(fileName, code + '\n'); return false; } }, { label: 'WhatsApp', cls: 'y', on: () => { wa(waText + '\n\n' + code); return false; } }], { nofocus: true });
    if (cv) { cv.style.width = '220px'; cv.style.height = '220px'; cv.setAttribute('aria-label', 'QR code'); $('#qrbox').appendChild(cv); }
  }
  function readFileText(inp, cb) { const f = inp.files && inp.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => cb(String(r.result || '')); r.readAsText(f); inp.value = ''; }

  // ---- élève : recevoir / faire / rendre
  function receive(text) {
    const codes = findCodes(text, 'RSD1'); if (!codes.length) { if (findCodes(text, 'RSR1').length) return toast('Ceci est un code de copie (RSR1) : c\'est l\'enseignant qui l\'importe.', 4000); return toast('Aucun code de devoir trouvé (il commence par RSD1.)', 3500); }
    let added = 0, last = null;
    codes.forEach((code) => {
      try {
        const P = decode(code, 'RSD1');
        const ex = DB.find('classe_recus', (r) => r.user_id === Auth.current.id && r.devoir_id === P.id);
        if (ex) { last = ex; return; }
        last = DB.insert('classe_recus', { user_id: Auth.current.id, devoir_id: P.id, devoir: P, statut: 'a_faire', reponses: {}, recu_le: new Date().toISOString() }); added++;
        DB.notify(Auth.current.id, 'Nouveau devoir de classe 🏫', P.t + ' — ' + (P.p || 'ton enseignant') + (P.l ? ' • à rendre avant le ' + fmtDate(P.l) : ''), 'rappel');
      } catch (e) { toast(e.message, 3500); }
    });
    if (last) { toast(added ? 'Devoir reçu ✔' : 'Tu as déjà ce devoir.'); go('classe/d/' + last.id); }
  }
  function gradeItem(it, rep) {
    if (it.k) { const nrm = String(rep || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); return it.k.every((w) => nrm.includes(w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))); }
    if (!it.a && !it.p) return null;
    if (!String(rep || '').trim()) return false;
    const r = Eng.checkAnswer({ answers: it.a, poly: it.p }, rep); return r === true;
  }
  let CT = 0;
  function submitCopy(id, auto) {
    clearInterval(CT);
    const r = DB.find('classe_recus', (x) => x.id === id); if (!r || r.statut === 'rendu') return;
    document.querySelectorAll('[data-crep]').forEach((el) => { r.reponses[el.dataset.crep] = el.value; });
    const P = r.devoir, ok = P.it.map((it, i) => { const g = gradeItem(it, r.reponses[i]); return g === null ? null : g ? 1 : 0; });
    const gradable = ok.filter((v) => v !== null).length, sc = ok.filter((v) => v === 1).length;
    const note = gradable ? Math.round(sc / gradable * 20 * 4) / 4 : null;
    const dur = Math.round((Date.now() - new Date(r.started_at || Date.now()).getTime()) / 1000);
    const res = { v: 1, d: P.id, t: P.t, c: P.c, e: Auth.current.nom, s: sc, x: gradable, g: note, ok, r: P.it.map((it, i) => String(r.reponses[i] || '').slice(0, 80)), dt: dur, at: new Date().toISOString(), auto: !!auto };
    Object.assign(r, { statut: 'rendu', ok, score: sc, total: gradable, note, duree_s: dur, rendu_le: res.at, code: encode('RSR1', res) });
    DB.save('classe_recus');
    DB.notify(Auth.current.id, 'Copie rendue ✅', P.t + (note !== null ? ' : ' + fr(note, 2) + '/20' : '') + '. Envoie ton code de copie à ton enseignant.', 'succes');
    toast(auto ? '⏰ Temps écoulé : copie ramassée automatiquement.' : 'Copie rendue ✔', 3200);
    R.classe('d', id);
  }
  function studentList() {
    const L = DB.where('classe_recus', (r) => r.user_id === Auth.current.id).sort((a, b) => b.recu_le.localeCompare(a.recu_le));
    const pg = paginate('crecus', L);
    shell('classe', phead('Devoirs de classe', 'home') + `<div class="body scroll"><div class="wrap" style="max-width:900px">
      <div class="card"><b>Recevoir un devoir de mon enseignant</b><p class="muted" style="font-size:13.5px;margin:6px 0 10px">Colle le code reçu (il commence par <b>RSD1.</b>), scanne le QR code affiché en classe ou ouvre le fichier <b>.rsuta</b>. Pas besoin d'internet.</p>
        <textarea class="input" id="crecv" rows="3" placeholder="Colle ici le code ou le message WhatsApp de ton enseignant…"></textarea>
        <div class="chips mt"><button class="btn sm" onclick="RSutaApp3.recv()" id="btn-recv">${I.check(18)} Valider le code</button><button class="btn sm o" onclick="RSutaApp3.scanRecv()">${I.qr(18)} Scanner le QR</button><label class="btn sm o">${I.upload(18)} Fichier .rsuta<input type="file" accept=".rsuta,.txt,text/plain" class="hidden" onchange="RSutaApp3.fileRecv(this)"></label></div></div>
      <h3 class="sub">Mes devoirs de classe</h3>
      <div class="list">${pg.rows.map((r) => `<button class="item" onclick="A.go('classe/d/${r.id}')"><span class="ic ${r.statut === 'rendu' ? '' : 'y'}">${r.statut === 'rendu' ? '✅' : '📝'}</span><span class="tx"><b>${esc(r.devoir.t)}</b><small>${esc(r.devoir.p || '')}${r.devoir.c ? ' • ' + esc(r.devoir.c) : ''} • ${r.devoir.it.length} exercice(s)${r.statut === 'rendu' ? ' • rendu le ' + fmtDate(r.rendu_le) + (r.note !== null && r.note !== undefined ? ' • ' + fr(r.note, 2) + '/20' : '') : r.devoir.l ? ' • à rendre avant le ' + fmtDate(r.devoir.l) : ''}</small></span><span class="chev">${I.chev()}</span></button>`).join('') || `<div class="empty">${I.group(46)}<p>Aucun devoir reçu pour l'instant.<br>Demande le code à ton enseignant.</p></div>`}</div>
      ${pager('crecus', pg)}</div></div>`);
  }
  function studentDevoir(id) {
    const r = DB.find('classe_recus', (x) => x.id === id && x.user_id === Auth.current.id); if (!r) return go('classe');
    const P = r.devoir;
    if (r.statut === 'rendu') {
      shell('classe', phead('Ma copie', 'classe') + `<div class="body scroll"><div class="wrap" style="max-width:860px">
        <div class="card center"><small class="muted">${esc(P.t)}</small><div class="score">${r.note !== null ? fr(r.note, 2) + '<small>/20</small>' : '—'}</div><p style="font-weight:800;margin:0">${r.score}/${r.total} réponse(s) juste(s) à correction automatique${P.it.length > r.total ? ' • ' + (P.it.length - r.total) + ' rédaction(s) à vérifier par l\'enseignant' : ''}</p><p class="muted">Rendu le ${fmtDT(r.rendu_le)} • ${Math.round(r.duree_s / 60)} min</p></div>
        <div class="card mt send"><b>📤 Envoie ta copie à ton enseignant</b><p class="muted" style="font-size:13.5px;margin:6px 0 10px">Ton enseignant importe ce code dans RSuta (onglet « Ma classe ») pour enregistrer ta note.</p><div class="chips"><button class="btn sm y" onclick="RSutaApp3.showCopy('${r.id}')" id="btn-copy-code">${I.qr(18)} Code &amp; QR de ma copie</button><button class="btn sm o" onclick="RSutaApp3.waCopy('${r.id}')">WhatsApp</button></div></div>
        <h3 class="sub">Correction</h3><div class="list">${P.it.map((it, i) => `<div class="item"><span class="ic ${r.ok[i] === 1 ? '' : 'y'}">${r.ok[i] === 1 ? '✅' : r.ok[i] === 0 ? '❌' : '👩🏾‍🏫'}</span><span class="tx"><b>${i + 1}. ${esc(it.e)}</b><small style="white-space:normal">Ta réponse : ${esc(r.reponses[i] || '—')}${it.r && r.ok[i] !== 1 ? ' • Réponse attendue : ' + esc(it.r) : ''}</small></span><button class="btn sm o" onclick="RSutaApp3.explain('${r.id}',${i})">Explication</button></div>`).join('')}</div>
      </div></div>`);
      return;
    }
    if (!r.started_at) {
      shell('classe', phead('Devoir de classe', 'classe') + `<div class="body scroll"><div class="wrap" style="max-width:760px">
        <div class="card"><span class="pill y">${esc(P.n || '')}</span><h2 style="margin:10px 0 4px">${esc(P.t)}</h2><p class="muted" style="margin:0">${esc(P.p || '')}${P.c ? ' • ' + esc(P.c) : ''}</p>
        <div class="stats mt"><div class="stat"><b>${P.it.length}</b><small>Exercices</small></div><div class="stat"><b>${P.m ? P.m + ' min' : '∞'}</b><small>Durée</small></div><div class="stat"><b>${P.l ? fmtDate(P.l).replace(/ \d{4}$/, '') : '—'}</b><small>À rendre</small></div></div>
        ${P.cs ? `<p class="tip mt">${I.info()} <span>${esc(P.cs)}</span></p>` : ''}
        <p class="muted" style="font-size:13.5px">${P.m ? 'Le chrono démarre dès que tu commences. À la fin du temps, ta copie est ramassée automatiquement.' : 'Pas de limite de temps.'} Tu ne pourras plus modifier ta copie après l'avoir rendue.</p>
        <button class="btn y block" onclick="RSutaApp3.startCopy('${r.id}')" id="btn-start">${I.play()} Commencer le devoir</button></div></div></div>`);
      return;
    }
    const end = P.m ? new Date(r.started_at).getTime() + P.m * 60000 : 0;
    shell('classe', phead(esc(P.t.length > 34 ? P.t.slice(0, 33) + '…' : P.t), 'classe') + `<div class="body scroll"><div class="wrap" style="max-width:820px">
      ${end ? `<div class="ctimer" id="ctimer"><span>${I.clock(18)} Temps restant</span><b id="ctime">--:--</b><span class="pbar"><i id="cbar" style="width:100%"></i></span></div>` : ''}
      ${P.it.map((it, i) => `<div class="card mt"><b>Exercice ${i + 1}</b><p style="margin:6px 0 10px">${esc(it.e)}</p><input class="input" data-crep="${i}" value="${esc(r.reponses[i] || '')}" placeholder="${it.p ? 'ex : x² + 3x − 4' : it.a ? 'Ta réponse finale (ex : x = 5)' : it.k ? 'Ta réponse rédigée' : 'Ta réponse'}" oninput="RSutaApp3.saveRep('${r.id}',${i},this.value)"></div>`).join('')}
      <button class="btn block mt" onclick="RSutaApp3.submitAsk('${r.id}')" id="btn-rendre">${I.check()} Rendre ma copie</button></div></div>`);
    if (end) {
      clearInterval(CT);
      const tot = P.m * 60000;
      const tick = () => { const t = $('#ctime'); if (!t) return clearInterval(CT); const left = end - Date.now(); if (left <= 0) { clearInterval(CT); submitCopy(r.id, true); return; } t.textContent = pad(Math.floor(left / 60000)) + ':' + pad(Math.floor(left / 1000) % 60); $('#cbar').style.width = (left / tot * 100) + '%'; $('#ctimer').classList.toggle('warn', left < 120000); };
      tick(); CT = setInterval(tick, 1000);
    }
  }

  // ---- enseignant
  function teacherHome() {
    const uid = Auth.current.id;
    const C = DB.where('classes', (c) => c.user_id === uid).sort((a, b) => b.created_at.localeCompare(a.created_at));
    const Dv = DB.where('classe_devoirs', (d) => d.user_id === uid), Rs = DB.where('classe_resultats', (r) => r.user_id === uid);
    const notes = Rs.filter((r) => r.note !== null && r.note !== undefined);
    const avg = notes.length ? notes.reduce((a, r) => a + r.note, 0) / notes.length : null;
    const pg = paginate('classes', C);
    shell('classe', phead('Ma classe', 'home', `<button class="act" onclick="RSutaApp3.newClass()" aria-label="Nouvelle classe" id="btn-newclass">${I.plus()}</button>`) + `<div class="body scroll"><div class="wrap" style="max-width:980px">
      <div class="stats"><div class="stat"><b>${C.length}</b><small>Classes</small></div><div class="stat"><b>${Dv.length}</b><small>Devoirs</small></div><div class="stat"><b>${Rs.length}</b><small>Copies reçues</small></div><div class="stat"><b>${avg === null ? '—' : fr(avg, 1)}</b><small>Moyenne /20</small></div></div>
      <p class="tip mt">${I.info()} <span>Sans serveur ni internet : vous créez un devoir, vos élèves le reçoivent par <b>code</b>, <b>QR code</b> ou <b>fichier</b>, puis vous renvoient leur copie de la même façon. Correction automatique des réponses numériques.</span></p>
      <div class="row2 mt"><button class="btn" onclick="RSutaApp3.newClass()">${I.plus()} Nouvelle classe</button><button class="btn o" onclick="RSutaApp3.importAsk()" id="btn-import">${I.upload()} Importer des copies</button></div>
      <h3 class="sub">Mes classes</h3>
      <div class="list grid">${pg.rows.map((c) => { const dv = Dv.filter((d) => d.classe_id === c.id), rs = Rs.filter((r) => r.classe_id === c.id && r.note !== null && r.note !== undefined); return `<button class="item" onclick="A.go('classe/c/${c.id}')"><span class="ic y">${I.group(22)}</span><span class="tx"><b>${esc(c.nom)}</b><small>${esc(c.niveau)} • ${dv.length} devoir(s) • ${rs.length} copie(s)${rs.length ? ' • moy. ' + fr(rs.reduce((a, r) => a + r.note, 0) / rs.length, 1) + '/20' : ''}</small></span><span class="chev">${I.chev()}</span></button>`; }).join('') || `<div class="empty">${I.group(46)}<p>Créez votre première classe.</p></div>`}</div>
      ${pager('classes', pg)}
      <input type="file" id="cimpf" accept=".rsuta,.txt,text/plain" class="hidden" multiple onchange="RSutaApp3.fileImport(this)">
    </div></div>`);
  }
  function teacherClass(id) {
    const c = DB.find('classes', (x) => x.id === id && x.user_id === Auth.current.id); if (!c) return go('classe');
    const Dv = DB.where('classe_devoirs', (d) => d.classe_id === id).sort((a, b) => b.created_at.localeCompare(a.created_at));
    const pg = paginate('cdev-' + id, Dv);
    shell('classe', phead(esc(c.nom), 'classe', `<button class="act" onclick="RSutaApp3.delClass('${id}')" aria-label="Supprimer la classe">${I.trash()}</button>`) + `<div class="body scroll"><div class="wrap" style="max-width:980px">
      <p class="muted" style="margin:0 0 12px">${esc(c.niveau)}${c.etablissement ? ' • ' + esc(c.etablissement) : ''} • créée le ${fmtDate(c.created_at)}</p>
      <button class="btn y block" onclick="A.go('classe/new/${id}')" id="btn-newdev">${I.plus()} Nouveau devoir</button>
      <h3 class="sub">Devoirs</h3>
      <div class="list">${pg.rows.map((d) => { const rs = DB.where('classe_resultats', (r) => r.devoir_id === d.id); const n = rs.filter((r) => r.note !== null && r.note !== undefined); return `<button class="item" onclick="A.go('classe/d/${d.id}')"><span class="ic">${I.doc()}</span><span class="tx"><b>${esc(d.titre)}</b><small>${d.items.length} exercice(s) • ${d.duree_min ? d.duree_min + ' min' : 'sans limite'}${d.date_limite ? ' • pour le ' + fmtDate(d.date_limite) : ''} • ${rs.length} copie(s)${n.length ? ' • moy. ' + fr(n.reduce((a, r) => a + r.note, 0) / n.length, 1) + '/20' : ''}</small></span><span class="chev">${I.chev()}</span></button>`; }).join('') || '<p class="muted">Aucun devoir pour cette classe.</p>'}</div>
      ${pager('cdev-' + id, pg)}</div></div>`);
  }
  let NEWD = null;
  function teacherNew(cid) {
    const c = DB.find('classes', (x) => x.id === cid && x.user_id === Auth.current.id); if (!c) return go('classe');
    if (!NEWD || NEWD.cid !== cid) NEWD = { cid, items: [] };
    const kinds = (X.KINDS[c.niveau] || X.KINDS.BEPC);
    const KL = { arith: 'Calcul (priorités)', percent: 'Pourcentages', area: 'Aires et périmètres', fraction: 'Fractions', conjugaison: 'Conjugaison', linear: 'Équation 1er degré', pythagore: 'Pythagore', pgcd: 'PGCD', develop: 'Développer', factor: 'Factoriser', ohm: 'Loi d\'Ohm', circuit: 'Circuit électrique', masse_molaire: 'Masse molaire', vecteur: 'Vecteurs', energie: 'Énergie', quadratic: 'Équation du 2nd degré', system: 'Système 2×2', derivative: 'Dérivée', stats: 'Statistiques', suite: 'Suites', complexe: 'Complexes', limite: 'Limites', integrale: 'Intégrales', proba: 'Probabilités', combi: 'Dénombrement', trig: 'Trigonométrie', system3: 'Système 3×3', equilibrage: 'Équilibrage', genetique: 'Génétique', interest: 'Intérêts', tva: 'TVA', amort: 'Amortissement', annuite: 'Annuités', van: 'VAN', seuil: 'Seuil de rentabilité', regression: 'Régression', compta: 'Comptabilité' };
    shell('classe', phead('Nouveau devoir', 'classe/c/' + cid) + `<div class="body scroll"><div class="wrap" style="max-width:860px">
      <p class="muted" style="margin:0 0 12px">${esc(c.nom)} • ${esc(c.niveau)}</p>
      <div class="card"><div class="field"><label for="nd-t">Titre du devoir</label><input id="nd-t" class="input" value="${esc(NEWD.t || '')}" placeholder="ex : Devoir n°2 — Pythagore"></div>
        <div class="row2"><div class="field"><label for="nd-m">Durée (minutes, 0 = sans limite)</label><input id="nd-m" type="number" min="0" max="240" class="input" value="${NEWD.m !== undefined ? NEWD.m : 30}"></div><div class="field"><label for="nd-l">À rendre avant le</label><input id="nd-l" type="date" class="input" value="${NEWD.l || new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10)}"></div></div>
        <div class="field"><label for="nd-c">Consignes (facultatif)</label><input id="nd-c" class="input" value="${esc(NEWD.cs || '')}" placeholder="ex : Justifie chaque étape sur ton cahier."></div></div>
      <h3 class="sub">Exercices (${NEWD.items.length})</h3>
      <div class="list" id="nd-items">${NEWD.items.map((it, i) => `<div class="item"><span class="ic">${i + 1}</span><span class="tx"><b style="white-space:normal">${esc(it.e)}</b><small>${it.a || it.p || it.k ? (it.k ? '✔ Correction automatique par mots-clés : ' + esc(it.k.join(', ')) : '✔ Correction automatique • réponse attendue : ' + esc(it.r || '')) : '👩🏾‍🏫 Correction par l\'enseignant (réponse rédigée)'}</small></span><button class="btn sm o" onclick="RSutaApp3.ndDel(${i})" aria-label="Retirer">${I.trash(16)}</button></div>`).join('') || '<p class="muted">Ajoutez des exercices : saisissez-les ou générez-les automatiquement.</p>'}</div>
      <div class="card mt"><b>Ajouter un exercice</b><textarea id="nd-e" class="input mt" rows="2" placeholder="ex : Résous l'équation 4x − 3 = 2x + 9."></textarea><div class="chips mt"><button class="btn sm" onclick="RSutaApp3.ndAdd()" id="btn-ndadd">${I.plus(18)} Ajouter</button></div>
        <p class="muted" style="font-size:13px;margin:8px 0 0">Le prof RSuta résout l'exercice pour préparer la correction automatique. Vous pouvez aussi écrire « énoncé || réponse » pour imposer la réponse.</p></div>
      <div class="card mt"><b>Générer automatiquement</b><div class="row2 mt"><select id="nd-k" class="input">${kinds.map((k) => `<option value="${k}">${esc(KL[k] || k)}</option>`).join('')}</select><select id="nd-n" class="input">${[1, 2, 3, 4, 5].map((n) => `<option ${n === 3 ? 'selected' : ''}>${n}</option>`).join('')}</select></div><button class="btn sm o mt" onclick="RSutaApp3.ndGen('${c.niveau}')" id="btn-ndgen">${I.sparkle ? I.sparkle(18) : ''} Générer</button></div>
      <button class="btn y block mt" onclick="RSutaApp3.ndPublish()" id="btn-publish" ${NEWD.items.length ? '' : 'disabled'}>${I.share()} Publier et partager le devoir</button>
    </div></div>`);
  }
  function ndKeep() { if (!NEWD) return; const v = (id) => { const e = $(id); return e ? e.value : undefined; }; NEWD.t = v('#nd-t'); NEWD.m = v('#nd-m'); NEWD.l = v('#nd-l'); NEWD.cs = v('#nd-c'); }
  function teacherDevoir(id) {
    const d = DB.find('classe_devoirs', (x) => x.id === id && x.user_id === Auth.current.id); if (!d) return go('classe');
    const c = DB.find('classes', (x) => x.id === d.classe_id) || {};
    const rs = DB.where('classe_resultats', (r) => r.devoir_id === id).sort((a, b) => (b.note || 0) - (a.note || 0));
    const n = rs.filter((r) => r.note !== null && r.note !== undefined), notes = n.map((r) => r.note);
    const avg = notes.length ? notes.reduce((a, b) => a + b, 0) / notes.length : null;
    const perEx = d.items.map((it, i) => { const v = rs.map((r) => r.ok && r.ok[i]).filter((x) => x === 0 || x === 1); return v.length ? Math.round(v.filter((x) => x === 1).length / v.length * 100) : null; });
    const hard = perEx.reduce((m, p, i) => p !== null && (m === -1 || p < perEx[m]) ? i : m, -1);
    const pg = paginate('cres-' + id, rs);
    shell('classe', phead('Résultats du devoir', 'classe/c/' + d.classe_id, `<button class="act" onclick="RSutaApp3.shareDevoir('${id}')" aria-label="Partager le devoir" id="btn-sharedev">${I.qr()}</button>`) + `<div class="body scroll"><div class="wrap" style="max-width:1000px">
      <h2 class="title" style="margin-top:0">${esc(d.titre)}</h2><p class="muted" style="margin:-8px 0 14px">${esc(c.nom || '')} • ${d.items.length} exercice(s) • ${d.duree_min ? d.duree_min + ' min' : 'sans limite'}${d.date_limite ? ' • à rendre le ' + fmtDate(d.date_limite) : ''}</p>
      <div class="stats"><div class="stat"><b>${rs.length}</b><small>Copies</small></div><div class="stat"><b>${avg === null ? '—' : fr(avg, 1)}</b><small>Moyenne /20</small></div><div class="stat"><b>${notes.length ? fr(Math.max(...notes), 2) : '—'}</b><small>Meilleure</small></div><div class="stat"><b>${notes.length ? Math.round(notes.filter((x) => x >= 10).length / notes.length * 100) + ' %' : '—'}</b><small>≥ 10/20</small></div></div>
      <div class="chips mt"><button class="btn sm y" onclick="RSutaApp3.shareDevoir('${id}')">${I.qr(18)} Code / QR du devoir</button><button class="btn sm o" onclick="RSutaApp3.importAsk()">${I.upload(18)} Importer des copies</button><button class="btn sm o" onclick="RSutaApp3.csv('${id}')" id="btn-csv">${I.download(18)} Exporter (Excel/CSV)</button><button class="btn sm o" onclick="RSutaApp3.delDevoir('${id}')">${I.trash(18)} Supprimer</button></div>
      <h3 class="sub">Réussite par exercice</h3><div class="card"><div class="rbars">${d.items.map((it, i) => `<div class="rb"><span title="${esc(it.e)}">Ex. ${i + 1} — ${esc(it.e.slice(0, 42))}${it.e.length > 42 ? '…' : ''}</span><span class="pbar"><i style="width:${Math.max(3, perEx[i] || 0)}%;background:${perEx[i] === null ? '#cbd5e1' : perEx[i] >= 70 ? '#16a34a' : perEx[i] >= 50 ? '#f8c42f' : '#dc2626'}"></i></span><b>${perEx[i] === null ? '—' : perEx[i] + ' %'}</b></div>`).join('')}</div>
        ${hard >= 0 && perEx[hard] < 70 ? `<p class="tip mt">${I.info()} <span>L'exercice ${hard + 1} est le moins réussi (${perEx[hard]} %) : pensez à le reprendre en classe.</span></p>` : ''}</div>
      <h3 class="sub">Copies des élèves</h3>
      <div class="card" style="overflow-x:auto"><table class="tbl" id="tbl-res"><thead><tr><th>Élève</th><th>Note</th>${d.items.map((_, i) => `<th>Ex${i + 1}</th>`).join('')}<th>Temps</th><th>Rendu le</th><th></th></tr></thead><tbody>${pg.rows.map((r) => `<tr><td><b>${esc(r.eleve)}</b>${r.auto ? ' <small class="pill y">ramassée</small>' : ''}</td><td><b>${r.note === null || r.note === undefined ? '—' : fr(r.note, 2) + '/20'}</b></td>${d.items.map((_, i) => `<td>${r.ok && r.ok[i] === 1 ? '✅' : r.ok && r.ok[i] === 0 ? '❌' : '✍️'}</td>`).join('')}<td>${Math.round((r.duree_s || 0) / 60)} min</td><td>${fmtDT(r.rendu_le)}</td><td><button class="btn sm o" onclick="RSutaApp3.delRes('${r.id}')" aria-label="Supprimer">${I.trash(14)}</button></td></tr>`).join('') || `<tr><td colspan="${d.items.length + 5}" class="muted">Aucune copie importée. Demandez à vos élèves de vous envoyer leur code de copie (RSR1…).</td></tr>`}</tbody></table>${pager('cres-' + id, pg)}</div>
      <input type="file" id="cimpf" accept=".rsuta,.txt,text/plain" class="hidden" multiple onchange="RSutaApp3.fileImport(this)">
    </div></div>`);
  }
  function importResults(text) {
    const codes = findCodes(text, 'RSR1');
    if (!codes.length) return toast(findCodes(text, 'RSD1').length ? 'Ceci est un code de devoir (RSD1), pas une copie d\'élève.' : 'Aucun code de copie trouvé (il commence par RSR1.)', 3800);
    let ok = 0, dup = 0, unk = 0, bad = 0, lastDev = null;
    codes.forEach((code) => {
      try {
        const P = decode(code, 'RSR1');
        const d = DB.find('classe_devoirs', (x) => x.id === P.d && x.user_id === Auth.current.id); if (!d) { unk++; return; }
        if (DB.find('classe_resultats', (r) => r.devoir_id === d.id && r.eleve === P.e && r.rendu_le === P.at)) { dup++; return; }
        DB.insert('classe_resultats', { user_id: Auth.current.id, classe_id: d.classe_id, devoir_id: d.id, eleve: P.e, score: P.s, total: P.x, note: P.g, ok: P.ok, reponses: P.r, duree_s: P.dt, rendu_le: P.at, auto: !!P.auto }); ok++; lastDev = d.id;
      } catch (e) { bad++; }
    });
    toast(ok + ' copie(s) importée(s)' + (dup ? ' • ' + dup + ' déjà reçue(s)' : '') + (unk ? ' • ' + unk + ' pour un autre devoir/enseignant' : '') + (bad ? ' • ' + bad + ' code(s) abîmé(s)' : ''), 4200);
    if (lastDev) go('classe/d/' + lastDev); else window.RSutaApp.route();
  }
  R.classe = (a, b) => {
    if (isProf()) {
      if (a === 'c' && b) return teacherClass(b);
      if (a === 'new' && b) return teacherNew(b);
      if (a === 'd' && b) return teacherDevoir(b);
      return teacherHome();
    }
    if (a === 'd' && b) return studentDevoir(b);
    return studentList();
  };

  // ================================================================= 5. EXERCICES INTERACTIFS
  const GENK = { 'niv-CEP-m0-c0': 'arith', 'niv-CEP-m0-c1': 'fraction', 'niv-CEP-m0-c2': 'area', 'niv-CEP-m1-c0': 'conjugaison', 'niv-BEPC-m0-c0': 'develop', 'niv-BEPC-m0-c1': 'linear', 'niv-BEPC-m0-c2': 'system', 'niv-BEPC-m0-c3': 'pythagore', 'niv-BEPC-m0-c4': 'percent', 'niv-BEPC-m1-c0': 'ohm', 'niv-BEPC-m1-c2': 'masse_molaire', 'niv-BAC-m0-c0': 'limite', 'niv-BAC-m0-c1': 'derivative', 'niv-BAC-m0-c3': 'suite', 'niv-BAC-m0-c4': 'complexe', 'niv-BAC-m0-c5': 'proba', 'niv-BAC-m2-c0': 'genetique', 'niv-LICENCE-m0-c0': 'interest', 'niv-LICENCE-m0-c1': 'annuite', 'niv-LICENCE-m0-c2': 'van', 'niv-LICENCE-m1-c0': 'compta', 'niv-LICENCE-m1-c1': 'tva', 'niv-LICENCE-m1-c2': 'amort', 'niv-LICENCE-m2-c0': 'stats', 'niv-LICENCE-m2-c1': 'regression', 'niv-LICENCE-m8-c0': 'circuit' };
  let XS = null;
  const PAL = ['#1f4fd1', '#d97706', '#16a34a', '#9333ea', '#dc2626', '#0891b2'];
  function initItem(it) {
    if (it.t === 'trous') return { it, fill: it.ans.map(() => null), sel: 0, bank: shuffle(it.bank), done: false };
    if (it.t === 'ordre') { let p = shuffle(it.ans.map((_, i) => i)); if (p.every((v, i) => v === i)) p = p.reverse(); return { it, pool: p, seq: [], done: false }; }
    return { it, right: shuffle(it.pairs.map((_, i) => i)), selL: null, match: {}, done: false };
  }
  function itemHTML(k) {
    const s = XS.st[k], it = s.it, head = `<div class="xh"><span class="pill ${it.t === 'trous' ? '' : it.t === 'ordre' ? 'y' : 'g'}">${it.t === 'trous' ? 'Texte à trous' : it.t === 'ordre' ? 'Remets dans l\'ordre' : 'Relie les paires'}</span>${s.done ? `<b class="${s.ok ? 'okc' : 'koc'}">${s.ok ? '✅ Bravo !' : '❌ Presque…'}</b>` : ''}</div><p class="xq">${esc(it.q.replace(/\[\[\d+\]\]/g, '___').split('\n')[0])}</p>`;
    let body = '';
    if (it.t === 'trous') {
      const segs = it.q.split(/\[\[(\d+)\]\]/); let html = '';
      segs.forEach((seg, i) => { if (i % 2 === 0) html += esc(seg); else { const b = +seg, v = s.fill[b], cls = s.done ? (v === it.ans[b] ? 'ok' : 'ko') : (s.sel === b ? 'sel' : ''); html += `<button class="blank ${cls} ${v ? 'f' : ''}" ${s.done ? 'disabled' : ''} onclick="RSutaApp3.xBlank(${k},${b})">${v ? esc(v) : '……'}</button>${s.done && v !== it.ans[b] ? `<small class="fix">${esc(it.ans[b])}</small>` : ''}`; } });
      body = `<div class="xtext">${html.replace(/\n/g, '<br>')}</div>${s.done ? '' : `<div class="bank">${s.bank.map((w, i) => { const used = s.fill.filter((f) => f === w).length >= s.bank.filter((x) => x === w).length; return `<button class="chip ${used ? 'used' : ''}" ${used ? 'disabled' : ''} onclick="RSutaApp3.xChip(${k},${i})">${esc(w)}</button>`; }).join('')}</div>`}`;
      body = body.replace(/^/, '');
      return `<div class="card xi" id="xi-${k}">${head.replace(/<p class="xq">.*?<\/p>/, '<p class="xq muted">Touche un trou, puis un mot de la banque.</p>')}${body}${foot(k)}</div>`;
    }
    if (it.t === 'ordre') {
      body = `<div class="seq">${s.seq.map((v, i) => `<button class="sq ${s.done ? (v === i ? 'ok' : 'ko') : ''}" ${s.done ? 'disabled' : ''} onclick="RSutaApp3.xUn(${k},${i})"><i>${i + 1}</i>${esc(it.ans[v])}</button>`).join('') || '<p class="muted" style="margin:4px 0">Touche les étapes dans le bon ordre ↓</p>'}</div>${s.done ? (s.ok ? '' : `<div class="fixbox"><b>Bon ordre :</b><ol>${it.ans.map((a) => `<li>${esc(a)}</li>`).join('')}</ol></div>`) : `<div class="bank col">${s.pool.filter((v) => !s.seq.includes(v)).map((v) => `<button class="chip" onclick="RSutaApp3.xPick(${k},${v})">${esc(it.ans[v])}</button>`).join('')}</div>`}`;
      return `<div class="card xi" id="xi-${k}">${head}${body}${foot(k)}</div>`;
    }
    const colorOf = (li) => PAL[Object.keys(s.match).map(Number).sort((a, b) => a - b).indexOf(li) % PAL.length];
    const rOwner = (ri) => { const e = Object.entries(s.match).find(([, r]) => r === ri); return e ? +e[0] : null; };
    body = `<div class="pairs"><div class="pc">${it.pairs.map((p, li) => { const m = s.match[li] !== undefined, okp = s.done && s.match[li] === li; return `<button class="pl ${s.selL === li ? 'sel' : ''} ${s.done ? (okp ? 'ok' : 'ko') : ''}" ${s.done ? 'disabled' : ''} style="${m && !s.done ? 'border-color:' + colorOf(li) + ';box-shadow:inset 6px 0 0 ' + colorOf(li) : ''}" onclick="RSutaApp3.xL(${k},${li})">${esc(p[0])}</button>`; }).join('')}</div><div class="pc">${s.right.map((ri) => { const o = rOwner(ri); return `<button class="pr ${s.done ? (o === ri ? 'ok' : 'ko') : ''}" ${s.done ? 'disabled' : ''} style="${o !== null && !s.done ? 'border-color:' + colorOf(o) + ';box-shadow:inset -6px 0 0 ' + colorOf(o) : ''}" onclick="RSutaApp3.xR(${k},${ri})">${esc(it.pairs[ri][1])}</button>`; }).join('')}</div></div>${s.done && !s.ok ? `<div class="fixbox"><b>Bonnes associations :</b><ul>${it.pairs.map((p) => `<li>${esc(p[0])} → ${esc(p[1])}</li>`).join('')}</ul></div>` : ''}`;
    return `<div class="card xi" id="xi-${k}">${head}${!s.done ? '<p class="muted" style="font-size:13px;margin:-4px 0 8px">Touche un élément à gauche puis sa réponse à droite.</p>' : ''}${body}${foot(k)}</div>`;
  }
  function foot(k) { const s = XS.st[k]; return `<div class="xf">${s.done ? `<button class="btn sm o" onclick="RSutaApp3.xRetry(${k})">↻ Recommencer</button>` : `<button class="btn sm" onclick="RSutaApp3.xCheck(${k})">${I.check(16)} Vérifier</button><button class="btn sm o" onclick="RSutaApp3.xRetry(${k})">Effacer</button>`}</div>`; }
  const redraw = (k) => { const el = $('#xi-' + k); if (el) el.outerHTML = itemHTML(k); scoreBar(); };
  function scoreBar() { const el = $('#xscore'); if (!el) return; const d = XS.st.filter((s) => s.done), ok = d.filter((s) => s.ok).length; el.innerHTML = `<b>${ok}/${XS.st.length}</b> réussi(s) • ${d.length}/${XS.st.length} vérifié(s)${d.length === XS.st.length ? (ok === XS.st.length ? ' — 🏆 parfait !' : ' — refais ceux en rouge') : ''}`; }
  function genApp() {
    const k = GENK[XS.chap]; if (!k) return '';
    let g = null; try { g = Eng.generate(k, { niveau: XS.niv }); } catch (e) { g = null; }
    if (!g || !g.enonce || (!g.answers && !g.poly)) return '';
    XS.gen = g;
    return `<div class="card xi" id="xgen"><div class="xh"><span class="pill y">Exercice d'application</span><small class="muted">nouveau à chaque fois</small></div><p style="font-weight:700;margin:8px 0">${esc(g.enonce)}</p><div class="search" style="margin:0"><input class="input" id="xg-in" placeholder="Ta réponse…" onkeydown="if(event.key==='Enter')RSutaApp3.xgCheck()"><button class="btn sm" onclick="RSutaApp3.xgCheck()">Vérifier</button><button class="btn sm o" onclick="A.solveText(RSutaApp3._gen().enonce,'exo')">Solution</button></div><div class="xf"><button class="btn sm o" onclick="RSutaApp3.xgNew()">↻ Un autre</button></div></div>`;
  }
  R.exos = (chapId) => {
    const c = chapOf(chapId), EX = window.RSutaExos; if (!c || !EX || !EX.has(chapId)) return go('cours');
    XS = { chap: chapId, niv: c.niveau, st: EX.items(chapId).map(initItem) };
    const m = D.matieres.find((x) => x.id === c.matiere_id);
    const hasXC = D.lecons.find((l) => l.id === chapId + '-xc');
    shell('cours', phead('Exercices interactifs', 'chapitre/' + chapId) + `<div class="body scroll"><div class="wrap" style="max-width:860px">
      <h2 class="title" style="margin-top:0">${esc(c.titre)}</h2><p class="muted" style="margin:-8px 0 12px">${esc(m ? m.nom : '')} • ${c.niveau}</p>
      <div class="tip" id="xscore"></div>
      ${XS.st.map((_, k) => itemHTML(k)).join('')}
      ${genApp()}
      ${hasXC ? `<button class="btn o block mt" onclick="A.go('lecon/${chapId}-xc')">${I.book(20)} Voir les exercices corrigés du chapitre</button>` : ''}
    </div></div>`);
    scoreBar();
  };
  function recordExo(item, ok) { DB.insert('tentatives', { user_id: Auth.current.id, source: 'exo', chapitre_id: XS.chap, question_id: item ? item.id : null, niveau: XS.niv, matiere: matOfChap(XS.chap), ok: !!ok }); }

  // ================================================================= API publique (handlers onclick)
  const API = {
    stats, level, homeStrip, profilCard, checkBadges, defiOk, share, drawCard, shareSpec, BADGES, LEVELS, XP, encode, decode, findCodes, fnv, qrCanvas,
    waReport: () => wa(window._rapportTxt || ''),
    // élève
    recv: () => receive($('#crecv').value),
    scanRecv: () => scanQR((t) => receive(t)),
    fileRecv: (inp) => readFileText(inp, receive),
    startCopy: (id) => { const r = DB.find('classe_recus', (x) => x.id === id); if (!r) return; r.started_at = new Date().toISOString(); DB.save('classe_recus'); R.classe('d', id); },
    saveRep: (id, i, v) => { const r = DB.find('classe_recus', (x) => x.id === id); if (r && r.statut !== 'rendu') { r.reponses[i] = v; DB.save('classe_recus'); } },
    submitAsk: (id) => { const r = DB.find('classe_recus', (x) => x.id === id); if (!r) return; const miss = r.devoir.it.filter((_, i) => !String(r.reponses[i] || '').trim()).length; confirmBox((miss ? miss + ' exercice(s) sans réponse. ' : '') + 'Rendre ta copie maintenant ? Tu ne pourras plus la modifier.', () => submitCopy(id, false), 'Rendre'); },
    showCopy: (id) => { const r = DB.find('classe_recus', (x) => x.id === id); if (!r) return; codeModal('Code de ma copie', r.code, 'Montre ce QR code à ton enseignant, ou envoie-lui le code par WhatsApp ou en fichier.', 'Copie-' + Auth.current.nom.replace(/\W+/g, '_') + '.rsuta', '📝 Ma copie RSuta — ' + r.devoir.t + (r.note !== null ? ' : ' + fr(r.note, 2) + '/20' : '') + ' (' + Auth.current.nom + '). Code à importer dans RSuta > Ma classe :'); },
    waCopy: (id) => { const r = DB.find('classe_recus', (x) => x.id === id); if (r) wa('📝 Ma copie RSuta — ' + r.devoir.t + (r.note !== null ? ' : ' + fr(r.note, 2) + '/20' : '') + ' (' + Auth.current.nom + '). Code à importer dans RSuta > Ma classe :\n\n' + r.code); },
    explain: (id, i) => { const r = DB.find('classe_recus', (x) => x.id === id); if (r) window.A.solveText(r.devoir.it[i].e, 'classe'); },
    // enseignant
    newClass: () => modal('Nouvelle classe', `<div class="field"><label for="cn">Nom de la classe</label><input id="cn" class="input" placeholder="ex : 3e B — CEG Kandi"></div><div class="row2"><div class="field"><label for="cv">Niveau</label><select id="cv" class="input">${NIV.map((n) => `<option ${n === Auth.current.niveau ? 'selected' : ''}>${n}</option>`).join('')}</select></div><div class="field"><label for="ce">Établissement</label><input id="ce" class="input" placeholder="ex : CEG Kandi"></div></div>`, [{ label: 'Annuler', cls: 'o' }, { label: 'Créer', on: () => { const n = $('#cn').value.trim(); if (n.length < 2) { toast('Donne un nom à la classe.'); return false; } const c = DB.insert('classes', { user_id: Auth.current.id, nom: n, niveau: $('#cv').value, etablissement: $('#ce').value.trim() }); setTimeout(() => go('classe/c/' + c.id), 50); } }]),
    delClass: (id) => confirmBox('Supprimer cette classe, ses devoirs et toutes les copies ?', () => { DB.where('classe_devoirs', (d) => d.classe_id === id).forEach((d) => DB.remove('classe_devoirs', d.id)); DB.where('classe_resultats', (r) => r.classe_id === id).forEach((r) => DB.remove('classe_resultats', r.id)); DB.remove('classes', id); go('classe'); }, 'Supprimer'),
    delDevoir: (id) => { const d = DB.find('classe_devoirs', (x) => x.id === id); confirmBox('Supprimer ce devoir et ses copies ?', () => { DB.where('classe_resultats', (r) => r.devoir_id === id).forEach((r) => DB.remove('classe_resultats', r.id)); DB.remove('classe_devoirs', id); go('classe/c/' + d.classe_id); }, 'Supprimer'); },
    delRes: (id) => confirmBox('Supprimer cette copie ?', () => { DB.remove('classe_resultats', id); window.RSutaApp.route(); }, 'Supprimer'),
    ndAdd: () => {
      ndKeep(); const raw = $('#nd-e').value.trim(); if (raw.length < 4) return toast('Écris l\'énoncé de l\'exercice.');
      const [e, forced] = raw.split('||').map((x) => x.trim()); const c = DB.find('classes', (x) => x.id === NEWD.cid); const it = { e };
      if (forced) { if (/x/.test(forced) && !/=/.test(forced)) it.p = forced.replace(/²/g, '^2').replace(/−/g, '-'); else { const n = Eng.nums(forced.replace(/\s(?=\d{3}\b)/g, '')); if (n.length) it.a = n; else if (/[A-Za-zÀ-ÿ]/.test(forced)) it.k = forced.split(/[,;]|\bet\b/i).map((w) => w.trim()).filter((w) => w.length > 2); } it.r = forced; }
      else { try { const r = Eng.solve(e, { niveau: c.niveau }); if (r && (r.answers || r.poly) && r.solver !== 'solveMethod') { if (r.answers) it.a = r.answers; if (r.poly) it.p = r.poly; it.r = String(r.reponse || ''); } } catch (er) { /* */ } }
      NEWD.items.push(it); teacherNew(NEWD.cid); toast(it.a || it.p || it.k ? 'Ajouté ✔ correction automatique prête' + (it.k ? ' (mots-clés)' : '') : 'Ajouté ✔ (réponse rédigée : correction par vous)');
    },
    ndGen: (niv) => { ndKeep(); const k = $('#nd-k').value, n = +$('#nd-n').value; for (let i = 0; i < n; i++) { try { const g = Eng.generate(k, { niveau: niv }); if (!g || !g.enonce) continue; let r = ''; try { const s = Eng.solve(g.enonce, { niveau: niv }); r = s && s.reponse ? String(s.reponse) : ''; } catch (e) { /* */ } if (!r) r = g.poly ? g.poly.replace(/\^2/g, '²') : (g.answers || []).map((v) => fr(v, 2)).join(' ; '); NEWD.items.push({ e: g.enonce, a: g.answers, p: g.poly, r }); } catch (e) { /* */ } } teacherNew(NEWD.cid); toast(n + ' exercice(s) générés ✔'); },
    ndDel: (i) => { ndKeep(); NEWD.items.splice(i, 1); teacherNew(NEWD.cid); },
    ndPublish: () => {
      ndKeep(); if (!NEWD.items.length) return toast('Ajoute au moins un exercice.'); const c = DB.find('classes', (x) => x.id === NEWD.cid);
      const d = DB.insert('classe_devoirs', { user_id: Auth.current.id, classe_id: c.id, titre: (NEWD.t || '').trim() || 'Devoir du ' + fmtDate(new Date()), niveau: c.niveau, duree_min: Math.max(0, Math.min(240, +NEWD.m || 0)), date_limite: NEWD.l || '', consignes: (NEWD.cs || '').trim(), items: NEWD.items.map((it) => { const o = { e: it.e, r: it.r || '' }; if (it.a) o.a = it.a; if (it.p) o.p = it.p; if (it.k) o.k = it.k; return o; }) });
      NEWD = null; go('classe/d/' + d.id); setTimeout(() => API.shareDevoir(d.id), 500);
    },
    shareDevoir: (id) => { const d = DB.find('classe_devoirs', (x) => x.id === id); if (!d) return; const c = DB.find('classes', (x) => x.id === d.classe_id) || {}; codeModal('Partager le devoir', devoirCode(d), 'Vos élèves ouvrent RSuta › <b>Devoirs de classe</b> › puis scannent ce QR code, collent le code ou ouvrent le fichier. Aucune connexion nécessaire.', 'Devoir-' + d.titre.replace(/[^\wÀ-ÿ]+/g, '_').slice(0, 40) + '.rsuta', '📚 Devoir RSuta : ' + d.titre + ' (' + (c.nom || '') + ') — ' + d.items.length + ' exercice(s)' + (d.duree_min ? ', ' + d.duree_min + ' min' : '') + (d.date_limite ? ', à rendre avant le ' + fmtDate(d.date_limite) : '') + '. Ouvre RSuta › Devoirs de classe › colle ce code :'); },
    importAsk: () => modal('Importer des copies', `<p class="muted" style="font-size:13.5px;margin:0 0 8px">Collez un ou plusieurs codes de copie (RSR1…), par exemple tous les messages WhatsApp reçus d'un coup.</p><textarea id="cimp" class="input" rows="5" placeholder="RSR1.…"></textarea>`, [{ label: 'Fichiers', cls: 'o', on: () => { const f = $('#cimpf'); if (f) f.click(); else toast('Ouvrez « Ma classe » pour importer des fichiers.'); } }, { label: 'QR code', cls: 'o', on: () => { setTimeout(() => scanQR(importResults), 50); } }, { label: 'Importer', on: () => { const t = $('#cimp').value; setTimeout(() => importResults(t), 30); } }]),
    fileImport: (inp) => { const fs = [...(inp.files || [])]; if (!fs.length) return; Promise.all(fs.map((f) => f.text())).then((ts) => importResults(ts.join('\n'))); inp.value = ''; },
    csv: (id) => {
      const d = DB.find('classe_devoirs', (x) => x.id === id); const rs = DB.where('classe_resultats', (r) => r.devoir_id === id).sort((a, b) => a.eleve.localeCompare(b.eleve));
      const q = (v) => '"' + String(v === null || v === undefined ? '' : v).replace(/"/g, '""') + '"';
      const head = ['Élève', 'Note /20', 'Exercices justes', 'Exercices notés auto'].concat(d.items.map((_, i) => 'Ex' + (i + 1))).concat(['Durée (min)', 'Rendu le']);
      const lines = [head.map(q).join(';')].concat(rs.map((r) => [r.eleve, r.note === null || r.note === undefined ? '' : String(r.note).replace('.', ','), r.score, r.total].concat(d.items.map((_, i) => r.ok && r.ok[i] === 1 ? 'juste' : r.ok && r.ok[i] === 0 ? 'faux' : 'à corriger')).concat([Math.round((r.duree_s || 0) / 60), fmtDT(r.rendu_le)]).map(q).join(';')));
      download('Resultats-' + d.titre.replace(/[^\wÀ-ÿ]+/g, '_').slice(0, 40) + '.csv', '\ufeff' + lines.join('\r\n'), 'text/csv;charset=utf-8'); toast('Fichier CSV enregistré (ouvrable avec Excel) 📥');
    },
    // exercices interactifs
    xBlank: (k, b) => { const s = XS.st[k]; if (s.done) return; if (s.fill[b]) s.fill[b] = null; s.sel = b; redraw(k); },
    xChip: (k, i) => { const s = XS.st[k]; if (s.done) return; const w = s.bank[i]; let b = s.sel !== null && !s.fill[s.sel] ? s.sel : s.fill.indexOf(null); if (b < 0) b = s.sel !== null ? s.sel : 0; s.fill[b] = w; const nx = s.fill.indexOf(null); s.sel = nx >= 0 ? nx : null; redraw(k); },
    xPick: (k, v) => { const s = XS.st[k]; if (!s.done && !s.seq.includes(v)) { s.seq.push(v); redraw(k); } },
    xUn: (k, i) => { const s = XS.st[k]; if (!s.done) { s.seq.splice(i, 1); redraw(k); } },
    xL: (k, li) => { const s = XS.st[k]; if (s.done) return; if (s.match[li] !== undefined) { delete s.match[li]; } s.selL = li; redraw(k); },
    xR: (k, ri) => { const s = XS.st[k]; if (s.done) return; if (s.selL === null) { const o = Object.entries(s.match).find(([, r]) => r === ri); if (o) { delete s.match[o[0]]; redraw(k); } else toast('Touche d\'abord un élément à gauche.'); return; } Object.keys(s.match).forEach((l) => { if (s.match[l] === ri) delete s.match[l]; }); s.match[s.selL] = ri; const free = s.it.pairs.map((_, i) => i).find((i) => s.match[i] === undefined); s.selL = free === undefined ? null : free; redraw(k); },
    xCheck: (k) => {
      const s = XS.st[k], it = s.it; let ok;
      if (it.t === 'trous') { if (s.fill.some((f) => !f)) return toast('Remplis tous les trous.'); ok = s.fill.every((f, i) => f === it.ans[i]); }
      else if (it.t === 'ordre') { if (s.seq.length < it.ans.length) return toast('Place toutes les étapes.'); ok = s.seq.every((v, i) => v === i); }
      else { if (Object.keys(s.match).length < it.pairs.length) return toast('Relie toutes les paires.'); ok = it.pairs.every((_, i) => s.match[i] === i); }
      s.done = true; s.ok = ok; recordExo(it, ok); redraw(k);
      toast(ok ? '✅ Bravo ! +' + XP.exo + ' XP' : '❌ Regarde la correction et réessaie.', 2200);
    },
    xRetry: (k) => { XS.st[k] = initItem(XS.st[k].it); redraw(k); },
    xgCheck: () => { const v = $('#xg-in').value; const ok = Eng.checkAnswer(XS.gen, v); if (ok === null) return toast('Écris une réponse (ex : x = 4)'); recordExo({ id: XS.chap + '-gen' }, ok); toast(ok ? '✅ Bravo ! ' + Prof.pick(Prof.ENC[XS.niv] || ['Bien joué !']) : '❌ Pas encore… réessaie ou clique sur Solution.', 3200); },
    xgNew: () => { const el = $('#xgen'); if (el) el.outerHTML = genApp(); },
    _gen: () => XS && XS.gen,
    GENK
  };
  window.RSutaApp3 = API;
})();
