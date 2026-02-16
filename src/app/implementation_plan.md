# Implementation Plan - Remove Service (Servis)

## Cíle
Kompletně odstranit veškerou funkcionalitu, odkazy a kód související s "Servisem" (Service) z celé aplikace.

## Kroky

1.  **Odstranění stránky Servis**:
    *   Smazat složku `src/app/servis`.

2.  **Úprava `Navbar.tsx`**:
    *   Odstranit položku "SERVIS" ze submenu "ZAKÁZKY".
    *   Odstranit logiku pro `activeCategory` související se servisem.
    *   Odstranit barvy a styly pro servis.

3.  **Úprava Datových Typů (`src/types/project.ts`)**:
    *   Odstranit `'service'` z `project_type`.
    *   Odstranit pole specifická pro servis (`service_duration`, `milestoneServiceStart`, `milestoneServiceEnd` - pokud jsou definována v typech, zdá se že `service_duration` tam je).

4.  **Úprava `Timeline.tsx` a `Timeline.css`**:
    *   Odstranit stavy a barvy pro servis (`phaseService`, `milestoneServiceStart`, `milestoneServiceEnd`).
    *   Odstranit logiku renderování "servisního řádku" (sticky row pro servis).
    *   Odstranit filtr (checkbox) pro servis.
    *   Odstranit legendu pro servis.

5.  **Úprava `TimelineBar.tsx`** (bude potřeba načíst):
    *   Odstranit logiku specifickou pro zobrazení servisního pruhu.

6.  **Úprava `SideBar.tsx` / `Header.tsx`** (pokud tam jsou odkazy):
    *   Odstranit odkazy na `/servis`.

7.  **Zajištění konzistence**:
    *   Ověřit, že nikde nezbyl "service" string v logice.

## Pozor
*   Smazání typů může způsobit TS chyby v místech, která se snaží s těmito poli pracovat. Budu muset projít a opravit všechna místa (ProjectList, filtry atd.).
*   Databáze: Data v DB (Supabase) zůstanou, ale FE je nebude zobrazovat/používat. Migrace DB není vyžadována, jen FE clean-up.

## Pořadí provádění
1.  Smazat `src/app/servis`.
2.  Upravit `types/project.ts`.
3.  Opravit `Navbar.tsx`.
4.  Opravit `Timeline.tsx` a `Timeline.css`.
5.  Opravit `TimelineBar.tsx`.
6.  Opravit ostatní výskyty.
