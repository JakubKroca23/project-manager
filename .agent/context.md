# Kontext projektu: Přehled projektů

## Cíl projektu
Vytvořit efektivní a přehledný systém pro správu a vizualizaci firemních projektů.

## Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, Vanilla CSS (pro precizní glassmorphism).
- **Backend/DB**: Supabase (Cloudová databáze pro ukládání dat).
- **CRM Integration**: Aktivní integrace s Raynet CRM (čtení JSON exportu pro tabulku projektů).
- **Testing**: Jest & React Testing Library (TDD).

## Datové položky projektu
- Název, Vedoucí, Zákazník, Počet ks, Stav, Termín, Vyžadovaná akce, Poznámka.

## Struktura stránek
- **Timeline (Hlavní)**: Časový přehled zakázek (Mockup).
- **Projekty**: Tabulkový přehled se všemi detaily.
- **Výroba, Servis, Admin**: Plánované sekce.

## Struktura souborů
- `/src`: Zdrojový kód.
- `/.agent`: Konfigurace a pravidla agenta.
- `build_log.md`: Historie změn a fixů.
