"""RSuta v1.2 — test de bout en bout : progrès/badges, partage, rapport, exercices interactifs,
cycle complet enseignant → élève → copie (code), import et CSV."""
import sys, re
from playwright.sync_api import sync_playwright
BASE = 'http://127.0.0.1:8080/index.html'
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/shots'
errs, fails = [], []
def check(cond, msg):
    print(('OK   ' if cond else 'FAIL ') + msg)
    if not cond: fails.append(msg)

def newpage(b):
    ctx = b.new_context(viewport={'width': 412, 'height': 900}, device_scale_factor=1, locale='fr-FR', accept_downloads=True)
    ctx.add_init_script('window._noSW=true')
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)))
    pg.on('console', lambda m: errs.append('CONSOLE ' + m.text) if m.type == 'error' else None)
    pg.on('dialog', lambda d: d.accept())
    pg.goto(BASE); pg.wait_for_timeout(1500)
    return ctx, pg

def login(pg, em, pw):
    pg.fill('#em', em); pg.fill('#pw', pw); pg.click('#btn-login'); pg.wait_for_timeout(900)

def go(pg, h, t=500):
    pg.evaluate(f"location.hash='#/{h}'"); pg.wait_for_timeout(t)

with sync_playwright() as p:
    b = p.chromium.launch()
    # ------------------------------------------------ élève
    ctx, pg = newpage(b)
    login(pg, 'kevin@rsuta.bj', 'kevin123')
    check(pg.locator('#xpstrip').count() == 1, 'bandeau XP sur l\'accueil')
    st = pg.evaluate('RSutaApp3.stats()')
    check(st['xp'] == 360 and st['level']['nom'] == 'Apprenti', 'XP démo = 360, niveau Apprenti (%s, %s)' % (st['xp'], st['level']['nom']))
    check(st['streak'] >= 1, 'série calculée (%d)' % st['streak'])
    pg.screenshot(path=OUT + '/v12_home.png')
    go(pg, 'progres')
    check(pg.locator('.bdg-it').count() == 20, '20 badges affichés')
    check(pg.locator('.bdg-it.on').count() >= 3, 'badges obtenus >= 3 (%d)' % pg.locator('.bdg-it.on').count())
    check(pg.locator('.heat i:not(.e)').count() == 84, 'carte d\'activité 84 jours')
    # partage (repli modal car navigator.share absent)
    pg.click('#btn-share-prog')
    try: pg.wait_for_selector('#share-img', timeout=6000); pg.wait_for_timeout(300)
    except Exception: pass
    check(pg.locator('#share-img').count() == 1, 'aperçu image de partage')
    size = pg.evaluate("(()=>{const i=document.querySelector('#share-img');return [i.naturalWidth,i.naturalHeight]})()")
    check(size == [1080, 1080], 'image 1080×1080 (%s)' % size)
    with pg.expect_download() as dl:
        pg.click('.mfoot .btn.y')
    check(dl.value.suggested_filename.endswith('.png'), 'téléchargement PNG ' + dl.value.suggested_filename)
    pg.keyboard.press('Escape'); pg.evaluate("document.getElementById('modal')&&document.getElementById('modal').remove()")
    # exercices interactifs
    go(pg, 'exos/niv-BEPC-m0-c1', 700)
    check(pg.locator('.xi').count() >= 2, 'cartes d\'exercices (%d)' % pg.locator('.xi').count())
    items = pg.evaluate("RSutaApp3._xs ? null : RSutaExos.items('niv-BEPC-m0-c1')")
    # ordre : cliquer dans le bon ordre
    o = [i for i in items if i['t'] == 'ordre'][0]
    k = [i['t'] for i in items].index('ordre')
    for step in o['ans']:
        pg.locator(f'#xi-{k} .bank .chip', has_text=step).first.click(); pg.wait_for_timeout(60)
    pg.locator(f'#xi-{k} .xf .btn:not(.o)').click(); pg.wait_for_timeout(300)
    check(pg.locator(f'#xi-{k} .okc').count() == 1, 'ordre correct → Bravo')
    # trous : volontairement faux puis correction affichée
    k2 = [i['t'] for i in items].index('trous'); tr = items[k2]
    wrong = [w for w in tr['bank'] if w not in tr['ans']]
    for n in range(len(tr['ans'])):
        pg.locator(f'#xi-{k2} .bank .chip:not(.used)', has_text=wrong[0] if n == 0 else tr['ans'][n]).first.click(); pg.wait_for_timeout(60)
    pg.locator(f'#xi-{k2} .xf .btn:not(.o)').click(); pg.wait_for_timeout(300)
    check(pg.locator(f'#xi-{k2} .koc').count() == 1 and pg.locator(f'#xi-{k2} .fix').count() >= 1, 'trous faux → correction')
    pg.screenshot(path=OUT + '/v12_exos.png', full_page=True)
    # paires sur un autre chapitre
    go(pg, 'exos/niv-BAC-m0-c3', 700)
    its = pg.evaluate("RSutaExos.items('niv-BAC-m0-c3')"); kp = [i['t'] for i in its].index('paires'); pr = its[kp]
    for li, pair in enumerate(pr['pairs']):
        pg.locator(f'#xi-{kp} .pl').nth(li).click(); pg.wait_for_timeout(40)
        pg.locator(f'#xi-{kp} .pr', has_text=pair[1]).first.click(); pg.wait_for_timeout(40)
    pg.locator(f'#xi-{kp} .xf .btn:not(.o)').click(); pg.wait_for_timeout(300)
    check(pg.locator(f'#xi-{kp} .okc').count() == 1, 'paires correctes → Bravo')
    check(pg.locator('#xgen').count() == 1, 'exercice d\'application généré (suites)')
    n_exo = pg.evaluate("RSutaDB.where('tentatives',t=>t.source==='exo').length")
    check(n_exo == 3, 'tentatives exo enregistrées (%d)' % n_exo)
    # rapport parents
    go(pg, 'rapport', 700)
    check(pg.locator('.report .rk').count() == 6, 'rapport : 6 indicateurs')
    check(pg.locator('.report .rb').count() >= 1, 'rapport : maîtrise par matière')
    pdf = pg.pdf(path=OUT + '/v12_rapport.pdf') if False else None
    # ------------------------------------------------ enseignant
    ctx2, pt = newpage(b)
    login(pt, 'prof@rsuta.bj', 'prof123')
    check(pt.locator('#home-classe').count() == 1, 'accueil enseignant : carte Ma classe')
    go(pt, 'classe', 600)
    check(pt.locator('.list .item').count() == 1, 'classe démo présente')
    pt.locator('.list .item').first.click(); pt.wait_for_timeout(500)
    pt.locator('.list .item').first.click(); pt.wait_for_timeout(600)
    check(pt.locator('#tbl-res tbody tr').count() == 6, 'devoir démo : 6 copies')
    with pt.expect_download() as dl:
        pt.click('#btn-csv')
    path = dl.value.path(); csv = open(path, encoding='utf-8-sig').read()
    check(csv.count('\n') == 6 and 'Aïcha' in csv, 'export CSV (6 lignes + entête)')
    # nouveau devoir
    go(pt, 'classe', 400); pt.locator('.list .item').first.click(); pt.wait_for_timeout(400)
    pt.click('#btn-newdev'); pt.wait_for_timeout(400)
    pt.fill('#nd-t', 'Devoir test v1.2'); pt.fill('#nd-m', '15')
    pt.fill('#nd-e', 'Résous l\'équation 4x − 3 = 2x + 9.'); pt.click('#btn-ndadd'); pt.wait_for_timeout(400)
    pt.fill('#nd-e', 'Explique la règle des signes || règle'); pt.click('#btn-ndadd'); pt.wait_for_timeout(300)
    pt.fill('#nd-e', 'Cite deux qualités d\'un bon citoyen.'); pt.click('#btn-ndadd'); pt.wait_for_timeout(300)
    pt.select_option('#nd-k', 'pythagore'); pt.select_option('#nd-n', '2'); pt.click('#btn-ndgen'); pt.wait_for_timeout(400)
    n_items = pt.locator('#nd-items .item').count()
    check(n_items == 5, 'nouveau devoir : 5 exercices (%d)' % n_items)
    check(pt.input_value('#nd-t') == 'Devoir test v1.2', 'titre conservé après ajout')
    first = pt.locator('#nd-items .item').first.inner_text()
    check('x = 6' in first, 'correction auto préparée (x = 6) : ' + first.replace('\n', ' ')[:80])
    pt.screenshot(path=OUT + '/v12_newdev.png', full_page=True)
    pt.click('#btn-publish'); pt.wait_for_selector('#code-ta', timeout=6000)
    code = pt.input_value('#code-ta')
    check(code.startswith('RSD1.'), 'code devoir généré (%d car.)' % len(code))
    check(pt.locator('#qrbox canvas').count() == 1, 'QR code du devoir')
    pt.screenshot(path=OUT + '/v12_code.png')
    # QR décodable par jsQR (round-trip)
    rt = pt.evaluate("""(()=>{const c=document.querySelector('#qrbox canvas');const d=c.getContext('2d').getImageData(0,0,c.width,c.height);const r=jsQR(d.data,c.width,c.height);return r&&r.data})()""")
    check(rt == code, 'QR relu par jsQR = code')
    # ------------------------------------------------ élève reçoit, fait, rend
    go(pg, 'classe', 500)
    pg.fill('#crecv', 'Bonjour la classe, voici le devoir :\n' + code + '\nBon courage'); pg.click('#btn-recv'); pg.wait_for_timeout(700)
    check('classe/d/' in pg.evaluate('location.hash'), 'élève : devoir reçu')
    pg.click('#btn-start'); pg.wait_for_timeout(500)
    check(pg.locator('#ctimer').count() == 1, 'chrono affiché')
    its = pg.evaluate("RSutaDB.all('classe_recus')[0].devoir.it")
    inputs = pg.locator('[data-crep]')
    inputs.nth(0).fill('x = 6'); inputs.nth(1).fill('règle'); inputs.nth(2).fill('honnête et respectueux')
    a3 = its[3].get('a') or [0]; inputs.nth(3).fill(str(a3[0]).replace('.', ','))
    inputs.nth(4).fill('999')
    pg.screenshot(path=OUT + '/v12_copie.png', full_page=True)
    pg.click('#btn-rendre'); pg.wait_for_timeout(300); pg.click('.mfoot .btn.r'); pg.wait_for_timeout(900)
    rec = pg.evaluate("RSutaDB.all('classe_recus')[0]")
    check(rec['statut'] == 'rendu' and rec['ok'][0] == 1 and rec['ok'][4] == 0 and rec['ok'][2] is None, 'copie notée : ok=%s note=%s' % (rec['ok'], rec['note']))
    pg.click('#btn-copy-code'); pg.wait_for_timeout(600)
    rcode = pg.input_value('#code-ta')
    check(rcode.startswith('RSR1.'), 'code copie RSR1')
    pg.screenshot(path=OUT + '/v12_rendu.png')
    # code altéré refusé
    bad = rcode[:-1] + ('0' if rcode[-1] != '0' else '1')
    err = pt.evaluate("(c)=>{try{RSutaApp3.decode(c,'RSR1');return 'accepté'}catch(e){return e.message}}", bad)
    check('modifié' in err, 'code altéré refusé : ' + err)
    # ------------------------------------------------ enseignant importe
    go(pt, 'classe', 400)
    pt.click('#btn-import'); pt.wait_for_timeout(300)
    pt.fill('#cimp', 'Kévin: ' + rcode + '\n' + rcode); pt.click('.mfoot .btn:not(.o)'); pt.wait_for_timeout(1000)
    check(pt.locator('#tbl-res tbody tr').count() == 1, 'copie importée (doublon ignoré)')
    pt.screenshot(path=OUT + '/v12_resultats.png', full_page=True)
    # XP élève après devoir de classe
    go(pg, 'progres', 500)
    st2 = pg.evaluate('RSutaApp3.stats()')
    check(st2['xp'] > st['xp'] and st2['n']['classe'] == 1, 'XP augmentés (%d → %d)' % (st['xp'], st2['xp']))
    b.close()
print('\n'.join(errs) or 'NO ERRORS')
print('RESULT', 'ALL OK' if not fails else '%d FAIL(S)' % len(fails))
