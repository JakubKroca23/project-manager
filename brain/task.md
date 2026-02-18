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
- [x] Vytvoření sekce Výroba s animací výstavby.
- [x] Oprava posunu data milníků (Timezone fix).
- [x] Implementace adaptivní velikosti ikon v Timeline.
- [x] Editace termínů milníků přímo v tooltipu.
- [x] Vylepšení vizuálu a chování "Stacked" řádků v hlavičkách sektorů.
- [x] Přidání ikony `Crane` (jeřáb) do Timeline.
- [x] Fix překryvu stacked řádků bílým pozadím (transparent fix).
- [x] Implementace Nápovědy a Legendy pro Timeline.
- [x] Redesign "Konec montáže" a "Konec revize" na jednoduché tečky (dots).
- [x] Modernizace Timeline Settings UI (kulaté výběry barev, fixní layout).
- [x] Oprava Z-Indexu popupů milníků (React Portal).
- [x] Streamlining tvorby vlastních milníků (odstranění Typu nástavby).
- [x] Implementace výběru ikon pro milníky.
- [x] Barevné odlišení milníků (Červená/Zelená).
- [x] Fix pozicování a otevírání popupu Timeline (Bottom-overflow fix).
- [x] Oprava duplicity polí v detailu projektu.
- [x] Implementace modálu pro ruční vytváření zakázek a servisů.
- [x] Integrace "Nový projekt" do stránek Projekty a Servis.
- [x] Zobrazení reálného času nasazení (LAST_DEPLOY_DATE) v SystemStatusBar.
- [x] Implementace Release Notes modálu.
- [x] Dynamické načítání verze na obrazovce údržby.
- [x] Implementace interaktivní minihry s jeřábem pro režim údržby.
- [x] Globální náhrada "Manažer" -> "Vedoucí projektu".
- [x] Oprava navigace Navbaru (active category fix).
- [x] Redesign ovládání vertikálního zoomu v Timeline (in-grid tlačítka).
- [x] Přesun panelu Vzhled do inline popupu pod hlavičkou.
- [x] Cleanup základních polí v detailu projektu.


## Budoucí úkoly (Backlog)
- [ ] Přidání potvrzovacích dialogů před změnou role.
- [ ] Export auditu změn do CSV/Excel.
- [ ] Vizuální odlišení adminů v seznamu uživatelů (volitelné).
