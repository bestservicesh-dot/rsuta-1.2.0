"""Capture des interfaces RSuta avec repères numérotés pour le guide PDF.
Usage : servir app/ sur http://127.0.0.1:8080 puis  python3 docs/capture.py"""
from playwright.sync_api import sync_playwright
import os
D = os.path.expanduser('~/rsuta/docs/'); OUT = D + 'img/'
B = 'http://127.0.0.1:8080/index.html'
MARK_JS = """(specs)=>{document.querySelectorAll('.__mk').forEach(e=>e.remove());const W=innerWidth,H=innerHeight;let n=0;const res=[];
for(const s of specs){n++;const els=document.querySelectorAll(s[0]);const el=els[s[1]||0];if(!el){res.push(n+':MISSING '+s[0]);continue;}
const r=el.getBoundingClientRect();if(r.width===0){res.push(n+':HIDDEN '+s[0]);continue;}
let pos=s[2];let x,y;if(!pos){if(r.left>=32){x=r.left-31;y=r.top+Math.min(r.height,60)/2-14;}else{x=r.right-24;y=r.top-12;if(r.width<60){x=r.left+r.width/2-14;y=r.top-16;}}}else{x=pos.includes('r')?r.right-14:pos.includes('c')?r.left+r.width/2-14:r.left-6;y=pos.includes('b')?r.bottom-22:pos.includes('m')?r.top+r.height/2-14:r.top-8;}
x=Math.max(2,Math.min(W-30,x));y=Math.max(2,Math.min(H-30,y));
const hl=document.createElement('div');hl.className='__mk';hl.style.cssText=`position:fixed;left:${r.left-2}px;top:${r.top-2}px;width:${r.width+4}px;height:${r.height+4}px;border:2.5px dashed #e11d48;border-radius:10px;z-index:99998;pointer-events:none`;document.body.appendChild(hl);
const o=document.createElement('div');o.className='__mk';o.textContent=n;o.style.cssText=`position:fixed;left:${x}px;top:${y}px;width:28px;height:28px;border-radius:50%;background:#e11d48;color:#fff;font:800 15px Inter,sans-serif;display:grid;place-items:center;z-index:99999;box-shadow:0 0 0 3px #fff,0 3px 8px rgba(0,0,0,.4);pointer-events:none`;document.body.appendChild(o);}
return res;}"""


def shot(pg, name, specs, h=900, w=412):
    pg.set_viewport_size({'width': w, 'height': h}); pg.wait_for_timeout(450)
    miss = pg.evaluate(MARK_JS, specs) if specs else []
    if miss: print(name, '->', miss)
    pg.screenshot(path=OUT + name + '.jpg', type='jpeg', quality=86)
    pg.evaluate("document.querySelectorAll('.__mk').forEach(e=>e.remove())")


def go(pg, h):
    pg.evaluate(f"location.hash='#/{h}'"); pg.wait_for_timeout(500)


def login(pg, em, pw):
    pg.fill('#em', em); pg.fill('#pw', pw); pg.click('#btn-login'); pg.wait_for_timeout(3200)


def logout(pg):
    go(pg, 'profil'); pg.click('#btn-logout'); pg.click('.mfoot .btn.r'); pg.wait_for_timeout(600)


