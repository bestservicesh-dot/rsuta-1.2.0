"""Génère docs/RSuta-Presentation-Guide.pdf (présentation + guide d'utilisation illustré).
Prérequis : captures dans docs/img (python3 docs/capture.py)."""
import base64, os, html
from PIL import Image
from playwright.sync_api import sync_playwright

D = os.path.expanduser('~/rsuta/docs/'); IMG = D + 'img/'; APP = os.path.expanduser('~/rsuta/app/')
E = html.escape
import json, subprocess, datetime, glob
ROOT = os.path.expanduser('~/rsuta/')
VER = json.load(open(ROOT + 'package.json'))['version']
FIG_JS = r"""
global.window=global;global.document={addEventListener(){},createElement(){return{}}};global.localStorage={getItem(){return null},setItem(){}};
['math','engine','engine2','engine3','curriculum','epreuves','fiches'].forEach(f=>require(process.argv[1]+'app/js/'+f+'.js'));
const D=window.RSutaData,E=window.RSutaEngine,EP=window.RSutaEpreuves,F=window.RSutaFiches;
const by=(a,k)=>a.reduce((o,x)=>(o[x[k]]=(o[x[k]]||0)+1,o),{});
const nGen=new Set([...Object.keys(E._gen2||{}),...Object.keys(E._gen3||{})]).size;
console.log(JSON.stringify({niveaux:D.niveaux.length,matieres:D.matieres.length,chapitres:D.chapitres.length,lecons:D.lecons.length,quiz:D.quiz.length,questions:D.questions.length,filieres:D.filieres.length,
 chapParNiv:by(D.chapitres,'niveau'),epreuves:EP.length,epParNiv:by(EP,'niveau'),fiches:F.ids().length,cartes:F.allCards().length,solveurs:E.SOLVERS.length,generateurs:nGen}));
"""
FIG = json.loads(subprocess.run(['node', '-e', FIG_JS, ROOT], capture_output=True, text=True, check=True).stdout)
_t = subprocess.run(['node', ROOT + 'tests/engine_test.js'], capture_output=True, text=True).stdout
import re as _re
_m = _re.search(r'(\d+) tests OK, (\d+) échec', _t); FIG['tests'] = int(_m.group(1)) if _m else 0; _g = _re.search(r'(\d+) générateurs', _t); FIG['generateurs'] = int(_g.group(1)) if _g else FIG['generateurs']; FIG['tests_ko'] = int(_m.group(2)) if _m else -1
_js = glob.glob(ROOT + 'app/js/*.js'); FIG['js_files'] = len(_js); FIG['js_lines'] = sum(open(f, encoding='utf8').read().count('\n') for f in _js)
FIG['css_lines'] = open(ROOT + 'app/css/style.css', encoding='utf8').read().count('\n')
FIG['app_mo'] = round(sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(ROOT + 'app') for f in fs) / 1048576, 1)
FIG['tables'] = len(_re.findall(r"'[a-z_]+'", _re.search(r'TABLES\s*=\s*\[([^\]]*)\]', open(ROOT + 'app/js/db.js', encoding='utf8').read()).group(1)))
FIG['date'] = datetime.date.today().strftime('%d/%m/%Y')
MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
FIG['mois'] = MOIS[datetime.date.today().month - 1].capitalize() + ' ' + str(datetime.date.today().year)
print('FIG', FIG)


def b64(path, mime='image/jpeg'):
    return 'data:%s;base64,%s' % (mime, base64.b64encode(open(path, 'rb').read()).decode())


def phone(name, maxw=64, maxh=232):
    im = Image.open(IMG + name + '.jpg'); w, h = im.size
    width = min(maxw, maxh * w / h)
    return f'<div class="phone" style="width:{width:.1f}mm"><img src="{b64(IMG + name + ".jpg")}"></div>'


def desk(name, w=176):
    return f'<div class="desk" style="width:{w}mm"><div class="bar"><i></i><i></i><i></i><span>RSuta</span></div><img src="{b64(IMG + name + ".jpg")}"></div>'


def table(rows):
    return '<table class="legend"><thead><tr><th>N°</th><th>Élément</th><th>À quoi ça sert</th></tr></thead><tbody>' + ''.join(
        f'<tr><td><span class="num">{i + 1}</span></td><td><b>{E(a)}</b></td><td>{b}</td></tr>' for i, (a, b) in enumerate(rows)) + '</tbody></table>'


SCREENS = []


def screen(sid, title, intro, img, rows, tip=None, maxw=64, maxh=232):
    SCREENS.append((sid, title, intro, img, rows, tip, maxw, maxh))


# ----------------------------------------------------------------------------- Interfaces
screen('login', 'Connexion', "Premier écran affiché. Chaque élève possède son propre compte (plusieurs élèves peuvent partager le même appareil). La session est mémorisée si « Se souvenir de moi » est coché.", 'login', [
    ('Adresse e-mail', "Saisir l'e-mail utilisé à l'inscription."),
    ('Mot de passe', 'Saisir le mot de passe (6 caractères minimum).'),
    ('Œil', 'Afficher / masquer le mot de passe pour vérifier la saisie.'),
    ('Se souvenir de moi', "Coché : l'élève reste connecté même après fermeture de l'application. Décoché : déconnexion à la fermeture."),
    ('Mot de passe oublié ?', "Ouvre l'écran de récupération du compte (voir plus loin)."),
    ('Se connecter', "Valide l'identification et ouvre l'Accueil. Un message indique une erreur éventuelle."),
    ('Créer un compte', "Ouvre le formulaire d'inscription."),
    ('Compte démo', 'Rappel des identifiants de démonstration (kevin@rsuta.bj / kevin123).')])
screen('register', 'Créer un compte', "L'inscription est gratuite et se fait sans internet. À la fin, RSuta affiche un code de récupération personnel (RSUTA-XXXX-XXXX) à recopier dans le cahier.", 'register', [
    ('Nom et prénom', "Utilisé pour saluer l'élève (« Bonjour, Kévin 👋 »)."),
    ('Adresse e-mail', 'Identifiant de connexion (unique sur l\'appareil).'),
    ('Niveau', "CEP, BEPC, BAC ou LICENCE : adapte les cours, les quiz et le langage du Prof IA. Pour LICENCE, une liste de filières apparaît."),
    ('Mot de passe', 'Au moins 6 caractères. Il est stocké haché (SHA-256 salé), jamais en clair.'),
    ('Confirmation', 'Retaper le mot de passe pour éviter les fautes de frappe.'),
    ('Question secrète', 'Question choisie pour récupérer le compte sans code.'),
    ('Réponse secrète', 'Réponse à la question (majuscules / minuscules indifférentes).'),
    ('Je suis enseignant(e)', "Coché : le compte est créé avec le rôle Enseignant (menu « Ma classe ») ; la case est facultative — le rôle administrateur se gère côté admin."),
    ('Créer mon compte', "Crée le compte, affiche le code de récupération puis ouvre l'Accueil.")])
screen('forgot', 'Mot de passe oublié', "Permet de choisir un nouveau mot de passe sans internet, grâce au code de récupération, à la réponse secrète ou à un mot de passe temporaire donné par l'administrateur.", 'forgot', [
    ('E-mail du compte', 'Saisir l\'e-mail : la question secrète du compte s\'affiche automatiquement.'),
    ('Code ou réponse secrète', 'Code RSUTA-XXXX-XXXX, réponse à la question secrète, ou mot de passe temporaire (Tmp-…) fourni par l\'administrateur.'),
    ('Nouveau mot de passe', 'Le nouveau mot de passe (6 caractères minimum).'),
    ('Réinitialiser', 'Enregistre le nouveau mot de passe et revient à la connexion. Une notification de sécurité est créée.'),
    ('Retour à la connexion', "Revenir à l'écran précédent sans rien changer.")])
screen('home', 'Accueil', "Écran principal, identique à la maquette : salutation, progression du mois, choix du parcours et accès direct au scan.", 'home', [
    ('Logo RSuta', "Identité de l'application."),
    ('Avatar', 'Ouvre le Profil. La photo se change depuis le Profil.'),
    ('Cloche', 'Ouvre les Notifications. La pastille rouge indique le nombre de notifications non lues.'),
    ('Salutation', "« Bonjour, [prénom] 👋 — Prêt à réviser aujourd'hui ? »."),
    ('Progression du mois', "Barre bleue à pointe jaune : leçons terminées ce mois / objectif (30 par défaut, modifiable dans Paramètres). Toucher la carte ouvre le Profil."),
    ('CEP', 'Primaire • 5 chapitres : ouvre les cours du CEP.'),
    ('BEPC', 'Collège • 12 chapitres : ouvre les cours du BEPC.'),
    ('BAC', 'Lycée • 20 chapitres : ouvre les cours du BAC.'),
    ('LICENCE', 'Supérieur • 24 chapitres : ouvre les cours de Licence professionnelle (toutes filières).'),
    ('Scan ton devoir', "Ouvre l'appareil photo pour photographier un exercice et obtenir l'explication du Prof IA."),
    ('Accueil', "Onglet actif (fond bleu, trait jaune) : revenir à l'accueil."),
    ('Cours', 'Parcourir les matières, chapitres et leçons.'),
    ('Quiz', "S'entraîner avec les quiz corrigés."),
    ('Profil', 'Statistiques, compte, paramètres, déconnexion.')])
