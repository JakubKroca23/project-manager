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
- [x] Fix: Resize/Drag interaction conflict (ghost transform)
- [x] Controls: Add +/- Zoom Buttons and fix "jumping" behavior
- [x] Interaction: Enforce strict "Snap-to-Day" logic for drag/resize
- [x] Navigation: Move detail click to Sidebar (Name) instead of Bar

- [x] [Verify] Timeline full-height grid lines

# Manufacturing System Implementation

- [x] Requirements & Planning
    - [x] Clarify scope and data model with User
    - [x] Design database schema for Orders, Tasks, and Catalogs
    - [x] Create Implementation Plan
- [x] Database Implementation (Catalogs & Manufacturing)
    - [x] Verify/Create `clients`, `superstructures`, `accessories` catalogs
    - [x] Create `production_orders` table (already in schema)
    - [x] Create `manufacturing_tasks` table (with statuses: Queue, In Progress, Done, Check)
    - [x] Create `bom_items` table (for material lists)
- [x] UI Implementation - Catalogs
    - [x] Ensure CRM functionality allows managing Clients/Superstructures/Accessories
- [x] UI Implementation - Production Orders
    - [x] "Generate Order from Project" Action  (split by quantity)
    - [x] Order Detail View (Status, Deadlines, BOM)
    - [x] PDF Generation for Order (Job Cards)
- [x] UI Implementation - Shop Floor (Tasks)
    - [x] Task Dashboard (Kanban/List) for workers (Implemented via Detail/Dashboard)
    - [x] Task Status Transitions

# Timeline Layout Refactor (FullScreen)

- [x] Requirements & Planning (FullScreen vs Controls)
- [x] Implement Full-Viewport layout in `app/timeline/page.tsx`
- [x] Remove header and zoom controls in `timeline-view.tsx`
- [x] Remove container styling (borders, rounded corners) in `timeline-layout.tsx`
- [x] Adjust Sidebar/Grid proportions for fullscreen view
- [x] Verification on different resolutions
- [x] Refine zoom controls (horizontal, smaller)
- [x] Implement mouse panning (drag & drop interaction)

# Timeline Fullscreen Toggle

- [x] Requirements & Planning (Shared state for Navbar/Timeline)
- [x] Implement `isFullscreen` state in `TimelineProvider`
- [x] Re-introduce header and container styling for standard mode
- [x] Implement Fullscreen button (Toggle Navbar + Viewport expansion)
- [x] Ensure persistence or clean transition between modes

# Timeline Fullscreen & Vertical Height Fixes
- [x] Fix `TimelineGrid` height to fill vertical space even with few items
- [x] Ensure `isFullscreen` correctly bypasses all parent constraints (RootLayout paddings etc.)
- [x] Verify sidebar border-r extends to the bottom
- [x] Final verification of "az dolu" requirement

# Job Card PDF Generation
- [x] Install `@react-pdf/renderer`
- [x] Create `PdfDocument` component (Layout, Styles)
- [x] Create `PdfDownloadButton` component
- [x] Integrate into Production Order Detail Page
- [x] Verify PDF content (Tasks, BOM, No Prices)

# UI Refinements & Fixes
- [x] Dashboard: Display logged-in user's name
- [x] TopBar: Add User Settings & Logout (Dropdown)
- [x] TopBar: Fix mobile navigation (Hamburger Menu)
- [x] Layout: Hide TopBar on Login/Signup pages (AppShell)
