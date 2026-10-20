/* RSuta — Lecture des devoirs en photo (OCR Tesseract embarqué, 100 % hors-ligne) */
(function (G) {
  'use strict';
  let workerP = null;
  function base() { return new URL('.', location.href).href; }
  function getWorker(onProgress) {
    if (workerP) return workerP;
    if (!G.Tesseract) return Promise.reject(new Error('OCR indisponible'));
    workerP = G.Tesseract.createWorker('fra', 1, {
      workerPath: base() + 'vendor/tesseract/worker.min.js',
      corePath: base() + 'vendor/tesseract/core/',
      langPath: base() + 'vendor/tesseract/lang',
      gzip: true, workerBlobURL: false, cacheMethod: 'none',
      logger: (m) => { if (onProgress && m.status === 'recognizing text') onProgress(m.progress); }
    }).catch((e) => { workerP = null; throw e; });
    return workerP;
  }

  // ---------------------------------------------------------------- outils image (v1.1)
  function otsu(g, n) { // seuil d'Otsu sur un tableau de niveaux de gris 0..255
    const hist = new Float64Array(256); for (let i = 0; i < n; i++) hist[g[i] | 0]++;
    let sum = 0; for (let t = 0; t < 256; t++) sum += t * hist[t];
    let sB = 0, wB = 0, best = 0, th = 128;
    for (let t = 0; t < 256; t++) { wB += hist[t]; if (!wB) continue; const wF = n - wB; if (!wF) break; sB += t * hist[t]; const mB = sB / wB, mF = (sum - sB) / wF; const v = wB * wF * (mB - mF) * (mB - mF); if (v > best) { best = v; th = t; } }
    return th;
  }
  function boxBlur(g, w, h, r) { // flou moyen rapide via image intégrale (estimation du fond)
    const I = new Float64Array((w + 1) * (h + 1));
    for (let y = 0; y < h; y++) { let row = 0; for (let x = 0; x < w; x++) { row += g[y * w + x]; I[(y + 1) * (w + 1) + x + 1] = I[y * (w + 1) + x + 1] + row; } }
    const o = new Float32Array(w * h);
    for (let y = 0; y < h; y++) { const y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1); for (let x = 0; x < w; x++) { const x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1); o[y * w + x] = (I[y1 * (w + 1) + x1] - I[y0 * (w + 1) + x1] - I[y1 * (w + 1) + x0] + I[y0 * (w + 1) + x0]) / ((y1 - y0) * (x1 - x0)); } }
    return o;
  }
  function inkBox(bin, w, h) { // boîte englobante de l'encre (lignes/colonnes suffisamment denses)
    const rows = new Uint32Array(h), cols = new Uint32Array(w);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (bin[y * w + x]) { rows[y]++; cols[x]++; }
    const rT = Math.max(2, w * 0.004), cT = Math.max(2, h * 0.004);
    let y0 = 0, y1 = h - 1, x0 = 0, x1 = w - 1;
    while (y0 < h && rows[y0] < rT) y0++; while (y1 > y0 && rows[y1] < rT) y1--;
    while (x0 < w && cols[x0] < cT) x0++; while (x1 > x0 && cols[x1] < cT) x1--;
    if (y1 <= y0 || x1 <= x0) return null;
    const mx = Math.round(w * 0.03), my = Math.round(h * 0.03);
    return { x: Math.max(0, x0 - mx), y: Math.max(0, y0 - my), w: Math.min(w, x1 + mx) - Math.max(0, x0 - mx), h: Math.min(h, y1 + my) - Math.max(0, y0 - my) };
  }
  function skewAngle(bin, w, h) { // profil de projection : angle qui rend les lignes de texte les plus « nettes »
    const pts = []; const st = Math.max(1, Math.floor(Math.max(w, h) / 500));
    for (let y = 0; y < h; y += st) for (let x = 0; x < w; x += st) if (bin[y * w + x]) pts.push(x, y);
    if (pts.length < 200) return 0;
    let best = 0, bestA = 0;
    for (let a = -8; a <= 8.001; a += 0.5) {
      const r = a * Math.PI / 180, sn = Math.sin(r), cs = Math.cos(r); const bins = new Float64Array(Math.ceil(h * 1.3 / st) + 40); const off = Math.ceil(h * 0.15 / st) + 20;
      for (let i = 0; i < pts.length; i += 2) { const yy = Math.round((-pts[i] * sn + pts[i + 1] * cs) / st) + off; if (yy >= 0 && yy < bins.length) bins[yy]++; }
      let s2 = 0; for (let k = 0; k < bins.length; k++) s2 += bins[k] * bins[k];
      if (s2 > best) { best = s2; bestA = a; }
    }
    return bestA;
  }

  // Prépare l'image : recadrage (manuel ou auto), redressement, normalisation du fond, binarisation d'Otsu ;
  // renvoie aussi un score de netteté. opts = { crop:{x,y,w,h} en fractions 0..1, auto:true, binarize:true }
  function prepare(img, opts) {
    opts = opts || {};
    const max = 1800; let W0 = img.naturalWidth || img.videoWidth || img.width, H0 = img.naturalHeight || img.videoHeight || img.height;
    let sx = 0, sy = 0, sw = W0, sh = H0;
    if (opts.crop && opts.crop.w > 0.02 && opts.crop.h > 0.02) { sx = opts.crop.x * W0; sy = opts.crop.y * H0; sw = opts.crop.w * W0; sh = opts.crop.h * H0; }
    const k = Math.min(1, max / Math.max(sw, sh)); let w = Math.max(1, Math.round(sw * k)), h = Math.max(1, Math.round(sh * k));
    let c = document.createElement('canvas'); c.width = w; c.height = h;
    let x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    const gray = (cv) => { const d = cv.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, cv.width, cv.height).data; const g = new Float32Array(cv.width * cv.height); for (let i = 0; i < g.length; i++) g[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]; return g; };
    let g = gray(c);
    // netteté : variance du laplacien sur une grille sous-échantillonnée (sur l'image d'origine)
    let mn = 255, mxv = 0; for (let i = 0; i < g.length; i++) { if (g[i] < mn) mn = g[i]; if (g[i] > mxv) mxv = g[i]; }
    let sum = 0, sum2 = 0, n = 0; const step = Math.max(1, Math.floor(Math.min(w, h) / 300));
    for (let yy = step; yy < h - step; yy += step) for (let xx = step; xx < w - step; xx += step) { const i = yy * w + xx; const l = 4 * g[i] - g[i - step] - g[i + step] - g[i - step * w] - g[i + step * w]; sum += l; sum2 += l * l; n++; }
    const sharp = n ? (sum2 / n - (sum / n) ** 2) : 0; const range = Math.max(1, mxv - mn);
    const info = { angle: 0, cropped: false };
    // normalisation du fond (éclairage inégal, ombre du téléphone) : g / fond
    const norm = (gg, ww, hh) => { const bg = boxBlur(gg, ww, hh, Math.max(8, Math.round(Math.min(ww, hh) / 25))); const o = new Float32Array(ww * hh); for (let i = 0; i < o.length; i++) o[i] = Math.max(0, Math.min(255, (gg[i] / Math.max(1, bg[i])) * 235)); return o; };
    let ng = norm(g, w, h); let th = otsu(ng, ng.length); let bin = new Uint8Array(w * h); for (let i = 0; i < bin.length; i++) bin[i] = ng[i] < th ? 1 : 0;
    // redressement
    if (opts.auto !== false) {
      const a = skewAngle(bin, w, h);
      if (Math.abs(a) >= 0.5) {
        const r = -a * Math.PI / 180; const W2 = Math.round(Math.abs(w * Math.cos(r)) + Math.abs(h * Math.sin(r))), H2 = Math.round(Math.abs(w * Math.sin(r)) + Math.abs(h * Math.cos(r)));
        const c2 = document.createElement('canvas'); c2.width = W2; c2.height = H2; const x2 = c2.getContext('2d', { willReadFrequently: true });
        x2.fillStyle = '#fff'; x2.fillRect(0, 0, W2, H2); x2.translate(W2 / 2, H2 / 2); x2.rotate(r); x2.drawImage(c, -w / 2, -h / 2);
        c = c2; x = x2; w = W2; h = H2; g = gray(c); ng = norm(g, w, h); th = otsu(ng, ng.length); bin = new Uint8Array(w * h); for (let i = 0; i < bin.length; i++) bin[i] = ng[i] < th ? 1 : 0; info.angle = a;
      }
      // recadrage automatique sur la zone écrite (seulement si l'utilisateur n'a pas choisi de zone)
      if (!opts.crop) {
        const bb = inkBox(bin, w, h);
        if (bb && bb.w * bb.h < 0.85 * w * h && bb.w > 40 && bb.h > 20) {
          const c3 = document.createElement('canvas'); c3.width = bb.w; c3.height = bb.h; c3.getContext('2d', { willReadFrequently: true }).drawImage(c, bb.x, bb.y, bb.w, bb.h, 0, 0, bb.w, bb.h);
          const ng3 = new Float32Array(bb.w * bb.h); for (let yy = 0; yy < bb.h; yy++) for (let xx = 0; xx < bb.w; xx++) ng3[yy * bb.w + xx] = ng[(yy + bb.y) * w + xx + bb.x];
          c = c3; w = bb.w; h = bb.h; ng = ng3; info.cropped = bb;
        }
      }
    }
    // écriture finale : binarisée (Otsu) ou niveaux de gris normalisés
    const out = c.getContext('2d', { willReadFrequently: true }); const d = out.getImageData(0, 0, w, h); const p = d.data;
    const th2 = otsu(ng, ng.length);
    for (let i = 0; i < w * h; i++) { const v = opts.binarize === false ? ng[i] : (ng[i] < th2 ? 0 : 255); p[i * 4] = p[i * 4 + 1] = p[i * 4 + 2] = v; p[i * 4 + 3] = 255; }
    out.putImageData(d, 0, 0);
    return { canvas: c, sharpness: sharp, contrast: range, threshold: th2, angle: info.angle, cropped: info.cropped };
  }

  async function recognize(imgEl, onProgress, opts) {
    opts = opts || {};
    const prep = prepare(imgEl, opts);
    if (prep.contrast < 40 || prep.sharpness < 12) return { blurry: true, text: '', confidence: 0, sharpness: prep.sharpness };
    const w = await getWorker(onProgress);
    const clean = (t) => (t || '').replace(/[|]/g, 'l').replace(/\n{3,}/g, '\n\n').trim();
    let { data } = await w.recognize(prep.canvas); let best = { text: clean(data.text), confidence: data.confidence, pass: 'otsu' };
    if (best.confidence < 60) { // 2e passe en niveaux de gris (utile pour l'écriture fine ou les photos très contrastées)
      try { const p2 = prepare(imgEl, Object.assign({}, opts, { binarize: false })); const r2 = (await w.recognize(p2.canvas)).data; if (r2.confidence > best.confidence) best = { text: clean(r2.text), confidence: r2.confidence, pass: 'gris' }; } catch (e) { /* */ }
    }
    return { blurry: best.confidence < 35 || best.text.length < 3, text: best.text, confidence: best.confidence, sharpness: prep.sharpness, angle: prep.angle, cropped: !!prep.cropped, pass: best.pass };
  }

  function loadImage(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
  G.RSutaOCR = { recognize, loadImage, prepare, otsu, skewAngle, warmup: () => getWorker().catch(() => null) };
})(typeof window !== 'undefined' ? window : globalThis);
