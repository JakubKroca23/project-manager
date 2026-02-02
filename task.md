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
- [x] [Verify] Timeline fixes (previous task)

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

# Timeline 2.0 (Interactive Gantt)

- [x] Clarify requirements with User
- [x] Design Component Architecture (Sidebar + Scrollable Area)
- [x] Implement `useTimelineZoom` (numeric zoom level)
- [x] Create `TimelineHeader` (Months -> Weeks -> Days based on zoom)
- [x] Create `TimelineSidebar` (Project/Service list)
- [x] Create `TimelineGrid` (The rendered bars)
- [x] Implement smooth interaction (Wheel zoom, Drag scroll)
- [x] Visual Polish: Transparent BG, Extended Range (365d), Dynamic Header
- [x] Implement 3-state Zoom controls (Day/Week/Month)
- [x] Visual Enhancements: Weekends, Current Day, Month Separators
- [x] Final Polish: Start from Jan 1st, Smaller text, Show days in Week view
- [x] Implement Drag & Drop (Change dates via UI)
- [x] Refine Zoom: Continuous Slider + 3-Row Header (Stacking)
- [x] Fix Layout Sync: Header height mismatches fixed
- [x] Fix Interaction: Click now opens project detail
- [x] Visual Contrast: Enhance Month/Week/Day headers and Grid lines
- [x] Timeline Interactions: Resize (Handles), Square Corners, Smoother Drag
