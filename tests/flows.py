from playwright.sync_api import sync_playwright
import os
T=os.path.expanduser('~/rsuta/tests/'); S=T+'shots/'
B='http://127.0.0.1:8080/index.html'
def run():
  with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream'])
    ctx=b.new_context(viewport={'width':412,'height':900},permissions=['camera'])
    pg=ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e))); pg.on('console',lambda m: errs.append('CONSOLE '+m.text) if m.type=='error' else None)
    pg.goto(B); pg.wait_for_timeout(1800)
    # register
    pg.click('text=Créer un compte'); pg.wait_for_timeout(300)
    pg.fill('#nm','Awa Dossou'); pg.fill('#em','awa@test.bj'); pg.select_option('#nv','LICENCE'); pg.fill('#pw','secret1'); pg.fill('#pw2','secret1'); pg.fill('#rp','pate rouge')
    pg.click('button[type=submit]'); pg.wait_for_timeout(500)
    code=pg.inner_text('.code-box'); print('code',code)
    pg.click('.mfoot .btn'); pg.wait_for_timeout(600); print('after register', pg.evaluate('location.hash'), pg.inner_text('.hello'))
    # logout
    pg.evaluate("location.hash='#/profil'"); pg.wait_for_timeout(300); pg.click('#btn-logout'); pg.click('.mfoot .btn.r'); pg.wait_for_timeout(400)
    # forgot via code
    pg.click('text=Mot de passe oublié ?'); pg.wait_for_timeout(400); pg.fill('#em','awa@test.bj'); pg.fill('#cd',code); pg.fill('#pw','nouveau1'); pg.click('button[type=submit]'); pg.wait_for_timeout(400); print('reset:', pg.evaluate('location.hash'), pg.locator('.toast').all_inner_texts())
    pg.fill('#em','awa@test.bj'); pg.fill('#pw','nouveau1'); pg.click('#btn-login'); pg.wait_for_timeout(500); print('login after reset', pg.evaluate('location.hash'))
    # forgot via secret answer for wrong -> error
    pg.evaluate("location.hash='#/profil'"); pg.wait_for_timeout(300); pg.click('#btn-logout'); pg.click('.mfoot .btn.r'); pg.wait_for_timeout(300)
    pg.fill('#em','kevin@rsuta.bj'); pg.fill('#pw','mauvais'); pg.click('#btn-login'); pg.wait_for_timeout(300); print('bad login toast', pg.inner_text('.toast'))
    pg.fill('#pw','kevin123'); pg.click('#btn-login'); pg.wait_for_timeout(600)
    # scan with fake camera -> capture
    pg.evaluate("location.hash='#/scan'"); pg.wait_for_timeout(1500)
    print('video visible', pg.evaluate("!document.getElementById('vid').classList.contains('hidden')"))
    # scan via file
    pg.set_input_files('#file', T+'sample_devoir.jpg'); pg.wait_for_timeout(600); pg.click('.mfoot .btn:has-text("Lire tout")'); pg.wait_for_selector('#vt', timeout=60000)
    print('verify text:', pg.input_value('#vt'))
    pg.click('.mfoot .btn:not(.o)'); pg.wait_for_timeout(1500)
    print('result parts', pg.evaluate("document.querySelectorAll('.part-label').length"), pg.inner_text('.badges'))
    # blurry
    pg.evaluate("location.hash='#/scan'"); pg.wait_for_timeout(500)
    pg.set_input_files('#file', T+'sample_flou.jpg'); pg.wait_for_timeout(600); pg.click('.mfoot .btn:has-text("Lire tout")'); pg.wait_for_timeout(2500)
    print('blur modal:', pg.inner_text('.modal h3'), '|', pg.inner_text('.modal .mbody')[:90])
    pg.click('.mfoot .btn.o'); pg.wait_for_timeout(300)
    pg.keyboard.press('Escape')
    # chat flow: question, oui, answer, réexplique
    pg.evaluate("location.hash='#/chat'"); pg.wait_for_timeout(500)
    for m in ['Calculer 15 % de 24000','oui','solution','Réexplique autrement','Conjugue finir au futur','Définir la photosynthèse','Développer (x+3)^2']:
        pg.fill('#ask',m); pg.keyboard.press('Enter'); pg.wait_for_timeout(900)
        last=pg.evaluate("[...document.querySelectorAll('.msg:not(.me)')].pop().innerText.slice(0,120).replace(/\\n/g,' | ')")
        print('CHAT',m,'=>',last)
    # quiz
    pg.evaluate("location.hash='#/quiz'"); pg.wait_for_timeout(400); pg.click('.list .item'); pg.wait_for_timeout(300)
    for i in range(4):
        if pg.locator('.opt').count(): pg.locator('.opt').first.click()
        else: pg.fill('#qa','x'); pg.click('#qbody .btn')
        pg.wait_for_timeout(200); pg.click('#qfb .btn'); pg.wait_for_timeout(200)
    print('quiz score', pg.inner_text('.score'))
    pg.evaluate("location.hash='#/quiz/express'"); pg.wait_for_timeout(300); print('express q:', pg.inner_text('.qtext'))
    # epreuve submit
    pg.evaluate("location.hash='#/epreuve-new'"); pg.wait_for_timeout(300)
    pg.fill('#em2','Mathématiques'); pg.fill('#et','BEPC blanc test'); pg.fill('#ex','Exercice 1 : Résoudre 4x - 2 = 10\nExercice 2 : Calculer le PGCD de 48 et 36\nExercice 3 : Définir la photosynthèse')
    pg.click('text=Enregistrer et traiter'); pg.wait_for_timeout(1500); print('epreuve result', pg.inner_text('.badges'))
    # lesson done + pagination
    pg.evaluate("location.hash='#/devoirs'"); pg.wait_for_timeout(300); print('devoirs items', pg.locator('.list .item').count())
    pg.evaluate("location.hash='#/cours/LICENCE'"); pg.wait_for_timeout(300); pg.click('.list .item'); pg.wait_for_timeout(300); pg.click('.list .item'); pg.wait_for_timeout(300); pg.click('.list .item'); pg.wait_for_timeout(300)
    pg.click('text=Marquer comme terminée'); pg.wait_for_timeout(300); print('toast', pg.inner_text('.toast'))
    # offline
    ctx.set_offline(True); pg.evaluate("location.hash='#/chat'"); pg.wait_for_timeout(400)
    pg.fill('#ask','Résoudre x^2 - 5x + 6 = 0'); pg.keyboard.press('Enter'); pg.wait_for_timeout(900)
    print('offline chat', pg.evaluate("[...document.querySelectorAll('.msg:not(.me)')].pop().innerText.slice(0,160).replace(/\\n/g,' | ')"))
    pg.reload(); pg.wait_for_timeout(2000); print('offline reload hash', pg.evaluate('location.hash'), pg.locator('.hello, .phead h1, .mhead').count())
    ctx.set_offline(False)
    # admin
    pg.evaluate("location.hash='#/profil'"); pg.wait_for_timeout(300); pg.click('#btn-logout'); pg.click('.mfoot .btn.r'); pg.wait_for_timeout(300)
    pg.fill('#em','admin@rsuta.bj'); pg.fill('#pw','RSuta@2026'); pg.click('#btn-login'); pg.wait_for_timeout(500)
    pg.evaluate("location.hash='#/admin'"); pg.wait_for_timeout(400); print('admin rows', pg.locator('.tbl tbody tr').count())
    pg.set_viewport_size({'width':1366,'height':800}); pg.wait_for_timeout(300); pg.screenshot(path=S+'desk_admin.png')
    print('\n'.join(errs) or 'NO ERRORS'); b.close()
run()
