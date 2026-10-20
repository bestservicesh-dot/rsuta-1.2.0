import sys, os
from playwright.sync_api import sync_playwright
BASE='http://127.0.0.1:8080/index.html'
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/shots'
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={'width':412,'height':900},device_scale_factor=2)
    pg=ctx.new_page()
    pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)))
    pg.on('console',lambda m: errs.append('CONSOLE '+m.text) if m.type=='error' else None)
    pg.goto(BASE); pg.wait_for_timeout(2000)
    pg.screenshot(path=OUT+'/01_login.png')
    pg.fill('#em','kevin@rsuta.bj'); pg.fill('#pw','kevin123'); pg.click('#btn-login'); pg.wait_for_timeout(800)
    pg.screenshot(path=OUT+'/02_home.png')
    for r in ['cours/BEPC','quiz','scan','devoirs','chat','epreuves','profil','parametres','notifications']:
        pg.evaluate(f"location.hash='#/{r}'"); pg.wait_for_timeout(500)
        pg.screenshot(path=OUT+'/r_'+r.replace('/','_')+'.png')
    # solve via text
    pg.evaluate("location.hash='#/scan'"); pg.wait_for_timeout(400)
    pg.click('#btn-type'); pg.fill('#vt','Exercice : Résoudre 2x + 5 = 13'); pg.click('.mfoot .btn:not(.o)'); pg.wait_for_timeout(1500)
    pg.screenshot(path=OUT+'/03_result.png')
    print('hash', pg.evaluate('location.hash'))
    pg.fill('#ask','oui'); pg.keyboard.press('Enter'); pg.wait_for_timeout(1200)
    pg.screenshot(path=OUT+'/04_followup.png', full_page=False)
    print(pg.evaluate("document.querySelectorAll('.msg').length"))
    b.close()
print('\n'.join(errs) or 'NO ERRORS')