screen('home_bas', 'Accueil — suite (en faisant défiler)', "Sous le bouton de scan, l'Accueil propose des raccourcis et un défi quotidien généré automatiquement selon le niveau.", 'home_bas', [
    ('Épreuves', 'Ouvre la banque d\'épreuves et la soumission d\'épreuves au prof.'),
    ('Pose ta question au prof', 'Ouvre le Chat avec le Prof IA (24 h/24, même hors-ligne).'),
    ('Continuer', 'Reprend la prochaine leçon non terminée du niveau de l\'élève.'),
    ('Réponse au défi', 'Saisir sa réponse (ex. « x = 4 »).'),
    ('Vérifier', 'Le prof corrige instantanément la réponse.'),
    ('Solution', 'Affiche la résolution complète en 3 étapes.')], maxh=200)
screen('cours', 'Cours — choix de la matière', "Liste des matières du niveau choisi avec la progression de l'élève.", 'cours', [
    ('Scanner', "Raccourci vers l'écran Scan."),
    ('Onglets de niveau', 'Passer de CEP à BEPC, BAC ou LICENCE.'),
    ('Matière', 'Ouvre la liste des chapitres de la matière (nombre de chapitres, de leçons, leçons terminées).'),
    ('Barre de progression', 'Part des leçons terminées dans la matière.')])
screen('matiere', 'Chapitres d\'une matière', "Les chapitres sont numérotés dans l'ordre du programme. La liste est paginée (10 par page par défaut).", 'matiere', [
    ('Retour', 'Revenir à la liste des matières.'),
    ('Chapitre', 'Ouvre le chapitre : leçons + quiz. « Terminé ✅ » quand toutes les leçons sont faites.')])
screen('chapitre', 'Chapitre', "Contenu d'un chapitre : ses leçons et son quiz.", 'chapitre', [
    ('Leçon', 'Ouvre la leçon (durée de lecture indiquée).'),
    ('Coche verte', 'Leçon déjà terminée.'),
    ('Faire le quiz du chapitre', 'Lance le quiz de 4 questions du chapitre.')])
screen('lecon', 'Leçon', "Lecture d'une leçon structurée (titres, règles, exemples encadrés).", 'lecon', [
    ('Haut-parleur', 'Lecture vocale de la leçon (voix française de l\'appareil, hors-ligne).'),
    ('Titre', 'Titre de la leçon, chapitre et durée.'),
    ('Exemple', 'Les exemples sont encadrés en jaune.'),
    ('Marquer comme terminée', 'Compte la leçon dans la progression du mois (toucher à nouveau pour annuler).'),
    ('Écouter la leçon', 'Même fonction que le haut-parleur.'),
    ('Quiz du chapitre', 'Lance le quiz associé.'),
    ('Poser une question au prof', 'Ouvre le Chat avec la question pré-remplie.'),
    ('Précédente / Suivante', 'Naviguer entre les leçons du chapitre.')], maxh=215)
screen('quiz', 'Quiz', "Tous les quiz du niveau, paginés, avec recherche. Le meilleur score obtenu est affiché.", 'quiz', [
    ('Onglets de niveau', 'Choisir le niveau des quiz.'),
    ('Quiz express — Lancer', '5 exercices générés automatiquement (jamais les mêmes), corrigés par le prof.'),
    ('Recherche', 'Filtrer les quiz par titre ou matière.'),
    ('Quiz', 'Lancer le quiz (nombre de questions, meilleur score).'),
    ('Pagination', 'Pages ‹ 1 2 › ; nombre total d\'éléments.')], maxh=220)
screen('quiz_play', 'Déroulement d\'un quiz', "Questions QCM, vrai/faux ou ouvertes. Correction immédiate et expliquée ; score final avec corrigé détaillé.", 'quiz_play', [
    ('Retour', 'Quitter le quiz.'),
    ('Score', 'Points obtenus.'),
    ('Barre de progression', 'Avancement dans le quiz.'),
    ('Question', 'Énoncé.'),
    ('Réponses', 'Toucher une réponse : vert = juste, rouge = faux.'),
    ('Explication', 'Correction expliquée par le prof.'),
    ('Question suivante', 'Passe à la question suivante, puis au score final.')])
screen('scan', 'Scan ton devoir', "Écran fidèle à la maquette. La caméra s'affiche en direct entre les 4 coins jaunes (sur ordinateur sans caméra, une feuille d'exemple est affichée).", 'scan', [
    ('Retour', "Revenir à l'écran précédent."),
    ('RSuta', "Titre du module de scan."),
    ('Livre', 'Ouvre les Épreuves.'),
    ('Zone de cadrage', 'Cadrer l\'exercice entre les 4 coins jaunes.'),
    ('Appareil photo (bleu)', 'Prend la photo (ou ouvre l\'appareil photo du téléphone si l\'aperçu n\'est pas disponible).'),
    ('Scanner (jaune)', 'Même action : capture puis lecture du texte (OCR hors-ligne).'),
    ('Conseil', '« Assure-toi que l\'écriture est bien visible ».'),
    ('Importer une photo', 'Choisir une photo déjà prise dans la galerie / les fichiers.'),
    ('Saisir le texte', 'Taper l\'énoncé au clavier au lieu de le photographier.'),
    ('Scan', 'Onglet du module de scan (barre de navigation de la maquette).'),
    ('Devoirs', 'Historique des devoirs résolus.'),
    ('Chat', 'Discussion libre avec le Prof IA.'),
    ('Profil', 'Profil de l\'élève.')])
screen('ocr_verif', 'Vérification du texte lu', "Après la photo, RSuta lit le texte (en moins d'une seconde pour un énoncé net) et le montre à l'élève, qui peut corriger une erreur de lecture avant la résolution.", 'ocr_verif', [
    ('Énoncé lu', 'Texte reconnu, modifiable. Astuces : x² ou x^2, 3/4, √.'),
    ('Niveau', 'Niveau utilisé pour adapter l\'explication.'),
    ('Résoudre ✨', 'Envoie l\'énoncé au Prof IA. Plusieurs exercices sont détectés et corrigés un par un.')])
screen('flou', 'Photo floue', "Si la photo est trop floue, trop sombre ou illisible, le prof répond comme prévu dans son cahier des charges.", 'flou', [
    ('Message du prof', '« Aïe, je vois flou mon enfant, reprends la photo à la lumière stp ».'),
    ('Saisir le texte', 'Taper l\'énoncé à la place.'),
    ('Reprendre la photo', 'Revenir à la caméra.')])
screen('result', 'Résultat — explication du Prof IA', "Écran fidèle à la maquette : le prof explique toujours en 3 étapes, puis conclut, encourage et propose un exercice similaire.", 'result', [
    ('Retour', 'Revenir à la liste des devoirs.'),
    ('Lecture', "Lance / arrête l'explication vocale."),
    ('Exercice résolu ✅', 'Statut du devoir.'),
    ('Exercice', "Rappel de l'exercice (ex. 2x + 5 = 13)."),
    ('Niveau • difficulté', 'Niveau et difficulté (facile / moyen / difficile).'),
    ('Prof IA', 'Avatar du prof et statut « en ligne » / « hors-ligne, toujours là ».'),
    ('Introduction', 'Phrase d\'accueil adaptée au niveau (foot et TikTok au BEPC, marché au CEP…).'),
    ('Étape 1', 'On comprend l\'exercice.'),
    ('Étape 2', 'On applique la méthode (calculs détaillés).'),
    ('Étape 3', 'On vérifie.'),
    ('Conclusion', 'Résultat, astuce, encouragement béninois et question « Veux-tu un exercice similaire ? ».'),
    ('Oui, un exercice similaire', 'Le prof crée un nouvel exercice du même type et corrige la réponse.'),
    ('Réexplique autrement', 'Nouvelle explication, plus simple, avec d\'autres mots.'),
    ("Écouter l'explication vocale", 'Lecture à voix haute des 3 étapes (toucher à nouveau pour arrêter).'),
    ('Trombone', 'Joindre une photo : son texte est lu et placé dans la zone de saisie.'),
    ('√x', 'Ouvre / ferme le clavier mathématique (puissances, racines, fractions, trigonométrie…).'),
    ('Pose une question...', 'Écrire une question, une réponse ou un nouvel exercice.'),
    ('Micro', 'Dicter la question à voix haute (si l\'appareil le permet).'),
    ('Envoyer', 'Envoyer le message au prof.')], maxh=235)
