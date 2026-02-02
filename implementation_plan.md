# Manufacturing System Implementation Plan

## Goal
Implement a complete manufacturing system allowing the creation of Production Orders from Projects, tracking manufacturing tasks, and managing Bill of Materials (BOM).

## User Review Required
> [!IMPORTANT]
> **Data Model Decisions:**
> 1. **Multiple Orders per Project**: If a Project has `quantity: 3`, we will generate 3 separate `production_orders` (e.g., "Project X - #1", "Project X - #2").
> 2. **BOM Scope**: Bill of Materials will be linked to the **Project**. This acts as the "Purchase List" for the whole batch.
> 3. **Tasks**: Manufacturing Tasks can be standardized (e.g., "Mounting", "Hydraulics", "Testing") and generated for each Order.

## Proposed Changes

### Database Schema (`supabase/manufacturing_schema.sql`)
#### [NEW] `accessories_catalog`
- `id`, `name`, `category`, `description`

#### [NEW] `manufacturing_tasks`
- `id`, `order_id` (FK to production_orders), `title`, `status` (queue, in_progress, done, check), `assigned_to` (for workers)

#### [NEW] `bom_items`
- `id`, `project_id` (FK to projects), `name`, `quantity`, `unit`, `status` (to_order, ordered, in_stock), `is_custom` (boolean)

#### [MODIFY] `production_orders`
- Ensure it has `status`, `start_date`, `end_date`, `assigned_to`.
- (Already exists in `schema.sql`, will check if updates are needed).

### UI Implementation

#### [NEW] Catalogs Page (`/dashboard/catalogs`)
- Tabs for "Clients", "Superstructures", "Accessories".
- CRUD operations for each.

#### [MODIFY] Project Detail Page (`/dashboard/projects/[id]`)
- **Action**: "Generate Manufacturing Orders"
    - Visible if `status` is approved/signed.
    - Creates N records in `production_orders`.
- **Tab**: "BOM / Material"
    - Add/Edit items to purchase.
    - "Generate from Superstructure" (future intelligent feature).

#### [NEW] Production Dashboard (`/dashboard/production`)
- **Kanban Board** for `production_orders` (Overview).
- **Task View** for Workers:
    - List of tasks assigned to me or in "Queue".
    - Click to change status (Queue -> In Progress -> Done).

## Verification Plan

### Automated Tests
- None currently set up. Will verify via Manual Verification.

### Manual Verification
1.  **Catalog Management**:
    - Go to `/dashboard/catalogs`.
    - Create a new Accessory "Hydraulic Pump".
    - Verify it appears in the list.
2.  **Order Generation**:
    - Create a Project with `quantity: 2`.
    - Click "Generate Orders".
    - Verify 2 new Orders appear in the Production Dashboard.
3.  **Task Flow**:
    - Open an Order.
    - Add a Task "Assembly".
    - Move it to "In Progress".
    - Verify status update.
