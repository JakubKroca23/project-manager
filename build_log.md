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
- **Změna**: Sjednocení hlavičky Timeline se stylem ProjectList.
- **Detail**: Přidáno vyhledávací pole s ikonou Search (z `lucide-react`) a filtrování projektů. Zoom controls přesunuty doprava. Použitý layout `table-header-actions` pro konzistentní vzhled.

## [2026-02-06] - UI Polishing
- **Změna**: Úprava podbarvení víkendů v Timeline.
- **Detail**: Změna barvy sloupců `.weekend-col` z poloprůhledné na neprůhlednou `#e2e8f0` v `globals.css` pro lepší čitelnost.

## [2026-02-11] - Časová osa: Servisní řádek a pokročilé filtry
- **Změna**: Implementace multi-výběrového filtrování projektů.
- **Detail**: Původní přepínač nahrazen barevnými checkboxy (Civilní - modrá, Armáda - zelená, Servis - indigo), které umožňují kombinovat filtry.
- **Změna**: Redesign servisního řádku.
- **Detail**: Všechny servisní výjezdy sjednoceny do jediného řádku v horní části časové osy. Řádek je nyní `sticky` (fixovaný) s výškou 42px, má indigo ohraničení (3px) a skleněný efekt (blur).
- **Změna**: Vylepšení překryvů servisů.
- **Detail**: Servisní fáze mají nyní průhlednost (`0.75`), aby byly viditelné i při souběhu více výjezdů v jednom řádku.
- **Změna**: Oprava TypeScript chyb.
- **Detail**: Vyřešeny typové chyby u `toggleType` a `serviceLanes` v `Timeline.tsx`.

## [2026-02-11] - Rozšířená oprávnění a sjednocení vizuálu
- **Změna**: Implementace granulárních oprávnění pro sekci ZAKÁZKY.
- **Detail**: Do profilu uživatele přidána možnost spravovat přístup k sub-kategoriím (Civilní, Armádní, Servis). Sekce ZAKÁZKY v Navbar se automaticky skryje, pokud uživatel nemá přístup ani k jedné podkategorii.
- **Změna**: Inteligentní Navbar a vizuální kontinuita.
- **Detail**: Navbar nyní detekuje typ projektu v detailu a zvýrazňuje správnou kategorii i bez URL parametrů. V detailu projektu přidán horní barevný pruh odpovídající kategorii.
- **Změna**: Sjednocení barevné palety napříč aplikací.
- **Detail**: Barvy v Timeline (sektory, fáze, milníky) byly sjednoceny s barvami v Navbaru a Login stránce (Military: #a5d6a7, Service: #ce93d8, Civil: #90caf9).
- **Změna**: Redesign Login stránky.
- **Login Design**: Modernizován nadpis na "PLÁNOVÁNÍ ZAKÁZEK" s důrazem na čistý korporátní styl.

## 2026-02-11 (22:45): Refaktoring UI a Admin Panelu
- **Vizuální konzistence**: Barvy kategorií (Armáda: #a5d6a7, Servis: #ce93d8, Civil: #90caf9) se nyní propisují i do řádků tabulky projektů (jemné pozadí) a do ovládacích prvků v detailu zakázky.
- **Architektura Profilu**: Admin Panel byl oddělen od uživatelského nastavení (Vzhled, Heslo) do samostatného modulu/popupu, což zjednodušuje UI pro běžné uživatele i administrátory.
- **DataTable**: Komponenta rozšířena o props `getRowClassName` pro flexibilní styling řádků na základě dat.

## [2026-02-11] - Refaktoring profilu a sjednocení tabulek
- **Změna**: Vizuální sjednocení seznamu zakázek.
- **Detail**: Řádky v tabulce projektů jsou nyní podbarveny podle kategorie (Zelená - Armáda, Fialová - Servis, Modrá - Civil), což usnadňuje orientaci v seznamu.
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
- **Detail**: Nastaven `z-index: 10000` a `overflow: visible` pro souhrnné řádky, čímž bylo vyřešeno schovávání tooltipů pod zakázkami.

## [2026-02-12] - Implementace sekcí Výroba a Nákup
- **Nové stránky**: Vytvořeny routy `/vyroba` a `/nakup`.
- **UI Komponenta**: Vytvořena `ConstructionSection.tsx` pro elegantní "Under Construction" stavy.
- **Vizuální styl**: Implementována "výstavbová animace" pomocí CSS keyframes (float, swing, lift) a ikon `lucide-react`.
- **Konzistence**: Sekce jsou plně integrovány do Navbaru a respektují oprávnění uživatele.
