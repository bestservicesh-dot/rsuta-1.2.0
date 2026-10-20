/* RSuta v1.2 — exos.js : exercices corrigés + exercices interactifs, pour chacun des 61 chapitres.
   x : [énoncé, corrigé (lignes séparées par \n)]
   i : exercices interactifs
       ['trous',  'phrase avec [[réponse]]', 'intrus séparés par |']
       ['ordre',  'consigne', 'éléments dans le BON ordre, séparés par |']
       ['paires', 'consigne', 'gauche=droite|gauche=droite|…']
   Les exercices corrigés deviennent une leçon « Exercices corrigés » ajoutée à chaque chapitre.
   Éditeur : BSH - Best Services and House */
(function (G) {
  'use strict';
  const X = {
    // ============================================================ CEP
    'niv-CEP-m0-c0': { x: [
      ['Un commerçant de Dantokpa achète 125 sacs de maïs à 18 500 F le sac. Combien paie-t-il ?', '• On multiplie le nombre de sacs par le prix d\'un sac : 125 × 18 500.\n• 18 500 × 100 = 1 850 000 et 18 500 × 25 = 462 500.\n• 1 850 000 + 462 500 = 2 312 500.\nRéponse : il paie 2 312 500 F.'],
      ['Calcule 48 + 12 × 5 − 30 ÷ 6.', '• Priorité aux multiplications et divisions : 12 × 5 = 60 et 30 ÷ 6 = 5.\n• Puis de gauche à droite : 48 + 60 − 5 = 103.\nRéponse : 103.\nAstuce : on ne calcule jamais 48 + 12 en premier !']],
    i: [['trous', 'Dans 4 572, le chiffre des centaines est [[5]] et le chiffre des dizaines est [[7]].', '4|2'],
      ['ordre', 'Range ces nombres du plus petit au plus grand.', '998|1 089|1 098|1 908|1 980']] },
    'niv-CEP-m0-c1': { x: [
      ['Awa a 3 000 F. Elle dépense les 2/5 de son argent au marché. Combien dépense-t-elle ? Combien lui reste-t-il ?', '• 1/5 de 3 000 F = 3 000 ÷ 5 = 600 F.\n• 2/5 = 2 × 600 = 1 200 F.\n• Reste : 3 000 − 1 200 = 1 800 F.\nRéponse : elle dépense 1 200 F et il lui reste 1 800 F.'],
      ['Calcule 2,75 + 4,6 − 1,05.', '• On aligne les virgules : 2,75 + 4,60 = 7,35.\n• 7,35 − 1,05 = 6,30.\nRéponse : 6,3.']],
    i: [['paires', 'Associe chaque fraction à son nombre décimal.', '1/2=0,5|1/4=0,25|3/4=0,75|1/10=0,1'],
      ['ordre', 'Range du plus petit au plus grand.', '0,09|0,1|0,25|1/2|0,8']] },
    'niv-CEP-m0-c2': { x: [
      ['Un champ rectangulaire mesure 45 m de long et 28 m de large. Calcule son périmètre et son aire.', '• Périmètre = (L + l) × 2 = (45 + 28) × 2 = 73 × 2 = 146 m.\n• Aire = L × l = 45 × 28 = 1 260 m².\nRéponse : périmètre 146 m ; aire 1 260 m².'],
      ['4 kg de riz coûtent 2 400 F. Combien coûtent 7 kg ?', '• Prix d\'un kilo : 2 400 ÷ 4 = 600 F.\n• Prix de 7 kg : 600 × 7 = 4 200 F.\nRéponse : 7 kg coûtent 4 200 F.']],
    i: [['paires', 'Associe les mesures égales.', '1 km=1 000 m|1 kg=1 000 g|1 h=60 min|1 m=100 cm'],
      ['trous', 'Aire d\'un rectangle = longueur [[×]] largeur ; périmètre = (longueur [[+]] largeur) × 2.', '÷|−']] },
    'niv-CEP-m1-c0': { x: [
      ['Conjugue « finir » au présent de l\'indicatif.', '• « Finir » est un verbe du 2e groupe (nous finissons).\n• Je finis, tu finis, il/elle finit, nous finissons, vous finissez, ils/elles finissent.\nAstuce : au pluriel, le 2e groupe prend « -iss- ».'],
      ['Mets au pluriel : « Le cheval du voisin mange une noix. »', '• cheval → chevaux (les noms en -al font -aux).\n• noix ne change pas (les noms terminés par -x sont invariables).\n• Le verbe s\'accorde : mangent.\nRéponse : « Les chevaux des voisins mangent des noix. »']],
    i: [['trous', 'Hier, nous [[avons]] mangé de l\'igname pilée. Demain, je [[serai]] au marché.', 'sommes|aurai'],
      ['paires', 'Associe chaque mot à sa nature.', 'maison=nom|rapide=adjectif|courir=verbe|lentement=adverbe']] },
    'niv-CEP-m2-c0': { x: [
      ['Cite trois gestes pour éviter le paludisme.', '• Dormir chaque nuit sous une moustiquaire imprégnée.\n• Supprimer les eaux stagnantes autour de la maison (boîtes, pneus, flaques) où pondent les moustiques.\n• Aller au centre de santé dès qu\'on a de la fièvre.'],
      ['Pourquoi faut-il se laver les mains avec du savon avant de manger ?', '• Les mains portent des microbes invisibles (terre, toilettes, argent…).\n• Le savon les enlève : on évite ainsi les diarrhées, le choléra et les vers.\nRéponse : pour ne pas avaler de microbes et rester en bonne santé.']],
    i: [['paires', 'Associe chaque maladie à son mode de transmission.', 'Paludisme=piqûre du moustique anophèle|Choléra=eau ou aliments souillés|Tuberculose=toux, air contaminé|Ténia=viande mal cuite'],
      ['ordre', 'Remets dans l\'ordre le trajet des aliments.', 'Bouche|Œsophage|Estomac|Intestin grêle|Gros intestin']] },

    // ============================================================ BEPC
    'niv-BEPC-m0-c0': { x: [
      ['Développer et réduire A = (2x + 3)² − (x − 1)(x + 4).', '• (2x + 3)² = 4x² + 12x + 9 (identité (a + b)²).\n• (x − 1)(x + 4) = x² + 4x − x − 4 = x² + 3x − 4.\n• A = 4x² + 12x + 9 − x² − 3x + 4 = 3x² + 9x + 13.\nAstuce : le « − » devant la parenthèse change tous les signes.'],
      ['Factoriser B = 9x² − 25, puis C = x² + 6x + 9.', '• B = (3x)² − 5² = (3x − 5)(3x + 5) (identité a² − b²).\n• C = x² + 2 × x × 3 + 3² = (x + 3)² (identité (a + b)²).\nRéponse : B = (3x − 5)(3x + 5) ; C = (x + 3)².']],
    i: [['paires', 'Associe chaque expression à sa forme développée.', '(a + b)²=a² + 2ab + b²|(a − b)²=a² − 2ab + b²|(a + b)(a − b)=a² − b²|(x + 1)(x + 2)=x² + 3x + 2'],
      ['trous', '(x + 5)² = x² + [[10x]] + [[25]]', '5x|10']] },
    'niv-BEPC-m0-c1': { x: [
      ['Résoudre 5x − 7 = 2x + 8.', '• On regroupe les x : 5x − 2x = 8 + 7.\n• 3x = 15, donc x = 5.\n• Vérification : 5 × 5 − 7 = 18 et 2 × 5 + 8 = 18 ✅\nRéponse : x = 5.'],
      ['Résoudre l\'inéquation 3(x − 2) ≤ x + 4.', '• 3x − 6 ≤ x + 4.\n• 3x − x ≤ 4 + 6, soit 2x ≤ 10.\n• On divise par 2 (positif, le sens ne change pas) : x ≤ 5.\nRéponse : S = ]−∞ ; 5].']],
    i: [['ordre', 'Remets dans l\'ordre les étapes pour résoudre 4x + 3 = 15.', '4x + 3 = 15|4x = 15 − 3|4x = 12|x = 12 ÷ 4|x = 3'],
      ['trous', 'Si on multiplie ou divise une inéquation par un nombre [[négatif]], on change le [[sens]] de l\'inégalité.', 'positif|signe']] },
    'niv-BEPC-m0-c2': { x: [
      ['Résoudre le système : x + y = 10 ; x − y = 4.', '• On additionne les deux équations : 2x = 14, donc x = 7.\n• On remplace : 7 + y = 10, donc y = 3.\n• Vérification : 7 − 3 = 4 ✅\nRéponse : (x ; y) = (7 ; 3).'],
      ['Au marché, 2 ananas et 3 papayes coûtent 1 300 F ; 1 ananas et 2 papayes coûtent 800 F. Quel est le prix de chaque fruit ?', '• Soit a le prix d\'un ananas et p celui d\'une papaye : 2a + 3p = 1 300 et a + 2p = 800.\n• De la 2e équation : a = 800 − 2p.\n• On remplace : 2(800 − 2p) + 3p = 1 300, soit 1 600 − p = 1 300, donc p = 300.\n• a = 800 − 600 = 200.\nRéponse : un ananas coûte 200 F et une papaye 300 F.']],
    i: [['ordre', 'Méthode par substitution : remets les étapes dans l\'ordre.', 'Exprimer une inconnue en fonction de l\'autre|Remplacer dans l\'autre équation|Résoudre l\'équation à une inconnue|Calculer la seconde inconnue|Vérifier dans les deux équations'],
      ['trous', 'Le couple (2 ; 1) est solution du système x + y = [[3]] ; x − y = [[1]].', '2|4']] },
    'niv-BEPC-m0-c3': { x: [
      ['ABC est rectangle en A avec AB = 5 cm et AC = 12 cm. Calculer BC.', '• D\'après le théorème de Pythagore : BC² = AB² + AC².\n• BC² = 25 + 144 = 169.\n• BC = √169 = 13 cm.\nRéponse : BC = 13 cm.'],
      ['Dans un triangle ABC, M ∈ [AB], N ∈ [AC] et (MN) // (BC). AM = 3 cm, AB = 9 cm et BC = 12 cm. Calculer MN.', '• Les droites (MN) et (BC) sont parallèles : on applique le théorème de Thalès.\n• AM/AB = MN/BC, donc MN = BC × AM ÷ AB = 12 × 3 ÷ 9 = 4 cm.\nRéponse : MN = 4 cm.']],
    i: [['trous', 'Si ABC est rectangle en A, alors [[BC]]² = AB² + [[AC]]².', 'AB|CA'],
      ['paires', 'Associe chaque théorème à son usage.', 'Pythagore=calculer une longueur dans un triangle rectangle|Réciproque de Pythagore=prouver qu\'un triangle est rectangle|Thalès=calculer une longueur avec des parallèles|Réciproque de Thalès=prouver que deux droites sont parallèles']] },
    'niv-BEPC-m0-c4': { x: [
      ['Notes d\'un élève : 12 ; 8 ; 15 ; 10 ; 15. Calculer la moyenne, le mode et la médiane.', '• Moyenne = (12 + 8 + 15 + 10 + 15) ÷ 5 = 60 ÷ 5 = 12.\n• Mode : 15 (la note la plus fréquente).\n• Série rangée : 8 ; 10 ; 12 ; 15 ; 15 → médiane = 12 (valeur du milieu).'],
      ['Un article coûte 15 000 F. Il est soldé à 20 %. Quel est son nouveau prix ?', '• Remise : 15 000 × 20 ÷ 100 = 3 000 F.\n• Nouveau prix : 15 000 − 3 000 = 12 000 F.\nAstuce : baisser de 20 %, c\'est multiplier par 0,8 : 15 000 × 0,8 = 12 000.']],
    i: [['paires', 'Associe chaque mot à sa définition.', 'Moyenne=somme des valeurs ÷ effectif total|Mode=valeur la plus fréquente|Médiane=valeur du milieu de la série rangée|Étendue=plus grande valeur − plus petite valeur'],
      ['trous', 'Augmenter un prix de 10 %, c\'est le multiplier par [[1,1]] ; le baisser de 10 %, c\'est le multiplier par [[0,9]].', '1,01|0,1']] },
    'niv-BEPC-m1-c0': { x: [
      ['Un résistor de 220 Ω est traversé par un courant de 0,05 A. Calculer la tension à ses bornes.', '• Loi d\'Ohm : U = R × I.\n• U = 220 × 0,05 = 11 V.\nRéponse : U = 11 V.'],
      ['Une lampe de 60 W fonctionne 5 h par jour pendant 30 jours. Quelle énergie consomme-t-elle en kWh ?', '• Durée totale : 5 × 30 = 150 h.\n• E = P × t = 60 W × 150 h = 9 000 Wh.\n• 9 000 Wh = 9 kWh.\nRéponse : 9 kWh.']],
    i: [['paires', 'Associe chaque grandeur à son unité.', 'Tension=volt (V)|Intensité=ampère (A)|Résistance=ohm (Ω)|Puissance=watt (W)'],
      ['trous', 'Loi d\'Ohm : U = [[R]] × I ; puissance électrique : P = U × [[I]].', 'P|t']] },
    'niv-BEPC-m1-c1': { x: [
      ['Un bloc de fer a une masse de 3 950 g et un volume de 500 cm³. Calculer sa masse volumique.', '• ρ = m ÷ V = 3 950 ÷ 500 = 7,9 g/cm³.\nRéponse : ρ = 7,9 g/cm³ (soit 7 900 kg/m³).'],
      ['Quelle est la masse de 2 L d\'huile de masse volumique 0,92 g/cm³ ?', '• 2 L = 2 000 cm³.\n• m = ρ × V = 0,92 × 2 000 = 1 840 g.\nRéponse : 1 840 g, soit 1,84 kg.']],
    i: [['paires', 'Associe les volumes égaux.', '1 L=1 dm³|1 mL=1 cm³|1 m³=1 000 L|1 cL=10 mL'],
      ['trous', 'ρ = [[m]] ÷ [[V]] ; un objet flotte sur l\'eau si sa masse volumique est [[inférieure]] à 1 g/cm³.', 'supérieure|P']] },
    'niv-BEPC-m1-c2': { x: [
      ['Équilibrer : CH₄ + O₂ → CO₂ + H₂O.', '• Carbone : 1 de chaque côté.\n• Hydrogène : 4 à gauche, donc 2 H₂O à droite.\n• Oxygène : à droite 2 + 2 = 4 atomes, donc 2 O₂ à gauche.\nRéponse : CH₄ + 2 O₂ → CO₂ + 2 H₂O.'],
      ['Combien d\'atomes contient une molécule de glucose C₆H₁₂O₆ ?', '• 6 atomes de carbone + 12 atomes d\'hydrogène + 6 atomes d\'oxygène.\nRéponse : 6 + 12 + 6 = 24 atomes.']],
    i: [['paires', 'Associe chaque symbole à son élément.', 'H=hydrogène|O=oxygène|C=carbone|Na=sodium'],
      ['trous', 'Au cours d\'une réaction chimique, les atomes se [[conservent]] : la masse des réactifs est [[égale]] à celle des produits.', 'détruisent|supérieure']] },
    'niv-BEPC-m2-c0': { x: [
      ['Classe ces aliments selon leur rôle : riz, poisson, orange, haricot, huile.', '• Aliments énergétiques : riz, huile.\n• Aliments bâtisseurs (protéines) : poisson, haricot.\n• Aliments protecteurs (vitamines) : orange.'],
      ['Qu\'est-ce que le kwashiorkor ? Comment le prévenir ?', '• C\'est une malnutrition due à un manque de protéines, souvent chez le jeune enfant après le sevrage (ventre gonflé, œdèmes, cheveux décolorés).\n• Prévention : alimentation équilibrée riche en protéines (haricot, soja, poisson, œufs, lait) et suivi au centre de santé.']],
    i: [['paires', 'Associe chaque nutriment à son rôle.', 'Glucides=fournir de l\'énergie|Protéines=construire et réparer le corps|Vitamines=protéger contre les maladies|Calcium=solidifier les os'],
      ['trous', 'La digestion transforme les aliments en [[nutriments]] qui passent dans le sang au niveau de l\'[[intestin grêle]].', 'déchets|estomac']] },
    'niv-BEPC-m2-c1': { x: [
      ['Un cycle menstruel dure 28 jours. Les règles commencent le 1er mars. Quel jour a lieu l\'ovulation, en théorie ?', '• Dans un cycle de 28 jours, l\'ovulation a lieu vers le 14e jour.\n• Jour 1 = 1er mars, donc jour 14 = 14 mars.\nRéponse : vers le 14 mars (la date réelle peut varier).'],
      ['Cite trois IST et deux moyens de prévention.', '• IST : VIH/sida, syphilis, gonococcie (blennorragie), chlamydiose.\n• Prévention : abstinence ou fidélité, préservatif à chaque rapport, dépistage.']],
    i: [['paires', 'Associe chaque organe à sa fonction.', 'Testicule=produire les spermatozoïdes|Ovaire=produire les ovules|Utérus=accueillir l\'embryon|Trompe=lieu de la fécondation'],
      ['trous', 'La fécondation est la rencontre d\'un [[spermatozoïde]] et d\'un [[ovule]] ; elle donne une cellule-œuf.', 'embryon|placenta']] },
    'niv-BEPC-m3-c0': { x: [
      ['Identifie la figure de style : « Cet homme est un lion. »', '• On rapproche l\'homme et le lion sans outil de comparaison (comme, tel…).\nRéponse : c\'est une métaphore ; elle souligne le courage de l\'homme.'],
      ['Transforme au discours indirect : Il a dit : « Je viendrai demain. »', '• Le verbe introducteur est au passé : le futur devient conditionnel présent.\n• « je » devient « il » ; « demain » devient « le lendemain ».\nRéponse : Il a dit qu\'il viendrait le lendemain.']],
    i: [['paires', 'Associe chaque exemple à sa figure de style.', 'Il est fort comme un lion=comparaison|Cet homme est un lion=métaphore|Je meurs de faim=hyperbole|Le vent hurle=personnification'],
      ['trous', 'Dans « Le professeur que j\'admire est arrivé », « que j\'admire » est une subordonnée [[relative]] ; son antécédent est « [[professeur]] ».', 'conjonctive|arrivé']] },
    'niv-BEPC-m3-c1': { x: [
      ['Rédige le plan d\'une lettre à ton oncle pour lui annoncer ton succès au BEPC.', '• Lieu et date (en haut à droite) ; formule d\'appel : « Cher tonton, ».\n• Introduction : prendre des nouvelles, annoncer le motif.\n• Développement : la bonne nouvelle, les remerciements pour son soutien, tes projets pour la seconde.\n• Formule de politesse et signature.'],
      ['Quelles sont les trois parties d\'une rédaction ?', '• Introduction : amener le sujet, le poser, annoncer le plan.\n• Développement : des paragraphes, une idée par paragraphe, illustrée par un exemple.\n• Conclusion : faire le bilan et ouvrir.']],
    i: [['ordre', 'Remets dans l\'ordre les éléments d\'une lettre.', 'Lieu et date|Formule d\'appel|Corps de la lettre|Formule de politesse|Signature'],
      ['paires', 'Associe chaque connecteur à son rôle.', 'D\'abord=introduire une première idée|De plus=ajouter une idée|Cependant=exprimer une opposition|En conclusion=terminer']] },

    // ============================================================ BAC
    'niv-BAC-m0-c0': { x: [
      ['Calculer la limite en +∞ de f(x) = (3x² − x + 1)/(x² + 2).', '• En l\'infini, une fonction rationnelle a la limite du quotient de ses termes de plus haut degré.\n• lim f(x) = lim 3x²/x² = 3.\nRéponse : la droite y = 3 est asymptote horizontale en +∞.'],
      ['Calculer la limite de (x² − 4)/(x − 2) quand x tend vers 2.', '• Forme indéterminée 0/0 : on factorise x² − 4 = (x − 2)(x + 2).\n• Pour x ≠ 2 : (x² − 4)/(x − 2) = x + 2.\n• La limite vaut 2 + 2 = 4.']],
    i: [['paires', 'Associe chaque limite en +∞ à sa valeur.', 'lim 1/x=0|lim x²=+∞|lim (−x³)=−∞|lim (2x + 1)/(x − 3)=2'],
      ['trous', 'En l\'infini, un polynôme a la même limite que son terme de plus haut [[degré]] ; une fonction rationnelle, celle du [[quotient]] des termes de plus haut degré.', 'coefficient|produit']] },
    'niv-BAC-m0-c1': { x: [
      ['Étudier les variations de f(x) = x³ − 3x + 1 sur ℝ.', '• f\'(x) = 3x² − 3 = 3(x − 1)(x + 1).\n• f\'(x) > 0 sur ]−∞ ; −1[ et ]1 ; +∞[ ; f\'(x) < 0 sur ]−1 ; 1[.\n• f est croissante, puis décroissante, puis croissante.\n• Maximum local f(−1) = 3 ; minimum local f(1) = −1.'],
      ['Donner l\'équation de la tangente à la courbe de f(x) = x² au point d\'abscisse 1.', '• y = f\'(1)(x − 1) + f(1).\n• f\'(x) = 2x donc f\'(1) = 2 ; f(1) = 1.\n• y = 2(x − 1) + 1 = 2x − 1.\nRéponse : T : y = 2x − 1.']],
    i: [['paires', 'Associe chaque fonction à sa dérivée.', 'x²=2x|x³=3x²|1/x=−1/x²|√x=1/(2√x)'],
      ['trous', 'Si f\'(x) > 0 sur un intervalle, f y est [[croissante]] ; si f\' s\'annule en changeant de signe, f admet un [[extremum]].', 'décroissante|asymptote']] },
    'niv-BAC-m0-c2': { x: [
      ['Résoudre ln(2x − 1) = 0.', '• Condition : 2x − 1 > 0, soit x > 1/2.\n• ln(2x − 1) = 0 ⇔ 2x − 1 = 1 ⇔ x = 1.\n• 1 > 1/2 ✅\nRéponse : S = {1}.'],
      ['Résoudre e^(2x) = 5.', '• On applique ln (fonction strictement croissante) : 2x = ln 5.\n• x = ln 5 ÷ 2 ≈ 0,805.\nRéponse : S = {ln(5)/2}.']],
    i: [['paires', 'Associe les expressions égales.', 'ln(ab)=ln a + ln b|ln(a/b)=ln a − ln b|ln(aⁿ)=n ln a|e^(ln x)=x (pour x > 0)'],
      ['trous', 'ln 1 = [[0]] ; ln e = [[1]] ; e⁰ = 1.', 'e|−1']] },
    'niv-BAC-m0-c3': { x: [
      ['(uₙ) est arithmétique de premier terme u₀ = 5 et de raison 3. Calculer u₁₀ et S = u₀ + u₁ + … + u₁₀.', '• uₙ = u₀ + n r, donc u₁₀ = 5 + 10 × 3 = 35.\n• S = (nombre de termes) × (premier + dernier) ÷ 2 = 11 × (5 + 35) ÷ 2 = 220.'],
      ['Un capital de 100 000 F est placé à 5 % par an à intérêts composés. Quel est le capital après 3 ans ?', '• Suite géométrique de raison 1,05 : Cₙ = C₀ × 1,05ⁿ.\n• C₃ = 100 000 × 1,05³ = 100 000 × 1,157625 = 115 762,50 F.']],
    i: [['paires', 'Associe chaque formule à sa suite.', 'uₙ = u₀ + nr=terme général d\'une suite arithmétique|uₙ = u₀ × qⁿ=terme général d\'une suite géométrique|uₙ₊₁ = uₙ + r=récurrence arithmétique|uₙ₊₁ = q × uₙ=récurrence géométrique'],
      ['trous', 'Une suite géométrique de raison q, avec 0 < q < 1, converge vers [[0]] ; si q > 1 et u₀ > 0, elle tend vers [[+∞]].', '1|−∞']] },
    'niv-BAC-m0-c4': { x: [
      ['Écrire sous forme algébrique z = (2 + 3i)(1 − i).', '• z = 2 − 2i + 3i − 3i².\n• Comme i² = −1 : z = 2 + i + 3 = 5 + i.'],
      ['Calculer le module et un argument de z = 1 + i.', '• |z| = √(1² + 1²) = √2.\n• cos θ = 1/√2 et sin θ = 1/√2, donc θ = π/4.\nRéponse : z = √2 e^(iπ/4).']],
    i: [['paires', 'Associe chaque expression à sa valeur.', 'i²=−1|conjugué de 3 + 2i=3 − 2i|module de 3 + 4i=5|forme exponentielle de i=e^(iπ/2)'],
      ['trous', 'L\'équation z² + 1 = 0 a pour solutions [[i]] et [[−i]].', '1|−1']] },
    'niv-BAC-m0-c5': { x: [
      ['On lance deux dés équilibrés. Quelle est la probabilité d\'obtenir une somme égale à 7 ?', '• 6 × 6 = 36 issues équiprobables.\n• Somme 7 : (1;6), (2;5), (3;4), (4;3), (5;2), (6;1), soit 6 issues.\n• p = 6/36 = 1/6.'],
      ['De combien de façons peut-on choisir 3 délégués parmi 10 élèves ?', '• L\'ordre ne compte pas : ce sont des combinaisons.\n• C(10 ; 3) = 10 × 9 × 8 ÷ (3 × 2 × 1) = 120.\nRéponse : 120 façons.']],
    i: [['paires', 'Associe chaque nombre à sa valeur.', '5!=120|C(5 ; 2)=10|A(5 ; 2)=20|C(5 ; 0)=1'],
      ['trous', 'Si A et B sont incompatibles, p(A ∪ B) = p(A) [[+]] p(B) ; s\'ils sont indépendants, p(A ∩ B) = p(A) [[×]] p(B).', '−|÷']] },
    'niv-BAC-m1-c0': { x: [
      ['Un véhicule de 1 200 kg passe de 0 à 20 m/s en 10 s. Calculer l\'accélération et la force motrice (frottements négligés).', '• a = Δv ÷ Δt = (20 − 0) ÷ 10 = 2 m/s².\n• 2e loi de Newton : F = m × a = 1 200 × 2 = 2 400 N.'],
      ['On lâche une pierre sans vitesse d\'une hauteur de 20 m (g = 10 m/s²). Durée de chute et vitesse à l\'arrivée ?', '• Chute libre : h = ½ g t², donc t = √(2h/g) = √(40/10) = 2 s.\n• v = g × t = 10 × 2 = 20 m/s.']],
    i: [['paires', 'Associe chaque loi à son énoncé.', '1re loi de Newton=principe d\'inertie|2e loi de Newton=ΣF = m·a|3e loi de Newton=actions réciproques|Poids=P = m·g'],
      ['trous', 'Mouvement rectiligne uniformément varié : v = a·t + [[v₀]] et x = ½·a·t² + v₀·t + [[x₀]].', 'g|m']] },
    'niv-BAC-m1-c1': { x: [
      ['Un condensateur de 100 µF se charge à travers une résistance de 10 kΩ. Calculer la constante de temps.', '• C = 100 µF = 10⁻⁴ F ; R = 10 kΩ = 10⁴ Ω.\n• τ = R × C = 10⁴ × 10⁻⁴ = 1 s.\n• Le condensateur est pratiquement chargé après 5τ = 5 s.'],
      ['Calculer la fréquence propre d\'un circuit LC avec L = 0,1 H et C = 10 µF.', '• T₀ = 2π√(LC) = 2π√(0,1 × 10⁻⁵) = 2π × 10⁻³ ≈ 6,28 × 10⁻³ s.\n• f₀ = 1 ÷ T₀ ≈ 159 Hz.']],
    i: [['paires', 'Associe chaque grandeur à sa formule.', 'Constante de temps RC=τ = R·C|Constante de temps RL=τ = L/R|Période propre LC=T₀ = 2π√(LC)|Énergie d\'un condensateur=E = ½·C·U²'],
      ['trous', 'À t = τ, un condensateur en charge atteint environ [[63]] % de sa tension finale ; il est pratiquement chargé après [[5]] τ.', '37|10']] },
    'niv-BAC-m1-c2': { x: [
      ['Nommer CH₃–CH₂–CH₂–OH.', '• Chaîne de 3 carbones : préfixe « prop- ».\n• Groupe –OH sur le carbone 1 : alcool, suffixe « -ol ».\nRéponse : propan-1-ol.'],
      ['Écrire l\'équation de combustion complète du propane C₃H₈.', '• Produits : CO₂ et H₂O.\n• C : 3 CO₂ ; H : 4 H₂O ; O : 6 + 4 = 10 atomes, soit 5 O₂.\nRéponse : C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O.']],
    i: [['paires', 'Associe chaque groupe à sa famille.', '–OH=alcool|–COOH=acide carboxylique|–CHO=aldéhyde|–COO–=ester'],
      ['trous', 'Les alcanes ont pour formule générale CₙH[[2n+2]] ; les alcènes CₙH[[2n]].', '2n−2|n']] },
    'niv-BAC-m1-c3': { x: [
      ['Calculer le pH d\'une solution d\'acide chlorhydrique de concentration 0,01 mol/L.', '• HCl est un acide fort : [H₃O⁺] = c = 10⁻² mol/L.\n• pH = −log(10⁻²) = 2.'],
      ['Une solution a [H₃O⁺] = 2,5 × 10⁻⁴ mol/L. Calculer son pH. Est-elle acide ?', '• pH = −log(2,5 × 10⁻⁴) ≈ 3,6.\n• pH < 7 à 25 °C : la solution est acide.']],
    i: [['paires', 'Associe chaque pH à la nature de la solution (25 °C).', 'pH = 2=acide|pH = 7=neutre|pH = 12=basique|pH = pKa=[A⁻] = [AH]'],
      ['trous', 'Une solution acide a un pH [[inférieur]] à 7 ; le produit ionique de l\'eau à 25 °C vaut [[10⁻¹⁴]].', 'supérieur|10⁻⁷']] },
    'niv-BAC-m2-c0': { x: [
      ['On croise deux lignées pures : fleurs rouges (allèle R dominant) × fleurs blanches (allèle r). Résultats en F1 et en F2 ?', '• F1 : tous Rr, à fleurs rouges (1re loi de Mendel : uniformité).\n• F2 (Rr × Rr) : 1/4 RR, 1/2 Rr, 1/4 rr.\n• Phénotypes : 3/4 rouges, 1/4 blanches.'],
      ['Un homme de groupe AB et une femme de groupe O. Quels groupes peuvent avoir leurs enfants ?', '• Père : allèles A et B ; mère : O et O.\n• Enfants : AO (groupe A) ou BO (groupe B), chacun avec une probabilité 1/2.\n• Aucun enfant de groupe AB ni O.']],
    i: [['paires', 'Associe chaque terme à sa définition.', 'Gène=portion d\'ADN qui code un caractère|Allèle=version d\'un gène|Homozygote=deux allèles identiques|Hétérozygote=deux allèles différents'],
      ['trous', 'En F2 d\'un monohybridisme avec dominance complète, on obtient les proportions [[3/4]] et [[1/4]].', '1/2|9/16']] },
    'niv-BAC-m2-c1': { x: [
      ['Quelle est la différence entre immunité innée et immunité acquise ?', '• Innée : non spécifique, immédiate (peau, muqueuses, inflammation, phagocytose).\n• Acquise : spécifique d\'un antigène, plus lente la première fois ; elle fait intervenir les lymphocytes B (anticorps) et T, et garde une mémoire.'],
      ['Expliquer le principe de la vaccination.', '• On injecte un antigène rendu inoffensif (microbe atténué, tué ou fragment).\n• L\'organisme fabrique des anticorps et des cellules mémoire.\n• Lors d\'un vrai contact, la réponse secondaire est rapide et forte : la personne est protégée.']],
    i: [['paires', 'Associe chaque cellule à son rôle.', 'Lymphocyte B=produit les anticorps (plasmocyte)|Lymphocyte T4=coordonne la réponse immunitaire|Lymphocyte T8=détruit les cellules infectées|Macrophage=phagocyte les microbes'],
      ['trous', 'Le VIH détruit les lymphocytes [[T4]], ce qui affaiblit le système [[immunitaire]].', 'B|nerveux']] },
    'niv-BAC-m2-c2': { x: [
      ['Citer, dans l\'ordre, les éléments d\'un arc réflexe.', '• Récepteur sensoriel → neurone sensitif → centre nerveux (moelle épinière) → neurone moteur → effecteur (muscle).'],
      ['Quel est le rôle de la progestérone ?', '• Sécrétée par le corps jaune puis par le placenta.\n• Elle prépare la muqueuse utérine à la nidation et maintient la grossesse.']],
    i: [['ordre', 'Remets dans l\'ordre les éléments de l\'arc réflexe.', 'Récepteur|Neurone sensitif|Moelle épinière|Neurone moteur|Muscle effecteur'],
      ['paires', 'Associe chaque hormone à la glande qui la sécrète.', 'Testostérone=testicule|Œstrogènes=ovaire|FSH et LH=hypophyse|Insuline=pancréas']] },
    'niv-BAC-m3-c0': { x: [
      ['Quelles sont les étapes de l\'introduction d\'une dissertation ?', '• Amener le sujet (idée générale, contexte).\n• Citer ou reformuler le sujet.\n• Poser la problématique (la question centrale).\n• Annoncer le plan.'],
      ['Proposer un plan pour : « La littérature africaine doit-elle être engagée ? »', '• I. Une littérature née de l\'engagement : Négritude (Césaire, Senghor), romans anticoloniaux (Mongo Beti).\n• II. Les limites : l\'écrivain doit rester libre ; la littérature est aussi recherche esthétique.\n• III. Dépassement : l\'engagement passe par la beauté de l\'œuvre et la critique des sociétés actuelles.']],
    i: [['ordre', 'Remets dans l\'ordre les étapes de l\'introduction.', 'Amener le sujet|Citer le sujet|Poser la problématique|Annoncer le plan'],
      ['paires', 'Associe chaque type de plan au sujet qui lui convient.', 'Plan dialectique=sujet qui appelle un débat|Plan analytique=sujet qui demande causes et conséquences|Plan thématique=sujet qui demande plusieurs aspects|Plan comparatif=sujet qui met en parallèle deux notions']] },
    'niv-BAC-m3-c1': { x: [
      ['Qu\'est-ce qu\'un axe de lecture ?', '• C\'est une grande idée d\'interprétation du texte.\n• Chaque axe regroupe plusieurs observations (procédés, citations) analysées.\n• Un commentaire compte en général deux ou trois axes.'],
      ['Quels outils d\'analyse repérer dans un poème ?', '• Champs lexicaux et figures de style.\n• Versification : mètre, rimes, rythme, enjambements.\n• Sonorités : allitérations, assonances.\n• Énonciation et temps verbaux.']],
    i: [['paires', 'Associe chaque procédé à son effet.', 'Anaphore=insistance et rythme|Antithèse=opposition, contraste|Allitération=effet sonore|Gradation=intensification'],
      ['trous', 'Dans un commentaire composé, chaque [[axe]] est justifié par des citations analysées : on ne fait pas de [[paraphrase]].', 'résumé|plan']] },
    'niv-BAC-m3-c2': { x: [
      ['Quelles sont les règles du résumé de texte ?', '• Respecter l\'ordre des idées et l\'énonciation de l\'auteur.\n• Réduire au nombre de mots demandé (souvent le quart), avec une marge de ± 10 %.\n• Reformuler : pas de citation, pas d\'avis personnel.'],
      ['Un texte de 600 mots doit être résumé au quart. Combien de mots sont acceptés ?', '• 600 ÷ 4 = 150 mots.\n• Marge de 10 % : 15 mots.\nRéponse : entre 135 et 165 mots.']],
    i: [['ordre', 'Remets dans l\'ordre la méthode du résumé.', 'Lire le texte en entier|Repérer la thèse et les idées principales|Dégager le plan logique|Reformuler en respectant l\'ordre|Compter les mots'],
      ['trous', 'Dans un résumé, on garde le point de vue de l\'[[auteur]] et on n\'ajoute aucun [[commentaire]] personnel.', 'lecteur|connecteur']] },
    'niv-BAC-m4-c0': { x: [
      ['Analyser le sujet : « Peut-on être libre sans loi ? »', '• Liberté : pouvoir d\'agir selon sa volonté. Loi : règle commune obligatoire.\n• Paradoxe : la loi semble limiter la liberté, mais sans loi règne la loi du plus fort.\n• Problème : la loi est-elle un obstacle ou une condition de la liberté ? (Rousseau : « L\'obéissance à la loi qu\'on s\'est prescrite est liberté ».)'],
      ['Proposer un plan pour : « Le travail est-il une contrainte ? »', '• I. Oui : effort pénible (étymologie « tripalium »), risque d\'aliénation (Marx).\n• II. Non : le travail humanise, transforme la nature et l\'homme lui-même (Hegel).\n• III. Tout dépend des conditions : travail choisi, juste et reconnu.']],
    i: [['paires', 'Associe chaque auteur à sa formule.', 'Descartes=« Je pense, donc je suis »|Rousseau=« L\'homme est né libre, et partout il est dans les fers »|Socrate=« Connais-toi toi-même »|Sartre=« L\'existence précède l\'essence »'],
      ['ordre', 'Remets dans l\'ordre le plan dialectique.', 'Thèse|Antithèse|Synthèse (dépassement)|Conclusion']] },
    'niv-BAC-m4-c1': { x: [
      ['Comment dégager la thèse d\'un texte philosophique ?', '• Trouver le problème posé par le texte.\n• Repérer la réponse de l\'auteur, souvent annoncée par les connecteurs (donc, ainsi, mais).\n• La reformuler en une phrase personnelle.'],
      ['Définir la conscience.', '• Connaissance immédiate que le sujet a de lui-même et du monde qui l\'entoure.\n• La conscience morale permet de juger le bien et le mal.']],
    i: [['paires', 'Associe chaque notion à sa définition.', 'Liberté=pouvoir d\'agir selon sa volonté|Vérité=accord de la pensée avec le réel|Justice=respect du droit et de l\'égalité|Conscience=connaissance qu\'on a de soi et du monde'],
      ['trous', 'Une explication de texte suit le [[mouvement]] du texte et dégage sa [[thèse]] avant d\'en discuter l\'intérêt.', 'auteur|titre']] },
    'niv-BAC-m5-c0': { x: [
      ['Donner la date d\'indépendance du Dahomey et le nom de son premier président.', '• Indépendance : 1er août 1960.\n• Premier président : Hubert Maga.\n• Le Dahomey prend le nom de République populaire du Bénin en 1975.'],
      ['Citer les causes de la décolonisation en Afrique.', '• La Seconde Guerre mondiale affaiblit les puissances coloniales.\n• Le droit des peuples à disposer d\'eux-mêmes (Charte de l\'ONU) et la conférence de Bandung (1955).\n• L\'action des élites et des partis nationalistes ; la pression des États-Unis et de l\'URSS.']],
    i: [['paires', 'Associe chaque événement à sa date.', 'Indépendance du Dahomey=1960|Conférence de Bandung=1955|Création de l\'OUA=1963|Le Dahomey devient le Bénin=1975'],
      ['ordre', 'Range ces événements dans l\'ordre chronologique.', 'Fin de la Seconde Guerre mondiale|Conférence de Bandung|Indépendance du Ghana|Indépendance du Dahomey|Création de l\'OUA']] },
    'niv-BAC-m5-c1': { x: [
      ['Définir la mondialisation et citer deux de ses acteurs.', '• Processus d\'intégration des économies et des sociétés par la multiplication des échanges (marchandises, capitaux, informations, personnes).\n• Acteurs : firmes multinationales, États, organisations internationales (OMC, FMI), ONG.'],
      ['Quels sont les atouts et les défis du port de Cotonou dans la mondialisation ?', '• Atouts : façade maritime, porte d\'entrée des pays sans littoral (Niger, Burkina Faso), travaux de modernisation.\n• Défis : concurrence des ports de Lomé et de Lagos, coûts de passage, congestion et sécurité des corridors.']],
    i: [['paires', 'Associe chaque sigle à sa signification.', 'OMC=Organisation mondiale du commerce|FMI=Fonds monétaire international|UEMOA=Union économique et monétaire ouest-africaine|CEDEAO=Communauté économique des États de l\'Afrique de l\'Ouest'],
      ['trous', 'L\'IDH combine la santé (espérance de vie), l\'[[éducation]] et le [[revenu]] par habitant.', 'armée|superficie']] },

    // ============================================================ LICENCE
    'niv-LICENCE-m0-c0': { x: [
      ['Un capital de 2 000 000 F est placé à 6 % pendant 90 jours (année de 360 jours). Calculer l\'intérêt.', '• I = C × t × n ÷ 36 000 (n en jours).\n• I = 2 000 000 × 6 × 90 ÷ 36 000 = 30 000 F.'],
      ['Un effet de 500 000 F, à échéance dans 60 jours, est escompté au taux de 9 %. Calculer l\'escompte et la valeur actuelle.', '• e = V × t × n ÷ 36 000 = 500 000 × 9 × 60 ÷ 36 000 = 7 500 F.\n• Valeur actuelle = 500 000 − 7 500 = 492 500 F.']],
    i: [['paires', 'Associe chaque formule à son nom.', 'I = C·t·n/36 000=intérêt simple (n en jours)|e = V·t·n/36 000=escompte commercial|VA = V − e=valeur actuelle commerciale|360 jours=année commerciale'],
      ['trous', 'En intérêts simples, l\'intérêt est [[proportionnel]] au capital, au taux et à la [[durée]].', 'inverse|valeur']] },
    'niv-LICENCE-m0-c1': { x: [
      ['Valeur acquise de 1 000 000 F placés à 8 % l\'an pendant 5 ans (intérêts composés).', '• Cₙ = C₀ (1 + i)ⁿ = 1 000 000 × 1,08⁵.\n• 1,08⁵ ≈ 1,469328.\n• C₅ ≈ 1 469 328,08 F.'],
      ['Calculer l\'annuité constante d\'un emprunt de 5 000 000 F remboursé en 4 ans au taux de 10 %.', '• a = C × i ÷ (1 − (1 + i)⁻ⁿ) = 5 000 000 × 0,10 ÷ (1 − 1,1⁻⁴).\n• 1,1⁻⁴ ≈ 0,683013, donc 1 − 0,683013 = 0,316987.\n• a ≈ 500 000 ÷ 0,316987 ≈ 1 577 354 F.']],
    i: [['paires', 'Associe chaque formule à son nom.', 'Cₙ = C₀(1 + i)ⁿ=valeur acquise|C₀ = Cₙ(1 + i)⁻ⁿ=valeur actuelle|a = C·i/(1 − (1 + i)⁻ⁿ)=annuité constante|(1 + i)ⁿ=facteur de capitalisation'],
      ['trous', 'Dans un tableau d\'amortissement à annuités constantes, l\'intérêt [[diminue]] et l\'amortissement [[augmente]] chaque année.', 'stagne|double']] },
    'niv-LICENCE-m0-c2': { x: [
      ['Investissement de 10 000 000 F ; flux nets de 3 000 000 F par an pendant 5 ans ; taux d\'actualisation 10 %. Calculer la VAN.', '• Valeur actuelle des flux : 3 000 000 × (1 − 1,1⁻⁵) ÷ 0,1 ≈ 3 000 000 × 3,790787 ≈ 11 372 360 F.\n• VAN = 11 372 360 − 10 000 000 ≈ 1 372 360 F > 0 : projet rentable.'],
      ['Délai de récupération (non actualisé) du même projet ?', '• Flux constants : DR = 10 000 000 ÷ 3 000 000 ≈ 3,33 ans.\nRéponse : environ 3 ans et 4 mois.']],
    i: [['paires', 'Associe chaque critère à sa règle de décision.', 'VAN=accepter si VAN > 0|TRI=accepter si TRI > taux d\'actualisation|Indice de profitabilité=accepter si IP > 1|Délai de récupération=préférer le plus court'],
      ['trous', 'Le TRI est le taux d\'actualisation pour lequel la VAN est [[nulle]].', 'maximale|négative']] },
    'niv-LICENCE-m1-c0': { x: [
      ['Classer selon le plan SYSCOHADA : capital, matériel de transport, fournisseurs, banque, achats de marchandises, ventes de marchandises.', '• Classe 1 : 101 Capital.\n• Classe 2 : 245 Matériel de transport.\n• Classe 4 : 401 Fournisseurs.\n• Classe 5 : 521 Banques.\n• Classe 6 : 601 Achats de marchandises.\n• Classe 7 : 701 Ventes de marchandises.'],
      ['Énoncer l\'équation fondamentale du bilan.', '• Actif = Passif.\n• Emplois (ce que l\'entreprise possède) = Ressources (capitaux propres + dettes).']],
    i: [['paires', 'Associe chaque classe SYSCOHADA à son contenu.', 'Classe 1=ressources durables|Classe 2=actif immobilisé|Classe 6=charges des activités ordinaires|Classe 7=produits des activités ordinaires'],
      ['trous', 'En partie double, tout débit d\'un compte correspond à un [[crédit]] d\'un autre compte pour le même [[montant]].', 'débit|solde']] },
    'niv-LICENCE-m1-c1': { x: [
      ['Facture d\'achat : marchandises HT 800 000 F, TVA 18 %. Calculer la TVA et le TTC, puis passer l\'écriture (achat à crédit).', '• TVA = 800 000 × 18 % = 144 000 F ; TTC = 944 000 F.\n• Débit 601 Achats de marchandises : 800 000.\n• Débit 4452 État, TVA récupérable sur achats : 144 000.\n• Crédit 401 Fournisseurs : 944 000.'],
      ['Un prix TTC est de 590 000 F (TVA 18 %). Calculer le prix HT.', '• HT = TTC ÷ 1,18 = 590 000 ÷ 1,18 = 500 000 F.\n• TVA = 90 000 F.']],
    i: [['paires', 'Associe chaque compte à son intitulé.', '401=Fournisseurs|411=Clients|4431=État, TVA facturée sur ventes|521=Banques'],
      ['trous', 'TVA à payer = TVA [[collectée]] − TVA [[déductible]].', 'payée|brute']] },
    'niv-LICENCE-m1-c2': { x: [
      ['Matériel acquis 6 000 000 F, durée 5 ans, amortissement linéaire. Calculer l\'annuité et la VNC après 2 ans.', '• Taux = 100 ÷ 5 = 20 % ; annuité = 6 000 000 × 20 % = 1 200 000 F.\n• Cumul après 2 ans : 2 400 000 F.\n• VNC = 6 000 000 − 2 400 000 = 3 600 000 F.'],
      ['Pourquoi constate-t-on une dépréciation des créances douteuses ?', '• Principe de prudence : on constate dès la clôture une perte probable sur un client qui risque de ne pas payer.\n• On enregistre une dotation en charge et on crédite le compte 491 Dépréciations des comptes clients.']],
    i: [['paires', 'Associe chaque opération à sa définition.', 'Amortissement=constater l\'usure d\'une immobilisation|Dépréciation=constater une perte probable de valeur|Charge constatée d\'avance=charge payée concernant l\'exercice suivant|Inventaire=recensement des éléments d\'actif et de passif'],
      ['trous', 'Taux d\'amortissement linéaire = 100 ÷ [[durée]] d\'utilisation ; VNC = valeur d\'origine − [[cumul]] des amortissements.', 'prix|taux']] },
    'niv-LICENCE-m2-c0': { x: [
      ['Série : 4 ; 8 ; 6 ; 5 ; 7. Calculer la moyenne et la variance.', '• Moyenne = 30 ÷ 5 = 6.\n• Écarts au carré : 4 ; 4 ; 0 ; 1 ; 1 (somme 10).\n• Variance = 10 ÷ 5 = 2 ; écart type = √2 ≈ 1,414.'],
      ['Moyenne 50 et écart type 5 : calculer le coefficient de variation.', '• CV = écart type ÷ moyenne = 5 ÷ 50 = 0,10 = 10 %.\n• La série est peu dispersée.']],
    i: [['paires', 'Associe chaque indicateur à sa définition.', 'Variance=moyenne des carrés des écarts à la moyenne|Écart type=racine carrée de la variance|Premier quartile=25 % des valeurs sont en dessous|Coefficient de variation=écart type ÷ moyenne'],
      ['trous', 'La médiane partage une série ordonnée en deux groupes de même [[effectif]] ; elle est moins sensible que la moyenne aux valeurs [[extrêmes]].', 'fréquence|moyennes']] },
    'niv-LICENCE-m2-c1': { x: [
      ['X suit une loi binomiale B(10 ; 0,3). Calculer l\'espérance et la variance.', '• E(X) = n p = 10 × 0,3 = 3.\n• V(X) = n p (1 − p) = 10 × 0,3 × 0,7 = 2,1.'],
      ['Comment interpréter un coefficient de corrélation r = 0,95 ?', '• r est proche de 1 : forte corrélation linéaire positive.\n• Un ajustement par une droite (moindres carrés) est justifié, mais corrélation ne veut pas dire causalité.']],
    i: [['paires', 'Associe chaque loi à son espérance.', 'Binomiale B(n ; p)=np|Poisson P(λ)=λ|Normale N(μ ; σ)=μ|Uniforme sur [a ; b]=(a + b)/2'],
      ['trous', 'Le coefficient de corrélation r est compris entre [[−1]] et [[1]].', '0|100']] },
    'niv-LICENCE-m3-c0': { x: [
      ['Écrire un algorithme qui calcule la somme des entiers de 1 à n.', '• Lire n ; somme ← 0.\n• Pour i de 1 à n : somme ← somme + i.\n• Afficher somme.\nAstuce : vérification avec la formule n(n + 1)/2.'],
      ['Qu\'affiche : x ← 5 ; y ← 3 ; x ← x + y ; y ← x − y ; x ← x − y ; afficher x, y ?', '• x = 8, puis y = 8 − 3 = 5, puis x = 8 − 5 = 3.\nRéponse : 3 et 5 (les valeurs ont été échangées sans variable auxiliaire).']],
    i: [['ordre', 'Remets dans l\'ordre l\'algorithme de recherche du maximum.', 'max ← premier élément|Pour chaque élément suivant|Si élément > max alors max ← élément|Fin pour|Afficher max'],
      ['paires', 'Associe chaque structure à son rôle.', 'Si … alors … sinon=faire un choix|Pour … de … à=répéter un nombre connu de fois|Tant que=répéter tant qu\'une condition est vraie|Fonction=regrouper des instructions réutilisables']] },
    'niv-LICENCE-m3-c1': { x: [
      ['Table eleves(id, nom, niveau). Écrire la requête qui affiche le nom des élèves de niveau BAC, triés par nom.', 'SELECT nom FROM eleves WHERE niveau = \'BAC\' ORDER BY nom;'],
      ['Compter le nombre d\'élèves par niveau.', 'SELECT niveau, COUNT(*) AS nombre FROM eleves GROUP BY niveau;']],
    i: [['paires', 'Associe chaque mot-clé SQL à son rôle.', 'SELECT=choisir les colonnes|WHERE=filtrer les lignes|ORDER BY=trier|GROUP BY=regrouper pour calculer des agrégats'],
      ['trous', 'Une clé [[primaire]] identifie chaque ligne de façon unique ; une clé [[étrangère]] fait référence à la clé d\'une autre table.', 'secondaire|locale']] },
    'niv-LICENCE-m3-c2': { x: [
      ['Combien d\'adresses d\'hôtes utilisables compte un réseau /24 ?', '• 32 − 24 = 8 bits pour les hôtes : 2⁸ = 256 adresses.\n• On retire l\'adresse du réseau et celle de diffusion : 254 hôtes.'],
      ['Citer trois bonnes pratiques de sécurité informatique.', '• Mots de passe longs et uniques, double authentification.\n• Mises à jour régulières et antivirus.\n• Sauvegardes et méfiance face aux liens douteux (hameçonnage).']],
    i: [['paires', 'Associe chaque protocole à son usage.', 'HTTPS=navigation web sécurisée|SMTP=envoi des e-mails|DNS=traduire un nom de domaine en adresse IP|DHCP=attribuer automatiquement une adresse IP'],
      ['ordre', 'Range les couches du modèle TCP/IP de la plus basse à la plus haute.', 'Accès réseau|Internet|Transport|Application']] },
    'niv-LICENCE-m4-c0': { x: [
      ['Le prix d\'un bien passe de 100 F à 120 F et la quantité demandée de 50 à 40 unités. Calculer l\'élasticité-prix.', '• Variation de la quantité : (40 − 50) ÷ 50 = −20 %.\n• Variation du prix : (120 − 100) ÷ 100 = +20 %.\n• e = −20 % ÷ 20 % = −1 : élasticité unitaire.'],
      ['CT = 2q² + 10q + 50. Calculer le coût marginal et le coût moyen pour q = 5.', '• Cm = CT\' = 4q + 10, donc Cm(5) = 30.\n• CT(5) = 50 + 50 + 50 = 150 ; CM = 150 ÷ 5 = 30.']],
    i: [['paires', 'Associe chaque notion à sa définition.', 'Coût marginal=coût d\'une unité supplémentaire|Utilité marginale=satisfaction d\'une unité supplémentaire|Élasticité-prix=sensibilité de la demande au prix|Équilibre=offre égale à la demande'],
      ['trous', 'Si le prix est supérieur au prix d\'équilibre, il y a un [[excédent]] d\'offre et le prix tend à [[baisser]].', 'pénurie|monter']] },
    'niv-LICENCE-m4-c1': { x: [
      ['C = 800, I = 200, G = 300, X = 150 et M = 250 (milliards de F). Calculer le PIB.', '• PIB = C + I + G + X − M.\n• PIB = 800 + 200 + 300 + 150 − 250 = 1 200 milliards de F.'],
      ['Citer les 4 P du marketing mix.', '• Produit, Prix, Place (distribution), Promotion (communication).']],
    i: [['paires', 'Associe chaque politique à son instrument.', 'Politique monétaire=taux directeurs de la BCEAO|Politique budgétaire=dépenses publiques et impôts|Politique commerciale=droits de douane|Marketing mix=produit, prix, distribution, communication'],
      ['trous', 'L\'inflation est une hausse [[générale]] et durable des [[prix]].', 'ponctuelle|salaires']] },
    'niv-LICENCE-m5-c0': { x: [
      ['Distinguer droit objectif et droits subjectifs.', '• Droit objectif : ensemble des règles qui régissent la vie en société (ex. : le Code du travail).\n• Droits subjectifs : prérogatives reconnues à une personne (droit de propriété, droit de vote).'],
      ['Présenter la hiérarchie des normes au Bénin.', '• Constitution.\n• Traités et accords internationaux régulièrement ratifiés (autorité supérieure aux lois).\n• Lois (organiques et ordinaires).\n• Règlements : décrets, puis arrêtés.']],
    i: [['ordre', 'Range de la norme la plus haute à la plus basse.', 'Constitution|Traités internationaux|Lois|Décrets|Arrêtés'],
      ['paires', 'Associe chaque source du droit à sa définition.', 'Loi=règle votée par le Parlement|Jurisprudence=solutions dégagées par les tribunaux|Coutume=usage répété jugé obligatoire|Doctrine=opinions des juristes']] },
    'niv-LICENCE-m5-c1': { x: [
      ['Combien faut-il d\'associés au minimum pour créer une SARL et une SA selon l\'AUSCGIE ?', '• SARL : une seule personne suffit (SARL unipersonnelle).\n• SA : elle peut aussi ne comprendre qu\'un seul actionnaire.'],
      ['Quel est le capital minimum d\'une SA selon l\'AUSCGIE ?', '• 10 000 000 F CFA, divisé en actions d\'une valeur nominale d\'au moins 10 000 F CFA.']],
    i: [['paires', 'Associe chaque forme de société à son trait principal.', 'SARL=parts sociales, responsabilité limitée aux apports|SA=actions, capital minimum de 10 000 000 F CFA|SNC=associés tenus indéfiniment et solidairement|GIE=faciliter l\'activité économique de ses membres'],
      ['trous', 'Dans une SARL, la responsabilité des associés est limitée au montant de leurs [[apports]] ; leurs titres s\'appellent des [[parts sociales]].', 'actions|salaires']] },
    'niv-LICENCE-m5-c2': { x: [
      ['Qu\'est-ce qu\'un contrat de travail ? Quels sont ses éléments constitutifs ?', '• Convention par laquelle une personne s\'engage à travailler pour une autre, contre rémunération.\n• Trois éléments : une prestation de travail, une rémunération, un lien de subordination.'],
      ['Différence entre CDD et CDI ?', '• CDD : contrat à durée déterminée, qui prend fin à une date ou à la fin d\'une tâche précise.\n• CDI : contrat à durée indéterminée, forme normale de la relation de travail ; sa rupture obéit à des règles (préavis, motif).']],
    i: [['paires', 'Associe chaque terme à sa définition.', 'CDD=contrat à durée déterminée|CDI=contrat à durée indéterminée|Période d\'essai=temps pour évaluer le salarié|Préavis=délai à respecter avant la rupture'],
      ['trous', 'Le lien de [[subordination]] distingue le contrat de travail du contrat d\'entreprise.', 'parenté|amitié']] },
    'niv-LICENCE-m6-c0': { x: [
      ['Présenter les principes de l\'organisation scientifique du travail (Taylor).', '• Division verticale (ceux qui conçoivent / ceux qui exécutent) et horizontale (tâches simples).\n• Étude des temps et des gestes : « one best way ».\n• Salaire au rendement et contrôle strict.'],
      ['Quel est l\'apport de l\'école des relations humaines (Elton Mayo) ?', '• Expériences de Hawthorne : la productivité dépend aussi des relations, de la reconnaissance et du climat du groupe.\n• Le salarié n\'est pas motivé seulement par l\'argent.']],
    i: [['paires', 'Associe chaque auteur à son apport.', 'Taylor=organisation scientifique du travail|Fayol=fonction administrative (prévoir, organiser, commander, coordonner, contrôler)|Weber=modèle bureaucratique|Maslow=pyramide des besoins'],
      ['ordre', 'Range les besoins de Maslow de la base au sommet.', 'Physiologiques|Sécurité|Appartenance|Estime|Accomplissement de soi']] },
    'niv-LICENCE-m6-c1': { x: [
      ['Quelles sont les étapes d\'un processus de recrutement ?', '• Définir le besoin et le profil du poste.\n• Rechercher les candidats (annonce, réseau, cabinet).\n• Présélectionner les dossiers ; entretiens et tests.\n• Décider, puis intégrer la nouvelle recrue.'],
      ['Quelle différence entre leadership et management ?', '• Le management organise, planifie et contrôle les ressources pour atteindre les objectifs.\n• Le leadership inspire et entraîne les personnes, souvent dans le changement. Un bon responsable combine les deux.']],
    i: [['ordre', 'Remets dans l\'ordre le processus de recrutement.', 'Définir le besoin et le profil|Diffuser l\'offre|Présélectionner les candidatures|Mener les entretiens et tests|Intégrer la nouvelle recrue'],
      ['paires', 'Associe chaque style de leadership à sa description.', 'Directif=le chef décide seul|Participatif=le chef associe l\'équipe aux décisions|Délégatif=le chef confie les décisions à l\'équipe|Persuasif=le chef décide puis explique et convainc']] },
    'niv-LICENCE-m7-c0': { x: [
      ['Donner le plan type d\'un rapport de stage.', '• Page de garde, remerciements, sommaire, sigles.\n• Introduction ; présentation de la structure d\'accueil.\n• Travaux réalisés ; analyse, difficultés et suggestions.\n• Conclusion, bibliographie, annexes.'],
      ['Comment rédiger l\'introduction du rapport ?', '• Présenter le contexte et le choix de la structure.\n• Préciser les objectifs du stage.\n• Annoncer le plan du rapport.']],
    i: [['ordre', 'Remets dans l\'ordre les parties du rapport.', 'Page de garde|Remerciements|Sommaire|Introduction|Présentation de la structure|Travaux réalisés|Conclusion|Annexes'],
      ['trous', 'Les documents trop longs (organigramme, fiches) sont placés en [[annexe]] ; les sources consultées dans la [[bibliographie]].', 'introduction|conclusion']] },
    'niv-LICENCE-m7-c1': { x: [
      ['Formuler une problématique et une hypothèse pour le thème « Mobile Money et inclusion financière au Bénin ».', '• Problématique : dans quelle mesure le Mobile Money favorise-t-il l\'accès des populations non bancarisées aux services financiers au Bénin ?\n• Hypothèse : l\'usage du Mobile Money augmente l\'épargne et l\'accès au crédit des ménages ruraux.'],
      ['Différence entre méthode quantitative et méthode qualitative ?', '• Quantitative : mesurer et chiffrer (questionnaires, statistiques) sur un échantillon représentatif.\n• Qualitative : comprendre les opinions et les comportements (entretiens, observation) sur un petit nombre de cas.']],
    i: [['ordre', 'Remets dans l\'ordre les étapes d\'une recherche.', 'Choix du sujet|Revue de littérature|Problématique et hypothèses|Collecte des données|Analyse et interprétation|Rédaction et soutenance'],
      ['paires', 'Associe chaque terme à sa définition.', 'Hypothèse=réponse provisoire à vérifier|Échantillon=partie représentative de la population|Questionnaire=outil de collecte quantitatif|Entretien semi-directif=outil de collecte qualitatif']] },
    'niv-LICENCE-m7-c2': { x: [
      ['Translate: « Veuillez trouver ci-joint mon CV. »', '• « Please find attached my CV. » (ou « my résumé » en anglais américain).'],
      ['Write the opening and the closing of a formal e-mail.', '• Opening: « Dear Sir or Madam, » (nom inconnu) or « Dear Mr Adjovi, ».\n• Closing: « Yours faithfully, » (nom inconnu) or « Yours sincerely, » (nom connu), then your name.']],
    i: [['paires', 'Match the English word with its French translation.', 'meeting=réunion|deadline=date limite|invoice=facture|to hire=embaucher'],
      ['trous', 'I [[have been]] working here since 2022. Yesterday, I [[sent]] the report.', 'am|send']] },
    'niv-LICENCE-m8-c0': { x: [
      ['Moteur monophasé : U = 230 V, I = 10 A, cos φ = 0,8. Calculer la puissance active.', '• P = U × I × cos φ = 230 × 10 × 0,8 = 1 840 W.\n• Puissance apparente : S = U × I = 2 300 VA.'],
      ['Un transformateur 230 V / 12 V a 1 150 spires au primaire. Combien de spires au secondaire ?', '• N₂/N₁ = U₂/U₁, donc N₂ = 1 150 × 12 ÷ 230 = 60 spires.']],
    i: [['paires', 'Associe chaque puissance à sa formule (monophasé).', 'Puissance active P=U·I·cos φ|Puissance réactive Q=U·I·sin φ|Puissance apparente S=U·I|Facteur de puissance=P ÷ S'],
      ['trous', 'Un transformateur ne fonctionne qu\'en courant [[alternatif]] ; s\'il abaisse la tension, son rapport de transformation est [[inférieur]] à 1.', 'continu|supérieur']] },
    'niv-LICENCE-m8-c1': { x: [
      ['Calculer le volume de béton d\'une dalle de 5 m × 4 m × 0,15 m.', '• V = 5 × 4 × 0,15 = 3 m³.'],
      ['Béton dosé à 350 kg de ciment par m³ : quelle quantité de ciment pour 3 m³ ? Combien de sacs de 50 kg ?', '• 350 × 3 = 1 050 kg de ciment.\n• 1 050 ÷ 50 = 21 sacs.']],
    i: [['paires', 'Associe chaque élément à son rôle.', 'Fondation=transmettre les charges au sol|Poteau=porter les charges verticalement|Poutre=reporter les charges vers les poteaux|Chaînage=solidariser les murs'],
      ['trous', 'Le béton armé associe le béton, qui résiste bien à la [[compression]], et l\'acier, qui résiste à la [[traction]].', 'chaleur|corrosion']] },
    'niv-LICENCE-m8-c2': { x: [
      ['4,5 t de maïs ont été récoltées sur 1,5 ha. Quel est le rendement en t/ha ?', '• Rendement = production ÷ surface = 4,5 ÷ 1,5 = 3 t/ha.'],
      ['Citer trois techniques de lutte contre la dégradation des sols.', '• Rotation des cultures et association avec des légumineuses.\n• Apport de compost ou de fumure organique.\n• Agroforesterie, paillage, cordons pierreux contre l\'érosion.']],
    i: [['paires', 'Associe chaque pratique à son effet.', 'Rotation des cultures=limiter l\'épuisement du sol et les parasites|Compostage=enrichir le sol en matière organique|Agroforesterie=protéger le sol et diversifier les revenus|Goutte-à-goutte=économiser l\'eau'],
      ['trous', 'Les légumineuses comme le niébé ou le soja fixent l\'[[azote]] de l\'air grâce à des bactéries de leurs [[racines]].', 'oxygène|feuilles']] }
  };

  // ---------------------------------------------------------------- API
  const D = G.RSutaData;
  function items(chapId) {
    const c = X[chapId]; if (!c) return [];
    return c.i.map((it, n) => {
      const [t, a, b] = it; const id = chapId + '-i' + n;
      if (t === 'trous') { const ans = []; const q = a.replace(/\[\[(.+?)\]\]/g, (m, w) => { ans.push(w); return '[[' + (ans.length - 1) + ']]'; }); return { id, chap: chapId, t, q, ans, bank: ans.concat((b || '').split('|').filter(Boolean)) }; }
      if (t === 'ordre') return { id, chap: chapId, t, q: a, ans: b.split('|') };
      return { id, chap: chapId, t: 'paires', q: a, pairs: b.split('|').map((p) => { let k = -1; for (let j = 1; j < p.length - 1; j++) if (p[j] === '=' && p[j - 1] !== ' ' && p[j + 1] !== ' ') { k = j; break; } return [p.slice(0, k), p.slice(k + 1)]; }) };
    });
  }
  function corriges(chapId) { const c = X[chapId]; return c ? c.x : []; }
  // Leçon « Exercices corrigés » ajoutée à chaque chapitre (contenu au format des leçons)
  if (D && !D._exosAdded) {
    D._exosAdded = true;
    D.chapitres.forEach((ch) => {
      const xs = corriges(ch.id); if (!xs.length) return;
      const sib = D.lecons.filter((l) => l.chapitre_id === ch.id);
      const contenu = xs.map((x, k) => '## Exercice ' + (k + 1) + '\n' + x[0] + '\n## Corrigé ' + (k + 1) + '\n' + x[1]).join('\n');
      const words = contenu.split(/\s+/).length; const first = sib[0] || {};
      const lesson = { id: ch.id + '-xc', chapitre_id: ch.id, niveau: ch.niveau, matiere: first.matiere || '', titre: 'Exercices corrigés', contenu, contenu_url: null, duree_min: Math.max(5, Math.round(words / 12)), ordre: sib.length + 1, corriges: true };
      const last = sib.length ? D.lecons.indexOf(sib[sib.length - 1]) : D.lecons.length - 1;
      D.lecons.splice(last + 1, 0, lesson);
    });
  }
  G.RSutaExos = { items, corriges, has: (id) => !!X[id], ids: () => Object.keys(X), count: () => Object.values(X).reduce((a, c) => a + c.i.length, 0), countCorriges: () => Object.values(X).reduce((a, c) => a + c.x.length, 0), _X: X };
})(typeof window !== 'undefined' ? window : globalThis);
