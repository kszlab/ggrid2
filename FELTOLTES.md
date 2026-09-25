# GGrid teszt feltöltése a ggrid2 repóba

Ez a mappa a GGrid mostani GitHub-verziója (v0.15.54), két újdonsággal:

- **Kontroller-elrendezés:** nagy iránykereszt, feliratos gombok, lépésszámláló.
- **Gyors billentésfelismerés** (Motion Tilt v2).

A GitHub Actions munkafolyamatok (`.github`) szándékosan nincsenek benne. Egy tesztrepóban ezek fölöslegesen futnának, és egy részük saját magától commitolna is.

## A) Windows, egy kattintással (Git kell hozzá)

1. Ha még nincs Git a gépeden: <https://git-scm.com/download/win>. A telepítő minden alapbeállítása jó.
2. Csomagold ki a zipet, és a `ggrid2` mappában kattints duplán a **`FELTOLTES-GGRID2.bat`** fájlra.
3. Ha felugrik egy GitHub-bejelentkező ablak, jelentkezz be.
4. Kapcsold be a **GitHub Pages**-t:
   - útvonal: `github.com/kszlab/ggrid2` → **Settings** → **Pages**;
   - **Source:** *Deploy from a branch*;
   - **Branch:** `main`, mappa: `/ (root)`, majd **Save**.
5. Pár perc múlva a játék itt lesz: **<https://kszlab.github.io/ggrid2/>**

## B) GitHub Desktop

1. File → **Add local repository** → válaszd ki a `ggrid2` mappát.
2. Ha felajánlja, kattints a **create a repository** gombra.
3. **Commit to main**, majd **Publish repository** / **Push**, és cél repóként add meg a `kszlab/ggrid2`-t.
4. Ezután kapcsold be a Pages-t az A) 4. lépése szerint.

## Mit érdemes kipróbálni

- **Szabad játék:** az új elrendezést látod.
- **Beállítások → Kezelőfelület → Kontroller-elrendezés:** kikapcsolva visszajön a régi elrendezés.
- **Beállítások → Mozgásvezérlés:**
  - telefonon kapcsold be;
  - a „Gyors billentésfelismerés” alapból be van kapcsolva, kikapcsolva a régi felismerő fut.
