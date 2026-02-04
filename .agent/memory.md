# Historie a paměť projektu

## 2026-02-04: Inicializace a specifikace
- Projekt zahájen s důrazem na efektivitu a TDD.
- Nastavena základní struktura `.agent` složky.
- Definována pravidla pro generování kódu a debugování.
- **Rozhodnutí o designu**: Světlý čistý glassmorphism s podporou tmavého režimu. Implementováno v `globals.css`.
- **Datová struktura**: Název, vedoucí, zákazník, ks, stav. Typy definovány v `src/types/project.ts`.
- **DB**: Vybrán Supabase. Aktuálně mock data pro vývoj.
- **Testing**: Nastaven Jest. První test `ProjectList` prochází.
