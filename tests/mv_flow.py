from playwright.sync_api import sync_playwright
S='/home/user/rsuta/tests/shots/'
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':412,'height':900}); pg=ctx.new_page(); errs=[]
    pg.add_init_script("window._noSW=true")
    pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e))); pg.on('console',lambda m: errs.append('CONSOLE '+m.text) if m.type=='error' else None)
    pg.goto('http://127.0.0.1:8080/index.html'); pg.wait_for_timeout(1500)
    pg.fill('#em','kevin@rsuta.bj'); pg.fill('#pw','kevin123'); pg.click('#btn-login'); pg.wait_for_timeout(600)
    pg.evaluate("location.hash='#/scan'"); pg.wait_for_timeout(700)
    pg.click('#btn-type'); pg.wait_for_timeout(400)
    pg.fill('#vt','Résoudre ')
    pg.evaluate("document.getElementById('vt').setSelectionRange(9,9)")
    for lbl in ['x','²','=']: pg.click(f'#mk-vt .mk:text-is("{lbl}")')
    pg.type('#vt','5x - 6')
    print('vt =', pg.input_value('#vt'))
    pg.screenshot(path=S+'mv_keypad.png')
    pg.click('.mfoot .btn:not(.o)'); pg.wait_for_timeout(1500)
    print('hash', pg.evaluate('location.hash'), 'figs', pg.evaluate("document.querySelectorAll('.mplot svg').length"), 'fracs', pg.evaluate("document.querySelectorAll('.frac').length"))
    pg.click('.mkbtn'); pg.wait_for_timeout(200)
    print('keypad open', pg.evaluate("!document.getElementById('mk-ask').classList.contains('hidden')"))
    pg.screenshot(path=S+'mv_result.png', full_page=False)
    pg.evaluate("document.querySelector('.mplot').scrollIntoView()"); pg.wait_for_timeout(200); pg.screenshot(path=S+'mv_result2.png')
    print('ERRS', errs)