def revision_shots(pg):
    import random
    random.seed(7)
    go(pg, 'revision'); shot(pg, 'revision', [['.countdown b'], ['.cd-meta .btn'], ['.statrow'], ['.tile', 0], ['.tile', 1], ['.tile', 2], ['.tile', 3], ['.tile', 4], ['.tile', 5]])
    go(pg, 'diag'); n = pg.locator('.exq').count()
    for i in range(n):
        o = pg.locator(f'input[name=dg{i}]'); o.nth(random.randrange(o.count())).check()
    pg.evaluate("document.querySelector('.exq').closest('.body').scrollTop=0")
    shot(pg, 'diag', [['.card.mb', 0], ['.exq .pill', 0], ['.exq .ro', 0]])
    pg.click('text=Voir mon diagnostic'); pg.wait_for_timeout(600)
    shot(pg, 'diag_r', [['.score'], ['.list .item', 0], ['.row2 .btn.o'], ['.row2 .btn.y']])
    pg.click('text=Générer mon plan'); pg.wait_for_timeout(700); pg.evaluate("document.querySelectorAll('.toast,#toast').forEach(e=>e.remove())")
    shot(pg, 'plan', [['#exd'], ['.search .btn'], ['.statrow'], ['.plan-day', 0], ['.plan-day .pd-act .btn', 0], ['.plan-day .pd-act .btn', 1], ['.pager'], ['.btn.o.block']], h=1750)
    go(pg, 'fiches'); shot(pg, 'fiches', [['.tabs'], ['.search select'], ['.search input'], ['.list .item', 0], ['.pager']], h=1300)
    cid = pg.evaluate("RSutaDB.all('plans')[0].days[0].chapitre_id"); go(pg, 'fiche/' + cid)
    pg.evaluate("document.querySelector('.mc').open=true")
    shot(pg, 'fiche', [['.phead .act'], ['.fiche .pill'], ['.fiche section', 0], ['.fiche section.fx'], ['.fiche section.px'], ['.mc', 0], ['.ficheact .btn', 0], ['.ficheact .btn', 1], ['.ficheact .btn', 2], ['.ficheact .btn', 3]], h=2000)
    go(pg, 'cartes'); pg.click('.flash'); pg.wait_for_timeout(250)
    shot(pg, 'cartes', [['.boxes'], ['.wrap .pill.y'], ['.qprog'], ['.flash .fq'], ['.flash .fa'], ['.row2 .btn.r'], ['.row2 .btn:not(.r)']])
    pg.click('text=Je savais'); pg.wait_for_timeout(200)
    go(pg, 'examen'); shot(pg, 'examen', [['.tile', 0], ['.tile', 1], ['.wrap > p.muted']])
    pg.click('.tile >> nth=1'); pg.wait_for_timeout(800)
    st = pg.evaluate("JSON.parse(localStorage.getItem('rsuta.exam.'+RSutaAuth.current.id))")
    for i, q in enumerate(st['qs']):
        if q['t'] == 'gen':
            a = q['gen'].get('answers') or [q['gen'].get('poly')]
            pg.fill(f'#exa{i}', '' if i == 1 else ' ; '.join(str(x).replace('.', ',') for x in a))
        else:
            pg.locator(f'input[name=exr{i}][value="{q["good"]}"]').check()
    pg.evaluate("document.querySelector('.body').scrollTop=0")
    shot(pg, 'examen_go', [['#extimer'], ['.extimer .btn'], ['.exh .pill', 0], ['.exq .qt', 0], ['.exq .input', 0], ['.exq .mkb', 0]], h=1150)
    pg.click('.extimer .btn'); pg.wait_for_timeout(300); pg.click('.mfoot .btn.r'); pg.wait_for_timeout(900)
    shot(pg, 'examen_r', [['.score'], ['.item.exc', 0], ['.item.exc .btn', 0], ['.row2 .btn.o'], ['.row2 .btn.y']], h=1300)
    go(pg, 'faiblesses'); shot(pg, 'faiblesses', [['.card.mb .mrow', 0], ['.list .item', 0], ['.list .item .meter', 0]], h=1200)
    go(pg, 'home'); pg.evaluate("document.getElementById('revcard').scrollIntoView({block:'center'})"); pg.wait_for_timeout(200)
    shot(pg, 'home_rev', [['#revcard .cd'], ['#revcard .rc-tx'], ['#revcard .rc-act .btn', 0], ['#revcard .rc-act .btn', 1], ['#revcard .rc-act .btn', 2]])
    pg.set_viewport_size({'width': 1366, 'height': 800}); go(pg, 'revision'); shot(pg, 'desk_revision', [], h=800, w=1366)


