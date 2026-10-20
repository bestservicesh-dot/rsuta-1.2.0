/* RSuta — fiches.js : fiches de révision par chapitre (L'essentiel, Formulaire, Pièges, Cartes mémoire).
   Conformes au programme béninois (MEMP / MESRS). Contenu original rédigé pour RSuta.
   Éditeur : BSH - Best Services and House */
(function (G) {
  'use strict';
  // e = l'essentiel, f = formulaire, p = pièges, c = cartes [question, réponse]
  const F = {
    // ============================================================ CEP
    'niv-CEP-m0-c0': {
      e: ['On groupe les chiffres par classes de 3 : unités, mille, millions.', 'Addition et multiplication : l\'ordre des termes ne change pas le résultat.', 'Priorités : d\'abord les parenthèses, puis × et ÷, enfin + et −.', 'Pour vérifier une division : quotient × diviseur + reste = dividende.'],
      f: ['Dividende = diviseur × quotient + reste (reste < diviseur)', 'Multiplier par 10, 100, 1 000 : on ajoute 1, 2, 3 zéros', 'Prix total = prix unitaire × quantité'],
      p: ['Oublier les retenues dans les additions posées.', 'Faire les calculs de gauche à droite sans respecter les priorités : 2 + 3 × 4 = 14, pas 20.'],
      c: [['Combien font 9 × 7 ?', '63'], ['Dans 3 452 018, quel est le chiffre des mille ?', '2'], ['Comment vérifier 85 ÷ 4 = 21 reste 1 ?', '21 × 4 + 1 = 85 ✅']]
    },
    'niv-CEP-m0-c1': {
      e: ['Une fraction a/b : b = nombre de parts égales, a = nombre de parts prises.', 'Deux fractions sont égales si on multiplie (ou divise) le haut et le bas par le même nombre.', 'Un nombre décimal a une partie entière et une partie décimale séparées par la virgule.', 'Pour additionner des fractions, il faut le même dénominateur.'],
      f: ['a/b + c/b = (a + c)/b', 'a/b × c/d = (a × c)/(b × d)', '1/2 = 0,5 ; 1/4 = 0,25 ; 3/4 = 0,75', 'Fraction d\'une quantité : (a/b) de Q = Q ÷ b × a'],
      p: ['Additionner les dénominateurs : 1/2 + 1/3 ≠ 2/5.', 'Croire que 0,5 < 0,25 parce que 25 > 5.'],
      c: [['Les 3/4 de 200 F ?', '200 ÷ 4 × 3 = 150 F'], ['Simplifie 12/18', '2/3 (on divise par 6)'], ['0,7 en fraction ?', '7/10']]
    },
    'niv-CEP-m0-c2': {
      e: ['Le périmètre est la longueur du tour d\'une figure.', 'L\'aire est la surface intérieure, en unités carrées (m², cm²…).', 'Pour convertir : 1 m = 100 cm ; 1 m² = 10 000 cm² ; 1 ha = 10 000 m².', 'Dans un problème : lire, repérer les données, choisir l\'opération, rédiger la phrase réponse.'],
      f: ['Carré : P = 4 × c ; A = c × c', 'Rectangle : P = 2 × (L + l) ; A = L × l', 'Triangle : A = (b × h) ÷ 2', 'Cercle : P = 2 × π × r ; A = π × r × r (π ≈ 3,14)'],
      p: ['Mélanger les unités (m et cm) dans un même calcul.', 'Confondre périmètre (m) et aire (m²).'],
      c: [['Aire d\'un champ rectangulaire 40 m × 25 m ?', '1 000 m²'], ['Périmètre d\'un carré de 7 cm ?', '28 cm'], ['Combien de m² dans 1 hectare ?', '10 000 m²']]
    },
    'niv-CEP-m1-c0': {
      e: ['La phrase commence par une majuscule et finit par un point.', 'Le verbe s\'accorde avec son sujet ; l\'adjectif avec le nom.', 'Le 1er groupe : verbes en -er (sauf aller) ; le 2e groupe : -ir avec -issons.', 'Une rédaction : introduction, développement, conclusion.'],
      f: ['Présent 1er groupe : -e, -es, -e, -ons, -ez, -ent', 'Futur : infinitif + -ai, -as, -a, -ons, -ez, -ont', 'Imparfait : -ais, -ais, -ait, -ions, -iez, -aient', 'Passé composé : avoir/être au présent + participe passé'],
      p: ['Confondre « a » (verbe avoir) et « à » (préposition) : remplace par « avait ».', 'Oublier le -s à « tu » : tu chantes.'],
      c: [['Conjugue « finir » avec nous au présent', 'nous finissons'], ['« Il ... au marché » : a ou à ?', 'Il va au marché ; il a un vélo (avait).'], ['Futur de « aller », je ?', 'j\'irai']]
    },
    'niv-CEP-m2-c0': {
      e: ['Le corps a des appareils : digestif, respiratoire, circulatoire.', 'Une bonne hygiène évite les maladies : se laver les mains, boire de l\'eau potable.', 'Le paludisme est transmis par la piqûre du moustique anophèle femelle.', 'Une alimentation équilibrée contient des aliments énergétiques, bâtisseurs et protecteurs.'],
      f: ['Aliments bâtisseurs : viande, poisson, œufs, haricot', 'Aliments énergétiques : maïs, igname, manioc, huile', 'Aliments protecteurs : fruits (mangues, oranges), légumes'],
      p: ['Croire que le paludisme se transmet par l\'eau sale (c\'est le moustique).', 'Confondre vaccin (prévenir) et médicament (soigner).'],
      c: [['Quel insecte transmet le paludisme ?', 'L\'anophèle femelle'], ['Cite un aliment protecteur', 'La mangue, l\'orange, le gombo…'], ['Comment éviter le choléra ?', 'Eau potable, mains lavées, aliments couverts']]
    },
    // ============================================================ BEPC
    'niv-BEPC-m0-c0': {
      e: ['Développer : transformer un produit en somme.', 'Factoriser : transformer une somme en produit (facteur commun ou identité).', 'Les trois identités remarquables se lisent dans les deux sens.', 'Réduire : regrouper les termes semblables (les x², les x, les nombres).'],
      f: ['(a + b)² = a² + 2ab + b²', '(a − b)² = a² − 2ab + b²', '(a + b)(a − b) = a² − b²', 'k(a + b) = ka + kb'],
      p: ['(a + b)² ≠ a² + b² : n\'oublie jamais le double produit 2ab.', 'Signe moins devant une parenthèse : −(x − 3) = −x + 3.'],
      c: [['Développe (x + 3)²', 'x² + 6x + 9'], ['Factorise x² − 25', '(x − 5)(x + 5)'], ['Factorise 4x + 8', '4(x + 2)']]
    },
    'niv-BEPC-m0-c1': {
      e: ['Résoudre une équation : trouver la valeur de x qui rend l\'égalité vraie.', 'On peut ajouter, soustraire, multiplier ou diviser les deux membres par un même nombre (non nul).', 'Inéquation : si on multiplie ou divise par un nombre négatif, on change le sens.', 'Équation produit : A × B = 0 ⇔ A = 0 ou B = 0.'],
      f: ['ax + b = 0 ⇔ x = −b/a (a ≠ 0)', 'ax + b > 0 avec a > 0 ⇔ x > −b/a', 'Solution d\'inéquation : intervalle, ex. x > 2 ⇔ x ∈ ]2 ; +∞['],
      p: ['Oublier de changer le sens de l\'inégalité en divisant par un négatif.', 'Ne pas vérifier la solution en remplaçant x.'],
      c: [['Résous 3x − 7 = 11', 'x = 6'], ['Résous −2x > 8', 'x < −4'], ['(x − 1)(x + 4) = 0 ?', 'x = 1 ou x = −4']]
    },
    'niv-BEPC-m0-c2': {
      e: ['Un système de deux équations à deux inconnues se résout par substitution, combinaison ou graphiquement.', 'La solution est un couple (x ; y).', 'Dans un problème, on choisit d\'abord les inconnues puis on traduit l\'énoncé.', 'Graphiquement, la solution est le point d\'intersection des deux droites.'],
      f: ['Substitution : on isole x (ou y) dans une équation et on remplace dans l\'autre', 'Combinaison : on multiplie pour éliminer une inconnue', 'Déterminant : D = ab\' − a\'b ; si D ≠ 0, solution unique'],
      p: ['Oublier de calculer la 2e inconnue après avoir trouvé la 1re.', 'Ne pas vérifier le couple dans les DEUX équations.'],
      c: [['x + y = 10 et x − y = 4 ?', '(7 ; 3)'], ['Méthode pour éliminer y dans 2x + y = 7 et x − y = 2 ?', 'Additionner membre à membre'], ['Interprétation graphique ?', 'Point d\'intersection de deux droites']]
    },
    'niv-BEPC-m0-c3': {
      e: ['Pythagore : dans un triangle rectangle, le carré de l\'hypoténuse égale la somme des carrés des deux autres côtés.', 'Réciproque : si BC² = AB² + AC², le triangle est rectangle en A.', 'Thalès : deux droites parallèles coupées par deux sécantes donnent des rapports égaux.', 'Réciproque de Thalès : rapports égaux et même ordre des points ⇒ droites parallèles.'],
      f: ['BC² = AB² + AC² (rectangle en A)', 'AM/AB = AN/AC = MN/BC (Thalès)', 'cos = adjacent/hypoténuse ; sin = opposé/hypoténuse ; tan = opposé/adjacent'],
      p: ['Appliquer Pythagore à un triangle non rectangle.', 'Prendre l\'hypoténuse dans la mauvaise position : c\'est toujours le côté opposé à l\'angle droit.'],
      c: [['AB = 6, AC = 8, rectangle en A : BC ?', '10'], ['Que dit la réciproque de Pythagore ?', 'Égalité des carrés ⇒ triangle rectangle'], ['SOH CAH TOA signifie ?', 'Sin = Opp/Hyp, Cos = Adj/Hyp, Tan = Opp/Adj']]
    },
    'niv-BEPC-m0-c4': {
      e: ['La moyenne d\'une série est la somme des valeurs divisée par l\'effectif.', 'La médiane partage la série ordonnée en deux groupes de même effectif.', 'Le mode est la valeur la plus fréquente.', 'Deux grandeurs sont proportionnelles si on passe de l\'une à l\'autre en multipliant par le même nombre.'],
      f: ['Moyenne pondérée : x̄ = Σ(nᵢ × xᵢ) / N', 'Fréquence = effectif / effectif total', 'Pourcentage : p % de Q = Q × p / 100', 'Produit en croix : a/b = c/d ⇔ a × d = b × c'],
      p: ['Calculer la médiane sans ranger les valeurs.', 'Oublier de pondérer par les effectifs dans la moyenne.'],
      c: [['Moyenne de 12 ; 15 ; 9 ; 14 ?', '12,5'], ['Médiane de 3 ; 8 ; 5 ; 1 ; 9 ?', '5 (série rangée : 1 3 5 8 9)'], ['18 % de 50 000 F ?', '9 000 F']]
    },
    'niv-BEPC-m1-c0': {
      e: ['La loi d\'Ohm relie tension, résistance et intensité.', 'En série : même intensité partout, les tensions s\'additionnent.', 'En dérivation : même tension, les intensités s\'additionnent.', 'La puissance électrique s\'exprime en watts (W), l\'énergie en joules ou en kWh.'],
      f: ['U = R × I (U en V, R en Ω, I en A)', 'Série : Req = R1 + R2', 'Parallèle : 1/Req = 1/R1 + 1/R2', 'P = U × I ; E = P × t'],
      p: ['Oublier de convertir les mA en A (1 mA = 0,001 A).', 'Additionner les résistances en parallèle.'],
      c: [['R = 220 Ω, I = 0,05 A : U ?', '11 V'], ['30 Ω et 60 Ω en parallèle ?', '20 Ω'], ['Énergie d\'une lampe 60 W pendant 5 h ?', '0,3 kWh']]
    },
    'niv-BEPC-m1-c1': {
      e: ['La masse se mesure avec une balance (kg, g).', 'Le volume d\'un liquide se mesure avec une éprouvette graduée (L, mL, cm³).', 'La masse volumique caractérise une substance.', 'Un corps flotte sur l\'eau si sa masse volumique est inférieure à celle de l\'eau.'],
      f: ['ρ = m / V', 'm = ρ × V ; V = m / ρ', 'ρ(eau) = 1 g/cm³ = 1 000 kg/m³', '1 L = 1 dm³ = 1 000 cm³'],
      p: ['Mélanger les unités : m en kg avec V en cm³.', 'Confondre masse (kg) et poids (N) : P = m × g.'],
      c: [['m = 540 g, V = 200 cm³ : ρ ?', '2,7 g/cm³ (aluminium)'], ['1 m³ = combien de litres ?', '1 000 L'], ['Le bois flotte : pourquoi ?', 'ρ(bois) < ρ(eau)']]
    },
    'niv-BEPC-m1-c2': {
      e: ['La matière est faite d\'atomes ; les atomes s\'assemblent en molécules.', 'Dans une réaction chimique, les réactifs disparaissent et des produits apparaissent.', 'Loi de Lavoisier : rien ne se perd, rien ne se crée, tout se transforme.', 'Une équation est équilibrée quand chaque atome est en même nombre des deux côtés.'],
      f: ['Combustion du carbone : C + O₂ → CO₂', 'Combustion du méthane : CH₄ + 2 O₂ → CO₂ + 2 H₂O', 'Masse des réactifs = masse des produits'],
      p: ['Modifier les indices (H₂O → H₂O₂) au lieu des coefficients pour équilibrer.', 'Oublier de compter les atomes d\'oxygène des deux produits.'],
      c: [['Équilibre : H₂ + O₂ → H₂O', '2 H₂ + O₂ → 2 H₂O'], ['Que dit la loi de Lavoisier ?', 'La masse totale se conserve'], ['Quel gaz trouble l\'eau de chaux ?', 'Le dioxyde de carbone CO₂']]
    },
    'niv-BEPC-m2-c0': {
      e: ['La digestion transforme les aliments en nutriments absorbés dans l\'intestin grêle.', 'Les enzymes digestives accélèrent la simplification des aliments.', 'Une ration alimentaire équilibrée couvre les besoins énergétiques et de construction.', 'Malnutrition : kwashiorkor (manque de protéines), marasme (manque d\'énergie).'],
      f: ['Amidon → glucose (amylase)', 'Protéines → acides aminés', 'Lipides → acides gras + glycérol'],
      p: ['Croire que la digestion se fait seulement dans l\'estomac.', 'Confondre absorption (intestin) et digestion (transformation).'],
      c: [['Où se fait l\'absorption des nutriments ?', 'Dans l\'intestin grêle (villosités)'], ['Le kwashiorkor est dû à un manque de… ?', 'Protéines'], ['Quelle enzyme digère l\'amidon ?', 'L\'amylase']]
    },
    'niv-BEPC-m2-c1': {
      e: ['La puberté marque le début du fonctionnement des organes reproducteurs.', 'La fécondation est la rencontre d\'un spermatozoïde et d\'un ovule.', 'Le cycle menstruel dure en moyenne 28 jours ; l\'ovulation vers le 14e jour.', 'Les IST (VIH/sida, syphilis…) se préviennent par l\'abstinence, la fidélité et le préservatif.'],
      f: ['Fécondation → cellule-œuf → embryon → fœtus', 'Grossesse ≈ 9 mois (40 semaines)', 'Ovulation ≈ J14 d\'un cycle de 28 jours'],
      p: ['Croire que le VIH se transmet par une poignée de main ou un moustique.', 'Confondre ovule (cellule) et ovaire (organe).'],
      c: [['Où a lieu la fécondation ?', 'Dans la trompe (oviducte)'], ['Trois moyens de prévention des IST ?', 'Abstinence, fidélité, préservatif'], ['Que produit le testicule ?', 'Des spermatozoïdes et la testostérone']]
    },
    'niv-BEPC-m3-c0': {
      e: ['Les classes de mots : nom, verbe, adjectif, adverbe, pronom, préposition…', 'Les fonctions : sujet, COD, COI, complément circonstanciel, attribut.', 'Une figure de style produit un effet : comparaison, métaphore, personnification, hyperbole.', 'Le participe passé avec avoir s\'accorde avec le COD placé avant.'],
      f: ['Comparaison : outil « comme, tel, pareil à »', 'Métaphore : comparaison sans outil', 'Personnification : objet qui agit comme une personne', 'Hyperbole : exagération'],
      p: ['Confondre comparaison et métaphore (cherche l\'outil de comparaison).', 'Accorder le participe passé avec avoir quand le COD est après le verbe.'],
      c: [['« Ses yeux sont des étoiles » : figure ?', 'Métaphore'], ['« Les pommes qu\'il a mangées » : pourquoi -es ?', 'COD « pommes » placé avant avoir'], ['« Le vent hurle » : figure ?', 'Personnification']]
    },
    'niv-BEPC-m3-c1': {
      e: ['Lire et analyser le sujet : type de texte, destinataire, consigne.', 'Faire un plan avant d\'écrire : introduction, développement en paragraphes, conclusion.', 'La lettre : lieu et date, formule d\'appel, corps, formule de politesse, signature.', 'Se relire pour corriger l\'orthographe et la ponctuation.'],
      f: ['Narratif : situation initiale, élément déclencheur, péripéties, dénouement, situation finale', 'Argumentatif : thèse, arguments, exemples', 'Lettre officielle : objet + formule « Veuillez agréer… »'],
      p: ['Écrire sans plan et sortir du sujet.', 'Oublier la date et la formule de politesse dans une lettre.'],
      c: [['Les 5 étapes du schéma narratif ?', 'Situation initiale, déclencheur, péripéties, dénouement, situation finale'], ['Que met-on en haut à droite d\'une lettre ?', 'Lieu et date'], ['Un argument doit être suivi de… ?', 'Un exemple']]
    },
    // ============================================================ BAC
    'niv-BAC-m0-c0': {
      e: ['Limite d\'un polynôme en ±∞ : limite de son terme de plus haut degré.', 'Fonction rationnelle en ±∞ : quotient des termes de plus haut degré.', 'Formes indéterminées : ∞ − ∞, 0 × ∞, ∞/∞, 0/0 → factoriser ou utiliser le conjugué.', 'Asymptote verticale x = a si la limite en a est infinie ; horizontale y = b si lim en ∞ vaut b.'],
      f: ['lim (1/x) = 0 en ±∞', 'Croissances comparées : lim eˣ/x = +∞ ; lim ln x / x = 0 en +∞', 'TVI : f continue, strictement monotone sur [a ; b], f(a)·f(b) < 0 ⇒ unique solution de f(x) = 0'],
      p: ['Conclure « ∞/∞ = 1 » : c\'est une forme indéterminée.', 'Oublier d\'étudier la limite à gauche ET à droite d\'une valeur interdite.'],
      c: [['lim (2x² + 1)/(x² − 4) en +∞ ?', '2'], ['Quelles sont les 4 formes indéterminées ?', '∞−∞, 0×∞, ∞/∞, 0/0'], ['Quand y a-t-il asymptote verticale x = a ?', 'Si lim f(x) = ±∞ quand x → a']]
    },
    'niv-BAC-m0-c1': {
      e: ['Le signe de f\' donne le sens de variation de f.', 'f\'(a) est le coefficient directeur de la tangente au point d\'abscisse a.', 'Un extremum local est atteint quand f\' s\'annule en changeant de signe.', 'Plan d\'étude : domaine, limites, dérivée, tableau de variations, courbe.'],
      f: ['(xⁿ)\' = n·xⁿ⁻¹ ; (u·v)\' = u\'v + uv\' ; (u/v)\' = (u\'v − uv\')/v²', '(√u)\' = u\'/(2√u) ; (uⁿ)\' = n·u\'·uⁿ⁻¹', 'Tangente : y = f\'(a)(x − a) + f(a)'],
      p: ['Oublier le domaine de dérivabilité (√ et quotients).', 'Confondre signe de f et signe de f\'.'],
      c: [['Dérivée de x³ − 3x + 1 ?', '3x² − 3'], ['Équation de la tangente en a ?', 'y = f\'(a)(x − a) + f(a)'], ['f\' > 0 sur I signifie ?', 'f strictement croissante sur I']]
    },
    'niv-BAC-m0-c2': {
      e: ['ln est définie sur ]0 ; +∞[, strictement croissante, ln 1 = 0, ln e = 1.', 'exp est définie sur ℝ, strictement positive et croissante, e⁰ = 1.', 'ln et exp sont réciproques : ln(eˣ) = x et e^(ln x) = x pour x > 0.', 'Pour résoudre ln A = ln B : poser A > 0, B > 0 puis A = B.'],
      f: ['ln(ab) = ln a + ln b ; ln(a/b) = ln a − ln b ; ln(aⁿ) = n ln a', 'eᵃ⁺ᵇ = eᵃ·eᵇ ; (eᵃ)ⁿ = eⁿᵃ', '(ln u)\' = u\'/u ; (eᵘ)\' = u\'eᵘ'],
      p: ['Écrire ln(a + b) = ln a + ln b : FAUX.', 'Oublier les conditions d\'existence avant de résoudre.'],
      c: [['ln(e³) ?', '3'], ['Dérivée de e^(2x) ?', '2e^(2x)'], ['Résoudre eˣ = 5', 'x = ln 5']]
    },
    'niv-BAC-m0-c3': {
      e: ['Suite arithmétique : on ajoute toujours la même raison r.', 'Suite géométrique : on multiplie toujours par la même raison q.', 'Pour montrer qu\'une suite est arithmétique : uₙ₊₁ − uₙ = constante ; géométrique : uₙ₊₁/uₙ = constante.', 'Raisonnement par récurrence : initialisation, hérédité, conclusion.'],
      f: ['Arithmétique : uₙ = u₀ + n·r ; S = (nb de termes) × (1er + dernier)/2', 'Géométrique : uₙ = u₀·qⁿ ; S = 1er terme × (1 − q^(nb termes))/(1 − q)', 'Si |q| < 1, qⁿ → 0 ; si q > 1, qⁿ → +∞'],
      p: ['Se tromper dans le nombre de termes : de u₀ à uₙ il y a n + 1 termes.', 'Oublier l\'initialisation dans une récurrence.'],
      c: [['u₀ = 3, r = 4 : u₁₀ ?', '43'], ['u₀ = 2, q = 3 : u₅ ?', '486'], ['Les 3 étapes de la récurrence ?', 'Initialisation, hérédité, conclusion']]
    },
    'niv-BAC-m0-c4': {
      e: ['Un complexe s\'écrit z = a + ib avec i² = −1 (forme algébrique).', 'Le module |z| = √(a² + b²) est la distance OM.', 'Forme trigonométrique : z = r(cos θ + i sin θ) ; exponentielle : z = re^(iθ).', 'Équation az² + bz + c = 0 avec Δ < 0 : deux solutions conjuguées.'],
      f: ['z̄ = a − ib ; z·z̄ = a² + b²', 'Δ < 0 : z = (−b ± i√(−Δ))/(2a)', 'Moivre : (cos θ + i sin θ)ⁿ = cos nθ + i sin nθ', '|z₁z₂| = |z₁||z₂| ; arg(z₁z₂) = arg z₁ + arg z₂'],
      p: ['Oublier que i² = −1 en développant.', 'Donner un argument sans vérifier le quadrant (signe de a et de b).'],
      c: [['(2 + i)(1 − 3i) ?', '5 − 5i'], ['|3 + 4i| ?', '5'], ['z² − 2z + 4 = 0 ?', 'z = 1 ± i√3']]
    },
    'niv-BAC-m0-c5': {
      e: ['P(A) = nombre de cas favorables / nombre de cas possibles (équiprobabilité).', 'Événement contraire : P(Ā) = 1 − P(A).', 'Arrangements : ordre compte ; combinaisons : ordre ne compte pas.', 'Loi binomiale : n épreuves identiques et indépendantes à 2 issues.'],
      f: ['C(n, k) = n! / (k!(n − k)!) ; A(n, k) = n!/(n − k)!', 'P(A ∪ B) = P(A) + P(B) − P(A ∩ B)', 'P_B(A) = P(A ∩ B)/P(B)', 'Binomiale : P(X = k) = C(n, k)pᵏ(1 − p)ⁿ⁻ᵏ ; E(X) = np'],
      p: ['Utiliser un arrangement quand l\'ordre ne compte pas (comité, poignée de cartes).', 'Oublier de vérifier que la somme des probabilités vaut 1.'],
      c: [['C(5, 2) ?', '10'], ['P(Ā) si P(A) = 0,3 ?', '0,7'], ['Espérance d\'une binomiale B(10 ; 0,2) ?', '2']]
    },
    'niv-BAC-m1-c0': {
      e: ['1re loi (inertie) : sans force (ou forces compensées), mouvement rectiligne uniforme ou repos.', '2e loi : ΣF = m·a (théorème du centre d\'inertie).', '3e loi : actions réciproques égales et opposées.', 'Chute libre : seul le poids agit, a = g.'],
      f: ['ΣF⃗ = m·a⃗', 'MRUV : v = at + v₀ ; x = ½at² + v₀t + x₀ ; v² − v₀² = 2a(x − x₀)', 'Ec = ½mv² ; Ep = mgh ; W = F·d·cos α', 'Chute libre : h = ½gt² ; v = √(2gh)'],
      p: ['Oublier de convertir km/h en m/s (÷ 3,6).', 'Faire le bilan des forces sans préciser le système et le référentiel.'],
      c: [['72 km/h en m/s ?', '20 m/s'], ['Énoncé de la 2e loi de Newton ?', 'ΣF = m·a'], ['Chute de 20 m (g = 10) : durée ?', '2 s']]
    },
    'niv-BAC-m1-c1': {
      e: ['Dipôle RC : charge du condensateur avec constante de temps τ = RC.', 'Dipôle RL : la bobine s\'oppose aux variations du courant, τ = L/R.', 'Circuit RLC : oscillations électriques ; résonance quand f = f₀.', 'À t = 5τ, le régime permanent est pratiquement atteint.'],
      f: ['q = C·u ; i = dq/dt', 'Charge RC : u_C = E(1 − e^(−t/τ))', 'E_C = ½Cu² ; E_L = ½Li²', 'T₀ = 2π√(LC)'],
      p: ['Confondre τ = RC et τ = L/R.', 'Oublier les unités : C en farads, L en henrys.'],
      c: [['τ pour R = 1 kΩ, C = 10 µF ?', '10 ms'], ['Période propre d\'un LC ?', 'T₀ = 2π√(LC)'], ['u_C à t = τ en charge ?', '≈ 63 % de E']]
    },
    'niv-BAC-m1-c2': {
      e: ['Les composés organiques contiennent du carbone et de l\'hydrogène.', 'Fonctions : alcool (−OH), aldéhyde, cétone, acide carboxylique (−COOH), ester, amine.', 'Nomenclature : chaîne la plus longue + suffixe de la fonction.', 'Estérification : acide + alcool ⇌ ester + eau (lente, limitée).'],
      f: ['Alcanes : CₙH₂ₙ₊₂ ; alcènes : CₙH₂ₙ', 'Combustion complète : CₓHᵧ + (x + y/4) O₂ → x CO₂ + y/2 H₂O', 'Rendement = n(obtenu)/n(théorique) × 100'],
      p: ['Mal numéroter la chaîne (le groupe fonctionnel doit avoir le plus petit indice).', 'Croire que l\'estérification est totale.'],
      c: [['Formule du propane ?', 'C₃H₈'], ['Acide + alcool donnent… ?', 'Ester + eau'], ['Suffixe d\'un alcool ?', '-ol']]
    },
    'niv-BAC-m1-c3': {
      e: ['pH < 7 : acide ; pH = 7 : neutre ; pH > 7 : basique (à 25 °C).', 'Un acide fort est totalement dissocié dans l\'eau ; un acide faible partiellement.', 'Au point d\'équivalence d\'un dosage : n(acide) = n(base).', 'Une solution tampon modère les variations de pH.'],
      f: ['pH = −log[H₃O⁺]', 'Ke = [H₃O⁺][OH⁻] = 10⁻¹⁴', 'pH = pKa + log([A⁻]/[AH])', 'Équivalence : Ca·Va = Cb·Vb'],
      p: ['Oublier que diluer 10 fois un acide fort augmente le pH de 1.', 'Confondre pKa et pH.'],
      c: [['pH d\'une solution [H₃O⁺] = 10⁻³ ?', '3'], ['Relation à l\'équivalence ?', 'Ca·Va = Cb·Vb'], ['À la demi-équivalence, pH = ?', 'pKa']]
    },
    'niv-BAC-m2-c0': {
      e: ['Un gène occupe un locus ; ses versions sont les allèles.', 'Monohybridisme : F2 de deux hétérozygotes → 3/4 dominant, 1/4 récessif.', 'Dihybridisme (gènes indépendants) : 9/16, 3/16, 3/16, 1/16.', 'Le croisement-test (avec un homozygote récessif) révèle le génotype.'],
      f: ['Aa × Aa → 1/4 AA, 1/2 Aa, 1/4 aa', 'Aa × aa → 1/2 [A], 1/2 [a]', 'AaBb × AaBb → 9 : 3 : 3 : 1', 'Gènes liés : proportions parentales majoritaires'],
      p: ['Confondre génotype (allèles, ex. Aa) et phénotype (caractère, ex. [A]).', 'Oublier la pureté des gamètes (un seul allèle par gène).'],
      c: [['Proportions de Aa × Aa ?', '3/4 [A] ; 1/4 [a]'], ['À quoi sert le croisement-test ?', 'Déterminer le génotype d\'un individu de phénotype dominant'], ['Rapport 9:3:3:1 indique… ?', 'Deux gènes indépendants']]
    },
    'niv-BAC-m2-c1': {
      e: ['Le soi est reconnu grâce aux marqueurs du CMH.', 'Immunité non spécifique : barrières, inflammation, phagocytose.', 'Immunité spécifique : humorale (lymphocytes B → anticorps) et cellulaire (LT cytotoxiques).', 'La vaccination crée une mémoire immunitaire.'],
      f: ['Antigène + anticorps → complexe immun', 'LB → plasmocytes → anticorps', 'LT4 coordonnent ; LT8 détruisent les cellules infectées', 'VIH : détruit les LT4'],
      p: ['Confondre sérothérapie (anticorps tout faits, immédiat) et vaccination (mémoire, durable).', 'Dire que les anticorps tuent directement les virus intracellulaires.'],
      c: [['Cellule cible du VIH ?', 'Le lymphocyte T4'], ['Qui produit les anticorps ?', 'Les plasmocytes (issus des LB)'], ['Vaccin ou sérum en urgence ?', 'Le sérum']]
    },
    'niv-BAC-m2-c2': {
      e: ['Le neurone transmet un message nerveux électrique (potentiel d\'action).', 'La synapse transmet le message grâce à un neurotransmetteur.', 'Le réflexe myotatique fait intervenir un arc réflexe.', 'La régulation hormonale de la reproduction implique hypothalamus, hypophyse et gonades.'],
      f: ['Potentiel de repos ≈ −70 mV', 'Loi du tout ou rien pour une fibre', 'GnRH → FSH/LH → hormones sexuelles'],
      p: ['Confondre fibre (tout ou rien) et nerf (recrutement).', 'Oublier le rétrocontrôle des hormones.'],
      c: [['Potentiel de repos d\'un neurone ?', 'Environ −70 mV'], ['Rôle de la synapse ?', 'Transmettre le message par un neurotransmetteur'], ['Hormones hypophysaires de la reproduction ?', 'FSH et LH']]
    },
    'niv-BAC-m3-c0': {
      e: ['Analyser le sujet : mots-clés, problématique, type de plan.', 'Introduction : amorce, citation/sujet, problématique, annonce du plan.', 'Développement : 2 ou 3 parties, chaque argument illustré par un exemple littéraire.', 'Conclusion : bilan + ouverture.'],
      f: ['Plan dialectique : thèse / antithèse / synthèse', 'Plan analytique : constat / causes / conséquences ou solutions', 'Paragraphe : idée → argument → exemple → mini-conclusion'],
      p: ['Réciter le cours au lieu de répondre à la problématique.', 'Exemples sans référence (auteur, œuvre).'],
      c: [['Les 4 éléments d\'une introduction ?', 'Amorce, sujet, problématique, annonce du plan'], ['Plan pour « Pensez-vous que… » ?', 'Dialectique'], ['Que met-on en conclusion ?', 'Bilan + ouverture']]
    },
    'niv-BAC-m3-c1': {
      e: ['Le commentaire composé étudie le texte par axes de lecture (centres d\'intérêt).', 'Chaque axe s\'appuie sur des procédés (figures, temps, champs lexicaux) et leurs effets.', 'Introduction : situer le texte, idée générale, axes.', 'Ne jamais paraphraser : citer, analyser, interpréter.'],
      f: ['Citation + procédé + effet = analyse', '2 axes au minimum, 2 ou 3 sous-parties chacun', 'Transitions entre les parties'],
      p: ['Faire une explication linéaire au lieu de regrouper par axes.', 'Citer sans analyser.'],
      c: [['Formule d\'une bonne analyse ?', 'Citation + procédé + effet'], ['Que présente l\'introduction ?', 'Auteur, œuvre, idée générale, axes'], ['Erreur n°1 du commentaire ?', 'La paraphrase']]
    },
    'niv-BAC-m3-c2': {
      e: ['Le résumé réduit le texte au quart (ou au nombre de mots demandé) en gardant son ordre.', 'On reformule avec ses propres mots, sans citer.', 'On respecte le système d\'énonciation de l\'auteur.', 'Indiquer le nombre de mots à la fin.'],
      f: ['Étapes : lecture, repérage des idées, connecteurs logiques, rédaction', 'Tolérance : ± 10 % du nombre de mots', 'Un mot = ce qui est entre deux espaces (l\'arbre = 1 mot)'],
      p: ['Ajouter son avis personnel.', 'Recopier des phrases du texte.'],
      c: [['Tolérance de longueur ?', '± 10 %'], ['Peut-on donner son avis ?', 'Non, jamais dans un résumé'], ['Que faut-il garder de l\'auteur ?', 'Son ordre logique et son énonciation']]
    },
    'niv-BAC-m4-c0': {
      e: ['Problématiser : transformer le sujet en question qui pose un vrai problème.', 'Définir les notions clés dès l\'introduction.', 'Argumenter avec des références philosophiques précises.', 'Plan progressif : de l\'évidence à une réponse nuancée.'],
      f: ['Intro : définition, paradoxe, problématique, annonce', 'Partie : thèse + arguments + auteurs + exemples', 'Conclusion : réponse claire à la problématique'],
      p: ['Faire un catalogue d\'auteurs sans argumenter.', 'Ne pas répondre à la question posée.'],
      c: [['Première tâche face au sujet ?', 'Définir les termes et dégager le problème'], ['Qu\'est-ce qu\'une problématique ?', 'La question qui révèle la tension du sujet'], ['Que doit contenir la conclusion ?', 'Une réponse nette']]
    },
    'niv-BAC-m4-c1': {
      e: ['Expliquer un texte : dégager la thèse, le problème et la structure argumentative.', 'Grandes notions : conscience, liberté, vérité, travail, État, justice, bonheur.', 'Situer l\'auteur sans réciter sa biographie.', 'Discuter : montrer la portée et les limites de la thèse.'],
      f: ['Thèse + problème + enjeu', 'Mouvements du texte (parties)', 'Intérêt philosophique en conclusion'],
      p: ['Résumer le texte au lieu de l\'expliquer.', 'Oublier la partie critique.'],
      c: [['Les 3 éléments à dégager d\'un texte ?', 'Thèse, problème, structure'], ['« Je pense donc je suis » : auteur ?', 'Descartes'], ['Que faire en partie critique ?', 'Montrer portée et limites']]
    },
    'niv-BAC-m5-c0': {
      e: ['Après 1945, les peuples colonisés réclament l\'indépendance.', 'Le Dahomey devient indépendant le 1er août 1960.', 'Indépendances par la négociation ou par la lutte armée (Algérie, colonies portugaises).', 'L\'OUA est créée en 1963 à Addis-Abeba (UA en 2002).'],
      f: ['1944 : conférence de Brazzaville', '1956 : loi-cadre Defferre', '1958 : Communauté française', '1960 : année des indépendances africaines', '1975 : le Dahomey devient la République populaire du Bénin'],
      p: ['Confondre OUA (1963) et UA (2002).', 'Donner des dates sans les expliquer.'],
      c: [['Date d\'indépendance du Dahomey ?', '1er août 1960'], ['Création de l\'OUA ?', '25 mai 1963, Addis-Abeba'], ['Loi-cadre Defferre ?', '1956, autonomie interne']]
    },
    'niv-BAC-m5-c1': {
      e: ['La mondialisation intensifie les échanges de biens, capitaux, personnes et informations.', 'Acteurs : États, firmes multinationales, organisations internationales (OMC, FMI).', 'Le développement se mesure avec l\'IDH (santé, éducation, revenu).', 'L\'Afrique cherche à s\'intégrer (CEDEAO, UEMOA, ZLECAf).'],
      f: ['IDH entre 0 et 1', 'PIB/habitant = PIB / population', 'Port de Cotonou : poumon économique du Bénin'],
      p: ['Confondre croissance (quantité) et développement (qualité de vie).', 'Réciter sans exemple béninois ou africain.'],
      c: [['Trois critères de l\'IDH ?', 'Santé, éducation, niveau de vie'], ['Que signifie UEMOA ?', 'Union économique et monétaire ouest-africaine'], ['Croissance ≠ développement : pourquoi ?', 'La croissance mesure la production, le développement le bien-être']]
    },
    // ============================================================ LICENCE
    'niv-LICENCE-m0-c0': {
      e: ['Intérêt simple : proportionnel au capital, au taux et à la durée.', 'L\'escompte commercial est retenu par la banque sur la valeur nominale d\'un effet.', 'Année commerciale : 360 jours.', 'Valeur actuelle = valeur nominale − escompte.'],
      f: ['I = C × t × n (n en années) ; I = C × t × j / 36 000 (j en jours, t en %)', 'Valeur acquise : A = C + I', 'Escompte : E = V × t × j / 36 000', 'Agio = escompte + commissions (+ TAF)'],
      p: ['Utiliser 365 jours au lieu de 360.', 'Oublier de compter le nombre exact de jours entre deux dates.'],
      c: [['I sur 500 000 F, 6 %, 90 jours ?', '7 500 F'], ['Formule de l\'escompte ?', 'V × t × j / 36 000'], ['Valeur actuelle ?', 'Nominal − escompte']]
    },
    'niv-LICENCE-m0-c1': {
      e: ['Intérêts composés : les intérêts s\'ajoutent au capital à chaque période.', 'Une annuité constante rembourse capital + intérêts.', 'Tableau d\'amortissement : capital début, intérêt, amortissement, annuité, capital fin.', 'Taux équivalents : (1 + iₐ) = (1 + iₘ)¹².'],
      f: ['Cₙ = C₀(1 + i)ⁿ', 'a = C × i / (1 − (1 + i)⁻ⁿ)', 'Intérêt période k = capital restant × i ; amortissement = a − intérêt', 'Valeur acquise de n annuités : a × ((1 + i)ⁿ − 1)/i'],
      p: ['Confondre taux proportionnel et taux équivalent.', 'Oublier que le dernier amortissement égale le capital restant.'],
      c: [['500 000 F à 5 % composés 3 ans ?', '578 812,5 F'], ['Formule de l\'annuité constante ?', 'a = Ci/(1 − (1 + i)⁻ⁿ)'], ['Amortissement = ?', 'Annuité − intérêt']]
    },
    'niv-LICENCE-m0-c2': {
      e: ['VAN : somme des flux actualisés moins l\'investissement initial.', 'Projet rentable si VAN > 0.', 'TRI : taux qui annule la VAN ; projet accepté si TRI > taux d\'actualisation.', 'Délai de récupération : temps pour récupérer l\'investissement.'],
      f: ['VAN = Σ CFₖ(1 + i)⁻ᵏ − I₀', 'Flux constants : VAN = CF × (1 − (1 + i)⁻ⁿ)/i − I₀', 'Indice de profitabilité IP = (VAN + I₀)/I₀'],
      p: ['Additionner des flux non actualisés.', 'Comparer des projets de durées différentes sans précaution.'],
      c: [['Critère de la VAN ?', 'Accepter si VAN > 0'], ['Définition du TRI ?', 'Taux pour lequel VAN = 0'], ['IP > 1 signifie ?', 'Projet rentable']]
    },
    'niv-LICENCE-m1-c0': {
      e: ['Le SYSCOHADA révisé est le référentiel comptable de l\'espace OHADA.', 'Partie double : tout débit a une contrepartie au crédit de même montant.', 'Le bilan décrit le patrimoine ; le compte de résultat l\'activité.', 'Classes : 1 ressources durables, 2 immobilisations, 3 stocks, 4 tiers, 5 trésorerie, 6 charges, 7 produits.'],
      f: ['Actif = Passif', 'Résultat = Produits − Charges', 'Emploi au débit, ressource au crédit'],
      p: ['Inverser débit et crédit pour la trésorerie (encaissement = débit 52/57).', 'Oublier l\'équilibre de chaque écriture.'],
      c: [['Classe des comptes de charges ?', 'Classe 6'], ['Compte « Banque » ?', '521'], ['Principe de la partie double ?', 'Total débit = total crédit']]
    },
    'niv-LICENCE-m1-c1': {
      e: ['Achat de marchandises : débit 601 + 4452 (TVA récupérable), crédit 401 ou 52/57.', 'Vente : débit 411 ou 52/57, crédit 701 + 4431 (TVA facturée).', 'TVA au Bénin : 18 %.', 'TVA due = TVA facturée − TVA récupérable.'],
      f: ['TTC = HT × 1,18 ; TVA = HT × 0,18', 'HT = TTC / 1,18', '601 Achats de marchandises ; 701 Ventes de marchandises', '401 Fournisseurs ; 411 Clients ; 521 Banque ; 571 Caisse'],
      p: ['Calculer la TVA sur le TTC.', 'Enregistrer la TVA récupérable au crédit.'],
      c: [['TVA sur 500 000 F HT ?', '90 000 F'], ['Compte de la TVA facturée ?', '4431'], ['HT de 1 180 000 F TTC ?', '1 000 000 F']]
    },
    'niv-LICENCE-m1-c2': {
      e: ['Amortissement : constatation de la dépréciation des immobilisations.', 'Provisions : risques et charges probables.', 'Régularisations : charges et produits constatés d\'avance.', 'Inventaire : ajuster les stocks (variation de stocks).'],
      f: ['Amortissement linéaire : annuité = valeur d\'origine / durée (prorata temporis la 1re année)', 'Taux linéaire = 100 / durée', 'VNC = valeur d\'origine − cumul des amortissements', 'Dotation : D 681 / C 28x'],
      p: ['Oublier le prorata temporis la première année.', 'Amortir un terrain (non amortissable).'],
      c: [['Annuité : 6 000 000 F sur 5 ans ?', '1 200 000 F'], ['VNC = ?', 'Valeur d\'origine − amortissements cumulés'], ['Compte de dotation ?', '681']]
    },
    'niv-LICENCE-m2-c0': {
      e: ['Indicateurs de position : moyenne, médiane, mode, quartiles.', 'Indicateurs de dispersion : étendue, variance, écart-type, écart interquartile.', 'Le coefficient de variation compare des dispersions.', 'Représentations : diagramme en bâtons, histogramme, boîte à moustaches.'],
      f: ['x̄ = Σnᵢxᵢ/N', 'V = Σnᵢxᵢ²/N − x̄² ; σ = √V', 'CV = σ / x̄', 'Classes : centre = (borne inf + borne sup)/2'],
      p: ['Oublier les centres de classes pour une série groupée.', 'Confondre variance et écart-type (unités).'],
      c: [['Formule de la variance (Kœnig) ?', 'V = moyenne des carrés − carré de la moyenne'], ['Écart-type de V = 16 ?', '4'], ['CV = ?', 'σ / x̄']]
    },
    'niv-LICENCE-m2-c1': {
      e: ['Ajustement affine par moindres carrés : droite y = ax + b passant par G(x̄ ; ȳ).', 'Le coefficient r mesure l\'intensité de la liaison linéaire (|r| proche de 1 = forte).', 'Loi normale : courbe en cloche ; 95 % des valeurs dans [μ − 2σ ; μ + 2σ].', 'Loi binomiale et loi de Poisson pour les comptages.'],
      f: ['a = cov(x, y)/V(x) ; b = ȳ − a·x̄', 'r = cov(x, y)/(σx·σy)', 'cov(x, y) = Σxᵢyᵢ/n − x̄ȳ', 'Normale centrée réduite : Z = (X − μ)/σ'],
      p: ['Prédire loin des données (extrapolation risquée).', 'Croire que corrélation = causalité.'],
      c: [['La droite de régression passe par… ?', 'Le point moyen G'], ['r = 0,98 indique ?', 'Forte corrélation linéaire positive'], ['Formule de a ?', 'cov(x, y)/V(x)']]
    },
    'niv-LICENCE-m3-c0': {
      e: ['Un algorithme : suite finie d\'instructions pour résoudre un problème.', 'Structures : séquence, condition (si…alors…sinon), boucles (pour, tant que).', 'Variables typées : entier, réel, chaîne, booléen, tableau.', 'Complexité : mesure du nombre d\'opérations en fonction de n.'],
      f: ['Pour i de 1 à n faire … FinPour', 'TantQue condition faire … FinTantQue', 'Recherche dichotomique : O(log n) ; tri à bulles : O(n²)'],
      p: ['Boucle infinie : la condition du TantQue ne devient jamais fausse.', 'Indices de tableau hors limites.'],
      c: [['Complexité de la recherche dichotomique ?', 'O(log n)'], ['Différence pour / tant que ?', 'Pour : nombre d\'itérations connu ; tant que : condition'], ['Type d\'une variable vrai/faux ?', 'Booléen']]
    },
    'niv-LICENCE-m3-c1': {
      e: ['Une base relationnelle organise les données en tables liées par des clés.', 'Clé primaire : identifie chaque ligne ; clé étrangère : référence une autre table.', 'Normalisation (1FN, 2FN, 3FN) : éviter les redondances.', 'SQL : SELECT, INSERT, UPDATE, DELETE, JOIN, GROUP BY.'],
      f: ['SELECT col FROM t WHERE cond ORDER BY col', 'SELECT a.x, b.y FROM a JOIN b ON a.id = b.a_id', 'SELECT col, COUNT(*) FROM t GROUP BY col HAVING COUNT(*) > 1'],
      p: ['Oublier WHERE dans un UPDATE/DELETE (toute la table est modifiée).', 'Confondre WHERE (lignes) et HAVING (groupes).'],
      c: [['Rôle de la clé étrangère ?', 'Faire référence à la clé primaire d\'une autre table'], ['Filtrer des groupes ?', 'HAVING'], ['Compter les lignes ?', 'COUNT(*)']]
    },
    'niv-LICENCE-m3-c2': {
      e: ['Modèle OSI en 7 couches ; modèle TCP/IP en 4 couches.', 'Adresse IPv4 : 32 bits, notée en 4 octets ; masque de sous-réseau.', 'Sécurité : confidentialité, intégrité, disponibilité (CID).', 'Menaces : virus, hameçonnage, rançongiciel ; protections : pare-feu, mises à jour, sauvegardes.'],
      f: ['/24 = 255.255.255.0 → 254 hôtes', 'Nombre d\'hôtes = 2^(32 − préfixe) − 2', 'HTTP 80, HTTPS 443, DNS 53, SSH 22'],
      p: ['Oublier de retirer l\'adresse réseau et la diffusion (−2).', 'Mots de passe faibles ou réutilisés.'],
      c: [['Hôtes dans un /24 ?', '254'], ['Port HTTPS ?', '443'], ['Les 3 piliers de la sécurité ?', 'Confidentialité, intégrité, disponibilité']]
    },
    'niv-LICENCE-m4-c0': {
      e: ['La microéconomie étudie les choix des agents (consommateurs, entreprises).', 'Loi de la demande : quand le prix monte, la quantité demandée baisse.', 'L\'équilibre est atteint quand l\'offre égale la demande.', 'Élasticité-prix : sensibilité de la demande au prix.'],
      f: ['e = (ΔQ/Q) / (ΔP/P)', 'Recette totale RT = P × Q', 'Profit = RT − CT ; maximum quand Rm = Cm', 'Équilibre : O(p) = D(p)'],
      p: ['Confondre déplacement sur la courbe (prix) et déplacement de la courbe (revenu, goûts).', 'Oublier le signe négatif de l\'élasticité-prix.'],
      c: [['Condition de profit maximum ?', 'Recette marginale = coût marginal'], ['|e| > 1 signifie ?', 'Demande élastique'], ['Équilibre du marché ?', 'Offre = demande']]
    },
    'niv-LICENCE-m4-c1': {
      e: ['La macroéconomie étudie les grands agrégats : PIB, inflation, chômage, solde extérieur.', 'Politique budgétaire (État) et monétaire (BCEAO pour l\'UEMOA).', 'Marketing mix : produit, prix, distribution, communication (4P).', 'Analyse stratégique : SWOT (forces, faiblesses, opportunités, menaces).'],
      f: ['PIB = C + I + G + (X − M)', 'Taux d\'inflation = (IPCₙ − IPCₙ₋₁)/IPCₙ₋₁ × 100', 'Multiplicateur keynésien k = 1/(1 − c)'],
      p: ['Confondre PIB nominal et PIB réel.', 'Faire un SWOT sans distinguer interne (FF) et externe (OM).'],
      c: [['Banque centrale de l\'UEMOA ?', 'La BCEAO'], ['Les 4P ?', 'Produit, prix, place (distribution), promotion'], ['Formule du PIB par les dépenses ?', 'C + I + G + X − M']]
    },
    'niv-LICENCE-m5-c0': {
      e: ['Le droit objectif : ensemble des règles qui régissent la société.', 'Sources : Constitution, traités (OHADA), lois, règlements, jurisprudence, coutume.', 'Hiérarchie des normes : Constitution > traités > lois > règlements.', 'Droits subjectifs : prérogatives des personnes.'],
      f: ['Personne physique / personne morale', 'Acte juridique (volonté) / fait juridique (événement)', 'Organisation judiciaire : tribunaux de 1re instance, cours d\'appel, Cour suprême ; CCJA pour l\'OHADA'],
      p: ['Confondre acte et fait juridique.', 'Ignorer la primauté des Actes uniformes OHADA.'],
      c: [['Norme suprême au Bénin ?', 'La Constitution'], ['Cour de cassation de l\'OHADA ?', 'La CCJA (Abidjan)'], ['Exemple de fait juridique ?', 'Un accident, une naissance']]
    },
    'niv-LICENCE-m5-c1': {
      e: ['L\'Acte uniforme OHADA régit les sociétés commerciales.', 'Principales formes : SARL, SA, SAS, SNC.', 'La société acquiert la personnalité morale à l\'immatriculation au RCCM.', 'Responsabilité limitée aux apports dans la SARL et la SA.'],
      f: ['SARL (AUSCGIE art. 311) : 1 000 000 F CFA minimum sauf dispositions nationales contraires ; au Bénin, capital librement fixé par les associés (décret n° 2014-220) ; parts sociales d\'au moins 5 000 F', 'SA : capital minimum 10 000 000 F CFA', 'Organes de la SA : conseil d\'administration ou administrateur général'],
      p: ['Croire que la société existe juridiquement avant l\'immatriculation.', 'Confondre associés (SARL) et actionnaires (SA).'],
      c: [['Où immatricule-t-on une société ?', 'Au RCCM'], ['Capital minimum d\'une SA ?', '10 000 000 F CFA'], ['Responsabilité dans une SNC ?', 'Illimitée et solidaire']]
    },
    'niv-LICENCE-m5-c2': {
      e: ['Le contrat de travail : prestation, rémunération, lien de subordination.', 'CDD et CDI ; période d\'essai.', 'Rupture : démission, licenciement (motif légitime + procédure), rupture d\'un commun accord.', 'Au Bénin, le Code du travail encadre les relations de travail.'],
      f: ['3 éléments du contrat : prestation, salaire, subordination', 'Licenciement : préavis + indemnités selon ancienneté', 'Sanctions disciplinaires proportionnées'],
      p: ['Oublier le lien de subordination dans la définition.', 'Confondre démission (salarié) et licenciement (employeur).'],
      c: [['Critère décisif du contrat de travail ?', 'Le lien de subordination'], ['Qui prend l\'initiative d\'une démission ?', 'Le salarié'], ['Deux types de contrats ?', 'CDD et CDI']]
    },
    'niv-LICENCE-m6-c0': {
      e: ['École classique : Taylor (OST), Fayol (administration), Weber (bureaucratie).', 'Relations humaines : Mayo (Hawthorne), Maslow (besoins).', 'Approches modernes : systémique, contingence.', 'Une organisation : buts, structure, ressources, environnement.'],
      f: ['Fayol : prévoir, organiser, commander, coordonner, contrôler', 'Maslow : physiologiques, sécurité, appartenance, estime, accomplissement', 'Structures : fonctionnelle, divisionnelle, matricielle'],
      p: ['Attribuer l\'OST à Fayol (c\'est Taylor).', 'Réciter les auteurs sans les appliquer à un cas.'],
      c: [['Auteur de l\'OST ?', 'F. W. Taylor'], ['Les 5 fonctions de Fayol ?', 'Prévoir, organiser, commander, coordonner, contrôler'], ['Sommet de la pyramide de Maslow ?', 'Accomplissement de soi']]
    },
    'niv-LICENCE-m6-c1': {
      e: ['La GRH : recruter, former, rémunérer, évaluer, fidéliser.', 'Le leadership : capacité à influencer et mobiliser une équipe.', 'Styles de leadership : directif, persuasif, participatif, délégatif.', 'Conduite du changement : diagnostic, communication, accompagnement des résistances.'],
      f: ['Processus de recrutement : besoin, profil, sourcing, sélection, intégration', 'Taux de rotation = départs / effectif moyen × 100', 'Modèle de Lewin : décristallisation, changement, recristallisation'],
      p: ['Confondre management (gérer) et leadership (inspirer).', 'Ignorer les résistances au changement.'],
      c: [['Les 3 étapes de Lewin ?', 'Décristallisation, changement, recristallisation'], ['Taux de rotation ?', 'Départs / effectif moyen × 100'], ['Style où le chef consulte l\'équipe ?', 'Participatif']]
    },
    'niv-LICENCE-m7-c0': {
      e: ['Le rapport de stage présente l\'entreprise, les missions et une analyse critique.', 'Plan type : introduction, présentation de la structure, travaux réalisés, analyse et suggestions, conclusion.', 'Annexes, bibliographie et table des matières sont obligatoires.', 'Style : clair, impersonnel, chiffré.'],
      f: ['Page de garde : établissement, titre, auteur, encadreurs, année', 'Remerciements, sigles, sommaire', 'Normes : police 12, interligne 1,5, pagination'],
      p: ['Décrire les tâches sans analyse ni recommandations.', 'Oublier de citer ses sources.'],
      c: [['Partie qui fait la différence ?', 'Analyse critique et suggestions'], ['Que met-on en annexe ?', 'Documents, organigramme, tableaux détaillés'], ['Interligne usuel ?', '1,5']]
    },
    'niv-LICENCE-m7-c1': {
      e: ['Le mémoire part d\'une question de recherche et d\'hypothèses.', 'Revue de littérature : ce qui a déjà été écrit sur le sujet.', 'Méthodologie : population, échantillon, outils (questionnaire, entretien), analyse.', 'Résultats, discussion, recommandations.'],
      f: ['Problématique → question → hypothèses → vérification', 'Objectif général + objectifs spécifiques', 'Citation APA : (Auteur, année)'],
      p: ['Hypothèses invérifiables ou trop vagues.', 'Confondre résultats (faits) et discussion (interprétation).'],
      c: [['Qu\'est-ce qu\'une hypothèse ?', 'Une réponse provisoire à la question de recherche'], ['Format de citation APA ?', '(Auteur, année)'], ['Résultats ou discussion : où interpréter ?', 'Dans la discussion']]
    },
    'niv-LICENCE-m7-c2': {
      e: ['Anglais professionnel : e-mails, réunions, CV, entretiens.', 'Present simple pour les habitudes ; present perfect pour un lien avec le présent.', 'Formules polies : Could you…? I would like to… Please find attached…', 'Vocabulaire des affaires : invoice, order, deadline, meeting, report.'],
      f: ['Dear Mr/Ms + nom … Yours sincerely', 'Dear Sir or Madam … Yours faithfully', 'I look forward to hearing from you.'],
      p: ['Yours sincerely vs Yours faithfully : le premier si on connaît le nom.', 'Traduire mot à mot depuis le français.'],
      c: [['« Facture » en anglais ?', 'Invoice'], ['Fin de lettre si on connaît le nom ?', 'Yours sincerely'], ['« Veuillez trouver ci-joint » ?', 'Please find attached']]
    },
    'niv-LICENCE-m8-c0': {
      e: ['Puissance en alternatif monophasé : active, réactive, apparente.', 'Le facteur de puissance cos φ mesure l\'efficacité.', 'Transformateur : modifie la tension, conserve (presque) la puissance.', 'Moteurs asynchrones : glissement entre vitesse du champ et vitesse du rotor.'],
      f: ['P = U·I·cos φ ; Q = U·I·sin φ ; S = U·I', 'Triphasé : P = √3·U·I·cos φ', 'Transformateur : U₂/U₁ = N₂/N₁ = m', 'Glissement g = (nₛ − n)/nₛ'],
      p: ['Oublier √3 en triphasé.', 'Confondre tension simple et tension composée.'],
      c: [['P en monophasé ?', 'U·I·cos φ'], ['Rapport de transformation ?', 'm = N₂/N₁'], ['Formule du glissement ?', 'g = (nₛ − n)/nₛ']]
    },
    'niv-LICENCE-m8-c1': {
      e: ['Le béton armé associe béton (compression) et acier (traction).', 'Étapes d\'un chantier : implantation, terrassement, fondations, élévation, toiture, finitions.', 'Le métré permet d\'estimer les quantités et le coût.', 'Dosage courant du béton : 350 kg de ciment par m³.'],
      f: ['Volume d\'une semelle : L × l × h', 'Dosage 350 kg/m³ → sacs de 50 kg : 7 sacs par m³', 'Contrainte σ = F / S'],
      p: ['Oublier les pertes (5 à 10 %) dans les quantités.', 'Confondre dosage du béton et du mortier.'],
      c: [['Rôle de l\'acier dans le béton armé ?', 'Reprendre la traction'], ['Sacs de 50 kg pour 2 m³ à 350 kg/m³ ?', '14 sacs'], ['Contrainte = ?', 'Force / surface']]
    },
    'niv-LICENCE-m8-c2': {
      e: ['L\'agronomie étudie le sol, la plante et le climat pour produire durablement.', 'Fertilité du sol : matière organique, NPK, pH.', 'Pratiques durables : rotation, association de cultures, compost, agroforesterie.', 'Au Bénin : coton, maïs, manioc, ananas, anacarde, soja.'],
      f: ['N : croissance des feuilles ; P : racines et floraison ; K : fruits et résistance', 'Rendement = production / surface (t/ha)', 'Dose d\'engrais = besoin / teneur'],
      p: ['Apporter trop d\'engrais (pollution, coût).', 'Ignorer l\'analyse du sol avant fertilisation.'],
      c: [['Rôle du phosphore ?', 'Racines et floraison'], ['Rendement : 12 t sur 4 ha ?', '3 t/ha'], ['Une pratique durable ?', 'La rotation des cultures']]
    }
  };

  // cartes complémentaires tirées des quiz du chapitre (question → bonne réponse + explication)
  function cards(chapId) {
    const own = ((F[chapId] || {}).c || []).map((c, i) => ({ id: chapId + '-f' + i, q: c[0], a: c[1], chap: chapId }));
    const D = G.RSutaData; const extra = [];
    if (D) {
      const qz = D.quiz.find((q) => q.chapitre_id === chapId);
      if (qz) D.questions.filter((q) => q.quiz_id === qz.id && q.type !== 'ouverte').forEach((q) => extra.push({ id: q.id, q: q.enonce, a: q.reponse_correcte + (q.explication ? ' — ' + q.explication : ''), chap: chapId }));
    }
    return own.concat(extra);
  }
  function get(chapId) { const f = F[chapId]; if (!f) return null; return { essentiel: f.e, formules: f.f, pieges: f.p, cartes: cards(chapId) }; }
  function allCards(niveau) {
    const D = G.RSutaData; if (!D) return [];
    return D.chapitres.filter((c) => !niveau || c.niveau === niveau).reduce((a, c) => a.concat(cards(c.id)), []);
  }
  G.RSutaFiches = { get, cards, allCards, has: (id) => !!F[id], ids: () => Object.keys(F), _F: F };
  if (typeof module !== 'undefined') module.exports = G.RSutaFiches;
})(typeof window !== 'undefined' ? window : globalThis);
