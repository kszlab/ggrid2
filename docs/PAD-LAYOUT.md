# GGrid: kontroller-elrendezés (Pad Layout v1), v0.15.55

A játékképernyő új, alapértelmezett elrendezése.

## Felépítés

- **Felül:** Menü gomb, **Lépések** (megtett / optimális), **Pálya** (nehézség · méret), **Pont**. Kétgolyós módban a Pont helyén a **Golyók** mező látszik: pályán lévő / induló.
- **Középen:** a tábla. Mindig kifér a képernyőre, magas pályáknál (4×8, 5×8) is.
- **Alul, balra:** Freeze, Segítség, Freeze-súgó.
- **Alul, középen:** nagy iránykereszt. Rövid nyomás = 1 lépés, nyomva tartás = ismétlés.
- **Alul, jobbra:** Újraindítás, Új pálya, Pályaválasztó.

## Működés

- **Minden szabály marad a `main.js`-ben.** A `js/pad-layout.js` csak áthelyezi a meglévő gombokat (`#freeze`, `#playHint`, `#playFreezeHint`, `#playRestart`, `#playNext`, `#playChoose`, `#gameMenu`, `#scoreBox`), és feliratot tesz rájuk. Az azonosítók és az eseménykezelők nem változnak.
  - Az iránykereszt gombjai `data-hold-dir` attribútumot kapnak, ugyanazzal a nyomva tartásos logikával, mint a táblaszéli nyilak.
  - A billentyűzet és a mozgásvezérlés változatlanul működik.
- **Frissítés.** A kijelzők a `render()` után frissülnek; a modul becsomagolja a globális `render` függvényt.
- **Be- és kikapcsolás.** Beállítások → Kezelőfelület → „Kontroller-elrendezés”. A választást a `ggrid.ui.layout.v1` kulcs tárolja (`pad` | `classic`). Kikapcsoláskor minden gomb visszakerül az eredeti helyére.
- **Témák.**
  - Mind a 17 téma működik vele.
  - A színeket a téma `--ui-*` tokenjeiből veszi.
  - Az akciógombok színe rögzített (kék, zöld, türkiz, narancs, lila, borostyán), hogy minden témában ugyanúgy felismerhetők legyenek.
  - Festett (artwork) témáknál a tábla a festett jelenettel együtt, a tervezett arányban méreteződik. A festett nyílsávok helyett az iránykereszt látszik.
- **Üzenetek.** A toast és a mozgásvezérlés üzenetei lebegnek a vezérlők fölött, így nem tolják el az elrendezést.

## Ellenőrizve

Playwright alatt, 390×844, 360×640 és 1024×640 méretben:

- Az iránykereszt lép, nyomva tartva ismétel, és a lépésszámláló minden lépés után frissül.
- Az Újraindítás nullázza a lépésszámlálót.
- A billentyűzet működik.
- Győzelemkor megjelenik a győzelmi ablak.
- A kétgolyós mód működik.
- A Menü megnyílik.
- Mind a 17 témával átmegy.
- Magas pályán (5×8, 5×7) nincs görgetés.
- Oda-vissza kapcsoláskor minden gomb visszakerül.
- Nincs JavaScript-hiba.
