@echo off
chcp 65001 >nul
rem GGrid teszt: a mappa tartalmat feltolti a github.com/kszlab/ggrid2 reporba.
cd /d "%~dp0"
where git >nul 2>nul
if errorlevel 1 (
  echo A Git nincs telepitve. Toltsd le innen: https://git-scm.com/download/win
  echo Telepites utan futtasd ujra ezt a fajlt.
  pause
  exit /b 1
)
if not exist ".git" git init -b main
git config user.name >nul 2>nul || git config user.name "kszlab"
git config user.email >nul 2>nul || git config user.email "kszlab@users.noreply.github.com"
git add -A
git commit -m "GGrid v0.15.55 teszt: kontroller-elrendezes + gyors billentesfelismeres" 2>nul
git branch -M main
git remote remove origin >nul 2>nul
git remote add origin https://github.com/kszlab/ggrid2.git
echo.
echo Feltoltes a github.com/kszlab/ggrid2 reporba...
echo (Ha bongeszo ablak nyilik, jelentkezz be a GitHub-fiokoddal.)
git push -u origin main
if errorlevel 1 (
  echo.
  echo A feltoltes nem sikerult. Ha a repo nem ures, a README-ben leirt modon
  echo torold a tartalmat, vagy futtasd:  git push -u origin main --force
  pause
  exit /b 1
)
echo.
echo KESZ. Most kapcsold be a GitHub Pages-t:
echo   github.com/kszlab/ggrid2 - Settings - Pages - Source: Deploy from a branch
echo   Branch: main, mappa: / (root) - Save
echo Par perc mulva itt lesz: https://kszlab.github.io/ggrid2/
pause
