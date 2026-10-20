const B='/home/user/rsuta/app/js/'; require(B+'math.js'); const E=require(B+'engine.js'); require(B+'engine2.js'); require(B+'engine3.js');
const T = process.argv.slice(2).length ? process.argv.slice(2) : [
 'Dans un repère orthonormé, on donne A(1 ; 2), B(4 ; 6) et C(5 ; -1). Calculer AB, le produit scalaire et préciser la nature du triangle ABC.',
 'On donne A(-2 ; 1) et B(4 ; 3). Calculer les coordonnées du vecteur AB, la distance AB, le milieu de [AB] et une équation de la droite (AB).',
 'Soient les vecteurs u(2 ; -1) et v(3 ; 6). Sont-ils orthogonaux ? colinéaires ?',
 'Résoudre le système : x + y + z = 6 ; 2x - y + z = 3 ; x + 2y - z = 2',
 'Ajustement affine par la méthode des moindres carrés :\nx : 1 ; 2 ; 3 ; 4 ; 5\ny : 3 ; 5 ; 6 ; 9 ; 11\nDéterminer la droite de régression de y en x et estimer y pour x = 8.',
 'Équilibrer l\'équation : CH4 + O2 → CO2 + H2O',
 'Équilibrer : Fe + O2 → Fe2O3',
 'Équilibrer la réaction C3H8 + O2 -> CO2 + H2O',
 'Équilibrer : Ca(OH)2 + HCl → CaCl2 + H2O',
 'Calculer la masse molaire de H2SO4 puis la quantité de matière contenue dans 49 g d\'acide.',
 'On dissout 5,85 g de NaCl dans 250 mL d\'eau. Calculer la quantité de matière et la concentration molaire de la solution.',
 'Une voiture de masse m = 1200 kg roule à 72 km/h. Calculer son énergie cinétique.',
 'Un corps de masse 2 kg est situé à une hauteur de 15 m. Calculer son énergie potentielle (g = 9,8 N/kg).',
 'Une pierre tombe en chute libre d\'une hauteur h = 20 m. Calculer la durée de la chute et la vitesse à l\'arrivée.',
 'Une force F = 50 N déplace un objet sur une distance d = 10 m. Calculer le travail de cette force.',
 'Deux résistances R1 = 30 Ω et R2 = 60 Ω sont montées en parallèle sous une tension de 12 V. Calculer la résistance équivalente et l\'intensité.',
 'Trois résistances de 10 Ω, 20 Ω et 30 Ω sont montées en série. Calculer la résistance équivalente.',
 'On réalise le croisement Aa x Aa (A dominant sur a). Donner les proportions génotypiques et phénotypiques.',
 'Croisement-test : Rr x rr. Établir l\'échiquier de croisement.',
 'Dihybridisme : on croise AaBb x AaBb, gènes indépendants. Donner les proportions phénotypiques.',
 'Passer au journal les écritures suivantes (SYSCOHADA) :\n02/03 Achat de marchandises à crédit pour 500 000 F HT, TVA 18 %.\n05/03 Vente de marchandises au comptant pour 800 000 F HT, TVA 18 %.\n10/03 Règlement du fournisseur par chèque : 590 000 F.',
 'Un emprunt de 10 000 000 F au taux de 8 % est remboursable en 5 annuités constantes. Calculer l\'annuité et dresser le tableau d\'amortissement.',
 'Un investissement de 5 000 000 F génère des flux nets de 1 500 000 F pendant 5 ans. Taux d\'actualisation : 10 %. Calculer la VAN et le TRI.',
 'Charges fixes : 2 400 000 F ; chiffre d\'affaires : 12 000 000 F ; charges variables : 7 200 000 F. Calculer le seuil de rentabilité et le point mort.',
 // anciens
 'Une résistance R = 220 Ω est traversée par un courant I = 0,05 A. Calcule la tension U.', 'Résoudre le système : 2x + y = 7 ; x - y = 2', 'Calculer 15 % de 24 000', 'Un capital de 500 000 F est placé à intérêts composés au taux de 5 % pendant 3 ans.', 'Un matériel acquis pour 6 000 000 F est amorti en linéaire sur 5 ans. Calcule l\'annuité.', 'Calcule la moyenne de la série : 12 ; 15 ; 9 ; 14', 'Le triangle ABC est rectangle en A avec AB = 3 cm et AC = 4 cm. Calculer BC.'
];
for (const t of T) { const r = E.solve(t, { niveau: 'BAC' }); console.log('■', t.split('\n')[0].slice(0,90), '\n  →', r.solver, '|', r.conclusion); if (process.env.V) { console.log(r.etapes.map(e=>e.texte).join('\n---\n')); if (r.table) console.log(JSON.stringify(r.table).slice(0,600)); } }
