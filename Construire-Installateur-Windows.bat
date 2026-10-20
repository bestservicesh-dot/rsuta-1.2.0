@echo off
chcp 65001 >nul
title RSuta - Construction de l'installateur Windows 64 bits (BSH - Best Services and House)
cd /d "%~dp0"
echo.
echo  === RSuta : construction de l'installateur NSIS Windows x64 ===
echo.

where node >nul 2>nul || goto :nonode

if exist "node_modules\electron-builder\package.json" goto :wcs
echo [1/3] Installation des dependances (npm install)...
call npm install
if errorlevel 1 goto :fail

:wcs
rem --- Contournement de l'erreur "Cannot create symbolic link" (winCodeSign) ---
rem On extrait winCodeSign nous-memes en ignorant le dossier darwin (macOS),
rem qui contient les liens symboliques refuses par Windows sans droits admin.
set "WCS=%LOCALAPPDATA%\electron-builder\Cache\winCodeSign\winCodeSign-2.6.0"
if exist "%WCS%\rcedit-x64.exe" goto :build
echo [2/3] Preparation de winCodeSign (une seule fois)...
curl -L --fail -o "%TEMP%\winCodeSign-2.6.0.7z" https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z
if errorlevel 1 goto :fail
"node_modules\7zip-bin\win\x64\7za.exe" x -y -bd "-xr!darwin" "%TEMP%\winCodeSign-2.6.0.7z" "-o%WCS%"
if errorlevel 1 goto :fail
del "%TEMP%\winCodeSign-2.6.0.7z" >nul 2>nul

:build
echo [3/3] Construction de l'installateur (electron-builder)...
call npm run dist:nsis
if errorlevel 1 goto :fail
echo.
echo  OK : installateur cree dans le dossier dist  ^>  RSuta-Setup-1.2.0-x64.exe
start "" explorer "%~dp0dist"
pause
exit /b 0

:nonode
echo Node.js est introuvable. Installez Node.js LTS x64 depuis https://nodejs.org puis relancez.
pause
exit /b 1

:fail
echo.
echo  ECHEC de la construction. Copiez le message ci-dessus et envoyez-le a contact@bestservicesandhouse.site
pause
exit /b 1
