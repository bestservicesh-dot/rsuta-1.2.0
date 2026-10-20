from playwright.sync_api import sync_playwright
S='/home/user/rsuta/tests/shots/'
import shutil, os
shutil.copy('/home/user/rsuta/tests/sample_incline.jpg','/home/user/rsuta/app/_t_incline.jpg')
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_context(viewport={'width':412,'height':900}).new_page(); errs=[]
    pg.add_init_script("window._noSW=true")
    pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)))
    pg.goto('http://127.0.0.1:8080/index.html'); pg.wait_for_timeout(1200)
    # comparaison directe avant/après prétraitement
    r=pg.evaluate("""async()=>{const img=await RSutaOCR.loadImage('_t_incline.jpg');const p=RSutaOCR.prepare(img);
      const r=await RSutaOCR.recognize(img);return {angle:p.angle,cropped:p.cropped,th:p.threshold,conf:r.confidence,pass:r.pass,text:r.text, prep:p.canvas.toDataURL('image/png')}}""")
    import base64; open(S+'ocr_prep.png','wb').write(base64.b64decode(r.pop('prep').split(',')[1])); print(r)
    pg.fill('#em','kevin@rsuta.bj'); pg.fill('#pw','kevin123'); pg.click('#btn-login'); pg.wait_for_timeout(600)
    pg.evaluate("location.hash='#/scan'"); pg.wait_for_timeout(700)
    pg.set_input_files('#file','/home/user/rsuta/tests/sample_incline.jpg'); pg.wait_for_timeout(800)
    box=pg.locator('#cropbox').bounding_box(); print('box',box)
    pg.mouse.move(box['x']+box['width']*0.15,box['y']+box['height']*0.45); pg.mouse.down(); pg.mouse.move(box['x']+box['width']*0.85,box['y']+box['height']*0.62,steps=8); pg.mouse.up()
    print('crop', pg.evaluate('window._crop')); pg.screenshot(path=S+'ocr_crop.png')
    pg.click('.mfoot .btn:has-text("Lire la zone")'); pg.wait_for_selector('#vt',timeout=60000)
    print('zone text:', repr(pg.input_value('#vt')))
    print('ERRS',errs)
os.remove('/home/user/rsuta/app/_t_incline.jpg')