screen('result_suite', 'Résultat — exercice similaire', "Exemple de suite de conversation : l'élève répond « oui », le prof propose un exercice, l'élève répond, le prof corrige.", 'result_suite', [
    ('Demande de l\'élève', '« oui » (ou le bouton « Oui, un exercice similaire »).'),
    ('Réponse de l\'élève', 'Le prof vérifie la réponse : « ✅ Bravo ! » ou « ❌ Pas encore… ». Taper « solution » pour voir la correction.')])
screen('result_epreuve', 'Résultat — devoir à plusieurs exercices', "Quand la photo contient plusieurs exercices, chacun est traité séparément.", 'result_epreuve', [
    ('Photo', 'Miniature de la photo scannée.'),
    ('Exercice 1, 2…', 'Séparateur de chaque exercice.'),
    ('Énoncé', 'Énoncé de l\'exercice concerné.'),
    ('Nombre d\'exercices', 'Nombre d\'exercices traités.')], maxh=215)
screen('devoirs', 'Mes devoirs', "Historique de tous les devoirs (scannés, tapés ou épreuves), paginé, filtrable et consultable hors-ligne.", 'devoirs', [
    ('+', 'Nouveau scan.'),
    ('Filtres', 'Tous / CEP / BEPC / BAC / LICENCE.'),
    ('Recherche', 'Retrouver un devoir par mot-clé.'),
    ('Devoir', 'Rouvrir l\'explication et la conversation.'),
    ('Corbeille', 'Supprimer le devoir.'),
    ('Pagination', '10 devoirs par page (réglable).')], maxh=225)
screen('chat', 'Chat avec le prof', "Le « prof qui ne dort pas » : on lui écrit n'importe quel exercice ou question du programme, à toute heure.", 'chat', [
    ('Corbeille', 'Effacer la conversation.'),
    ('Statut', 'Prof IA en ligne / hors-ligne et niveau.'),
    ('Message du prof', "Message d'accueil avec exemples de questions."),
    ('Message de l\'élève', 'Question envoyée (bulle blanche à droite).'),
    ('Écouter la dernière réponse', 'Lecture vocale.'),
    ('Zone de saisie', 'Écrire, dicter (micro) ou joindre une photo (trombone).')], maxh=225)
screen('epreuves', 'Épreuves', "Banque de sujets types (non officiels, conformes au programme) CEP, BEPC, BAC et Licence professionnelle, plus les épreuves soumises par l'élève. Filtre par niveau et par filière (Licence).", 'epreuves', [
    ('+', 'Soumettre une épreuve.'),
    ('Soumettre une épreuve au prof', 'Même action, bouton principal.'),
    ('Niveaux', 'Toutes / CEP / BEPC / BAC / LICENCE.'),
    ('Recherche', 'Filtrer par matière ou thème (et par filière en LICENCE).'),
    ('Épreuve', 'Ouvrir l\'épreuve.')])
screen('epreuve', 'Détail d\'une épreuve', "Énoncé complet, nombre d'exercices détectés automatiquement.", 'epreuve', [
    ('Étiquettes', 'Niveau, matière, filière.'),
    ('Titre', 'Titre, durée de l\'épreuve.'),
    ('Énoncé', 'Texte de l\'épreuve.'),
    ('Traiter l\'épreuve avec le prof', 'Correction de chaque exercice en 3 étapes (méthodologie pour les sujets rédactionnels).')])
screen('epreuve_new', 'Soumettre une épreuve', "Toute épreuve (CEP, BEPC, BAC, Licence pro, toutes filières) peut être soumise au prof : collée, tapée ou lue depuis une photo.", 'epreuve_new', [
    ('Niveau', 'Niveau de l\'épreuve (une liste de filières apparaît pour LICENCE).'),
    ('Matière', 'Matière (suggestions proposées).'),
    ('Titre', 'Titre libre.'),
    ('Texte de l\'épreuve', 'Énoncé. Les exercices sont détectés grâce à « Exercice 1 », « 1) », « a) »…'),
    ('Lire depuis une photo', 'Remplit le texte à partir d\'une photo (OCR).'),
    ('Partager', 'Rendre l\'épreuve visible aux autres comptes de l\'appareil (salle informatique).'),
    ('Enregistrer', 'Enregistrer sans traiter.'),
    ('Enregistrer et traiter', 'Enregistrer puis lancer la correction par le prof.')])
screen('profil', 'Profil', "Statistiques, niveau XP, abonnement et menu du compte.", 'profil', [
    ('Engrenage', 'Ouvre les Paramètres.'),
    ('Photo', 'Toucher pour changer la photo de profil.'),
    ('Statistiques', 'Leçons terminées, quiz passés, devoirs résolus, jours de suite (🔥).'),
    ('Carte Niveau', 'Niveau XP, série, badges : toucher pour ouvrir « Mes progrès ».'),
    ('Activer (Premium)', 'Saisir un code d\'activation Premium remis par l\'école / le revendeur.'),
    ('Modifier le profil', 'Changer le nom, le niveau, la filière.'),
    ('Mes progrès & badges', 'XP, niveaux, séries, badges et partage.'),
    ('Rapport pour les parents', 'Bilan imprimable des 30 derniers jours.'),
    ('Ma classe / Devoirs de classe', 'Enseignant : créer et suivre les devoirs. Élève : recevoir et rendre.'),
    ('Mes devoirs', 'Historique des devoirs.'),
    ('Aide et contact', 'Coordonnées de l\'éditeur BSH - Best Services and House (téléphone, e-mail, site web).'),
    ('Se déconnecter', 'Fermer la session (les données restent sur l\'appareil).')], maxh=225)
screen('contact', 'Aide et contact', "Accessible depuis Profil → Aide et contact (ou Paramètres → À propos → Contact). Toucher une ligne ouvre directement l'application correspondante du téléphone ou de l'ordinateur.", 'contact', [
    ('Téléphone', 'Appeler BSH au +229 01 48 52 45 90.'),
    ('E-mail', 'Écrire à contact@bestservicesandhouse.site (objet et version de l\'application pré-remplis).'),
    ('Site web', 'Ouvrir www.bestservicesandhouse.site dans le navigateur.'),
    ('Fermer', 'Fermer la fenêtre.')])
screen('notifications', 'Notifications', "Rappels de révision, succès, sécurité et nouveautés. Les non lues sont marquées d'un point rouge.", 'notifications', [
    ('Retour', 'Revenir à l\'écran précédent.'),
    ('✓', 'Tout marquer comme lu.'),
    ('Notification', 'Toucher pour la marquer comme lue.'),
    ('Corbeille', 'Supprimer la notification.')])
screen('parametres1', 'Paramètres (1/2) — Apparence et Prof IA', "Tous les réglages sont enregistrés sur l'appareil.", 'parametres1', [
    ('Thème', 'Clair, Sombre ou Automatique (suit le téléphone).'),
    ('Taille du texte', 'De 14 à 20 px pour un meilleur confort de lecture.'),
    ('Éléments par page', 'Pagination des listes : 5, 10, 20 ou 50.'),
    ('Mode du prof', 'Automatique (hors-ligne d\'abord, en ligne si nécessaire), Hors-ligne uniquement, En ligne prioritaire.'),
    ('URL de l\'API', 'Adresse d\'une API compatible OpenAI (optionnel).'),
    ('Clé API', 'Clé personnelle, stockée uniquement sur l\'appareil.'),
    ('Modèle', 'Nom du modèle (ex. gpt-4o-mini).'),
    ('Vision', 'Envoyer aussi la photo à l\'API (meilleure lecture de l\'écriture manuscrite).'),
    ('Tester', 'Vérifier la connexion à l\'API.')], maxh=225)
screen('parametres2', 'Paramètres (2/2) — Voix, rappels, sécurité, données', "Suite des réglages (en faisant défiler).", 'parametres2', [
    ('Lecture automatique', 'Lire l\'explication dès qu\'elle est prête.'),
    ('Vitesse de la voix', 'De 0,6× à 1,4×.'),
    ('Voix', 'Choisir une voix française installée sur l\'appareil.'),
    ('Écouter', 'Tester la voix.'),
    ('Caméra en direct', 'Aperçu caméra sur l\'écran Scan (sinon, appareil photo du système).'),
    ('Choisir la zone avant de lire', 'Activé : après la photo, l\'élève encadre l\'exercice à lire. Désactivé : recadrage automatique direct.'),
    ('Vibrations', 'Retour haptique (quiz, capture).'),
    ('Objectif mensuel', 'Nombre de leçons visé par mois.'),
    ('Rappel quotidien', 'Activer la notification de révision.'),
    ('Heure du rappel', 'Heure de la notification.'),
    ('Changer le mot de passe', 'Ancien + nouveau mot de passe.'),
    ('Nouveau code de récupération', 'Génère un nouveau code (l\'ancien devient invalide).'),
    ('Exporter', 'Sauvegarde complète en fichier .json.'),
    ('Importer', 'Restaurer une sauvegarde (changement de téléphone).'),
    ('Préparer', 'Télécharger le module de lecture des photos pour l\'utiliser hors-ligne.'),
    ('Effacer mes devoirs', 'Vider l\'historique des devoirs.'),
    ('Réinitialiser', 'Supprimer toutes les données de l\'appareil.')], maxh=235)

