/* RSuta — Le Prof : orchestre le moteur hors-ligne, le mode en ligne (optionnel), la voix et le ton béninois. */
(function (G) {
  'use strict';
  const E = G.RSutaEngine;

  const SYSTEM_PROMPT = `# RSuta - Prompt Système Officiel
## ROLE
Tu es RSuta, le prof IA n°1 du Bénin. Tu as enseigné 20 ans au CEG Godomey. Tu es patient, tu expliques comme un grand frère.
## REGLES D'OR
1. JAMAIS de réponse sèche. Toujours 3 étapes.
2. Adapte ton langage au niveau:
   - CEP: mots de 5 ans, exemple avec mangues, école, marché Golo
   - BEPC: ado, humour, exemples foot, TikTok, mais rigoureux
   - BAC: sérieux, méthode, astuces correcteur
   - LICENCE: universitaire, références, plan détaillé
3. FORMAT DE REPONSE OBLIGATOIRE (JSON pour l'app):
{"etape1_titre":"On comprend l'exercice","etape1_texte":"...","etape2_titre":"On applique la méthode","etape2_texte":"...","etape3_titre":"On vérifie","etape3_texte":"...","conclusion":"Tu as pigé ?","question_suivante":"Veux-tu un exercice similaire pour t'entraîner ?","niveau_difficulte":"facile/moyen/difficile"}
4. INTERDIT: Donner la réponse sans expliquer ; Parler comme un robot ; Dire "en tant qu'IA" ; Faire des hors programme Bénin
5. Si photo floue: "Aïe, je vois flou mon enfant, reprends la photo à la lumière stp"
6. Motivation finale toujours: petite phrase d'encouragement béninoise "Tu vas avoir ton BEPC, je crois en toi !"
## BASE DE CONNAISSANCE
Programme officiel MEMP/MESRS Bénin 2024 ; Annales CEP 2015-2024, BEPC 2015-2024, BAC A B C D 2015-2024 ; Méthodologie dissertation française africaine.
Réponds UNIQUEMENT avec l'objet JSON.`;

  const BLUR = 'Aïe, je vois flou mon enfant, reprends la photo à la lumière stp';

  const ENC = {
    CEP: ['Tu vas avoir ton CEP, je crois en toi !', 'Bravo mon petit, tu es fort comme un baobab ! Ton CEP est déjà dans la poche.', 'Courage ! Chaque exercice te rapproche de ton CEP 🌟'],
    BEPC: ['Tu vas avoir ton BEPC, je crois en toi !', 'Comme les Guépards en finale : on lâche rien ! Le BEPC, c\'est pour toi 🏆', 'Tu gères mieux qu\'un TikTokeur en tendance ! BEPC en vue 💪'],
    BAC: ['Ton BAC, tu vas le décrocher, je crois en toi !', 'Méthode + régularité = mention au BAC. Continue comme ça !', 'Le correcteur va sourire en lisant ta copie. Courage pour le BAC !'],
    LICENCE: ['Ta Licence Pro est au bout de l\'effort, je crois en toi !', 'Rigueur et persévérance : la soutenance sera un succès !', 'Le Bénin a besoin de cadres comme toi. Courage !']
  };
  const INTRO = {
    CEP: ['Pas de souci mon petit ! On va faire ça ensemble, doucement 😊', 'Viens, on regarde ça tranquillement, comme au marché de Golo 🥭', 'Ah, bel exercice ! On le fait pas à pas, tu vas voir que c\'est facile 😊'],
    BEPC: ['Pas de souci ! On va résoudre ça ensemble, comme une équipe de foot ⚽', 'Ok champion, on attaque cet exercice ensemble, sans stress 😎', 'Facile pour nous deux ! On déroule ça comme une vidéo TikTok : court et clair 📱'],
    BAC: ['Très bien. On applique la méthode, étape par étape, comme le correcteur l\'attend.', 'Bon sujet de BAC ! On structure la réponse pour aller chercher tous les points.', 'Allons-y méthodiquement : chaque étape rédigée rapporte des points.'],
    LICENCE: ['Bien. Procédons avec rigueur, selon une démarche structurée.', 'Analysons ce problème de manière méthodique : hypothèses, résolution, interprétation.', 'Très bien. Adoptons une démarche universitaire, étape par étape.']
  };
  const ASTUCE = {
    CEP: '🥭 Astuce : imagine que ce sont des mangues au marché, c\'est plus facile !',
    BEPC: '💡 Astuce : vérifie toujours ta réponse, c\'est le VAR des maths !',
    BAC: '🎯 Astuce correcteur : rédige chaque étape et souligne le résultat final, des points sont accordés à la démarche.',
    LICENCE: '📚 Référence : présente la formule utilisée, justifie chaque étape et interprète le résultat dans son contexte.'
  };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  function settings() { try { return JSON.parse(localStorage.getItem('rsuta.settings') || '{}'); } catch (e) { return {}; } }

  // Format officiel (JSON) + champs d'affichage
  function format(r, niveau) {
    niveau = niveau || 'BEPC';
    const enc = pick(ENC[niveau] || ENC.BEPC);
    return {
      etape1_titre: r.etapes[0].titre, etape1_texte: r.etapes[0].texte,
      etape2_titre: r.etapes[1].titre, etape2_texte: r.etapes[1].texte,
      etape3_titre: r.etapes[2].titre, etape3_texte: r.etapes[2].texte,
      conclusion: (r.conclusion || '') + (/\?$/.test(r.conclusion || '') ? '' : (niveau === 'CEP' ? ' Facile non ?' : ' Tu as pigé ?')),
      question_suivante: r.type === 'methode' || r.type === 'definition' ? 'Veux-tu que je te propose un autre sujet pour t\'entraîner ?' : 'Veux-tu un exercice similaire pour t\'entraîner ?',
      niveau_difficulte: r.difficulte || 'moyen',
      // champs complémentaires pour l'interface
      titre: r.titre || 'Exercice', type: r.type, intro: pick(INTRO[niveau] || INTRO.BEPC), astuce: ASTUCE[niveau], encouragement: enc,
      reponse: r.reponse, gen: r.gen || null, graph: r.graph || null, table: r.table || null, source: r.source || 'offline', confidence: r.confidence || 0.5, lessonId: r.lessonId || null
    };
  }

  function parseJSONLoose(txt) {
    if (!txt) return null;
    const a = txt.indexOf('{'), b = txt.lastIndexOf('}');
    if (a < 0 || b < a) return null;
    try { return JSON.parse(txt.slice(a, b + 1)); } catch (e) { return null; }
  }

  async function online(text, niveau, imageDataUrl) {
    const s = settings();
    if (!s.apiKey || !s.apiUrl || !navigator.onLine) return null;
    const content = imageDataUrl && s.vision
      ? [{ type: 'text', text: 'Niveau : ' + niveau + '. Exercice (photo jointe, texte OCR : ' + text + ')' }, { type: 'image_url', image_url: { url: imageDataUrl } }]
      : 'Niveau de l\'élève : ' + niveau + '.\nExercice :\n' + text;
    const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 45000);
    try {
      const resp = await fetch(s.apiUrl, {
        method: 'POST', signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + s.apiKey },
        body: JSON.stringify({ model: s.apiModel || 'gpt-4o-mini', temperature: 0.4, messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content }] })
      });
      if (!resp.ok) return null;
      const j = await resp.json();
      const msg = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
      const o = parseJSONLoose(msg);
      if (!o || !o.etape1_texte) return null;
      return {
        etapes: [{ titre: o.etape1_titre || "On comprend l'exercice", texte: o.etape1_texte }, { titre: o.etape2_titre || 'On applique la méthode', texte: o.etape2_texte }, { titre: o.etape3_titre || 'On vérifie', texte: o.etape3_texte }],
        conclusion: o.conclusion, difficulte: o.niveau_difficulte, titre: (text || 'Exercice').split('\n')[0].slice(0, 60), type: 'online', source: 'online', confidence: 0.95
      };
    } catch (e) { return null; } finally { clearTimeout(to); }
  }

  // Résout un exercice : hors-ligne d'abord, en ligne si demandé / nécessaire
  async function solve(text, opts) {
    opts = opts || {};
    const niveau = opts.niveau || 'BEPC';
    const mode = settings().profMode || 'auto';
    let r = null;
    if (mode === 'online') r = await online(text, niveau, opts.image);
    if (!r) r = E.solve(text, { niveau, matiere: opts.matiere });
    if (r && mode === 'auto' && r.confidence < 0.7) { const o = await online(text, niveau, opts.image); if (o) r = o; }
    if (!r) return null;
    return format(r, niveau);
  }

  // Traite une épreuve complète (plusieurs exercices)
  async function solveEpreuve(text, opts) {
    const parts = E.splitExercises(text);
    const out = [];
    for (const p of (parts.length ? parts : [{ label: 'Exercice', text }])) {
      const r = await solve(p.text, opts);
      if (r) { r.label = p.label; r.enonce = p.text; out.push(r); }
    }
    return out;
  }

  function reexplain(f, niveau) {
    const simple = {
      etape1_titre: 'Reprenons doucement', etape1_texte: 'Pas de panique, on recommence avec d\'autres mots. ' + (f.type === 'equation' ? 'Une équation, c\'est une balance : à gauche et à droite, il y a le même poids. Notre but : laisser x tout seul sur un plateau.' : 'On lit l\'énoncé phrase par phrase et on souligne ce qu\'on cherche.'),
      etape2_titre: 'Le cœur de la méthode', etape2_texte: (f.etape2_texte || '').split('\n').map((l, i) => '👉 ' + (i + 1) + '. ' + l).join('\n'),
      etape3_titre: 'La preuve que c\'est juste', etape3_texte: f.etape3_texte,
      conclusion: f.conclusion, question_suivante: 'C\'est plus clair maintenant ? On s\'entraîne ?', niveau_difficulte: f.niveau_difficulte
    };
    return Object.assign({}, f, simple, { intro: niveau === 'CEP' ? 'Je t\'explique autrement, comme au marché 🥭' : 'D\'accord, je t\'explique autrement 🙂' });
  }

  // --- Voix (synthèse vocale hors-ligne du système) ---
  let voices = [];
  function loadVoices() { if ('speechSynthesis' in G) voices = speechSynthesis.getVoices().filter((v) => /^fr/i.test(v.lang)); }
  if ('speechSynthesis' in G) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  function speak(text, onend) {
    if (!('speechSynthesis' in G)) return false;
    speechSynthesis.cancel();
    const s = settings();
    const clean = String(text).replace(/[✅❌🎉😊⚽🥭💡🎯📚👉🌟🏆💪📘📗↗↘]/g, '').replace(/×/g, ' fois ').replace(/÷/g, ' divisé par ').replace(/²/g, ' au carré ').replace(/³/g, ' au cube ').replace(/√/g, ' racine de ').replace(/Δ/g, ' delta ').replace(/→/g, ', donc ').replace(/≤/g, ' inférieur ou égal à ').replace(/≥/g, ' supérieur ou égal à ').replace(/</g, ' inférieur à ').replace(/>/g, ' supérieur à ').replace(/ - /g, ' moins ').replace(/\s=\s/g, ' égale ');
    const chunks = clean.match(/[^.!?\n]+[.!?\n]*/g) || [clean];
    chunks.forEach((c, i) => {
      const u = new SpeechSynthesisUtterance(c.trim()); u.lang = 'fr-FR'; u.rate = s.voiceRate || 0.95;
      const v = voices.find((x) => x.name === s.voiceName) || voices[0]; if (v) u.voice = v;
      if (i === chunks.length - 1 && onend) u.onend = onend;
      speechSynthesis.speak(u);
    });
    return true;
  }
  function stopSpeak() { if ('speechSynthesis' in G) speechSynthesis.cancel(); }

  G.RSutaProf = { solve, solveEpreuve, format, reexplain, speak, stopSpeak, online, BLUR, ENC, SYSTEM_PROMPT, pick };
})(typeof window !== 'undefined' ? window : globalThis);
