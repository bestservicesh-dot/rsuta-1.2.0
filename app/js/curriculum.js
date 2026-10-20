/* RSuta — Contenu pédagogique embarqué (hors-ligne)
   Inspiré des programmes officiels MEMP / MESFTPRIJ / MESRS du Bénin.
   Format : niveau → matières → chapitres → leçons (+ un quiz par chapitre). */
(function (G) {
  'use strict';
  // q: [énoncé, type ('qcm' | 'vf' | 'ouverte'), options, réponse correcte, explication]
  const RAW = {
    CEP: {
      cycle: 'Primaire', theme: 'yellow', icon: 'book',
      matieres: [
        { nom: 'Mathématiques', desc: 'Calcul, mesures et géométrie du CM2', chapitres: [
          { t: 'Les nombres et les quatre opérations', l: [
            ['Lire et écrire les grands nombres', '## Les classes\nOn regroupe les chiffres par 3 à partir de la droite : classe des unités, des mille, des millions.\nExemple : 2 450 375 se lit « deux millions quatre cent cinquante mille trois cent soixante-quinze ».\n• Pour comparer deux nombres, on compte d\'abord leurs chiffres.\n• Au marché, 25 000 F, c\'est vingt-cinq mille francs.'],
            ['Addition, soustraction, multiplication, division', '## Poser une opération\n• On aligne les unités sous les unités.\n• Dans la soustraction, on vérifie avec l\'addition : 85 - 37 = 48 car 48 + 37 = 85.\n• La division : dividende = diviseur × quotient + reste, avec reste < diviseur.\nExemple : 47 ÷ 5 → 47 = 5 × 9 + 2.\n## Priorités\nOn calcule d\'abord entre parenthèses, puis × et ÷, puis + et −.']
          ], q: [
            ['Combien font 7 × 8 ?', 'qcm', ['54', '56', '63', '48'], '56', '7 × 8 = 56 : table de 7.'],
            ['Dans 47 ÷ 5, le reste est :', 'qcm', ['1', '2', '3', '4'], '2', '47 = 5 × 9 + 2.'],
            ['3 + 4 × 2 = 14', 'vf', null, 'Faux', 'On fait d\'abord 4 × 2 = 8, puis 3 + 8 = 11.'],
            ['Écris en chiffres : mille deux cent cinq', 'ouverte', null, '1205', 'Mille (1 000) + deux cent cinq (205) = 1 205.']
          ] },
          { t: 'Fractions et nombres décimaux', l: [
            ['Comprendre les fractions', '## Une fraction, c\'est un partage\nSi on coupe une mangue en 4 parts égales et qu\'on en mange 3, on a mangé 3/4 de la mangue.\n• Le nombre du bas (dénominateur) dit en combien de parts on partage.\n• Le nombre du haut (numérateur) dit combien de parts on prend.\n• 2/4 = 1/2 : ce sont des fractions égales.'],
            ['Les nombres décimaux', '## La virgule\nDans 12,75 : 12 est la partie entière, 75 la partie décimale (7 dixièmes et 5 centièmes).\n• 1/10 = 0,1 et 1/100 = 0,01.\n• Pour additionner des décimaux, on aligne les virgules.\nExemple : 2,5 + 3,75 = 6,25.']
          ], q: [
            ['Quelle fraction est égale à 1/2 ?', 'qcm', ['2/3', '3/6', '1/4', '2/5'], '3/6', '3/6 = 1/2 (on divise haut et bas par 3).'],
            ['0,5 est égal à 1/2', 'vf', null, 'Vrai', '1 ÷ 2 = 0,5.'],
            ['2,5 + 1,25 = ?', 'qcm', ['3,75', '3,30', '4,75', '3,5'], '3,75', 'On aligne les virgules : 2,50 + 1,25 = 3,75.'],
            ['Dans 3/8, quel est le dénominateur ?', 'ouverte', null, '8', 'Le dénominateur est le nombre du bas.']
          ] },
          { t: 'Mesures, périmètres, aires et problèmes', l: [
            ['Les unités de mesure', '## Longueurs\nkm – hm – dam – m – dm – cm – mm : chaque unité vaut 10 fois la suivante.\n## Masses\nt – q – kg – g. 1 kg = 1 000 g ; 1 t = 1 000 kg.\n## Monnaie\nAu Bénin on utilise le franc CFA : 1 pièce de 500 F = 5 pièces de 100 F.'],
            ['Périmètres et aires', '## Le carré\nPérimètre = côté × 4 ; Aire = côté × côté.\n## Le rectangle\nPérimètre = (L + l) × 2 ; Aire = L × l.\n## Le cercle\nPérimètre = diamètre × 3,14 ; Aire = rayon × rayon × 3,14.\nExemple : un champ de 25 m sur 12 m a une aire de 300 m².'],
            ['La règle de trois', '## Passer par l\'unité\nSi 3 cahiers coûtent 900 F, 1 cahier coûte 900 ÷ 3 = 300 F, donc 7 cahiers coûtent 300 × 7 = 2 100 F.\n• On vérifie que la situation est proportionnelle.\n• On n\'oublie jamais la phrase-réponse !']
          ], q: [
            ['1 km = ? m', 'qcm', ['100', '1 000', '10 000', '10'], '1 000', 'Kilo signifie mille.'],
            ['Aire d\'un rectangle de 8 m sur 5 m ?', 'qcm', ['13 m²', '26 m²', '40 m²', '45 m²'], '40 m²', '8 × 5 = 40 m².'],
            ['Le périmètre d\'un carré de côté 6 cm est 24 cm', 'vf', null, 'Vrai', '6 × 4 = 24 cm.'],
            ['5 mangues coûtent 500 F. Combien coûtent 8 mangues (en F) ?', 'ouverte', null, '800', '500 ÷ 5 = 100 F la mangue ; 100 × 8 = 800 F.']
          ] }
        ] },
        { nom: 'Français', desc: 'Grammaire, conjugaison, orthographe et rédaction', chapitres: [
          { t: 'Grammaire, conjugaison et rédaction', l: [
            ['La phrase et ses constituants', '## Sujet – verbe – complément\nDans « Kévin mange une orange », Kévin est le sujet, mange est le verbe, une orange est le complément d\'objet direct.\n• Le verbe s\'accorde avec son sujet.\n• Les types de phrases : déclarative (.), interrogative (?), exclamative (!), impérative.'],
            ['Conjuguer au présent, au futur et au passé composé', '## 1er groupe (verbes en -er)\nPrésent : je chante, tu chantes, il chante, nous chantons, vous chantez, ils chantent.\nFutur : je chanterai, tu chanteras, il chantera…\nPassé composé : j\'ai chanté (avoir) ; je suis allé (être).\n## Astuce\nAvec l\'auxiliaire être, le participe s\'accorde avec le sujet : elles sont parties.'],
            ['Réussir sa rédaction', '## Le plan\n• Introduction : où ? quand ? qui ?\n• Développement : ce qui se passe, dans l\'ordre (d\'abord, ensuite, soudain, enfin).\n• Conclusion : comment ça finit et ce que tu ressens.\nRelis toujours ton texte pour l\'orthographe.']
          ], q: [
            ['Dans « Les élèves chantent », le sujet est :', 'qcm', ['chantent', 'Les élèves', 'Les', 'aucun'], 'Les élèves', 'Qui est-ce qui chante ? Les élèves.'],
            ['« Nous finissons » est conjugué au :', 'qcm', ['passé composé', 'présent', 'futur', 'imparfait'], 'présent', 'Finir (2e groupe) au présent : nous finissons.'],
            ['« Elles sont allé » est correct', 'vf', null, 'Faux', 'Avec être, on accorde : elles sont allées.'],
            ['Conjugue « parler » au futur avec « je »', 'ouverte', null, 'je parlerai', 'Futur : infinitif + -ai.']
          ] }
        ] },
        { nom: 'Éducation scientifique', desc: 'Le corps humain, la santé et l\'environnement', chapitres: [
          { t: 'Le corps humain, l\'hygiène et la santé', l: [
            ['La digestion', '## Le trajet des aliments\nBouche → œsophage → estomac → intestin grêle → gros intestin.\n• Les dents broient, la salive humidifie.\n• Dans l\'intestin grêle, les nutriments passent dans le sang.\nUne alimentation équilibrée contient des aliments énergétiques (igname, maïs), bâtisseurs (poisson, haricot) et protecteurs (fruits, légumes).'],
            ['Le paludisme et l\'hygiène', '## Le paludisme\nIl est transmis par la piqûre du moustique anophèle femelle infecté.\n• Prévention : dormir sous moustiquaire imprégnée, supprimer les eaux stagnantes.\n• Symptômes : fièvre, frissons, maux de tête → aller vite au centre de santé.\n## L\'hygiène\nSe laver les mains au savon avant de manger et après les toilettes.']
          ], q: [
            ['Le paludisme est transmis par :', 'qcm', ['la mouche', 'l\'anophèle femelle', 'le cafard', 'l\'eau du puits'], 'l\'anophèle femelle', 'C\'est la piqûre du moustique anophèle femelle infecté.'],
            ['Le poisson est un aliment bâtisseur', 'vf', null, 'Vrai', 'Il est riche en protéines qui construisent le corps.'],
            ['Où les nutriments passent-ils dans le sang ?', 'qcm', ['l\'estomac', 'la bouche', 'l\'intestin grêle', 'l\'œsophage'], 'l\'intestin grêle', 'L\'absorption se fait à travers la paroi de l\'intestin grêle.'],
            ['Quel objet protège des moustiques la nuit ?', 'ouverte', null, 'moustiquaire', 'La moustiquaire imprégnée d\'insecticide.']
          ] }
        ] }
      ]
    },
    BEPC: {
      cycle: 'Collège', theme: 'blue', icon: 'cap',
      matieres: [
        { nom: 'Mathématiques', desc: 'Programme de 3e : calcul littéral, équations, géométrie, statistiques', chapitres: [
          { t: 'Calcul littéral et identités remarquables', l: [
            ['Développer une expression', '## Distributivité\nk(a + b) = ka + kb et (a + b)(c + d) = ac + ad + bc + bd.\nExemple : (2x + 3)(x - 4) = 2x² - 8x + 3x - 12 = 2x² - 5x - 12.\n## Identités remarquables\n(a + b)² = a² + 2ab + b²\n(a - b)² = a² - 2ab + b²\n(a + b)(a - b) = a² - b²'],
            ['Factoriser', '## Facteur commun\nka + kb = k(a + b). Exemple : (x + 1)(2x - 3) + (x + 1)(x + 5) = (x + 1)(3x + 2).\n## Avec les identités\n4x² - 9 = (2x - 3)(2x + 3) ; x² + 6x + 9 = (x + 3)².\nAstuce de pro : comme un coéquipier au foot, repère le facteur qui revient partout !']
          ], q: [
            ['(x + 3)² = ?', 'qcm', ['x² + 9', 'x² + 6x + 9', 'x² + 3x + 9', '2x + 6'], 'x² + 6x + 9', '(a + b)² = a² + 2ab + b².'],
            ['x² - 25 = (x - 5)(x + 5)', 'vf', null, 'Vrai', 'a² - b² = (a - b)(a + b).'],
            ['Développe 3(2x - 4)', 'ouverte', null, '6x - 12', '3 × 2x - 3 × 4.'],
            ['Factorise 5x + 15', 'qcm', ['5(x + 3)', '5(x + 15)', 'x(5 + 15)', '15(x + 5)'], '5(x + 3)', '5 est le facteur commun.']
          ] },
          { t: 'Équations et inéquations du premier degré', l: [
            ['Résoudre une équation', '## La balance\nOn peut ajouter, soustraire, multiplier ou diviser les deux membres par un même nombre (non nul).\nExemple : 2x + 5 = 13 → 2x = 8 → x = 4.\n## Équation produit\nA × B = 0 ⇔ A = 0 ou B = 0.'],
            ['Résoudre une inéquation', '## Attention au sens !\nSi on multiplie ou divise par un nombre NÉGATIF, on change le sens de l\'inégalité.\nExemple : -3x < 12 → x > -4. On représente la solution sur une droite graduée.']
          ], q: [
            ['La solution de 3x - 7 = 11 est :', 'qcm', ['x = 4', 'x = 6', 'x = 18', 'x = -6'], 'x = 6', '3x = 18 donc x = 6.'],
            ['-2x > 6 donne x > -3', 'vf', null, 'Faux', 'On divise par -2 : on change le sens, x < -3.'],
            ['(x - 2)(x + 5) = 0 a pour solutions :', 'qcm', ['2 et 5', '-2 et 5', '2 et -5', '-2 et -5'], '2 et -5', 'x - 2 = 0 ou x + 5 = 0.'],
            ['Résous x + 9 = 4', 'ouverte', null, '-5', 'x = 4 - 9 = -5.']
          ] },
          { t: 'Systèmes de deux équations', l: [
            ['Méthode par substitution', '## Principe\nOn isole une inconnue dans une équation, puis on la remplace dans l\'autre.\nExemple : 2x + y = 7 et x - y = -1. De (1) : y = 7 - 2x. Dans (2) : x - (7 - 2x) = -1 → 3x = 6 → x = 2, y = 3.'],
            ['Méthode par combinaison', '## Principe\nOn multiplie les équations pour que les coefficients d\'une inconnue soient opposés, puis on additionne.\nC\'est la méthode préférée quand aucun coefficient ne vaut 1.\nToujours vérifier le couple dans LES DEUX équations.']
          ], q: [
            ['Le couple (2 ; 3) est solution de x + y = 5 et x - y = -1', 'vf', null, 'Vrai', '2 + 3 = 5 et 2 - 3 = -1.'],
            ['Pour x + y = 10 et x - y = 2, x vaut :', 'qcm', ['4', '5', '6', '8'], '6', 'En additionnant : 2x = 12.'],
            ['Combien d\'inconnues dans un système 2×2 ?', 'ouverte', null, '2', 'Deux équations, deux inconnues.'],
            ['La méthode qui élimine une inconnue en additionnant s\'appelle :', 'qcm', ['substitution', 'combinaison', 'comparaison', 'graphique'], 'combinaison', 'On combine les équations.']
          ] },
          { t: 'Théorèmes de Pythagore et de Thalès', l: [
            ['Le théorème de Pythagore', '## Énoncé\nSi ABC est rectangle en A, alors BC² = AB² + AC² (BC est l\'hypoténuse).\nExemple : AB = 3, AC = 4 → BC² = 25 → BC = 5.\n## Réciproque\nSi BC² = AB² + AC², alors le triangle est rectangle en A.'],
            ['Le théorème de Thalès', '## Énoncé\nSi (MN) // (BC) avec M ∈ [AB] et N ∈ [AC], alors AM/AB = AN/AC = MN/BC.\nOn utilise les rapports égaux pour calculer une longueur (produit en croix).']
          ], q: [
            ['Dans un triangle rectangle, l\'hypoténuse est :', 'qcm', ['le plus petit côté', 'le côté opposé à l\'angle droit', 'la hauteur', 'la médiane'], 'le côté opposé à l\'angle droit', 'C\'est aussi le plus grand côté.'],
            ['Un triangle de côtés 6, 8, 10 est rectangle', 'vf', null, 'Vrai', '36 + 64 = 100.'],
            ['AB = 5, AC = 12, rectangle en A. BC = ?', 'ouverte', null, '13', '25 + 144 = 169 = 13².'],
            ['Thalès s\'applique avec des droites :', 'qcm', ['perpendiculaires', 'parallèles', 'sécantes quelconques', 'confondues'], 'parallèles', '(MN) // (BC).']
          ] },
          { t: 'Statistiques et proportionnalité', l: [
            ['Moyenne, médiane, effectifs', '## Moyenne\nMoyenne = somme des valeurs ÷ effectif total.\n## Médiane\nValeur qui partage la série rangée en deux groupes de même effectif.\n## Fréquence\nf = effectif ÷ effectif total (souvent en %).'],
            ['Pourcentages', '## Calculer t % d\'un nombre\nt % de N = N × t ÷ 100.\nUne hausse de 20 % revient à multiplier par 1,20 ; une remise de 20 % revient à multiplier par 0,80.']
          ], q: [
            ['Moyenne de 10 ; 12 ; 14 ?', 'qcm', ['11', '12', '13', '36'], '12', '36 ÷ 3 = 12.'],
            ['20 % de 5 000 = 1 000', 'vf', null, 'Vrai', '5 000 × 20 ÷ 100.'],
            ['Médiane de 3 ; 7 ; 9 ; 12 ; 20 ?', 'ouverte', null, '9', 'La valeur du milieu.'],
            ['Une remise de 10 % revient à multiplier par :', 'qcm', ['0,1', '0,9', '1,1', '10'], '0,9', '1 - 0,10 = 0,90.']
          ] }
        ] },
        { nom: 'Physique-Chimie-Technologie', desc: 'Électricité, mécanique et chimie de 3e', chapitres: [
          { t: 'Électricité : loi d\'Ohm et puissance', l: [
            ['La loi d\'Ohm', '## Énoncé\nU = R × I avec U en volts (V), R en ohms (Ω), I en ampères (A).\nExemple : R = 220 Ω, I = 0,5 A → U = 110 V.\n• Voltmètre : branché en dérivation. Ampèremètre : en série.'],
            ['Puissance et énergie électriques', '## Formules\nP = U × I (watts) ; E = P × t (joules si t en secondes, Wh si t en heures).\nAstuce : une ampoule de 60 W allumée 5 h consomme 300 Wh.']
          ], q: [
            ['L\'unité de la résistance est :', 'qcm', ['volt', 'ampère', 'ohm', 'watt'], 'ohm', 'Symbole Ω.'],
            ['L\'ampèremètre se branche en série', 'vf', null, 'Vrai', 'Il mesure le courant qui traverse le circuit.'],
            ['U = 12 V, I = 2 A. R = ? (en Ω)', 'ouverte', null, '6', 'R = U ÷ I.'],
            ['P = U × I donne la :', 'qcm', ['tension', 'puissance', 'résistance', 'énergie'], 'puissance', 'En watts.']
          ] },
          { t: 'Masse, volume et masse volumique', l: [
            ['La masse volumique', '## Formule\nρ = m ÷ V. Pour l\'eau, ρ = 1 g/cm³ = 1 000 kg/m³.\n• Un corps flotte sur l\'eau si sa masse volumique est inférieure à celle de l\'eau.\nExemple : 200 g de fer occupent environ 25,6 cm³ (ρ ≈ 7,8 g/cm³).'],
            ['Poids et masse', '## Différence\nLa masse (kg) ne change pas ; le poids (N) dépend de la pesanteur : P = m × g avec g = 10 N/kg.']
          ], q: [
            ['La masse volumique de l\'eau est :', 'qcm', ['1 g/cm³', '10 g/cm³', '0,1 g/cm³', '100 g/cm³'], '1 g/cm³', 'Valeur de référence.'],
            ['Le poids s\'exprime en kilogrammes', 'vf', null, 'Faux', 'Le poids s\'exprime en newtons (N).'],
            ['m = 3 kg, g = 10 N/kg. P = ? (N)', 'ouverte', null, '30', 'P = m × g.'],
            ['Un objet de ρ = 0,8 g/cm³ dans l\'eau :', 'qcm', ['coule', 'flotte', 'se dissout', 'explose'], 'flotte', '0,8 < 1.']
          ] },
          { t: 'Atomes, molécules et réactions chimiques', l: [
            ['L\'atome et la molécule', '## Structure\nL\'atome = noyau (protons + neutrons) + électrons. Une molécule = assemblage d\'atomes : H₂O, CO₂, O₂.\n## Conservation\nAu cours d\'une réaction, les atomes se conservent : on équilibre l\'équation.'],
            ['Combustions', '## Combustion du carbone\nC + O₂ → CO₂. Le dioxyde de carbone trouble l\'eau de chaux.\nLa combustion incomplète (charbon dans une pièce fermée) produit du monoxyde de carbone CO, très dangereux.']
          ], q: [
            ['La formule de l\'eau est :', 'qcm', ['HO', 'H₂O', 'H₂O₂', 'OH₂'], 'H₂O', 'Deux atomes d\'hydrogène et un d\'oxygène.'],
            ['Le CO₂ trouble l\'eau de chaux', 'vf', null, 'Vrai', 'C\'est le test du dioxyde de carbone.'],
            ['Équilibre : 2H₂ + O₂ → ? H₂O', 'ouverte', null, '2', '2H₂ + O₂ → 2H₂O.'],
            ['Le gaz dangereux d\'une combustion incomplète est :', 'qcm', ['O₂', 'CO', 'N₂', 'H₂'], 'CO', 'Le monoxyde de carbone.']
          ] }
        ] },
        { nom: 'SVT', desc: 'Sciences de la vie et de la Terre', chapitres: [
          { t: 'Nutrition et santé', l: [
            ['La digestion et l\'absorption', '## Les enzymes\nLes sucs digestifs contiennent des enzymes (amylase, pepsine, lipase) qui découpent les aliments en nutriments : glucose, acides aminés, acides gras.\nL\'absorption se fait au niveau des villosités de l\'intestin grêle.'],
            ['Maladies nutritionnelles', '## Exemples\n• Kwashiorkor : carence en protéines chez l\'enfant.\n• Goitre : carence en iode → sel iodé.\n• Obésité, diabète : excès de sucres et de graisses.']
          ], q: [
            ['L\'amylase salivaire digère :', 'qcm', ['les protéines', 'l\'amidon', 'les lipides', 'les vitamines'], 'l\'amidon', 'Elle transforme l\'amidon en maltose.'],
            ['Le kwashiorkor est dû à un manque de protéines', 'vf', null, 'Vrai', 'Carence protéique.'],
            ['Quelle carence provoque le goitre ?', 'ouverte', null, 'iode', 'On utilise du sel iodé.'],
            ['L\'absorption a lieu dans :', 'qcm', ['l\'estomac', 'l\'intestin grêle', 'le foie', 'la bouche'], 'l\'intestin grêle', 'Grâce aux villosités.']
          ] },
          { t: 'Reproduction humaine et IST', l: [
            ['Les organes reproducteurs', '## Chez la femme\nOvaires (ovules), trompes, utérus. Cycle d\'environ 28 jours, ovulation vers le 14e jour.\n## Chez l\'homme\nTesticules (spermatozoïdes). La fécondation a lieu dans la trompe.'],
            ['Prévenir les IST et le VIH/SIDA', '## Prévention\nAbstinence, fidélité, préservatif. Dépistage gratuit dans les centres de santé.\nLe VIH se transmet par voie sexuelle, sanguine et de la mère à l\'enfant.']
          ], q: [
            ['La fécondation a lieu dans :', 'qcm', ['l\'utérus', 'la trompe', 'l\'ovaire', 'le vagin'], 'la trompe', 'Rencontre ovule–spermatozoïde.'],
            ['Le VIH peut se transmettre par le sang', 'vf', null, 'Vrai', 'Objets tranchants, transfusion non contrôlée.'],
            ['Durée moyenne d\'un cycle menstruel (jours) ?', 'ouverte', null, '28', 'En moyenne 28 jours.'],
            ['Les spermatozoïdes sont produits par :', 'qcm', ['la prostate', 'les testicules', 'l\'urètre', 'la vessie'], 'les testicules', 'Gonades mâles.']
          ] }
        ] },
        { nom: 'Français', desc: 'Grammaire, expression écrite', chapitres: [
          { t: 'Grammaire et figures de style', l: [
            ['Les propositions subordonnées', '## Types\n• Relative (qui, que, dont, où) : complète un nom.\n• Conjonctive (que) : complète un verbe.\n• Circonstancielle (quand, parce que, bien que…) : temps, cause, concession…'],
            ['Les figures de style', '## Principales figures\nComparaison (comme), métaphore (sans outil), personnification, hyperbole (exagération), antithèse (opposition), anaphore (répétition en début de vers).']
          ], q: [
            ['« Il est fort comme un baobab » est une :', 'qcm', ['métaphore', 'comparaison', 'hyperbole', 'anaphore'], 'comparaison', 'Présence de « comme ».'],
            ['« Le livre que je lis » contient une relative', 'vf', null, 'Vrai', '« que je lis » complète « livre ».'],
            ['Figure qui exagère ?', 'ouverte', null, 'hyperbole', 'Ex : « Je meurs de faim ».'],
            ['« Bien que » introduit :', 'qcm', ['la cause', 'la concession', 'le but', 'le temps'], 'la concession', 'Opposition.']
          ] },
          { t: 'Expression écrite : rédaction et lettre', l: [
            ['Le texte argumentatif', '## Structure\nIntroduction (thème + thèse), développement (arguments + exemples + connecteurs : d\'abord, de plus, cependant, enfin), conclusion.'],
            ['La lettre', '## Présentation\nLieu et date, formule d\'appel, corps de la lettre, formule de politesse, signature.\nLettre officielle : ton respectueux, objet précis.']
          ], q: [
            ['Un argument doit être illustré par :', 'qcm', ['une question', 'un exemple', 'une rime', 'un titre'], 'un exemple', 'L\'exemple rend l\'argument concret.'],
            ['« Cependant » exprime l\'opposition', 'vf', null, 'Vrai', 'Connecteur d\'opposition.'],
            ['Dans une lettre, où place-t-on la date ?', 'qcm', ['en bas', 'en haut', 'au milieu', 'nulle part'], 'en haut', 'En haut à droite avec le lieu.'],
            ['Cite un connecteur d\'addition', 'ouverte', null, 'de plus', 'De plus, en outre, aussi…']
          ] }
        ] }
      ]
    },
    BAC: {
      cycle: 'Lycée', theme: 'blue', icon: 'diploma',
      matieres: [
        { nom: 'Mathématiques', desc: 'Terminale C, D, A, B', chapitres: [
          { t: 'Limites et continuité', l: [
            ['Limites usuelles', '## Polynômes\nEn ±∞, un polynôme a la même limite que son terme de plus haut degré.\n## Formes indéterminées\n∞ - ∞, 0 × ∞, ∞/∞, 0/0 : on factorise ou on utilise la quantité conjuguée.\nAstuce correcteur : écris toujours « par théorème » ou « par opérations sur les limites ».'],
            ['Continuité et TVI', '## Théorème des valeurs intermédiaires\nSi f est continue et strictement monotone sur [a ; b] et si f(a) et f(b) sont de signes contraires, l\'équation f(x) = 0 admet une unique solution sur ]a ; b[.']
          ], q: [
            ['lim (x→+∞) de -2x³ + x = ?', 'qcm', ['+∞', '-∞', '0', '-2'], '-∞', 'Terme dominant -2x³.'],
            ['∞/∞ est une forme indéterminée', 'vf', null, 'Vrai', 'Il faut lever l\'indétermination.'],
            ['lim (x→+∞) de 1/x = ?', 'ouverte', null, '0', '1/x tend vers 0.'],
            ['Le TVI nécessite que f soit :', 'qcm', ['dérivable', 'continue', 'paire', 'positive'], 'continue', 'Continuité sur l\'intervalle.']
          ] },
          { t: 'Dérivation et étude de fonctions', l: [
            ['Dérivées usuelles', '## Formules\n(xⁿ)\' = nxⁿ⁻¹ ; (1/x)\' = -1/x² ; (√x)\' = 1/(2√x)\n(uv)\' = u\'v + uv\' ; (u/v)\' = (u\'v - uv\')/v²\n(ln u)\' = u\'/u ; (eᵘ)\' = u\'eᵘ'],
            ['Sens de variation', '## Méthode\n1) Calculer f\'(x). 2) Étudier son signe. 3) Dresser le tableau de variations avec les limites et extremums.\nf\' > 0 ⇒ f croissante ; f\' < 0 ⇒ f décroissante.']
          ], q: [
            ['La dérivée de x³ est :', 'qcm', ['3x', 'x²', '3x²', '3x³'], '3x²', '(xⁿ)\' = nxⁿ⁻¹.'],
            ['Si f\' > 0 sur I, f est croissante sur I', 'vf', null, 'Vrai', 'Théorème du signe de la dérivée.'],
            ['Dérivée de 5x² - 3x + 1 ?', 'ouverte', null, '10x - 3', '10x - 3.'],
            ['(ln x)\' = ?', 'qcm', ['x', '1/x', 'ln x', 'eˣ'], '1/x', 'Pour x > 0.']
          ] },
          { t: 'Fonctions logarithme et exponentielle', l: [
            ['La fonction ln', '## Propriétés\nln(ab) = ln a + ln b ; ln(a/b) = ln a - ln b ; ln(aⁿ) = n ln a ; ln 1 = 0 ; ln e = 1.\nDéfinie sur ]0 ; +∞[, strictement croissante.'],
            ['La fonction exp', '## Propriétés\neᵃ⁺ᵇ = eᵃ × eᵇ ; e⁰ = 1 ; eˣ > 0 pour tout x. ln(eˣ) = x et e^(ln x) = x pour x > 0.\nCroissances comparées : eˣ/x → +∞ et ln x / x → 0 en +∞.']
          ], q: [
            ['ln(1) = ?', 'qcm', ['0', '1', 'e', '-1'], '0', 'Valeur remarquable.'],
            ['eˣ peut être négatif', 'vf', null, 'Faux', 'eˣ > 0 pour tout réel x.'],
            ['Simplifie ln(e³)', 'ouverte', null, '3', 'ln(eˣ) = x.'],
            ['ln(2) + ln(5) = ?', 'qcm', ['ln 7', 'ln 10', 'ln 2,5', '10'], 'ln 10', 'ln a + ln b = ln(ab).']
          ] },
          { t: 'Suites numériques', l: [
            ['Suites arithmétiques et géométriques', '## Arithmétique\nuₙ₊₁ = uₙ + r ; uₙ = u₀ + nr ; somme = nb termes × (1er + dernier)/2.\n## Géométrique\nuₙ₊₁ = q·uₙ ; uₙ = u₀·qⁿ ; somme = 1er × (1 - qⁿᵇ)/(1 - q).'],
            ['Raisonnement par récurrence', '## Méthode\n1) Initialisation : la propriété est vraie au rang n₀. 2) Hérédité : si elle est vraie au rang n, elle l\'est au rang n + 1. 3) Conclusion.']
          ], q: [
            ['u₀ = 2, r = 3 : u₄ = ?', 'qcm', ['12', '14', '11', '9'], '14', 'u₄ = 2 + 4 × 3.'],
            ['Une suite géométrique de raison 0,5 et u₀ > 0 est décroissante', 'vf', null, 'Vrai', '0 < q < 1.'],
            ['u₀ = 3, q = 2 : u₃ = ?', 'ouverte', null, '24', '3 × 2³.'],
            ['La récurrence comporte combien d\'étapes principales ?', 'qcm', ['1', '2', '3', '4'], '2', 'Initialisation et hérédité (+ conclusion).']
          ] },
          { t: 'Nombres complexes', l: [
            ['Forme algébrique', '## Définition\nz = a + ib avec i² = -1. Conjugué : z̄ = a - ib. Module |z| = √(a² + b²).\nÉquation az² + bz + c = 0 avec Δ < 0 : z = (-b ± i√-Δ)/2a.'],
            ['Forme trigonométrique et exponentielle', '## Écriture\nz = r(cos θ + i sin θ) = re^(iθ). Formule de Moivre : (e^(iθ))ⁿ = e^(inθ).\nInterprétation géométrique : rotations, similitudes.']
          ], q: [
            ['i² = ?', 'qcm', ['1', '-1', 'i', '0'], '-1', 'Définition de i.'],
            ['|3 + 4i| = 5', 'vf', null, 'Vrai', '√(9 + 16) = 5.'],
            ['Conjugué de 2 - 7i ?', 'ouverte', null, '2 + 7i', 'On change le signe de la partie imaginaire.'],
            ['e^(iπ) = ?', 'qcm', ['1', '-1', 'i', '0'], '-1', 'Identité d\'Euler.']
          ] },
          { t: 'Probabilités et dénombrement', l: [
            ['Dénombrement', '## Outils\nArrangements Aₙᵖ = n!/(n-p)! (ordre compte) ; combinaisons Cₙᵖ = n!/(p!(n-p)!) (ordre ne compte pas).'],
            ['Probabilités et loi binomiale', '## Loi binomiale B(n ; p)\nP(X = k) = Cₙᵏ pᵏ (1-p)ⁿ⁻ᵏ ; E(X) = np ; V(X) = np(1-p).\nProbabilité conditionnelle : P_A(B) = P(A∩B)/P(A).']
          ], q: [
            ['C₅² = ?', 'qcm', ['10', '20', '5', '25'], '10', '5!/(2!3!) = 10.'],
            ['Une probabilité peut valoir 1,2', 'vf', null, 'Faux', 'Toujours entre 0 et 1.'],
            ['X ~ B(10 ; 0,3). E(X) = ?', 'ouverte', null, '3', 'np = 3.'],
            ['3! = ?', 'qcm', ['3', '6', '9', '1'], '6', '3 × 2 × 1.']
          ] }
        ] },
        { nom: 'Physique-Chimie', desc: 'Terminale C et D', chapitres: [
          { t: 'Mécanique : lois de Newton', l: [
            ['Deuxième loi de Newton', '## Énoncé\nΣF⃗ = m·a⃗. Méthode : système, référentiel galiléen, bilan des forces, projection sur les axes.\nChute libre : a = g, v = gt, z = ½gt².'],
            ['Mouvements dans un champ', '## Projectile\nTrajectoire parabolique : x = v₀cos α · t ; y = -½gt² + v₀ sin α · t.\nMouvement circulaire uniforme : a = v²/R, dirigée vers le centre.']
          ], q: [
            ['La 2e loi de Newton s\'écrit :', 'qcm', ['F = mv', 'ΣF = ma', 'F = mg²', 'P = UI'], 'ΣF = ma', 'Principe fondamental de la dynamique.'],
            ['En chute libre, l\'accélération vaut g', 'vf', null, 'Vrai', 'Seul le poids agit.'],
            ['v = 10 m/s, R = 5 m. a = v²/R = ? (m/s²)', 'ouverte', null, '20', '100/5.'],
            ['La trajectoire d\'un projectile est :', 'qcm', ['rectiligne', 'circulaire', 'parabolique', 'elliptique'], 'parabolique', 'Équation du 2nd degré.']
          ] },
          { t: 'Électricité : dipôles RC, RL, RLC', l: [
            ['Le dipôle RC', '## Charge d\'un condensateur\nuc(t) = E(1 - e^(-t/τ)) avec τ = RC. À t = 5τ, le condensateur est chargé à 99 %.'],
            ['Oscillations électriques', '## Circuit LC\nPériode propre T₀ = 2π√(LC). Énergie : ½Cu² + ½Li² = constante (sans résistance).']
          ], q: [
            ['La constante de temps d\'un RC est :', 'qcm', ['R/C', 'RC', 'C/R', '√RC'], 'RC', 'τ = RC en secondes.'],
            ['À t = τ, uc = 63 % de E', 'vf', null, 'Vrai', '1 - e⁻¹ ≈ 0,63.'],
            ['T₀ = 2π√(LC) concerne le circuit :', 'qcm', ['RC', 'LC', 'RL', 'R'], 'LC', 'Oscillations libres.'],
            ['R = 1 000 Ω, C = 0,001 F. τ = ? (s)', 'ouverte', null, '1', '1 000 × 0,001.']
          ] },
          { t: 'Chimie organique', l: [
            ['Fonctions organiques', '## Groupes caractéristiques\nAlcool (-OH), aldéhyde (-CHO), cétone (C=O), acide carboxylique (-COOH), ester (-COO-), amine (-NH₂).'],
            ['Estérification', '## Réaction\nAcide + alcool ⇌ ester + eau. Réaction lente, limitée, athermique. Rendement ≈ 67 % pour un alcool primaire (mélange équimolaire).']
          ], q: [
            ['Le groupe -COOH caractérise :', 'qcm', ['un alcool', 'un acide carboxylique', 'une amine', 'un ester'], 'un acide carboxylique', 'Groupe carboxyle.'],
            ['L\'estérification est totale', 'vf', null, 'Faux', 'Elle est limitée.'],
            ['Acide + alcool donne ester + ?', 'ouverte', null, 'eau', 'Ester + eau.'],
            ['L\'éthanol est un :', 'qcm', ['aldéhyde', 'alcool', 'acide', 'alcane'], 'alcool', 'CH₃-CH₂-OH.']
          ] },
          { t: 'Acides, bases et pH', l: [
            ['pH et couples acide/base', '## Définitions\npH = -log[H₃O⁺]. Acide fort : réaction totale avec l\'eau. Ka = [A⁻][H₃O⁺]/[AH] ; pKa = -log Ka.\npH = pKa + log([A⁻]/[AH]).'],
            ['Dosages', '## Équivalence\nCa·Va = Cb·Vb. On repère l\'équivalence par un saut de pH ou un indicateur coloré (BBT, phénolphtaléine).']
          ], q: [
            ['Une solution de pH = 3 est :', 'qcm', ['basique', 'neutre', 'acide', 'saturée'], 'acide', 'pH < 7.'],
            ['À l\'équivalence, Ca·Va = Cb·Vb', 'vf', null, 'Vrai', 'Pour un monoacide/monobase.'],
            ['[H₃O⁺] = 10⁻⁴ mol/L. pH = ?', 'ouverte', null, '4', 'pH = -log(10⁻⁴).'],
            ['Si pH = pKa alors :', 'qcm', ['[A⁻] = [AH]', '[A⁻] = 0', '[AH] = 0', 'pH = 7'], '[A⁻] = [AH]', 'log(1) = 0.']
          ] }
        ] },
        { nom: 'SVT', desc: 'Terminale D', chapitres: [
          { t: 'Génétique et hérédité', l: [
            ['Les lois de Mendel', '## Monohybridisme\nCroisement de lignées pures : F1 homogène (dominance). F2 : 3/4 phénotype dominant, 1/4 récessif.\nDihybridisme (gènes indépendants) : 9/16, 3/16, 3/16, 1/16.'],
            ['Hérédité humaine', '## Arbres généalogiques\nMaladie récessive autosomique : deux parents sains peuvent avoir un enfant malade (ex. drépanocytose). Liée à l\'X : hémophilie, daltonisme.']
          ], q: [
            ['En F2 d\'un monohybridisme avec dominance :', 'qcm', ['1/2 - 1/2', '3/4 - 1/4', '9/16', '100 %'], '3/4 - 1/4', 'Ségrégation des allèles.'],
            ['La drépanocytose est une maladie héréditaire', 'vf', null, 'Vrai', 'Mutation de l\'hémoglobine.'],
            ['Combien de chromosomes chez l\'humain ?', 'ouverte', null, '46', '23 paires.'],
            ['L\'hémophilie est liée au chromosome :', 'qcm', ['Y', 'X', '21', '1'], 'X', 'Gène porté par X.']
          ] },
          { t: 'Immunologie', l: [
            ['Le soi et le non-soi', '## Défenses\nImmunité innée (barrières, phagocytose, inflammation) puis adaptative : lymphocytes B (anticorps, immunité humorale) et T (immunité cellulaire).'],
            ['Vaccination et VIH', '## Mémoire immunitaire\nLe vaccin crée des cellules mémoire : réponse secondaire plus rapide et plus forte. Le VIH détruit les LT4 → immunodéficience.']
          ], q: [
            ['Les anticorps sont produits par :', 'qcm', ['les LT4', 'les plasmocytes (LB)', 'les hématies', 'les plaquettes'], 'les plasmocytes (LB)', 'LB différenciés.'],
            ['Le VIH cible les LT4', 'vf', null, 'Vrai', 'D\'où l\'immunodéficience.'],
            ['La vaccination repose sur la mémoire…', 'ouverte', null, 'immunitaire', 'Cellules mémoire.'],
            ['La phagocytose fait partie de l\'immunité :', 'qcm', ['innée', 'adaptative', 'humorale', 'cellulaire T'], 'innée', 'Non spécifique.']
          ] },
          { t: 'Physiologie nerveuse et reproduction', l: [
            ['Le message nerveux', '## Potentiel d\'action\nRepos : -70 mV. Dépolarisation (entrée de Na⁺), repolarisation (sortie de K⁺). Codage en fréquence. Synapse : neurotransmetteur (acétylcholine).'],
            ['Régulation hormonale', '## Axe hypothalamo-hypophysaire\nGnRH → FSH/LH → hormones ovariennes ou testostérone, avec rétrocontrôles. Glycémie : insuline (hypoglycémiante), glucagon.']
          ], q: [
            ['Le potentiel de repos vaut environ :', 'qcm', ['+30 mV', '-70 mV', '0 mV', '-200 mV'], '-70 mV', 'Polarisation membranaire.'],
            ['L\'insuline fait baisser la glycémie', 'vf', null, 'Vrai', 'Hormone hypoglycémiante.'],
            ['Neurotransmetteur de la jonction neuromusculaire ?', 'ouverte', null, 'acétylcholine', 'Acétylcholine.'],
            ['La dépolarisation est due à l\'entrée de :', 'qcm', ['K⁺', 'Na⁺', 'Cl⁻', 'Ca²⁺'], 'Na⁺', 'Canaux sodiques.']
          ] }
        ] },
        { nom: 'Français', desc: 'Dissertation, commentaire, résumé', chapitres: [
          { t: 'La dissertation littéraire', l: [
            ['Analyser le sujet', '## Méthode\nSouligner les mots-clés, reformuler, dégager la problématique. Types de plans : dialectique (thèse/antithèse/synthèse), analytique, thématique.'],
            ['Rédiger', '## Paragraphe argumentatif\nIdée directrice → explication → exemple précis (œuvre, auteur africain : Senghor, Césaire, Olympe Bhêly-Quenum, Jean Pliya) → mini-conclusion. Soigner les transitions.']
          ], q: [
            ['Le plan dialectique comprend :', 'qcm', ['2 parties', 'thèse / antithèse / synthèse', 'un résumé', 'une liste'], 'thèse / antithèse / synthèse', 'Plan en trois temps.'],
            ['Un argument sans exemple est suffisant', 'vf', null, 'Faux', 'Toujours illustrer.'],
            ['Auteur béninois de « Un piège sans fin » ?', 'ouverte', null, 'Olympe Bhêly-Quenum', 'Roman publié en 1960.'],
            ['La problématique se place dans :', 'qcm', ['la conclusion', 'l\'introduction', 'la 2e partie', 'nulle part'], 'l\'introduction', 'Après la présentation du sujet.']
          ] },
          { t: 'Le commentaire composé', l: [
            ['Lecture méthodique', '## Étapes\nSituer le texte, repérer le genre, le thème, les procédés (champs lexicaux, figures, rythme), formuler 2 axes de lecture.'],
            ['Rédaction du commentaire', '## Règle d\'or\nCitation → procédé → interprétation. Jamais de paraphrase ni de relevé sans analyse.']
          ], q: [
            ['Un commentaire composé est organisé en :', 'qcm', ['axes de lecture', 'chapitres', 'strophes', 'scènes'], 'axes de lecture', 'Généralement deux axes.'],
            ['La paraphrase est valorisée', 'vf', null, 'Faux', 'Il faut interpréter.'],
            ['Que doit-on associer à chaque procédé ?', 'ouverte', null, 'interprétation', 'Son effet de sens.'],
            ['Un champ lexical est :', 'qcm', ['un ensemble de mots d\'un même thème', 'une rime', 'un temps verbal', 'une ponctuation'], 'un ensemble de mots d\'un même thème', 'Ex : champ lexical de la mort.']
          ] },
          { t: 'Le résumé de texte', l: [
            ['Technique du résumé', '## Règles\nRéduire au quart (±10 %), respecter l\'ordre et le système d\'énonciation, reformuler sans citer ni commenter. Indiquer le nombre de mots.'],
            ['Discussion', '## Après le résumé\nLa discussion reprend une idée du texte : on l\'analyse puis on la discute avec des arguments et exemples.']
          ], q: [
            ['Un résumé réduit le texte au :', 'qcm', ['tiers', 'quart', 'dixième', 'double'], 'quart', 'Environ 1/4.'],
            ['On peut donner son avis dans le résumé', 'vf', null, 'Faux', 'Fidélité à l\'auteur.'],
            ['Marge de tolérance du nombre de mots (en %) ?', 'ouverte', null, '10', '±10 %.'],
            ['Le résumé respecte :', 'qcm', ['l\'ordre du texte', 'l\'ordre alphabétique', 'aucun ordre', 'l\'ordre inverse'], 'l\'ordre du texte', 'Fidélité au mouvement.']
          ] }
        ] },
        { nom: 'Philosophie', desc: 'Terminale toutes séries', chapitres: [
          { t: 'La dissertation philosophique', l: [
            ['Problématiser', '## Méthode\nDéfinir les notions, repérer le paradoxe, poser le problème sous forme de question. Plan : thèse – antithèse – dépassement.'],
            ['Mobiliser les auteurs', '## Références\nPlaton, Descartes, Kant, Hegel, Marx, Sartre ; penseurs africains : Paulin Hountondji, Cheikh Anta Diop, Kwame Nkrumah, Marcien Towa.']
          ], q: [
            ['« Je pense, donc je suis » est de :', 'qcm', ['Kant', 'Descartes', 'Platon', 'Sartre'], 'Descartes', 'Discours de la méthode.'],
            ['Paulin Hountondji est un philosophe béninois', 'vf', null, 'Vrai', 'Auteur de « Sur la philosophie africaine ».'],
            ['Combien de parties dans un plan dialectique ?', 'ouverte', null, '3', 'Thèse, antithèse, synthèse.'],
            ['La problématique est :', 'qcm', ['une citation', 'le problème posé sous forme de question', 'la conclusion', 'un exemple'], 'le problème posé sous forme de question', 'Cœur de l\'introduction.']
          ] },
          { t: 'Explication de texte et grandes notions', l: [
            ['Expliquer un texte', '## Étapes\nThème, thèse, problème, enjeu ; étude ordonnée ; intérêt philosophique.'],
            ['Notions clés', '## Exemples\nLa conscience, la liberté, le travail, l\'État, la vérité, la religion, la technique, le langage.\nSartre : « L\'homme est condamné à être libre ».']
          ], q: [
            ['« L\'homme est condamné à être libre » est de :', 'qcm', ['Sartre', 'Marx', 'Hegel', 'Rousseau'], 'Sartre', 'Existentialisme.'],
            ['L\'explication de texte est une paraphrase', 'vf', null, 'Faux', 'On explique et on discute.'],
            ['Quelle partie suit l\'étude ordonnée ?', 'ouverte', null, 'intérêt philosophique', 'Portée et limites.'],
            ['La thèse est :', 'qcm', ['l\'idée défendue par l\'auteur', 'le titre', 'la date', 'un exemple'], 'l\'idée défendue par l\'auteur', 'Position de l\'auteur.']
          ] }
        ] },
        { nom: 'Histoire-Géographie', desc: 'Terminale', chapitres: [
          { t: 'Décolonisation et indépendances africaines', l: [
            ['Les causes de la décolonisation', '## Facteurs\nRôle des élites, 2e Guerre mondiale, conférence de Brazzaville (1944), ONU, conférence de Bandung (1955).'],
            ['Le Dahomey vers l\'indépendance', '## Repères\nIndépendance le 1er août 1960 (Hubert Maga). 1975 : République populaire du Bénin. 1990 : Conférence des forces vives de la Nation, renouveau démocratique.']
          ], q: [
            ['Date de l\'indépendance du Dahomey :', 'qcm', ['1er août 1960', '30 novembre 1975', '28 février 1990', '1er janvier 1958'], '1er août 1960', 'Fête nationale.'],
            ['La Conférence nationale du Bénin a eu lieu en 1990', 'vf', null, 'Vrai', 'Du 19 au 28 février 1990.'],
            ['Premier président du Dahomey indépendant ?', 'ouverte', null, 'Hubert Maga', 'Hubert Koutoukou Maga.'],
            ['La conférence de Bandung date de :', 'qcm', ['1945', '1955', '1960', '1975'], '1955', 'Afro-asiatique.']
          ] },
          { t: 'Mondialisation et développement', l: [
            ['La mondialisation', '## Acteurs et flux\nFirmes multinationales, États, organisations (OMC, FMI), flux de marchandises, capitaux et informations.'],
            ['L\'Afrique dans la mondialisation', '## Enjeux\nIntégration régionale (UEMOA, CEDEAO, ZLECAf), Port autonome de Cotonou, exportation du coton béninois.']
          ], q: [
            ['L\'UEMOA utilise la monnaie :', 'qcm', ['naira', 'franc CFA', 'cedi', 'euro'], 'franc CFA', 'Franc CFA (XOF).'],
            ['Le coton est un produit d\'exportation majeur du Bénin', 'vf', null, 'Vrai', 'Premier producteur africain ces dernières années.'],
            ['Sigle de la zone de libre-échange continentale africaine ?', 'ouverte', null, 'ZLECAf', 'Zone de libre-échange continentale africaine.'],
            ['L\'OMC s\'occupe :', 'qcm', ['du commerce', 'de la santé', 'du climat', 'de l\'éducation'], 'du commerce', 'Organisation mondiale du commerce.']
          ] }
        ] }
      ]
    },
    LICENCE: {
      cycle: 'Supérieur', theme: 'yellow', icon: 'bank',
      matieres: [
        { nom: 'Mathématiques financières', desc: 'Tronc commun Licence professionnelle', chapitres: [
          { t: 'Intérêts simples et escompte', l: [['Intérêts simples', '## Formules\nI = C × t × n (n en années) ; avec n jours : I = C × t × n / 360.\nValeur acquise : A = C + I.\nEscompte commercial : E = V × t × n / 360 ; valeur actuelle = V - E.'], ['Équivalence d\'effets', '## Principe\nDeux effets sont équivalents à une date donnée s\'ils ont la même valeur actuelle à cette date.']], q: [['I sur 100 000 F à 6 % pendant 1 an ?', 'qcm', ['600 F', '6 000 F', '60 000 F', '106 000 F'], '6 000 F', '100 000 × 0,06.'], ['L\'année commerciale compte 360 jours', 'vf', null, 'Vrai', 'Convention bancaire.'], ['Valeur acquise de 200 000 F à 5 % sur 2 ans (simples) ?', 'ouverte', null, '220000', 'I = 20 000.'], ['L\'escompte se calcule sur :', 'qcm', ['la valeur nominale', 'le capital initial', 'le taux', 'la TVA'], 'la valeur nominale', 'E = V t n / 360.']] },
          { t: 'Intérêts composés et annuités', l: [['Capitalisation', '## Formules\nCₙ = C₀(1 + i)ⁿ ; valeur actuelle C₀ = Cₙ(1 + i)⁻ⁿ.\nTaux équivalents : (1 + iₐ) = (1 + iₘ)¹².'], ['Annuités et emprunts', '## Emprunt indivis\nAnnuité constante a = K × i / (1 - (1 + i)⁻ⁿ). Tableau : intérêt, amortissement, capital restant dû.']], q: [['Cₙ = C₀(1+i)ⁿ concerne les intérêts :', 'qcm', ['simples', 'composés', 'précomptés', 'nuls'], 'composés', 'Capitalisation.'], ['Dans une annuité constante, l\'amortissement augmente chaque année', 'vf', null, 'Vrai', 'Les intérêts diminuent.'], ['100 000 F à 10 % composés pendant 2 ans = ?', 'ouverte', null, '121000', '100 000 × 1,1².'], ['Valeur actuelle = Cₙ × :', 'qcm', ['(1+i)ⁿ', '(1+i)⁻ⁿ', 'i × n', '1/i'], '(1+i)⁻ⁿ', 'Actualisation.']] },
          { t: 'Choix d\'investissement', l: [['VAN et TRI', '## Définitions\nVAN = Σ CFₖ(1 + t)⁻ᵏ - I₀. Projet rentable si VAN > 0. TRI : taux qui annule la VAN.'], ['Délai de récupération', '## Principe\nTemps nécessaire pour que les flux cumulés actualisés couvrent l\'investissement initial.']], q: [['Un projet est rentable si :', 'qcm', ['VAN < 0', 'VAN > 0', 'TRI = 0', 'I₀ = 0'], 'VAN > 0', 'Création de valeur.'], ['Le TRI annule la VAN', 'vf', null, 'Vrai', 'Définition.'], ['Sigle de la valeur actuelle nette ?', 'ouverte', null, 'VAN', 'Valeur actuelle nette.'], ['Le DRCI mesure :', 'qcm', ['la rentabilité', 'le délai de récupération', 'la TVA', 'le risque pays'], 'le délai de récupération', 'Délai de récupération du capital investi.']] }
        ] },
        { nom: 'Comptabilité générale (SYSCOHADA)', desc: 'Gestion, Comptabilité, Banque, Finance', chapitres: [
          { t: 'Principes et plan comptable', l: [['Le SYSCOHADA révisé', '## Classes de comptes\n1 Ressources durables, 2 Actif immobilisé, 3 Stocks, 4 Tiers, 5 Trésorerie, 6 Charges, 7 Produits, 8 Autres charges et produits.\nPartie double : tout débit a un crédit de même montant.'], ['Le bilan et le compte de résultat', '## Bilan\nActif = Passif. Résultat = Produits - Charges.']], q: [['La classe 6 regroupe :', 'qcm', ['les produits', 'les charges', 'les stocks', 'la trésorerie'], 'les charges', 'Comptes de charges.'], ['Le total actif est égal au total passif', 'vf', null, 'Vrai', 'Équilibre du bilan.'], ['Quelle classe pour la trésorerie ?', 'ouverte', null, '5', 'Classe 5.'], ['Le principe de la partie double impose :', 'qcm', ['un seul compte', 'débit = crédit', 'pas de TVA', 'un bilan mensuel'], 'débit = crédit', 'Équilibre des écritures.']] },
          { t: 'Opérations courantes et TVA', l: [['Achats et ventes', '## Écritures\nAchat : 601 au débit, 4452 TVA récupérable au débit, 401 Fournisseurs au crédit.\nVente : 411 Clients au débit, 701 et 4431 TVA facturée au crédit.'], ['La TVA au Bénin', '## Taux normal 18 %\nTVA due = TVA collectée - TVA déductible. TTC = HT × 1,18.']], q: [['Taux normal de TVA au Bénin :', 'qcm', ['10 %', '15 %', '18 %', '20 %'], '18 %', 'Taux en vigueur.'], ['Le compte 401 est un compte de fournisseurs', 'vf', null, 'Vrai', 'Classe 4 – Tiers.'], ['HT 100 000 F, TTC = ?', 'ouverte', null, '118000', '× 1,18.'], ['TVA due = TVA collectée - TVA :', 'qcm', ['déductible', 'majorée', 'sociale', 'brute'], 'déductible', 'Récupérable.']] },
          { t: 'Travaux de fin d\'exercice', l: [['Amortissements', '## Linéaire\nAnnuité = valeur d\'origine / durée. Écriture : 681 Dotations au débit, 28 Amortissements au crédit.'], ['Provisions et régularisations', '## Principes\nPrudence : constater les pertes probables. Charges et produits constatés d\'avance pour respecter l\'indépendance des exercices.']], q: [['Le compte 681 enregistre :', 'qcm', ['des ventes', 'des dotations aux amortissements', 'des achats', 'des salaires'], 'des dotations aux amortissements', 'Charge calculée.'], ['Un bien de 1 000 000 F sur 5 ans donne une annuité de 200 000 F', 'vf', null, 'Vrai', '1 000 000 / 5.'], ['Taux linéaire pour une durée de 4 ans (en %) ?', 'ouverte', null, '25', '100 / 4.'], ['Le principe de prudence conduit à constater :', 'qcm', ['les gains probables', 'les pertes probables', 'aucun risque', 'les dividendes'], 'les pertes probables', 'Provisions.']] }
        ] },
        { nom: 'Statistiques et probabilités', desc: 'Tronc commun', chapitres: [
          { t: 'Statistique descriptive', l: [['Paramètres de position et de dispersion', '## Formules\nMoyenne x̄ = Σnᵢxᵢ/N ; variance V = Σnᵢ(xᵢ - x̄)²/N ; écart-type σ = √V ; coefficient de variation CV = σ/x̄.'], ['Représentations', '## Graphiques\nDiagramme en bâtons (discret), histogramme (continu), boîte à moustaches (quartiles).']], q: [['L\'écart-type est la racine de :', 'qcm', ['la moyenne', 'la variance', 'la médiane', 'l\'étendue'], 'la variance', 'σ = √V.'], ['L\'histogramme convient à une variable continue', 'vf', null, 'Vrai', 'Classes.'], ['V = 16. σ = ?', 'ouverte', null, '4', '√16.'], ['Le CV mesure :', 'qcm', ['la position', 'la dispersion relative', 'la corrélation', 'la tendance'], 'la dispersion relative', 'σ/x̄.']] },
          { t: 'Régression et corrélation', l: [['Ajustement linéaire', '## Moindres carrés\ny = ax + b avec a = Cov(x,y)/V(x) et b = ȳ - a x̄.'], ['Coefficient de corrélation', '## r\nr = Cov(x,y)/(σx σy), -1 ≤ r ≤ 1. |r| proche de 1 : forte liaison linéaire.']], q: [['r est compris entre :', 'qcm', ['0 et 1', '-1 et 1', '-∞ et +∞', '0 et 100'], '-1 et 1', 'Propriété.'], ['r = 0,98 indique une forte corrélation', 'vf', null, 'Vrai', 'Proche de 1.'], ['Méthode d\'ajustement la plus utilisée ?', 'ouverte', null, 'moindres carrés', 'Méthode des moindres carrés.'], ['a = Cov(x,y) / :', 'qcm', ['V(y)', 'V(x)', 'σy', 'r'], 'V(x)', 'Pente de la droite.']] },
          { t: 'Lois de probabilité', l: [['Lois discrètes', '## Binomiale et Poisson\nB(n ; p) : E = np. Poisson P(λ) : P(X = k) = e⁻λ λᵏ/k!, E = V = λ.'], ['Loi normale', '## N(μ ; σ)\nCentrage-réduction : Z = (X - μ)/σ. P(μ - 2σ < X < μ + 2σ) ≈ 95 %.']], q: [['Pour une loi de Poisson, E(X) = :', 'qcm', ['λ²', 'λ', '√λ', '1/λ'], 'λ', 'E = V = λ.'], ['La loi normale est symétrique', 'vf', null, 'Vrai', 'Autour de μ.'], ['Pourcentage dans [μ - 2σ ; μ + 2σ] ?', 'ouverte', null, '95', 'Environ 95 %.'], ['Z = (X - μ)/σ suit :', 'qcm', ['N(0 ; 1)', 'B(n ; p)', 'P(λ)', 'U(0 ; 1)'], 'N(0 ; 1)', 'Loi normale centrée réduite.']] }
        ] },
        { nom: 'Informatique et systèmes d\'information', desc: 'Informatique de gestion, Réseaux, Génie logiciel', chapitres: [
          { t: 'Algorithmique et programmation', l: [['Structures de base', '## Pseudo-code\nSi…Alors…Sinon ; Pour i de 1 à n ; TantQue… Faire. Exemple somme : s ← 0 ; Pour i de 1 à n : s ← s + i.'], ['Python essentiel', '## Syntaxe\ndef somme(n):\n    return sum(range(1, n + 1))\nListes, dictionnaires, boucles for/while, fonctions.']], q: [['La boucle qui s\'exécute tant qu\'une condition est vraie :', 'qcm', ['Pour', 'TantQue', 'Si', 'Selon'], 'TantQue', 'Boucle conditionnelle.'], ['En Python, l\'indentation est obligatoire', 'vf', null, 'Vrai', 'Elle délimite les blocs.'], ['Somme des entiers de 1 à 10 ?', 'ouverte', null, '55', 'n(n+1)/2.'], ['Une fonction se définit en Python avec :', 'qcm', ['func', 'def', 'function', 'fn'], 'def', 'Mot-clé def.']] },
          { t: 'Bases de données et SQL', l: [['Modèle relationnel', '## MCD → MLD\nEntités, associations, cardinalités. Clé primaire, clé étrangère, normalisation (1FN, 2FN, 3FN).'], ['Le langage SQL', '## Requêtes\nSELECT nom FROM users WHERE niveau = \'BAC\' ORDER BY nom;\nINSERT, UPDATE, DELETE, JOIN, GROUP BY.']], q: [['La commande pour lire des données :', 'qcm', ['INSERT', 'SELECT', 'DELETE', 'DROP'], 'SELECT', 'Interrogation.'], ['Une clé étrangère référence une clé primaire', 'vf', null, 'Vrai', 'Intégrité référentielle.'], ['Sigle du système de gestion de base de données ?', 'ouverte', null, 'SGBD', 'Système de gestion de bases de données.'], ['GROUP BY sert à :', 'qcm', ['trier', 'regrouper', 'supprimer', 'joindre'], 'regrouper', 'Agrégations.']] },
          { t: 'Réseaux et sécurité', l: [['Modèle OSI et TCP/IP', '## Couches\nOSI : 7 couches (physique → application). TCP/IP : accès réseau, Internet (IP), transport (TCP/UDP), application (HTTP, DNS).'], ['Sécurité informatique', '## Principes\nConfidentialité, intégrité, disponibilité. Mots de passe forts, sauvegardes, pare-feu, chiffrement (HTTPS).']], q: [['Le modèle OSI compte :', 'qcm', ['4 couches', '5 couches', '7 couches', '9 couches'], '7 couches', 'Standard ISO.'], ['HTTPS chiffre les échanges', 'vf', null, 'Vrai', 'TLS.'], ['Protocole de résolution des noms de domaine ?', 'ouverte', null, 'DNS', 'Domain Name System.'], ['Une adresse IPv4 comporte :', 'qcm', ['16 bits', '32 bits', '64 bits', '128 bits'], '32 bits', '4 octets.']] }
        ] },
        { nom: 'Économie et gestion des entreprises', desc: 'Gestion, Marketing, Commerce', chapitres: [
          { t: 'Microéconomie', l: [['Offre et demande', '## Équilibre\nLe prix d\'équilibre égalise l\'offre et la demande. Élasticité-prix e = (ΔQ/Q)/(ΔP/P).'], ['Le producteur', '## Coûts\nCoût total = CF + CV ; coût marginal ; maximisation du profit : Rm = Cm.']], q: [['Le prix d\'équilibre égalise :', 'qcm', ['coût et prix', 'offre et demande', 'impôt et taxe', 'salaire et profit'], 'offre et demande', 'Marché.'], ['Le profit est maximal quand Rm = Cm', 'vf', null, 'Vrai', 'Condition d\'optimalité.'], ['CT = CF + ?', 'ouverte', null, 'CV', 'Coûts variables.'], ['Une demande élastique réagit :', 'qcm', ['fortement au prix', 'peu au prix', 'jamais', 'au climat'], 'fortement au prix', '|e| > 1.']] },
          { t: 'Macroéconomie et politique économique', l: [['Agrégats', '## PIB\nPIB = somme des valeurs ajoutées. Croissance, inflation, chômage, balance commerciale.'], ['Politiques économiques', '## Instruments\nPolitique budgétaire (État), politique monétaire (BCEAO pour l\'UEMOA : taux directeurs).']], q: [['La BCEAO conduit la politique :', 'qcm', ['budgétaire', 'monétaire', 'scolaire', 'sanitaire'], 'monétaire', 'Banque centrale UEMOA.'], ['Le PIB est la somme des valeurs ajoutées', 'vf', null, 'Vrai', 'Approche production.'], ['Hausse générale des prix ?', 'ouverte', null, 'inflation', 'Inflation.'], ['La politique budgétaire est menée par :', 'qcm', ['l\'État', 'les ménages', 'la BCEAO', 'les ONG'], 'l\'État', 'Budget de l\'État.']] },
          { t: 'Marketing et stratégie', l: [['Le marketing-mix', '## Les 4P\nProduit, Prix, Place (distribution), Promotion (communication). Segmentation → ciblage → positionnement.'], ['Analyse stratégique', '## Outils\nSWOT (forces, faiblesses, opportunités, menaces), 5 forces de Porter, matrice BCG.']], q: [['Les 4P du marketing incluent :', 'qcm', ['Produit, Prix, Place, Promotion', 'Plan, Prix, Profit, Personnel', 'Produit, Projet, Paie, Poste', 'aucun'], 'Produit, Prix, Place, Promotion', 'McCarthy.'], ['SWOT analyse forces et faiblesses', 'vf', null, 'Vrai', 'Et opportunités/menaces.'], ['Auteur des 5 forces concurrentielles ?', 'ouverte', null, 'Porter', 'Michael Porter.'], ['La matrice BCG classe :', 'qcm', ['les salariés', 'les domaines d\'activité', 'les clients', 'les impôts'], 'les domaines d\'activité', 'Stars, vaches à lait…']] }
        ] },
        { nom: 'Droit et environnement juridique', desc: 'Droit des affaires OHADA', chapitres: [
          { t: 'Introduction au droit', l: [['Sources du droit', '## Hiérarchie des normes\nConstitution du Bénin (1990 révisée en 2019) > traités (OHADA, UEMOA) > lois > règlements.'], ['Personnes et biens', '## Personnalité juridique\nPersonnes physiques et morales ; capacité juridique ; patrimoine.']], q: [['La norme suprême au Bénin est :', 'qcm', ['la loi', 'la Constitution', 'le décret', 'l\'arrêté'], 'la Constitution', 'Sommet de la hiérarchie.'], ['Une société est une personne morale', 'vf', null, 'Vrai', 'Dotée de la personnalité juridique.'], ['Année de la Constitution béninoise ?', 'ouverte', null, '1990', '11 décembre 1990.'], ['Les Actes uniformes sont adoptés par :', 'qcm', ['l\'OHADA', 'l\'ONU', 'la CEDEAO', 'l\'UA'], 'l\'OHADA', 'Droit des affaires harmonisé.']] },
          { t: 'Droit des sociétés commerciales', l: [['Formes de sociétés', '## OHADA\nSNC, SCS, SARL (capital librement fixé), SA (capital minimum 10 millions F CFA), SAS.'], ['Fonctionnement', '## Organes\nGérant (SARL), conseil d\'administration ou administrateur général (SA), assemblées générales.']], q: [['Le capital minimum d\'une SA OHADA est :', 'qcm', ['1 million', '5 millions', '10 millions', '100 millions'], '10 millions', 'F CFA.'], ['La SARL est dirigée par un gérant', 'vf', null, 'Vrai', 'Un ou plusieurs gérants.'], ['Sigle de société par actions simplifiée ?', 'ouverte', null, 'SAS', 'Société par actions simplifiée.'], ['Dans la SNC, les associés sont :', 'qcm', ['à responsabilité limitée', 'indéfiniment et solidairement responsables', 'anonymes', 'salariés'], 'indéfiniment et solidairement responsables', 'Caractéristique de la SNC.']] },
          { t: 'Droit du travail', l: [['Le contrat de travail', '## Éléments\nPrestation de travail, rémunération, lien de subordination. CDD, CDI, période d\'essai.'], ['Rupture du contrat', '## Modes\nDémission, licenciement (motif légitime, préavis), rupture conventionnelle. Rôle de l\'inspection du travail.']], q: [['Élément caractéristique du contrat de travail :', 'qcm', ['lien de subordination', 'capital social', 'TVA', 'bail'], 'lien de subordination', 'Critère décisif.'], ['Le CDI a une durée indéterminée', 'vf', null, 'Vrai', 'Par définition.'], ['Sigle du contrat à durée déterminée ?', 'ouverte', null, 'CDD', 'Contrat à durée déterminée.'], ['La démission émane :', 'qcm', ['de l\'employeur', 'du salarié', 'du juge', 'de l\'État'], 'du salarié', 'Rupture à l\'initiative du salarié.']] }
        ] },
        { nom: 'Management et GRH', desc: 'GRH, Management des organisations', chapitres: [
          { t: 'Théories des organisations', l: [['Écoles classiques', '## Auteurs\nTaylor (OST), Fayol (administration : PODC), Weber (bureaucratie).'], ['Relations humaines', '## Auteurs\nMayo (Hawthorne), Maslow (pyramide des besoins), Herzberg (facteurs d\'hygiène et de motivation).']], q: [['L\'OST est l\'œuvre de :', 'qcm', ['Fayol', 'Taylor', 'Mayo', 'Weber'], 'Taylor', 'Organisation scientifique du travail.'], ['Maslow a proposé une pyramide des besoins', 'vf', null, 'Vrai', 'Cinq niveaux.'], ['Combien de niveaux dans la pyramide de Maslow ?', 'ouverte', null, '5', 'Physiologiques à accomplissement.'], ['PODC signifie Prévoir, Organiser, Diriger, :', 'qcm', ['Compter', 'Contrôler', 'Créer', 'Choisir'], 'Contrôler', 'Fayol.']] },
          { t: 'Gestion des ressources humaines', l: [['Recrutement et formation', '## Processus\nDéfinition du poste, recherche, sélection, intégration. Plan de formation et GPEC.'], ['Rémunération et paie', '## Bulletin de paie\nSalaire brut - cotisations sociales (CNSS) - impôt (ITS) = salaire net.']], q: [['Au Bénin, les cotisations sociales sont versées à :', 'qcm', ['la CNSS', 'la BCEAO', 'l\'OMC', 'la mairie'], 'la CNSS', 'Caisse nationale de sécurité sociale.'], ['Salaire net = brut - retenues', 'vf', null, 'Vrai', 'Principe du bulletin.'], ['Sigle de la gestion prévisionnelle des emplois et compétences ?', 'ouverte', null, 'GPEC', 'GPEC.'], ['L\'intégration intervient :', 'qcm', ['avant l\'annonce', 'après la sélection', 'à la retraite', 'jamais'], 'après la sélection', 'Accueil du nouveau salarié.']] },
          { t: 'Leadership et conduite du changement', l: [['Styles de direction', '## Likert\nAutoritaire, paternaliste, consultatif, participatif. Le leader adapte son style à la situation (Hersey et Blanchard).'], ['Communication et conflits', '## Outils\nÉcoute active, négociation gagnant-gagnant, médiation.']], q: [['Le style où les salariés participent aux décisions :', 'qcm', ['autoritaire', 'participatif', 'paternaliste', 'laisser-faire'], 'participatif', 'Likert.'], ['La négociation gagnant-gagnant cherche un accord mutuel', 'vf', null, 'Vrai', 'Intérêts des deux parties.'], ['Qui a classé 4 styles de direction ?', 'ouverte', null, 'Likert', 'Rensis Likert.'], ['Le leadership situationnel est de :', 'qcm', ['Hersey et Blanchard', 'Taylor', 'Smith', 'Keynes'], 'Hersey et Blanchard', 'Adapter le style.']] }
        ] },
        { nom: 'Méthodologie et communication professionnelle', desc: 'Rapport de stage, mémoire, anglais professionnel', chapitres: [
          { t: 'Rédiger un rapport de stage', l: [['Structure du rapport', '## Plan type\nPage de garde, dédicace, remerciements, sommaire, sigles, introduction, présentation de la structure, déroulement du stage, analyse critique, suggestions, conclusion, bibliographie, annexes.'], ['Soutenance', '## Conseils\n15 à 20 min de présentation, diaporama sobre (10-15 diapositives), répondre aux questions avec calme.']], q: [['Le sommaire se place :', 'qcm', ['à la fin', 'au début', 'dans les annexes', 'nulle part'], 'au début', 'Après les remerciements.'], ['Les annexes sont à la fin du rapport', 'vf', null, 'Vrai', 'Après la bibliographie.'], ['Durée conseillée de présentation (minutes, maximum) ?', 'ouverte', null, '20', '15 à 20 minutes.'], ['L\'analyse critique porte sur :', 'qcm', ['le stage et la structure', 'la météo', 'la famille', 'le sport'], 'le stage et la structure', 'Forces, faiblesses, suggestions.']] },
          { t: 'Mémoire et méthodologie de recherche', l: [['Problématique et hypothèses', '## Démarche\nConstat → question de recherche → objectifs → hypothèses → méthodologie (enquête, entretiens, échantillon) → résultats → discussion.'], ['Normes bibliographiques', '## APA\nNom, Initiale. (Année). Titre. Éditeur. Toujours citer ses sources : le plagiat est sanctionné.']], q: [['L\'hypothèse est :', 'qcm', ['une réponse provisoire', 'une conclusion', 'un résumé', 'une annexe'], 'une réponse provisoire', 'À vérifier.'], ['Le plagiat est autorisé si on cite peu', 'vf', null, 'Faux', 'Toute reprise doit être citée.'], ['Norme bibliographique très utilisée en sciences sociales ?', 'ouverte', null, 'APA', 'American Psychological Association.'], ['L\'échantillon est :', 'qcm', ['une partie de la population étudiée', 'toute la population', 'un graphique', 'un logiciel'], 'une partie de la population étudiée', 'Représentatif.']] },
          { t: 'Anglais professionnel', l: [['Business English', '## Vocabulary\nInvoice (facture), purchase order (bon de commande), meeting, deadline, report, budget.\nEmail : Dear Sir/Madam, … Best regards.'], ['Job interview', '## Phrases\nTell me about yourself. My strengths are… I am motivated by… I look forward to hearing from you.']], q: [['« Invoice » signifie :', 'qcm', ['facture', 'devis', 'salaire', 'contrat'], 'facture', 'Business vocabulary.'], ['« Best regards » est une formule de fin', 'vf', null, 'Vrai', 'Closing.'], ['Traduis « deadline »', 'ouverte', null, 'date limite', 'Échéance.'], ['« Purchase order » =', 'qcm', ['bon de commande', 'bon de livraison', 'reçu', 'devis'], 'bon de commande', 'PO.']] }
        ] },
        { nom: 'Sciences et techniques de l\'ingénieur', desc: 'Électrotechnique, Génie civil, Agronomie', chapitres: [
          { t: 'Électrotechnique', l: [['Courant alternatif', '## Grandeurs\nU = Umax/√2 ; P = UI cos φ ; Q = UI sin φ ; S = UI. Réseau béninois : 220 V – 50 Hz.'], ['Machines électriques', '## Transformateur\nm = U₂/U₁ = N₂/N₁. Moteur asynchrone : glissement g = (ns - n)/ns.']], q: [['Fréquence du réseau électrique au Bénin :', 'qcm', ['50 Hz', '60 Hz', '100 Hz', '220 Hz'], '50 Hz', 'Réseau SBEE.'], ['P = UI cos φ est la puissance active', 'vf', null, 'Vrai', 'En watts.'], ['U₁ = 220 V, m = 0,05. U₂ = ? (V)', 'ouverte', null, '11', '220 × 0,05.'], ['La puissance réactive s\'exprime en :', 'qcm', ['W', 'VAR', 'VA', 'J'], 'VAR', 'Volt-ampère réactif.']] },
          { t: 'Génie civil et BTP', l: [['Matériaux', '## Béton\nCiment + sable + gravier + eau. Dosage courant : 350 kg/m³. Béton armé : acier pour la traction.'], ['Résistance des matériaux', '## Contrainte\nσ = F/S (Pa). Moment fléchissant, flèche, coefficient de sécurité.']], q: [['Le béton armé contient :', 'qcm', ['du bois', 'de l\'acier', 'du plastique', 'du verre'], 'de l\'acier', 'Résiste à la traction.'], ['σ = F/S', 'vf', null, 'Vrai', 'Contrainte normale.'], ['Dosage courant du béton (kg de ciment par m³) ?', 'ouverte', null, '350', '350 kg/m³.'], ['L\'unité de contrainte est :', 'qcm', ['N', 'Pa', 'J', 'W'], 'Pa', 'Pascal = N/m².']] },
          { t: 'Agronomie et environnement', l: [['Systèmes de culture', '## Bénin\nCultures vivrières (maïs, manioc, igname) et de rente (coton, anacarde, soja). Rotation, assolement, fertilisation organique.'], ['Développement durable', '## Enjeux\nGestion des sols, reboisement, agroécologie, adaptation au changement climatique.']], q: [['Culture de rente majeure au Nord-Bénin :', 'qcm', ['coton', 'cacao', 'café', 'blé'], 'coton', 'Alibori, Borgou…'], ['La rotation des cultures préserve la fertilité', 'vf', null, 'Vrai', 'Alternance des plantes.'], ['Noix exportée par le Bénin (cajou) ?', 'ouverte', null, 'anacarde', 'Noix de cajou.'], ['L\'agroécologie vise :', 'qcm', ['plus de pesticides', 'des pratiques durables', 'la déforestation', 'la monoculture'], 'des pratiques durables', 'Respect des écosystèmes.']] }
        ] }
      ]
    }
  };

  const FILIERES = ['Informatique de gestion', 'Réseaux et télécommunications', 'Génie logiciel', 'Comptabilité-Contrôle-Audit', 'Banque-Finance-Assurance', 'Gestion des ressources humaines', 'Marketing et action commerciale', 'Transport et logistique', 'Gestion des entreprises', 'Droit des affaires', 'Communication et relations publiques', 'Tourisme et hôtellerie', 'Électrotechnique', 'Génie civil', 'Agronomie et production végétale', 'Santé publique', 'Sciences de l\'éducation', 'Énergies renouvelables'];

  // Licence : 24 chapitres (certains chapitres sont regroupés pour garder tout le contenu)
  ['Statistiques et probabilités', 'Management et GRH', 'Économie et gestion des entreprises'].forEach((nom) => {
    const m = RAW.LICENCE.matieres.find((x) => x.nom === nom); if (!m || m.chapitres.length < 3) return;
    const last = m.chapitres.pop(), prev = m.chapitres[m.chapitres.length - 1];
    prev.t = prev.t + ' et ' + last.t.charAt(0).toLowerCase() + last.t.slice(1);
    prev.l = prev.l.concat(last.l); prev.q = prev.q.concat(last.q);
  });

  // --- construction des tables (schéma ERD) ---
  const data = { niveaux: [], matieres: [], chapitres: [], lecons: [], quiz: [], questions: [], filieres: FILIERES };
  Object.keys(RAW).forEach((nk, ni) => {
    const N = RAW[nk];
    const niv = { id: 'niv-' + nk, nom: nk, cycle: N.cycle, theme: N.theme, icon: N.icon, ordre: ni };
    data.niveaux.push(niv);
    N.matieres.forEach((m, mi) => {
      const mat = { id: niv.id + '-m' + mi, niveau_id: niv.id, niveau: nk, nom: m.nom, description: m.desc };
      data.matieres.push(mat);
      m.chapitres.forEach((c, ci) => {
        const ch = { id: mat.id + '-c' + ci, matiere_id: mat.id, niveau: nk, titre: c.t, ordre: ci + 1 };
        data.chapitres.push(ch);
        c.l.forEach((l, li) => {
          const words = l[1].split(/\s+/).length;
          data.lecons.push({ id: ch.id + '-l' + li, chapitre_id: ch.id, niveau: nk, matiere: m.nom, titre: l[0], contenu: l[1], contenu_url: null, duree_min: Math.max(5, Math.round(words / 12)), ordre: li + 1 });
        });
        const qz = { id: ch.id + '-q', lecon_id: ch.id + '-l0', chapitre_id: ch.id, niveau: nk, matiere: m.nom, titre: 'Quiz — ' + c.t, duree_min: 5, actif: true };
        data.quiz.push(qz);
        c.q.forEach((q, qi) => data.questions.push({ id: qz.id + qi, quiz_id: qz.id, enonce: q[0], type: q[1], options: q[2], reponse_correcte: q[3], explication: q[4], ordre: qi + 1 }));
      });
    });
  });
  data.count = (nk) => data.chapitres.filter((c) => c.niveau === nk).length;
  G.RSutaData = data;
})(typeof window !== 'undefined' ? window : globalThis);