# ---------------------------------------------------------------- écrans v1.1
screen('crop', 'Choisir la zone à lire (nouveau en 1.1)', "Après la photo, RSuta propose d'encadrer l'exercice voulu : pratique quand la page contient plusieurs exercices ou des ratures. Le recadrage et le redressement d'une photo prise de travers sont aussi automatiques.", 'crop', [
    ('Consigne', 'Rappelle comment encadrer la zone.'),
    ('Photo', 'Glisser le doigt (ou la souris) sur la photo pour tracer un cadre.'),
    ('Zone choisie', 'Cadre jaune : seule cette partie sera lue.'),
    ('Annuler', 'Revenir à la caméra sans lire.'),
    ('Lire tout', 'Lire toute la page : RSuta recadre et redresse la photo tout seul.'),
    ('Lire la zone', 'Lire uniquement la partie encadrée.')], tip="Cette étape peut être supprimée dans Paramètres → Voix et caméra → « Choisir la zone avant de lire ».")
screen('verify', 'Saisie au clavier mathématique (nouveau en 1.1)', "Lorsqu'on tape un exercice (ou qu'on corrige le texte lu), un clavier de symboles mathématiques s'affiche sous la zone de texte. Le même clavier est disponible dans le chat (bouton √x) et pendant l'examen blanc.", 'verify', [
    ('Énoncé', 'Texte de l\'exercice, modifiable.'),
    ('Clavier mathématique', '30 touches : x, y, ², ³, puissance, √, π, fraction, parenthèses, =, ≤, ≥, ≠, ×, ÷, ±, ∞, i, intervalle, sin, cos, tan, ln, eˣ, ∫, lim, uₙ, →, %. Faire défiler le clavier pour voir toutes les touches ; les fonctions placent le curseur entre les parenthèses.'),
    ('Niveau', 'Niveau utilisé pour adapter l\'explication.'),
    ('Résoudre ✨', 'Envoie l\'énoncé au Prof IA.')])
screen('result_graph', 'Résultat avec courbe (nouveau en 1.1)', "Les corrections affichent maintenant les formules proprement (fractions, racines, exposants) et, quand c'est utile, une courbe ou un tableau : étude de fonction, tableau de variations, statistiques…", 'result_graph', [
    ('Graphique', 'Courbe tracée automatiquement, avec axes gradués et points remarquables.'),
    ('Courbe', 'Représentation de la fonction étudiée ; les extremums trouvés à l\'étape 2 s\'y lisent directement.')])
screen('home_rev', 'Accueil — carte « Révision » (nouveau en 1.1)', "Sur l'Accueil, une carte rappelle le compte à rebours avant l'examen et la tâche du jour du plan de révision.", 'home_rev', [
    ('J-…', 'Nombre de jours avant l\'examen du niveau (date modifiable dans « Mon plan »).'),
    ('Plan du jour', 'Chapitre à réviser aujourd\'hui (ou examen blanc express le 7e jour).'),
    ('Commencer', 'Ouvre la fiche du chapitre du jour (ou crée le plan s\'il n\'existe pas encore).'),
    ('Cartes', 'Nombre de cartes mémoire à revoir aujourd\'hui ; ouvre la session.'),
    ('Réviser', 'Ouvre le module Réviser.')])
screen('revision', 'Réviser — tableau de bord (nouveau en 1.1)', "Le module Réviser prépare l'élève à l'examen : diagnostic, plan jour par jour, fiches, cartes mémoire, examens blancs et suivi des points faibles. Accessible depuis l'Accueil ou le menu.", 'revision', [
    ('Compte à rebours', 'Jours restants avant l\'examen (CEP, BEPC, BAC ou Licence).'),
    ('Mon plan', 'Ouvre le plan de révision.'),
    ('Indicateurs', 'Maîtrise moyenne, cartes du jour, note du dernier examen blanc.'),
    ('Diagnostic', 'Test rapide couvrant toutes les matières du niveau.'),
    ('Mon plan', 'Un chapitre par jour jusqu\'à l\'examen.'),
    ('Examen blanc', 'Sujet chronométré noté sur 20 (complet ou express).'),
    ('Fiches', 'L\'essentiel de chaque chapitre, formules et pièges.'),
    ('Cartes mémoire', 'Révision par répétition espacée (méthode Leitner).'),
    ('Points faibles', 'Chapitres et matières à retravailler en priorité.')])
screen('diag', 'Diagnostic', "Jusqu'à 12 questions tirées de toutes les matières du niveau, à faire sans le cours.", 'diag', [
    ('Présentation', 'Nombre de questions et consigne.'),
    ('Matière', 'Matière de la question.'),
    ('Réponse', 'Cocher une réponse ; « Voir mon diagnostic » (en bas) calcule le résultat.')])
screen('diag_r', 'Résultat du diagnostic', "Score global et score par matière, de la plus faible à la plus forte.", 'diag_r', [
    ('Score global', 'Pourcentage de bonnes réponses.'),
    ('Par matière', 'Barre rouge (< 50 %), orange (50-75 %) ou verte (≥ 75 %).'),
    ('Refaire', 'Nouveau tirage de questions.'),
    ('Générer mon plan', 'Crée le plan de révision en commençant par les matières faibles.')])
screen('plan', 'Mon plan de révision', "Un chapitre par jour jusqu'à la date de l'examen ; les chapitres faibles reviennent deux fois plus souvent et un examen blanc express est prévu chaque 7e jour.", 'plan', [
    ('Date de l\'examen', 'Date indicative pré-remplie, à vérifier sur le calendrier officiel du ministère.'),
    ('Enregistrer', 'Enregistre la date ; le compte à rebours se met à jour.'),
    ('Indicateurs', 'Jours faits, jours restants, nombre d\'examens blancs prévus.'),
    ('Aujourd\'hui', 'La journée en cours est encadrée en jaune.'),
    ('Réviser / Passer', 'Ouvre la fiche du chapitre (ou l\'examen blanc).'),
    ('Case', 'Marquer la journée comme faite.'),
    ('Pages', 'Le plan est paginé.'),
    ('Recalculer le plan', 'Refait le plan selon les derniers résultats (quiz, cartes, examens).')], maxh=228)
screen('fiches', 'Fiches de révision', "Une fiche pour chacun des %d chapitres : l'essentiel à retenir, le formulaire, les pièges à éviter et des cartes mémoire." % FIG['fiches'], 'fiches', [
    ('Niveaux', 'Choisir CEP, BEPC, BAC ou LICENCE.'),
    ('Matière', 'Filtrer par matière.'),
    ('Recherche', 'Retrouver une fiche par son titre.'),
    ('Fiche', 'Ouvrir la fiche (nombre de cartes indiqué).'),
    ('Pages', 'Liste paginée.')])
screen('fiche', 'Lire une fiche', "La fiche tient sur un écran : à relire la veille d'un devoir ou d'un examen.", 'fiche', [
    ('Haut-parleur', 'Écouter la fiche à voix haute.'),
    ('Matière • niveau', 'Rappel du chapitre.'),
    ('L\'essentiel', 'Les points du cours à connaître.'),
    ('Formulaire', 'Formules et définitions clés.'),
    ('Pièges à éviter', 'Les erreurs les plus fréquentes en copie.'),
    ('Cartes mémoire', 'Aperçu : toucher une question pour voir la réponse.'),
    ('Réviser les cartes', 'Session de cartes du chapitre.'),
    ('Quiz du chapitre', 'S\'entraîner sur le quiz.'),
    ('Leçons', 'Revenir aux leçons du chapitre.'),
    ('Imprimer', 'Imprimer la fiche (ou l\'enregistrer en PDF).')], maxh=235)
screen('cartes', 'Cartes mémoire (répétition espacée)', "Chaque carte pose une question ; l'élève répond dans sa tête puis retourne la carte. Une carte sue passe dans la boîte suivante et revient plus tard (1, 2, 4, 8 puis 16 jours) ; une carte ratée revient dès le lendemain. %d cartes au total, 10 nouvelles par jour au maximum." % FIG['cartes'], 'cartes', [
    ('Boîtes', 'Nombre de cartes dans chaque boîte et délai avant la prochaine révision.'),
    ('Score', 'Cartes sues et à revoir pendant la session.'),
    ('Progression', 'Avancement dans la session du jour.'),
    ('Question', 'Toucher la carte pour la retourner.'),
    ('Réponse', 'La réponse apparaît une fois la carte retournée.'),
    ('À revoir', 'La carte revient demain.'),
    ('Je savais', 'La carte passe dans la boîte suivante.')])
