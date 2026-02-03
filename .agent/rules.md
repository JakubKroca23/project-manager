# Pravidla projektu (Rules)

## Základní principy
- **Vždy mluv česky.**
- **TDD FIRST**: Ke každé nové funkci nebo opravě bugu MUSÍ existovat test. Implementace bez testu je považována za nekompletní.
- **SOLID & DRY**: Dodržuj principy čistého kódu.
- **KISS**: Vyhýbej se over-engineeringu.
- **Bezpečnost**: Nikdy nespouštěj destruktivní příkazy.

## Proces vývoje
1. **Analýza & Plán**: Před každou větší změnou vytvoř/aktualizuj `implementation_plan.md`.
2. **Doplňující otázky**: Po vytvoření plánu se VŽDY zeptej na 3 doplňující otázky.
3. **TDD Cyklus**:
   - Napiš test, který selže.
   - Implementuj kód.
   - Ověř, že test projde.
4. **Logování & Paměť**: Po každém dokončeném úkolu aktualizuj `.agent/memory.md` a zapiš detailní log do `.agent/logs/`.

## Technologická pravidla
- **Framework**: Next.js (App Router).
- **TypeScript**: Striktní typování, žádné `any`. Každý export musí mít definované typy.
- **Styling**: Tailwind CSS 4.
- **UI & Logika**: Odděluj UI komponenty od byznys logiky.

## Debugování
- Než začneš opravovat chybu, proveď hloubkovou analýzu příčiny.
- Používej workflow v `.agent/workflows/debug.md`.
- Všechny pokusy o opravu a jejich výsledky musí být protokolovány v logu.
