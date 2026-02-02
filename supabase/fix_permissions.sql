-- 1. Oprava RLS Politik (pro jistotu, aby fungovalo čtení i zápis)
alter table profiles enable row level security;

-- Odstranění starých politik, které mohou kolidovat
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;
-- Odstranění politik, které jsem mohl navrhnout dříve
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Admins can update all profiles" on profiles;

-- Vytvoření nových, robustních politik
-- KAŽDÝ (i nepřihlášený pro login stránku, nebo minimálně authenticated) může čist profily (potřeba pro middleware)
create policy "Everyone can view profiles" on profiles for select using ( true );

-- UŽIVATELÉ mohou upravovat POUZE svůj profil
create policy "Users can update own profile" on profiles for update using ( auth.uid() = id );

-- ADMINI mohou upravovat VŠECHNY profily (tohle je klíčové pro Admin Panel)
create policy "Admins can update all profiles" on profiles for update using ( 
  auth.uid() in (select id from profiles where role = 'admin') 
);

-- 2. Nastavení tvého uživatele jako Admina + Schválení
-- POZOR: Nahraď 'tvuj@email.cz' svým skutečným emailem!
-- Pokud jsi jediný uživatel (nebo poslední registrovaný), můžeš použít tento trik s created_at:
update profiles 
set 
  is_approved = true, 
  role = 'admin'
where id in (
  select id from auth.users order by created_at desc limit 1
);
-- Alternativně pro konkrétní email odkomentuj a uprav řádek níže:
-- update profiles set is_approved = true, role = 'admin' where email = 'tvuj@email.cz';

-- 3. Kontrola: Vypiš si výsledek
select email, role, is_approved from profiles;
