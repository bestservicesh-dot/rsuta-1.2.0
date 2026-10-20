/* RSuta — Service Worker : l'application fonctionne entièrement hors-ligne après la première ouverture. */
const VERSION = 'rsuta-v1.2.0';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/style.css',
  'fonts/inter-latin-wght-normal.woff2', 'fonts/inter-latin-ext-wght-normal.woff2',
  'img/avatar-demo.jpg', 'icons/icon-192.png', 'icons/icon-512.png',
  'js/icons.js', 'js/math.js', 'js/curriculum.js', 'js/exos.js', 'js/engine.js', 'js/engine2.js', 'js/engine3.js', 'js/epreuves.js', 'js/prof.js', 'js/ocr.js', 'js/db.js', 'js/app.js', 'js/mathview.js', 'js/fiches.js', 'js/app2.js', 'js/app3.js', 'vendor/qr/qrcode.js', 'vendor/qr/jsQR.js',
  'vendor/tesseract/tesseract.min.js', 'vendor/tesseract/worker.min.js'
];
// Fichiers lourds de l'OCR : mis en cache en arrière-plan (ou à la première utilisation)
const HEAVY = ['vendor/tesseract/core/tesseract-core-simd-lstm.wasm.js', 'vendor/tesseract/core/tesseract-core-lstm.wasm.js', 'vendor/tesseract/lang/fra.traineddata.gz'];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(SHELL);
    HEAVY.forEach((u) => c.add(u).catch(() => {}));
    self.skipWaiting();
  })());
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // API en ligne : jamais mise en cache
  e.respondWith((async () => {
    const c = await caches.open(VERSION);
    const hit = await c.match(e.request, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const r = await fetch(e.request);
      if (r.ok) c.put(e.request, r.clone());
      return r;
    } catch (err) {
      if (e.request.mode === 'navigate') return c.match('index.html');
      throw err;
    }
  })());
});
