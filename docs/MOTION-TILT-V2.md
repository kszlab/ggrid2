# GGrid: Motion Tilt v2, gyors billentésfelismerés (v0.15.54)

## Miért kellett új felismerő?

A v1 (`js/motion-gesture.js` + `js/motion-model.js`) működik, de öt dolog miatt nem érződik jónak.

1. **Késés.** A lépés csak a mozdulat *végén* jön. A felismerő megvárja, hogy a telefon visszaálljon és megnyugodjon (kb. 180 ms csend). Kilengés, visszaállás és csend együtt mérve **kb. 550 ms**, és ennyi idő után lép a bábu.
2. **Elvesző lépések.** Gyors egymásutánban billentve a második billentés beleolvad az első mozdulatba, mert még nincs csend. Emellett a `move()` eldobja a parancsot, amíg az előző animáció fut (`busy`).
3. **Ellentétes lépés visszaállításkor.** Ha a játékos lassan dönti el a telefont és gyorsan állítja vissza, a visszaállítás önálló, ellentétes irányú parancsnak számít.
4. **Eszközfüggés.** A döntési fa a `g.count` és `g.firstCount` mintaszámokat is használja. Ezek a szenzor mintavételétől függenek (50, 60, 100 vagy 200 Hz), ezért más telefonon máshogy döntenek. Hat mérésből, egy készüléken tanították.
5. **Euler-szögek.** A kitérést a `deviceorientation` béta/gamma szögeiből számolja. Ezek közel függőleges tartásnál (béta ≈ 90°) instabilak.

## Hogyan működik a v2 (`js/motion-tilt-v2.js`)

A v2 a giroszkópot használja (`rotationRate`), ugyanazzal a rögzített tengelyleképezéssel, mint a v1. A szögsebességet a valódi időlépéssel integrálja. Emellett figyeli a képernyőre merőleges gyorsulást (`acceleration.z`), hogy kiszűrje az emelést és a süllyesztést.

- **Azonnali lépés.** Ha az egyik tengelyen összegyűlt dőlés eléri a küszöböt, és az irány egyértelmű, a lépés rögtön megtörténik, még kifelé billentés közben. A valódi felvételeken a mozdulat kezdetétől mérve a medián **83 ms**, a v1-nél **767 ms**.
- **Tengelyenként külön küszöb.** Az 5-ös érzékenységen a jobbra/balra küszöb 12°, a fel/le küszöb 11°. A felvételek szerint a valódi billentések 15–50°-osak és 150–590 °/s sebességűek. Az emelés és a süllyesztés viszont 11–23°-os bólintással jár, ezért a szög önmagában nem elég a szétválasztáshoz.
- **Emelés és süllyesztés kiszűrése.** Valódi billentésnél a képernyő a forgás irányába tolódik. Emelésnél és süllyesztésnél először a forgással ellentétes irányba kap lökést, vagy fékezéskor erősen visszalök. A felismerő a legnagyobb forgási sebesség előtti és utáni szakaszt külön vizsgálja:
  - a csúcs előtt 1 m/s², utána 3 m/s² a határ;
  - a fékezéskor fellépő kis visszalökést nem tekinti emelésnek.
- **A mozdulat eleje nem vész el.** A dőlést az utolsó nyugalmi helyzettől méri.
- **Visszaállítás-védelem.** Egy lépés után ugyanazon a tengelyen az ellentétes lépés csak nyugalom után jöhet, legfeljebb 800 ms-ig tiltva. Emellett a felismerő követi a telefon semleges helyzetét, amelyet kb. 6 s alatt felejt el:
  - az a mozdulat, amely csak visszahozza a telefont egy korábbi dőlésből, nem léptet;
  - a semleges helyzeten jóval túlbillentés lépés.
- **Gyors sorozat.** Ha a telefon a kilengés kb. 30%-ára visszatért, a következő billentés rögtön indulhat.
- **Pufferelt lépés.** Ha a parancs még az előző lépés animációja alatt érkezik, a vezérlő megtartja a legutolsót, és lejátssza, amint a pálya szabad. Legfeljebb 650 ms-ig él.
- **Mintavétel-független.** Minden érték idő szerint integrált.
- **Döntve tartás nem ismétel.**

### Beállítások

