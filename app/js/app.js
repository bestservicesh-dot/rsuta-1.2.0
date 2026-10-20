/* RSuta — Application (routeur, écrans, interactions). Vanilla JS, aucune dépendance réseau. */
(function () {
  'use strict';
  const D = window.RSutaData, DB = window.RSutaDB, Auth = window.RSutaAuth, Prof = window.RSutaProf, Eng = window.RSutaEngine, OCR = window.RSutaOCR, I = window.I;
  const VERSION = '1.2.0';
  const CHANGELOG = [
    { v: '1.2.0', d: 'octobre 2026', items: ['Motivation : points XP, 10 niveaux (Débutant → Légende), séries de jours actifs, 20 badges et page « Mes progrès »', 'Partage : image carrée de tes résultats (exercice, quiz, examen blanc, progression) pour WhatsApp, Facebook ou TikTok', 'Rapport pour les parents : bilan imprimable des 30 derniers jours (activité, maîtrise par matière, examens, conseils)', 'Écoles : rôle Enseignant, classes, devoirs envoyés par code, QR code ou fichier, chrono, correction automatique, import des copies et export Excel/CSV, sans serveur', 'Exercices interactifs pour les 61 chapitres (textes à trous, remise en ordre, paires) et exercices d\'application générés', '122 exercices corrigés ajoutés aux leçons et 16 nouveaux sujets types (55 au total)', 'Nouveaux solveurs : dynamique (lois de Newton) et dipôles RC, RL et condensateurs'] },
    { v: '1.1.0', d: 'octobre 2026', items: ['Module « Réviser » : diagnostic, plan de révision jusqu\'à l\'examen, examen blanc chronométré noté /20, points faibles', 'Fiches de révision pour les 61 chapitres et cartes mémoire à répétition espacée (Leitner)', 'Nouveaux solveurs : suites, complexes, trigonométrie, limites, intégrales, probabilités, vecteurs, systèmes 3×3, régression, chimie, mécanique, circuits, génétique, journal SYSCOHADA, emprunts, VAN/TRI, seuil de rentabilité', 'Affichage mathématique (fractions, racines, exposants), graphiques et tableaux dans les corrections', 'Clavier mathématique', 'Scan amélioré : recadrage et redressement automatiques, choix de la zone à lire', '21 nouveaux sujets types (non officiels)', 'Corrections : nombres écrits avec espaces (1 250), fraction d\'une quantité (« les 3/5 de 4 500 F »), TVA à partir du TTC, équations trigonométriques avec racines, tirages dans une urne'] },
    { v: '1.0.0', d: 'octobre 2026', items: ['Première version : accueil, cours CEP/BEPC/BAC/Licence, quiz, scan de devoir, Prof IA hors-ligne en 3 étapes, chat, épreuves, comptes et paramètres', 'Applications web (PWA), Windows et Android/iOS'] }
  ];
  const EDITEUR = { nom: 'BSH - Best Services and House', sigle: 'BSH', tel: '+229 01 48 52 45 90', telHref: 'tel:+2290148524590', email: 'contact@bestservicesandhouse.site', web: 'https://www.bestservicesandhouse.site', webLabel: 'www.bestservicesandhouse.site' };
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const NIV = ['CEP', 'BEPC', 'BAC', 'LICENCE'];
  const NIVINFO = { CEP: { theme: 'yellow', icon: 'pBook', cycle: 'Primaire' }, BEPC: { theme: 'blue', icon: 'pCap', cycle: 'Collège' }, BAC: { theme: 'blue', icon: 'pDiploma', cycle: 'Lycée' }, LICENCE: { theme: 'yellow', icon: 'pBank', cycle: 'Supérieur' } };
  const fmtDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  const fmtDT = (d) => new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  // ---------------------------------------------------------------- paramètres
  const DEF = { theme: 'light', fontSize: 16, profMode: 'auto', apiUrl: 'https://api.openai.com/v1/chat/completions', apiKey: '', apiModel: 'gpt-4o-mini', vision: false, voiceRate: 0.95, voiceName: '', autoSpeak: false, pageSize: 10, reminders: true, reminderTime: '18:00', camera: true, sounds: true, cropAsk: true };
  const S = Object.assign({}, DEF, (() => { try { return JSON.parse(localStorage.getItem('rsuta.settings') || '{}'); } catch (e) { return {}; } })());
  function saveSettings() { localStorage.setItem('rsuta.settings', JSON.stringify(S)); applySettings(); }
  function applySettings() {
    const dark = S.theme === 'dark' || (S.theme === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.style.setProperty('--fs', S.fontSize + 'px');
    document.querySelector('meta[name=theme-color]').setAttribute('content', '#1f4fd1');
  }

  // ---------------------------------------------------------------- utilitaires UI
  function toast(msg, ms) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), ms || 2600); }
  function modal(title, body, buttons, opts) {
    closeModal();
    const o = document.createElement('div'); o.className = 'overlay'; o.id = 'modal';
    o.innerHTML = `<div class="modal" role="dialog" aria-label="${esc(title)}"><h3>${title}</h3><div class="mbody scroll">${body}</div><div class="mfoot">${(buttons || []).map((b, i) => `<button class="btn ${b.cls || ''}" data-i="${i}">${b.label}</button>`).join('')}</div></div>`;
    o.addEventListener('click', (e) => { if (e.target === o && !(opts && opts.sticky)) closeModal(); const b = e.target.closest('[data-i]'); if (b) { const fn = buttons[+b.dataset.i].on; if (!fn || fn() !== false) closeModal(); } });
    document.body.appendChild(o);
    const f = o.querySelector('input,textarea,select'); if (f && !(opts && opts.nofocus)) setTimeout(() => f.focus(), 60);
    return o;
  }
  function closeModal() { const m = $('#modal'); if (m) m.remove(); }
  function confirmBox(msg, onYes, yes) { modal('Confirmation', `<p>${msg}</p>`, [{ label: 'Annuler', cls: 'o' }, { label: yes || 'Confirmer', cls: 'r', on: onYes }]); }
  function loader(msg) { let l = $('#ld'); if (!msg) { if (l) l.remove(); return; } if (!l) { l = document.createElement('div'); l.className = 'loader'; l.id = 'ld'; ($('.screen') || document.body).appendChild(l); } l.innerHTML = `<div class="spin"></div><div>${msg}</div>`; }
  function avatarHTML(u, cls) { u = u || Auth.current || {}; if (u.avatar === 'demo') return `<div class="avatar ${cls || ''}"><img src="img/avatar-demo.jpg" alt=""></div>`; if (u.avatar) return `<div class="avatar ${cls || ''}"><img src="${u.avatar}" alt=""></div>`; return `<div class="avatar ${cls || ''}">${esc((u.nom || '?').trim().charAt(0).toUpperCase())}</div>`; }
  function md(text) {
    const out = []; let inList = false;
    String(text).split('\n').forEach((ln) => {
      const b = esc(ln).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
      if (/^•\s/.test(ln)) { if (!inList) { out.push('<ul>'); inList = true; } out.push('<li>' + b.replace(/^•\s/, '') + '</li>'); return; }
      if (inList) { out.push('</ul>'); inList = false; }
      if (/^##\s/.test(ln)) out.push('<h4>' + b.replace(/^##\s/, '') + '</h4>');
      else if (/^Exemple|^Astuce/.test(ln)) out.push('<div class="ex">' + b + '</div>');
      else if (ln.trim()) out.push('<p>' + b + '</p>');
    });
    if (inList) out.push('</ul>');
    return out.join('');
  }
  // Pagination
  const PG = {};
  function paginate(key, items) { const size = +S.pageSize || 10; const pages = Math.max(1, Math.ceil(items.length / size)); let p = Math.min(PG[key] || 1, pages); PG[key] = p; return { rows: items.slice((p - 1) * size, p * size), page: p, pages, total: items.length, size }; }
  function pager(key, pg) {
    if (pg.pages <= 1) return pg.total ? `<div class="pager"><div class="info">${pg.total} élément(s)</div></div>` : '';
    const btn = (n, lbl, dis, on) => `<button ${dis ? 'disabled' : ''} class="${on ? 'on' : ''}" onclick="A.page('${key}',${n})" aria-label="Page ${n}">${lbl}</button>`;
    const nums = []; for (let i = 1; i <= pg.pages; i++) { if (i === 1 || i === pg.pages || Math.abs(i - pg.page) <= 1) nums.push(btn(i, i, false, i === pg.page)); else if (nums[nums.length - 1] !== '…') nums.push('…'); }
    return `<div class="pager">${btn(pg.page - 1, '‹', pg.page === 1)}${nums.map((n) => n === '…' ? '<span class="muted">…</span>' : n).join('')}${btn(pg.page + 1, '›', pg.page === pg.pages)}<div class="info">Page ${pg.page} / ${pg.pages} • ${pg.total} éléments</div></div>`;
  }

  // ---------------------------------------------------------------- statistiques élève
  function userProgress(u) {
    u = u || Auth.current;
    const done = DB.where('progression', (p) => p.user_id === u.id && p.statut === 'termine');
    const now = new Date();
    const month = new Set(done.filter((p) => { const d = new Date(p.date_scan); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).map((p) => p.lecon_id));
    const goal = u.objectif || 30;
    return { done: new Set(done.map((p) => p.lecon_id)), month: month.size, goal, pct: Math.min(100, Math.round(month.size / goal * 100)) };
  }
  const isDone = (lid) => DB.find('progression', (p) => p.user_id === Auth.current.id && p.lecon_id === lid && p.statut === 'termine');
  const unread = () => DB.where('notifications', (n) => n.user_id === Auth.current.id && !n.lu).length;

  // ---------------------------------------------------------------- coquille (sidebar + navigation)
  const MAINNAV = [['home', 'Accueil', 'home'], ['cours', 'Cours', 'book'], ['quiz', 'Quiz', 'list'], ['profil', 'Profil', 'user']];
  const ALTNAV = [['scan', 'Scan', 'scan'], ['devoirs', 'Devoirs', 'homework'], ['chat', 'Chat', 'chat'], ['profil', 'Profil', 'copyright']];
  function sidebar(active) {
    const items = [['home', 'Accueil', 'home'], ['cours', 'Cours', 'book'], ['quiz', 'Quiz', 'list'], ['scan', 'Scan ton devoir', 'scan'], ['revision', 'Réviser', 'trophy'], ['progres', 'Mes progrès', 'star'], ['classe', Auth.current.role === 'enseignant' ? 'Ma classe' : 'Devoirs de classe', 'group'], ['devoirs', 'Mes devoirs', 'homework'], ['chat', 'Chat avec le prof', 'chat'], ['epreuves', 'Épreuves', 'doc'], ['notifications', 'Notifications', 'bell'], ['profil', 'Profil', 'user'], ['parametres', 'Paramètres', 'settings']];
    if (Auth.current.role === 'admin') items.push(['admin', 'Administration', 'shield']);
    return `<aside class="sidebar">${I.pattern()}${I.logo(34)}<nav class="scroll">${items.map(([r, l, ic]) => `<button class="${active === r ? 'on' : ''}" onclick="A.go('${r}')">${I[ic](22)}<span>${l}</span>${r === 'notifications' && unread() ? `<span class="pill y" style="margin-left:auto">${unread()}</span>` : ''}</button>`).join('')}</nav>
      <div class="me">${avatarHTML()}<div><b>${esc(Auth.current.nom)}</b><small>${esc(Auth.current.niveau)} • ${navigator.onLine ? 'en ligne' : 'hors-ligne'}</small></div></div></aside>`;
  }
  function bottomnav(kind, active) {
    const list = kind === 'alt' ? ALTNAV : MAINNAV;
    return `<nav class="bottomnav ${kind === 'alt' ? 'alt' : ''}">${list.map(([r, l, ic]) => `<button class="${active === r ? 'on' : ''}" onclick="A.go('${r}')" aria-label="${l}">${I[ic](kind === 'alt' ? 24 : 27)}<span>${l}</span></button>`).join('')}</nav>`;
  }
  function shell(active, inner, nav) {
    $('#app').innerHTML = sidebar(active) + `<main class="screen">${inner}${nav === false ? '' : bottomnav(nav || 'main', active)}<button class="totop" onclick="A.top()" aria-label="Haut de page">${I.up()}</button></main>`;
    const b = $('.screen .body'); if (b) b.addEventListener('scroll', () => { const t = $('.totop'); if (t) t.classList.toggle('show', b.scrollTop > 400); });
  }
  function phead(title, back, actions) { return `<header class="phead">${I.pattern()}${back ? `<button class="back" onclick="A.back('${back}')" aria-label="Retour">${I.back(26)}</button>` : ''}<h1>${title}</h1>${actions || ''}</header>`; }

  // ---------------------------------------------------------------- routeur
  const R = {};
  let current = '';
  function route() {
    const h = location.hash.replace(/^#\/?/, '') || 'home';
    const [name, ...args] = h.split('/').map(decodeURIComponent);
    if (!Auth.current && !['login', 'register', 'forgot'].includes(name)) { location.hash = '#/login'; return; }
    if (Auth.current && ['login', 'register', 'forgot'].includes(name)) { location.hash = '#/home'; return; }
    Prof.stopSpeak(); stopCamera(); closeModal();
    current = name;
    (R[name] || R.home)(...args);
  }
  window.addEventListener('hashchange', route);

  // ================================================================= AUTHENTIFICATION
  function authShell(inner) { $('#app').innerHTML = `<div class="auth scroll" style="height:100%;width:100%"><div class="auth-top">${I.pattern()}${I.logo(46)}<p>Ton prof IA qui ne dort pas • CEP • BEPC • BAC • Licence</p></div><div class="auth-card">${inner}</div><p class="center muted" style="font-size:12.5px;margin:0 0 20px">RSuta v${VERSION} • Fonctionne hors-ligne<br>Édité par <a href="${EDITEUR.web}" target="_blank" rel="noopener">${EDITEUR.nom}</a></p></div>`; }
  const pwdField = (id, ph, ac) => `<div class="pwd"><input id="${id}" type="password" placeholder="${ph}" autocomplete="${ac || 'current-password'}" class="input"><button type="button" onclick="A.togglePwd('${id}')" aria-label="Afficher le mot de passe">${I.eye()}</button></div>`;
  R.login = () => {
    authShell(`<h2>Connexion</h2><p class="muted" style="margin:0 0 16px">Content de te revoir ! Connecte-toi pour réviser.</p>
      <form id="f" onsubmit="return A.doLogin(event)"><div class="field"><label for="em">Adresse e-mail</label><input id="em" type="email" placeholder="ex : kevin@rsuta.bj" autocomplete="username" required></div>
      <div class="field"><label for="pw">Mot de passe</label>${pwdField('pw', 'Ton mot de passe')}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><label class="check"><input type="checkbox" id="rm" checked> Se souvenir de moi</label><a class="lnk" href="#/forgot">Mot de passe oublié ?</a></div>
      <button class="btn block" type="submit" id="btn-login">${I.lock(20)} Se connecter</button></form>
      <div class="auth-foot">Pas encore de compte ? <a class="lnk" href="#/register">Créer un compte</a></div>
      <div class="tip mt" style="font-weight:600">${I.info()} <span>Compte démo : <b>kevin@rsuta.bj</b> / <b>kevin123</b></span></div>`);
  };
  R.register = () => {
    authShell(`<h2>Créer un compte</h2><p class="muted" style="margin:0 0 16px">Gratuit, et tes données restent sur ton appareil.</p>
      <form onsubmit="return A.doRegister(event)"><div class="field"><label for="nm">Nom et prénom</label><input id="nm" placeholder="ex : Kévin Houngbédji" required autocomplete="name"></div>
      <div class="field"><label for="em">Adresse e-mail</label><input id="em" type="email" placeholder="ex : kevin@gmail.com" required autocomplete="email"></div>
      <div class="row2"><div class="field"><label for="nv">Niveau</label><select id="nv" onchange="document.getElementById('flw').classList.toggle('hidden', this.value!=='LICENCE')">${NIV.map((n) => `<option ${n === 'BEPC' ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      <div class="field hidden" id="flw"><label for="fl">Filière</label><select id="fl">${D.filieres.map((f) => `<option>${esc(f)}</option>`).join('')}</select></div></div>
      <div class="field"><label for="pw">Mot de passe (6 caractères min.)</label>${pwdField('pw', 'Choisis un mot de passe', 'new-password')}</div>
      <div class="field"><label for="pw2">Confirmer le mot de passe</label>${pwdField('pw2', 'Retape le mot de passe', 'new-password')}</div>
      <div class="field"><label for="qs">Question secrète (pour récupérer ton compte)</label><select id="qs"><option>Ton plat préféré ?</option><option>Le nom de ton école primaire ?</option><option>Le prénom de ton meilleur ami ?</option><option>Ta ville de naissance ?</option></select></div>
      <div class="field"><label for="rp">Réponse secrète</label><input id="rp" placeholder="ex : amiwo" required></div>
      <label class="check mb" style="display:flex"><input type="checkbox" id="ens"> Je suis enseignant(e) : je veux créer des devoirs pour mes élèves</label>
      <button class="btn block" type="submit">Créer mon compte</button></form>
      <div class="auth-foot">Déjà inscrit ? <a class="lnk" href="#/login">Se connecter</a></div>`);
  };
  R.forgot = () => {
    authShell(`<h2>Mot de passe oublié</h2><p class="muted" style="margin:0 0 16px">Pas de panique ! Utilise ton <b>code de récupération</b> (RSUTA-XXXX-XXXX) reçu à l'inscription, ou la réponse à ta question secrète.</p>
      <form onsubmit="return A.doReset(event)"><div class="field"><label for="em">Adresse e-mail du compte</label><input id="em" type="email" required onblur="A.showQuestion()"></div>
      <div class="tip hidden mb" id="qbox"></div>
      <div class="field"><label for="cd">Code de récupération ou réponse secrète</label><input id="cd" required placeholder="RSUTA-XXXX-XXXX ou ta réponse"></div>
      <div class="field"><label for="pw">Nouveau mot de passe</label>${pwdField('pw', '6 caractères minimum', 'new-password')}</div>
      <button class="btn block" type="submit">Réinitialiser le mot de passe</button></form>
      <div class="auth-foot"><a class="lnk" href="#/login">← Retour à la connexion</a></div>`);
  };

  // ================================================================= ACCUEIL
  R.home = () => {
    const u = Auth.current, pr = userProgress(u), n = unread();
    const first = u.nom.split(' ')[0];
    const lastDev = DB.where('devoirs', (d) => d.user_id === u.id).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    const nextLesson = D.lecons.find((l) => l.niveau === u.niveau && !pr.done.has(l.id));
    const defi = Eng.generate(u.niveau === 'CEP' ? 'arith' : u.niveau === 'LICENCE' ? 'interest' : u.niveau === 'BAC' ? 'quadratic' : 'linear', { niveau: u.niveau });
    window._defi = defi;
    shell('home', `<div class="body scroll">
      <section class="hero">${I.pattern()}
        <div class="topbar">${I.logo()}<span class="sp"></span><button onclick="A.go('profil')" aria-label="Mon profil">${avatarHTML(u)}</button><button class="bell" onclick="A.go('notifications')" aria-label="Notifications">${I.bell()}${n ? `<span class="badge">${n}</span>` : ''}</button></div>
        <h1 class="hello">Bonjour, ${esc(first)} 👋</h1><p class="hello-sub">Prêt à réviser aujourd'hui ?</p>
      </section>
      <div class="progress-card" onclick="A.go('profil')" style="cursor:pointer"><div class="row"><h4>Progression du mois</h4><div class="pbar"><i style="width:${Math.max(4, pr.pct)}%"></i></div><b class="pct">${pr.pct}%</b></div><p>${pr.pct}% de ton objectif • ${pr.month}/${pr.goal} leçons complétées</p></div>
      <div class="sheet"><div class="wrap" style="padding-top:0">
        <h2 class="title">Choisir ton parcours</h2>
        <div class="parcours">${NIV.map((k) => `<button class="pcard ${NIVINFO[k].theme}" onclick="A.go('cours/${k}')" id="card-${k}"><span class="ico">${I[NIVINFO[k].icon]()}</span><b>${k}</b><small>${NIVINFO[k].cycle} • ${D.count(k)} chapitres</small></button>`).join('')}</div>
        <button class="btn-scan" onclick="A.go('scan')" id="btn-scan"><span class="y">${I.scan(30)}</span><span>Scan <span class="y">ton</span> devoir</span></button>
        ${window.RSutaApp3 ? RSutaApp3.homeStrip() : ''}
        ${window.RSutaApp2 ? RSutaApp2.homeCard() : ''}
        <h3 class="sub">Raccourcis</h3>
        <div class="list grid">
          <button class="item" onclick="A.go('epreuves')"><span class="ic y">${I.doc()}</span><span class="tx"><b>Épreuves CEP • BEPC • BAC • Licence</b><small>Soumets une épreuve, le prof la traite</small></span><span class="chev">${I.chev()}</span></button>
          <button class="item" onclick="A.go('chat')"><span class="ic">${I.chat(22)}</span><span class="tx"><b>Pose ta question au prof</b><small>Disponible 24h/24, même sans internet</small></span><span class="chev">${I.chev()}</span></button>
          ${nextLesson ? `<button class="item" onclick="A.go('lecon/${nextLesson.id}')"><span class="ic">${I.book(22)}</span><span class="tx"><b>Continuer : ${esc(nextLesson.titre)}</b><small>${esc(nextLesson.matiere)} • ${nextLesson.duree_min} min</small></span><span class="chev">${I.chev()}</span></button>` : ''}
          ${lastDev ? `<button class="item" onclick="A.go('result/${lastDev.id}')"><span class="ic y">${I.homework(22)}</span><span class="tx"><b>Dernier devoir : ${esc(lastDev.titre)}</b><small>${fmtDT(lastDev.created_at)}</small></span><span class="chev">${I.chev()}</span></button>` : ''}
        </div>
        <h3 class="sub">🔥 Défi du jour</h3>
        <div class="card"><p style="margin:0 0 10px;font-weight:700">${esc(defi.enonce)}</p><div class="search" style="margin:0"><input class="input" id="defi" placeholder="Ta réponse…" onkeydown="if(event.key==='Enter')A.checkDefi()"><button class="btn sm" onclick="A.checkDefi()">Vérifier</button><button class="btn sm o" onclick="A.solveText(window._defi.enonce,'defi')">Solution</button></div></div>
      </div></div></div>`);
  };

  // ================================================================= COURS
  R.cours = (niv) => {
    niv = NIV.includes(niv) ? niv : Auth.current.niveau;
    const mats = D.matieres.filter((m) => m.niveau === niv);
    const pr = userProgress();
    shell('cours', phead('Cours', null, `<button class="act" onclick="A.go('scan')" aria-label="Scanner">${I.scan()}</button>`) + `<div class="body scroll"><div class="wrap">
      <div class="tabs">${NIV.map((n) => `<button class="tab ${n === niv ? 'on' : ''}" onclick="A.go('cours/${n}')">${n}</button>`).join('')}</div>
      <p class="muted" style="margin:0 0 12px">${NIVINFO[niv].cycle} • ${D.count(niv)} chapitres • ${mats.length} matières${niv === 'LICENCE' ? ' • toutes filières (tronc commun + spécialités)' : ''}</p>
      <div class="list grid">${mats.map((m, i) => { const ch = D.chapitres.filter((c) => c.matiere_id === m.id); const ls = D.lecons.filter((l) => ch.some((c) => c.id === l.chapitre_id)); const d = ls.filter((l) => pr.done.has(l.id)).length; return `<button class="item" onclick="A.go('matiere/${m.id}')"><span class="ic ${i % 2 ? 'y' : ''}">${esc(m.nom.charAt(0))}</span><span class="tx"><b>${esc(m.nom)}</b><small>${ch.length} chapitre(s) • ${ls.length} leçons • ${d}/${ls.length} terminées</small><div class="pbar" style="height:6px;margin-top:6px"><i style="width:${ls.length ? d / ls.length * 100 : 0}%"></i></div></span><span class="chev">${I.chev()}</span></button>`; }).join('')}</div>
      ${niv === 'LICENCE' ? `<h3 class="sub">Filières de Licence professionnelle</h3><div class="card"><div style="display:flex;flex-wrap:wrap;gap:8px">${D.filieres.map((f) => `<span class="pill">${esc(f)}</span>`).join('')}</div><p class="muted" style="font-size:13.5px;margin:10px 0 0">Toutes les filières partagent le tronc commun ci-dessus. Pour tes épreuves de spécialité, utilise <a href="#/epreuves">Épreuves</a> : le prof traite les sujets de toutes les filières.</p></div>` : ''}
    </div></div>`);
  };
  R.matiere = (id) => {
    const m = D.matieres.find((x) => x.id === id); if (!m) return A.go('cours');
    const chs = D.chapitres.filter((c) => c.matiere_id === id);
    const pg = paginate('ch-' + id, chs);
    shell('cours', phead(esc(m.nom), 'cours/' + m.niveau) + `<div class="body scroll"><div class="wrap">
      <p class="muted" style="margin:0 0 14px">${esc(m.description)} • ${m.niveau}</p>
      <div class="list">${pg.rows.map((c) => { const ls = D.lecons.filter((l) => l.chapitre_id === c.id); const d = ls.filter((l) => isDone(l.id)).length; return `<button class="item" onclick="A.go('chapitre/${c.id}')"><span class="ic">${c.ordre}</span><span class="tx"><b>${esc(c.titre)}</b><small>${ls.length} leçon(s) • Quiz • ${d === ls.length && d ? 'Terminé ✅' : d + '/' + ls.length + ' faites'}</small></span><span class="chev">${I.chev()}</span></button>`; }).join('')}</div>
      ${pager('ch-' + id, pg)}</div></div>`);
  };
  R.chapitre = (id) => {
    const c = D.chapitres.find((x) => x.id === id); if (!c) return A.go('cours');
    const m = D.matieres.find((x) => x.id === c.matiere_id);
    const ls = D.lecons.filter((l) => l.chapitre_id === id); const qz = D.quiz.find((q) => q.chapitre_id === id);
    const pg = paginate('ls-' + id, ls);
    shell('cours', phead('Chapitre ' + c.ordre, 'matiere/' + m.id) + `<div class="body scroll"><div class="wrap">
      <h2 class="title" style="margin-top:0">${esc(c.titre)}</h2><p class="muted" style="margin:-8px 0 16px">${esc(m.nom)} • ${c.niveau}</p>
      <div class="list">${pg.rows.map((l) => `<button class="item" onclick="A.go('lecon/${l.id}')"><span class="ic y">${I.book(22)}</span><span class="tx"><b>${esc(l.titre)}</b><small>${I.clock(13)} ${l.duree_min} min de lecture</small></span>${isDone(l.id) ? `<span class="done-dot">${I.check(14)}</span>` : `<span class="chev">${I.chev()}</span>`}</button>`).join('')}</div>
      ${pager('ls-' + id, pg)}
      ${qz ? `<button class="btn y block mt" onclick="A.go('quiz/${qz.id}')">${I.trophy()} Faire le quiz du chapitre</button>` : ''}
      ${window.RSutaFiches && RSutaFiches.has(id) ? `<button class="btn o block mt" onclick="A.go('fiche/${id}')">${I.doc()} Fiche de révision &amp; cartes mémoire</button>` : ''}
      ${window.RSutaExos && RSutaExos.has(id) ? `<button class="btn o block mt" onclick="A.go('exos/${id}')" id="btn-exos">${I.edit()} Exercices interactifs</button>` : ''}
    </div></div>`);
  };
  R.lecon = (id) => {
    const l = D.lecons.find((x) => x.id === id); if (!l) return A.go('cours');
    const c = D.chapitres.find((x) => x.id === l.chapitre_id); const sib = D.lecons.filter((x) => x.chapitre_id === c.id); const i = sib.indexOf(l);
    const qz = D.quiz.find((q) => q.chapitre_id === c.id); const done = isDone(id);
    shell('cours', phead('Leçon', 'chapitre/' + c.id, `<button class="act" onclick="A.speakLesson('${id}')" aria-label="Écouter la leçon">${I.speaker(24)}</button>`) + `<div class="body scroll"><div class="wrap"><div class="lesson-layout">
      <article class="card lesson"><span class="pill">${esc(l.matiere)} • ${l.niveau}</span><h2 style="margin:10px 0 4px;font-size:24px">${esc(l.titre)}</h2><p class="muted" style="margin:0">${esc(c.titre)} • ${l.duree_min} min</p>${md(l.contenu)}</article>
      <div class="list">
        <button class="btn block ${done ? 'o' : ''}" onclick="A.markDone('${id}')">${I.check()} ${done ? 'Leçon terminée' : 'Marquer comme terminée'}</button>
        <button class="btn y block" onclick="A.speakLesson('${id}')">${I.speaker(22)} Écouter la leçon</button>
        ${qz ? `<button class="btn o block" onclick="A.go('quiz/${qz.id}')">${I.trophy()} Quiz du chapitre</button>` : ''}
        ${window.RSutaExos && RSutaExos.has(c.id) ? `<button class="btn o block" onclick="A.go('exos/${c.id}')">${I.edit()} Exercices interactifs</button>` : ''}
        <button class="btn o block" onclick="A.askAbout('${id}')">${I.chat(20)} Poser une question au prof</button>
        <div style="display:flex;gap:10px">${i > 0 ? `<button class="btn o sm" style="flex:1" onclick="A.go('lecon/${sib[i - 1].id}')">‹ Précédente</button>` : ''}${i < sib.length - 1 ? `<button class="btn sm" style="flex:1" onclick="A.go('lecon/${sib[i + 1].id}')">Suivante ›</button>` : ''}</div>
      </div></div></div></div>`);
  };

  // ================================================================= QUIZ
  R.quiz = (id) => { if (id) return quizPlay(id); quizList(); };
  function quizList() {
    const niv = window._qniv || Auth.current.niveau;
    const q = (window._qsearch || '').toLowerCase();
    const list = D.quiz.filter((z) => z.niveau === niv && (!q || (z.titre + z.matiere).toLowerCase().includes(q)));
    const pg = paginate('quiz-' + niv, list);
    const res = DB.where('quiz_resultats', (r) => r.user_id === Auth.current.id);
    shell('quiz', phead('Quiz') + `<div class="body scroll"><div class="wrap">
      <div class="tabs">${NIV.map((n) => `<button class="tab ${n === niv ? 'on' : ''}" onclick="window._qniv='${n}';A.go('quiz')">${n}</button>`).join('')}</div>
      <div class="card mb" style="display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,#2457dc,#1a43b7);color:#fff"><span style="color:var(--yellow)">${I.sparkle(34)}</span><div style="flex:1"><b style="font-size:17px">Quiz express</b><br><small style="opacity:.9">5 exercices générés à l'infini, corrigés par le prof</small></div><button class="btn y sm" onclick="A.go('quiz/express')">Lancer</button></div>
      <div class="search"><input class="input" placeholder="Rechercher un quiz…" value="${esc(window._qsearch || '')}" oninput="window._qsearch=this.value;clearTimeout(window._qt);window._qt=setTimeout(()=>{A.page('quiz-${niv}',1)},350)"></div>
      <div class="list grid">${pg.rows.map((z) => { const best = res.filter((r) => r.quiz_id === z.id).reduce((m, r) => Math.max(m, r.score), -1); return `<button class="item" onclick="A.go('quiz/${z.id}')"><span class="ic ${best >= 50 ? '' : 'y'}">${I.trophy(20)}</span><span class="tx"><b>${esc(z.titre.replace('Quiz — ', ''))}</b><small>${esc(z.matiere)} • ${D.questions.filter((x) => x.quiz_id === z.id).length} questions${best >= 0 ? ' • meilleur score ' + best + '%' : ''}</small></span><span class="chev">${I.chev()}</span></button>`; }).join('') || '<div class="empty">Aucun quiz trouvé.</div>'}</div>
      ${pager('quiz-' + niv, pg)}</div></div>`);
  }
  let QS = null;
  function quizPlay(id) {
    if (!QS || QS.id !== id) {
      let qs, titre;
      if (id === 'express') {
        const niv = Auth.current.niveau; const kinds = { CEP: ['arith', 'percent', 'area', 'fraction', 'arith'], BEPC: ['linear', 'pythagore', 'pgcd', 'percent', 'fraction'], BAC: ['quadratic', 'system', 'linear', 'stats', 'pgcd'], LICENCE: ['interest', 'tva', 'amort', 'stats', 'percent'] }[niv];
        qs = kinds.map((k, i) => { const g = Eng.generate(k, { niveau: niv }); return { id: 'x' + i, enonce: g.enonce, type: 'ouverte', gen: g, explication: '' }; });
        titre = 'Quiz express ' + niv;
      } else { const z = D.quiz.find((x) => x.id === id); if (!z) return A.go('quiz'); qs = D.questions.filter((x) => x.quiz_id === id).sort((a, b) => a.ordre - b.ordre); titre = z.titre; }
      QS = { id, titre, qs, i: 0, score: 0, answered: false, answers: [] };
    }
    const q = QS.qs[QS.i];
    if (!q) return quizEnd();
    const L = 'ABCD';
    let body;
    if (q.type === 'qcm') body = q.options.map((o, k) => `<button class="opt" data-v="${esc(o)}" onclick="A.answer(this.dataset.v, this)"><span class="l">${L[k]}</span>${esc(o)}</button>`).join('');
    else if (q.type === 'vf') body = ['Vrai', 'Faux'].map((o, k) => `<button class="opt" data-v="${o}" onclick="A.answer('${o}', this)"><span class="l">${L[k]}</span>${o}</button>`).join('');
    else body = `<div class="field"><input id="qa" class="input" placeholder="Écris ta réponse" onkeydown="if(event.key==='Enter')A.answer(this.value)"></div><button class="btn block" onclick="A.answer(document.getElementById('qa').value)">Valider</button>`;
    shell('quiz', phead(esc(QS.titre.replace('Quiz — ', '')), 'quiz') + `<div class="body scroll"><div class="wrap" style="max-width:760px">
      <div style="display:flex;justify-content:space-between;font-weight:800"><span>Question ${QS.i + 1} / ${QS.qs.length}</span><span class="pill y">${QS.score} pt(s)</span></div>
      <div class="qprog"><i style="width:${QS.i / QS.qs.length * 100}%"></i></div>
      <div class="qtext">${esc(q.enonce)}</div><div id="qbody">${body}</div><div id="qfb"></div></div></div>`);
  }
  const normA = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\s'’.]/g, '').replace(',', '.');
  function quizAnswer(v, el) {
    if (QS.answered) return; const q = QS.qs[QS.i]; let ok;
    if (q.gen) ok = !!Eng.checkAnswer(q.gen, String(v));
    else if (q.type === 'ouverte') { const a = normA(v), b = normA(q.reponse_correcte); ok = a === b || (a.length > 2 && (a.includes(b) || b.includes(a))) || (parseFloat(a) === parseFloat(b) && !isNaN(parseFloat(a))); }
    else ok = v === q.reponse_correcte;
    QS.answered = true; if (ok) QS.score++;
    try { const z = D.quiz.find((x) => x.id === QS.id); DB.insert('tentatives', { user_id: Auth.current.id, source: 'quiz', quiz_id: QS.id, question_id: q.id, chapitre_id: z ? z.chapitre_id : null, matiere: z ? z.matiere : '', niveau: z ? z.niveau : Auth.current.niveau, kind: q.gen ? q.gen.k || null : null, ok: !!ok }); } catch (e) { /* */ }
    QS.answers.push({ q: q.enonce, v, ok, good: q.reponse_correcte || (q.gen && (q.gen.answers || [q.gen.poly]).join(' ; ')) });
    document.querySelectorAll('.opt').forEach((b) => { if (b.dataset.v === q.reponse_correcte) b.classList.add('good'); else if (b === el && !ok) b.classList.add('bad'); b.disabled = true; });
    let expl = q.explication || '';
    if (q.gen) { const r = Eng.solve(q.gen.enonce, { niveau: Auth.current.niveau }); expl = r ? r.etapes[1].texte + '\n→ ' + r.conclusion : ''; }
    $('#qfb').innerHTML = `<div class="explain" style="white-space:pre-wrap"><b>${ok ? '✅ Bravo, c\'est juste !' : '❌ Pas tout à fait. Réponse : ' + esc(QS.answers[QS.answers.length - 1].good)}</b>${expl ? '<br>' + esc(expl) : ''}</div><button class="btn block" onclick="A.nextQ()">${QS.i + 1 < QS.qs.length ? 'Question suivante ›' : 'Voir mon score'}</button>`;
    if (S.sounds && navigator.vibrate) navigator.vibrate(ok ? 30 : [60, 40, 60]);
  }
  function quizEnd() {
    const pct = Math.round(QS.score / QS.qs.length * 100);
    DB.insert('quiz_resultats', { user_id: Auth.current.id, quiz_id: QS.id, score: pct, total: QS.qs.length });
    const z = D.quiz.find((x) => x.id === QS.id);
    if (z && pct >= 50) { const lid = z.lecon_id; DB.insert('progression', { user_id: Auth.current.id, lecon_id: 'quiz:' + z.id, statut: 'quiz', pourcentage: pct, date_scan: new Date().toISOString() }); if (pct === 100) DB.notify(Auth.current.id, 'Score parfait 🏆', 'Tu as eu 100 % au ' + z.titre + ' !', 'succes'); }
    const msg = pct >= 80 ? 'Excellent ! ' + Prof.pick(Prof.ENC[Auth.current.niveau]) : pct >= 50 ? 'Bien joué ! Revois les erreurs et ce sera parfait.' : 'Courage mon enfant, relis la leçon et réessaie. Tu vas y arriver !';
    shell('quiz', phead('Résultat du quiz', 'quiz') + `<div class="body scroll"><div class="wrap" style="max-width:760px">
      <div class="card center"><div style="color:var(--yellow)">${I.trophy(48)}</div><div class="score">${pct}%</div><p style="font-weight:800;margin:0">${QS.score} / ${QS.qs.length} bonnes réponses</p><p class="muted">${esc(msg)}</p></div>
      <h3 class="sub">Correction</h3><div class="list">${QS.answers.map((a, i) => `<div class="item"><span class="ic ${a.ok ? '' : 'y'}">${a.ok ? '✅' : '❌'}</span><span class="tx"><b>${i + 1}. ${esc(a.q)}</b><small>Ta réponse : ${esc(a.v || '—')} • Bonne réponse : ${esc(a.good)}</small></span></div>`).join('')}</div>
      <div class="row2 mt"><button class="btn o" onclick="A.retryQuiz()">Recommencer</button><button class="btn" onclick="A.go('quiz')">Autres quiz</button></div>
      <button class="btn y block mt" onclick="RSutaApp3.share('quiz')" id="btn-share-quiz">${I.share()} Partager mon score</button></div></div>`);
    const id = QS.id; QS = null; window._lastQuiz = id;
  }

  // ================================================================= SCAN
  let stream = null;
  function stopCamera() { if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; } }
  R.scan = () => {
    shell('scan', `<header class="mhead"><button class="back" onclick="A.back('home')" aria-label="Retour">${I.back()}</button><div class="ttl"><span>RSuta</span></div><button class="act" onclick="A.go('epreuves')" aria-label="Épreuves">${I.book(32)}</button></header>
      <div class="mbanner">Scan ton devoir en photo</div>
      <div class="body scroll"><div class="scan-wrap">
        <div class="scan-area" id="sa"><div class="paper" id="paper">Exercice :<br>Résoudre<br>2x + 5 = 13</div><video id="vid" playsinline muted class="hidden"></video><img id="shot" class="hidden" alt="Photo du devoir"><div class="corners"><i></i><i></i><i></i><i></i></div><div class="scanline"></div></div>
        <div><div class="scan-actions">
          <button class="btn-scanner" onclick="A.capture()" id="btn-scanner"><span class="l">${I.camera()}</span><span class="r">Scanner</span></button>
          <div class="tip">${I.robot(20)} Assure-toi que l'écriture est bien visible ${I.info(16)}</div>
          <div class="scan-alt"><button class="btn o sm" onclick="document.getElementById('file').click()" id="btn-import">${I.image(18)} Importer une photo</button><button class="btn o sm" onclick="A.verify('')" id="btn-type">${I.keyboard(18)} Saisir le texte</button></div>
          <input type="file" id="file" accept="image/*" capture="environment" class="hidden" onchange="A.fromFile(this)">
          <div class="card" style="width:100%;font-size:14px"><b>Conseils pour un bon scan</b><ul style="margin:6px 0 0;padding-left:18px;line-height:1.6"><li>Pose la feuille à plat, à la lumière du jour.</li><li>Cadre l'exercice entre les 4 coins jaunes.</li><li>Écris lisiblement (ou utilise un énoncé imprimé).</li><li>Tu pourras corriger le texte lu avant la résolution.</li></ul></div>
        </div></div></div></div>`, 'alt');
    startCamera();
  };
  async function startCamera() {
    if (!S.camera || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      if (current !== 'scan') return stopCamera();
      const v = $('#vid'); v.srcObject = stream; await v.play(); v.classList.remove('hidden'); $('#paper').classList.add('hidden');
    } catch (e) { stream = null; }
  }
  // v1.1 : choix de la zone à lire avant l'OCR (recadrage manuel facultatif)
  async function runOCR(src) {
    if (S.cropAsk === false) return doOCR(src, null);
    window._crop = null;
    modal('Quelle partie lire ? ✂️', `<p class="muted" style="margin-top:0">Glisse ton doigt (ou la souris) sur l'exercice pour l'encadrer. Sinon, touche « Lire tout » : je recadre et je redresse la photo tout seul.</p>
      <div class="cropbox" id="cropbox"><img id="cropimg" src="${src}" alt="Photo du devoir" draggable="false"><div class="csel hidden" id="csel"></div></div>`,
      [{ label: 'Annuler', cls: 'o' }, { label: 'Lire tout', cls: 'o', on: () => { setTimeout(() => doOCR(src, null), 30); } },
        { label: 'Lire la zone', on: () => { if (!window._crop) { toast('Encadre d\'abord la zone avec ton doigt'); return false; } const c = window._crop; setTimeout(() => doOCR(src, c), 30); } }], { nofocus: true, sticky: true });
    setTimeout(cropBind, 30);
  }
  function cropBind() {
    const box = $('#cropbox'), sel = $('#csel'); if (!box) return; let st = null;
    const pos = (e) => { const r = box.getBoundingClientRect(); return { x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) }; };
    const draw = (a, b) => { const c = { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) }; Object.assign(sel.style, { left: c.x * 100 + '%', top: c.y * 100 + '%', width: c.w * 100 + '%', height: c.h * 100 + '%' }); sel.classList.remove('hidden'); return c; };
    box.addEventListener('pointerdown', (e) => { e.preventDefault(); st = pos(e); try { box.setPointerCapture(e.pointerId); } catch (er) { /* */ } });
    box.addEventListener('pointermove', (e) => { if (st) draw(st, pos(e)); });
    const end = (e) => { if (!st) return; const c = draw(st, pos(e)); st = null; if (c.w > 0.04 && c.h > 0.03) { window._crop = c; box.classList.add('has'); } else { window._crop = null; sel.classList.add('hidden'); box.classList.remove('has'); } };
    box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
  }
  async function doOCR(src, crop) {
    const img = await OCR.loadImage(src);
    const shot = $('#shot'); if (shot) { shot.src = src; shot.classList.remove('hidden'); $('#paper') && $('#paper').classList.add('hidden'); $('#vid') && $('#vid').classList.add('hidden'); }
    stopCamera();
    $('#sa') && $('#sa').classList.add('busy');
    loader('Le prof lit ton devoir… 📖');
    try {
      const r = await OCR.recognize(img, (p) => loader('Le prof lit ton devoir… ' + Math.round(p * 100) + '%'), { crop });
      loader(); $('#sa') && $('#sa').classList.remove('busy');
      const thumb = makeThumb(img);
      if (r.blurry) return modal('Photo floue 📷', `<div style="display:flex;gap:10px;align-items:center">${I.robot(54)}<p style="font-weight:700;font-size:17px">« ${esc(Prof.BLUR)} »</p></div>${r.text ? `<p class="muted">Texte partiellement lu : ${esc(r.text.slice(0, 120))}</p>` : ''}`, [{ label: 'Saisir le texte', cls: 'o', on: () => setTimeout(() => A.verify(r.text, thumb), 50) }, { label: 'Reprendre la photo', on: () => R.scan() }]);
      A.verify(r.text, thumb);
    } catch (e) {
      loader(); $('#sa') && $('#sa').classList.remove('busy');
      modal('Lecture impossible', `<p>Le module de lecture n'a pas pu démarrer sur cet appareil (${esc(e.message || e)}). Tu peux saisir l'énoncé au clavier : le prof le résoudra de la même façon.</p>`, [{ label: 'Saisir le texte', on: () => setTimeout(() => A.verify(''), 50) }]);
    }
  }
  function makeThumb(img) { try { const c = document.createElement('canvas'); const k = 360 / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height); c.width = (img.naturalWidth || img.width) * k; c.height = (img.naturalHeight || img.height) * k; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', 0.7); } catch (e) { return ''; } }

  // ================================================================= RÉSULTAT / DEVOIR
  // rendu math (fractions, radicaux, exposants) + figures — mathview.js
  function mx(t) { return window.RSutaView ? window.RSutaView.math(esc(t)) : esc(t); }
  function figHTML(f) {
    const V = window.RSutaView; if (!V || (!f.graph && !f.table)) return '';
    const g = f.graph ? V.plot(f.graph) : ''; const t = f.table ? V.table(f.table) : '';
    return g || t ? `<div class="bub w fig">${t}${g}</div>` : '';
  }
  function stepsHTML(f, opts) {
    opts = opts || {};
    const online = navigator.onLine;
    const chips = opts.chips === false ? '' : `<div class="chips">${f.gen ? `<button class="chip" onclick="A.similar('${opts.did}')">Oui, un exercice similaire</button>` : `<button class="chip" onclick="A.similar('${opts.did}')">Un autre sujet</button>`}<button class="chip" onclick="A.reexplain('${opts.did}', ${opts.pi || 0})">Réexplique autrement</button>${f.lessonId ? `<button class="chip" onclick="A.go('lecon/${f.lessonId}')">Voir la leçon</button>` : ''}</div>`;
    return `<div class="msg"><div class="av">${I.robot(48)}</div><div class="stack">
      <div class="bub y"><div class="who">Prof IA</div><div class="st">● ${online ? 'en ligne' : 'hors-ligne, toujours là 💪'}${f.source === 'online' ? ' • mode avancé' : ''}</div>${esc(f.intro || 'Pas de souci !')}${f.titre && opts.showTitle !== false && !/ensemble/.test(f.intro || '') ? ' On va traiter « ' + esc(f.titre) + ' » ensemble 😊' : ''}</div>
      <div class="bub b"><h5>Étape 1 : ${esc(f.etape1_titre)}</h5>${mx(f.etape1_texte)}</div>
      <div class="bub y"><h5>Étape 2 : ${esc(f.etape2_titre)}</h5>${mx(f.etape2_texte)}</div>
      ${figHTML(f)}
      <div class="bub b"><h5>Étape 3 : ${esc(f.etape3_titre)}</h5>${mx(f.etape3_texte)}</div>
      <div class="bub y"><b>Conclusion : ${mx(f.conclusion)}</b>\n${esc(f.astuce || '')}\n<b>${esc(f.encouragement || '')}</b>\n${esc(f.question_suivante)}</div>
      ${chips}</div></div>`;
  }
  function textMsg(t) { return `<div class="msg"><div class="av">${I.robot(48)}</div><div class="stack"><div class="bub y">${esc(t)}</div></div></div>`; }
  function meMsg(t) { return `<div class="msg me"><div class="bub">${esc(t)}</div></div>`; }
  function threadHTML(dv) {
    let h = '';
    (dv.parts || []).forEach((p, i) => { if (dv.parts.length > 1) h += `<div class="part-label">${esc(p.label || 'Exercice ' + (i + 1))}</div><div class="bub w" style="margin:0 0 0 56px;font-size:14px"><b>Énoncé :</b> ${esc(p.enonce || '')}</div>`; h += stepsHTML(p, { did: dv.id, pi: i, showTitle: dv.parts.length === 1 }); });
    (dv.messages || []).forEach((m, i) => { h += m.role === 'me' ? meMsg(m.text) : m.kind === 'steps' ? stepsHTML(m.data, { did: dv.id, pi: 'm' + i }) : textMsg(m.text); });
    return h;
  }
  R.result = (id) => {
    const dv = DB.find('devoirs', (d) => d.id === id && d.user_id === Auth.current.id); if (!dv) return A.go('devoirs');
    const p0 = dv.parts && dv.parts[0];
    const badge2 = dv.parts.length > 1 ? dv.parts.length + ' exercices' : esc((p0 && p0.titre || dv.titre).slice(0, 38));
    shell('devoirs', `<header class="mhead"><button class="back" onclick="A.back('devoirs')" aria-label="Retour">${I.back()}</button><div class="ttl dark"><span>Résultat</span></div><button class="act" onclick="RSutaApp3.share('devoir','${id}')" aria-label="Partager" id="btn-share">${I.share()}</button><button class="act" onclick="A.listen()" aria-label="Lecture vocale">${I.film()}</button></header>
      <div class="badges"><span class="bdg b">${dv.source === 'epreuve' ? 'Épreuve traitée' : 'Exercice résolu'} ✅</span><span class="bdg y">${badge2}</span>${p0 ? `<span class="bdg ${p0.niveau_difficulte === 'difficile' ? 'r' : p0.niveau_difficulte === 'facile' ? 'g' : 'y'}">${esc(dv.niveau)} • ${esc(p0.niveau_difficulte)}</span>` : ''}</div>
      <div class="body scroll" id="thread"><div class="chat" id="chat">${dv.image ? `<div class="msg me"><img src="${dv.image}" style="max-width:200px;border-radius:12px;box-shadow:var(--shadow-s)" alt="Photo du devoir"></div>` : ''}${threadHTML(dv)}</div></div>
      <button class="listen" onclick="A.listen()" id="btn-listen">${I.speaker()}<span class="grow">Écouter l'explication vocale</span>${I.play()}</button>
      ${window.RSutaView ? RSutaView.keypad('ask') : ''}<div class="composer"><button class="ib" onclick="document.getElementById('att').click()" aria-label="Joindre une photo">${I.clip()}</button><button class="ib mkbtn" onclick="RSutaView.toggle('ask', this)" aria-label="Clavier mathématique" title="Clavier mathématique">√x</button><input id="ask" placeholder="Pose une question..." onkeydown="if(event.key==='Enter')A.send('${id}')"><button class="ib" id="micb" onclick="A.mic()" aria-label="Dicter">${I.mic()}</button><button class="ib send" onclick="A.send('${id}')" aria-label="Envoyer">${I.send()}</button><input type="file" id="att" accept="image/*" class="hidden" onchange="A.attach(this,'${id}')"></div>
      <div style="height:var(--nav-h)"></div>`, 'alt');
    if (window._scrollEnd) { const t = $('#thread'); t.scrollTop = t.scrollHeight; window._scrollEnd = false; }
    if (S.autoSpeak && window._justSolved) { window._justSolved = false; setTimeout(() => A.listen(), 400); }
  };
  async function createDevoir(text, opts) {
    opts = opts || {};
    const niveau = opts.niveau || Auth.current.niveau;
    loader('Le prof réfléchit… 🧠');
    let parts;
    try {
      const ex = Eng.splitExercises(text);
      parts = ex.length > 1 ? await Prof.solveEpreuve(text, { niveau, matiere: opts.matiere, image: opts.image }) : [await Prof.solve(text, { niveau, matiere: opts.matiere, image: opts.image })].filter(Boolean);
      parts.forEach((p, i) => { if (!p.enonce) p.enonce = ex[i] ? ex[i].text : text; });
    } finally { loader(); }
    if (!parts.length) { toast('Je n\'ai pas trouvé d\'exercice dans ce texte.'); return null; }
    const dv = DB.insert('devoirs', { user_id: Auth.current.id, niveau, titre: opts.titre || (parts.length > 1 ? 'Épreuve (' + parts.length + ' exercices)' : parts[0].titre), enonce: text, source: opts.source || 'texte', parts, messages: [], image: opts.thumb || '', matiere: opts.matiere || '' });
    if (opts.lessonId) DB.insert('progression', { user_id: Auth.current.id, lecon_id: opts.lessonId, statut: 'scan', pourcentage: 0, date_scan: new Date().toISOString() });
    window._justSolved = true;
    return dv;
  }
  const KINDS = { CEP: ['arith', 'percent', 'area', 'fraction', 'conjugaison'], BEPC: ['linear', 'pythagore', 'pgcd', 'develop', 'factor', 'fraction', 'ohm', 'circuit', 'masse_molaire', 'vecteur', 'energie'], BAC: ['quadratic', 'system', 'derivative', 'stats', 'factor', 'suite', 'complexe', 'limite', 'integrale', 'proba', 'combi', 'trig', 'system3', 'equilibrage', 'genetique', 'energie', 'vecteur'], LICENCE: ['interest', 'tva', 'amort', 'stats', 'percent', 'annuite', 'van', 'seuil', 'regression', 'compta'] };
  function genFor(niv, k) { const list = KINDS[niv] || KINDS.BEPC; return Eng.generate(k || list[Math.floor(Math.random() * list.length)], { niveau: niv }); }
  // logique de conversation (devoir ou chat)
  async function converse(holder, table, text) {
    holder.messages = holder.messages || [];
    holder.messages.push({ role: 'me', text });
    const t = text.toLowerCase(); const niv = Auth.current.niveau;
    const lastSteps = [...(holder.parts || []), ...holder.messages.filter((m) => m.kind === 'steps').map((m) => m.data)].pop();
    let reply = null;
    if (holder.pending && /solution|corrig|montre|donne|aide/.test(t)) {
      const f = await Prof.solve(holder.pending.enonce, { niveau: niv }); holder.pending = null; reply = { role: 'prof', kind: 'steps', data: f };
    } else if (holder.pending && holder.pending.text && !/^(oui|non|ok)\b|similaire|autre exercice|un autre/.test(t)) {
      const f = await Prof.solve(holder.pending.enonce, { niveau: niv }); holder.pending = null;
      holder.messages.push({ role: 'prof', kind: 'text', text: '📝 Merci pour ta réponse ! Voici le corrigé détaillé : compare ligne par ligne avec ce que tu as écrit.' });
      reply = { role: 'prof', kind: 'steps', data: f };
    } else if (holder.pending && Eng.checkAnswer(holder.pending, text) !== null && !/^(oui|non)\b/.test(t)) {
      const ok = Eng.checkAnswer(holder.pending, text);
      if (ok) { reply = { role: 'prof', kind: 'text', text: '✅ Bravo ! C\'est exactement ça ! ' + Prof.pick(Prof.ENC[niv]) + '\nOn continue ? Tape « oui » pour un autre exercice.' }; holder.pending = null; }
      else reply = { role: 'prof', kind: 'text', text: '❌ Pas encore, mais tu chauffes ! Relis bien chaque étape et réessaie.\nTape « solution » si tu veux que je te montre la correction.' };
    } else if (/^(oui|ok|d.accord|vas-?y|go)\b|similaire|entra[iî]n|autre exercice|un autre/.test(t)) {
      const g = genFor(niv, lastSteps && lastSteps.gen && lastSteps.gen.k); holder.pending = g;
      reply = { role: 'prof', kind: 'text', text: '💪 À toi de jouer !\n' + g.enonce + '\n\nÉcris ta réponse ici, je corrige. (Tape « solution » pour voir la correction.)' };
    } else if (/r[ée]expli|autrement|pas compris|comprends pas|explique encore/.test(t) && lastSteps) {
      reply = { role: 'prof', kind: 'steps', data: Prof.reexplain(lastSteps, niv) };
    } else if (/^(merci|thanks|cool|super)/.test(t)) {
      reply = { role: 'prof', kind: 'text', text: 'Avec plaisir mon enfant ! Je suis là jour et nuit. ' + Prof.pick(Prof.ENC[niv]) };
    } else if (/^(bonjour|bonsoir|salut|hello|coucou)/.test(t) && t.length < 25) {
      reply = { role: 'prof', kind: 'text', text: 'Bonjour ' + Auth.current.nom.split(' ')[0] + ' ! 😊 Envoie-moi un exercice (équation, calcul, problème, conjugaison, définition, sujet de dissertation…) ou scanne ton devoir.' };
    } else {
      const f = await Prof.solve(text, { niveau: niv });
      reply = f ? { role: 'prof', kind: 'steps', data: f } : { role: 'prof', kind: 'text', text: 'Je n\'ai pas bien compris. Écris l\'exercice complet, par exemple : « Résoudre 3x - 7 = 11 ».' };
    }
    holder.messages.push(reply);
    DB.save(table);
    return reply;
  }

  // ================================================================= DEVOIRS
  R.devoirs = () => {
    const q = (window._dsearch || '').toLowerCase(); const f = window._dniv || '';
    const all = DB.where('devoirs', (d) => d.user_id === Auth.current.id && (!f || d.niveau === f) && (!q || (d.titre + ' ' + d.enonce).toLowerCase().includes(q))).sort((a, b) => b.created_at.localeCompare(a.created_at));
    const pg = paginate('devoirs', all);
    shell('devoirs', phead('Mes devoirs', null, `<button class="act" onclick="A.go('scan')" aria-label="Nouveau scan">${I.plus(24)}</button>`) + `<div class="body scroll"><div class="wrap">
      <div class="tabs">${['', ...NIV].map((n) => `<button class="tab ${n === f ? 'on' : ''}" onclick="window._dniv='${n}';A.page('devoirs',1)">${n || 'Tous'}</button>`).join('')}</div>
      <div class="search"><input class="input" placeholder="Rechercher dans mes devoirs…" value="${esc(window._dsearch || '')}" oninput="window._dsearch=this.value;clearTimeout(window._dt);window._dt=setTimeout(()=>A.page('devoirs',1),350)"></div>
      <div class="list">${pg.rows.map((d) => `<div class="item"><span class="ic ${d.source === 'epreuve' ? 'y' : ''}">${d.source === 'scan' ? I.camera(20) : d.source === 'epreuve' ? I.doc(20) : I.keyboard(20)}</span><button class="tx" style="text-align:left" onclick="A.go('result/${d.id}')"><b>${esc(d.titre)}</b><small>${fmtDT(d.created_at)} • ${d.niveau} • ${d.parts.length} exercice(s) • <span class="pill ${d.parts[0] && d.parts[0].niveau_difficulte === 'difficile' ? 'r' : d.parts[0] && d.parts[0].niveau_difficulte === 'facile' ? 'g' : 'y'}">${esc(d.parts[0] ? d.parts[0].niveau_difficulte : '')}</span></small></button><button class="ib" style="color:var(--muted);padding:8px" onclick="A.delDevoir('${d.id}')" aria-label="Supprimer">${I.trash()}</button></div>`).join('') || `<div class="empty">${I.homework(48)}<p>Aucun devoir pour l'instant.<br>Scanne ou tape ton premier exercice !</p><button class="btn" onclick="A.go('scan')">${I.scan(20)} Scanner un devoir</button></div>`}</div>
      ${pager('devoirs', pg)}</div></div>`, 'alt');
  };

  // ================================================================= CHAT
  function chatHolder() {
    let c = DB.find('conversations', (x) => x.user_id === Auth.current.id);
    if (!c) c = DB.insert('conversations', { user_id: Auth.current.id, messages: [{ role: 'prof', kind: 'text', text: 'Bonjour ' + Auth.current.nom.split(' ')[0] + ' ! 👋 Je suis RSuta, ton prof qui ne dort pas.\nEnvoie-moi n\'importe quel exercice du programme béninois (' + Auth.current.niveau + ') : je t\'explique tout en 3 étapes.\nExemples : « Résoudre 2x + 5 = 13 », « Calculer 3/4 + 5/6 », « Conjugue finir au futur », « Définir la photosynthèse ».' }], parts: [] });
    return c;
  }
  R.chat = () => {
    const c = chatHolder();
    shell('chat', `<header class="mhead"><button class="back" onclick="A.back('home')" aria-label="Retour">${I.back()}</button><div class="ttl dark"><span style="font-size:36px">Chat</span></div><button class="act" onclick="A.clearChat()" aria-label="Effacer la conversation">${I.trash(28)}</button></header>
      <div class="badges"><span class="bdg b">Prof IA ${navigator.onLine ? '• en ligne' : '• hors-ligne'}</span><span class="bdg y">${esc(Auth.current.niveau)}</span></div>
      <div class="body scroll" id="thread"><div class="chat" id="chat">${threadHTML(Object.assign({ id: 'chat' }, c))}</div></div>
      <button class="listen" onclick="A.listen()">${I.speaker()}<span class="grow">Écouter la dernière réponse</span>${I.play()}</button>
      ${window.RSutaView ? RSutaView.keypad('ask') : ''}<div class="composer"><button class="ib" onclick="document.getElementById('att').click()" aria-label="Joindre une photo">${I.clip()}</button><button class="ib mkbtn" onclick="RSutaView.toggle('ask', this)" aria-label="Clavier mathématique" title="Clavier mathématique">√x</button><input id="ask" placeholder="Pose une question..." onkeydown="if(event.key==='Enter')A.send('chat')"><button class="ib" id="micb" onclick="A.mic()" aria-label="Dicter">${I.mic()}</button><button class="ib send" onclick="A.send('chat')" aria-label="Envoyer">${I.send()}</button><input type="file" id="att" accept="image/*" class="hidden" onchange="A.attach(this,'chat')"></div>
      <div style="height:var(--nav-h)"></div>`, 'alt');
    const t = $('#thread'); t.scrollTop = t.scrollHeight;
  };

  // ================================================================= ÉPREUVES
  function allEpreuves() { return [...DB.where('epreuves_user', (e) => e.user_id === Auth.current.id || e.partage).map((e) => Object.assign({ source: 'user' }, e)), ...window.RSutaEpreuves]; }
  R.epreuves = () => {
    const f = window._eniv === undefined ? Auth.current.niveau : window._eniv; const q = (window._esearch || '').toLowerCase(); const fil = window._efil || '';
    const list = allEpreuves().filter((e) => (!f || e.niveau === f) && (!fil || e.filiere === fil) && (!q || (e.titre + e.matiere + e.texte).toLowerCase().includes(q)));
    const pg = paginate('epreuves', list);
    shell('epreuves', phead('Épreuves', 'home', `<button class="act" onclick="A.go('epreuve-new')" aria-label="Soumettre une épreuve">${I.plus(24)}</button>`) + `<div class="body scroll"><div class="wrap">
      <button class="btn y block mb" onclick="A.go('epreuve-new')" id="btn-submit-ep">${I.upload()} Soumettre une épreuve au prof</button>
      <div class="tabs">${['', ...NIV].map((n) => `<button class="tab ${n === f ? 'on' : ''}" onclick="window._eniv='${n}';A.page('epreuves',1)">${n || 'Toutes'}</button>`).join('')}</div>
      <div class="search"><input class="input" placeholder="Rechercher (matière, thème…)" value="${esc(window._esearch || '')}" oninput="window._esearch=this.value;clearTimeout(window._et);window._et=setTimeout(()=>A.page('epreuves',1),350)">${f === 'LICENCE' ? `<select class="input" style="max-width:45%" onchange="window._efil=this.value;A.page('epreuves',1)"><option value="">Toutes filières</option>${D.filieres.map((x) => `<option ${x === fil ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select>` : ''}</div>
      <div class="list grid">${pg.rows.map((e) => `<button class="item" onclick="A.go('epreuve/${e.id}')"><span class="ic ${e.source === 'user' ? '' : 'y'}">${I.doc(20)}</span><span class="tx"><b>${esc(e.titre)}</b><small>${e.niveau} • ${esc(e.matiere)}${e.filiere ? ' • ' + esc(e.filiere) : ''} • ${e.source === 'user' ? 'Mon épreuve' : esc(e.annee)}${e.duree ? ' • ' + e.duree : ''}</small></span><span class="chev">${I.chev()}</span></button>`).join('') || '<div class="empty">Aucune épreuve. Soumets la tienne !</div>'}</div>
      ${pager('epreuves', pg)}</div></div>`);
  };
  R.epreuve = (id) => {
    const e = allEpreuves().find((x) => x.id === id); if (!e) return A.go('epreuves');
    const n = Eng.splitExercises(e.texte).length;
    shell('epreuves', phead('Épreuve', 'epreuves', e.source === 'user' ? `<button class="act" onclick="A.delEpreuve('${e.id}')" aria-label="Supprimer">${I.trash()}</button>` : '') + `<div class="body scroll"><div class="wrap" style="max-width:860px">
      <div class="card"><span class="pill">${e.niveau}</span> <span class="pill y">${esc(e.matiere)}</span>${e.filiere ? ` <span class="pill g">${esc(e.filiere)}</span>` : ''}<h2 style="margin:10px 0 4px">${esc(e.titre)}</h2><p class="muted" style="margin:0 0 12px">${e.duree ? 'Durée : ' + e.duree + ' • ' : ''}${n} exercice(s) détecté(s)</p>${e.source === 'user' ? '' : '<p class="pill y" style="display:inline-block;margin:0 0 12px">Sujet type (non officiel) — rédigé par RSuta selon le programme, ce n\'est pas une annale officielle</p>'}
      <div style="white-space:pre-wrap;line-height:1.6;background:var(--bg);border-radius:12px;padding:14px;font-family:Georgia,serif">${esc(e.texte)}</div></div>
      <button class="btn block mt" onclick="A.treatEpreuve('${e.id}')" id="btn-treat">${I.sparkle()} Traiter l'épreuve avec le prof</button>
      <p class="muted center" style="font-size:13px">Conseil : essaie d'abord seul, puis compare avec la correction du prof.</p></div></div>`);
  };
  R['epreuve-new'] = () => {
    const u = Auth.current;
    shell('epreuves', phead('Soumettre une épreuve', 'epreuves') + `<div class="body scroll"><div class="wrap" style="max-width:820px"><div class="card">
      <p class="muted" style="margin-top:0">Colle, tape ou scanne le texte de l'épreuve. Le prof détecte automatiquement les exercices (« Exercice 1 », « 1) », « a) »…) et les corrige un par un.</p>
      <div class="row2"><div class="field"><label>Niveau</label><select id="en" onchange="document.getElementById('efw').classList.toggle('hidden',this.value!=='LICENCE')">${NIV.map((n) => `<option ${n === u.niveau ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      <div class="field"><label>Matière</label><input id="em2" list="mats" placeholder="ex : Mathématiques"><datalist id="mats">${[...new Set(D.matieres.map((m) => m.nom))].map((m) => `<option>${esc(m)}</option>`).join('')}</datalist></div></div>
      <div class="field ${u.niveau === 'LICENCE' ? '' : 'hidden'}" id="efw"><label>Filière (Licence professionnelle)</label><select id="ef"><option value="">— Tronc commun —</option>${D.filieres.map((f) => `<option ${f === u.filiere ? 'selected' : ''}>${esc(f)}</option>`).join('')}</select></div>
      <div class="field"><label>Titre</label><input id="et" placeholder="ex : BEPC blanc 2026 — Mathématiques"></div>
      <div class="field"><label>Texte de l'épreuve</label><textarea id="ex" placeholder="Exercice 1 : Résoudre 2x + 5 = 13&#10;Exercice 2 : Calculer 3/4 + 5/6&#10;Exercice 3 : Définir la photosynthèse"></textarea></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn o sm" onclick="document.getElementById('epf').click()">${I.camera(18)} Lire depuis une photo</button><label class="check"><input type="checkbox" id="esh"> Partager avec les autres comptes de l'appareil</label></div>
      <input type="file" id="epf" accept="image/*" class="hidden" onchange="A.epFromPhoto(this)">
      <div class="row2 mt"><button class="btn o" onclick="A.saveEpreuve(false)">Enregistrer</button><button class="btn" onclick="A.saveEpreuve(true)">${I.sparkle(18)} Enregistrer et traiter</button></div>
    </div></div></div>`);
  };

  // ================================================================= PROFIL
  R.profil = () => {
    const u = Auth.current, pr = userProgress(u);
    const ab = DB.find('abonnements', (a) => a.user_id === u.id) || { plan: 'Gratuit', statut: 'actif' };
    const nq = DB.where('quiz_resultats', (r) => r.user_id === u.id).length, nd = DB.where('devoirs', (d) => d.user_id === u.id).length;
    shell('profil', `<header class="phead" style="flex-direction:column;padding-bottom:26px">${I.pattern()}<div style="display:flex;width:100%;justify-content:space-between"><span></span><button class="act" onclick="A.go('parametres')" aria-label="Paramètres">${I.settings()}</button></div>
      <div class="prof-head"><button onclick="document.getElementById('av').click()" aria-label="Changer la photo" style="position:relative">${avatarHTML(u)}<span style="position:absolute;right:-2px;bottom:2px;background:var(--yellow);color:var(--navy);border-radius:50%;padding:5px">${I.camera(14)}</span></button><h2>${esc(u.nom)}</h2><span class="net ${navigator.onLine ? '' : 'off'}"><i></i>${esc(u.email)} • ${u.role === 'admin' ? 'Administrateur' : u.role === 'enseignant' ? 'Enseignant' : 'Élève'}</span></div>
      <input type="file" id="av" accept="image/*" class="hidden" onchange="A.setAvatar(this)"></header>
      <div class="body scroll"><div class="wrap">
      <div class="stats"><div class="stat"><b>${pr.done.size}</b><small>Leçons</small></div><div class="stat"><b>${nq}</b><small>Quiz</small></div><div class="stat"><b>${nd}</b><small>Devoirs</small></div><div class="stat"><b>${window.RSutaApp3 ? RSutaApp3.stats().streak : (u.streak || 1)}🔥</b><small>Série</small></div></div>
      ${window.RSutaApp3 ? RSutaApp3.profilCard() : ''}
      <div class="card mt"><div style="display:flex;justify-content:space-between;align-items:center"><b>Objectif du mois</b><span class="pill">${pr.month}/${pr.goal} leçons</span></div><div class="pbar mt" style="height:12px"><i style="width:${pr.pct}%"></i></div><p class="muted" style="margin:8px 0 0;font-size:13.5px">Niveau : <b>${esc(u.niveau)}</b>${u.filiere ? ' • ' + esc(u.filiere) : ''} • Inscrit le ${fmtDate(u.date_inscription)}</p></div>
      <div class="sub-card mt">${I.star(30)}<div style="flex:1"><b>Abonnement ${esc(ab.plan)}</b><br><small>Statut : ${esc(ab.statut)}${ab.date_fin ? ' • jusqu\'au ' + fmtDate(ab.date_fin) : ''}</small></div>${ab.plan === 'Gratuit' ? `<button class="btn sm" onclick="A.premium()">Activer</button>` : ''}</div>
      <h3 class="sub">Mon compte</h3>
      <div class="list">
        <button class="item" onclick="A.editProfile()"><span class="ic">${I.edit()}</span><span class="tx"><b>Modifier le profil</b><small>Nom, niveau, filière, objectif</small></span><span class="chev">${I.chev()}</span></button>
        <button class="item" onclick="A.go('progres')"><span class="ic y">${I.star(22)}</span><span class="tx"><b>Mes progrès &amp; badges</b><small>Niveaux, XP, séries, partage</small></span><span class="chev">${I.chev()}</span></button>
        <button class="item" onclick="A.go('rapport')" id="btn-rapport"><span class="ic">${I.doc()}</span><span class="tx"><b>Rapport pour les parents</b><small>Bilan imprimable des 30 derniers jours</small></span><span class="chev">${I.chev()}</span></button>
        <button class="item" onclick="A.go('classe')"><span class="ic y">${I.group(22)}</span><span class="tx"><b>${u.role === 'enseignant' ? 'Ma classe' : 'Devoirs de classe'}</b><small>${u.role === 'enseignant' ? 'Créer et suivre les devoirs de vos élèves' : 'Recevoir un devoir de ton enseignant'}</small></span><span class="chev">${I.chev()}</span></button>
        <button class="item" onclick="A.go('devoirs')"><span class="ic y">${I.homework(22)}</span><span class="tx"><b>Mes devoirs</b><small>${nd} devoir(s) résolu(s)</small></span><span class="chev">${I.chev()}</span></button>
        <button class="item" onclick="A.go('epreuves')"><span class="ic">${I.doc()}</span><span class="tx"><b>Épreuves</b><small>Banque de sujets et mes épreuves</small></span><span class="chev">${I.chev()}</span></button>
        <button class="item" onclick="A.go('notifications')"><span class="ic y">${I.bell(22)}</span><span class="tx"><b>Notifications</b><small>${unread()} non lue(s)</small></span><span class="chev">${I.chev()}</span></button>
        <button class="item" onclick="A.go('parametres')"><span class="ic">${I.settings()}</span><span class="tx"><b>Paramètres</b><small>Thème, prof IA, voix, sécurité, sauvegarde</small></span><span class="chev">${I.chev()}</span></button>
        ${u.role === 'admin' ? `<button class="item" onclick="A.go('admin')"><span class="ic y">${I.shield()}</span><span class="tx"><b>Administration</b><small>Utilisateurs et épreuves</small></span><span class="chev">${I.chev()}</span></button>` : ''}
        <button class="item" onclick="A.contact()" id="btn-contact"><span class="ic y">${I.info(22)}</span><span class="tx"><b>Aide et contact</b><small>${EDITEUR.nom} • ${EDITEUR.tel}</small></span><span class="chev">${I.chev()}</span></button>
        <button class="item" onclick="A.logout()" id="btn-logout"><span class="ic" style="background:#fee2e2;color:#b91c1c">${I.logout()}</span><span class="tx"><b>Se déconnecter</b><small>Tes données restent sur l'appareil</small></span></button>
      </div></div></div>`);
  };

  // ================================================================= NOTIFICATIONS
  R.notifications = () => {
    const all = DB.where('notifications', (n) => n.user_id === Auth.current.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
    const pg = paginate('notifs', all);
    const ic = { info: I.info(20), rappel: I.clock(20), succes: I.trophy(20), securite: I.lock(20) };
    shell('notifications', phead('Notifications', 'home', `<button class="act" onclick="A.readAll()" aria-label="Tout marquer comme lu">${I.check(22)}</button>`) + `<div class="body scroll"><div class="wrap" style="max-width:820px">
      <div class="list">${pg.rows.map((n) => `<div class="item notif ${n.lu ? '' : 'unread'}" onclick="A.readNotif('${n.id}')"><span class="ic ${n.type === 'rappel' ? 'y' : ''}">${ic[n.type] || ic.info}</span><span class="tx"><b>${esc(n.titre)}</b><small style="white-space:normal">${esc(n.texte)}</small><small>${fmtDT(n.created_at)}</small></span><button style="color:var(--muted);padding:8px" onclick="event.stopPropagation();A.delNotif('${n.id}')" aria-label="Supprimer">${I.trash(18)}</button></div>`).join('') || `<div class="empty">${I.bell(46)}<p>Aucune notification.</p></div>`}</div>
      ${pager('notifs', pg)}</div></div>`);
  };

  // ================================================================= PARAMÈTRES
  const sw = (key, on) => `<label class="switch"><input type="checkbox" ${S[key] ? 'checked' : ''} onchange="A.set('${key}', this.checked)"><span></span></label>`;
  R.parametres = () => {
    const voices = 'speechSynthesis' in window ? speechSynthesis.getVoices().filter((v) => /^fr/i.test(v.lang)) : [];
    shell('profil', phead('Paramètres', 'profil') + `<div class="body scroll"><div class="wrap" style="max-width:820px">
      <div class="set-group"><h4>Apparence</h4>
        <div class="set-row"><span class="ic">${I.moon()}</span><div class="tx"><b>Thème</b><small>Clair, sombre ou automatique</small></div><select onchange="A.set('theme',this.value)">${[['light', 'Clair'], ['dark', 'Sombre'], ['auto', 'Automatique']].map(([v, l]) => `<option value="${v}" ${S.theme === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="set-row"><div class="tx"><b>Taille du texte</b><small>${S.fontSize}px</small></div><input type="range" min="14" max="20" step="1" value="${S.fontSize}" onchange="A.set('fontSize', +this.value, true)"></div>
        <div class="set-row"><div class="tx"><b>Éléments par page</b><small>Pagination des listes</small></div><select onchange="A.set('pageSize', +this.value)">${[5, 10, 20, 50].map((n) => `<option ${+S.pageSize === n ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      </div>
      <div class="set-group"><h4>Prof IA</h4>
        <div class="set-row"><div class="tx"><b>Mode du prof</b><small>Auto : hors-ligne d'abord, en ligne si besoin</small></div><select onchange="A.set('profMode',this.value)">${[['auto', 'Automatique'], ['offline', 'Hors-ligne uniquement'], ['online', 'En ligne prioritaire']].map(([v, l]) => `<option value="${v}" ${S.profMode === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="set-row"><div class="tx"><b>URL de l'API (compatible OpenAI)</b><small>Optionnel — pour les sujets rédactionnels complexes</small></div><input type="url" value="${esc(S.apiUrl)}" onchange="A.set('apiUrl',this.value.trim())"></div>
        <div class="set-row"><div class="tx"><b>Clé API</b><small>Stockée uniquement sur cet appareil</small></div><input type="password" value="${esc(S.apiKey)}" placeholder="sk-…" onchange="A.set('apiKey',this.value.trim())"></div>
        <div class="set-row"><div class="tx"><b>Modèle</b></div><input type="text" value="${esc(S.apiModel)}" onchange="A.set('apiModel',this.value.trim())"></div>
        <div class="set-row"><div class="tx"><b>Envoyer la photo (vision)</b><small>Meilleure lecture de l'écriture manuscrite en ligne</small></div>${sw('vision')}</div>
        <div class="set-row"><div class="tx"><b>Tester la connexion</b><small>${navigator.onLine ? 'Internet détecté' : 'Aucune connexion'}</small></div><button class="btn sm o" onclick="A.testApi()">Tester</button></div>
      </div>
      <div class="set-group"><h4>Voix et caméra</h4>
        <div class="set-row"><span class="ic">${I.speaker(20)}</span><div class="tx"><b>Lecture automatique</b><small>Lire l'explication dès qu'elle est prête</small></div>${sw('autoSpeak')}</div>
        <div class="set-row"><div class="tx"><b>Vitesse de la voix</b><small>${S.voiceRate}×</small></div><input type="range" min="0.6" max="1.4" step="0.05" value="${S.voiceRate}" onchange="A.set('voiceRate', +this.value, true)"></div>
        <div class="set-row"><div class="tx"><b>Voix</b><small>${voices.length} voix française(s) disponible(s)</small></div><select onchange="A.set('voiceName',this.value)"><option value="">Par défaut</option>${voices.map((v) => `<option ${S.voiceName === v.name ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}</select></div>
        <div class="set-row"><div class="tx"><b>Tester la voix</b></div><button class="btn sm o" onclick="A.testVoice()">${I.play(16)} Écouter</button></div>
        <div class="set-row"><div class="tx"><b>Caméra en direct sur l'écran Scan</b><small>Sinon, l'appareil photo du téléphone s'ouvre</small></div>${sw('camera')}</div>
        <div class="set-row"><div class="tx"><b>Choisir la zone avant de lire</b><small>Après une photo, encadrer l'exercice à lire (sinon recadrage automatique)</small></div>${sw('cropAsk')}</div>
        <div class="set-row"><div class="tx"><b>Vibrations</b></div>${sw('sounds')}</div>
      </div>
      <div class="set-group"><h4>Objectifs et rappels</h4>
        <div class="set-row"><div class="tx"><b>Objectif mensuel</b><small>Nombre de leçons à terminer</small></div><select onchange="A.setGoal(+this.value)">${[10, 20, 30, 40, 60].map((n) => `<option ${(Auth.current.objectif || 30) === n ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
        <div class="set-row"><div class="tx"><b>Rappel quotidien</b><small>Notification de révision</small></div>${sw('reminders')}</div>
        <div class="set-row"><div class="tx"><b>Heure du rappel</b></div><input type="time" value="${S.reminderTime}" onchange="A.set('reminderTime',this.value)"></div>
      </div>
      <div class="set-group"><h4>Sécurité</h4>
        <div class="set-row"><span class="ic">${I.lock()}</span><div class="tx"><b>Changer le mot de passe</b></div><button class="btn sm o" onclick="A.changePwd()">Modifier</button></div>
        <div class="set-row"><div class="tx"><b>Nouveau code de récupération</b><small>Sert en cas de mot de passe oublié</small></div><button class="btn sm o" onclick="A.newCode()">Générer</button></div>
      </div>
      <div class="set-group"><h4>Données</h4>
        <div class="set-row"><span class="ic">${I.download()}</span><div class="tx"><b>Exporter une sauvegarde</b><small>Fichier .json (comptes, progression, devoirs)</small></div><button class="btn sm o" onclick="A.exportData()">Exporter</button></div>
        <div class="set-row"><span class="ic">${I.upload()}</span><div class="tx"><b>Importer une sauvegarde</b></div><button class="btn sm o" onclick="document.getElementById('imp').click()">Importer</button><input type="file" id="imp" accept=".json,application/json" class="hidden" onchange="A.importData(this)"></div>
        <div class="set-row"><div class="tx"><b>Préparer le mode hors-ligne</b><small>Télécharge le lecteur de photos (OCR) dans le cache</small></div><button class="btn sm o" onclick="A.warmup()">Préparer</button></div>
        <div class="set-row"><div class="tx"><b>Effacer mes devoirs</b></div><button class="btn sm r" onclick="A.clearDevoirs()">Effacer</button></div>
        <div class="set-row"><div class="tx"><b>Réinitialiser l'application</b><small>Supprime toutes les données de l'appareil</small></div><button class="btn sm r" onclick="A.resetAll()">Réinitialiser</button></div>
      </div>
      <div class="set-group"><h4>À propos</h4>
        <div class="set-row"><div class="tx"><b>RSuta — Ton prof IA qui ne dort pas</b><small>Version ${VERSION} • ${D.chapitres.length} chapitres • ${D.lecons.length} leçons • ${D.questions.length} questions • ${window.RSutaEpreuves.length} sujets types (non officiels)${window.RSutaFiches ? ' • ' + RSutaFiches.ids().length + ' fiches' : ''}</small></div><button class="btn sm o" onclick="A.changelog()" id="btn-changelog">Nouveautés</button></div>
        <div class="set-row"><div class="tx"><b>Programme</b><small>CEP, BEPC, BAC (A, B, C, D) et Licence professionnelle toutes filières — Bénin</small></div></div>
        <div class="set-row"><div class="tx"><b>Éditeur</b><small>${EDITEUR.nom}</small></div><button class="btn sm o" onclick="A.contact()">Contact</button></div>
        <div class="set-row"><div class="tx"><b>Téléphone</b><small><a href="${EDITEUR.telHref}">${EDITEUR.tel}</a></small></div></div>
        <div class="set-row"><div class="tx"><b>E-mail</b><small><a href="mailto:${EDITEUR.email}?subject=RSuta%20-%20Assistance">${EDITEUR.email}</a></small></div></div>
        <div class="set-row"><div class="tx"><b>Site web</b><small><a href="${EDITEUR.web}" target="_blank" rel="noopener">${EDITEUR.webLabel}</a></small></div></div>
        <div class="set-row"><div class="tx"><small>© ${new Date().getFullYear()} ${EDITEUR.nom}. Tous droits réservés.</small></div></div>
      </div></div></div>`);
  };

  // ================================================================= ADMINISTRATION
  R.admin = () => {
    if (Auth.current.role !== 'admin') return A.go('home');
    const q = (window._usearch || '').toLowerCase();
    const users = DB.all('users').filter((u) => !q || (u.nom + u.email).toLowerCase().includes(q)).sort((a, b) => a.nom.localeCompare(b.nom));
    const pg = paginate('users', users);
    const eps = DB.all('epreuves_user'); const pge = paginate('adm-ep', eps);
    shell('admin', phead('Administration', 'profil') + `<div class="body scroll"><div class="wrap">
      <div class="stats"><div class="stat"><b>${DB.all('users').length}</b><small>Comptes</small></div><div class="stat"><b>${DB.all('devoirs').length}</b><small>Devoirs</small></div><div class="stat"><b>${DB.all('quiz_resultats').length}</b><small>Quiz joués</small></div><div class="stat"><b>${eps.length}</b><small>Épreuves</small></div></div>
      <h3 class="sub">Utilisateurs</h3>
      <div class="search"><input class="input" placeholder="Rechercher un utilisateur…" value="${esc(window._usearch || '')}" oninput="window._usearch=this.value;clearTimeout(window._ut);window._ut=setTimeout(()=>A.page('users',1),350)"><button class="btn sm" onclick="A.adminAdd()">${I.plus(18)} Ajouter</button></div>
      <div class="card scroll" style="overflow-x:auto"><table class="tbl"><thead><tr><th>Nom</th><th>E-mail</th><th>Niveau</th><th>Rôle</th><th>Statut</th><th>Actions</th></tr></thead><tbody>
      ${pg.rows.map((u) => `<tr><td><b>${esc(u.nom)}</b></td><td>${esc(u.email)}</td><td>${esc(u.niveau)}</td><td><span class="pill ${u.role === 'admin' ? 'y' : ''}">${u.role}</span></td><td><span class="pill ${u.bloque ? 'r' : 'g'}">${u.bloque ? 'suspendu' : 'actif'}</span></td><td style="white-space:nowrap">
        <button class="btn sm o" onclick="A.adminReset('${u.id}')" title="Mot de passe temporaire">${I.lock(16)}</button>
        ${u.id !== Auth.current.id ? `<button class="btn sm o" onclick="A.adminRole('${u.id}')" title="Changer le rôle">${I.shield(16)}</button><button class="btn sm o" onclick="A.adminBlock('${u.id}')" title="Suspendre / réactiver">${u.bloque ? I.play(16) : I.pause(16)}</button><button class="btn sm r" onclick="A.adminDel('${u.id}')" title="Supprimer">${I.trash(16)}</button>` : ''}</td></tr>`).join('')}
      </tbody></table></div>${pager('users', pg)}
      <h3 class="sub">Épreuves soumises par les élèves</h3>
      <div class="list">${pge.rows.map((e) => `<div class="item"><span class="ic y">${I.doc(20)}</span><span class="tx"><b>${esc(e.titre)}</b><small>${e.niveau} • ${esc(e.matiere)} • ${esc((DB.find('users', (u) => u.id === e.user_id) || {}).nom || '?')} • ${fmtDate(e.created_at)}</small></span><button class="btn sm o" onclick="A.toggleShare('${e.id}')">${e.partage ? 'Partagée' : 'Privée'}</button><button class="btn sm r" onclick="A.delEpreuve('${e.id}', true)">${I.trash(16)}</button></div>`).join('') || '<div class="empty">Aucune épreuve soumise.</div>'}</div>${pager('adm-ep', pge)}
    </div></div>`);
  };

  // ================================================================= ACTIONS (A.*)
  const A = window.A = {
    go: (r) => { if (location.hash === '#/' + r) route(); else location.hash = '#/' + r; },
    back: (fallback) => { if (history.length > 2 && !window._noBack) history.back(); else A.go(fallback || 'home'); },
    top: () => { const b = $('.screen .body'); if (b) b.scrollTop = 0; },
    page: (key, n) => { PG[key] = n; route(); const b = $('.screen .body'); if (b) b.scrollTop = 0; },
    togglePwd: (id) => { const i = document.getElementById(id); i.type = i.type === 'password' ? 'text' : 'password'; },
    doLogin: (e) => { e.preventDefault(); try { Auth.login($('#em').value, $('#pw').value, $('#rm').checked); toast('Bienvenue ' + Auth.current.nom.split(' ')[0] + ' 👋'); checkReminder(); A.go('home'); } catch (err) { toast(err.message); } return false; },
    doRegister: (e) => {
      e.preventDefault();
      if ($('#pw').value !== $('#pw2').value) { toast('Les deux mots de passe ne correspondent pas.'); return false; }
      try {
        const { user, code } = Auth.register({ nom: $('#nm').value, email: $('#em').value, password: $('#pw').value, niveau: $('#nv').value, filiere: $('#nv').value === 'LICENCE' ? $('#fl').value : '', question: $('#qs').value, reponse: $('#rp').value, role: $('#ens') && $('#ens').checked ? 'enseignant' : 'eleve' });
        modal('Compte créé 🎉', `<p>Voici ton <b>code de récupération</b>. Note-le dans ton cahier : il te permettra de récupérer ton compte si tu oublies ton mot de passe.</p><div class="code-box">${code}</div><button class="btn o sm" onclick="navigator.clipboard&&navigator.clipboard.writeText('${code}');this.textContent='Copié ✔'">Copier le code</button>`, [{ label: 'J\'ai noté mon code', on: () => { Auth.login(user.email, $('#pw').value, true); A.go('home'); } }], { sticky: true, nofocus: true });
      } catch (err) { toast(err.message); }
      return false;
    },
    showQuestion: () => { const q = Auth.getQuestion($('#em').value); const b = $('#qbox'); if (q) { b.innerHTML = I.info() + ' Question secrète : <b>' + esc(q) + '</b>'; b.classList.remove('hidden'); } else b.classList.add('hidden'); },
    doReset: (e) => { e.preventDefault(); try { Auth.resetPassword($('#em').value, $('#cd').value, $('#pw').value); toast('Mot de passe réinitialisé ✔ Connecte-toi.'); A.go('login'); } catch (err) { toast(err.message); } return false; },
    logout: () => confirmBox('Veux-tu vraiment te déconnecter ?', () => { Auth.logout(); A.go('login'); }, 'Se déconnecter'),
    checkDefi: () => { const v = $('#defi').value; const ok = Eng.checkAnswer(window._defi, v); if (ok && window.RSutaApp3) RSutaApp3.defiOk(); toast(ok === null ? 'Écris une réponse (ex : x = 4)' : ok ? '✅ Bravo champion ! ' + Prof.pick(Prof.ENC[Auth.current.niveau]) : '❌ Pas encore… réessaie ou clique sur Solution.', 3500); },
    solveText: async (text, src) => { const dv = await createDevoir(text, { source: src || 'texte' }); if (dv) A.go('result/' + dv.id); },
    // cours
    markDone: (lid) => { const ex = isDone(lid); if (ex) { DB.remove('progression', ex.id); toast('Leçon marquée comme non terminée'); } else { DB.insert('progression', { user_id: Auth.current.id, lecon_id: lid, statut: 'termine', pourcentage: 100, date_scan: new Date().toISOString() }); const pr = userProgress(); toast('Bravo ! ' + pr.month + '/' + pr.goal + ' leçons ce mois 🎉'); if (pr.month === pr.goal) DB.notify(Auth.current.id, 'Objectif atteint 🏆', 'Tu as terminé ' + pr.goal + ' leçons ce mois-ci. Champion !', 'succes'); } route(); },
    speakLesson: (lid) => { const l = D.lecons.find((x) => x.id === lid); if (!Prof.speak(l.titre + '. ' + l.contenu.replace(/##\s?|\*\*|•/g, ''))) toast('Synthèse vocale non disponible sur cet appareil.'); else toast('Lecture en cours… 🔊'); },
    askAbout: (lid) => { const l = D.lecons.find((x) => x.id === lid); window._prefill = 'Explique-moi : ' + l.titre; A.go('chat'); },
    // quiz
    answer: (v, el) => quizAnswer(v, el),
    nextQ: () => { QS.i++; QS.answered = false; quizPlay(QS.id); },
    retryQuiz: () => A.go('quiz/' + (window._lastQuiz || '')),
    // scan
    capture: async () => {
      const v = $('#vid');
      if (stream && v && v.videoWidth) { const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(v, 0, 0); if (navigator.vibrate) navigator.vibrate(40); runOCR(c.toDataURL('image/jpeg', 0.92)); }
      else $('#file').click();
    },
    fromFile: (inp) => { const f = inp.files && inp.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => runOCR(r.result); r.readAsDataURL(f); inp.value = ''; },
    verify: (text, thumb) => {
      window._thumb = thumb || '';
      modal(text ? 'Vérifie le texte lu' : 'Saisis ton exercice', `<p class="muted" style="margin-top:0">${text ? 'Corrige si besoin les erreurs de lecture, puis lance la résolution.' : 'Tape l\'énoncé tel qu\'il est écrit dans ton cahier.'}</p>
        <div class="field"><label>Énoncé</label><textarea id="vt" placeholder="Exercice : Résoudre 2x + 5 = 13">${esc(text || '')}</textarea>${window.RSutaView ? RSutaView.keypad('vt', true) : ''}</div>
        <div class="field"><label>Niveau</label><select id="vn">${NIV.map((n) => `<option ${n === Auth.current.niveau ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
        <p class="muted" style="font-size:12.5px">Astuce : écris x² ou x^2, 3/4 pour une fraction, √ ou sqrt pour la racine.</p>`,
        [{ label: 'Annuler', cls: 'o' }, { label: 'Résoudre ✨', on: () => { const t = $('#vt').value.trim(); if (!t) { toast('Écris un exercice d\'abord'); return false; } const n = $('#vn').value; setTimeout(async () => { const dv = await createDevoir(t, { niveau: n, source: window._thumb ? 'scan' : 'texte', thumb: window._thumb, image: window._thumb }); if (dv) { window._scrollEnd = false; A.go('result/' + dv.id); } }, 30); } }]);
    },
    // résultat & chat
    listen: () => {
      if ('speechSynthesis' in window && speechSynthesis.speaking) { Prof.stopSpeak(); toast('Lecture arrêtée'); return; }
      let parts = [];
      if (current === 'chat') { const c = chatHolder(); const m = c.messages.filter((x) => x.role === 'prof').pop(); if (m) parts = [m.kind === 'steps' ? m.data : { conclusion: m.text }]; }
      else { const id = location.hash.split('/')[2]; const dv = DB.find('devoirs', (d) => d.id === id); if (dv) { const extra = (dv.messages || []).filter((m) => m.kind === 'steps').map((m) => m.data); parts = extra.length ? [extra.pop()] : dv.parts; } }
      const txt = parts.map((f) => f.etape1_texte ? [f.label || '', 'Étape 1. ' + f.etape1_titre + '. ' + f.etape1_texte, 'Étape 2. ' + f.etape2_titre + '. ' + f.etape2_texte, 'Étape 3. ' + f.etape3_titre + '. ' + f.etape3_texte, 'Conclusion. ' + f.conclusion, f.encouragement || ''].join('\n') : f.conclusion).join('\n');
      if (!Prof.speak(txt)) toast('Synthèse vocale non disponible sur cet appareil.'); else toast('🔊 Le prof t\'explique… (touche encore pour arrêter)');
    },
    send: async (id) => {
      const inp = $('#ask'); const text = inp.value.trim(); if (!text) return; inp.value = '';
      const holder = id === 'chat' ? chatHolder() : DB.find('devoirs', (d) => d.id === id);
      const chat = $('#chat'); chat.insertAdjacentHTML('beforeend', meMsg(text) + `<div class="msg" id="typing"><div class="av">${I.robot(48)}</div><div class="bub y"><span class="typing"><i></i><i></i><i></i></span></div></div>`);
      const t = $('#thread'); t.scrollTop = t.scrollHeight;
      await new Promise((r) => setTimeout(r, 350));
      await converse(holder, id === 'chat' ? 'conversations' : 'devoirs', text);
      window._scrollEnd = true; if (id === 'chat') { R.chat(); } else R.result(id);
      const th = $('#thread'); th.scrollTop = th.scrollHeight;
      if (S.autoSpeak) A.listen();
    },
    similar: async (id) => { const inp = $('#ask'); if (inp) { inp.value = 'Oui, un exercice similaire'; A.send(id === 'chat' || !id ? (current === 'chat' ? 'chat' : id) : id); } },
    reexplain: (id) => { const inp = $('#ask'); if (inp) { inp.value = 'Réexplique autrement'; A.send(current === 'chat' ? 'chat' : id); } },
    clearChat: () => confirmBox('Effacer toute la conversation avec le prof ?', () => { const c = chatHolder(); DB.remove('conversations', c.id); R.chat(); }, 'Effacer'),
    attach: (inp, id) => {
      const f = inp.files && inp.files[0]; if (!f) return; inp.value = '';
      const r = new FileReader(); r.onload = async () => {
        loader('Le prof lit ta photo… 📖');
        try { const img = await OCR.loadImage(r.result); const o = await OCR.recognize(img, (p) => loader('Le prof lit ta photo… ' + Math.round(p * 100) + '%')); loader(); if (o.blurry) { toast(Prof.BLUR, 4000); return; } $('#ask').value = o.text.replace(/\n+/g, ' '); toast('Texte lu ✔ Vérifie-le puis envoie.'); } catch (e) { loader(); toast('Lecture impossible sur cet appareil.'); }
      }; r.readAsDataURL(f);
    },
    mic: () => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { toast('La dictée vocale n\'est pas disponible sur cet appareil.'); return; }
      const rec = new SR(); rec.lang = 'fr-FR'; rec.interimResults = false; const b = $('#micb'); b.classList.add('rec');
      rec.onresult = (e) => { $('#ask').value = e.results[0][0].transcript; }; rec.onend = () => b.classList.remove('rec'); rec.onerror = () => { b.classList.remove('rec'); toast('Je n\'ai pas entendu. Réessaie.'); };
      rec.start();
    },
    delDevoir: (id) => confirmBox('Supprimer ce devoir ?', () => { DB.remove('devoirs', id); route(); }, 'Supprimer'),
    // épreuves
    treatEpreuve: async (id) => { const e = allEpreuves().find((x) => x.id === id); const dv = await createDevoir(e.texte, { niveau: e.niveau, matiere: e.matiere, source: 'epreuve', titre: e.titre }); if (dv) A.go('result/' + dv.id); },
    saveEpreuve: async (treat) => {
      const texte = $('#ex').value.trim(); if (texte.length < 5) { toast('Colle ou tape le texte de l\'épreuve.'); return; }
      const e = DB.insert('epreuves_user', { user_id: Auth.current.id, niveau: $('#en').value, matiere: $('#em2').value || 'Général', filiere: $('#en').value === 'LICENCE' ? $('#ef').value : '', titre: $('#et').value || 'Mon épreuve du ' + fmtDate(new Date()), texte, partage: $('#esh').checked, annee: 'Soumise', id: 'ue-' + DB.uuid().slice(0, 8) });
      toast('Épreuve enregistrée ✔');
      if (treat) A.treatEpreuve(e.id); else A.go('epreuve/' + e.id);
    },
    epFromPhoto: (inp) => { const f = inp.files && inp.files[0]; if (!f) return; inp.value = ''; const r = new FileReader(); r.onload = async () => { loader('Lecture de l\'épreuve…'); try { const img = await OCR.loadImage(r.result); const o = await OCR.recognize(img, (p) => loader('Lecture de l\'épreuve… ' + Math.round(p * 100) + '%')); loader(); if (o.blurry) return toast(Prof.BLUR, 4000); $('#ex').value = ($('#ex').value ? $('#ex').value + '\n' : '') + o.text; } catch (e) { loader(); toast('Lecture impossible.'); } }; r.readAsDataURL(f); },
    delEpreuve: (id, adm) => confirmBox('Supprimer cette épreuve ?', () => { DB.remove('epreuves_user', id); adm ? route() : A.go('epreuves'); }, 'Supprimer'),
    changelog: () => modal('Historique des versions', CHANGELOG.map((v) => `<div class="cl"><b>Version ${v.v}</b> <small class="muted">${v.d}</small><ul>${v.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join(''), [{ label: 'Fermer' }]),
    toggleShare: (id) => { const e = DB.find('epreuves_user', (x) => x.id === id); DB.update('epreuves_user', id, { partage: !e.partage }); route(); },
    // profil
    setAvatar: (inp) => { const f = inp.files && inp.files[0]; if (!f) return; const r = new FileReader(); r.onload = async () => { const img = await OCR.loadImage(r.result); const c = document.createElement('canvas'); c.width = c.height = 200; const s = Math.min(img.width, img.height); c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 200, 200); Auth.current.avatar = c.toDataURL('image/jpeg', 0.8); DB.save('users'); route(); toast('Photo mise à jour ✔'); }; r.readAsDataURL(f); },
    editProfile: () => { const u = Auth.current; modal('Modifier le profil', `<div class="field"><label>Nom</label><input id="pn" value="${esc(u.nom)}"></div><div class="field"><label>Niveau</label><select id="pv" onchange="document.getElementById('pfw').classList.toggle('hidden',this.value!=='LICENCE')">${NIV.map((n) => `<option ${n === u.niveau ? 'selected' : ''}>${n}</option>`).join('')}</select></div><div class="field ${u.niveau === 'LICENCE' ? '' : 'hidden'}" id="pfw"><label>Filière</label><select id="pf"><option value="">—</option>${D.filieres.map((f) => `<option ${f === u.filiere ? 'selected' : ''}>${esc(f)}</option>`).join('')}</select></div>`, [{ label: 'Annuler', cls: 'o' }, { label: 'Enregistrer', on: () => { const n = $('#pn').value.trim(); if (n.length < 2) { toast('Nom trop court'); return false; } u.nom = n; u.niveau = $('#pv').value; u.niveau_id = 'niv-' + u.niveau; u.filiere = u.niveau === 'LICENCE' ? $('#pf').value : ''; DB.save('users'); toast('Profil mis à jour ✔'); setTimeout(route, 10); } }]); },
    premium: () => modal('Activer Premium ⭐', `<p>Premium débloque le mode en ligne avancé fourni par l'établissement et la synchronisation. Saisis le code d'activation remis par ton école, ton revendeur ou par ${EDITEUR.sigle} (<a href="${EDITEUR.telHref}">${EDITEUR.tel}</a> • <a href="mailto:${EDITEUR.email}?subject=RSuta%20-%20Code%20Premium">${EDITEUR.email}</a>).</p><div class="field"><label>Code d'activation</label><input id="pc" placeholder="PREM-XXXX-XXXX"></div>`, [{ label: 'Annuler', cls: 'o' }, { label: 'Activer', on: () => { const c = $('#pc').value.trim().toUpperCase(); const ok = /^PREM-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c) && c.replace(/[^A-Z0-9]/g, '').split('').reduce((s, ch) => s + ch.charCodeAt(0), 0) % 7 === 0; if (!ok) { toast('Code invalide.'); return false; } const ab = DB.find('abonnements', (a) => a.user_id === Auth.current.id); const fin = new Date(); fin.setFullYear(fin.getFullYear() + 1); DB.update('abonnements', ab.id, { plan: 'Premium', statut: 'actif', date_debut: new Date().toISOString().slice(0, 10), date_fin: fin.toISOString().slice(0, 10), prix: 0 }); toast('Premium activé ⭐'); setTimeout(route, 10); } }]),
    contact: () => modal('Aide et contact', `<div class="center" style="margin-bottom:10px">${I.robot(56)}</div>
      <p class="center" style="margin-top:0">RSuta est édité par <b>${EDITEUR.nom}</b>.<br><span class="muted">Une question, un problème, un code Premium ou un partenariat avec ton école ? Contacte-nous :</span></p>
      <div class="list">
        <a class="item" href="${EDITEUR.telHref}" id="ct-tel" style="text-decoration:none;color:inherit"><span class="ic">📞</span><span class="tx"><b>Téléphone</b><small>${EDITEUR.tel}</small></span><span class="chev">${I.chev()}</span></a>
        <a class="item" href="mailto:${EDITEUR.email}?subject=RSuta%20-%20Assistance&body=Version%20${VERSION}%20-%20Niveau%20${encodeURIComponent(Auth.current ? Auth.current.niveau : '')}" id="ct-mail" style="text-decoration:none;color:inherit"><span class="ic y">✉️</span><span class="tx"><b>E-mail</b><small>${EDITEUR.email}</small></span><span class="chev">${I.chev()}</span></a>
        <a class="item" href="${EDITEUR.web}" target="_blank" rel="noopener" id="ct-web" style="text-decoration:none;color:inherit"><span class="ic">🌐</span><span class="tx"><b>Site web</b><small>${EDITEUR.webLabel}</small></span><span class="chev">${I.chev()}</span></a>
      </div><p class="center muted" style="font-size:12.5px;margin-bottom:0">RSuta v${VERSION} • © ${new Date().getFullYear()} ${EDITEUR.nom}</p>`, [{ label: 'Fermer' }], { nofocus: true }),
    // notifications
    readNotif: (id) => { DB.update('notifications', id, { lu: true }); route(); },
    readAll: () => { DB.where('notifications', (n) => n.user_id === Auth.current.id).forEach((n) => { n.lu = true; }); DB.save('notifications'); route(); toast('Tout est lu ✔'); },
    delNotif: (id) => { DB.remove('notifications', id); route(); },
    // paramètres
    set: (k, v, rerender) => { S[k] = v; saveSettings(); if (rerender || k === 'theme' || k === 'pageSize') route(); else toast('Enregistré ✔', 1200); },
    setGoal: (n) => { Auth.current.objectif = n; DB.save('users'); toast('Objectif : ' + n + ' leçons / mois'); },
    testApi: async () => { if (!S.apiKey) return toast('Renseigne d\'abord ta clé API.'); loader('Test de connexion…'); const r = await Prof.online('Résoudre 2x + 5 = 13', Auth.current.niveau); loader(); toast(r ? 'Connexion réussie ✔ Le mode en ligne est prêt.' : 'Échec : vérifie l\'URL, la clé et ta connexion.', 3500); },
    testVoice: () => { if (!Prof.speak('Bonjour ' + Auth.current.nom.split(' ')[0] + ' ! Je suis RSuta, ton prof qui ne dort pas. ' + Prof.pick(Prof.ENC[Auth.current.niveau]))) toast('Synthèse vocale non disponible.'); },
    changePwd: () => modal('Changer le mot de passe', `<div class="field"><label>Mot de passe actuel</label><input type="password" id="op"></div><div class="field"><label>Nouveau mot de passe</label><input type="password" id="np"></div><div class="field"><label>Confirmer</label><input type="password" id="np2"></div>`, [{ label: 'Annuler', cls: 'o' }, { label: 'Valider', on: () => { if ($('#np').value !== $('#np2').value) { toast('Les mots de passe ne correspondent pas'); return false; } try { Auth.changePassword($('#op').value, $('#np').value); toast('Mot de passe modifié ✔'); } catch (e) { toast(e.message); return false; } } }]),
    newCode: () => { const c = Auth.newRecoveryCode(); modal('Nouveau code de récupération', `<p>Ton ancien code ne fonctionne plus. Note bien celui-ci :</p><div class="code-box">${c}</div>`, [{ label: 'C\'est noté' }], { nofocus: true }); },
    exportData: () => { const blob = new Blob([DB.exportAll()], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'rsuta-sauvegarde-' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); toast('Sauvegarde exportée ✔'); },
    importData: (inp) => { const f = inp.files && inp.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { DB.importAll(r.result); toast('Sauvegarde importée ✔ Reconnecte-toi.'); Auth.logout(); setTimeout(() => location.reload(), 900); } catch (e) { toast('Fichier invalide.'); } }; r.readAsText(f); },
    warmup: async () => { loader('Préparation du lecteur de photos…'); const w = await OCR.warmup(); loader(); toast(w ? 'Prêt ✔ Le scan fonctionne hors-ligne.' : 'Impossible de préparer l\'OCR sur cet appareil.'); },
    clearDevoirs: () => confirmBox('Effacer tous tes devoirs ?', () => { DB.where('devoirs', (d) => d.user_id === Auth.current.id).forEach((d) => DB.remove('devoirs', d.id)); toast('Devoirs effacés'); }, 'Effacer'),
    resetAll: () => confirmBox('Toutes les données (comptes, progression, devoirs) seront supprimées de cet appareil. Continuer ?', async () => { await DB.wipe(); localStorage.clear(); sessionStorage.clear(); location.hash = ''; location.reload(); }, 'Tout effacer'),
    // admin
    adminReset: (id) => { const t = Auth.adminTempPassword(id); modal('Mot de passe temporaire', `<p>Communique ce mot de passe à l'utilisateur. Il pourra le changer dans Paramètres.</p><div class="code-box">${t}</div>`, [{ label: 'OK' }], { nofocus: true }); },
    adminRole: (id) => { const u = DB.find('users', (x) => x.id === id); const cyc = ['eleve', 'enseignant', 'admin']; u.role = cyc[(cyc.indexOf(u.role) + 1) % cyc.length]; DB.save('users'); toast('Rôle : ' + u.role); route(); },
    adminBlock: (id) => { const u = DB.find('users', (x) => x.id === id); u.bloque = !u.bloque; DB.save('users'); route(); },
    adminDel: (id) => confirmBox('Supprimer définitivement ce compte et ses données ?', () => { ['devoirs', 'progression', 'notifications', 'abonnements', 'conversations', 'quiz_resultats', 'epreuves_user'].forEach((t) => DB.where(t, (r) => r.user_id === id).forEach((r) => DB.remove(t, r.id))); DB.remove('users', id); route(); }, 'Supprimer'),
    adminAdd: () => modal('Ajouter un utilisateur', `<div class="field"><label>Nom</label><input id="an"></div><div class="field"><label>E-mail</label><input id="ae" type="email"></div><div class="field"><label>Niveau</label><select id="av2">${NIV.map((n) => `<option>${n}</option>`).join('')}</select></div><div class="field"><label>Mot de passe initial</label><input id="ap" value="rsuta2026"></div>`, [{ label: 'Annuler', cls: 'o' }, { label: 'Créer', on: () => { try { const { code } = Auth.register({ nom: $('#an').value, email: $('#ae').value, password: $('#ap').value, niveau: $('#av2').value }); setTimeout(() => { modal('Compte créé ✔', `<p>Code de récupération à remettre à l'utilisateur :</p><div class="code-box">${code}</div>`, [{ label: 'OK', on: () => setTimeout(route, 10) }], { nofocus: true }); }, 10); } catch (e) { toast(e.message); return false; } } }])
  };

  function checkReminder() {
    if (!S.reminders || !Auth.current) return;
    const today = new Date().toISOString().slice(0, 10); const key = 'rsuta.rem.' + Auth.current.id;
    const [h, m] = (S.reminderTime || '18:00').split(':').map(Number); const now = new Date();
    if (localStorage.getItem(key) === today || now.getHours() * 60 + now.getMinutes() < h * 60 + m) return;
    localStorage.setItem(key, today);
    const pr = userProgress(); const msg = pr.month >= pr.goal ? 'Objectif atteint ce mois ! Un petit quiz pour garder la forme ?' : 'Il te reste ' + (pr.goal - pr.month) + ' leçons pour ton objectif du mois. 15 minutes suffisent !';
    DB.notify(Auth.current.id, 'C\'est l\'heure de réviser ⏰', msg, 'rappel');
    if ('Notification' in window && Notification.permission === 'granted') try { new Notification('RSuta', { body: msg, icon: 'icons/icon-192.png' }); } catch (e) { /* */ }
  }

  // ================================================================= DÉMARRAGE
  async function boot() {
    applySettings();
    await DB.init();
    Auth.restore();
    const sp = $('#splash'); if (sp) setTimeout(() => { sp.style.transition = 'opacity .3s'; sp.style.opacity = 0; setTimeout(() => sp.remove(), 300); }, 500);
    route(); checkReminder();
    setInterval(checkReminder, 60000);
    window.addEventListener('online', () => toast('Connexion rétablie ✔')); window.addEventListener('offline', () => toast('Mode hors-ligne : le prof reste disponible 💪'));
    if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !window._noSW) navigator.serviceWorker.register('sw.js').catch(() => {});
    if ('Notification' in window && Notification.permission === 'default' && S.reminders) setTimeout(() => { try { Notification.requestPermission(); } catch (e) { /* */ } }, 8000);
    const obs = new MutationObserver(() => { if (window._prefill && $('#ask')) { $('#ask').value = window._prefill; window._prefill = null; } });
    obs.observe($('#app'), { childList: true });
  }
  window.RSutaApp = { boot, route, S, createDevoir, EDITEUR, VERSION,
    _: { R, shell, phead, paginate, pager, modal, closeModal, confirmBox, toast, loader, esc, $, NIV, NIVINFO, fmtDate, fmtDT, saveSettings, isDone, userProgress, md, mx, stepsHTML, KINDS, genFor, normA: (s) => normA(s) } };
  document.addEventListener('DOMContentLoaded', boot);
})();
