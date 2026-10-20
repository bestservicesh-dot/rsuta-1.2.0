"""Génère les 8 affiches publicitaires RSuta (1080 x 1080 PNG) à partir des vraies captures de l'app.
Usage : python3 marketing/make_posters.py"""
import os
from playwright.sync_api import sync_playwright
R = os.path.expanduser('~/rsuta/')
IMG = R + 'docs/img/'
OUT = R + 'marketing/'
F1 = 'file://' + R + 'app/fonts/inter-latin-wght-normal.woff2'
F2 = 'file://' + R + 'app/fonts/inter-latin-ext-normal.woff2' if os.path.exists(R + 'app/fonts/inter-latin-ext-normal.woff2') else F1

LOGO = '''<div class="logo"><svg viewBox="0 0 40 40" width="100%" height="100%" fill="none" stroke="#fff" stroke-width="1.8"><rect x="2" y="2" width="36" height="36" rx="4"/><path d="M2 2l36 36M38 2 2 38M20 2v36M2 20h36"/><path d="M20 6 34 20 20 34 6 20z"/><path d="M20 12 28 20 20 28 12 20z" fill="#f8c42f" stroke="#f8c42f"/></svg></div><div class="brand">RSuta<span class="spark">✦</span></div>'''
PATTERN = '''<svg width="100%" height="100%" class="pat"><defs><pattern id="gp" width="72" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(0)"><g fill="none" stroke="rgba(255,255,255,.16)" stroke-width="2"><path d="M0 23 9 9l9 14 9-14 9 14 9-14 9 14 9-14 9 14"/><path d="M0 42h72M0 4h72" stroke-dasharray="5 5"/><path d="M36 9v28" stroke-dasharray="3 6"/><circle cx="36" cy="23" r="3.2" fill="rgba(255,255,255,.14)" stroke="none"/></g></pattern></defs><rect width="100%" height="100%" fill="url(#gp)"/></svg>'''

def phone(src, w, rot, z):
    return f'''<div class="ph" style="width:{w}px;transform:rotate({rot}deg);z-index:{z}"><div class="ph-bar"><i></i><i></i><i></i></div><img src="file://{IMG}{src}"></div>'''

CSS = '''
@page { size: 1080px 1080px; margin: 0; }
* { margin: 0; padding: 0; box-sizing: border-box; }
@font-face { font-family: 'Inter'; font-weight: 100 900; src: url('FONT') format('woff2'); }
body { width: 1080px; height: 1080px; font-family: 'Inter', sans-serif; color: #fff; overflow: hidden; position: relative;
  background: radial-gradient(1300px 900px at 85% -10%, #2e63e0 0%, #1e4fc8 42%, #12307e 74%, #0c1f56 100%); }
.pat { position: absolute; inset: 0; width: 100%; height: 100%; }
.sheen { position: absolute; width: 900px; height: 900px; border-radius: 50%; background: radial-gradient(circle, rgba(56,189,248,.25), transparent 60%); top: -320px; right: -260px; }
.wrap { position: relative; height: 100%; padding: 58px 72px 44px; display: flex; flex-direction: column; z-index: 5; }
.top { display: flex; align-items: center; gap: 22px; }
.logo { width: 92px; height: 92px; filter: drop-shadow(0 6px 14px rgba(0,0,0,.35)); }
.brand { font-size: 52px; font-weight: 900; letter-spacing: 1px; }
.spark { color: #f8c42f; font-size: 42px; margin-left: 8px; }
.tagline { color: #cfe0ff; font-size: 25px; font-weight: 650; margin-top: 2px; }
.tag { display: inline-block; background: #f8c42f; color: #12265f; font-weight: 850; font-size: 22px; letter-spacing: .6px; border-radius: 999px; padding: 9px 22px; margin-top: 24px; width: max-content; text-transform: uppercase; }
h1 { font-size: 58px; line-height: 1.06; font-weight: 900; margin-top: 26px; text-shadow: 0 4px 18px rgba(0,0,0,.28); }
h1 em { font-style: normal; color: #f8c42f; }
.sub { font-size: 26.5px; color: #dbe7ff; font-weight: 600; margin-top: 14px; max-width: 460px; line-height: 1.3; }
.bullets { margin-top: 24px; display: flex; flex-direction: column; gap: 12px; max-width: 490px; }
.b { display: flex; gap: 13px; align-items: flex-start; background: rgba(8,22,66,.5); border: 1.5px solid rgba(255,255,255,.18); border-radius: 18px; padding: 11px 15px; }
.tick { flex-shrink: 0; width: 40px; height: 40px; border-radius: 12px; background: #f8c42f; color: #12265f; display: grid; place-items: center; font-weight: 900; font-size: 24px; margin-top: 2px; }
.b p { font-size: 22px; line-height: 1.26; font-weight: 650; }
.b p small { display: block; color: #b9cbf2; font-weight: 600; font-size: 18.5px; margin-top: 2px; }
.phones { position: absolute; right: 0; bottom: 0; width: 566px; height: 640px; z-index: 2; pointer-events: none; }
.ph { position: absolute; background: #0a1330; border: 2.5px solid rgba(255,255,255,.55); border-radius: 34px; padding: 10px; box-shadow: 0 24px 60px rgba(0,0,0,.5); overflow: hidden; }
.ph img { width: 100%; display: block; border-radius: 24px; }
.ph-bar { display: flex; gap: 7px; padding: 4px 6px 9px; }
.ph-bar i { width: 11px; height: 11px; border-radius: 50%; background: rgba(255,255,255,.4); }
.ph:nth-child(1) { right: 172px; bottom: 26px; }
.ph:nth-child(2) { right: 0; bottom: 0; }
.foot { margin-top: auto; background: #f8c42f; color: #12265f; border-radius: 24px; padding: 20px 24px; display: flex; align-items: center; gap: 20px; box-shadow: 0 14px 44px rgba(0,0,0,.35); max-width: 780px; }
.foot .ed { width: 62px; height: 62px; border-radius: 16px; background: #12265f; color: #f8c42f; display: grid; place-items: center; font-weight: 900; font-size: 23px; flex-shrink: 0; }
.foot b { font-size: 26px; }
.foot .ct { font-size: 19.5px; font-weight: 700; line-height: 1.38; margin-top: 3px; }
.cta { position: absolute; top: 58px; right: 72px; background: #12265f; color: #fff; border-radius: 18px; font-size: 22px; font-weight: 850; padding: 16px 18px; text-align: center; line-height: 1.25; width: 218px; z-index: 6; border: 2px solid rgba(248,196,47,.85); box-shadow: 0 10px 30px rgba(0,0,0,.35); }
.cta small { display: block; color: #ffd95e; font-size: 18px; font-weight: 750; margin-top: 3px; }
'''
FOOT = '''<div class="foot"><div class="ed">BSH</div><div><b>BSH - Best Services and House</b><div class="ct">📞 +229 01 48 52 45 90<br>✉️ contact@bestservicesandhouse.site&nbsp;•&nbsp;🌐 www.bestservicesandhouse.site</div></div></div>'''