screen('examen', 'Examen blanc', "Deux formats, notés sur 20 avec mention. Les sujets sont générés à partir du programme (sujets types non officiels).", 'examen', [
    ('Examen blanc', 'Conditions réelles : 10 questions, durée selon le niveau.'),
    ('Express', '5 questions en 20 minutes.'),
    ('Règles', 'Sans cours ; copie ramassée automatiquement à la fin du temps. Mes examens : historique des notes.')])
screen('examen_go', 'Pendant l\'examen', "Le chrono continue même si l'on quitte l'écran ou ferme l'application : l'examen reprend où on l'a laissé.", 'examen_go', [
    ('Temps restant', 'Chronomètre (reste visible en haut).'),
    ('Rendre ma copie', 'Terminer avant la fin du temps (confirmation demandée).'),
    ('Barème', 'Points de la question.'),
    ('Énoncé', 'Question générée selon le programme du niveau.'),
    ('Réponse', 'Valeur ou expression ; plusieurs solutions séparées par « ; ».'),
    ('√x', 'Clavier mathématique.')], maxh=228)
screen('examen_r', 'Résultat de l\'examen blanc', "Note sur 20 (au quart de point), mention et correction de chaque question.", 'examen_r', [
    ('Note', 'Note /20, mention et nombre de bonnes réponses.'),
    ('Correction', 'Ta réponse et la réponse attendue pour chaque question (✅ / ❌).'),
    ('Correction détaillée', 'Explication complète du Prof IA en 3 étapes.'),
    ('Mes points faibles', 'Voir ce qu\'il faut retravailler.'),
    ('Nouvel examen', 'Recommencer.')], maxh=228)
screen('faiblesses', 'Points faibles', "Calculé automatiquement à partir du diagnostic, des quiz, des cartes et des examens blancs.", 'faiblesses', [
    ('Par matière', 'Taux de réussite de chaque matière.'),
    ('Chapitre', 'Chapitres du moins réussi au plus réussi, avec boutons Fiche et Quiz.'),
    ('Jauge', 'Rouge < 50 %, orange 50-75 %, vert ≥ 75 %.')])
screen('progres', 'Mes progrès (XP, niveaux, séries, badges)', "Chaque activité rapporte des points XP. Les XP font monter de niveau (10 niveaux, de Débutant à Légende), chaque jour actif prolonge la série 🔥 et des badges se débloquent automatiquement. Tout est calculé sur l'appareil. Accessible : Profil → « Mes progrès & badges », ou carte XP du Profil, ou repère « Mes progrès » du menu latéral.", 'progres', [
    ('Carte Niveau', 'Niveau actuel, XP totaux et progression vers le niveau suivant.'),
    ('Série actuelle', 'Jours d\'affilée avec au moins une activité : recule à zéro si un jour passe sans activité.'),
    ('Badge obtenu', '20 badges : première leçon, 100 % à un quiz, 7 jours de suite, 500 XP, etc.'),
    ('Conseil du jour', 'Rappelle la série en cours (« ne la perds pas ! »).'),
    ('Carte d\'activité', '12 dernières semaines : un carré bleu par jour actif.'),
    ('Badge remporté', 'En couleur, avec la date d\'obtention.'),
    ('Badge à gagner', 'En gris avec le défi à accomplir pour l\'obtenir.'),
    ('D\'où viennent mes XP ?', 'Tableau : chaque type d\'activité, le nombre et les XP gagnés.'),
    ('Partager ma progression', 'Dessine une image carrée (1080 × 1080) du niveau à envoyer sur les réseaux.'),
    ('Rapport pour les parents', 'Ouvre le bilan imprimable des 30 derniers jours.')], maxh=225)
screen('partage', 'Partager un résultat en image', "Sur le résultat d'un exercice, d'un quiz, d'un examen blanc ou depuis « Mes progrès », le bouton Partager dessine une jolie image carrée avec le score et le logo RSuta, prête pour WhatsApp, Facebook ou TikTok. Sur téléphone récent, le menu de partage du système s'ouvre directement ; sinon, cette fenêtre apparaît.", 'partage', [
    ('Aperçu de l\'image', 'La carte 1080 × 1080 pixels générée : niveau, XP, série et badges.'),
    ('Mode d\'emploi', 'Rappelle comment envoyer l\'image sur les réseaux sociaux.'),
    ('Fermer', 'Refermer sans partager.'),
    ('WhatsApp', 'Ouvre WhatsApp avec un message déjà rédigé (joindre l\'image téléchargée).'),
    ('Télécharger', 'Enregistre l\'image PNG sur l\'appareil, puis l\'envoyer comme n\'importe quelle photo.')], maxh=225)
screen('rapport', 'Rapport pour les parents', "Depuis « Mes progrès » (ou Profil), ce bilan des 30 derniers jours se présente comme un bulletin : activité jour par jour, maîtrise par matière, points forts et points à retravailler, conseils d'accompagnement. Le bouton Imprimer produit une version papier soignée (ou un PDF).", 'rapport', [
    ('Élève et niveau', 'Identité, niveau suivi et date de génération du rapport.'),
    ('Jours actifs', 'Nombre de jours avec au moins une activité sur 30 : la régularité avant tout.'),
    ('Quiz (moyenne /20)', 'Nombre de quiz passés et score moyen sur la période.'),
    ('Devoirs de classe rendus', 'Devoirs remis par l\'enseignant, terminés dans RSuta.'),
    ('Graphique d\'activité', 'Nombre d\'activités par jour : les trous montrent les absences.'),
    ('Maîtrise par matière', 'Taux de réussite moyen par matière, du meilleur au plus faible.'),
    ('Lecture détaillée', 'Points forts, points à retravailler, examens blancs, badges, conseils pour les parents.'),
    ('Imprimer / PDF', 'Imprime le rapport seul (menus masqués automatiquement) ou l\'enregistre en PDF.')])
screen('exos', 'Exercices interactifs d\'un chapitre', "Chaque chapitre possède désormais des exercices à faire directement dans l'application (bouton « Exercices interactifs » sur la page du chapitre) : textes à trous avec banque de mots, étapes à remettre dans l'ordre, paires à associer, et un exercice d'application généré à l'infini. Chaque réussite rapporte des XP.", 'exos', [
    ('Score du chapitre', 'Réussis / vérifiés ; refaire les exercices en rouge.'),
    ('Question (remise en ordre)', 'Consigne de l\'exercice d\'ordre.'),
    ('Mot de la banque', 'Toucher pour l\'ajouter à la suite construite.'),
    ('Suite en construction', 'Les étapes placées ; toucher l\'une pour la retirer.'),
    ('Question (texte à trous)', 'Énoncé avec des cases à compléter.'),
    ('Case remplie', 'Toucher pour vider et remettre le mot dans la banque.'),
    ('Case vide', 'Toucher d\'abord un mot de la banque, puis la case.'),
    ('Mot disponible', 'Les bons mots et des leurs.'),
    ('Vérifier', 'Valide les réponses : vert = juste, rouge = à corriger (la correction s\'affiche).'),
    ('Effacer', 'Recommencer l\'exercice.'),
    ('Exercice d\'application', 'Généré par le moteur : il change à chaque visite.'),
    ('Champ de réponse', 'Saisir la réponse (fractions et décimaux acceptés).'),
    ('Vérifier', 'Contrôle immédiat ; un bouton « Solution » affiche la correction détaillée du prof.')])
screen('classe', 'Ma classe (enseignant)', "Les comptes « Enseignant » (case à l'inscription, ou rôle donné par l'administrateur) trouvent « Ma classe » dans le menu latéral. On y crée les classes et l'on suit tous les devoirs sans serveur ni connexion : les devoirs et les copies voyagent par code, QR code ou fichier.", 'classe', [
    ('Nouvelle classe', 'Créer une classe : nom (ex. 3e A), établissement, niveau.'),
    ('Astuce', 'Comment partager un devoir sans internet.'),
    ('Classe', 'La classe avec le nombre de devoirs ; toucher pour l\'ouvrir.')])
screen('classe_devoirs', 'Classe et ses devoirs', "La page d'une classe liste les devoirs publiés avec, pour chacun, le nombre de copies reçues et la moyenne.", 'classe_devoirs', [
    ('Nouveau devoir', 'Ouvre le formulaire de préparation.'),
    ('Devoir', 'Titre, nombre d\'exercices, durée, date limite.'),
    ('Icône', 'Identifie visuellement le devoir.'),
    ('Bilan rapide', 'Copies reçues et moyenne sur 20.')])
