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
