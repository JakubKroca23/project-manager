---
description: Workflow pro aktualizaci paměti a logování
---

# Update Memory Workflow

Tento workflow se spouští po každém dokončeném úkolu:

1. **Log Entry**: Vytvoř nový soubor v `.agent/logs/YYYY-MM-DD_[task-name].md`.
   - Popiš, co bylo změněno.
   - Seznam upravených souborů.
   - Výsledky testování.
2. **Memory Update**: Pokud jde o významnou změnu (architektura, nová knihovna, změna pravidla), aktualizuj `.agent/memory.md`.
3. **Task Completion**: Označ úkol v `task.md` jako hotový.
