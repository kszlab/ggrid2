# GGrid changelog

A fájl a GGrid felhasználói és fejlesztői szempontból lényeges verzióváltozásait foglalja össze.

A korábbi repository-történetben egy-egy verzió gyakran több, fájlonként külön technikai commitból állt. Ez a changelog ezeket **logikai kiadásokba csoportosítja**, ezért nem commitlista, hanem verziótörténet.

## Verziózási szabály innentől

- Minden felhasználó által érzékelhető vagy működést érintő kiadás új alkalmazásverziót kap.
- A verziószám módosításával együtt ezt a fájlt is frissíteni kell.
- Egy fejlesztési feladat lehetőleg egy logikai commit legyen; ha a használt eszköz technikai okból több commitot hoz létre, azok ugyanahhoz a changelog-bejegyzéshez tartoznak.
- A commitüzenet röviden írja le a **célt vagy eredményt**, ne csak a módosított fájl nevét.
- CI/tesztjavítás csak akkor kap külön changelog-bejegyzést, ha a termék működését, kompatibilitását vagy a release megbízhatóságát érdemben érinti.
- A már meglévő történetet nem írjuk át és nem squasholjuk visszamenőleg.

---

## v0.15.78 — 2026-09-26

### Pályaválasztó telefonon
- **Minden kifér:**
  - a téma-előnézet a többi elem után maradó helyet tölti ki (228–500 px);
  - eddig a képernyő 57%-a volt, ami a 701–830 px magas telefonokon kb. 56 px-szel túllógott: a fejléc és az indítógomb levágódott;
  - 640 px magasságtól semmit nem kell görgetni, ennél kisebb képernyőn a „Játék indítása” gomb alul rögzítve marad.
- **Minta-pálya:** a magassághoz is igazodik, és nem lóg rá a téma nevére. A kijárat-jel lekerült róla, mert a lapozónyíl mellett kettőzött nyílnak látszott.
- **Alkalmazkodó nehézség:** egy sorban jelenik meg, rövidebb állapotszöveggel („2+ nehézségnél aktív”) és ↺ nullázó gombbal.
- **Verziószám:** lekerült a lapról.

## v0.15.77 — 2026-09-26

### Telepíthető, offline is működő app (PWA)
- **Telepítés:** a játék telefonra és számítógépre telepíthető (saját ikon, teljes képernyő, álló tájolás). Beállítások → Alkalmazás:
  - Android és asztali Chrome/Edge: „Telepítés” gomb;
  - iPhone: Safari-útmutató.
- **Offline játék:** az első megnyitás után minden játékfájl a készüléken van (185 fájl, kb. 10 MB), a játék internet nélkül is indul.
- **Frissítés:**
  - új verziónál csak a megváltozott fájlok töltődnek le, ellenőrzötten;
  - indításkor a kezdőképernyőn azonnal átvált;
  - játék közben egy „Új verzió érhető el – Frissítés” sáv jelenik meg, és pálya közben semmi nem cserélődik.
- **Haladás mentése és betöltése:** pontok, megoldott pályák, nehézség és beállítások egy fájlba, és vissza. iPhone-on ezzel vihető át a Safariban szerzett haladás a telepített appba (külön tárhely).
- **Mobil:** a kezdőképernyő, a panelek és minden elrendezés kikerüli a kijelzőkivágást és az alsó sávot; telepített appban nincs lehúzásos frissítés. Telepített appban tartós tárhelyet kér.
- **Fejlesztés:**
  - `tools/build-pwa.mjs`: minden kiadásnál futtatandó;
  - `tools/test-pwa.mjs`: hibát jelez, ha kimaradt;
  - `tools/build-icons.mjs`: ikonok;
  - localhoston a service worker kikapcsol (`?pwa-test`-tel próbálható).

  Leírás: `docs/PWA.md`.

## v0.15.76 — 2026-09-26

### Javítás
- **Freeze-villanás:** fagyasztásnál a pálya rövid kivilágosodása megmarad, de a merev testek (pl. a Holdkert szigetei, a saját rajzos könyvek) már nem kapnak külön, a pályánál kb. kétszer erősebb kivilágosítást és téglalap alakú fényudvart. A kiválasztott elemet a Freeze-jelölés emeli ki.

## v0.15.75 — 2026-09-26

### Javítások
- **BOMB angolul:** a robbanás utáni értesítés („💣 Blown up · −15 points”) a nyelvi fájlból jön; eddig angol nyelven is magyarul jelent meg. A rejtett jelenetcím és a forgatókönyv-tartalék név is kulcsból jön.
- **Nyelvi ellenőrző:** hibát jelez, ha egy kulccsal rendelkező szöveg a játék kódjába van írva (így maradt magyar a BOMB-értesítés).
- **Freeze-jelölés:** a több cellás test kiemelése cellánként készül, és csak a test külső élein van körvonal. Bármely alakot (T, S, U, …) pontosan követ; eddig a test befoglaló téglalapját fedte, és eltakarhatta a benne álló golyót vagy üres cellát. Új böngészős regressziós teszt (27 teszt).

## v0.15.74 — 2026-09-26

### Többnyelvű játék: magyar és angol
- Beállítások → Nyelv: Automatikus (a rendszer nyelve) / Magyar / English. Automatikus módban a rendszer nyelve dönt; nem támogatott rendszernyelvnél angol. Nyelvváltáskor az oldal újratölt.
- Minden játékos által látott szöveg nyelvi fájlból jön: főmenü, pályaválasztó és témaválasztó (a témák neve és leírása is), felső sáv, gombok és akadálymentes feliratok, győzelmi ablak, pályaüzenetek, súgó-javaslat (iránycímke: UP/DOWN/LEFT/RIGHT), automatikus megoldás sávja, beállítások, menü és a teljes súgó. A számok a nyelv szerint formázódnak (pl. 1 234 / 1,234; D4,5 / D4.5), az angol többes szám helyes (1 level / 3 levels).
- Nyelvenként egy fájl: `locales/hu.json` (forrás, minden kulcsnál fordítói megjegyzés és hosszkorlát), `locales/en.json`, a nyelvek listája: `locales/index.json`. Útmutató fordítónak (embernek vagy AI-nak): `locales/TRANSLATING.md`.
- Új `js/i18n.js`: a nyelvi fájlok a játék moduljai előtt töltődnek be (az `index.html` a modulokat a nyelvkezelőn keresztül, változatlan sorrendben indítja), a statikus oldal `data-i18n` jelölésekkel fordul, a súgó csak engedélyezett formázással (`<h3> <p> <strong> <em> <br>`). Hiányzó fordításnál a magyar szöveg jelenik meg, konzolfigyelmeztetéssel.
- Új `tools/check-locales.mjs`: kulcskészlet, helyőrzők, HTML, hosszkorlátok és a kódban használt kulcsok ellenőrzése.
- Szándékosan magyarul maradnak a fejlesztői és kutatási eszközök: forgatókönyv-szerkesztő, Theme Lab, Theme Studio, mozdulatmérés.
- A regressziós tesztoldal magyar nyelvre rögzítve fut, és új angol teszt ellenőrzi, hogy a játékos által látott felületen nem marad magyar szöveg (összesen 26 eset).

## v0.15.73 — 2026-09-26

### Javítás: egymást átfedő témabetöltések (reprodukált hiba)
- Ha egy korábban kért téma lassabban töltődött be, mint egy későbbi, a korábbi felülírhatta a későbbit (téma, stíluslap, hangprofil, mentett választás), témaváltásnál pedig a látható téma eltérhetett a megjelenő pálya témájától. A `loadFreeTheme()` mostantól „a legutolsó kérés nyer” szabály szerint működik: minden kérés azonosítót kap, az elavult kérés nem alkalmaz és nem töröl semmit (hibaágon sem), a stíluslapcserénél sem távolíthatja el az újabb stíluslapot, és `applied` / `stale` / `error` eredményt ad. A témaváltás ezt az eredményt használja; a forgatókönyv-téma betöltése is érvényteleníti a folyamatban lévő szabad játékos betöltést.
- 4 új regressziós teszt eltérő késleltetéssel (lassú A → gyors B, gyors A → lassú B, későn hibázó A, témaváltás két gyors új pályával); a javítás előtti kódon elbuknak.

