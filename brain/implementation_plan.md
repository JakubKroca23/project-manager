# Implementation Plan - Redesign Detailu Zakázky & Správa Objednávek (Procurement)

Tento plán popisuje "překopání" detailu zakázky pro dosažení maximální přehlednosti a přidání modulu pro správu objednávek příslušenství a komponentů.

## Cíl
- Zjednodušit a zpřehlednit detail zakázky.
- Umožnit vedoucímu projektu definovat, co je potřeba objednat (podvozek, nástavba, doplňky).
- Sledovat stav objednání (K objednání, Objednáno, Dodáno) a vazbu (součást podvozku/nástavby).
- Zachovat "as simple as possible" intuitivní ovládání.

## 1. Databázová úroveň (Supabase)
Vytvoříme tabulku `project_items` pro detailní sledování komponentů.

```sql
CREATE TABLE public.project_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Příslušenství', -- Podvozek, Nástavba, Příslušenství, Smart
  status TEXT DEFAULT 'K objednání', -- K objednání, Objednáno, Dodáno
  source TEXT DEFAULT 'Samostatně', -- Samostatně, S podvozkem, S nástavbou
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.project_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for auth users" ON public.project_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

## 2. Architektura komponent
Rozdělíme obří soubor `src/app/projekty/[id]/page.tsx` na menší, znovupoužitelné části v `src/components/ProjectDetail/`.

- `ProjectDetailHeader.tsx`: ID, Název, Status, Kategorie, Hlavní akce (Edit/Save).
- `ProjectDetailStats.tsx`: Rychlé info (Zákazník, Manažer, Abra ID, Priorita).
- `ProjectDetailMilestones.tsx`: Správa milníků a termínů.
- `ProjectDetailOrdering.tsx`: Nový modul pro správu komponentů (Položky k objednání).
- `ProjectDetailSpecs.tsx`: Technická specifikace a dokumentace (překlopení z textu na strukturovanější formát).

## 3. UI/UX Návrh (Redesign)
- **Kompaktní Header**: Minimalistický pruh s barevnou indikací typu projektu.
- **Dvousloupcový layout**:
    - **Levý sloupec (Základní)**: Hlavní metadata, Termíny, Milníky.
    - **Pravý sloupec (Aktivní)**: **NÁKUPNÍ SEZNAM / POLOŽKY** (stěžejní část).
- **Ordering Module**:
    - Čistý seznam položek s ikonami (Podvozek - Truck, Nástavba - Box, Příslušenství - Zap).
    - Statusy: "K objednání" (žlutá), "Objednáno" (modrá), "Dodáno" (zelená).
    - Zdroj: "Samostatně", "S podvozkem", "S nástavbou" (pomáhá určit, kdo to dodá).
    - Inline editace a "Quick add" pole.

## 4. Postup implementace (Workflow)

### Krok 1: Příprava DB & Typy
- Spustit SQL migraci.
- Aktualizovat `src/types/project.ts` o nový typ `ProjectItem`.

### Krok 2: Nová struktura & Refaktoring
- Vytvořit moduly v `src/components/ProjectDetail/`.
- Přesunout stávající logiku z `page.tsx` do těchto modulů.
- Upravit `page.tsx`, aby sloužil pouze jako hlavní layout a orchestrátor dat.

### Krok 3: Implementace "ProjectDetailOrdering"
- Vytvořit UI pro nákupní seznam.
- Implementovat logiku pro CRUD operace se záznamy nákupu.
- Přidat "simple" přepínače pro stavy a vazby.

### Krok 4: Vizualizace & Polish
- Přidat animace, zpětnou vazbu (loading stavy).
- Sjednotit s vizuálním stylem Timeline (Glassmorphism).

## 5. TDD (Testing)
- Vytvořit test pro `ProjectDetailOrdering` - ověření, že změna stavu se propíše do DB.

## 6. Schválení
Po schválení tohoto plánu začnu s Krokem 1.
