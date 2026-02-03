---
description: Workflow pro systematické hledání a opravu chyb
---

# Debugging Workflow

1. **Reproduction**: Pokus se chybu reprodukovat. Pokud je to možné, vytvoř test, který selže.
2. **Analysis**: 
   - Přečti si chybovou hlášku a stack trace.
   - Identifikuj příslušný kód.
   - Použij `grep_search` a `view_code_item` pro zjištění kontextu.
3. **Hypothesis**: Formuluj hypotézu o příčině chyby.
4. **Verification**: Ověř hypotézu (např. pomocí logů v kódu nebo dočasných změn).
5. **Fix**: Implementuj opravu.
6. **Confirmation**: Spusť testy. Pokud chyběly, dopiš je.
7. **Documentation**: Zapiš chybu a způsob opravy do `.agent/logs/` a pokud je systémová, i do `.agent/memory.md`.
