# Walkthrough: Timeline Fix & Job Card PDF

## 1. Timeline Visual Fix
**Goal**: Ensure grid lines and sidebar rows extend to the bottom of the screen even with few projects.

**Changes**:
- Refactored `TimelineSidebar` and `TimelineGrid` to use a dedicated inner wrapper for the background.
- Applied `min-height: 100%` to this wrapper.
- This ensures the gradient background (which creates the lines) always covers the full viewport, while still expanding to accommodate content if needed.

## 2. Manufacturing Job Card (PDF)
**Goal**: Allow downloading a PDF Job Card for the workshop.

**Changes**:
- Installed `@react-pdf/renderer`.
- Created `JobCardPdf` component:
  - Header with Order ID and Dates.
  - Project Info (Client, Description).
  - Manufacturing Tasks Checklist.
  - BOM (Material) List with quantities.
  - No prices (as requested for "Dílna").
- Added "Stáhnout PDF" button to the Production Order Detail page Header.

## Verification
- **Visuals**: Timeline should now look "full" vertically.
- **Functionality**: Clicking "Stáhnout PDF" generates a file named `job-card.pdf` with the order details.

## 3. UI Refinements
**Goal**: Polish user experience and fix mobile layout issues.

**Changes**:
- **AppShell**: Implemented conditional layout rendering. `TopBar` is now hidden on `/login` and `/signup` pages.
- **TopBar**:
  - Added **User Dropdown** (Initials -> Settings/Logout).
  - Added **Mobile Hamburger Menu** for better navigation on small screens.
- **Dashboard**: Replaced generic greeting with "Vítejte zpět, [Jméno]".