### Javítás: a Napüvegház saját alakgrafikái (reprodukált hiba)
- A 8 saját növénytartó-grafika (2H, 2V, 3H, 3V, 4 L-alak) a v0.15.53 óta kimaradt: az egyenes testek általános grafikát, az L-alakok cellánkénti tartalékot kaptak. A téma megkapta a `renderer.rigid: "shape"` beállítást. Böngészőben ellenőrizve: az alakok a foglalt cellákra illeszkednek, az L-alak negyedik cellája szabad marad, nagy és szabálytalan testeknél a tartalék megjelenés megmarad, újrakezdés és festett témára, majd vissza váltás után sincs eltűnő vagy kettőzött test.
- A `test-rigid-visibility` szigorúbb: ha egy téma saját alakgrafikát definiál, azt ténylegesen ki is kell választani (a javítás nélküli témán elbukik).

### Megelőzés
- Új `docs/THEME-RENDER-MODES.md`: a rajzolási módok és tartalékok döntési sorrendje, a láthatósági szabály és a témakészítési szabály (saját alakgrafika → `renderer.rigid: "shape"`).
- Hiányzó témakép vagy stíluslap konzolfigyelmeztetést ad (`[GGrid Theme] … failed to load`); a betöltés ettől nem áll meg.

## v0.15.72 — 2026-09-26

### Súgó: egy állásért csak egyszer kell fizetni
- Ha lépés nélkül kéred újra a súgót (pl. mert a javaslat 8 mp után eltűnt), ugyanazt a javaslatot ingyen mutatja meg, és az alkalmazkodó szintnél sem számít újabb súgónak. Lépés, újrakezdés, új pálya vagy robbantás után ismét 1 pont.

### 383 új pálya (Expansion V3 2000)
- 250 egygolyós pálya az alapkönyvtárba (`expansion-v3-2000-b1`), 133 kétgolyós a kétgolyós könyvtárba (`expansion-v3-2000-b2`); összesen 2000 pálya. Külső, a repó V3 generátorával készült csomag; beépítés előtt a repó eszközeivel függetlenül újraellenőrizve (megoldás, optimalitás, D-osztály, másolatmentesség). Részletek: `docs/EXPANSION-V3-2000.md`.
- A `verify-level-library-v2` és `verify-multiball-v2` ellenőrzők a v2-könyvtárat továbbra is pontosan ellenőrzik, a bővítőcsomagokat pedig mellette (a mélyellenőrzés az új egygolyós pályák besorolását is újraszámolja).

### Harmadik elrendezés: nyilak nélkül
- Beállítások → Kezelőfelület → „Nyilak elrendezése”: Alul / Szélen / Nincs (a korábbi ki/be kapcsoló helyett; a korábbi választás megmarad).
- „Nincs”: nincs iránykereszt, a hat gomb egy sorban a pálya alatt, a pálya így a legnagyobb (412×780-on az 5×8-as pálya 336 helyett 392 px széles). Mobilon simítással, gépen billentyűzettel vagy egérrel húzva lehet lépni; ebben az elrendezésben a gesztusvezérlés mindig be van kapcsolva.
- A súgó iránya ilyenkor a pálya adott szélén egy nagy, lüktető nyílként jelenik meg. Az automatikus megoldás sávja a gombsor fölé kerül.
- A súgó szövege frissítve; a regressziós tesztoldal 4 új esettel bővült (21 eset).

## v0.15.71 — 2026-09-26

### Súgó iránya jól láthatóan
- A súgó javaslatában az irányt kiemelt címke mutatja (pl. „↑ FEL”, „→ JOBBRA”) a téma kiemelő színében, nagy nyíllal; a pálya alatti megfelelő nyílgomb ugyanebben a színben lüktetve felvillan (klasszikus elrendezésben a pálya széli nyíl). A javaslat a következő lépésig, legfeljebb 8 másodpercig látszik.

### Feliratok nem maradnak a pályán
- Közös feliratkezelő (`flashToast`, `showHintToast`): az állapotüzenetek (Freeze felhasználva, Felrobbantva, solver-hibaüzenetek, „Nincs pálya…”, forgatókönyv-üzenetek) 2 másodperc múlva vagy a következő lépésnél eltűnnek; a „számol…” üzeneteket az eredmény váltja fel. Egy lejárt időzítő sosem töröl közben megjelent újabb üzenetet.

### BOMB finomítások
- Kijelölt BOMB mellett nincs körvonal az elemeken; a pálya fölött vékony szálkereszt kurzor jelzi a robbantási módot.
- A robbanás megrázza a pályát (ugyanaz a rázás, mint falba ütközéskor; mozgáscsökkentésnél elmarad).
- A gomb saját, világos bombaikont kapott (a sötét 💣 emoji helyett), narancssárga szikrával.

### Súgó
- A játék súgója frissítve: iránycímke és kiemelt nyílgomb, 8 másodperces súgó, eltűnő üzenetek, BOMB szálkereszt és rázás, „–” optimum bomba után, a bombás pálya nem számít bele az alkalmazkodó szintbe.
- A regressziós tesztoldal 4 új esettel bővült (17 eset).

## v0.15.70 — 2026-09-26

### Összevont súgó
- A sima súgó és a Freeze-súgó egyetlen 💡 gomb lett (hópihe nélkül). Rövid nyomásra 1 pontért a következő lépést mutatja: először Freeze nélküli utat keres (gyors, gyorsítótárazott), és csak ha ilyen nincs, akkor ad legfeljebb egy Freeze-t használó javaslatot. 2 másodperces nyomva tartás: automatikus megoldás, szükség esetén Freeze-zel.

### BOMB
- Új 💣 BOMB képesség a Freeze alatt (csak szabad játékban). Kijelölés után egy pályaelemre koppintva az eltűnik 15 pontért; fal és mozgatható tégla is felrobbantható, golyó és kijárat nem, a többcellás test egészben tűnik el. 15 pont alatt a gomb nem használható; a gomb újabb megnyomása vagy egy irányparancs pontlevonás nélkül megszünteti a robbantási módot. A Freeze és a BOMB egyszerre nem lehet kijelölve.
- Nincs figyelmeztetés és előzetes vizsgálat: a robbantás azonnal végrehajtódik.
- Robbanásréteg az elem celláin (a többcellás alakot követi, a valódi elemet nem veti szét), generált robbanáshang (témánként felülírható `bomb` esemény).
- Bombás megoldás: fix 5 pont, nem rögzül legjobb eredményként (nem számít teljesítettnek), és nem változtatja az alkalmazkodó szintet. A felső sávban az optimum helyén „–” áll. Az újrakezdés visszaállítja az eredeti pályát, és újra teljes pont szerezhető.
- A solver, a pályagenerálás és a nehézségi besorolás nem számol a bombával.
- Új `bomb` esemény a `GameEvents`-ben; a regressziós tesztoldal 5 új esettel bővült (összevont súgó, BOMB-ár és tiltás, golyó/fal/többcellás test, kijelölés megszűnése mozgáskor, 5 pontos szabály és újrakezdés).

## v0.15.69 — 2026-09-26

