# RSuta — Ton prof IA qui ne dort pas ✦

Application d'apprentissage pour les élèves et étudiants du **Bénin** : **CEP, BEPC, BAC et Licence professionnelle (toutes filières)**.
Cours, quiz, **scan de devoirs**, correction d'**épreuves**, chat avec le **Prof IA** qui explique toujours en **3 étapes**, avec voix.
Une seule base de code pour **Web (PWA), Windows (Electron) et Android/iOS (Capacitor)**. **Fonctionne hors-ligne.**

## Éditeur
**BSH - Best Services and House**
📞 +229 01 48 52 45 90 • ✉️ contact@bestservicesandhouse.site • 🌐 https://www.bestservicesandhouse.site

Dans l'application : *Profil → Aide et contact* et *Paramètres → À propos*. Sous Windows, « BSH - Best Services and House » apparaît comme éditeur dans *Paramètres → Applications installées*.

## Démarrage rapide

### Construire l'installateur Windows (.exe NSIS 64 bits)
Double-cliquer sur **`Construire-Installateur-Windows.bat`** (Node.js LTS x64 requis). Le script installe les dépendances, prépare `winCodeSign` en contournant l'erreur *« Cannot create symbolic link »*, puis crée `dist\RSuta-Setup-1.2.0-x64.exe`.


| Plateforme | Comment lancer |
|---|---|
| **Windows (sans installation)** | Double-cliquer sur `Lancer-RSuta-Windows.bat` → RSuta s'ouvre dans le navigateur (Edge/Chrome). |
| **Windows (application .exe)** | `npm install` puis `npm run dist:win` → `dist/RSuta-Setup-1.2.0-x64.exe` (installateur) et `dist/RSuta-1.2.0-portable.exe`. Ou automatiquement via GitHub Actions (voir plus bas). |
| **Web / PWA** | Héberger le dossier `app/` sur n'importe quel serveur HTTPS (Netlify, GitHub Pages, serveur d'école…). Sur téléphone : menu du navigateur → « Ajouter à l'écran d'accueil ». |
| **Test local** | `node scripts/serve.js` puis ouvrir http://localhost:8080 (ou `python -m http.server` dans `app/`). |
| **Android (APK)** | `npm install && npx cap add android && bash scripts/android-permissions.sh && npm run android:debug` → `android/app/build/outputs/apk/debug/app-debug.apk`. Nécessite JDK 17 + Android SDK. |
| **iOS** | `npx cap add ios && npx cap open ios` (sur Mac avec Xcode). |

### Comptes de démonstration
| Rôle | E-mail | Mot de passe | Code de récupération |
|---|---|---|---|
| Élève (BEPC) | kevin@rsuta.bj | kevin123 | RSUTA-KEVN-2026 (réponse secrète : amiwo) |
| Administrateur | admin@rsuta.bj | RSuta@2026 | RSUTA-ADMN-2026 |

## Compilation automatique (APK + EXE) avec GitHub Actions
1. Créer un dépôt GitHub et y pousser ce dossier.
2. Onglet **Actions** → « Build RSuta (Windows + Android) » → **Run workflow**.
3. À la fin (≈10 min), télécharger les artefacts **RSuta-Windows** (.exe) et **RSuta-Android-APK** (.apk).

