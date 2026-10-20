/* RSuta — Base de données locale (IndexedDB, repli localStorage) + authentification hors-ligne.
   Tables (schéma ERD) : users, abonnements, progression, devoirs (scans), conversations, epreuves_user, notifications. */
(function (G) {
  'use strict';
  const TABLES = ['users', 'abonnements', 'progression', 'devoirs', 'conversations', 'epreuves_user', 'notifications', 'quiz_resultats', 'tentatives', 'plans', 'cartes', 'examens', 'diagnostics', 'classes', 'classe_devoirs', 'classe_recus', 'classe_resultats'];
  const DB = { t: {}, ready: false };
  let idb = null;

  function openIDB() {
    return new Promise((resolve) => {
      if (!('indexedDB' in G)) return resolve(null);
      try {
        const r = indexedDB.open('rsuta', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('kv');
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => resolve(null);
      } catch (e) { resolve(null); }
    });
  }
  function idbGet(k) { return new Promise((res) => { try { const q = idb.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); } catch (e) { res(undefined); } }); }
  function idbPut(k, v) { return new Promise((res) => { try { const tx = idb.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = () => res(true); tx.onerror = () => res(false); } catch (e) { res(false); } }); }

  DB.init = async function () {
    idb = await openIDB();
    for (const name of TABLES) {
      let v = idb ? await idbGet(name) : undefined;
      if (v === undefined) { try { v = JSON.parse(localStorage.getItem('rsuta.t.' + name) || '[]'); } catch (e) { v = []; } }
      DB.t[name] = Array.isArray(v) ? v : [];
    }
    DB.ready = true;
    await seed();
  };
  const timers = {};
  DB.save = function (name) {
    clearTimeout(timers[name]);
    timers[name] = setTimeout(() => {
      const v = DB.t[name];
      if (idb) idbPut(name, v); else try { localStorage.setItem('rsuta.t.' + name, JSON.stringify(v)); } catch (e) { /* quota */ }
    }, 60);
  };
  DB.all = (name) => DB.t[name] || [];
  DB.find = (name, fn) => DB.all(name).find(fn);
  DB.where = (name, fn) => DB.all(name).filter(fn);
  DB.insert = (name, row) => { row.id = row.id || uuid(); row.created_at = row.created_at || new Date().toISOString(); DB.t[name].push(row); DB.save(name); return row; };
  DB.update = (name, id, patch) => { const r = DB.find(name, (x) => x.id === id); if (r) { Object.assign(r, patch); DB.save(name); } return r; };
  DB.remove = (name, id) => { DB.t[name] = DB.t[name].filter((x) => x.id !== id); DB.save(name); };
  DB.exportAll = () => JSON.stringify({ app: 'RSuta', version: 1, date: new Date().toISOString(), tables: DB.t, settings: localStorage.getItem('rsuta.settings') });
  DB.importAll = (json) => { const o = JSON.parse(json); if (o.app !== 'RSuta') throw new Error('Fichier invalide'); TABLES.forEach((n) => { DB.t[n] = o.tables[n] || []; DB.save(n); }); if (o.settings) localStorage.setItem('rsuta.settings', o.settings); };
  DB.wipe = async () => { TABLES.forEach((n) => { DB.t[n] = []; DB.save(n); }); await new Promise((r) => setTimeout(r, 150)); };

  function uuid() {
    if (G.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); });
  }
  DB.uuid = uuid;

  // ---------- SHA-256 (implémentation JS pure : fonctionne même hors contexte sécurisé) ----------
  function sha256(ascii) {
    function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
    const mp = Math.pow, mw = mp(2, 32); let result = '', i, j;
    const words = []; const bl = unescape(encodeURIComponent(ascii)); const abl = bl.length * 8;
    const hash = [], k = []; let pc = 0; const ic = {};
    for (let c = 2; pc < 64; c++) { if (!ic[c]) { for (i = 0; i < 313; i += c) ic[i] = c; hash[pc] = (mp(c, .5) * mw) | 0; k[pc++] = (mp(c, 1 / 3) * mw) | 0; } }
    let s = bl + '\x80'; while (s.length % 64 - 56) s += '\x00';
    for (i = 0; i < s.length; i++) { j = s.charCodeAt(i); words[i >> 2] |= j << ((3 - i) % 4) * 8; }
    words[words.length] = ((abl / mw) | 0); words[words.length] = (abl);
    let H = hash.slice(0, 8);
    for (j = 0; j < words.length;) {
      const w = words.slice(j, j += 16); const old = H;
      H = H.slice(0, 8);
      for (i = 0; i < 64; i++) {
        const w15 = w[i - 15], w2 = w[i - 2]; const a = H[0], e = H[4];
        const t1 = H[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & H[5]) ^ ((~e) & H[6])) + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
        const t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & H[1]) ^ (a & H[2]) ^ (H[1] & H[2]));
        H = [(t1 + t2) | 0].concat(H); H[4] = (H[4] + t1) | 0; H.length = 8;
      }
      for (i = 0; i < 8; i++) H[i] = (H[i] + old[i]) | 0;
    }
    for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { const b = (H[i] >> (j * 8)) & 255; result += ((b < 16) ? 0 : '') + b.toString(16); }
    return result;
  }
  function hashPwd(pwd, salt) { let h = salt + ':' + pwd; for (let i = 0; i < 2000; i++) h = sha256(h + salt); return h; }
  function recoveryCode() { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = 'RSUTA-'; for (let i = 0; i < 8; i++) { if (i === 4) s += '-'; s += a[Math.floor(Math.random() * a.length)]; } return s; }

  // ---------- Authentification ----------
  const Auth = {
    current: null,
    register({ nom, email, password, niveau, filiere, question, reponse, role }) {
      email = String(email).trim().toLowerCase();
      if (!nom || nom.trim().length < 2) throw new Error('Indique ton nom (2 lettres minimum).');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Adresse e-mail invalide.');
      if (!password || password.length < 6) throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
      if (DB.find('users', (u) => u.email === email)) throw new Error('Un compte existe déjà avec cet e-mail.');
      const salt = uuid().slice(0, 8), code = recoveryCode();
      const niv = (G.RSutaData.niveaux.find((n) => n.nom === niveau) || G.RSutaData.niveaux[1]);
      const u = DB.insert('users', {
        nom: nom.trim(), email, mot_de_passe_hash: hashPwd(password, salt), salt, niveau_id: niv.id, niveau: niv.nom, filiere: filiere || '',
        role: role || 'eleve', date_inscription: new Date().toISOString(), recovery_hash: hashPwd(code, salt),
        question: question || '', reponse_hash: reponse ? hashPwd(String(reponse).trim().toLowerCase(), salt) : '', avatar: '', objectif: 30, streak: 0, last_active: ''
      });
      DB.insert('abonnements', { user_id: u.id, plan: 'Gratuit', statut: 'actif', date_debut: new Date().toISOString().slice(0, 10), date_fin: null, prix: 0 });
      notify(u.id, 'Bienvenue sur RSuta 🎉', 'Ton prof qui ne dort pas est prêt. Commence par choisir ton parcours ou scanne ton premier devoir !', 'info');
      return { user: u, code };
    },
    login(email, password, remember) {
      email = String(email).trim().toLowerCase();
      const u = DB.find('users', (x) => x.email === email);
      if (!u || u.mot_de_passe_hash !== hashPwd(password, u.salt)) throw new Error('E-mail ou mot de passe incorrect.');
      if (u.bloque) throw new Error('Ce compte est suspendu. Contacte l\'administrateur.');
      Auth.current = u; touch(u);
      (remember ? localStorage : sessionStorage).setItem('rsuta.session', u.id);
      return u;
    },
    restore() {
      const id = localStorage.getItem('rsuta.session') || sessionStorage.getItem('rsuta.session');
      const u = id && DB.find('users', (x) => x.id === id);
      if (u && !u.bloque) { Auth.current = u; touch(u); }
      return Auth.current;
    },
    logout() { Auth.current = null; localStorage.removeItem('rsuta.session'); sessionStorage.removeItem('rsuta.session'); },
    getQuestion(email) { const u = DB.find('users', (x) => x.email === String(email).trim().toLowerCase()); return u ? (u.question || null) : undefined; },
    resetPassword(email, proof, newPwd) {
      const u = DB.find('users', (x) => x.email === String(email).trim().toLowerCase());
      if (!u) throw new Error('Aucun compte avec cet e-mail sur cet appareil.');
      const p = String(proof || '').trim();
      const okCode = u.recovery_hash === hashPwd(p.toUpperCase(), u.salt);
      const okRep = u.reponse_hash && u.reponse_hash === hashPwd(p.toLowerCase(), u.salt);
      const okTemp = u.temp_hash && u.temp_hash === hashPwd(p, u.salt);
      if (!okCode && !okRep && !okTemp) throw new Error('Code de récupération ou réponse secrète incorrect.');
      if (!newPwd || newPwd.length < 6) throw new Error('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      u.mot_de_passe_hash = hashPwd(newPwd, u.salt); u.temp_hash = ''; DB.save('users');
      notify(u.id, 'Mot de passe modifié 🔐', 'Ton mot de passe a été réinitialisé avec succès.', 'securite');
      return true;
    },
    changePassword(oldPwd, newPwd) {
      const u = Auth.current; if (u.mot_de_passe_hash !== hashPwd(oldPwd, u.salt)) throw new Error('Mot de passe actuel incorrect.');
      if (!newPwd || newPwd.length < 6) throw new Error('6 caractères minimum.');
      u.mot_de_passe_hash = hashPwd(newPwd, u.salt); DB.save('users');
    },
    newRecoveryCode() { const u = Auth.current; const c = recoveryCode(); u.recovery_hash = hashPwd(c, u.salt); DB.save('users'); return c; },
    adminTempPassword(userId) { const u = DB.find('users', (x) => x.id === userId); const t = 'Tmp-' + Math.random().toString(36).slice(2, 8); u.temp_hash = hashPwd(t, u.salt); u.mot_de_passe_hash = hashPwd(t, u.salt); DB.save('users'); return t; },
    hashPwd
  };
  function touch(u) {
    const today = new Date().toISOString().slice(0, 10);
    if (u.last_active !== today) {
      const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      u.streak = u.last_active === y ? (u.streak || 0) + 1 : 1; u.last_active = today; DB.save('users');
    }
  }
  function notify(userId, titre, texte, type) { DB.insert('notifications', { user_id: userId, titre, texte, type: type || 'info', lu: false }); }
  DB.notify = notify;

  // ---------- Données de démonstration ----------
  async function seed() {
    if (DB.all('users').length) return;
    const admin = Auth.register({ nom: 'Administrateur', email: 'admin@rsuta.bj', password: 'RSuta@2026', niveau: 'LICENCE', role: 'admin', question: 'Nom de l\'application ?', reponse: 'rsuta' }).user;
    admin.recovery_hash = hashPwd('RSUTA-ADMN-2026', admin.salt);
    const k = Auth.register({ nom: 'Kévin', email: 'kevin@rsuta.bj', password: 'kevin123', niveau: 'BEPC', question: 'Ton plat préféré ?', reponse: 'amiwo' }).user;
    k.recovery_hash = hashPwd('RSUTA-KEVN-2026', k.salt);
    k.avatar = 'demo';
    // 18 leçons terminées ce mois-ci (comme sur la maquette : 62 % de l'objectif)
    const ls = G.RSutaData.lecons.filter((l) => l.niveau === 'BEPC').slice(0, 18);
    const now = new Date();
    ls.forEach((l, i) => DB.insert('progression', { user_id: k.id, lecon_id: l.id, statut: 'termine', pourcentage: 100, date_scan: new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - (i % 15))).toISOString() }));
    notify(k.id, 'Rappel de révision ⏰', 'Il te reste 12 leçons pour atteindre ton objectif du mois. On s\'y met ?', 'rappel');
    const nbS = (G.RSutaEpreuves && G.RSutaEpreuves.length) || 55;
    notify(k.id, 'Nouvelles épreuves 📄', nbS + ' sujets types CEP, BEPC, BAC et Licence Pro (conformes au programme) sont disponibles dans Épreuves.', 'info');
    // Compte enseignant de démonstration + une classe, un devoir et quelques copies déjà reçues
    const p = Auth.register({ nom: 'M. Agossou', email: 'prof@rsuta.bj', password: 'prof123', niveau: 'BEPC', role: 'enseignant', question: 'Ton plat préféré ?', reponse: 'amiwo' }).user;
    p.recovery_hash = hashPwd('RSUTA-PROF-2026', p.salt);
    const cl = DB.insert('classes', { user_id: p.id, nom: '3e A — CEG Godomey', niveau: 'BEPC', etablissement: 'CEG Godomey' });
    const dv = DB.insert('classe_devoirs', { user_id: p.id, classe_id: cl.id, titre: 'Devoir n°1 — Équations et calcul littéral', niveau: 'BEPC', duree_min: 30, date_limite: new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10), consignes: 'Montre toutes les étapes sur ton cahier, puis saisis la réponse finale.', items: [
      { e: 'Résous l\'équation 3x + 7 = 22.', a: [5], r: 'x = 5' },
      { e: 'Résous l\'équation 5x − 4 = 2x + 14.', a: [6], r: 'x = 6' },
      { e: 'Développe et réduis (x + 2)(x − 3).', p: 'x^2 - x - 6', r: 'x² − x − 6' },
      { e: 'Calcule 18 % de 25 000 F.', a: [4500], r: '4 500 F' }] });
    [['Aïcha T.', [1, 1, 1, 1], 1260], ['Romaric A.', [1, 1, 0, 1], 1490], ['Fifamè D.', [1, 0, 1, 1], 1715], ['Jean-Baptiste K.', [1, 1, 0, 0], 1800], ['Mariam S.', [1, 0, 0, 1], 1390], ['Kévin H.', [1, 1, 1, 0], 1100]].forEach(([nom, ok, dt], i) => {
      const sc = ok.reduce((x, y) => x + y, 0);
      DB.insert('classe_resultats', { user_id: p.id, classe_id: cl.id, devoir_id: dv.id, eleve: nom, score: sc, total: 4, note: sc * 5, ok, duree_s: dt, rendu_le: new Date(Date.now() - (i + 1) * 3600e3).toISOString() });
    });
    DB.save('users');
  }

  G.RSutaDB = DB; G.RSutaAuth = Auth;
})(typeof window !== 'undefined' ? window : globalThis);
