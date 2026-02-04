# Pravidla projektu Project Manager

## Základní principy
- **TDD (Test-Driven Development)**: Vždy začni testem. Kód piš až po selhání testu.
- **SOLID**: Dodržuj principy Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation a Dependency Inversion.
- **DRY & KISS**: Neopakuj se a udržuj věci jednoduché.
- **Clean Code**: Piš čitelný a samovysvětlující kód.

## Pracovní postup (Workflow)
1. **Plánování**: Každý úkol musí mít `implementation_plan.md`.
2. **Implementace**: Postupuj podle TDD cyklu (Red-Green-Refactor).
3. **Logování**: Veškeré změny a chyby musí být zaznamenány v `build_log.md`.
4. **Memory**: Po každém významném kroku aktualizuj `.agent/memory.md`.

## Standardy kódu
- Používej moderní TypeScript (pokud se jedná o webovou aplikaci).
- Chybové stavy řeš robustně a loguj (např. `logger.error`).
- Pokud děláš změny v existujícím souboru, přečti si ho celý, aby jsi zachoval kontext.

## Debugování
- Při výskytu chyby nejdříve vytvoř test, který chybu reprodukuje.
- Oprav chybu a ověř, že testy procházejí.
- Zdokumentuj příčinu a řešení v logu.
