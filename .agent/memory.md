# Paměť projektu (Memory)

## Aktuální stav
- Projekt je v aktivním vývoji.
- Základní struktura Next.js a Supabase je nastavena.
- Implementována správa projektů, výroba a **nová Timeline V2**.
- Vyřešeny problémy s 404 chybami u detailu zakázek.
- Existuje funkční generování PDF pro výrobní listy.

## Historie klíčových rozhodnutí
- **2026-02-04**: Inicializace `.agent` struktury a rozsáhlá refaktorizace Timeline.
- **Rozhodnutí (Timeline V2)**: Kompletní přepsání do `src/components/timeline-new`. Použití CSS `linear-gradient` pro mřížku místo stovek DIVů. Přímý fetch z tabulek (bypass views) pro 100% stabilitu dat.
- **Oprava (Next.js 15/16)**: Oprava 404 u dynamických rout (Params must be awaited).
- **Rozhodnutí**: Použití Markdownu pro logování, zavedení striktního TDD pro každou novou funkci.

## Známé problémy / Nedodělky
- Je potřeba zajistit konzistentní logování všech změn.
- Chybí automatizované testy pro klíčové workflow (v plánu v rámci TDD).