screen('devoir_form', 'Préparer un devoir', "Le devoir peut contenir des exercices saisis (avec ou sans correction automatique : ajouter « || réponse attendue » après l'énoncé) et des exercices générés par le moteur (équations, fractions, Pythagore, puissances, etc.), avec un chrono et une date limite.", 'devoir_form', [
    ('Titre', 'Ce que verront les élèves.'),
    ('Durée', 'Minutes ; 0 = sans limite.'),
    ('À rendre avant le', 'Date limite affichée aux élèves.'),
    ('Consignes', 'Facultatives (ex. justifier chaque étape).'),
    ('Zone de saisie d\'un exercice', 'Énoncé ; « || reponse » active la correction automatique.'),
    ('Ajouter l\'exercice', 'Insère l\'exercice dans la liste du devoir.'),
    ('Type d\'exercice généré', 'Liste des générateurs disponibles.'),
    ('Nombre', 'Combien générer.'),
    ('Générer', 'Crée les exercices avec correction automatique.'),
    ('Exercices ajoutés', 'Aperçu avec le type de correction.'),
    ('Retirer', 'Supprimer un exercice de la liste.'),
    ('Publier et partager', 'Finalise le devoir et affiche immédiatement le code / le QR code.')])
screen('devoir_code', 'Partager le devoir (code, QR, fichier)', "Aucun réseau n'est nécessaire : le devoir complet est contenu dans ce code (compact, vérifié anti-erreur). Trois supports au choix.", 'devoir_code', [
    ('QR code', 'À projeter au tableau : les élèves le scannent dans RSuta. La photo du tableau avec un autre téléphone fonctionne aussi.'),
    ('Code texte', 'À recopier au tableau ou dicter : commence par RSD1.'),
    ('Copier', 'Le code dans le presse-papiers.'),
    ('Fichier', 'Télécharge un fichier .rsuta à déposer sur n\'importe quel support (clé, Drive, Bluetooth).'),
    ('WhatsApp', 'Ouvre un message prêt à envoyer à un groupe d\'élèves.')], maxh=225)
screen('devoir_detail', 'Résultats du devoir', "Après avoir importé les codes de copie des élèves (en masse, scanner ou fichiers), tout est chiffré : moyenne, réussite par exercice, export Excel/CSV.", 'devoir_detail', [
    ('Copies', 'Nombre de copies importées.'),
    ('Moyenne /20', 'Moyenne des notes à correction automatique.'),
    ('≥ 10/20', 'Pourcentage de copies au-dessus de la moyenne.'),
    ('Code / QR du devoir', 'Renvoyer l\'accès au devoir.'),
    ('Importer des copies', 'Coller plusieurs codes (RSR1…), scanner un QR, ou charger des fichiers — les doublons sont ignorés.'),
    ('Exporter (Excel/CSV)', 'Fichier CSV avec une ligne par copie et une colonne par exercice : s\'ouvre directement dans Excel.'),
    ('Copie d\'élève', 'Nom, note, résultat exercice par exercice (✅ ❌ ✍️), temps passé, date de rendu.'),
    ('Retirer', 'Supprimer une copie importée par erreur.')])
screen('devoir_import', 'Importer des copies', "Les élèves rendent chacun leur « code de copie » (RSR1…) : on peut tout coller d'un coup — mots autour acceptés —, ou importer autrement.", 'devoir_import', [
    ('Zone de collage', 'Un ou plusieurs codes de copie (ex. tous les messages WhatsApp reçus).'),
    ('Aide', 'Rappel du format attendu.'),
    ('Fichiers', 'Charger un ou plusieurs fichiers .rsuta de copies.'),
    ('QR code', 'Scanner le QR affiché sur le téléphone de l\'élève.'),
    ('Importer', 'Lance l\'import : copies ajoutées, doublons signalés.')])
screen('classe_eleve', 'Devoirs de classe (élève)', "La porte d'entrée de l'élève : coller le code reçu, scanner le QR code affiché en classe ou ouvrir un fichier .rsuta.", 'classe_eleve', [
    ('Zone de collage', 'Sert aussi bien au code pur qu\'au message WhatsApp complet.'),
    ('Valider le code', 'Enregistre le devoir sur l\'appareil (un même devoir n\'est reçu qu\'une fois).'),
    ('Scanner le QR', 'Utilise la caméra.'),
    ('Fichier .rsuta', 'Charger le fichier reçu.')])
screen('recu', 'Devoir reçu', "Récapitulatif avant de commencer : nombre d'exercices, durée, date limite, consignes.", 'recu', [
    ('Commencer le devoir', 'Le chrono démarre ; après le début, plus moyen de se tromper par inadvertance : rendre fige la copie.'),
    ('Durée', 'Limite du devoir (∞ = libre).'),
    ('Titre et consignes', 'Ce que l\'enseignant a demandé.')])
screen('copie', 'Composer le devoir', "Un exercice = une carte avec son champ de réponse. Un chrono décompte en haut d'écran si une durée est prévue ; à la fin du temps, la copie est ramassée automatiquement.", 'copie', [
    ('Barre de temps', 'Reste visible pendant le devoir ; vire à l\'orange à 5 minutes.'),
    ('Temps restant', 'Minutes : secondes.'),
    ('Exercice', 'Énoncé tel que préparé par l\'enseignant.'),
    ('Champ de réponse', 'Tout est enregistré au fur et à mesure, même sans valider.'),
    ('Rendre ma copie', 'Confirmation demandée ; la note de correction automatique s\'affiche aussitôt.')])
screen('rendu', 'Copie rendue', "Dès le rendu, RSuta note ce qui est notifiable automatiquement et calcule une note ; le reste attend la vérification de l'enseignant. La correction (réponse attendue) est affichée, et le bouton « Explication » donne la solution détaillée du prof.", 'rendu', [
    ('Note /20', 'Sur la partie à correction automatique.'),
    ('Récapitulatif', 'Réponses justes / vérifiées ; rédactions à vérifier par l\'enseignant.'),
    ('Bandeau d\'envoi', 'Rappelle comment transmettre la copie.'),
    ('Code & QR de ma copie', 'Affiche le code RSR1… et son QR pour l\'enseignant (WhatsApp : message prêt à envoyer).'),
    ('Explication', 'Le prof refuse l\'exercice en 3 étapes.')])
screen('copie_qr', 'Envoyer sa copie à l\'enseignant', "Même logique que pour le devoir : code, QR code ou fichier, sans internet.", 'copie_qr', [
    ('QR code', 'Montrer à l\'enseignant qui scanne depuis « Importeur des copies ».'),
    ('Code texte', 'À copier-coller ; commence par RSR1.'),
    ('Copier', 'Le code dans le presse-papiers.'),
    ('Fichier', 'Télécharge la copie en .rsuta.')], maxh=225)
screen('changelog', 'Historique des versions', "Paramètres → À propos → « Nouveautés » : liste des changements de chaque version de RSuta.", 'changelog', [
    ('Version actuelle 1.2.0', 'Nouveautés de la version actuelle.'),
    ('Versions précédentes', 'Chaque version avec ses nouveautés (1.1.0, 1.0.0).'),
    ('Fermer', 'Revenir aux paramètres.')])
ORDER = ['login', 'register', 'forgot', 'home', 'home_bas', 'home_rev', 'cours', 'matiere', 'chapitre', 'lecon', 'quiz', 'quiz_play', 'scan', 'crop', 'ocr_verif', 'verify', 'flou', 'result', 'result_graph', 'result_suite', 'result_epreuve', 'devoirs', 'chat',
         'revision', 'diag', 'diag_r', 'plan', 'fiches', 'fiche', 'cartes', 'examen', 'examen_go', 'examen_r', 'faiblesses',
         'epreuves', 'epreuve', 'epreuve_new', 'progres', 'partage', 'rapport', 'exos', 'classe', 'classe_devoirs', 'devoir_form', 'devoir_code', 'devoir_detail', 'devoir_import', 'profil', 'contact', 'notifications', 'parametres1', 'parametres2', 'classe_eleve', 'recu', 'copie', 'rendu', 'copie_qr', 'changelog']
_ids = [x[0] for x in SCREENS]; assert sorted(_ids) == sorted(ORDER), set(_ids) ^ set(ORDER)
SCREENS.sort(key=lambda x: ORDER.index(x[0]))


def admin_section():
    rows = [('Administration', 'Menu réservé aux comptes administrateurs.'), ('Statistiques', 'Comptes, devoirs, quiz joués, épreuves soumises.'),
            ('Recherche', 'Retrouver un utilisateur.'), ('Ajouter', 'Créer un compte (le code de récupération est affiché).'),
            ('Cadenas', 'Générer un mot de passe temporaire pour un élève qui a tout oublié.'), ('Bouclier', 'Donner / retirer le rôle administrateur.'),
            ('Pause / Lecture', 'Suspendre / réactiver un compte.'), ('Corbeille', 'Supprimer le compte et ses données.')]
    return f'<section class="page"><h2 id="s-admin">Administration (ordinateur)</h2><p>Accessible avec le compte <b>admin@rsuta.bj</b> / <b>RSuta@2026</b>. Idéal pour un enseignant ou une salle informatique : gestion des comptes et des épreuves soumises par les élèves.</p>{desk("admin")}{table(rows)}</section>'



