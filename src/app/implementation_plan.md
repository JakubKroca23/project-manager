# Implementation Plan - Timeline Fixes

## Cíle
1. Přesunout nastavení Timeline doprava (do sekce `header-right`).
2. Opravit průhlednost sticky hlaviček sektorů ("stacked rows") - nastavit pevné pozadí.
3. Odstranit border z těchto sticky hlaviček.

## Kroky v `src/components/Timeline/Timeline.tsx`

1.  **Přesun tlačítka nastavení**:
    *   Najít blok `{isAdmin && ...}` uvnitř `<div className="header-left">`.
    *   Přesunout tento blok do `<div className="header-right ...">` (na začátek, před zoom controls).
    *   Upravit pozici dropdownu z `left-0` na `right-0`.

2.  **Úprava `timeline-sector-header-row`**:
    *   Změnit inline styl `background: 'transparent'` na `background: 'var(--background)'`.
    *   Přidat `borderBottom: ‘1px solid var(--border)’` (nebo `none` dle požadavku, zkusím `none` pro splnění "nepřenášej"). *Self-correction: "neprenasej border" might mean "do not apply border on the stacked element". I will remove/reset it.* -> `borderBottom: 'none'`.

## Ověření
*   Settings button je vpravo.
*   Dropdown se otevírá pod tlačítkem zarovnaný doprava.
*   Při scrollování neprosvítají řádky pod sticky hlavičkami.
*   Sticky hlavičky nemají rušivý border.
