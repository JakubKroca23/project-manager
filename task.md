# Enhancing Project Management and Fixing Deletion

- [x] Create `project_history` table and RLS policies
- [x] Fix `deleteProject` action and ensure cascading deletes
- [x] Implement `logProjectHistory` utility function
- [x] Update actions to log history (create, update, delete)
- [x] Update `ProjectsClient` to show more columns (status, client, dates)
- [x] Enhance `CreateProjectModal` (better UI, interactivity)
- [x] Enhance `UpdateProjectModal` (better UI, interactivity)
- [x] Add "History" view to Project Detail page
- [x] Verify deletion and history logging

# CRM Field Expansion & Refactoring

- [x] Create `crm_schema.sql` (clients, superstructures, projects columns)
- [x] Implement `clients` and `superstructure_catalog` logic (hooks/actions)
- [x] Refactor `projects` actions to handle new fields
- [x] Refactor `CreateProjectModal`:
    - [x] Implement Client Autocomplete
    - [x] Implement Superstructure Autocomplete
    - [x] Add all new CRM fields
    - [x] Reorganize layout (Chassis vs General)
    - [x] Add detailed forms for Superstructures/Accessories
- [x] Refactor `UpdateProjectModal` with new fields
- [x] Update `ProjectDetailClient` to display new fields

# Timeline Improvements

- [x] Fix zooming functionality (Day/Week/Month support)
- [x] Improve project name visibility on timeline bars