# ---------------------------------------------------------------- historique (lu dans app.js) + fiche technique
_cl_js = "const s=require('fs').readFileSync(process.argv[1],'utf8');const m=s.match(/const CHANGELOG = (\\[[\\s\\S]*?\\n  \\]);/);console.log(JSON.stringify(eval(m[1])))"
CHANGELOG = json.loads(subprocess.run(['node', '-e', _cl_js, APP + 'js/app.js'], capture_output=True, text=True, check=True).stdout)
assert CHANGELOG[0]['v'] == VER, 'Historique des versions non à jour dans app.js'
TECH_NOTES = {  # détails techniques propres au guide (complètent la liste affichée dans l'application)
    '1.2.0': ['Codes de devoirs et de copies auto-suffisants (JSON compressé XOR + somme de contrôle FNV), aucun serveur requis ; QR codes générés et scannés localement (qrcode-generator, jsQR)',
              'Correction automatique par les solveurs existants ; copie avec chrono et ramassage automatique à l\'heure',
              'Moteur hors-ligne : %d solveurs et %d générateurs, dont dynamique (lois de Newton) et dipôles RC/RL en 1.2' % (FIG['solveurs'], FIG['generateurs']),
              'Motivation : XP comptabilisés par activité (tentatives, leçons, devoirs…), 10 niveaux, 20 badges, séries ; stockage local uniquement',
              'Base de données : %d tables dont 4 nouvelles (classes, classe_devoirs, classe_recus, classe_resultats)' % FIG['tables'],
              'Banque de sujets types portée à %d ; exercices corrigés ajoutés à chacun des chapitres' % FIG['epreuves'],
              'Export CSV séparateur « ; » avec BOM UTF-8 (ouverture directe dans Excel, accents préservés)'],
    '1.1.0': ['Moteur hors-ligne : %d solveurs et %d générateurs d\'exercices (contre 17 solveurs en 1.0)' % (FIG['solveurs'], FIG['generateurs']),
              'Lecture des photos (OCR) v1.1 : détection de la feuille, redressement (±15°), seuillage d\'Otsu, seconde passe si la confiance est faible',
              'Base de données : 4 nouvelles tables (tentatives, plans, cartes, examens) + diagnostics',
              'Banque de sujets types portée de 18 à %d (mention « non officiel » sur chaque sujet)' % FIG['epreuves'],
              'Nouveau réglage « Choisir la zone avant de lire » ; « Nouveautés » dans Paramètres → À propos',
              'Suite de tests automatisés : %d tests du moteur + 5 parcours d\'interface' % FIG['tests'],
              'Montant avec espaces (« 1 250 000 F ») et grands nombres décimaux affichés avec séparateur de milliers'],
    '1.0.0': ['17 solveurs hors-ligne, OCR Tesseract français, Prof IA en ligne optionnel (API compatible OpenAI)', '18 sujets types, 61 chapitres, 130 leçons, 256 questions']}


def hist_section():
    rows = ''.join(f'<div class="vers"><div class="vh"><b>Version {E(v["v"])}</b><span>{E(v["d"])}</span>{"<em>version actuelle</em>" if i == 0 else ""}</div><ul>' + ''.join(f'<li>{E(x)}</li>' for x in v['items']) + '</ul>'
                   + (('<p class="small"><b>Détails techniques</b></p><ul class="small">' + ''.join(f'<li>{E(x)}</li>' for x in TECH_NOTES[v['v']]) + '</ul>') if v['v'] in TECH_NOTES else '') + '</div>' for i, v in enumerate(CHANGELOG))
    return f'<section class="page"><h2 id="s-hist">12. Historique des versions</h2><p>Chaque mise à jour de RSuta est accompagnée de la mise à jour de ce guide et de sa fiche technique. Le même historique est consultable dans l\'application : <b>Paramètres → À propos → Nouveautés</b>.</p>{rows}</section>'


def fiche_section():
    F = FIG; cp = F['chapParNiv']; ep = F['epParNiv']
    def tr(a, b): return f'<tr><td style="width:34%"><b>{a}</b></td><td>{b}</td></tr>'
    t1 = ''.join([tr('Nom', 'RSuta — Ton prof IA qui ne dort pas'), tr('Version', f'{VER} ({F["mois"]})'), tr('Éditeur', 'BSH - Best Services and House • +229 01 48 52 45 90 • contact@bestservicesandhouse.site • www.bestservicesandhouse.site'),
                  tr('Public', 'Élèves et étudiants du Bénin : CEP, BEPC, BAC, Licence professionnelle (toutes filières) ; enseignants et parents'), tr('Langue', 'Français'),
                  tr('Plateformes', 'Web / PWA installable (Chrome, Edge, Firefox, Safari récents) • Windows 10/11 64 bits (Electron 31) • Android 5.1+ et iOS 13+ (Capacitor 6)'),
                  tr('Connexion internet', 'Facultative : tout fonctionne hors-ligne ; internet sert uniquement au mode « Prof en ligne » optionnel'),
                  tr('Technologies', 'HTML5, CSS3, JavaScript sans framework • IndexedDB / stockage local • Service Worker (cache hors-ligne) • Tesseract.js 5.1.1 (OCR français embarqué) • Web Speech API (voix et dictée)'),
                  tr('Sécurité', 'Mots de passe hachés SHA-256 salés • données stockées uniquement sur l\'appareil • code de récupération • rôle administrateur'),
                  tr('Taille de l\'application', f'{F["app_mo"]} Mo (dont le module OCR et sa langue française) • {F["js_files"]} fichiers JavaScript, {F["js_lines"]:,} lignes • {F["css_lines"]:,} lignes de CSS'.replace(',', ' '))])
    t2 = ''.join([tr('Niveaux', str(F['niveaux'])), tr('Matières', str(F['matieres'])), tr('Chapitres', f'{F["chapitres"]} (CEP {cp.get("CEP", 0)} • BEPC {cp.get("BEPC", 0)} • BAC {cp.get("BAC", 0)} • Licence {cp.get("LICENCE", 0)})'),
                  tr('Leçons', str(F['lecons'])), tr('Quiz / questions', f'{F["quiz"]} quiz • {F["questions"]} questions'), tr('Filières de Licence pro', str(F['filieres'])),
                  tr('Sujets types (non officiels)', f'{F["epreuves"]} (CEP {ep.get("CEP", 0)} • BEPC {ep.get("BEPC", 0)} • BAC {ep.get("BAC", 0)} • Licence {ep.get("LICENCE", 0)}) — conformes au programme, ils ne reproduisent pas d\'annales officielles'),
                  tr('Fiches de révision', f'{F["fiches"]} fiches • {F["cartes"]} cartes mémoire'),
                  tr('Moteur de résolution hors-ligne', f'{F["solveurs"]} solveurs • {F["generateurs"]} générateurs d\'exercices similaires • explication en 3 étapes adaptée au niveau'),
                  tr('Base de données', f'{F["tables"]} tables locales + référentiel (niveaux, matières, chapitres, leçons, quiz, questions)'),
                  tr('Tests automatisés', f'{F["tests"]} tests du moteur ({"tous réussis" if F["tests_ko"] == 0 else str(F["tests_ko"]) + " échec(s)"}) + parcours d\'interface automatisés (connexion, scan, chat, quiz, révision, examen, hors-ligne, administration)')])
    return (f'<section class="page"><h2 id="s-fiche">11. Fiche technique</h2><p class="small">Chiffres calculés automatiquement à partir du code de la version {VER} lors de la génération de ce document ({F["date"]}).</p>'
            f'<div class="kpi"><div><b>{F["chapitres"]}</b><span>chapitres</span></div><div><b>{F["lecons"]}</b><span>leçons</span></div><div><b>{F["questions"]}</b><span>questions</span></div><div><b>{F["epreuves"]}</b><span>sujets types</span></div><div><b>{F["fiches"]}</b><span>fiches</span></div><div><b>{F["cartes"]}</b><span>cartes</span></div></div>'
            f'<h4>Identification et environnement</h4><table class="std"><tbody>{t1}</tbody></table><h4>Contenus et moteur</h4><table class="std"><tbody>{t2}</tbody></table></section>')


CSS = open(os.path.expanduser('~/rsuta/docs/guide.css')).read()
font1 = b64(APP + 'fonts/inter-latin-wght-normal.woff2', 'font/woff2'); font2 = b64(APP + 'fonts/inter-latin-ext-wght-normal.woff2', 'font/woff2')
CSS = CSS.replace('FONT1', font1).replace('FONT2', font2)
LOGO = '<svg width="54" height="54" viewBox="0 0 40 40" fill="none" stroke="#fff" stroke-width="1.8"><rect x="2" y="2" width="36" height="36" rx="3"/><path d="M2 2l36 36M38 2 2 38M20 2v36M2 20h36"/><path d="M20 6 34 20 20 34 6 20z"/><path d="M20 12 28 20 20 28 12 20z" fill="#f8c42f" stroke="#f8c42f"/></svg>'
PATTERN = '<svg class="pat" width="100%" height="100%"><defs><pattern id="gp" width="64" height="40" patternUnits="userSpaceOnUse"><g fill="none" stroke="#fff" stroke-width="1.6"><path d="M0 20 8 8l8 12 8-12 8 12 8-12 8 12 8-12 8 12"/><path d="M0 36h64M0 4h64" stroke-dasharray="4 4"/></g></pattern></defs><rect width="100%" height="100%" fill="url(#gp)"/></svg>'

