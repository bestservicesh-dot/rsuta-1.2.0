from playwright.sync_api import sync_playwright
import random
S='/home/user/rsuta/tests/shots/'
def go(pg,h,t=500): pg.evaluate(f"location.hash='#/{h}'"); pg.wait_for_timeout(t)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_context(viewport={'width':412,'height':900}).new_page(); errs=[]
    pg.add_init_script("window._noSW=true")
    pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e))); pg.on('console',lambda m: errs.append('CONSOLE '+m.text) if m.type=='error' else None)
    pg.on('dialog', lambda d: d.accept())
    pg.goto('http://127.0.0.1:8080/index.html'); pg.wait_for_timeout(1500)
    pg.fill('#em','kevin@rsuta.bj'); pg.fill('#pw','kevin123'); pg.click('#btn-login'); pg.wait_for_timeout(700)
    print('niveau', pg.evaluate('RSutaAuth.current.niveau'), 'revcard', pg.locator('#revcard').count())
    pg.evaluate("document.getElementById('revcard').scrollIntoView()"); pg.wait_for_timeout(200); pg.screenshot(path=S+'r_home.png')
    go(pg,'revision'); pg.screenshot(path=S+'r_hub.png')
    # diagnostic
    go(pg,'diag'); n=pg.locator('.exq').count(); print('diag questions', n)
    for i in range(n):
        opts=pg.locator(f'input[name=dg{i}]'); opts.nth(random.randrange(opts.count())).check()
    pg.screenshot(path=S+'r_diag.png')
    pg.click('text=Voir mon diagnostic'); pg.wait_for_timeout(600); print('diag hash', pg.evaluate('location.hash'), pg.inner_text('.score'))
    pg.screenshot(path=S+'r_diagres.png')
    pg.click('text=Générer mon plan'); pg.wait_for_timeout(600)
    print('plan days', pg.evaluate("RSutaDB.all('plans')[0].days.length"), 'items on page', pg.locator('.plan-day').count(), 'pager', pg.locator('.pager').count())
    pg.screenshot(path=S+'r_plan.png')
    # fiche
    cid=pg.evaluate("RSutaDB.all('plans')[0].days[0].chapitre_id"); go(pg,'fiche/'+cid); print('fiche fracs', pg.locator('.fiche .frac, .fiche sup').count()); pg.screenshot(path=S+'r_fiche.png', full_page=True)
    # cartes
    go(pg,'cartes'); total=pg.evaluate("RSutaApp2.dueQueue().fresh.length"); print('cartes nouvelles', total)
    for k in range(4):
        pg.click('.flash'); pg.wait_for_timeout(150)
        if k==0: pg.screenshot(path=S+'r_card.png')
        pg.click('text=Je savais' if k%2==0 else 'text=À revoir'); pg.wait_for_timeout(150)
    print('cartes rows', pg.evaluate("RSutaDB.all('cartes').map(r=>r.box+':'+r.due).join(',')"), 'queue', pg.inner_text('.qprog ~ .flash small') if pg.locator('.flash').count() else '')
    # examen express
    go(pg,'examen'); pg.click('text=Express'); pg.wait_for_timeout(700)
    print('exam hash', pg.evaluate('location.hash'), 'q', pg.locator('.exq').count(), 'timer', pg.inner_text('#extimer'))
    st=pg.evaluate("JSON.parse(localStorage.getItem('rsuta.exam.'+RSutaAuth.current.id))")
    for i,q in enumerate(st['qs']):
        if q['t']=='gen':
            a=q['gen'].get('answers') or [q['gen'].get('poly')]
            if i==0: pg.fill(f'#exa{i}', 'je sais pas')
            else: pg.fill(f'#exa{i}', ' ; '.join(str(x) for x in a))
        else: pg.locator(f'input[name=exr{i}][value="{q["good"]}"]').check()
    pg.screenshot(path=S+'r_exam.png')
    # reload: reprise
    pg.reload(); pg.wait_for_timeout(1200); go(pg,'examen'); print('en cours visible', pg.locator('.warnc').count())
    go(pg,'examen/go',700); print('answers kept', pg.input_value('#exa1') if pg.locator('#exa1').count() else 'n/a')
    pg.click('.extimer .btn'); pg.wait_for_timeout(300); pg.click('.mfoot .btn.r'); pg.wait_for_timeout(800)
    print('result', pg.evaluate('location.hash'), pg.inner_text('.score').replace('\n',''))
    pg.screenshot(path=S+'r_examres.png')
    pg.click('text=Voir la correction détaillée >> nth=0'); pg.wait_for_timeout(400); print('corr modal steps', pg.locator('#modal .bub').count()); pg.keyboard.press('Escape'); pg.evaluate("document.getElementById('modal')&&document.getElementById('modal').remove()")
    # auto-submit: on force la fin
    go(pg,'examen'); pg.click('text=Express'); pg.wait_for_timeout(500)
    pg.evaluate("(()=>{const k='rsuta.exam.'+RSutaAuth.current.id;const s=JSON.parse(localStorage.getItem(k));s.end=Date.now()+1500;localStorage.setItem(k,JSON.stringify(s))})()")
    pg.wait_for_timeout(3500); print('auto submit ->', pg.evaluate('location.hash'), pg.locator('text=Copie ramassée').count())
    go(pg,'faiblesses'); print('faiblesses items', pg.locator('.list .item').count()); pg.screenshot(path=S+'r_faib.png')
    go(pg,'fiches'); print('fiches list', pg.locator('.list .item').count(), 'pager', pg.locator('.pager').count())
    # quiz -> tentatives
    go(pg,'quiz/'+pg.evaluate("RSutaData.quiz.find(q=>q.niveau==='BEPC').id"),600); pg.locator('.opt').first.click(); pg.wait_for_timeout(200)
    print('tentatives', pg.evaluate("RSutaDB.all('tentatives').length"), 'sources', pg.evaluate("[...new Set(RSutaDB.all('tentatives').map(t=>t.source))].join(',')"))
    go(pg,'chapitre/'+cid); print('bouton fiche sur chapitre', pg.locator('text=Fiche de révision').count())
    go(pg,'home'); print('home task', pg.inner_text('#revcard .rc-tx b'))
    print('ERRS', errs)
