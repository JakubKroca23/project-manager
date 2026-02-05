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
    - **Persistence**: Ukládá kompletní pole šířek do `localStorage` pod klíčem `projects-column-widths`.
- **Refaktoring Projekty**: Stránka nyní slouží pouze jako čistý wrapper nad komponentou `ProjectList`, přičemž veškerá data jsou dodávána skrze sjednocené mapování v `data-utils.ts`. To umožňuje okamžitou propagaci změn v datech do Timeline i do seznamu projektů.
- **Vizuální Ladění**: Navbar byl zmenšen na `max-width: 900px` pro lepší harmonii s obsahem Timeline a tabulky projektů.
- **Sticky Komponenty**: Timeline využívá pokročilé `sticky` pozicování pro zachování kontextu projektu (levý sloupec) i času (hlavička) při scrollování oběma směry.

## 2026-02-05: Timeline UI refactoring
- **Header Redesign**: Odstraněn nadpis "Timeline 2026" s popiskem a legenda milníků. Hlavička Timeline nyní sdílí vizuální styl s ProjectList pomocí `table-header-actions` layoutu.
- **Search Functionality**: Přidáno vyhledávací pole s ikonou Search z `lucide-react` pro filtrování projektů podle názvu, zákazníka nebo čísla zakázky.
- **Konzistentní UI**: Zoom controls přesunuty doprava, vyhledávání vlevo - stejný pattern jako v ProjectList komponentě.