def v12_shots(pg):
    # ---- élève : motivation + partage + rapport + exercices interactifs
    go(pg, 'progres')
    shot(pg, 'progres', [['.lvcard'], ['.stats .stat', 0], ['.stats .stat', 3], ['.tip.mt'], ['.heat', 0, 'm'], ['.bdg-it.on', 0, 'm'], ['.bdg-it:not(.on)', 0, 'm'], ['.tbl thead'], ['.row2 .btn.y'], ['.row2 .btn.o']], h=1850)
    pg.click('#btn-share-prog'); pg.wait_for_selector('#share-img', timeout=15000); pg.wait_for_timeout(300)
    shot(pg, 'partage', [['.share-prev', 0, 'm'], ['.modal p'], ['.mfoot .btn', 0], ['.mfoot .btn', 1], ['.mfoot .btn.y']], h=1400)
    pg.click('.mfoot .btn.o'); pg.wait_for_timeout(400)
    go(pg, 'rapport')
    shot(pg, 'rapport', [['.rhead'], ['.rk', 0], ['.rk', 2], ['.rk', 5], ['.rchart', 0, 'm'], ['.rb', 0], ['.report h4', 1], ['#btn-print']], h=1750)
    go(pg, 'exos/niv-BEPC-m0-c1')
    pg.locator('#xi-1 .bank .chip').nth(1).click(); pg.wait_for_timeout(120)
    shot(pg, 'exos', [['#xscore'], ['#xi-0 .xq'], ['#xi-0 .bank .chip', 0], ['#xi-0 .seq'], ['#xi-1 .xq'], ['.blank.f', 0], ['.blank:not(.f)', 0], ['#xi-1 .bank .chip', 0], ['.xf .btn:not(.o)', 0, 'l'], ['.xf .btn.o', 0], ['#xgen .pill.y'], ['#xg-in'], ['#xgen .search .btn:not(.o)']], h=1900)
    # ---- enseignant
    logout(pg); login(pg, 'prof@rsuta.bj', 'prof123')
    go(pg, 'classe'); shot(pg, 'classe', [['#btn-newclass'], ['.tip', 0], ['.list .item', 0]])
    pg.click('.list .item'); pg.wait_for_timeout(500)
    shot(pg, 'classe_devoirs', [['#btn-newdev'], ['.list .item', 0], ['.list .item .ic', 0], ['.list .item .tx', 0]])
    pg.click('#btn-newdev'); pg.wait_for_timeout(400)
    pg.fill('#nd-t', 'Devoir du vendredi'); pg.locator('#nd-e').fill("Résous l'équation 4x − 3 = 2x + 9."); pg.click('#btn-ndadd'); pg.wait_for_timeout(250)
    pg.locator('#nd-e').fill('Cite les deux types de mélanges vus en PCT. || mélange'); pg.click('#btn-ndadd'); pg.wait_for_timeout(250)
    shot(pg, 'devoir_form', [['#nd-t'], ['#nd-m'], ['#nd-l'], ['#nd-c'], ['#nd-e'], ['#btn-ndadd'], ['#nd-k'], ['#nd-n'], ['#btn-ndgen'], ['#nd-items .item', 0], ['#nd-items .item .btn', 0], ['#btn-publish']], h=1650)
    pg.select_option('#nd-k', 'pythagore'); pg.select_option('#nd-n', '2'); pg.click('#btn-ndgen'); pg.wait_for_timeout(400)
    pg.click('#btn-publish'); pg.wait_for_timeout(600); pg.click('.mfoot .btn:not(.o)'); pg.wait_for_timeout(900)
    shot(pg, 'devoir_code', [['#qrbox', 0, 'm'], ['#code-ta', 0, 'm'], ['.mfoot .btn', 1], ['.mfoot .btn', 2], ['.mfoot .btn.y']], h=1250)
    code = pg.input_value('#code-ta')
    pg.click('.mfoot .btn.o'); pg.wait_for_timeout(400)
    go(pg, 'classe'); pg.wait_for_timeout(300)
    pg.click('.list .item'); pg.wait_for_timeout(400)
    pg.click('button:has-text("Devoir n°1")'); pg.wait_for_timeout(500)
    shot(pg, 'devoir_detail', [['.stats .stat', 0], ['.stats .stat', 1], ['.stats .stat', 3], ['#btn-sharedev'], ['.chips .btn.o', 0], ['#btn-csv'], ['#tbl-res tbody tr', 0], ['#tbl-res .btn.sm.o', 0]], h=1250)
    pg.click('button:has-text("Importer des copies")'); pg.wait_for_timeout(300)
    shot(pg, 'devoir_import', [['#cimp'], ['.modal p.muted'], ['.mfoot .btn', 0], ['.mfoot .btn', 1], ['.mfoot .btn', 2]], h=900)
    pg.keyboard.press('Escape'); pg.evaluate("document.getElementById('modal')&&document.getElementById('modal').remove()"); pg.wait_for_timeout(300)
    # ---- élève : recevoir, composer, rendre
    logout(pg); login(pg, 'kevin@rsuta.bj', 'kevin123')
    go(pg, 'classe'); shot(pg, 'classe_eleve', [['#crecv'], ['#btn-recv'], ['.chips .btn.o', 0], ['.chips .btn.o', 1]])
    pg.fill('#crecv', code); pg.click('#btn-recv'); pg.wait_for_timeout(600)
    shot(pg, 'recu', [['#btn-start'], ['.stats .stat', 1], ['.card h2']])
    pg.click('#btn-start'); pg.wait_for_timeout(600)
    pg.locator('[data-crep]').nth(0).fill('x = 6')
    shot(pg, 'copie', [['#ctimer'], ['#ctime', 0, 'l'], ['.card.mt', 0], ['[data-crep]', 0], ['#btn-rendre']], h=1500)
    pg.locator('[data-crep]').nth(1).fill('homogène et hétérogène'); pg.click('#btn-rendre'); pg.wait_for_timeout(300); pg.click('.mfoot .btn.r'); pg.wait_for_timeout(900)
    shot(pg, 'rendu', [['.score', 0, 'l'], ['.card.center p', 0], ['.send'], ['#btn-copy-code'], ['.list .btn.sm.o', 0]], h=1250)
    pg.click('#btn-copy-code'); pg.wait_for_timeout(600)
    shot(pg, 'copie_qr', [['#qrbox', 0, 'm'], ['#code-ta', 0, 'm'], ['.mfoot .btn', 1], ['.mfoot .btn.y']], h=1250)
    pg.click('.mfoot .btn.o'); pg.wait_for_timeout(400)

