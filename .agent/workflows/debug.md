---
description: Postup pro efektivní opravu chyb a debugování
---
1. **Analýza chyby**: Přečti si chybovou hlášku a logy. Identifikuj soubor a řádek.
2. **Reprodukce**: Vytvoř TDD test v `tests/debug_[bug_name].test.ts`, který chybu reprodukuje.
// turbo
3. **Spuštění testu**: Ověř, že test selže (`npm test`).
4. **Oprava**: Navrhni a implementuj opravu v kódu.
5. **Ověření**: Spusť znovu testy. Pokud projdou, pokračuj.
6. **Logování**: Zapiš chybu a řešení do `build_log.md`.
7. **Refaktor**: Pokud je potřeba, pročisti kód a aktualizuj `.agent/memory.md`.
