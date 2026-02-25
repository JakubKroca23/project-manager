# Implementation Plan - Sjednocení ikon v ose harmonogramu (Project Detail)

Sjednotit ikony v komponentě `ProjectTimelineFlat` (detail zakázky) s hlavní časovou osou, zejména ikonu pro "Nástavbu".

## User Review Required

> [!IMPORTANT]
> Ikony v detailu zakázky jsou nyní zobrazeny v barevných kruzích (v3 design). Tato úprava zachovává tento styl, ale mění samotné tvary ikon.

- Mají se sjednotit i ostatní ikony (Předání -> ThumbsUp, Zahájení -> Zap)? (V tomto plánu předpokládám sjednocení všech klíčových milníků pro konzistenci).

## Proposed Changes

### 1. `src/components/project-detail/ProjectTimelineFlat.tsx`

- Přidat definici komponenty `HiabIcon` (SVG převzaté z `Timeline.tsx`).
- Aktualizovat `ICON_MAP` tak, aby obsahoval:
    - `start`: `Play` -> `Zap`
    - `body`: `Factory` -> `HiabIcon`
    - `mounting_end`: `Wrench` -> `Package`
    - `revision_end`: `Shield` -> `Factory`
    - `handover`: `Check` -> `ThumbsUp`
- Importovat chybějící ikony z `lucide-react`.

## Verification Plan

### Manual Verification
1. Otevřít detail libovolné zakázky.
2. Zkontrolovat osu "Harmonogram realizace".
3. Ověřit, že ikona "Nástavba" odpovídá ikoně jeřábu (Hiab) z hlavní Timeline.
4. Ověřit, že ostatní ikony (Příjem, Montáž, atd.) jsou konzistentní s hlavní Timeline.
