# Expansion V3 (2000) – beépített bővítőcsomag

**Beépítve:** v0.15.72 (2026-09-26).

**Eredet:** külső, a repó saját Fast Generator V3 eszközeivel készített csomag (`ggrid-v3-expansion-to-2000-20260926`, a64654f repóállapotra), 383 pálya: 250 egygolyós és 133 kétgolyós.

## Hol van
- `content/levels/packs/expansion-v3-2000-b1.json`: az egygolyós pályák, az alapkönyvtár katalógusában (`library: core`).
- `content/levels/multiball/packs/expansion-v3-2000-b2.json`: a kétgolyós pályák, a kétgolyós katalógusban (`library: multiball`).

A pályák azonosítója (`FG3-EXP2000-…`), geometriája, megoldása, D-osztálya és fingerprintje változatlan. Csak a `content.packId` és a `content.library` mező igazodik a célkönyvtárhoz.

## Beépítés előtti független ellenőrzés
Ezt nem a csomag saját szkriptje végezte, hanem a repó eszközei, a v0.15.71 állapoton. Mind a 383 pálya megfelelt:

- érvényes pályaszerkezet;
- a tárolt megoldás a játék fizikájával lejátszva győz;
- a solver szerint a tárolt megoldás optimális;
- a hivatalos osztályozó ugyanazt a D-osztályt adja (egygolyósnál `classify-level.mjs`, kétgolyósnál `classify-multiball-v2.mjs`);
- nincs ütköző azonosító;
- sem a meglévő 1617 pályával, sem egymással nincs kanonikus másolat (forgatással és tükrözéssel együtt vizsgálva);
- Freeze nélkül megoldható.

A beépítés után lefutott és sikeres:
- `verify-level-metadata-v3` (2000 pálya);
- `verify-level-library-v2 --deep` (762 + 250);
- `verify-multiball-v2` (a futásidejű kétgolyós könyvtár 373 pályával);
- a fingerprint-, a generátor- és a rigid-láthatósági teszt.

## Megjegyzés a meglévő könyvtárról
A korábbi 1617 azonosító 1138 különböző kanonikus elrendezést jelent: 144 csoportban ugyanaz a pálya forgatva vagy tükrözve szerepel, főként az `LV3-…` alapkönyvtárban. A bővítéssel együtt 2000 azonosító és 1521 kanonikus elrendezés van. A meglévő ismétlődéseket ez a lépés nem módosította.
