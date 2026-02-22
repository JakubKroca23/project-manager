# Build Log - Project Manager

## [2026-02-04] - Inicializace systému
- **Změna**: Vytvořena struktura `.agent/`.
- **Detail**: Přidány soubory `rules.md`, `context.md`, `memory.md` a workflow soubory (`debug.md`, `logging.md`, `feature.md`).
- **Cíl**: Nastavení pevného základu pro efektivní vývoj a automatizované opravy.

## [2026-02-04] - Příprava Next.js a TDD Start
- **Změna**: Inicializován Next.js projekt (App Router, TypeScript).
- **Změna**: Nastaven Jest a React Testing Library.
- **Změna**: Vytvořen první test `ProjectList.test.tsx` (RED fáze).
- **Změna**: Definována základní datová struktura v `types/project.ts`.

## [2026-02-05] - Dynamická Timeline a centralizace dat
- **Změna**: Vytvořena utilita `src/lib/data-utils.ts`.
- **Detail**: Centralizace mapování dat z Raynet JSON na `Project` typ, sjednocení logiky pro `getVal` a ošetření `NaN` hodnot.
- **Změna**: Implementována celoroční dynamická Timeline (`src/app/page.tsx`).
- **Detail**: Automatický scroll na dnešek, barevné milníky pro termíny, sticky hlavička a první sloupec.
- **Změna**: Pokročilý Zoom systém (v3.0).
- **Detail**: Tři úrovně zoomu (5px, 12px, 28px). Implementace vertikálních linek a tooltips pro kompaktní režimy. Skrytí dnů při oddálení.
- **Změna**: Refaktoring stránky Projekty (`src/app/projekty/page.tsx`).
- **Detail**: Odstranění lokálního mapování dat a přechod na `getMappedProjects` z `data-utils.ts`. 
- **Změna**: Robustní Resizing Sloupců (v4).
- **Detail**: Implementace nezávislého resizingu pomocí `<colgroup>` a `<col>`, který řeší stabilitu šířek a směr resizingu (k levému okraji). Odstraněny konflikty s Drag & Drop systémem.
- **Změna**: Optimalizace šířky Navbaru.
- **Detail**: Snížení `max-width` na 900px v `globals.css` pro lepší vizuální rovnováhu.

## [2026-02-05] - UI Timeline úpravy
- **Změna**: Odstranění hlavičky Timeline a legendy (`src/app/page.tsx`).
- **Detail**: Odstraněn nadpis "Timeline 2026" s popiskem a legenda (Podvozek, Nástavba, Předání). 
- **Změna**: Sjednocení hlavičke Timeline se stylem ProjectList.
- **Detail**: Přidáno vyhledávací pole s ikonou Search (z `lucide-react`) a filtrování projektů. Zoom controls přesunuty doprava. Použitý layout `table-header-actions` pro konzistentní vzhled.

## [2026-02-06] - UI Polishing
- **Změna**: Úprava podbarvení víkendů v Timeline.
- **Detail**: Změna barvy sloupců `.weekend-col` z poloprůhledné na neprůhlednou `#e2e8f0` v `globals.css` pro lepší čitelnost.

## [2026-02-11] - Časová osa: Servisní řádek a pokročilé filtry
- **Změna**: Implementace multi-výběrového filtrování projektů.
- **Detail**: Původní přepínač nahrazen barevnými checkboxy (Civilní - modrá, Vojenské - zelená, Servis - indigo), které umožňují kombinovat filtry.
- **Změna**: Redesign servisního řádku.
- **Detail**: Všechny servisní výjezdy sjednoceny do jediného řádku v horní části časové osy. Řádek je nyní `sticky` (fixovaný) s výškou 42px, má indigo ohraničení (3px) a skleněný efekt (blur).
- **Změna**: Vylepšení překryvů servisů.
- **Detail**: Servisní fáze mají nyní průhlednost (`0.75`), aby byly viditelné i při souběhu více výjezdů v jednom řádku.
- **Změna**: Oprava TypeScript chyb.
- **Detail**: Vyřešeny typové chyby u `toggleType` a `serviceLanes` v `Timeline.tsx`.

