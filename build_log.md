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
