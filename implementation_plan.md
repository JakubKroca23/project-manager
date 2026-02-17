# Implementation Plan - Re-introducing Body Type

This plan covers the re-introduction of the `body_type` (Typ nástavby) field into the project management system, following the database migration prepared on 2026-02-17.

## 1. Database & Types (Foundational)
- **Migration**: Verify `supabase_migrations/20260217_add_body_type.sql` is applied.
- **TypeScript**: `Project` interface already contains `body_type?: string` in `src/types/project.ts`. No changes needed.

## 2. Project Creation
- **Component**: `src/components/CreateProjectModal.tsx`
- **Change**: Add a new input field for `body_type` (labeled "Typ nástavby").
- **Logic**: Ensure `body_type` is included in the `insert` payload in `handleSubmit`.

## 3. Project List (Tables)
- **Component**: `src/app/projekty/page.tsx`
- **Change**: 
    - Add a new column definition for `body_type` in the `columns` array.
    - Set header to "Typ nástavby".
    - Update the universal filter (`searchableFields`) to include `body_type`.

## 4. Timeline Visualization
- **Component**: `src/components/Timeline/TimelineBar.tsx`
- **Change**: 
    - Include `body_type` in the project information section of the edit/delete popup (Portal).
    - Display it as a small badge or label next to the project name/ID.

## 5. Verification (TDD)
- **Test**: Create or update a test to verify that manual project creation with `body_type` works and persistence is maintained.
- **Manual**: Create a project, check the database, and verify display in Timeline and Project List.

---

### Questions for the User:
1. Přejete si, aby pole "Typ nástavby" bylo povinné při vytváření nové zakázky?
2. Má být toto pole zobrazeno v tabulce projektů jako samostatný sloupec, nebo raději sloučeno s jinou informací (např. v závorce u názvu)?
3. Má se informace o typu nástavby zobrazovat i v kompaktním zobrazení "stacked" řádků v Timeline, nebo stačí pouze v detailním popupu?
