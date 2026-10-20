// RSuta — suite de tests du moteur hors-ligne (node tests/engine_test.js)
// Chaque cas : [énoncé, niveau, solveur attendu, fragment attendu dans la conclusion]
const path = require('path');
const B = path.join(__dirname, '..', 'app', 'js') + '/';
global.window = global;
require(B + 'math.js'); const E = require(B + 'engine.js'); require(B + 'engine2.js'); require(B + 'engine3.js');
require(B + 'curriculum.js'); require(B + 'epreuves.js'); const F = require(B + 'fiches.js'); const V = require(B + 'mathview.js');

const CASES = [
  // --- v1.0 : algèbre, arithmétique, géométrie, gestion
  ['Résoudre 2x + 5 = 13', 'BEPC', 'solveEquation', 'x = 4'],
  ['Résoudre 3(x - 2) + 4 = 5x', 'BEPC', 'solveEquation', 'x = -1'],
  ['Résoudre x² = 5x - 6', 'BAC', 'solveEquation', '2'],
  ['Résoudre x² - 5x + 6 ≤ 0', 'BAC', 'solveEquation', '[2 ; 3]'],
  ['Résoudre l\'inéquation 2x - 5 < 3x + 1', 'BEPC', 'solveEquation', ']-6 ; +∞['],
  ['Résoudre le système : 2x + y = 7 ; x - y = 2', 'BEPC', 'solveSystem', '(3 ; 1)'],
  ['Développer et réduire (2x - 3)² - (x + 1)(x - 1)', 'BEPC', 'solveDevelop', '3x² - 12x + 10'],
  ['Factoriser 9x² - 16', 'BEPC', 'solveFactor', '(3x - 4)(3x + 4)'],
  ['Calculer 3 × (4 + 2) - 8 : 2', 'CEP', 'solveArith', '14'],
  ['Calculer 1 250 + 3 475 - 980', 'CEP', 'solveArith', '3745'],
  ['Calculer 3/4 + 1/2', 'CEP', 'solveArith', '5/4'],
  ['Calcule 15 % de 24 000', 'CEP', 'solvePercent', '3600'],
  ['Calculer le PGCD de 1 071 et 462', 'BEPC', 'solveArithmetique', '21'],
  ['Le triangle ABC est rectangle en A avec AB = 3 cm et AC = 4 cm. Calculer BC.', 'BEPC', 'solvePythagore', '5 cm'],
  ['Calcule la moyenne de la série : 12 ; 15 ; 9 ; 14', 'BEPC', 'solveStats', '12,5'],
  ['Une résistance R = 220 Ω est traversée par un courant I = 0,05 A. Calcule la tension U.', 'BEPC', 'solvePhysics', '11 V'],
  ['Un capital de 500 000 F est placé à intérêts composés au taux de 5 % pendant 3 ans.', 'LICENCE', 'solveInterest', '578 812,5'],
  ['Un matériel acquis pour 6 000 000 F est amorti en linéaire sur 5 ans. Calcule l\'annuité.', 'LICENCE', 'solveAmort', '1 200 000'],
  ['Un article coûte 50 000 F HT. Calculer la TVA et le prix TTC.', 'LICENCE', 'solveTVA', '59 000'],
  ['Une facture s\'élève à 2 360 000 F TTC (TVA 18 %). Calculer le montant HT et la TVA.', 'LICENCE', 'solveTVA', '2 000 000'],
  ['Conjugue le verbe finir au présent.', 'CEP', 'solveConjugaison', 'nous finissons'],
  ['Conjugue le verbe appeler au présent.', 'CEP', 'solveConjugaison', 'j\'appelle'],
  // --- v1.1 : analyse, complexes, probabilités
  ['Soit (uₙ) la suite arithmétique de premier terme u0 = 7 et de raison r = -3. Calculer u20 et la somme des 21 premiers termes.', 'BAC', 'solveSuite', 'u20 = -53'],
  ['Résoudre dans ℂ l\'équation z² - 4z + 13 = 0.', 'BAC', 'solveComplex', '2 + 3i'],
  ['Écrire sous forme algébrique z = (3 + 2i)(1 - i).', 'BAC', 'solveComplex', '5 - i'],
  ['Calculer la limite en +∞ de f(x) = (3x² - x + 2)/(x² + 5)', 'BAC', 'solveLimit', '= 3'],
  ['Calculer l\'intégrale de 1 à 3 de (2x + 1) dx', 'BAC', 'solveIntegral', 'I = 10'],
  ['Résoudre dans [0 ; 2π[ l\'équation sin x = √3/2', 'BAC', 'solveTrig', 'π/3 ; 2π/3'],
  ['Résoudre dans [0 ; 2π[ cos x = 1/2', 'BAC', 'solveTrig', 'π/3 ; 5π/3'],
  ['Une urne contient 5 boules rouges et 3 boules vertes. On tire simultanément 2 boules. Calculer la probabilité d\'obtenir 2 boules rouges.', 'BAC', 'solveProba', '5/14'],
  ['De combien de façons peut-on choisir 3 délégués parmi 25 élèves ?', 'BAC', 'solveProba', '2300'],
  // --- v1.1 : sciences et gestion
  ['Calculer les 3/5 de 4 500 F.', 'CEP', 'solveFractionDe', '2700 F'],
  ['Calculer les 2/3 de la classe de 45 élèves', 'CEP', 'solveFractionDe', '30 élèves'],
  ['Dans un repère orthonormé, on donne A(1 ; 2), B(4 ; 6) et C(5 ; -1). Calculer AB et préciser la nature du triangle ABC.', 'BAC', 'solveVecteur', 'AB = 5'],
  ['Résoudre le système : x + y + z = 6 ; 2x - y + z = 3 ; x + 2y - z = 2', 'BAC', 'solveSystem3', '(1 ; 2 ; 3)'],
  ['Ajustement affine par la méthode des moindres carrés :\nx : 1 ; 2 ; 3 ; 4 ; 5\ny : 3 ; 5 ; 6 ; 9 ; 11\nDroite de régression.', 'LICENCE', 'solveRegression', 'y = 2x + 0,8'],
  ['Équilibrer : CH4 + O2 → CO2 + H2O', 'BEPC', 'solveChimie', 'CH₄ + 2 O₂ → CO₂ + 2 H₂O'],
  ['Équilibrer : Fe + O2 → Fe2O3', 'BEPC', 'solveChimie', '4 Fe + 3 O₂ → 2 Fe₂O₃'],
  ['Équilibrer : Ca(OH)2 + HCl → CaCl2 + H2O', 'BAC', 'solveChimie', 'Ca(OH)₂ + 2 HCl'],
  ['Calculer la masse molaire de H2SO4 puis la quantité de matière contenue dans 49 g d\'acide.', 'BEPC', 'solveChimie', 'n = 0,5 mol'],
  ['Une voiture de masse m = 1200 kg roule à 72 km/h. Calculer son énergie cinétique.', 'BAC', 'solveMeca', '240 000 J'],
  ['Une pierre tombe en chute libre d\'une hauteur h = 20 m. Calculer la durée de la chute.', 'BAC', 'solveMeca', 't = 2 s'],
  ['Une force F = 50 N déplace un objet sur une distance d = 10 m. Calculer le travail.', 'BAC', 'solveMeca', 'W = 500 J'],
  ['Deux résistances R1 = 30 Ω et R2 = 60 Ω sont montées en parallèle sous une tension de 12 V.', 'BEPC', 'solveCircuit', 'Req = 20 Ω'],
  ['On réalise le croisement Aa x Aa (A dominant sur a).', 'BAC', 'solveGenetique', '3/4'],
  ['Dihybridisme : on croise AaBb x AaBb, gènes indépendants. Proportions phénotypiques ?', 'BAC', 'solveGenetique', '9/16'],
  ['Passer au journal (SYSCOHADA) :\n02/03 Achat de marchandises à crédit pour 500 000 F HT, TVA 18 %.\n05/03 Vente de marchandises au comptant pour 800 000 F HT, TVA 18 %.', 'LICENCE', 'solveCompta', 'équilibré'],
  ['Un emprunt de 10 000 000 F au taux de 8 % est remboursable en 5 annuités constantes.', 'LICENCE', 'solveFinance', '2 504 565'],
  ['Un investissement de 5 000 000 F génère des flux nets de 1 500 000 F pendant 5 ans. Taux d\'actualisation : 10 %. Calculer la VAN et le TRI.', 'LICENCE', 'solveFinance', 'VAN = 686 180'],
  ['Charges fixes : 2 400 000 F ; chiffre d\'affaires : 12 000 000 F ; charges variables : 7 200 000 F.', 'LICENCE', 'solveFinance', 'SR = 6 000 000']
];

