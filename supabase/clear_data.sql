-- DANGER: This script will DELETE ALL DATA and DROP TABLES for Projects, Production, and Services.
-- It preserves the 'profiles' (users) table.

-- 1. Drop Views
DROP VIEW IF EXISTS timeline_items;

-- 2. Drop Tables (Order matters because of foreign keys)

-- Level 3 (Dependencies of dependencies)
DROP TABLE IF EXISTS manufacturing_tasks;
DROP TABLE IF EXISTS project_history;
DROP TABLE IF EXISTS bom_items;

-- Level 2 (Dependencies of Projects/Profiles)
DROP TABLE IF EXISTS production_orders;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS accessories_catalog; -- Mentioned in schema analysis

-- Level 1 (Main entities)
DROP TABLE IF EXISTS projects;

-- Note: We are NOT dropping 'profiles' (users) or 'auth.users'.
