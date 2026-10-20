/* RSuta — application Windows (Electron). Éditeur : BSH - Best Services and House (www.bestservicesandhouse.site).
   L'interface est servie par un petit serveur local (127.0.0.1) : contexte sécurisé
   => caméra, service worker et stockage fonctionnent comme sur le web, 100 % hors-ligne. */
const { app, BrowserWindow, session, shell, Menu } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'app');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.gz': 'application/gzip' };
const PORT = 47615; // port fixe => les données (IndexedDB) restent attachées à la même origine

function startServer() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      const file = path.normalize(path.join(ROOT, p));
      if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); return res.end('Not found'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
        res.end(data);
      });
    });
    srv.listen(PORT, '127.0.0.1', () => resolve(PORT)).on('error', () => srv.listen(0, '127.0.0.1', () => resolve(srv.address().port)));
  });
}

async function createWindow() {
  const port = await startServer();
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(['media', 'notifications', 'clipboard-sanitized-write'].includes(perm)));
  session.defaultSession.setPermissionCheckHandler((wc, perm) => ['media', 'notifications'].includes(perm));
  const win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 360, minHeight: 600, title: 'RSuta — Ton prof IA qui ne dort pas',
    icon: path.join(ROOT, 'icons', 'icon-512.png'), backgroundColor: '#1f4fd1', autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, spellcheck: false }
  });
  // Liens externes (site BSH, mailto:, tel:) : ouverts dans le navigateur / la messagerie / l'application téléphone du système
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith(`http://127.0.0.1:${port}/`)) { e.preventDefault(); shell.openExternal(url); } });
  win.loadURL(`http://127.0.0.1:${port}/index.html`);
}

Menu.setApplicationMenu(null);
const lock = app.requestSingleInstanceLock();
if (!lock) app.quit();
else {
  app.on('second-instance', () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });
  app.whenReady().then(createWindow);
  app.on('window-all-closed', () => app.quit());
}