| Beállítás | Hatás a v2-ben |
|---|---|
| Mozdulat érzékenysége 1–10 | jobbra/balra küszöb 17° → 6°, fel/le küszöb 15,5° → 5,5°; az 5-ös fokozaton 12° és 11° |
| Lépés késleltetése 1–10 | nyugalmi idő a visszaállás után: 90 → 260 ms |
| Gyors billentésfelismerés (új) | be: v2 (alapértelmezett) · ki: v1 |
| Csúsztatás is léptet | csak a v1-ben van; ha be van kapcsolva, a v1 fut |

## Ellenőrzés valódi felvételeken

Nyolc „Mozdulatmérés” felvétel, Android Chrome, 60 Hz, összesen:

- 96 billentés,
- 32 emelés/süllyesztés,
- 32 csúsztatás.

Tömörített, nyers adatot nem tartalmazó kivonata a CI-ben is fut: `tools/fixtures/motion-calibration-2026-09-24.json.gz` és `node tools/test-motion-recordings.mjs`.

| Érzékenység 5, késleltetés 5 | v1 | v2 |
|---|---|---|
| helyes billentés | 93/96 | 91/96 |
| kimaradt / rossz irány | 2 / 1 | 4 / 1 |
| emelés/süllyesztés téves lépés | 0/32 | 3/32 |
| csúsztatás téves lépés (csúsztatás kikapcsolva) | 0/32 | 0/32 |
| dupla lépés | 0 | 0 |
| medián késés | **767 ms** | **83 ms** (90%: 115 ms) |

**Fontos a táblázat olvasásához:**

- A v1 osztályozóját ezeknek a felvételeknek a nagy részén tanították, ezért a v1 számai mintán belüliek.
- A v2 alapértékeit is ezekre illesztettem. Ezért leave-one-file-out ellenőrzést is futtattam: 7 fájlon hangolva, a kihagyott 8.-on mérve. Eredménye: 88/96 helyes billentés, 4/32 téves emelés, 0 téves csúsztatás, 1 dupla lépés. A kiválasztott paraméterek 8-ból 6 esetben azonosak voltak, tehát a hangolás stabil.
- Az egyik „jobbra” jelölésű mozdulat a felvételen valójában balra dőlés. A v1 és a v2 is „balra”-t ad rá, vagyis ez címkehiba.

Az érzékenység hatása a v2-ben ugyanezeken a felvételeken:

| Érzékenység | helyes billentés | téves emelés | téves csúsztatás |
|---|---|---|---|
| 3 | 82/96 | 0 | 0 |
| 5 | 91/96 | 3 | 0 |
| 7 | 93/96 | 9 | 0 |
| 10 | 93/96 | 20 | 3 |

**Szintetikus teszt:** `node tools/test-motion-tilt-v2.mjs`, 192 forgatókönyv 4 mintavételi frekvencián. A billentések 10–35°-osak. A tesztben gyors sorozatok, tartás és visszaállítás, lassú kitérés, emelés és kézremegés is szerepel.

**Összehasonlítás saját felvételeken:**

```
node tools/replay-motion-gesture.js --engine v1 GGrid-calibration-*.json
node tools/replay-motion-gesture.js --engine v2 GGrid-calibration-*.json
```

## Ismert korlát és következő lépés

- **Tengelyleképezés.** Mindkét felismerő a v1 rögzített tengelyleképezését használja: képernyő-x = `rotationRate.beta`, képernyő-y = `rotationRate.alpha`. Ez a mérő telefonon helyes. Ha egy böngésző a W3C-szabvány szerinti sorrendben adja a tengelyeket, az irányok felcserélődhetnek. Következő lépésként érdemes lenne egy automatikus tengelyellenőrzés: a giroszkóp-integrált szöget összevetni a `deviceorientation` szögváltozásával az első néhány mozdulatnál.
- **Egy telefon.** Minden felvétel egy Android-telefonról, egy játékostól származik. Másik készüléken, iPhone-on és más játékossal érdemes új felvételeket készíteni, és a `test-motion-recordings.mjs`-hez hasonlóan ellenőrizni.
- **Maradék emelés.** A 32 emelés/süllyesztésből 3 még lépést ad. Ezeknél a mozdulat fizikailag is billentés volt: a süllyesztés közben a telefon felfelé bólintott, ellentétes lökés nélkül. Ez a mozdulat kezdetén nem különíthető el egy valódi billentéstől.