def poster(kind, tag, title, sub, bullets, shots, tilt=(-6, 5)):
    bl = ''.join(f'<div class="b"><div class="tick">✓</div><p>{t}{f"<small>{s}</small>" if s else ""}</p></div>' for t, s in bullets)
    phs = ''.join(phone(shots[i][0], shots[i][1], tilt[i], 5 - i) for i in range(len(shots)))
    return f'''<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><style>{CSS.replace('FONT', F1)}</style></head><body>{PATTERN}<div class="sheen"></div>
<div class="wrap"><div class="top">{LOGO}<div class="tagline">{kind}</div></div><div class="tag">{tag}</div>
<h1>{title}</h1><p class="sub">{sub}</p><div class="bullets">{bl}</div>{FOOT}</div><div class="cta">Installe RSuta<small>Téléphone • PC • Sans pub</small></div>
<div class="phones">{phs}</div></body></html>'''

POSTERS = [
    ('01-general', 'Ton prof IA qui ne dort pas', 'Ton prof <em>IA</em><br>qui ne dort <em>pas</em>.',
     'CEP • BEPC • BAC • Licence professionnelle — un vrai prof béninois dans la poche, jour et nuit.',
     [('Il explique en 3 étapes, comme un grand frère', 'Comprendre la méthode, pas réciter la réponse'),
      ('Il marche même sans internet', 'Cours, quiz, scan, corrections : tout est dans le téléphone'),
      ('Exercices illimités + examens blancs notés', 'Tu entres à l\u2019examen préparé comme jamais')],
     [('clean_home.jpg', 238), ('clean_result.jpg', 218)]),
    ('02-scan', 'Scan ton devoir', 'Photographie ton devoir. <em>Il t\u2019explique.</em>',
     'Un exercice trop dur ? Cadre-le avec les 4 coins jaunes : le Prof IA le lit et le résout pas à pas.',
     [('Lecture de la feuille sans internet', 'Redresse la photo, vérifie le texte, corrige chaque exercice'),
      ('Étapes détaillées, mots simples', 'Equations, fractions, problèmes : tout devient clair'),
      ('Pose tes questions après', '« Réexplique autrement ! » — il ne s\u2019énerve jamais')],
     [('scan.jpg', 238), ('clean_result.jpg', 218)]),
    ('03-reviser', 'Prépare ton examen', 'Un plan jour par jour <em>jusqu\u2019au jour J</em>.',
     'La nouvelle façon de préparer le CEP, le BEPC et le BAC : diagnostique, programme, fiches et examens blancs.',
     [('Diagnostic pour trouver tes points faibles', 'Fini de réviser au hasard'),
      ('61 fiches + 375 cartes mémoire', 'L\u2019essentiel de chaque chapitre du programme'),
      ('Examens blancs chronométrés, notés /20', 'Avec mention, corrigé détaillé et conseils')],
     [('revision.jpg', 238), ('examen_r.jpg', 218)]),
    ('04-horsligne', 'Fonctionne sans internet', '<em>0 Mo</em> d\u2019internet ?<br>Ton prof <em>reste avec toi.</em>',
     'RSuta garde tout dans le téléphone : pas besoin de forfait pour réviser chaque jour.',
     [('Cours, quiz, corrigés : 100 % hors-ligne', 'Après la première ouverture, internet n\u2019est plus nécessaire'),
      ('Scan de photo sans réseau', 'La lecture des devoirs se fait dans l\u2019appareil'),
      ('Léger et rapide', 'Moins de 15 Mo sur le téléphone')],
     [('clean_home.jpg', 238), ('quiz_play.jpg', 218)]),
    ('05-cep', 'Spécial CEP', 'CEP 2026 : ton enfant <em>régulier, gagnant</em>.',
     '20 minutes par jour avec RSuta, et le CEP n\u2019effraie plus. Le Prof IA parle simplement, comme au marché de Golo.',
     [('Maths et français avec des mots simples', 'Mangues, cahiers, champs : des exemples de la vraie vie'),
      ('Calcul, dictées, sciences : tout le programme', 'Devoirs expliqués pas à pas, avec la voix'),
      ('Rapport pour les parents', 'Un bilan imprimable des 30 derniers jours')],
     [('clean_home.jpg', 238), ('progres.jpg', 218)]),
    ('06-bepc', 'Spécial BEPC', 'BEPC 2026 : tu y vas <em>en champion</em>.',
     'Maths, PCT, SVT, français — le programme complet du collège, avec un prof qui a connu des générations de BEPC.',
     [('55 sujets types + exercices illimités', 'Générés à l\u2019infini, corrigés étape par étape'),
      ('Examens blancs notés /20 dans les conditions', 'Chrono, mention, corrigé : tu sais où tu en es'),
      ('Prof de maths, PCT et SVT dans la même app', 'Equations, Ohm, atomes : tout s\u2019explique')],
     [('quiz_play.jpg', 238), ('examen_r.jpg', 218)]),
    ('07-bac', 'Spécial BAC', 'La méthode du correcteur, <em>en poche</em>.',
     'Séries A • B • C • D : RSuta forme à la méthode qui décroche les points au baccalauréat béninois.',
     [('Dissertation et problème : la méthode avant tout', 'Analyse du sujet, plan, astuces du correcteur'),
      ('Suites, complexes, probabilités…', 'Analyse, trigonométrie, PCT et SVT résolus pas à pas'),
      ('Devoirs de classe même sans internet', 'Les profs envoient les sujets par code ou QR code')],
     [('clean_result.jpg', 238), ('result_graph.jpg', 218)]),
    ('08-licence', 'Licence professionnelle', 'SYSCOHADA, TVA 18 %… <em>enfin clairs</em>.',
     '18 filières de Licence pro : comptabilité, gestion, informatique, droit… Le premier prof IA conçu pour les étudiants béninois.',
     [('Comptabilité SYSCOHADA, finance, statistiques', 'Amortissements, intérêts composés, variances : tout est expliqué'),
      ('COURS + quiz corrigés par semestre', 'Réviser entre deux cours, dans le bus ou la bibliothèque'),
      ('Devoirs et méthodologie', 'Mémoire, étude de cas, rapport de stage : la bonne structure')],
     [('cours.jpg', 238), ('lecon.jpg', 218)]),
]

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1080}, device_scale_factor=1)
    for name, tag, title, sub, bullets, shots in POSTERS:
        html = poster(tag.replace('Ton prof IA qui ne dort pas', 'Prof IA hors-ligne'), tag, title, sub, bullets, shots)
        f = os.path.join('/tmp', name + '.html'); open(f, 'w').write(html)
        pg.goto('file://' + f); pg.wait_for_timeout(350)
        pg.screenshot(path=OUT + 'affiche-' + name + '.png')
        print('OK', name)
    b.close()
