# Implementační plán - Oprava Kategorie a Smart TechSpec v detailu zakázky

Tento plán řeší nefunkční výběr kategorie a nefunkční inteligentní extrakci modelu v pravém bočním panelu detailu zakázky.

## Problém
1. **Špatné handlery v `TechSpecSection`**: Pole `category`, `body_setup` a `serial_number` jsou v komponentě `TechSpecSection` aktualizována pomocí `handleCustomFieldChange`. Tato pole jsou však v db/interfaci `Project` na nejvyšší úrovni (top-level), nikoliv v `custom_fields`. To způsobuje, že se změny neprojeví v hlavním objektu projektu a `useEffect` pro extrakci modelu pracuje se starými daty.
2. **Priorita kategorií v `extractModelDesignation`**: Pokud má zakázka kombinovanou kategorii (např. "HIAB + MULTILIFT"), systém zkusí pouze jednu a pokud selže, vrátí `null` bez kontroly druhé možnosti.
3. **Chybějící `onChange` prop**: `TechSpecSection` postrádá přístup k hlavnímu handleru `handleChange` pro top-level pole.

## Navržené řešení

### 1. Úprava `src/lib/utils.ts`
- Upravit `extractModelDesignation` tak, aby nekončil s `null` okamžitě po selhání první nalezené kategorie v řetězci, ale zkusil všechny relevantní regexy.

### 2. Úprava `src/components/project-detail/TechSpecSection.tsx`
- Rozšířit props o `onChange` (odpovídající `handleChange` z hooku).
- Zaměnit `handleCustomFieldChange` za `onChange` u polí: `category`, `body_setup`, `serial_number`.
- Ponechat `handleCustomFieldChange` u polí, která jsou skutečně v `custom_fields` (`trailerwin_done`, `drawings_done`, `body_accessories`, `chassis_accessories`).

### 3. Úprava `src/app/projekty/[id]/page.tsx`
- Předat `handleChange` do `TechSpecSection` jako prop `onChange`.

### 4. (Volitelné) Synchronizace s PageHeader
- Doplnit "Sparkles" logiku (návrhy) i do `PageHeader.tsx` pro pole "Typové označení", aby byl zážitek konzistentní napříč stránkou.

## Kontrola (TDD)
- Vytvořit/aktualizovat test pro `TechSpecSection`, který ověří, že změna kategorie vyvolá správný handler a spustí novou extrakci modelu.

## Build Log & Memory
- Zapsat změny do `build_log.md` a `.agent/memory.md`.
