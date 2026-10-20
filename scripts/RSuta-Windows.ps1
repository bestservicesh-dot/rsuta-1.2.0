# RSuta — lanceur Windows sans installation (PowerShell intégré à Windows)
# Sert le dossier "app" sur http://localhost:47616 et ouvre le navigateur. Fermer cette fenêtre arrête RSuta.
$ErrorActionPreference = 'Stop'
$root = Join-Path (Split-Path -Parent $PSScriptRoot) 'app'
$port = 47616
$mime = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.css'='text/css'; '.webmanifest'='application/manifest+json'; '.png'='image/png'; '.jpg'='image/jpeg'; '.ico'='image/x-icon'; '.woff2'='font/woff2'; '.gz'='application/gzip'; '.json'='application/json' }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$port/")
$l.Start()
Write-Host "RSuta est lancé sur http://localhost:$port  (laisse cette fenêtre ouverte)" -ForegroundColor Cyan
Start-Process "http://localhost:$port/index.html"
while ($l.IsListening) {
  $c = $l.GetContext()
  $p = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath)
  if ($p -eq '/') { $p = '/index.html' }
  $f = [IO.Path]::GetFullPath((Join-Path $root $p.TrimStart('/')))
  if ($f.StartsWith($root) -and (Test-Path $f -PathType Leaf)) {
    $b = [IO.File]::ReadAllBytes($f)
    $ext = [IO.Path]::GetExtension($f).ToLower()
    $c.Response.ContentType = $(if ($mime[$ext]) { $mime[$ext] } else { 'application/octet-stream' })
    $c.Response.ContentLength64 = $b.Length
    $c.Response.OutputStream.Write($b, 0, $b.Length)
  } else { $c.Response.StatusCode = 404 }
  $c.Response.Close()
}