let ok = 0, ko = 0; const fail = (m) => { ko++; console.log('❌ ' + m); };
for (const [t, n, sv, frag] of CASES) {
  let r; try { r = E.solve(t, { niveau: n }); } catch (e) { fail(t.slice(0, 60) + ' → EXCEPTION ' + e.message); continue; }
  const j = JSON.stringify(r);
  if (!r) fail(t.slice(0, 60) + ' → null');
  else if (r.solver !== sv) fail(t.slice(0, 60) + ' → ' + r.solver + ' (attendu ' + sv + ')');
  else if (!String(r.conclusion).includes(frag)) fail(t.slice(0, 60) + ' → « ' + r.conclusion + ' » (attendu « ' + frag + ' »)');
  else if (/NaN|undefined/.test(j)) fail(t.slice(0, 60) + ' → NaN/undefined dans le résultat');
  else if (!r.etapes || r.etapes.length !== 3) fail(t.slice(0, 60) + ' → pas 3 étapes');
  else ok++;
}
// générateurs : chaque exercice généré doit être résolu (pas de repli méthodologique) et auto-corrigeable
const KINDS = ['arith', 'percent', 'area', 'fraction', 'linear', 'pythagore', 'pgcd', 'develop', 'factor', 'ohm', 'quadratic', 'system', 'derivative', 'stats', 'interest', 'tva', 'amort',
  'suite', 'complexe', 'limite', 'integrale', 'proba', 'combi', 'trig', 'vecteur', 'system3', 'regression', 'equilibrage', 'masse_molaire', 'energie', 'circuit', 'genetique', 'compta', 'annuite', 'van', 'seuil'];
