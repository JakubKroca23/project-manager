# Aktuální stav práce: Redesign detailu projektu (25. 2. 2026)

## 🏁 Hotovo
- Kompletní redesign detailu projektu do stylu **"Popis zakázky"** (technický list).
- Implementována **AccessoriesTable** s interaktivní editací (přidávání/mazání řádků).
- Integrována vizuální osa **ProjectTimelineFlat** přímo do dokumentu.
- Přidána funkce **Tisku do PDF** s dedikovanou lištou prohlížeče.
- Modernizovány všechny komponenty (Section, SimpleMemo, FieldGrid) do "executive" stylu.

## 📝 Čekající otázky (pro pokračování na jiném PC)
Při příštím spuštění se uživatele zeptej na tyto 3 otázky:

1. **Výchozí hodnoty:** Přejete si, aby se při vytvoření zcela nové zakázky do tabulky příslušenství automaticky předvyplnil nějaký standardní seznam (např. "Blatníky", "Zábrany", "Čerpadlo") jako šablona?
2. **Oprávnění:** Má mít možnost editovat tyto technické detaily (příslušenství a milníky) kdokoli s přístupem, nebo to chcete omezit pouze na administrátory a vedoucího dané zakázky?
3. **Další sekce:** Chybí v tomto novém technickém listu ještě nějaká specifická sekce, kterou běžně v papírové dokumentaci používáte (např. "Revizní zprávy", "Předávací protokol" nebo "Fotodokumentace")?

## 🚀 Další kroky
- Implementace šablon pro příslušenství (podle odpovědi na ot. 1).
- Nastavení RBAC oprávnění pro technická pole (podle odpovědi na ot. 2).
- Finalizace dokumentních sekcí (podle odpovědi na ot. 3).