## Fonctionnalités
- **Accueil** fidèle à la maquette : progression du mois, 4 parcours (CEP 5, BEPC 12, BAC 20, LICENCE 24 chapitres), bouton « Scan ton devoir ».
- **Cours** : matières → chapitres → leçons (lecture, écoute vocale, marquer terminée), quiz par chapitre.
- **Quiz** : QCM, vrai/faux, questions ouvertes, correction expliquée ; **Quiz express** généré à l'infini.
- **Scan** : caméra en direct ou photo → lecture OCR hors-ligne (Tesseract, français) → texte modifiable → résolution. Photo floue → « Aïe, je vois flou mon enfant, reprends la photo à la lumière stp ».
- **Prof IA** : réponse en 3 étapes (On comprend l'exercice / On applique la méthode / On vérifie), conclusion, encouragement béninois, langage adapté au niveau, lecture vocale, dictée au micro, « exercice similaire » corrigé, « réexplique autrement ».
- **Épreuves** : 18 sujets types + soumission de ses propres épreuves (texte ou photo), découpage automatique en exercices, correction de chaque exercice.
- **Comptes** : inscription, connexion, *mot de passe oublié* (code de récupération ou question secrète), changement de mot de passe, rôle administrateur.
- **Paramètres** : thème clair/sombre, taille du texte, pagination, mode du prof, API en ligne, voix, caméra, rappels, objectif, sauvegarde/restauration, réinitialisation.
- **Listes paginées** (10 par page par défaut), recherche, barres de défilement personnalisées, bouton « haut de page ».
- **Responsive** : mobile (barre de navigation du bas), tablette, ordinateur (menu latéral).

## Le Prof IA : hors-ligne + en ligne (optionnel)
- **Hors-ligne (intégré)** : moteur de résolution pas à pas — équations et inéquations (1er/2nd degré), systèmes, développement/factorisation, dérivées, calculs avec priorités, fractions, pourcentages, PGCD/PPCM, statistiques, Pythagore, aires/périmètres, intérêts simples/composés, TVA 18 %, amortissements, loi d'Ohm, masse volumique, vitesse, règle de trois, conjugaison, définitions, méthodologie (dissertation, commentaire, résumé, étude de cas).
- **En ligne (optionnel)** : Paramètres → Prof IA → URL + clé d'une API compatible OpenAI. Le prompt système officiel RSuta est utilisé et la réponse est demandée au format JSON (`etape1_titre`, `etape1_texte`, …, `niveau_difficulte`). Mode **Automatique** : le prof hors-ligne répond, et l'API est appelée seulement si l'exercice dépasse ses capacités.

## Structure
```
app/                 Application (HTML/CSS/JS, aucune dépendance réseau)
  index.html         Point d'entrée      sw.js  Service worker (hors-ligne)
  css/style.css      Design (couleurs RSuta, motif africain, responsive, thème sombre)
  js/app.js          Routeur + écrans    js/icons.js  Icônes SVG
  js/engine.js       Moteur de résolution pas à pas    js/math.js  Calcul exact (fractions, polynômes)
  js/prof.js         Prof IA (format JSON officiel, voix, mode en ligne)
  js/curriculum.js   Programme : niveaux, matières, chapitres, leçons, quiz, questions
  js/epreuves.js     Banque de sujets types    js/ocr.js  Lecture des photos
  js/db.js           Base locale (IndexedDB) + authentification
  vendor/tesseract/  OCR hors-ligne + modèle français
desktop/main.js      Application Windows (Electron)
capacitor.config.json  Application mobile (Android/iOS)
.github/workflows/build.yml  Compilation automatique EXE + APK
docs/RSuta-Presentation-Guide.pdf  Présentation et guide d'utilisation illustré
```

## Base de données (schéma de la maquette)
`niveaux`, `users`, `abonnements`, `matieres`, `chapitres`, `lecons`, `quiz`, `questions`, `progression` — plus `devoirs`, `conversations`, `epreuves_user`, `notifications`, `quiz_resultats`.
Le contenu pédagogique est dans `js/curriculum.js` ; les données des utilisateurs sont stockées localement (IndexedDB) et exportables en JSON.
Mots de passe : hachage SHA-256 salé. Les données ne quittent jamais l'appareil (sauf l'énoncé envoyé à l'API si le mode en ligne est activé).

## Limites connues
- L'OCR lit très bien l'imprimé et l'écriture soignée ; l'écriture manuscrite difficile peut demander une correction du texte (toujours modifiable avant la résolution) ou le mode en ligne avec vision.
- Hors-ligne, les questions rédactionnelles (dissertation, commentaire) reçoivent une méthode et un plan détaillé adaptés au niveau ; une rédaction complète nécessite le mode en ligne.
- Les comptes sont locaux à l'appareil (pas de synchronisation serveur dans cette version).

---
© 2026 BSH - Best Services and House. Tous droits réservés.