## [2026-02-11] - Rozšířená oprávnění a sjednocení vizuálu
- **Změna**: Implementace granulárních oprávnění pro sekci ZAKÁZKY.
- **Detail**: Do profilu uživatele přidána možnost spravovat přístup k sub-kategoriím (Civilní, Vojenské, Servis). Sekce ZAKÁZKY v Navbar se automaticky skryje, pokud uživatel nemá přístup ani k jedné podkategorii.
- **Změna**: Inteligentní Navbar a vizuální kontinuita.
- **Detail**: Navbar nyní detekuje typ projektu v detailu a zvýrazňuje správnou kategorii i bez URL parametrů. V detailu projektu přidán horní barevný pruh odpovídající kategorii.
- **Změna**: Sjednocení barevné palety napříč aplikací.
- **Detail**: Barvy v Timeline (sektory, fáze, milníky) byly sjednoceny s barvami v Navbary a Login stránce (Military: #a5d6a7, Service: #ce93d8, Civil: #90caf9).
- **Změna**: Redesign Login stránky.
- **Login Design**: Modernizován nadpis na "PLÁNOVÁNÍ ZAKÁZEK" s důrazem na čistý korporátní styl.

## 2026-02-11 (22:45): Refaktoring UI a Admin Panelu
- **Vizuální konzistence**: Barvy kategorií (Vojenské: #a5d6a7, Servis: #ce93d8, Civil: #90caf9) se nyní propisují i do řádků tabulky projektů (jemné pozadí) a do ovládacích prvků v detailu zakázky.
- **Architektura Profilu**: Admin Panel byl oddělen od uživatelského nastavení (Vzhled, Heslo) do samostatného modulu/popupu, což zjednodušuje UI pro běžné uživatele i administrátory.
- **DataTable**: Komponenta rozšířena o props `getRowClassName` pro flexibilní styling řádků na základě dat.

## [2026-02-11] - Refaktoring profilu a sjednocení tabulek
- **Změna**: Vizuální sjednocení seznamu zakázek.
- **Detail**: Řádky v tabulce projektů jsou nyní podbarveny podle kategorie (Zelená - Vojenské, Fialová - Servis, Modrá - Civil), což usnadňuje orientaci v seznamu.
- **Změna**: Inteligentní detail zakázky.
- **Detail**: V detailu projektu přidán horní indikační pruh a tlačítko "Zpět" nyní dynamicky přebírá barvu kategorie projektu.
- **Změna**: Separace Admin Panelu v profilu.
- **Detail**: Administrační nástroje byly vyjmuty z obecného nastavení a přesunuty pod samostatné tlačítko "Admin Panel" s vlastním dedikovaným popupem pro lepší přehlednost.

## [2026-02-12] - Oprava Admin Panelu a Role-based Access Control
- **Změna**: Oprava detekce administrátora.
- **Detail**: `isAdmin` check v hooks (`useAdmin`, `usePermissions`) a v serverových akcích nyní primárně kontroluje roli `admin` v tabulce `profiles` namísto spoléhání se na hardcoded e-mail.
- **Změna**: Reaktivní správa rolí.
- **Detail**: Přidán real-time listener do `useAdmin`, který okamžitě reaguje na změnu role přihlášeného uživatele a zpřístupňuje/skrývá admin funkce bez refreshu stránky.
- **Změna**: UI optimalizace – integrace do Nastavení.
- **Detail**: Tlačítko "Admin Panel" přesunuto z hlavní karty profilu do modálního okna "Nastavení" pro čistší vizuál.
- **Změna**: Implementace Audit Loggingu.
- **Detail**: Vytvořena migrace `20240212_user_action_logs.sql`, která zavádí tabulku `user_action_logs` a triggery pro automatické logování změn v rolích a oprávněních v DB.
- **Změna**: Rozšíření oprávnění administrátorů.
- **Detail**: Každý uživatel s rolí `admin` má nyní právo schvalovat nové registrace a měnit role ostatním (s výjimkou hlavního administrátora).

## [2026-02-12] - Oprava a vylepšení milníků v Timeline
- **Změna**: Fix posunu milníků o jeden den.
- **Detail**: Původní logika využívala `toISOString()`, což způsobovalo posun termínů do předchozího dne kvůli časovým pásmům. Opraveno na striktní používání lokálních komponent data (`getFullYear`, `getMonth`, `getDate`).
- **Změna**: Dynamická velikost ikon.
- **Detail**: Implementována adaptivní velikost ikon milníků. Při horizontálním zmenšení (zoom-out) se ikony agresivně zmenšují (až na 14px), aby graf zůstal přehledný.
- **Změna**: Interaktivní tooltipy s editací.
- **Detail**: Do tooltipů přidán `<input type="date">` umožňující přímou změnu termínu v DB (Supabase projects). Tooltip nyní popupuje přímo z ikony s novou animací.
- **Změna**: Multitooltip a vylepšení "Stacked" řádků.
- **Detail**: V souhrnných řádcích se nyní při nahromadění milníků zobrazují všechny tooltipy najednou pod sebou. Odstraněna mřížka v těchto řádcích pro větší čistotu.
- **Změna**: Oprava visibility tooltipů.
- **Detail**: Nastaven `z-index: 10000` and `overflow: visible` pro souhrnné řádky, čímž bylo vyřešeno schovávání tooltipů pod zakázkami.

## [2026-02-12] - Implementace sekcí Výroba a Nákup
- **Nové stránky**: Vytvořeny routy `/vyroba` a `/nakup`.
- **UI Komponenta**: Vytvořena `ConstructionSection.tsx` pro elegantní "Under Construction" stavy.
- **Vizuální styl**: Implementována "výstavbová animace" pomocí CSS keyframes (float, swing, lift) a ikon `lucide-react`.
- **Konzistence**: Sekce jsou plně integrovány do Navbaru a respektují oprávnění uživatele.

## [2026-02-16] - Timeline Visual Fixes (Crane & Stacked Rows)
- **Ikony**: Přidání ikony `Crane` (jeřáb) do `ICON_OPTIONS` v `Timeline.tsx` a `TimelineBar.tsx`.
- **Stacked Rows Visibility**: Oprava problému, kdy bílé pozadí souhrnných řádků ("stacked" hot zones) v hlavičkách sektorů zakrývalo obsah. 
- **Detail**: v `TimelineBar.tsx` nastaveno `background: 'transparent'` (místo `var(--background)`) pro komponenty v režimu `isCollapsed`. Tím je zajištěno, že při překryvu více projektů v jednom řádku (summary) jsou viditelné všechny indikátory.

## [2026-02-17] - Timeline Legend & Milestone Refinements
- **Změna**: Implementace Nápovědy a Legendy.
- **Detail**: Přidáno tlačítko "Nápověda" do lišty Timeline. Otevírá modální okno s přehledem ovládání (myš, klávesnice) a kompletní legendou barev pro fáze a ikony milníků.
- **Změna**: Redesign milníků "Konec montáže" a "Konec revize".
- **Detail**: Tyto specifické milníky se nyní vykreslují jako jednoduché barevné tečky (dots) místo ikon, pro snížení vizuálního šumu.
- **Změna**: Vylepšení Timeline Settings.
- **Detail**:
    - **UI**: Tlačítka v hlavičce jsou nyní pouze ikony (bez textu) pro čistší vzhled.
    - **Color Pickers**: Všechny výběry barev (Fáze, Milníky, Obrys) mají nyní moderní kulatý design (`rounded-full`).
    - **Layout**: Popup nastavení má fixní hlavičku a scrollovatelný obsah.
    - **Logika**: Pro "dot" milníky (Montáž/Revize End) je v nastavení skryt výběr ikony.
- **Změna**: Oprava Z-Indexu popupů milníků (React Portal).
- **Detail**: Popup s detailem milníku/projektu v `TimelineBar` byl přesunut do `React Portal` (`document.body`). Tím se definitivně vyřešil problém s překrýváním popupu okolními elementy nebo "stacked" řádky.

## [2026-02-17] - Custom Milestones Integration & UI Polish
- **Změna**: Streamlined Custom Milestones.
- **Detail**:
    - **Odstranění pole**: Z detailu projektu i Timeline byl odstraněn nadbytečný "Typ nástavby" pro zjednodušení procesů.
    - **Ikonky**: Implementován výběr ikon při tvorbě milníku (Truck, Hammer, Check, etc.). Ikonka se ukládá do DB (`project_milestones.icon`) a zobrazuje se v Timeline i v Detailu projektu.
    - **Barevné rozlišení**: Rozpracované milníky (pending) jsou nyní červené, hotové (completed) zelené pro okamžitou vizuální kontrolu.
- **Změna**: Fix positioning popup okna Timeline.
- **Detail**:
    - Popup pro editaci se nyní při blízkosti spodního okraje okna (limit zvýšen na 400px) automaticky otevírá směrem nahoru.
    - Přidán `max-height: 85vh` a `overflow-y: auto` do popupu, čímž je zaručena jeho plná viditelnost na všech zařízeních.

## [2026-02-17] - Project Creation & Maintenance Enhancements
- **Změna**: Implementace ručního vytváření zakázek a servisů.
- **Detail**: Vytvořena komponenta `CreateProjectModal.tsx` s validací (povinná pole: ID, Název, Klient, Manažer). Tlačítka "Nový projekt/servis" integrována do stránek `/projekty` a `/servis`.
- **Změna**: Vylepšení SystemStatusBar.
- **Detail**:
    - Přidána konstanta `LAST_DEPLOY_DATE` pro zobrazení reálného času nasazení systému.
    - Zprovozněno tlačítko "Release Notes" s modálním oknem zobrazujícím novinky a opravy.
- **Změna**: Modernizace Maintenance Screen.
- **Detail**: 
    - Obrazovka údržby nyní dynamicky načítá verzi systému z databáze (`app_settings`).
    - Přidána interaktivní minihra s jeřábem ("Crane Game") pro zabavení uživatelů během odstávky.
- **Hotfix**: Oprava chybějícího importu `Trash2` na stránce Servisu, který způsoboval pád buildu na Vercelu.

## [2026-02-18] - Priority a úprava vzhledu Timeline
- **Mechanika priorit**: Každé zakázce lze nyní přiřadit prioritu (1: Urgentní, 2: Normální, 3: Nízká).
- **Barvy dle priorit**: V nastavení vzhledu časové osy lze pro každou prioritu vybrat specifickou barvu. Tato barva se aplikuje **výhradně na fázi "Montáž"** (phase-buffer-yellow).
- **Design Timeline**: 
    - Výška baru se nyní ovládá v procentech vůči výšce řádku (centrováno vertikálně).
    - Odstraněno horizontální odsazení a stíny barů pro "flat" moderní vzhled.
    - Přidána možnost zapnout a nastavit šířku obrysu (outline) barů.
    - Úprava drag-to-scroll: tažení myší je nyní ignorováno v oblasti časové hlavičky (měsíce, týdny, dny).
- **Milníky**: Kompletně odstraněn milník "Konec montáže" ze systému.
- **UX**: Tlačítka pro vertikální zoom (+/-) přímo v řádcích jsou nyní stále viditelná (20 % opacity) s poloprůhledným pozadím pro lepší orientaci.

## [2026-02-18] - Import Wizard Expansion
- **Nový typ importu**: Do prvního kroku (výběr typu) přidána možnost **"DOPLNĚNÍ K ZAKÁZCE"**.
- **Design**: Tato volba je vizuálně menší a subtilnější, aby nenarušovala hlavní trojici (Civilní/Vojenské/Servis), ale připravuje systém na budoucí importy dokumentace a výkresů ke konkrétním existujícím zakázkám.

## [2026-02-20] - Timeline Icon Color Update & Cleanup
- **Změna**: Všechy ikony milníků v Timeline jsou nyní vynuceně černé.
- **Detail**:
    - Odstraněna dynamická barva ikon v `Timeline.tsx` i `TimelineBar.tsx` (nastaveno fixně `#000000`).
    - Z `Timeline.css` byly odstraněny drop-shadow efekty (glow), milníky jsou nyní čisté černé ikony.
    - Promazány nepotřebné CSS proměnné a zastaralá barevná logika milníků.
- **Změna**: Oprava TypeScript/JSX chyb.
- **Detail**: Doplněny chybějící typové anotace pro parametry v mapování a filtrech, čímž byly vyřešeny "implicitly has any type" chyby.
- **Změna**: Modernizace ikony Hiab (odstranění bílých a šedých částí, zachování pouze černé geometrie).

## [2026-02-21] - Timeline Header & Sidebar Refinement
- **Změna**: Integrace čísel dnů do řádku CELKEM.
- **Detail**: Dny jsou nyní součástí sumárního řádku "CELKEM", což šetří vertikální prostor. Čísla dnů a názvy mají bílé vytažení (text-shadow) a jsou zobrazeny s prioritou čitelnosti nad grafem.
- **Změna**: Redesign levého sloupce zakázek.
- **Detail**: Každý řádek nyní zobrazuje číslo zakázky (OP-ID), jméno zákazníka a vedoucího projektu. Zobrazení informací je dynamické a přizpůsobuje se aktuální výšce řádku (zoomu).
- **Změna**: Optimalizace indikátoru "Dnes".
- **Detail**: Dnešní den je zvýrazněn 4px červeným rámečkem. Svislá červená linka nyní začíná až pod hlavičkou dnů a schovává se pod sticky sloupec zakázek (z-index fix).
- **Změna**: Úprava výšek sumárních řádků.
- **Detail**: Výška řádku CELKEM zvýšena na 29px a řádku SERVIS na 40px pro lepší přehlednost stacked barů.

## [2026-02-21] - Navbar Redesign & Global Toolbar Integration
- **Změna**: Redesign Navbaru a integrace dynamické lišty (Global Toolbar).
- **Detail**:
    - **Aktivní sekce**: Štítek aktivní podkategorie (CIVIL/SERVIS/VOJENSKÉ) přesunut zespodu přímo vedle názvu "ZAKÁZKY" pro úsporu místa a lepší vizuální vazbu.
    - **Injectable Toolbar**: Rozšířen `ActionProvider` o `customToolbar`, který umožňuje jednotlivým stránkám (např. Projekty) vkládat své specifické akce přímo do globálního Navbaru.
- **Změna**: Modernizace stránky Projekty.
- **Detail**:
    - Tlačítka "Nová zakázka", "Hromadné akce", "Sloupce" a počítadlo záznamů přesunuta do globálního Navbaru.
    - Odstraněn vnitřní toolbar z `DataTable`, což maximalizuje prostor pro samotná data.
- **Změna**: "Extrahovaný" styl milníků v Timeline.
- **Detail**:
    - Milníky již nemají pevné kruhové pozadí. Místo toho využívají techniku `drop-shadow` k vytvoření tlustého ohraničení (1.8px) kopírujícího tvar ikony.
    - **Stavová logika**: Ohraničení je bílé pro plánované, zelené pro doručené a červené pro zpožděné milníky. To zajišťuje okamžitý přehled o stavu bez nutnosti otevírat detail.
- **Změna**: Optimalizace interakce s popupy milníků.
- **Detail**:
    - **Plynulejší animace**: Přidány Tailwind animace `animate-in fade-in zoom-in-95` pro hladší otevírání detailu milníku.
    - **Okamžité zavírání**: Odstraněna umělá prodleva 300ms při odjezdu myší z ikony. UI nyní reaguje okamžitě, což zvyšuje pocit svižnosti celé aplikace.

- **Změna**: Dynamické uspořádání Navbaru dle aktivní sekce.
- **Detail**:
    - **Režim Zakázky**: Pokud je uživatel v sekci Projekty, tlačítko "ZAKÁZKY" (včetně submenu) se přesune do **středu** Navbaru spolu s nástrojovou lištou. Tlačítko "HARMONOGRAM" se posune **doleva**.
    - **Režim Harmonogram**: V ostatních případech zůstává rozvržení standardní (Harmonogram ve středu, Zakázky vlevo).
    - Tato změna zlepšuje ergonomii a soustředění na aktivní modul aplikace.

- **Změna**: Finální reorganizace rozvržení Navbaru.
- **Detail**:
    - **Levá strana**: Přesunuty veškeré ovládací prvky specifické pro stránku (customToolbar) a tlačítko "Dnes". Tím je uvolněn prostor pro navigaci.
    - **Střed**: Zde se nyní nachází pouze hlavní navigace (Zakázky a Harmonogram).
    - **Dynamické centrování**: Aktivní položka se vždy posouvá blíže ke středu (prohazují se pozice). Pokud jsi v Zakázkách, jsou vpravo od Harmonogramu (blíže centru), pokud v Harmonogramu, jsou vpravo od Zakázek.

- **Oprava**: Vylepšení interakce a animace popupu milníků.
- **Detail**:
    - **Animace**: Popup nyní "vyjíždí" přímo z ikony milníku (použit slide-in a origin dle pozice nahoře/dole).
    - **Dostupnost**: Zmenšena mezera mezi ikonou a popupem (na 5px) a vrácena krátká prodleva 150ms při opuštění myší.
    - **Výsledek**: Interakce je plynulá, popup nezmizí okamžitě, což umožňuje pohodlný přesun myši do těla popupu.

- **Změna**: Finální reorganizace Navbaru (Navigace vlevo, Ovládání ve středu).
- **Detail**:
    - **Levá strana**: Přesunuta navigace (Harmonogram a Zakázky) s pevným pořadím.
    - **Střed**: Přesunuty ovládací prvky specifické pro stránku (Toolbar, tlačítko Dnes).
    - **Pravá strana**: Zůstává vyhledávání a systémové nástroje.
- **Oprava**: Doplněn chybějící import cn v TimelineBar.tsx.

- **Změna**: Vizuální zvýraznění kritického nahromadění projektů (Stacking).
- **Detail**:
    - **Detekce překryvu**: V sumárních řádcích (Celkem, Servis) se nyní automaticky vypočítává počet souběžných projektů pro každý den.
    - **Vizuální efekt**: Pokud se v jednom čase překrývají **3 a více projektů**, daná oblast v řádku se razantně ztmaví (gba(0,0,0,0.45)).
    - **Účel**: Okamžitá identifikace kapacitně vytížených období přímo na časové ose bez nutnosti rozbalovat detaily.

## [2026-02-21] - Redesign Detailu Projektu & Procurement Modul
- **Změna**: Kompletní redesign stránky detailu projektu.
- **Detail**:
    - **Původní monolitický page.tsx** (přes 1200 řádků) byl rozdělen do čistých komponent v `src/components/ProjectDetail/`.
    - **Vizuální štýl**: Implementován čistý a kontrastní **Glassmorphism design** (světlý režim, vysoký kontrast, rozostřené pozadí).
    - **Mini Timeline**: Do horní části detailu přidána vizualizace průběhu konkrétní zakázky (výřez z hlavní časové osy) s indikátorem "Dnes".
    - **ProjectDetailHeader**: Nová kompaktní lišta s akčními tlačítky a indikátorem kategorie.
    - **ProjectDetailStats**: Sloučení primárních informací o projektu (Abra ID, Zákazník, Vedoucí, Priorita) do přehledných boxů.
- **Změna**: Nový Procurement modul (Položky k objednání).
- **Detail**:
    - **Databáze**: Vytvořena tabulka `project_items` v Supabase pro sledování komponentů (Příslušenství, Podvozky, Nástavby).
    - **UI**: Interaktivní panel na pravé straně s rychlým přepínáním stavů (K objednání -> Objednáno -> Dodáno) a vazeb (Samostatně, S podvozkem, S nástavbou).
    - **Flexibilita**: Modul zabírá celou pravou stranu pro snadnou správu i při delším seznamu položek.
- **Oprava**: Vyřešen chybějící import ikony `Hash` v detailu projektu, který způsoboval pád buildu.

## [2026-02-21] - Katalog příslušenství a Správa předvoleb
- **Změna**: Implementace globálního katalogu příslušenství.
- **Detail**:
    - **Databáze**: Zavedena tabulka `accessory_catalog` pro uložení standardních i chytrých (Smart) doplňků.
    - **Admin Panel**: Přidána sekce "Katalog příslušenství" do administrace, umožňující plné CRUD operace nad globálními položkami.
    - **Procurement (v2)**: Modul v detailu projektu nyní obsahuje sekci "Katalog příslušenství (Předvolby)", kde lze jedním kliknutím (Yes/No) přidávat nebo odebírat standardní položky k zakázce.
    - **UI**: Použity nové ikony (`Bookmark`, `Smartphone`) a sytější barevné akcenty pro indikaci aktivních prémiových doplňků.
    - **Admin UX**: Přidáno tlačítko "Nastavení katalogu (Admin)" přímo do Procurement modulu v detailu zakázky pro okamžitou změnu globálních předvoleb.
- **Lokalizace**: Sjednocena terminologie – pole v CRM identifikované jako "Datum uzavření" je nyní v celém systému (Gantt, tabulky, detaily) označováno jako **"Zahájení"**, protože reprezentuje start realizace zakázky.
- **Redesign detailu zakázky**: Původní zjednodušená časová osa (tečky na lince) byla nahrazena plnohodnotným **Mini-Gantt diagramem**, který vizuálně odpovídá hlavní časové ose (barevné bloky fází, ikony milníků, mřížka s víkendy a indikátor "Dnes").
- **Sjednocení designu milníků**: Grafický styl milníků z detailu zakázky (čtvercové boxy) byl přenesen i na **hlavní časovou osu**. Barva všech ikon milníků byla nastavena na **černou**.
- **Rozšířené nastavení milníků**: 
    - Do nastavení vzhledu přidán posuvník pro **měřítko čtvercového boxu** milníků (100-200% velikosti ikony).
    - Přidána možnost uživatelsky **měnit barvy stavů** milníků (Hotovo, Zpožděno, Čeká).
    - Knihovna ikon milníků rozšířena o technické symboly: **Blatníky** (Shield), **Plech** (Layers), **Elektro** (Cpu), **Hydraulika** (Waves), **Pily/Stříhání** (Scissors) a další.
- **Vizuální ladění**: 
    - V řádku **"Celkem"** zachováno ztmavování víkendů pro konzistenci s mřížkou.
    - Implementováno progresivní **červené ztmavování** při překryvu více projektů, které se nyní reviduje **pouze pro dny montáže** (žlutá fáze).
    - Přidán ovladač do nastavení: Posuvník **"Intenzita překryvů (Důraz)"** umožňuje uživatelsky nastavit, jak moc mají tyto kritické dny montáže vizuálně "křičet".
