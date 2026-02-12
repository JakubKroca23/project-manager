# Aktuální stav úkolů

## Rozpracované úkoly (In Progress)
- [ ] Odstranění TypeScript a JSX lint chyb v `src/app/profile/page.tsx` a `src/hooks/useAdmin.ts`.
- [ ] Testování reálného zobrazení Admin Panelu pod jiným adminským účtem.
- [ ] Ověření funkčnosti `user_action_logs` v Supabase dashboardu.

## Hotové úkoly (Done)
- [x] Detekce `isAdmin` na základě role v DB (`profiles`).
- [x] Přesun triggeru Admin Panelu do modálu Nastavení.
- [x] Real-time synchronizace rolí uživatele.
- [x] Implementace SQL migrace pro Audit Logging.
- [x] Rozšíření administrátorských práv pro operace v Admin Panelu.
- [x] Fallback na ADMIN_EMAIL pro hlavního admina.

## Budoucí úkoly (Backlog)
- [ ] Přidání potvrzovacích dialogů před změnou role.
- [ ] Export auditu změn do CSV/Excel.
- [ ] Vizuální odlišení adminů v seznamu uživatelů (volitelné).