EDBOX = '''<div class="edbox"><div class="edlogo">BSH</div><div><b>Éditeur : BSH - Best Services and House</b><br>
📞 <a href="tel:+2290148524590">+229 01 48 52 45 90</a> &nbsp;•&nbsp; ✉️ <a href="mailto:contact@bestservicesandhouse.site">contact@bestservicesandhouse.site</a> &nbsp;•&nbsp; 🌐 <a href="https://www.bestservicesandhouse.site">www.bestservicesandhouse.site</a><br>
<span class="small">© 2026 BSH - Best Services and House. Tous droits réservés. RSuta est une marque de BSH.</span></div></div>'''
parts = []
# Couverture
parts.append(f'''<section class="cover">{PATTERN}<div class="cv-in"><div class="brand">{LOGO}<span>RSuta</span><em>✦</em></div>
<h1>Présentation &amp; Guide d'utilisation</h1><p class="tag">Ton prof IA qui ne dort pas — CEP • BEPC • BAC • Licence professionnelle</p>
<div class="cv-ph">{phone("clean_home", 58)}{phone("clean_result", 58, 120)}</div>
<div class="cv-ed">Édité par <b>BSH - Best Services and House</b><br><span>+229 01 48 52 45 90 • contact@bestservicesandhouse.site • www.bestservicesandhouse.site</span></div>
<div class="cv-foot"><span>Version {VER} — {FIG["mois"]}</span><span>Web • Windows • Android • iOS</span><span>Fonctionne hors-ligne</span></div></div></section>''')
# Sommaire
toc = [('s-pres', '1. Présentation de RSuta'), ('s-fonc', '2. Fonctionnalités'), ('s-arch', '3. Architecture technique'), ('s-bdd', '4. Base de données'), ('s-inst', '5. Installation et premiers pas'), ('s-guide', '6. Guide des interfaces, bouton par bouton')]
toc += [('g-' + s[0], '&nbsp;&nbsp;&nbsp;&nbsp;6.%d %s' % (i + 1, E(s[1]))) for i, s in enumerate(SCREENS)]
toc += [('s-admin', '&nbsp;&nbsp;&nbsp;&nbsp;6.%d Administration' % (len(SCREENS) + 1)), ('s-prof', '7. Le Prof IA : fonctionnement'), ('s-multi', '8. Ordinateur, tablette et thème sombre'), ('s-faq', '9. Questions fréquentes et dépannage'), ('s-lim', '10. Limites et évolutions'), ('s-fiche', '11. Fiche technique'), ('s-hist', '12. Historique des versions')]
parts.append('<section class="page"><h2>Sommaire</h2><ol class="toc">' + ''.join(f'<li><a href="#{a}">{b}</a></li>' for a, b in toc) + '</ol>' + EDBOX + '</section>')
parts.append(open(os.path.expanduser('~/rsuta/docs/guide_intro.html')).read()
             .replace('{{DESK_HOME}}', desk('desk_home')).replace('{{PH_SCAN}}', phone('scan', 34, 72)).replace('{{PH_RESULT}}', phone('home', 34, 72)).replace('{{VER}}', VER)
             .replace('{{N_CHAP}}', str(FIG['chapitres'])).replace('{{N_LEC}}', str(FIG['lecons'])).replace('{{N_QUEST}}', str(FIG['questions'])).replace('{{N_EP}}', str(FIG['epreuves'])).replace('{{N_FIL}}', str(FIG['filieres'])).replace('{{N_QUIZ}}', str(FIG['quiz'])).replace('{{N_FICHES}}', str(FIG['fiches'])).replace('{{N_CARTES}}', str(FIG['cartes'])).replace('{{N_SOLV}}', str(FIG['solveurs'])).replace('{{N_GEN}}', str(FIG['generateurs'])).replace('{{PH_REV}}', phone('revision', 34, 72)).replace('{{PH_EXAM}}', phone('examen_r', 34, 72)))
parts.append('<section class="page sect"><h2 id="s-guide">6. Guide des interfaces, bouton par bouton</h2><p>Chaque capture ci-dessous provient de l\'application réelle. Les <span class="num">1</span> numéros rouges renvoient au tableau placé à côté de la capture. La barre de navigation du bas (Accueil • Cours • Quiz • Profil, ou Scan • Devoirs • Chat • Profil dans le module de scan) est toujours visible sur téléphone ; sur ordinateur elle est remplacée par un menu latéral.</p>'
             '<div class="navs"><div><h4>Barre principale</h4><p><b>Accueil</b> — écran d\'accueil<br><b>Cours</b> — matières et leçons<br><b>Quiz</b> — entraînement<br><b>Profil</b> — compte et réglages</p></div><div><h4>Barre du module de scan</h4><p><b>Scan</b> — photographier un devoir<br><b>Devoirs</b> — historique<br><b>Chat</b> — discuter avec le prof<br><b>Profil</b> — compte</p></div></div></section>')
for i, (sid, title, intro, img, rows, tip, mw, mh) in enumerate(SCREENS):
    parts.append(f'<section class="page scr{" first" if i == 0 else ""}"><h3 id="g-{sid}"><span class="sn">6.{i + 1}</span> {E(title)}</h3><p class="intro">{intro}</p><div class="scr-row">{phone(img, mw, mh)}<div class="scr-tab">{table(rows)}{"<p class=tip>💡 " + tip + "</p>" if tip else ""}</div></div></section>')
parts.append(admin_section())
_end_idx = len(parts)
parts.append(open(os.path.expanduser('~/rsuta/docs/guide_end.html')).read()
             .replace('{{DESK_RESULT}}', desk('desk_result', 170)).replace('{{DESK_COURS}}', desk('desk_cours', 100))
             .replace('{{PH_DARK1}}', phone('dark_home', 50)).replace('{{PH_DARK2}}', phone('dark_cours', 50))
             .replace('{{EDBOX}}', EDBOX).replace('{{DESK_REV}}', desk('desk_revision', 150)).replace('{{N_EP}}', str(FIG['epreuves'])).replace('{{N_TESTS}}', str(FIG['tests'])).replace('{{TABLET}}', f'<div class="phone tab" style="width:62mm"><img src="{b64(IMG + "tablet_home.jpg")}"></div>'))
parts.append(fiche_section()); parts.append(hist_section())
head = f'<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>RSuta — Présentation et guide</title><style>{CSS}</style></head><body>'
open(D + 'guide_cover.html', 'w').write(head.replace('</style>', '@page { size: A4; margin: 0; }</style>') + parts[0] + '</body></html>')
open(D + 'guide.html', 'w').write(head + ''.join(parts[1:]) + '</body></html>')
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.goto('file://' + D + 'guide_cover.html'); pg.wait_for_timeout(600)
    pg.pdf(path='/tmp/cover.pdf', print_background=True, prefer_css_page_size=True)
    pg.goto('file://' + D + 'guide.html'); pg.wait_for_timeout(800)
    pg.pdf(path='/tmp/body.pdf', print_background=True, prefer_css_page_size=True, display_header_footer=True,
           header_template='<div style="width:100%;font-size:7.5px;color:#8a97bd;padding:0 16mm;font-family:sans-serif;display:flex;justify-content:space-between"><span>RSuta — Présentation &amp; guide d\'utilisation</span><span>v' + VER + ' • ' + FIG['mois'] + '</span></div>',
           footer_template='<div style="width:100%;font-size:8px;color:#1f4fd1;padding:0 16mm;font-family:sans-serif;display:flex;justify-content:space-between"><span>RSuta • Édité par BSH - Best Services and House • www.bestservicesandhouse.site</span><span>Page <b class="pageNumber"></b> / <span class="totalPages"></span></span></div>')
    b.close()
from pypdf import PdfWriter, PdfReader
w = PdfWriter()
for f in ['/tmp/cover.pdf', '/tmp/body.pdf']:
    for pgx in PdfReader(f).pages: w.add_page(pgx)
w.add_metadata({'/Title': 'RSuta — Présentation & Guide d\'utilisation', '/Author': 'RSuta', '/Subject': 'Ton prof IA qui ne dort pas'})
w.write(D + 'RSuta-Presentation-Guide.pdf')
os.remove(D + 'guide_cover.html')
print('PDF OK', os.path.getsize(D + 'RSuta-Presentation-Guide.pdf') // 1024, 'Ko')
