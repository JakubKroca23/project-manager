-- SQL k přidání pole quantity (počet) do tabulky projects
ALTER TABLE projects 
ADD COLUMN quantity INTEGER DEFAULT 1;