for (const k of KINDS) for (let i = 0; i < 8; i++) {
  const g = E.generate(k, { niveau: 'BAC' }); const r = E.solve(g.enonce, { niveau: 'BAC' });
  if (!r || /solveMethod|solveGeneric/.test(r.solver) || /NaN|undefined/.test(JSON.stringify(r))) { fail('générateur ' + k + ' : ' + g.enonce.slice(0, 70) + ' → ' + (r && r.solver)); break; }
  if (!g.text && (g.answers || g.poly) && E.checkAnswer(g, (g.answers || [g.poly]).join(' ; ')) !== true) { fail('générateur ' + k + ' : la bonne réponse n\'est pas reconnue'); break; }
  if (i === 7) ok++;
}
// épreuves : aucun exercice de calcul ne doit tomber en méthodologie
const textual = /dissertation|commentaire|résumé|algorithme|qu'est-ce|définir|explique|analysez|rédaction|étude de cas|conjugue|swot|définition|discutez/i;
for (const e of window.RSutaEpreuves) {
  if (e.annee !== 'Sujet type (non officiel)') fail('épreuve sans mention « non officiel » : ' + e.titre);
  for (const x of E.splitExercises(e.texte)) { const r = E.solve(x.text, { niveau: e.niveau }); if (!r) fail('épreuve ' + e.titre + ' : null'); else if (/solveMethod/.test(r.solver) && !textual.test(x.text)) fail('épreuve ' + e.titre + ' : « ' + x.text.slice(0, 50) + ' » en méthodologie'); }
}
ok++;
// fiches : une par chapitre, au moins 3 éléments par rubrique
const D = window.RSutaData;
D.chapitres.forEach((c) => { const f = F.get(c.id); if (!f) fail('fiche manquante ' + c.id); else if (f.essentiel.length < 3 || f.formules.length < 3 || f.pieges.length < 2 || f.cartes.length < 3) fail('fiche incomplète ' + c.id); });
ok++;
// mathview : rendu et graphiques
if (!/<sup>2<\/sup>/.test(V.math('x^2')) || !/class="frac"/.test(V.math('1/3')) || /class="frac"/.test(V.math('02/03'))) fail('mathview.math'); else ok++;
const g1 = E.solve('Etudier f(x)=x^3-3x+1', { niveau: 'BAC' }).graph; if (!/<svg/.test(V.plot(g1))) fail('mathview.plot poly'); else ok++;
console.log('\n' + ok + ' tests OK, ' + ko + ' échec(s) — ' + CASES.length + ' énoncés, ' + KINDS.length + ' générateurs, ' + window.RSutaEpreuves.length + ' épreuves, ' + D.chapitres.length + ' fiches');
process.exit(ko ? 1 : 0);
