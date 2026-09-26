# Témák: rajzolási módok és tartalékok (v0.15.73)

Ez a leírás rögzíti, hogyan dönti el a játék, milyen módon rajzoljon ki egy témát és benne a többcellás merev testeket. Két visszalépés is ebből a döntésből eredt: a Csillagkönyvtár (v0.15.66) és a Napüvegház (v0.15.73) saját alakgrafikái kimaradtak.

## Független beállítási tengelyek

| Beállítás | Szerep |
|---|---|
| `renderMode: legacy` (alapérték) | CSS/HTML alapú témázás, opcionális képekkel. |
| `renderMode: artwork` | Külön képi elemekből és elrendezési adatokból épített megjelenítés (jelenleg: Csillagkönyvtár). |
| `scene.tier: showcase` | Kibővített pályakörnyezet és dekoráció. |
| `ui.skin: full` | A kezelőfelület teljesebb témázása. |
| `renderer.rigid` | A többcellás merev testek rajzolási módja: `material` (alapérték), `shape` vagy `tiles`. |

A showcase és a full UI nem külön renderelőmotor: ugyanazt a rajzolót paraméterezik.

## Többcellás merev testek: a döntés sorrendje

A döntést egyetlen tiszta függvény hozza meg: `RigidShapes.renderPlan(theme, cells, {tiles, artwork})` a `js/rigid-shapes.js` fájlban. A szabályok ebben a sorrendben érvényesülnek, az első illeszkedő nyer:

1. **`tiles`**: `renderer.rigid: "tiles"`, és van `artwork.pieces.rigidTiles` (ring és block). Cellánként összeillesztett anyagminta.
2. **`silhouette`**: `renderer.rigid: "material"` (alapérték), és van `rigidTiles`. Egybefüggő anyagsziluett.
3. **`shape`**: `renderer.rigid: "shape"`, és a témának van saját grafikája erre az alakra (`artwork.pieces.rigidShapes`, illetve `pieces.rigidBodyVariants`).
4. **`composite`**: az alak téglalap, és van általános `rigidBody` elem.
5. **`cells`**: minden más esetben minden cella önállóan, az egycellás tégla megjelenésével.

**Láthatósági szabály.** A `shape` és a `composite` elrejti a test celláit, ezért csak akkor választható, ha a helyettük rajzolt elem ténylegesen kirajzolható. Festett (artwork) témában ehhez kép kell, mert ott a CSS-alapú elemek üresek. Ha nincs mit rajzolni, a döntés `cells`, így egy test soha nem lehet láthatatlan.

## Szabály témakészítéshez

**Ha egy téma saját alakgrafikát ad** (`artwork.pieces.rigidShapes` vagy `pieces.rigidBodyVariants`), **akkor kötelezően beállítja a `renderer.rigid: "shape"` értéket.** Enélkül az alapértelmezett `material` mód a saját grafikát figyelmen kívül hagyja.

A többi téma alapértelmezése szándékosan nem változik automatikusan.

## Ellenőrzés

A `tools/test-rigid-visibility.mjs` két dolgot ellenőriz:

- minden téma és minden pályákban előforduló alak kombinációjára, hogy a test látható;
- minden olyan témánál, amely saját alakgrafikát definiál, hogy azokhoz az alakokhoz ténylegesen `shape` módot választ.

Önmagában a láthatóság nem elég: mindkét korábbi visszalépés átment rajta.

## Témabetöltés

A `ScenarioMode.loadFreeTheme()` aszinkron, és a hívások átfedhetik egymást. A „legutolsó kérés nyer” szabály szerint csak a legújabb kérés alkalmazhat stíluslapot, jelenetet, hangprofilt és mentett választást, illetve csak az törölheti ezeket hiba esetén. Az elavult kérés eltakarít maga után, és `{status: 'stale'}` eredményt ad. A többi lehetséges eredmény `applied` és `error`.

A hiányzó kép vagy stíluslap nem állítja meg a betöltést, de konzolfigyelmeztetést ad: `[GGrid Theme] … failed to load`.
