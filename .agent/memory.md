# Historie a paměť projektu

## 2026-02-04: Inicializace a specifikace
- Projekt zahájen s důrazem na efektivitu a TDD.
- Nastavena základní struktura `.agent` složky.
- Definována pravidla pro generování kódu a debugování.
- **Design**: Světlý čistý glassmorphism s logikou přepínání témat přes `ThemeContext`.
- **Navigace**: Timeline nastavena jako úvodní stránka, tabulka projektů přesunuta na `/projekty`.
- **CRM Integrace**: Úspěšně implementováno načítání reálných dat z Raynet CRM v `/projekty`.
- **UI Design**: Aplikován extrémně kompaktní design s fixním Navbarem (přilepeným nahoru, zakulacené spodní rohy) a nezávislým scrollováním datové oblasti tabulky. Odstraněny ikony v tabulce pro maximální informační hustotu.
- **Layout**: Celá aplikace využívá fixní výšku okna s vnitřním scrollováním pro zachování viditelnosti hlaviček.
- **TDD**: Všechny změny probíhají v souladu s Test-Driven Development (plánováno zavedení testů pro resizing).
- **Resizing sloupců**: Implementována "Shift" logika – změna šířky ovlivňuje pouze cílový sloupec, ostatní se posouvají. Použit `requestAnimationFrame` pro plynulost a `localStorage` pro perzistenci. Tabulka využívá `width: max-content`.
- **Navbar Redesign**: Navbar je přilepen k hornímu okraji, má dynamickou šířku `fit-content` a tmavé korporátní pozadí (`#1c1c1c`). Písmo je v verzálkách (uppercase), ikony jsou skryty. Aktivní stav je indikován modrou barvou textu (#0091ff). Profil uživatele "Jakub Kroča" vypadá jako hranaté modré akční tlačítko. Rozměry a centrování zachovány.
- **UI Polishing**: Zvýrazněna hlavička tabulky silnějším modrým bordrem (2px). První sloupec v hlavičce byl upraven na víceřádkový formát ("Předmět" a "Číslo OP") pro lepší přehlednost a shodu s datovými řádky.

## 2026-02-05: Timeline a centralizace dat
- **Datová Architektura**: Vytvořen modul `src/lib/data-utils.ts`, který funguje jako jediný zdroj pravdy pro mapping Raynet exportu. Obsahuje bezpečnou extrakci parametrů (`getVal`) a čištění dat.
- **Timeline Zoom (v3)**: Implementována tříúrovňová logika zoomu (5px / 12px / 28px). 
    - **Adaptivní UI**: Při oddálení se milníky (tečky) mění na svislé linky pro zachování viditelnosti.
    - **Tooltips**: Implementovány nativní tooltips pro interaktivitu v ultra-kompaktním režimu.
    - **Smart Header**: Automatické skrytí popisů dnů při nedostatku místa.
- **Resizing Sloupců (v4)**: Přechod na striktní model založený na `<colgroup>`. Šířky sloupců jsou definovány v procentech nebo pixelech v elementu `<col>`, což zajišťuje nezávislost sousedních sloupců při resizingu. 
    - **Interakce**: Resizing probíhá vůči levému okraji stránky, což zabraňuje „skákání“ obsahu.
    - **Persistence**: Ukládá kompletní pole šířek do `localStorage` under key `projects-column-widths`.
- **Refaktoring Projekty**: Stránka nyní slouží pouze jako čistý wrapper nad komponentou `ProjectList`, přičemž veškerá data jsou dodávána skrze sjednocené mapování v `data-utils.ts`. To umožňuje okamžitou propagaci změn v datech do Timeline i do seznamu projektů.
- **Vizuální Ladění**: Navbar byl zmenšen na `max-width: 900px` pro lepší harmonii s obsahem Timeline a tabulky projektů.
- **Sticky Komponenty**: Timeline využívá pokročilé `sticky` pozicování pro zachování kontextu projektu (levý sloupec) i času (hlavička) při scrollování oběma směry.

## 2026-02-05: Timeline UI refactoring
- **Header Redesign**: Odstraněn nadpis "Timeline 2026" s popiskem a legenda milníků. Hlavička Timeline nyní sdílí vizuální styl s ProjectList pomocí `table-header-actions` layoutu.
- **Search Functionality**: Přidáno vyhledávací pole s ikonou Search z `lucide-react` pro filtrování projektů podle názvu, zákazníka nebo čísla zakázky.
- **Konzistentní UI**: Zoom controls přesunuty doprava, vyhledávání vlevo - stejný pattern jako v ProjectList komponentě.

## 2026-02-10: Supabase Integrace & Excel Import
- **Kompletní Reset**: Původní implementace Časové osy a Projektů byla odstraněna (včetně `casova-osa/page.tsx`, `CustomGantt.tsx`). Aplikace se vrátila do "čistého stavu".
- **Nový Dashboard**: Hlavní stránka (`/`) nyní slouží jako Timeline Dashboard.
- **Supabase Integrace**:
    - **Backend**: Data projektu migrována z lokálního JSONu do Supabase databáze (tabulka `projects`).
    - **Auth**: Implementováno přihlašování přes Supabase Auth (`/login`).
    - **Schema**: Všechna data odpovídají struktuře z Raynet exportu.
- **Excel Import**:
    - Vytvořena komponenta `ExcelImporter` využívající knihovnu `xlsx`.
    - Umožňuje uživatelům nahrát `.xlsx` export z Raynetu přímo v prohlížeči.
    - Data jsou parsována a nahrána do Supabase (Upsert logika).
- **Projekty**:
    - Stránka `/projekty` nyní načítá živá data ze Supabase.
    - Obsahuje tlačítko pro import Excelu.
- **Hotfix**: Odstraněn zastaralý `data-utils.ts` kód závislý na smazaném `raynet_data_3.json`, což opravilo build.

## 2026-02-11: Timeline Servisní Row a Multi-filtry
- **Filtrování projektů**: Implementován systém vícevýběrových checkboxů namísto dropdownu. Umožňuje zobrazení libovolné kombinace typů (Civilní, Armáda, Servis).
- **Design filtrů**: Checkboxy v hlavičce jsou barevně sladěny s typem projektů (Modrá - Civil, Zelená - Military, Indigo - Servis).
- **Servisní řádek (Architecture Change)**: 
    - Všechny servisní výjezdy jsou sjednoceny do **jednoho sticky řádku** v horní části.
    - Řádek má fixní výšku 42px (vyšší než standardní) a indigo design.
    - Implementována průhlednost (`0.75`) pro vizuální zvládnutí překryvů v jednom pruhu.
- **TimelineBar**: Přidána logika pro zobrazení názvu projektu přímo v servisní liště, pokud to její šířka dovoluje.
- **TypeScript**: Opraveny kritické typové chyby v `Timeline.tsx` související se stavem `activeTypes` a výpočtem `serviceLanes`.

## 2026-02-11: Granulární oprávnění a sjednocená barva (Design System)
- **Oprávnění**: Systém rozšířen o granulární správu přístupů (Civil/Armáda/Servis). Administrátor může omezit viditelnost jednotlivých kategorií zakázek v Navbaru i Timeline.
- **Navbar Logika**: Pokud má uživatel zakázán přístup k celým Zakázkám nebo všem jejich podkategoriím, hlavní položka v menu se skryje.
- **Barevný systém (Design System)**: Sjednocena barevná paleta napříč celou aplikací:
    - **Armáda**: Emerald/Green (#a5d6a7)
    - **Servis**: Purple (#ce93d8)
    - **Civil**: Blue (#90caf9)
- **UI Kontinuita**: Detail zakázky nyní obsahuje barevný pruh nahoře signalizující kategorii. Navbar si barvu v detailu pamatuje pomocí asynchronní detekce typu projektu z DB.
- **Login Design**: Modernizován nadpis na "PLÁNOVÁNÍ ZAKÁZEK" s důrazem na čistý korporátní styl.

## 2026-02-12: RBAC a Audit Logging
- **Role-based Access Control (RBAC)**: Detekce administrátora byla oddělena od e-mailové adresy a přesunuta na úroveň databáze (`profiles.role`). Toto umožňuje škálování administrátorského týmu bez zásahu do kódu.
- **Real-time UX**: Implementována synchronizace rolí v reálném čase pomocí Supabase Channels. Změna role se projeví okamžitě i u právě přihlášeného uživatele (např. odemknutí Admin Panelu).
- **Audit Trail (Architektura)**: Zaveden systém automatického logování změn v uživatelských profilech (`user_action_logs`). Logování probíhá na úrovni databáze (triggery), což zajišťuje integritu záznamů i při přímém zásahu do DB.
- **UI Integrace**: Administrační funkce byly plně integrovány do modálního okna "Nastavení", čímž se snížil počet prvků v prvním plánu profilu a zlepšila se navigace pro běžné uživatele.

## 2026-02-12: Placeholder sekce Výroba a Nákup
- **Construction UI**: Zavedena zástupná komponenta `ConstructionSection`, která sjednocuje vzhled rozpracovaných částí aplikace. Obsahuje komplexní CSS animace (levitace ikon, pohyb jeřábu, indikátor průběhu).
- **Routování**: Aktivovány stránky `/vyroba` a `/nakup` s dedikovanými popisy funkcionalit, které se připravují.

## 2026-02-12: Timeline Milestones & UX Refinements
- **Date Handling**: Opraven kritický posun termínů o jeden den. Timeline nyní využívá lokální časové komponenty namísto UTC (`toISOString`), což zajišťuje konzistenci s databází a volbou uživatele.
- **Adaptive Sizing**: Milníky v Timeline mají nyní dynamickou velikost ikon (14px až 26px) založenou na zoomu (`dayWidth`). Tím je zajištěna čitelnost i při zobrazení celého roku.
- **Interaktivní Tooltipy**: Implementována možnost přímé editace všech milníků projektu (Podvozek, Nástavba, Předání, Deadline) skrze tooltip. Změna se okamžitě propisuje do Supabase a reflektuje v grafu.
- **Stacked Layout Architecture**: 
    - Souhrnné řádky v hlavičkách sektorů mají nyní odstraněnou mřížku pro lepší vizuální separaci.
    - Při souběhu více milníků v jeden den se tooltipy v "stacked" řádcích řadí vertikálně pod sebe, aby byly všechny čitelné.
    - Visibility fix: Použití `z-index: 10000` a `overflow: visible` pro kontejner souhrnných řádků zajišťuje, že tooltipy nejsou překryty projekty při scrollování.

## 2026-02-16: Timeline Visual Fixes (Crane & Stacked Rows)
- **Ikony**: Do sady ikon přidána `Crane` (jeřáb) pro specifické vizualizace v Timeline.
- **Stacked Layout Fix**: Opraveno vykreslování souhrnných řádků (hot zones) v hlavičkách sektorů. Původní nastavení pozadí (`var(--background)`) způsobovalo překryv obsahu.
- **Čistota a Přehlednost**: V `TimelineBar.tsx` odstraněno pozadí (`transparent`) pro prvky ve "stacked" režimu.
- **Nápověda a Legenda**: Implementováno modální okno s přehledem ovládání (myš, klávesnice) a vysvětlivkami barev fází i ikon milníků.
- **Milestone Dot Rendering**: Speciální vykreslování pro "Konec montáže" a "Konec revize" (pouze malé tečky) pro vizuální odlehčení grafu.
- **Portal Rendering**: Detailní popup milníku/projektu se nyní vykresluje do `document.body` přes React Portal, což zaručuje jeho viditelnost nad všemi vrstvami (Z-Index fix).

## 2026-02-17: Custom Milestones & UI Polish
- **Milestone Architecture (v2)**: 
    - Přidána podpora pro ikony v tabulce `project_milestones` (sloupec `icon`).
    - Rozšířen Milestone form o interaktivní výběr z 15+ ikon (`lucide-react`).
    - Barvy milníků jsou nyní sémantické: Červená pro rozpracované, Zelená pro hotové.
- **Timeline Popup Logic**:
    - Implementována inteligentní detekce viewportu (`isNearBottom`). Popup se dynamicky otevírá nahoru/dolů, aby nebyl oříznut.
    - Kontejner popupu má nyní definovaný `max-height` a `scroll`, což řeší přetečení u velkého množství ikon nebo dlouhých popisů.
- **Data Clean-up**:
    - Odstraněno pole `body_type` z projektu, jelikož tato data jsou nyní lépe zpracovávána skrze specifické milníky a konfigurace.

## 2026-02-18: Refaktoring terminologie a ovládání Timeline
- **Terminologie**: Provedena globální náhrada 'Manažer' -> 'Vedoucí projektu'.
- **Navigace**: Navbar nyní spolehlivě ukazuje aktivní kategorii i v detailu zakázky.
- **Timeline UX**: Přechod na in-grid ovládání vertikálního zoomu a inline panel nastavení vzhledu.
- **Data Cleanup**: Odstranění méně důležitých polí z primárního pohledu v detailu projektu.
- **Import Wizard Enhancements**: Implementován vizuální výběr hlavičkového řádku z náhledu dat, což řeší problémy s importem souborů obsahujících úvodní prázdné řádky nebo metadata.

## 2026-02-20: Timeline UI - Milestone Modernization
- **Milestone Visual System**: Rozhodnuto o sjednocení všech ikon milníků do černé barvy (#000000) pro maximální čitelnost na různobarevných fázích.
- **Graphic Polish**: Odstraněna záře (glow/drop-shadow) z milníků v CSS, což dává grafu čistší a modernější "flat" design.
- **State Cleanup**: Barevná logika pro milníky byla odstraněna ze stavu komponent a CSS proměnných, čímž se zjednodušila architektura barev v Timeline.

## 2026-02-21: Timeline Header & Sidebar Polish
- **UI Architecture**: Merged day numbers and names into the sticky 'CELKEM' (Total) summary row, reducing the header's total height and saving vertical space.
- **Visual Design**: 
    - Implemented a white text-shadow outline for day numbers/names to ensure readability over colored bars.
    - Updated 'Today' indicator to a 4px red border around the header cell with a glow effect.
    - Adjusted the vertical 'Today' line to start below the header (z-index 1500) so it doesn't overlap header text or the sticky sidebar.
- **Sidebar (Project Info)**: 
    - Implemented a dynamic display in the project sidebar.
    - Now shows `OP-{ID}`, `Customer Name`, `Project Name`, and `Manager` depending on the current row height.
    - Prioritizes `OP` and `Customer` in compact views.
- **Layout Adjustments**: 
    - Increased 'CELKEM' row height to 29px and 'SERVIS' to 40px to better accommodate content and stacked objects.
    - Updated `handleFitVertical` to include these new fixed heights in available space calculations.

## 2026-02-21: Navbar Redesign & Global Toolbar Injection
- **Architecture (Injectable UI)**: Implemented a 'Global Toolbar' pattern. Pages can now inject their context-specific actions (e.g., table controls, creation buttons) directly into the main Navbar using the `ActionProvider`'s `customToolbar` state. This centralizes global actions and declutters the main content area.
- **Navbar UX**: Moved the active category label (e.g., CIVIL, SERVICE) to the right side of the main "ZAKÁZKY" button. This layout change provides a more streamlined header and clearer visual hierarchy.
- **Milestone Design (v3 - "Extraction")**: 
    - Completely removed the circular background from milestones.
    - Implemented a "shape-outline" effect using multiple `drop-shadow` CSS filters. The outline follows the exact SVG path of the icon.
    - **Semantic Bordering**: The outline color dynamically reflects the milestone status: White (Default/Planned), Green (Delivered/Completed), and Red (Overdue). This allows for rapid project health assessment directly from the chart.

## 2026-02-21: Final UI Reorganization & Density Indicators
- **Navbar Layout (Final)**: 
    - **Navigation Left**: "HARMONOGRAM" and "ZAKÁZKY" are now fixed on the left side of the Navbar for consistent navigation.
    - **Controls Center**: Page-specific tools (Toolbar injection and "Today" button) are centered, making them the focal point for interactive actions.
    - **Search/System Right**: Search and system-wide settings remain on the right.
- **Timeline UX Polish**:
    - **Milestone Popups**: Added premium slide-in animations (sliding from the icon). Implemented a 150ms "grace period" on mouse-leave to prevent accidental closing, making the interface more robust and accessible.
    - **Stacking Density Indicator**: In high-density areas (where 3+ projects overlap in a summary row), a drastically darker background (`rgba(0,0,0,0.4)`) is applied. This "heatmaps" capacity bottlenecks directly in the collapsed view.
- **Maintenance**: Fixed a code-integrity issue in `TimelineBar.tsx` by adding the missing `cn` utility import.