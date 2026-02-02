# Production Order PDF Generation

## Goal
Implement functionality to generate and download PDF documents for Production Orders. These PDFs will serve as "Job Cards" for the shop floor, containing project details, manufacturing tasks, and bill of materials (BOM).

## User Review Required
> [!IMPORTANT]
> **Library Choice:** I propose using `@react-pdf/renderer` for robust, React-based PDF generation.
> **PDF Content:** The PDF will include:
> - Order Header (ID, Dates, Status)
> - Project Details (Client, Name, Description)
> - Manufacturing Tasks Checklist
> - Bill of Materials (BOM) List
> - Space for signatures/notes

## Proposed Changes

### Dependencies
#### [MODIFY] `package.json`
- Add `@react-pdf/renderer`

### UI Implementation

#### [NEW] `src/components/production/pdf-document.tsx`
- Define the PDF layout using `react-pdf` components (`Document`, `Page`, `View`, `Text`, `StyleSheet`).
- Styling to match the professional look (clean, readable, simple for printing).

#### [NEW] `src/components/production/pdf-download-button.tsx`
- Client component to handle the PDF generation and download trigger using `PDFDownloadLink`.

#### [MODIFY] `src/app/dashboard/production/[orderId]/page.tsx`
- Add the `PdfDownloadButton` to the action bar.
- Pass necessary data (Order, Tasks, BOM) to the PDF component.

## Verification Plan

### Manual Verification
1.  **Generate PDF**:
    - Go to a Production Order detail page.
    - Click "Download Job Card".
    - Open the downloaded PDF.
2.  **Verify Content**:
    - Check if Project Name and Order ID match.
    - Verify all tasks are listed with checkboxes.
    - Verify BOM items are listed with quantities.
    - Check formatting (margins, fonts).