### Jelenetfeliratok vissza, díszítésként
- A pálya alján lévő kis jelenetfeliratok (pl. „MOON GARDEN // 静 水”, „ACID RAIN // ROOFTOP 09 EVAC”) újra látszanak, változatlanul az eredeti angol szövegükkel. A téma nagy címfelirata (pl. „HOLDKERT”, „NAPÜVEGHÁZ”) továbbra sem jelenik meg a pályaképen.

## v0.15.68 — 2026-09-26

### Nincs témafelirat a pályaképen
- A pályaképen egyik témában sem jelenik meg a téma neve (pl. „HOLDKERT”, „NAPÜVEGHÁZ”), sem a jelenet angol felirata (pl. „MOON GARDEN // 静 水”, „ACID RAIN // ROOFTOP 09 EVAC”). A téma neve csak a szabad játék témaválasztóján látszik.
- Egyetlen közös szabály a `css/game.css`-ben (`.skin-scene-title`, `.sr-caption`), így a későbbi témákra is érvényes. A pálya mérete és helye nem változott.

## v0.15.67 — 2026-09-26

### Futásidejű állapotkezelési javítások (audit alapján)
- **Simítás és koppintás:** a koppintást csak olyan simítás nyeli el, amely ténylegesen lépést adott, és csak a saját koppintását. A 28 px alatti ujjremegés nem veszi el a koppintást (Freeze-kijelölés), és egy simítás után a következő koppintás sem vész el.
- **Eseményrendszer:** új `GameEvents` a `main.js`-ben (`level:leave`, `level:start`, `level:restart`, `move`, `hint`, `victory`). Az alkalmazkodó nehézség ezekre iratkozik fel, és már nem cseréli le futás közben a `main.js` függvényeit.
- **Alkalmazkodó nehézség és újrakezdés:** az újrakezdés új próbálkozást indít ugyanazon a pályán: a súgóbüntetés és a „legalább 5 lépés” jelző nullázódik, így az újrakezdés utáni kihagyás nem számít kudarcnak. Egy már elszámolt (megnyert) pálya újrajátszása nem számít kétszer.
- **Témaváltás közbeni zárolás:** amíg az új pálya témája töltődik, a régi pálya állapota érvénytelen, a játéktér nem érinthető, és billentyű, simítás vagy billentés sem jut el hozzá; az új téma nem jelenik meg a régi pályán. A `ThemeRotation.newLevel()` Promise-t ad, az Új pálya és a Következő megvárja. Gyors, egymás utáni kérésből csak az utolsó érvényesül.
- **Regressziós tesztek:** új `tools/runtime-regression.html` (helyi szerveren megnyitva, `?auto` paraméterrel magától indul) 8 esettel: újrakezdés utáni adaptív próbálkozás, súgó + újrakezdés, automatikus megoldás + újrakezdés, zárolás lassított témaváltásnál, gyors egymás utáni új pálya, ujjremegés kontra simítás, Freeze-koppintás simítás mellett. A futás előtt elmenti, utána visszaállítja a böngésző GGrid-mentéseit. A javítások előtti kódon a fő hibákat jelző tesztek elbuknak.

## v0.15.66 — 2026-09-26

### Javítás: láthatatlan merev testek a Celestial Library témában
- Ok: a v0.15.53 óta az alakonkénti rigid-képeket csak `renderer.rigid: "shape"` beállítású téma használja. A Celestial Library ezt nem kapta meg, ezért a téglalap alakú többcellás testek egy általános, CSS-sel rajzolt elemet kaptak, ami festett (artwork) témában üres – a test cellái közben rejtve voltak, így a test láthatatlan lett (pl. `FG2-3X3-B2-00045`).
- A téma megkapta a `renderer.rigid: "shape"` beállítást: a 2H, 2V, 3H, 3V és a négy L-alak a saját kódex-képével jelenik meg.
- Biztonsági háló: az új `RigidShapes.renderPlan()` dönti el a rajzolás módját, és festett témában csak akkor rejti el a cellákat, ha van helyettük kép. Kép nélküli alak (pl. 2×2, 1×4) cellánként látszik; többcellás test így nem lehet láthatatlan.
- Új teszt: `tools/test-rigid-visibility.mjs` minden témára és minden pályákban előforduló alakra.

### Javítás: Pálya mező
- A kétgolyós jel (●●) a „Pálya” feliratba került; a „D10 · 3×3” érték keskeny telefonon sem vágódik le.

## v0.15.65 — 2026-09-25

### Súgó frissítése
- A főmenü súgója a jelenlegi működést írja le: nyilak a pálya alatt, simítás, billentés, a pálya alatti gombok, tetszőleges méret- és nehézségkombináció, vegyes egy- és kétgolyós válogatás, több téma kijelölése, alkalmazkodó nehézség, kétgolyós pontozás, az automatikus megoldás leállítása és a Freeze-súgó ára. Kikerült a megszűnt „2 golyós játék” indító és a pontozás nélküli kétgolyós mód leírása.

## v0.15.64 — 2026-09-25

### Alkalmazkodó nehézség
- Új `js/adaptive-difficulty.js`: egy- és kétgolyós pályákhoz külön „szint” (folytonos D-érték), amely a teljesítményed szerint mozog. Első használatkor a legkisebb kijelölt nehézségről indul.
- Pálya eredménye 0–1: optimum ÷ megtett lépések, lépéssúgónként −0,15; automatikus megoldás után 0. Érdemi próbálkozás (legalább 5 lépés) után megoldás nélkül kihagyott pálya 0-nak számít; rövid ránézés utáni kihagyás és újrakezdés nem számít.
- Élő-szerű frissítés az adott D-n várható eredményhez képest: felfelé legfeljebb kb. +0,4–0,5, lefelé finoman (saját szintű kudarcnál kb. −0,2).
- A kijelölt nehézségek közül a „szint + 0,5” körüli osztályok kapnak nagy súlyt, a távoliak csak ritkán jönnek; ezen belül továbbra is a még nem teljesített pályák az elsők.
- Pályaválasztó: „Alkalmazkodó nehézség” kapcsoló (alapból bekapcsolva; több kijelölt nehézségnél hat), a jelenlegi szint és „Nullázás” gomb. A győzelmi ablak mutatja a változást, pl. „Szinted: D4,0 → D4,5 ↑”.
- Önálló modul (`js/adaptive-difficulty.js`, `css/adaptive-difficulty.css`); a meglévő kódban csak a `LevelPool.pick()` súlyozási sora változott, így a funkció egy commit visszavonásával eltávolítható.

## v0.15.63 — 2026-09-25

### Kétgolyós pályák pontozása
- A kétgolyós pályák is pontot adnak. Maximum: 5 + ⌈terület/5⌉ + 2·D + ⌈optimum/4⌉ + 3 (egygolyósnál változatlanul ⌈optimum/3⌉, golyóbónusz nélkül). A D-skála közös, a hosszabb kétgolyós megoldások miatt enyhébb a hossztag, a +3 a két golyó egyidejű kezeléséért jár.
- Minden más ugyanaz, mint egygolyósnál: hatékonysági szorzó, legjobb eredmény szabálya, súgó 1 pont, Freeze 10 pont, automatikus megoldás után nincs pont.
- A felső sávban kétgolyós pályán is a Pont látszik; a golyók jele a Pálya mezőbe került („D5 · 5×8 · ●●”). A győzelmi ablak a megszerzett pontot mutatja.

## v0.15.62 — 2026-09-25

### Több téma, véletlen váltás pályánként
- A szabad játék témaválasztóján minden témánál „✓ Kijelölve / + Hozzáadás” kapcsoló, alatta „Mind” és „Csak ez” gomb, valamint a kijelölt témák száma; a pontsor aranyszínnel jelzi a kijelölteket. Legalább egy téma mindig kijelölve marad.
- Minden új pálya véletlen témát kap a kijelöltek közül; kétszer egymás után nem ugyanazt, ha van választás. Az újrakezdés megtartja a témát.
- A következő pálya témája játék közben előre letöltődik, így a váltás azonnali.
- Első használatkor az eddig választott egyetlen téma a kijelölés, tehát semmi nem változik, amíg nem jelölsz ki többet. A Theme Studio előnézetét nem érinti.
- Önálló modul: `js/theme-rotation.js` és `css/theme-rotation.css`; a meglévő kódban csak a `newLevel()` bekötése változott. A funkció egyetlen commit visszavonásával eltávolítható.

## v0.15.61 — 2026-09-25

### Automatikus megoldás: saját állapotsáv, leállítás
- Az automatikus megoldás (és a Freeze-es változata) állapota külön sávban látszik a pálya alatt, a vezérlősáv tetején; nem takarja a játékmezőt. A számítás alatt is megjelenik.
- Piros ✕ gomb állítja le: nem jön több lépés, a kijelölt, de még nem végrehajtott Freeze törlődik, és a pálya onnan folytatható, ahol éppen tart. Az éppen futó egyetlen lépés rövid animációja még befejeződik. Számítás közbeni leállításnál az eredmény eldobódik.
- A pontozás nem változott: ha az automatikus megoldás elindult, a pálya akkor sem ad pontot, ha utána kézzel fejezed be.

## v0.15.60 — 2026-09-25

### Gesztusvezérlés (simítás)
- Új `js/touch-swipe.js`: a játéktéren jobbra, balra, fel vagy le simítva az adott nyíl lép. Egy simítás mindig egy lépés; a lépés már a mozdulat közben jön (kb. 28 px, egyértelmű irány), nem kell az ujjat felemelni. Az animáció közben érkező simítás nem vész el, utána végrehajtódik.
- Koppintás a pálya elemeire (Freeze-kijelölés) továbbra is működik; a simítás nem jelöl ki elemet.
- Beállítások → Gesztusvezérlés, a Mozgásvezérlés fölött. Csak érintőképernyős eszközön kapcsolható, ott alapból be van kapcsolva.
- Bekapcsolt állapotban a játéktéren a böngésző görgetése, nagyítása és lehúzásos frissítése le van tiltva (`touch-action`, `overscroll-behavior`, iOS-en `touchmove`/`gesturestart`). A telefon rendszergesztusait weboldal nem tudja letiltani.

### Javítás
- Hosszú nyomásra Androidon nem jelölődik ki többé a gombok szövege, és nem jön fel a böngésző menüje a játékképernyőn.

## v0.15.59 — 2026-09-25

### Nehézségválasztás kapcsolókkal
- A nehézség ugyanúgy működik, mint a méret: minden D-szint külön kapcsoló, bármilyen kombináció kijelölhető (pl. csak D2 és D9); legalább egy mindig kijelölve marad.
- Az összesítő sor összevonva mutatja a választást, pl. „D3–D5, D9”.
- A v0.15.58-ban elmentett tartomány (pl. D7–D9) ugyanazokként a szintekként töltődik be.

## v0.15.58 — 2026-09-25

### Egységes szabad játék: egy indítógomb, tartományos válogatás
- A szabad játék képernyőn egyetlen „Játék indítása” gomb maradt. A külön „2 golyós játék”, „Generátor teszt” és „V3 D10 teszt” indító megszűnt.
- A méretből több is kijelölhető (legalább egy mindig marad), a nehézség tartomány: első koppintás a kezdete, második a vége. Az összesítő sor mutatja, hány pálya és ebből hány kétgolyós esik a tartományba. A választás böngészőnként megmarad.
- Az új `js/level-pool.js` mindhárom könyvtárból (alap, kétgolyós, generált) véletlenszerűen választ a tartományon belül. Előnyben részesíti a még nem teljesített pályákat, és rövid távon nem ismétel.
- A pálya típusát a pálya maga dönti el: a kétgolyós pályák továbbra is pontozás nélkül futnak (a Pont helyén a golyók száma), az egygolyós pályák pontozottak, a generált egygolyós pályák is.
- A 4×8-as méret kikerült a választható méretek közül: nem volt hozzá pálya és nehézségi kalibráció sem.

### Kontroller-elrendezés
- Az oldalsó hat gomb 48 px helyett 68 px széles, nagyobb ikonnal. Az iránygombok ennek megfelelően kisebbek: fel/le 90×79 px, bal/jobb 75×164 px (412 px széles képernyőn).

## v0.15.57 — 2026-09-25

### Kontroller-elrendezés: nagy iránygombok
- Az iránygombok kitöltik a vezérlősáv teljes közepét: balra és jobbra teljes magasságú gomb, középen egymás alatt fel és le. 412 px széles képernyőn a fel/le gomb 105×79 px, a bal/jobb gomb 87×164 px (korábban mind 48×48 px volt). Téma-akcentusú, vastagabb keret és nagyobb nyíl emeli ki őket.
- Az oldalsó gombok (Freeze, Súgó, Freeze-súgó, Újra, Új pálya, Pályák) keskeny, 48 px-es oszlopba kerültek, felirat nélkül, csak ikonnal. Az akadálymentes nevük (`aria-label`) megmaradt.
- Felső sor: a Lépések mező keskenyebb, a Pont mező szélesebb, a pontszám nagyobb betűvel látszik.

## v0.15.56 — 2026-09-25

### Kontroller-elrendezés: témához illő, nagyobb pálya
- A „Mozgás aktív · egy billentés, egy lépés” és a többi rutinszerű mozgásállapot („indítása…”, „szünetel”, „újraindítása…”) már nem jelenik meg a pálya fölött; az állapotot a mozgás-kapcsoló mutatja. A figyelmet igénylő üzenetek (hiányzó engedély, szenzorhiba) továbbra is megjelennek, de 4 másodperc után eltűnnek.
- Az alsó gombok, az iránykereszt és a Menü gomb a téma `--ui-*` színeiből kapja a színét; a funkciót csak halvány színárnyalat jelzi, így minden témához illeszkednek.
- Kisebb felső sáv (46 px) és vezérlősáv (164 px), keskenyebb margók: 412×780-as képernyőn az 5×8-as pálya 287 px helyett 335 px széles (+17%).

## v0.15.55 — 2026-09-25

### Kontroller-elrendezés (alapértelmezett)
- Új játékképernyő:
  - felül Menü, Lépések (megtett / optimum), Pálya (nehézség · méret) és Pont; kétgolyós módban a Pont helyén a golyók száma;
  - alul nagy iránykereszt;
  - balra Freeze, Segítség és Freeze-súgó; jobbra Újraindítás, Új pálya és Pályaválasztó, feliratos, színkódolt gombokkal.
- Minden pálya és mind a 17 téma működik vele. A játékszabályok nem változtak: a meglévő gombok kerültek új helyre.
- Beállítások → Kezelőfelület → „Kontroller-elrendezés”: kikapcsolva a korábbi, táblaszéli nyilas elrendezés.
- Új fájlok: `js/pad-layout.js`, `css/pad-layout.css`, `docs/PAD-LAYOUT.md`.

### Motion Tilt v2 — gyors billentésfelismerés
- Új `js/motion-tilt-v2.js`, alapértelmezetten ez fut. A lépés már a kifelé billentés közben jön. A 8 valódi kalibrációs felvételen a medián késés 83 ms, a v1-é 767 ms. A pontosság közel azonos: 91/96 és 93/96 helyes billentés, dupla lépés és téves csúsztatás egyiknél sincs.
- Az emelést és a süllyesztést a képernyőre merőleges gyorsulás iránya szűri ki: 3/32 téves lépés.
- Visszaállítás-védelem: a visszaállító mozdulat nem ad ellentétes lépést.
- Gyors egymás utáni billentések: az animáció közben érkező parancs sem vész el (1 elemes puffer, legfeljebb 650 ms).
- Idő szerint integrált giroszkópjel, független a mintavételtől.
- Új beállítás: „Gyors billentésfelismerés”; kikapcsolva a v1 fut. A csúsztatásos léptetés továbbra is a v1-gyel működik.
- `tools/replay-motion-gesture.js --engine v1|v2`: összehasonlítás medián késéssel.
- Új CI-tesztek: `tools/test-motion-tilt-v2.mjs` (192 szintetikus forgatókönyv) és `tools/test-motion-recordings.mjs` (valódi felvételek tömörített kivonata, 170 KB).
- Leírás: `docs/MOTION-TILT-V2.md`.

## v0.15.54 — 2026-09-25

### Theme Studio v1.0 — asset-first szerkesztés, gyors override és valódi játékmotoros preview
- A normál téma-authoring belépési pont továbbra is kevés nagy kép: **5 Asset Pack + 2 háttér**. A Studio ezeket automatikusan kis runtime assetekre bontja.
- Új **Asset Pack E / UI primitives** került be: `button-square`, `button-round`, `button-wide`, `button-menu`, `score-box`. A HUD így nem kényszerül előre festett gombrekeszekre.
- Minden kis asset külön PNG-vel felülírható. Az override az eredeti packot nem módosítja; törölhető, ekkor a rendszer visszaáll a packból kivágott változatra.
- Az override-ok előző változatai helyi history mappába kerülnek, a felülírások státusza külön követhető.
- Új **Jóváhagyás + gyors build** útvonal csak a runtime témát építi újra; nem készít minden iterációnál teljes screenshot QA-t.
- Új **Próbajáték** fül ugyanazt a GGrid motort tölti be iframe-ben, mint a valódi játék. Méret és D-osztály választható, a build egy kattintással újratölthető.
- A játék query-paraméteres Theme Studio preview módot kapott, amely automatikusan betölti a kiválasztott témát és elindítja a játékot.
- A rigid megjelenítés projektbeállításként választható: `material` (folytonos sziluett), `shape` (külön festett alakok), `tiles` (legacy autotile).
- A témázott UI gombok normál/pressed/disabled/selected állapotait a runtime programozottan állítja elő, így nem kell minden állapothoz külön PNG.
- A Theme Kit input feloldási sorrendje: **override → packból kivágott asset → legacy fallback**.
- Új projektformátum v4 és Asset Pack schema v4 készült.

### Theme Studio biztonsági megerősítés
- A Studio továbbra is kizárólag `127.0.0.1`-en figyel.
- Host és Origin ellenőrzés került a szerverbe.
- Minden módosító API hívás sessionönként véletlen CSRF tokenhez kötött.
- A generikus upload endpoint nem írhatja felül a `project.json`, `approval.json`, `manifest.json` és `theme-kit.json` fájlokat.
- A packok és hátterek PNG fejlécét és kötelező pixelméretét szerveroldalon ellenőrizzük.
- Az import külön biztonságos ZIP-kibontót használ: path traversal/ZIP slip, symlink, túl sok fájl, túl nagy kibontott tartalom és manifesten kívüli fájl tiltott.
- A projektimport csak a manifestben felsorolt fájlokat másolja a projektbe.
- A Studio UI a projektből származó szövegeket escape-eli / DOM textként kezeli, hogy ne legyen stored-XSS útvonal.
## v0.15.53 — 2026-09-25

### Egybefüggő rigid-body sziluett renderer
- A többcellás mozgó merev testek `rigidTiles` esetén többé nem cellánkénti autotile elemekből épülnek fel.
- A renderer a teljes polyomino külső kontúrját kiszámítja, és egyetlen SVG-sziluettként rajzolja ki.
- A teljes test egyetlen folytonos `rigid-tiles-block` textúrát kap, így megszűnnek a belső cellahatárok és az ismétlődő cellaszintű motívumok.
- A külső szegély kizárólag a valódi külső kontúrt követi; a keret textúrája a `rigid-tiles-ring` mintából származik.
- A `rigidTiles` sziluett-renderer elsőbbséget kap a korábbi opcionális per-shape rigid artwork előtt, ezért régi maradványassetek sem tudják visszakapcsolni a korábbi megjelenítést.
- A régi cellánkénti autotile API kompatibilitási fallbackként megmarad.
- Új kontúr-regressziós teszt ellenőrzi L/T/U/2×2/6-cellás alakokon, hogy csak a kitett külső élek kerülnek a sziluettbe.

## v0.15.52 — 2026-09-25

### Theme Studio v0.3 — Asset Pack v2
- A 26 külön kézi asset-feltöltés helyett a végleges authoring folyamat **4 ritkán elhelyezett Asset Packot** használ: board core, directions, rigid material és chrome/UI.
- A packok 1024×1536-as sablonjai nagy külső panelt, belső biztonsági keretet és jelentős üres közöket használnak, hogy a kiálló díszek és aszimmetrikus formák ne vágódjanak le.
- Pack feltöltéskor a Theme Studio automatikusan lefuttatja a kivágást, és elemenként mutatja az eredményt ellenőrzésre.
- A forrás-prioritás: **egyedi javító override → Asset Pack → legacy elemlap**. Így normál esetben csak 4 packot kell elkészíteni; külön képet kizárólag a hibás elemhez kell adni.
- A packból származó elem akkor figyelmeztetést kap, ha a rajz veszélyesen közel ér a panel külső széléhez.
- A két külön háttér (`bg-portrait.png`, `bg-landscape.png`) továbbra is önálló BACKGROUNDS fázisban készül és kerül jóváhagyásra.
- A build a forrás-packok és az esetleges override-ok hashét rögzíti, nem a származtatott kivágott fájlokat.
- Új `extract-packs` Theme Kit parancs és Asset Pack v2 CI regresszió készült.
- A régi sűrű elemlapok kompatibilitási fallbackként megmaradtak.

## v0.15.51 — 2026-09-25

### Theme Studio v0.2 — egyedi assetek és külön hátterek
- A végleges témakészítési folyamat most: **MOOD → TARGET → ASSETS → BACKGROUNDS → BUILD → QA → RELEASE**.
- Az elemlapok többé nem kötelező végleges források. A Studio minden Theme Kit slothoz külön PNG feltöltést kezel; a kötelező elemek csak egyedi assetként hagyhatók jóvá.
- Az opcionális gyakori rigid alakok külön csoportban maradnak; hiányuk esetén az általános rigid anyagminta rajzolja ki őket.
- Új külön háttérfázis kezeli és hagyja jóvá a `bg-portrait.png` és `bg-landscape.png` képeket.
- A strict build csak jóváhagyott egyedi assetkészlet és jóváhagyott háttérpár után indulhat.
- A pipeline approval hash-eket az egyedi assetekre és a két háttérképre is ellenőrzi.
- A korábbi négy elemlap továbbra is használható gyors prototípushoz és legacy forrásként, de nem számít végleges Studio-jóváhagyásnak.
- A Build & QA nézet közvetlenül megpróbálja megjeleníteni a generált `compare.png` képet.

## v0.15.50 — 2026-09-25

### Theme Studio QA — háttér és iránynyilak javítása
- A Theme Pipeline külön `bg-portrait/bg-landscape` hiányában az elfogadott targetből készült preview képet használja ideiglenes háttér-fallbackként; dedikált háttérasset továbbra is elsőbbséget élvez.
- Az artwork vezérlőnyilak külön, irányhelyes cue assetként vannak megjelölve.
- A régi generikus nyílforgatás nem fut rá ezekre az artwork cue-kra, így megszűnik a kettős forgatás és a hibás irány.
- A javítás a runtime játékban és a Theme Studio QA screenshotokon is ugyanazt a renderelési útvonalat használja.

## v0.15.49 — 2026-09-25

### Theme Kit atomi fájlírás
- A generált JSON/CSS fájlok előbb ideiglenes fájlba készülnek, majd biztonságos cserével kerülnek a helyükre.
- Egy írási vagy kódolási hiba így nem tudja félbevágni a meglévő theme indexet vagy más runtime fájlt.
- A közös írófüggvények UTF-8 kimenetet használnak.

## v0.15.48 — 2026-09-25

### Theme Kit UTF-8 kimeneti javítás véglegesítése
- A Theme Kit minden generált JSON/CSS kimenetet explicit UTF-8 kódolással ír.
- Javítva a kit-report, runtime theme.json, artwork.css, themes index és capture.json írása Windows alatt.
- Ezzel megszűnik a CP1250/CP1252 UnicodeEncodeError a build végén.

## v0.15.47 — 2026-09-25

### Windows BAT indítók kódolásbiztosítása
- A Theme Studio indító BAT fájlok csak ASCII karaktereket használnak.
- Ez megszünteti a Windows cmd kódlap/UTF-8 értelmezési hibáit, amelyek ékezetes `echo` sorokat külön parancstöredékekként próbáltak futtatni.
- A szerverindító hiba esetén nyitva marad és láthatóan kiírja a Node hibát.

## v0.15.46 — 2026-09-25

### make_slots.py szintaxisjavítás
- Javítva a `make_slots.py` sérült több soros UTF-8 írása, ahol literális `\\n` karakterek SyntaxError-t okoztak.
- A Python szintaxisellenőrzés továbbra is kötelező a Theme Studio CI-ben.

## v0.15.45 — 2026-09-25

### Theme Kit Python szintaxis és UTF-8 javítás
- Javítva a `kit.py` sérült több soros `approval.json` írása, ahol a literális `\\n` karakterek SyntaxError-t okoztak.
- Minden érintett JSON/CSS kimeneti írás explicit UTF-8 és valódi soremelés használatára állt át.
- A Theme Studio CI most `python -m py_compile` ellenőrzést futtat a `kit.py` és `make_slots.py` fájlokra is.

## v0.15.44 — 2026-09-25

### Theme Studio Windows indító stabilizálás
- Külön `START_THEME_STUDIO_SERVER.bat` indító készült a Node szerverhez.
- A fő `START_THEME_STUDIO.bat` most ezt a külön szerverindítót hívja a korábbi, törékeny többszörös idézőjelezés helyett.
- A szerverablak induláskor kiírja a munkamappát és hiba esetén nyitva marad, így a tényleges Node hibaüzenet látható marad.

## v0.15.43 — 2026-09-25

### Theme Pipeline Windows kimeneti UTF-8 javítás
- A Theme Kit minden generált JSON/CSS kimenetet explicit UTF-8 kódolással ír Windows alatt is.
- Javítva a `kit-report.json`, `approval.json`, runtime `theme.json`, `artwork.css`, `content/themes/index.json` és `capture.json` írása.
- Ez megszünteti a Windows alapértelmezett kódlapja miatt jelentkező UnicodeEncodeError hibákat a build végén.

## v0.15.42 — 2026-09-25

### Theme Studio ↔ Theme Pipeline approval szinkron
- A Studio mood/target/sheets jóváhagyásai most automatikusan frissítik a Theme Pipeline által használt `approval.json` fájlt.
- Mood és target jóváhagyáskor szabványos `mood.png` illetve `target.png` másolat készül a kiválasztott képből.
- Sheets jóváhagyáskor a négy kötelező elemlap SHA-256 hash-e bekerül a pipeline approval manifestbe.
- A QA capture a szabványos `target.png` fájlt használja.
- Ez megszünteti a `approval validation failed: sheets stage not approved` buildhibát a Studio-ból indított buildnél.

## v0.15.41 — 2026-09-25

### Theme Kit Windows UTF-8 javítás
- A `make_slots.py` most explicit UTF-8 kódolással írja a `slots.json` fájlt Windows alatt is.
- A `kit.py` felismeri a korábbi ANSI/CP1252 `slots.json` fájlt, automatikusan újragenerálja UTF-8 formátumban, majd folytatja a buildet.
- Ez megszünteti a Windows alatt jelentkező `UnicodeDecodeError: byte 0x96` buildhibát.

## v0.15.40 — 2026-09-25

### Theme Studio build-előfeltétel ellenőrzés
- A Windows indító most UTF-8 kódlapot használ, így a magyar hibaüzenetek nem torzulnak.
- Induláskor ellenőrzi a Node.js mellett a Python jelenlétét is.
- Ha Python hiányzik, előre jelzi, hogy a Studio használható, de a TÉMA ÉPÍTÉSE funkció nem fog működni.
- Ha Python megvan, ellenőrzi a Pillow és Playwright csomagokat, és kiírja a pontos telepítési parancsokat.

## v0.15.39 — 2026-09-25

### Theme Studio projekt-export javítás
- A `.ggrid-theme-project` export/import többé nem igényel Python telepítést.
- Windows alatt a Studio a rendszer PowerShell `Compress-Archive / Expand-Archive` funkcióját használja; Linux/macOS alatt a szabványos `zip / unzip` parancsot.
- A SHA-256 manifestet és az export staging struktúrát maga a Node szerver készíti és ellenőrzi.
- A subprocess indítás most külön spawn-hibát is kezel.
- Export hiba esetén a felület már a szerver tényleges hibaüzenetét mutatja, nem csak az általános „Export hiba” szöveget.

## v0.15.38 — 2026-09-25

### Theme Studio elemlap-feltöltés állapotjavítás
- A négy elemlap kártyája most a tényleges projektfájlok alapján mutatja a `HIÁNYZIK / FELTÖLTVE / JÓVÁHAGYOTT` állapotot.
- Feltöltés után megmarad az előnézet, a fájlméret és a SHA-256 hash rövidített értéke; a böngésző fájlválasztójának „Nincs fájl kiválasztva” szövege többé nem téveszthető össze a projekt feltöltési állapotával.
- Az „Elemlapok jóváhagyása” gomb csak akkor aktív, ha mind a négy kötelező PNG ténylegesen létezik.
- A szerver jóváhagyáskor újra beolvassa és SHA-256-tal rögzíti mind a négy elemlapot; hiányzó fájl esetén a jóváhagyás hibával leáll.
- A jóváhagyott státusz csak addig marad érvényes, amíg a feltöltött fájl hash-e egyezik a jóváhagyott verzióval.

## v0.15.37 — 2026-09-25

### Egylépéses Theme Studio indítás Windows alatt
- Új gyökérszintű `START_THEME_STUDIO.bat` indító került a repóba.
- Dupla kattintásra ellenőrzi a Node.js elérhetőségét, külön parancssori ablakban elindítja a Theme Studio szervert, majd megnyitja a böngészőt a `http://127.0.0.1:4177` címen.
- Új `theme-studio/INDITAS-WINDOWS.txt` rövid leírás készült kézi indítási és leállítási lépésekkel.

## v0.15.36 — 2026-09-25

### Theme Studio v0.1 és Csillagkönyvtár pilot
- Elkészült a helyi, Node.js-alapú **Theme Studio v0.1** webalkalmazás a Theme Pipeline v1 fölött.
- A Studio kezeli a témakatalógust, a mood/target/sheets promptverziókat, a képfeltöltéseket, a jóváhagyási lépéseket, a Theme Pipeline build indítását, a QA státuszt, valamint a teljes projekt export/import folyamatot.
- Bevezetve a hordozható `.ggrid-theme-project` projektarchívum; exportkor a projektforrások mellett a megadott örökölt runtime források is bekerülnek, SHA-256 manifesttel.
- Az első pilotprojekt a **Csillagkönyvtár / celestial-library**. A meglévő v17 runtime téma és artwork baseline referenciaként megmarad, de az új Studio-folyamat MOOD fázisból indul.
- A pilot migráció explicit módon jelzi, hogy az eredeti 2026-09-24 jóváhagyott koncepciókép és az eredeti képgenerálási promptok nincsenek a repóban.
- Külön CI ellenőrzi a Studio szerver indulását, a pilot projekt állapotát és a self-contained projekt-exportot.

## v0.15.35 — 2026-09-25

### Theme Pipeline v1 — hangulattervtől reprodukálható játékbeli témáig
- Elkészült az önálló GGrid **Theme Pipeline v1**; a Claude-javaslat hasznos ötletei beépültek, de a rendszer nem függ Claude-tól.
- A folyamat rögzített: **hangulatterv → render-célkép → elemlapok → strict build → valódi játék screenshot QA → tulajdonosi átvétel**.
- A `showcase.png` és a geometriailag kötött `target.png` külön szerepet kapott; a végső összevetés a render-célképhez történik.
- SHA-256 alapú `approval.json` jóváhagyási lánc készült (`mood → target → sheets`); jóváhagyott kép módosítása után a build új jóváhagyás nélkül leáll.
- Strict módban kötelező a teljes board/chrome/Freeze/anyag assetkészlet; a külön festett 2H/2V/3H/3V/L alakok opcionálisak.
- Új `ThemeAutotile` renderer képes tetszőleges összefüggő többcellás rigid testet két 3×3 festett anyagmintából folytonos tárgyként kirajzolni.
- A meglévő per-shape artwork továbbra is elsőbbséget élvez; a régi témák működése változatlan marad.
- Új **GGrid theme templates** Action generálja a mindenkori játékból az elemlap-sablonokat és a render-célkép alapot.
- Új **GGrid theme pipeline** Action strict buildet, repository-teszteket, valódi játék screenshotokat és külön theme PR-t készít.
- Dokumentáció és CI-regresszió készült a pipeline slot-sémájára és az autotile alakzatkezelésére.

## v0.15.34 — 2026-09-25

### Compact Freeze Solver v2 nagy pályákhoz
- Új, külön `js/freeze-solver-v2.js` készült; a normál `solveDetailed()` és a Freeze Solver v1 változatlanul megmaradt.
- A v2 tömör `Int16Array` állapotokat használ, így jóval kevesebb objektumklónozás és string-alapú állapotépítés történik.
- Freeze-jelöltként csak olyan aktív, nem fal objektumot vizsgál, amely az adott normál irányparancsra ténylegesen elmozdulna; a már eleve helyben maradó objektumok felesleges Freeze-ágai kiesnek.
- A ❄💡 súgó most a v2 solvert használja. A kétgolyós nagy pályák idő-/állapotkerete is nőtt, de a fő gyorsulást az állapottér és a Freeze-elágazások csökkentése adja.
- Új regressziós teszt hasonlítja össze a v1 és v2 mentési képességét, visszajátssza a v2 Freeze-akcióit, és 5×8 D10 benchmarkpályákon is ellenőrzi a normál megoldások megőrzését.

## v0.15.33 — 2026-09-25

### Külön Freeze-aware solver v1 és kísérleti ❄💡 súgó
- Új, izolált `js/freeze-solver-v1.js` készült; a meglévő `solveDetailed()` változatlan maradt.
- A solver legfeljebb egy Freeze használatával is kereshet megoldást, és az útvonalban lépésenként tárolja az irányt és az esetleges `freezeId`-t.
- Normálisan megoldható állapotnál továbbra is Freeze nélküli optimális útvonalat ad vissza.
- A HUD-ban külön **❄💡 Freeze-súgó** gomb jelent meg: rövid nyomás egy Freeze-t is figyelembe vevő javaslatot ad, 2 másodperces nyomva tartás pedig a teljes megoldást animálja.
- Az automatikus Freeze-demó kijelöli a lefagyasztandó objektumot, majd végrehajtja a megfelelő irányparancsot; a demó nem von le Freeze-pontköltséget és az adott menetért nem jár pont.
- Külön regressziós teszt ellenőrzi, hogy a normál megoldások változatlanok maradnak, és hogy egy normálisan megoldhatatlan állapot egy Freeze használatával ténylegesen megmenthető és végigjátszható.

## v0.15.32 — 2026-09-25

### Külön V3 D10 benchmark tesztmód
- A Szabad játék választóban külön **🧪 V3 D10 TESZT** gomb jelent meg.
- A mód kizárólag a `fastgen-v3-d10-benchmark` pack 15 pályáját használja; nem keveri őket a 600-as régi generátor-tesztcsomaggal.
- A mód automatikusan D10-re állítja a nehézséget, és 5×6 / 5×7 / 5×8 méreten az adott 5 benchmarkpályát járja körbe.
- Az **Új pálya** gomb benchmark módban ugyanazon packon belül léptet tovább.
- A generált tesztkönyvtár pack-szintű `hasPack`, `nextPack`, `firstPackAvailable` API-t kapott.

## v0.15.31 — 2026-09-25

### FastGen v3 D10 benchmark tesztpack
- A 15 célzott FastGen v3 kétgolyós D10 benchmarkpálya külön `fastgen-v3-d10-benchmark` tesztpackba került.
- A pack 5×6, 5×7 és 5×8 méreten 5-5 pályát tartalmaz, kizárólag a `generated-test` katalógusban.
- A pályák metadata-ja egységesítve lett: `generatorVersion: 3`, `library: generated-test`, végleges benchmark `packId`.
- Javítva a közös `toRecord()` is, hogy a `content.generatorVersion` a tényleges generátorverzióból származzon.

## v0.15.30 — 2026-09-25

### Fast Generator v3 — adaptív multiball keresés
- Elkészült a külön Fast Generator v3; a működő v2 referencia változatlanul megmarad.
- A v3 átveszi a Claude-javaslat hasznos elemeit: multiball-specifikus layout profilok, transition-table alapú `graphSolver`, direct-open/direct-hard keresés, elite-pool alapú `direct-mutate`, valamint adaptív stratégia-választás.
- D8–D10 kétgolyós hiány esetén a worker automatikusan nagyobb súlyt ad az elite-mutate és hard-multiball keresésnek.
- Megmarad a jelenlegi Metadata Schema v3, globális `levelId`, family-diverzitás, 4–6 cellás nagy rigid shape támogatás, Freeze requirement, valamint canonical fingerprint / SimHash / LSH novelty-szűrés.
- Az új generátor elfogadási kapuja az aktív könyvtár és a futás során már elfogadott pályák ellen is ellenőrzi a duplikációt/hasonlóságot.
- A kétgolyós classifier opcionális solver-backendet kapott; alapértelmezett működése változatlan, state-space ágon pedig a gráfból gyorsítható.
- Új regressziós teszt ellenőrzi a graphSolver/runtime solver egyezést, a multiball classifier egyezést és a v3 end-to-end kimeneti metadata-t.

## v0.15.29 — 2026-09-25

### Freeze megoldási követelmény metaadat
- A pályák `analysis.solutionRequirements.freeze` mezőt kaptak.
- `status` értéke lehet `not-required`, `required` vagy `unknown`; a hozzá tartozó `minimumUses` rendre 0, legalább 1 vagy `null`.
- A jelenlegi aktív pályák normál solverrel megoldhatók, ezért migrációkor `not-required / 0` értéket kapnak.
- A Fast Generator normál pályái mostantól közvetlenül ugyanezt a mezőt írják.
- A validator ellenőrzi a Freeze-státusz és `minimumUses` konzisztenciáját.

## v0.15.28 — 2026-09-25

### Level Fingerprint / novelty index v1
- Elkészült a külön futtatható pálya-ujjlenyomat és újdonságvizsgáló eszköz: `tools/level-novelty-v1.mjs`.
- Minden pályához determinisztikus, szimmetriára normalizált SHA-256 `canonicalHash`, 64 bites `simHash` és 8 LSH bucket-kulcs számítható.
- Az exact hash figyelmen kívül hagyja az objektumazonosítókat és az objektumok JSON-sorrendjét; négyzetes táblán a forgatások és tükrözések, téglalapnál a mérettartó tükrözések/180° forgatás azonos pályának számítanak.
- A hasonlósági keresés indexelt LSH multi-probe módszert használ, így nem kell a teljes pályakatalógust lineárisan végigvizsgálni; a jelenlegi 8×8 bites felosztás 1 bites band-probe-bal minden legfeljebb 15 bites Hamming-távolságú jelöltet felvesz a jelölthalmazba.
- A Fast Generator v2 `toRecord()` útvonala automatikusan beírja a `content.fingerprints` blokkot az újonnan generált pályákba.
- Hozzáadva külön invariancia/duplikáció/hasonlóság teszt: `tools/test-level-fingerprint-v1.mjs`.

## v0.15.27 — 2026-09-25

### Egységes Level Metadata Schema v3
- Bevezetve az egységes metadata-réteg az aktív egygolyós, kétgolyós és Fast Generator pályákhoz.
- Új determinisztikus mezők: `packId`, `library`, `familyId`, `ballCount`, strukturális shape-statisztikák, provenance, egységes `qualityScore` és `noveltyScore` módszerazonosítóval.
- Pack- és katalógusszinten előkészítve a későbbi entitlement/access modell (`status`, `visibility`, `entitlement`).
- A dinamikus közösségi értékelések szándékosan nem kerülnek a statikus pályafájlba; azok később backend aggregátumok lesznek.
- Elkészült a teljes aktív könyvtár migrációs és validációs eszköze.
- A Fast Generator v2 mostantól közvetlenül metadata v3 kompatibilis rekordokat állít elő.

## v0.15.26 — 2026-09-25

### Fast Generator invalid-state és kevert kvóta javítás
- Az érvénytelen state-space jelöltek már nem állítják le a workert, hanem kiesnek és a generálás tovább fut.
- A 600-as tesztcsomag D-osztályonként továbbra is 10 pályát céloz, de a kétgolyós arány nem kényszerített 5+5; ahol van megfelelő B2 jelölt, legfeljebb 5 kerül be, a hiányt B1 tölti fel.
- A nagyobb pályákon a 4–6 cellás rigid alakzatok továbbra is aktívak.

## v0.15.25 — 2026-09-25

### Fast Generator CLI parser javítás
- Javítva a dokumentált `D1-D10` és `B1,B2` target-formátum feldolgozása.
- A 600 pályás generálási futás ezzel a javított parserrel indul újra.

## v0.15.24 — 2026-09-25

### Generátor teszt indítás javítása
- A **⚗ GENERÁTOR TESZT** gomb most akkor is indítható, ha az aktuálisan kiválasztott méret/D kombinációhoz nincs generált tesztpálya.
- Ilyenkor a játék automatikusan az első elérhető generált tesztprofilra vált.
- A jelenlegi bootstrap pack 3×3-as, ezért a korábbi 4×4 / D5 alapállapot többé nem tiltja le a teszt indítását.
- Külön `hasAny()` és `firstAvailable()` tesztkönyvtár API került be, valamint közvetlen indításnál is működik a biztonsági fallback.

## v0.15.23 — 2026-09-25

### Fast Generator v2 — első tesztelhető verzió
- Beépült a Claude-féle state-space/reverse-BFS ötlet továbbfejlesztett változata.
- A generátor paraméterezhető célokat fogad, például: `100@5x8:D1-D10:B1,B2`.
- Egy futás több célt is kezelhet, és 3–8 cellás szélesség/magasság tartományban egyedi méretet is elfogad (például 4×8).
- 1 golyós pályáknál gyors `puzzle-v2` classifier, 2 golyós pályáknál a meglévő `puzzle-v3-multiball-anchored-v2` classifier működik.
- Nagyobb táblákon `auto` módban 4–6 cellás rigid objektumok is generálhatók.
- Javítva lett a korábbi ball/brick fingerprint-típusütközés; külön exact és family szintű változatossági szűrés működik.
- A worker-szám alapból legfeljebb 4, a state-space workerenkénti memóriaőrrel fut.
- A generált rekordok pack/family/ballCount/generator metadata, valamint quality/novelty mezők számára előkészített struktúrát kapnak.
- Külön `content/levels/generated-test/` katalógus és **⚗ GENERÁTOR TESZT** játékmód készült, amely nem keveri a tesztpackokat az éles könyvtárral.
- A teszt UI azonnali kipróbálásához külön 3×3-as bootstrap pack került be 1 és 2 golyós pályákkal.
- A `--publish-test` kapcsolóval a generátor közvetlenül ebbe az elkülönített tesztkatalógusba tud publikálni.
- CI smoke teszt ellenőrzi a kétgolyós compact state-space támogatást, a nagy shape-készletet, a fingerprintet és a family-szűrést.

## v0.15.22 — 2026-09-25

### Automatikus megoldás kiadásfüggő engedélyezése
- Az automatikus megoldás indításához szükséges hosszú nyomás 3 másodpercről **2 másodpercre** csökkent.
- Bevezetésre került az alkalmazáskiadástól függő feature gate:
  - `development`: automatikus megoldás engedélyezve;
  - `free`: automatikus megoldás tiltva;
  - `paid`: automatikus megoldás engedélyezve.
- A jelenlegi build alapértelmezett kiadása `development`, így az automatikus megoldás továbbra is elérhető.
- A súgó és a kapcsolódó tooltip-szövegek 2 másodpercre frissültek.

## v0.15.21 — 2026-09-25

### Gyors runtime solver és pályaforgatás
- A játékban használt solver compact állapotreprezentációra váltott.
- A korábbi solver `solveDetailedLegacy()` néven referencia-implementációként megmaradt.
- Új runtime solver-equivalence regressziós teszt készült.
- A CI 1002 pályán, 1348 összehasonlítással ellenőrzi az új és a legacy solver azonosságát.
- A Szabad játék először a még nem teljesített pályákat adja; ha minden pálya teljesített, visszatér a normál körforgáshoz.
- A multiball offline eszköz explicit módon a legacy solverhez lett kötve a referencia-viselkedés megtartása érdekében.
- A Csillagkönyvtár elavult contract tesztje a tényleges theme v17 / artwork v2 struktúrához lett igazítva.
- A teljes GGrid validation workflow ismét zöld állapotba került.

## v0.15.20 — 2026-09-25

### Csillagkönyvtár — jóváhagyott könyv- és kódexgrafika
- A kódexek a jóváhagyott, antik könyvszerű megjelenéshez lettek igazítva.
- Az L alakú kódexek részletezése és sziluettje tovább finomodott.
- A túlméretezett szimbólumokat visszafogottabb könyvdíszítés váltotta.
- A téma az elfogadott vizuális referencia irányába lett egységesítve.

## v0.15.19 — 2026-09-25

### Csillagkönyvtár — kompozíció és könyvmegjelenés
- A pályakompozíció közelebb került az elfogadott látványtervhez.
- A nagyobb könyv/kódex objektumok megjelenése egységesebb és részletesebb lett.
- A vizuális passz külön ellenőrzéssel került lezárásra.

## v0.15.16–v0.15.18 — 2026-09-25

### Csillagkönyvtár — stabilizálás és térhatás
- Helyreállt a stabil artwork-betöltés.
- A kódexek és L alakú könyvobjektumok térhatásos, könyvszerű grafikát kaptak.
- A téma vizuális részletezettsége több iterációban nőtt.

## v0.15.15 — 2026-09-24

### High-fidelity Csillagkönyvtár
- Bevezetésre került a nagy részletességű Csillagkönyvtár artwork.
- A téma vizuális minőségéhez külön QA-mérőszámok és referenciaellenőrzés társult.

## v0.15.13–v0.15.14 — 2026-09-24

### Mobil vezérlők és nyíl-visszajelzés
- A vezérlőzóna és a lenyomott nyíl vizuális eleme különvált.
- Csak a tényleges nyíljelzés kap aktív lenyomási visszajelzést.
- Mobilon megszűnt a zavaró kék tap-highlight a Csillagkönyvtár vezérlőin.

## v0.15.9–v0.15.12 — 2026-09-24

### Csillagkönyvtár elrendezés és vezérlőgeometria
- A portré artwork-elrendezés rögzítésre és finomhangolásra került.
- A pálya körüli iránygombok a kerethez és a kontrollsávokhoz igazodtak.
- A kijárat mérete és rétegzése úgy változott, hogy a golyó láthatósága megmaradjon.
- A felső, alsó és oldalsó irányvezérlők egységes artwork-logikát kaptak.
- Az elfogadott Csillagkönyvtár kompozíció további vizuális finomítást kapott.

## v0.15.8 — 2026-09-24

### Többcellás alakzatok és Freeze-kijelölés
- Javult az L alakú merev testek artwork-geometriája.
- A többcellás összeragasztott objektumok Freeze-kijelölése egyetlen összetett alakzatként jelenik meg.
- A pálya hasznos megjelenítési területe megnőtt.
- Az iránynyilak és a rigid-shape clip-pathok tesztelése bővült.

## v0.15.5–v0.15.7 — 2026-09-24

### Artwork-alapú témák aktiválása
- A Csillagkönyvtár artwork-témává vált.
- Bevezetésre kerültek az egyedi cella-, golyó-, fal-, könyv-, kijárat-, HUD-, victory- és vezérlőgrafikák.
- A témaválasztó képes lett artwork előnézetet mutatni.
- Javult a mobil témaléptetés és a magasabb pályák megjelenítése.

## v0.15.0–v0.15.4 — 2026-09-24

### Artwork Theme infrastruktúra
- Elkészült az artwork asset resolver és layout engine.
- A renderer támogatni kezdte a témamanifestből származó saját grafikákat.
- Bevezetésre került a safe-area alapú pálya- és vezérlőgeometria.
- Megjelent a nine-slice keretrenderelés.
- Rögzítésre került a Csillagkönyvtár jóváhagyott referenciageometriája.
- A téma-váltáskor keletkező régi artwork-geometria takarítása stabilabb lett.
- Asset-, layout- és frame-tesztek készültek.

## v0.14.4 — 2026-09-24

### Mozgásérzékelő desktop felismerés
- Javult annak felismerése, hogy egy eszköz valóban alkalmas-e mozgásvezérlésre.
- A desktop böngésző puszta DeviceMotion/DeviceOrientation API-támogatása önmagában már nem tekintendő használható szenzornak.

## v0.14.0–v0.14.2 — 2026-09-24

### Theme Render V3 és Napüvegház
- Bevezetésre került a Theme Render V3.
- A témák shape-aware megjelenítése fejlődött.
- A Napüvegház nagyobb többcellás alakzatai külön növénytartó/megjelenítési logikát kaptak.
- A nagy alakzatok vizuális illeszkedése tovább finomodott.

## v0.13.0–v0.13.1 — 2026-09-24

### Shape-aware témák és Csillagkönyvtár
- A témarendszer felismeri és külön tudja megjeleníteni a merev alakzatokat.
- Megjelent a Csillagkönyvtár téma.
- A Csillagkönyvtár megkapta a korai Visual V2 megjelenést.

## v0.12.97–v0.12.99 — 2026-09-24

### Kétgolyós pályakönyvtár
- Elkészült a külön kétgolyós pályakönyvtár.
- A kétgolyós pályák D1–D10 nehézségi besorolást kaptak.
- A kezdetben túl könnyű pályák újragenerálásra kerültek.
- A 240 kétgolyós pálya nehézségét erősebben a tényleges megoldási komplexitáshoz kötöttük.
- Javult a kétgolyós pályák közötti továbblépés és kalibráció.

## v0.12.95–v0.12.96 — 2026-09-24

### Kétgolyós tesztmód és solver
- Megjelent az izolált kétgolyós tesztmód.
- A solver többgolyós állapotokkal is tud dolgozni.
- Bounded solver-tesztek készültek a többgolyós működéshez.

---

## Megjegyzés a korábbi történetről

A fenti, régebbi bejegyzések a `main` ág commit-történetéből rekonstruált, összevont kiadásjegyzetek. A repository korábbi fejlesztési módszere miatt egyetlen alkalmazásverzió több technikai commitból is állhatott, és nem minden commit rendelkezett önálló release-leírással.

A részletes technikai előzmények továbbra is megtalálhatók a Git commit historyban.
