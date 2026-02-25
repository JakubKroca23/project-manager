# Technická Mechanika Systému (Unor 2026)

Tento dokument slouží jako technická reference pro klíčové komponenty detailu projektu.

## 1. ProjectTimelineFlat (Plochá vizualizace času)
Nahradila komponentu `ProjectTimelineMini`. Je navržena pro maximální stabilitu a čitelnost bez scrollování.

### Klíčové principy:
- **Sběr dat**: Automaticky agreguje data z top-level polí zakázky (`start_at`, `chassis_delivery`, `body_delivery`, `customer_handover`, `deadline`) a všech přidružených milníků.
- **Algoritmus rozestupů (MIN_GAP)**: 
    - Nastaven na **12 %**. 
    - Pokud jsou dva body v čase příliš blízko, aktuální bod je posunut dopředu o minimální mezeru.
    - Následně probíhá **renormalizace** celého pole (poměrové smrštění zpět do 0-100 %), aby poslední bod vždy končil na 100 % šířky čáry.
- **Zig-Zag Labeling**: 
    - Popisky milníků se střídají (sudý index = nahoru, lichý index = dolů).
    - Zdvojnásobuje vertikální prostor pro texty a zabraňuje překrývání názvů.
- **Kontrast**: Vynucené černé datumy (`text-black`) a syté barvy bodů pro čitelnost na různobarevném pozadí.

## 2. TechSpecSection (Technická specifikace)
Komplexní komponenta spravující technická data, dokumentaci a výbavu.

### Systém nástaveb (Multi-body):
- Podporuje pole objektů `bodies` v `custom_fields`.
- **Migrace**: Při načtení starší zakázky automaticky migruje původní plochá data (`category`, `body_type`, `serial_number`) do prvního prvku pole `bodies`.
- **Provázanost**: První nástavba v poli je synchronizována s top-level poli zakázky pro zachování kompatibility se systémovými filtry.

### Správa dokumentace:
- **Trailerwin (.trw)** a **Výkres sestavy (PDF)**.
- Integrace se Supabase Storage (`drawings` bucket).
- Používá podepsané URL (signed URLs) s platností 1 rok pro bezpečný přístup.

### Smart Model Pre-fill:
- Využívá `extractModelDesignation` (Regex-based utility).
- V editačním módu nabízí tlačítko `Sparkles` pro okamžité doplnění typu stroje z názvu zakázky (např. rozpozná "MULTILIFT ULTIMA 21Z59" -> "ULTIMA 21Z59").

### Příslušenství a výbava:
- **Data Structure**: Objekt v `custom_fields.accessories`, kde klíčem je ID příslušenství a hodnotou objekt s detaily.
- **Atributy**: Každá položka má Zdroj (Podvozek/Nástavba/...), Výrobce, Označení a Počet.
- **UI Logic**: V editačním módu kliknutím na položku rozbalíte její detailní nastavení, v náhledovém módu se zobrazí pouze vybrané položky jako kompaktní řádky.

## 3. Komunikace a Eventy
- **`projects-updated` event**: Používá se pro globální notifikaci o změně dat projektu. Při zachycení tohoto eventu detail projektu automaticky refetchuje živá data ze Supabase, což zajišťuje okamžitou aktualizaci grafických komponent (jako je plochá časová osa) po změně v technické specifikaci.
