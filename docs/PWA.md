# GGrid: telepíthető, offline is működő webalkalmazás (PWA), v0.15.77

A GGrid a GitHub Pages-ről telepíthető telefonra és számítógépre:
- saját ikonja van;
- teljes képernyőn fut;
- első megnyitás után internet nélkül is játszható.

Új verziót magától letölt.

## Részei

| Fájl | Szerepe |
|---|---|
| `manifest.webmanifest` | név, ikonok, álló tájolás, színek. Az útvonalak relatívak, így a `/ggrid2/` almappában is működik |
| `icons/*.png` | 192 és 512 px-es ikon, plusz egy 512 px-es „maskable” (Android körre vagy lekerekített négyzetre vágja). Forrás: `favicon.svg` és `design/icons/icon-maskable.svg`; újragenerálás: `node tools/build-icons.mjs` (Chrome kell hozzá) |
| `sw.js` | service worker: az összes játékfájlt a készüléken tárolja, és onnan szolgálja ki |
| `js/pwa.js` | regisztráció, frissítés, telepítés gomb, tartós tárhely |
| `js/progress-transfer.js` | Beállítások → Alkalmazás → haladás mentése és betöltése |
| `tools/pwa-assets.mjs` | a játékfájlok listája és ujjlenyomata (közös a build és a teszt számára) |
| `tools/build-pwa.mjs` | a `sw.js`-be írja a verziót és a fájllistát |
| `tools/test-pwa.mjs` | ellenőrzi, hogy a `sw.js` naprakész-e |

## Mi kerül a készülékre

A `tools/pwa-assets.mjs` ezeket gyűjti össze:
- minden, amit az `index.html` betölt (stílusok, szkriptek, ikonok);
- a nyelvi fájlok;
- a három pályakatalógus és minden csomagjuk;
- a témák teljes mappái (a `.md` fájlok kivételével);
- a forgatókönyvek.

Ez jelenleg 185 fájl, kb. 10 MB. A fejlesztői oldalak (szerkesztő, Theme Lab, Theme Studio, `tools/`, `docs/`, `design/`) nem kerülnek a készülékre.

**Új téma vagy pályacsomag:** ha a katalógusba, illetve a témalistába bekerült, a lista magától tartalmazza.

## Frissítés

1. Minden fájlhoz tartalom-ujjlenyomat tartozik. Frissítéskor a készülék **csak a megváltozott fájlokat** tölti le. A letöltés ujjlenyomata ellenőrzött: ha a Pages még a régi fájlt adja (a kiadás közben), a frissítés nem települ félig, és a következő ellenőrzésnél újra próbálkozik.
2. Az app indításkor és előtérbe kerüléskor ellenőrzi, van-e új `sw.js` (legfeljebb percenként egyszer).
3. Ha az új verzió letöltődött:
   - **indítás után az első 15 másodpercben, a kezdőképernyőn** azonnal átvált (újratölt);
   - **játék közben** egy sáv jelenik meg: „Új verzió érhető el – Frissítés”. Pálya közben semmi nem cserélődik. A sáv bezárható, és a következő indításkor úgyis az új verzió fut.
4. A régi fájlváltozatok az átváltáskor törlődnek.

A mentett adatokat (pontok, beállítások) a frissítés nem érinti.

## Kiadás (verzióemelés)

1. Verziószám csere az `index.html`-ben (minden `?v=` és az `I18n.boot('…')`).
2. `node tools/build-pwa.mjs` (verzió és fájllista a `sw.js`-be).
3. `node tools/test-pwa.mjs` és a többi teszt. **A PWA-teszt hibát jelez, ha a 2. lépés kimaradt** vagy egy fájl a build után változott.
4. CHANGELOG, commit, push.

A GitHub Pages kb. 10 percig gyorsítótárazza a fájlokat, ezért egy friss kiadást néhány készülék ennyivel később lát.

## Fejlesztés és helyi tesztelés

- **Localhoston a service worker nem indul el.** Egy korábban regisztrált workert a játék eltávolít, a tárát törli. Így a fejlesztés és a `tools/runtime-regression.html` mindig a friss fájlokat kapja.
- **Kipróbálás helyben:** `http://localhost:…/?pwa-test`. Ilyenkor telepít és frissít, mint élesben. A következő `?pwa-test` nélküli betöltés újra kikapcsolja.
  - A helyi szervernek LF sorvéggel kell adnia a szöveges fájlokat, ahogy a GitHub Pages is. Egy Windows-os munkapéldányból (CRLF) közvetlenül kiszolgálva az ujjlenyomat-ellenőrzés a CRLF-es fájlokat szándékosan elutasítja.
- **`?nosw`:** élesben is kikapcsolja a regisztrációt, hibakereséshez.
- **Natív app (Capacitor):** a `window.Capacitor` jelenlétében a service worker nem indul el, mert az app a fájlokat maga tartalmazza.

## Telepítés és mentések

- **Beállítások → Alkalmazás → Telepítés alkalmazásként:**
  - Android és asztali Chrome/Edge: „Telepítés” gomb;
  - iPhone/iPad: útmutató (Safari: Megosztás → Főképernyőhöz adás);
  - más böngésző: menü-útmutató;
  - telepített appban: „Telepítve” állapot.
- **Haladás mentése / betöltése:** az összes `ggrid.*` beállítás egy JSON-fájlba kerül (`ggrid-progress-ÉÉÉÉ-HH-NN.json`, formátum: `ggrid-progress` v1).
  - Telefonon a megosztási menüvel menthető (Fájlok, Drive…).
  - Betöltés előtt a játék megerősítést kér (a mentés dátumával és pontszámával), majd felülír és újratölt.
- **iPhone:** a kezdőképernyőre tett app **külön tárhelyet** kap, mint a Safari. A Safariban szerzett haladás mentéssel és betöltéssel vihető át.
- **Tartós tárhely:** telepített appban a játék kéri (`navigator.storage.persist()`), hogy a böngésző tárhelyhiánykor se törölje az adatokat.

## Hibaelhárítás

- **„Régi verzió ragadt be”:** a játék indításkor frissít. Ha mégsem, Chrome-ban az oldal beállításai → Webhelyadatok törlése. **Ez a haladást is törli, előtte érdemes menteni.**
- **Telepítés nem ajánlott fel (Android):** a Chrome csak HTTPS-en, működő service workerrel ajánlja fel, és csak ha az app még nincs telepítve.
