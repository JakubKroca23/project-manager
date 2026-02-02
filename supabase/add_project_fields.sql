-- SQL k přidání nových polí do tabulky projects
ALTER TABLE projects 
ADD COLUMN chassis_type TEXT,
ADD COLUMN manufacturer TEXT,
ADD COLUMN superstructure_type TEXT,
ADD COLUMN accessories TEXT;
