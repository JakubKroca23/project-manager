-- Přidání sloupce priorit do tabulky projektů
ALTER TABLE projects ADD COLUMN IF NOT EXISTS priority SMALLINT DEFAULT 2 CHECK (priority IN (1, 2, 3));

-- Komentáře pro dokumentaci
COMMENT ON COLUMN projects.priority IS 'Priorita zakázky: 1=Urgentní, 2=Normální, 3=Nízká';
