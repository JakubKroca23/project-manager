# Kontext projektu (Context)

## Přehled
Komplexní systém pro správu projektů a výroby (Project Manager). Systém spravuje klienty, projekty, výrobu (Production Orders), úkoly a kusovníky (BOM).

## Technologický Stack
- **Frontend**: Next.js 16 (App Router), React 19, Framer Motion (animace).
- **Backend/DB**: Supabase (PostgreSQL, Auth, SSR).
- **Styling**: Tailwind CSS 4, Radix UI (sloty), Lucide React (ikony).
- **PDF**: `@react-pdf/renderer` pro generování výrobních listů.
- **Typování**: TypeScript (strict).

## Architektura
- `/src/app`: Routy a serverové akce.
- `/src/components`: UI komponenty rozdělené podle domén (admin, auth, dashboard, production, projects, timeline, ui).
- `/src/lib`: Sdílené utility a konfigurace (včetně Supabase klienta).
- `/supabase`: SQL schémata (CRM, výroba, historie, oprávnění).

## Klíčové Funkce
- Dashboard se statistikami a streamem aktivit.
- Správa uživatelů a oprávnění (Admin sekce).
- Detailní správa projektů a jejich časové osy (Timeline).
- Výrobní modul s detailními objednávkami, úkoly a PDF exportem.
- Katalogy doplňků, nástaveb a klientů.