with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 412, 'height': 900}, device_scale_factor=2, locale='fr-FR'); pg = ctx.new_page(); pg.add_init_script('window._noSW=true')
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(B); pg.wait_for_timeout(2200)
    shot(pg, 'login', [['#em'], ['#pw'], ['.pwd button'], ['#rm'], ['a[href="#/forgot"]'], ['#btn-login'], ['a[href="#/register"]'], ['.auth-card .tip']])
    go(pg, 'register'); shot(pg, 'register', [['#nm'], ['#em'], ['#nv'], ['#pw'], ['#pw2'], ['#qs'], ['#rp'], ['#ens'], ['button[type=submit]']], h=1250)
    go(pg, 'forgot'); shot(pg, 'forgot', [['#em'], ['#cd'], ['#pw'], ['button[type=submit]'], ['.auth-foot a']])
    go(pg, 'login'); login(pg, 'kevin@rsuta.bj', 'kevin123')
    shot(pg, 'home', [['.topbar .logo'], ['.topbar .avatar', 0, 'c'], ['.bell', 0, 'c'], ['.hello'], ['.progress-card'], ['#card-CEP'], ['#card-BEPC'], ['#card-BAC'], ['#card-LICENCE'], ['#btn-scan'], ['.bottomnav button', 0], ['.bottomnav button', 1], ['.bottomnav button', 2], ['.bottomnav button', 3]])
    shot(pg, 'home_bas', [['.list.grid .item', 0], ['.list.grid .item', 1], ['.list.grid .item', 2], ['#defi'], ['.card .btn.sm', 0], ['.card .btn.o', 0]], h=1500)
    go(pg, 'cours/BEPC'); shot(pg, 'cours', [['.phead .act'], ['.tabs'], ['.list .item', 0], ['.list .item .pbar', 0]])
    pg.click('.list .item'); pg.wait_for_timeout(400); shot(pg, 'matiere', [['.phead .back'], ['.list .item', 0]])
    pg.click('.list .item'); pg.wait_for_timeout(400); shot(pg, 'chapitre', [['.list .item', 0], ['.done-dot', 0], ['.btn.y.block']])
    pg.click('.list .item'); pg.wait_for_timeout(400); shot(pg, 'lecon', [['.phead .act'], ['.lesson h2'], ['.lesson .ex'], ['.list .btn', 0], ['.list .btn', 1], ['.list .btn', 2], ['.list .btn', 3], ['.list .btn.sm', 0]], h=1500)
    go(pg, 'quiz'); shot(pg, 'quiz', [['.tabs'], ['.card .btn.y'], ['.search input'], ['.list .item', 0], ['.pager']], h=1450)
    go(pg, 'quiz/' + pg.evaluate("RSutaData.quiz.find(q=>q.niveau==='BEPC').id")); pg.locator('.opt').nth(1).click(); pg.wait_for_timeout(300)
    shot(pg, 'quiz_play', [['.phead .back'], ['.wrap .pill.y'], ['.qprog'], ['.qtext'], ['.opt', 0], ['.explain'], ['#qfb .btn']])
    go(pg, 'scan'); shot(pg, 'scan', [['.mhead .back'], ['.mhead .ttl span', 0, 'c'], ['.mhead .act'], ['.scan-area'], ['.btn-scanner .l'], ['.btn-scanner .r'], ['.scan-actions .tip'], ['#btn-import'], ['#btn-type'], ['.bottomnav button', 0], ['.bottomnav button', 1], ['.bottomnav button', 2], ['.bottomnav button', 3]])
    pg.click('#btn-type'); pg.wait_for_timeout(300); pg.fill('#vt', 'Exercice : Résoudre 2x + 5 = 13')
    pg.click('#mk-vt .mk:text-is("²")'); pg.wait_for_timeout(100)
    shot(pg, 'verify', [['#vt'], ['#mk-vt'], ['#vn'], ['.mfoot .btn:not(.o)']], h=1000)
    pg.fill('#vt', 'Exercice : Résoudre 2x + 5 = 13')
    pg.click('.mfoot .btn:not(.o)'); pg.wait_for_timeout(1500)
    shot(pg, 'result', [['.mhead .back'], ['.mhead .act', 0, 'c'], ['.badges .bdg', 0], ['.badges .bdg', 1], ['.badges .bdg', 2], ['.msg .av'], ['.bub.y', 0], ['.bub.b', 0], ['.bub.y', 1], ['.bub.b', 1], ['.bub.y', 2], ['.chip', 0], ['.chip', 1], ['#btn-listen'], ['.composer .ib', 0], ['.mkbtn'], ['#ask'], ['#micb'], ['.composer .send']], h=1220)
    shot(pg, 'clean_result', [], h=900)
    pg.fill('#ask', 'oui'); pg.keyboard.press('Enter'); pg.wait_for_timeout(1300)
    pg.fill('#ask', pg.evaluate("(()=>{const m=document.querySelectorAll('.msg:not(.me) .bub');const t=m[m.length-1].innerText;const r=t.match(/Résoudre (-?\\d+)x ([+-]) (\\d+) = (-?\\d+)/);if(!r)return 'x = 1';const a=+r[1],b=(r[2]=='-'?-1:1)*+r[3],c=+r[4];return 'x = '+((c-b)/a);})()"))
    pg.keyboard.press('Enter'); pg.wait_for_timeout(1300)
    pg.set_viewport_size({'width': 412, 'height': 900}); pg.wait_for_timeout(200); pg.evaluate("document.getElementById('thread').scrollTop=1e6")
    shot(pg, 'result_suite', [['.msg.me', 0], ['.msg.me', 1]])
    go(pg, 'scan'); pg.set_input_files('#file', D + 'sample_flou.jpg'); pg.wait_for_timeout(700); pg.click('.mfoot .btn:has-text("Lire tout")'); pg.wait_for_timeout(2500)
    shot(pg, 'flou', [['.modal p'], ['.mfoot .btn', 0], ['.mfoot .btn', 1]])
    pg.click('.mfoot .btn', position={'x': 5, 'y': 5}); pg.wait_for_timeout(300); pg.evaluate("document.getElementById('modal')&&document.getElementById('modal').remove()")
    go(pg, 'scan'); pg.set_input_files('#file', D + 'sample_devoir.jpg'); pg.wait_for_timeout(900)
    bx = pg.locator('#cropbox').bounding_box(); pg.mouse.move(bx['x'] + bx['width'] * 0.08, bx['y'] + bx['height'] * 0.12); pg.mouse.down(); pg.mouse.move(bx['x'] + bx['width'] * 0.92, bx['y'] + bx['height'] * 0.55, steps=8); pg.mouse.up()
    shot(pg, 'crop', [['.modal p'], ['#cropbox'], ['#csel'], ['.mfoot .btn', 0], ['.mfoot .btn', 1], ['.mfoot .btn', 2]])
    pg.click('.mfoot .btn:has-text("Lire tout")'); pg.wait_for_selector('#vt', timeout=60000); pg.wait_for_timeout(300)
    shot(pg, 'ocr_verif', [['#vt'], ['#vn'], ['.mfoot .btn:not(.o)']])
    pg.click('.mfoot .btn:not(.o)'); pg.wait_for_timeout(1800)
    shot(pg, 'result_epreuve', [['.msg.me img'], ['.part-label', 0], ['.bub.w', 0], ['.badges .bdg', 1]], h=1100)
    pg.evaluate("""async()=>{const L=['Résoudre 3x - 4 = 11','Calculer 2/3 + 1/4','Calculer le PGCD de 84 et 126','Développer (x+2)(x-5)','Calculer 20 % de 15000','Factoriser x^2 - 9','Résoudre x^2 - 5x + 6 = 0','Calculer 12 + 3 × 4','Conjugue manger au futur','Définir la photosynthèse','Le triangle ABC est rectangle en A avec AB = 6 cm et AC = 8 cm. Calculer BC.'];for(const t of L){await RSutaApp.createDevoir(t,{source:'texte'});}}""")
    gid = pg.evaluate("async()=>(await RSutaApp.createDevoir('Étudier les variations de f(x) = x^3 - 3x + 1',{source:'texte'})).id")
    go(pg, 'result/' + gid); pg.evaluate("document.querySelector('.mplot').scrollIntoView({block:'center'})"); pg.wait_for_timeout(300)
    shot(pg, 'result_graph', [['.mplot'], ['.mplot path.cv', 0, 'c']], h=1000)
    go(pg, 'devoirs'); shot(pg, 'devoirs', [['.phead .act'], ['.tabs'], ['.search input'], ['.list .item .tx', 0], ['.list .item .ib', 0], ['.pager']], h=1350)
    go(pg, 'chat'); pg.fill('#ask', 'Calculer 3/4 + 5/6'); pg.keyboard.press('Enter'); pg.wait_for_timeout(1300)
    pg.set_viewport_size({'width': 412, 'height': 1500}); pg.wait_for_timeout(200); pg.evaluate("document.getElementById('thread').scrollTop=0")
    shot(pg, 'chat', [['.mhead .act'], ['.badges'], ['.msg .bub', 0], ['.msg.me .bub', 0], ['.listen'], ['#ask']], h=1250)
    go(pg, 'epreuves'); shot(pg, 'epreuves', [['.phead .act'], ['#btn-submit-ep'], ['.tabs'], ['.search input'], ['.list .item', 0]])
    pg.click('.list .item'); pg.wait_for_timeout(400); shot(pg, 'epreuve', [['.card .pill', 0], ['.card h2'], ['.card div[style*=pre-wrap]'], ['#btn-treat']], h=1100)
    go(pg, 'epreuve-new'); shot(pg, 'epreuve_new', [['#en'], ['#em2'], ['#et'], ['#ex'], ['.card .btn.o.sm'], ['#esh'], ['.row2 .btn.o'], ['.row2 .btn:not(.o)']], h=1150)
    go(pg, 'profil'); shot(pg, 'profil', [['.phead .act'], ['.prof-head button'], ['.stats'], ['.card.mt'], ['.sub-card .btn'], ['.list .item', 0], ['.list .item', 1], ['.list .item', 2], ['.list .item', 3], ['.list .item', 4], ['#btn-contact'], ['#btn-logout']], h=1530)
    pg.click('#btn-contact'); pg.wait_for_timeout(400)
    shot(pg, 'contact', [['#ct-tel'], ['#ct-mail'], ['#ct-web'], ['.mfoot .btn']])
    pg.click('.mfoot .btn'); pg.wait_for_timeout(300)
    go(pg, 'notifications'); shot(pg, 'notifications', [['.phead .back'], ['.phead .act'], ['.notif', 0], ['.notif button', 0]])
    go(pg, 'parametres')
    shot(pg, 'parametres1', [['.set-group select', 0], ['.set-group input[type=range]', 0], ['.set-group select', 1], ['.set-group select', 2], ['.set-group input[type=url]'], ['.set-group input[type=password]'], ['.set-group input[type=text]'], ['.switch', 0], ['.set-group .btn', 0]], h=1350)
    pg.evaluate("document.querySelector('.body').scrollTop=document.querySelectorAll('.set-group')[2].offsetTop-10")
    shot(pg, 'parametres2', [['.switch', 1], ['.set-group input[type=range]', 1], ['.set-group select', 3], ['.set-group .btn', 1], ['.switch', 2], ['.switch', 3], ['.switch', 4], ['.set-group select', 4], ['.switch', 5], ['input[type=time]'], ['.set-group .btn', 2], ['.set-group .btn', 3], ['.set-group .btn', 4], ['.set-group .btn', 5], ['.set-group .btn', 6], ['.set-group .btn.r', 0], ['.set-group .btn.r', 1]], h=1900)
    pg.evaluate("document.querySelector('.body').scrollTop=1e6"); pg.wait_for_timeout(200); pg.click('#btn-changelog'); pg.wait_for_timeout(400)
    shot(pg, 'changelog', [['.cl', 0], ['.cl', 1], ['.mfoot .btn']], h=1000)
    pg.click('.mfoot .btn'); pg.wait_for_timeout(300)
    revision_shots(pg)
    v12_shots(pg)
    logout(pg); login(pg, 'admin@rsuta.bj', 'RSuta@2026')
    go(pg, 'admin'); shot(pg, 'admin', [['.sidebar nav button', 13], ['.stats'], ['.search input'], ['.search .btn'], ['.tbl td button', 0], ['.tbl tr:nth-child(2) td button', 1], ['.tbl tr:nth-child(2) td button', 2], ['.tbl tr:nth-child(2) td button', 3]], h=800, w=1366)
    logout(pg); login(pg, 'kevin@rsuta.bj', 'kevin123')
    go(pg, 'home'); shot(pg, 'desk_home', [['.sidebar .logo'], ['.sidebar nav'], ['.sidebar .me'], ['.hero'], ['.parcours'], ['#btn-scan']], h=800, w=1366)
    go(pg, 'result/' + pg.evaluate("RSutaDB.where('devoirs',d=>d.user_id===RSutaAuth.current.id&&d.parts.length===1)[0].id")); shot(pg, 'desk_result', [], h=800, w=1366)
    go(pg, 'cours/BAC'); shot(pg, 'desk_cours', [], h=800, w=1366)
    pg.evaluate("RSutaApp.S.theme='dark';localStorage.setItem('rsuta.settings',JSON.stringify(RSutaApp.S));document.documentElement.dataset.theme='dark'")
    go(pg, 'home'); shot(pg, 'dark_home', [])
    go(pg, 'cours/BEPC'); shot(pg, 'dark_cours', [])
    pg.evaluate("RSutaApp.S.theme='light';localStorage.setItem('rsuta.settings',JSON.stringify(RSutaApp.S));document.documentElement.dataset.theme='light'")
    go(pg, 'home'); shot(pg, 'tablet_home', [], h=1024, w=768)
    go(pg, 'home'); shot(pg, 'clean_home', [])
    print('errors', errs); b.close()
