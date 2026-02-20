# Implementation Plan - Úprava ikon milníků v nastavení vzhledu

Umožnit administrátorům měnit ikony pro jednotlivé typy milníků přímo v panelu nastavení vzhledu Timeline.

## User Review Required

> [!IMPORTANT]
> Změna ikon se projeví globálně pro všechny uživatele po kliknutí na "Uložit Všem" (pokud je uživatel admin).

- Má být výběr ikon omezen pouze na `ICON_OPTIONS` definované v `Timeline.tsx`? (Předpokládám, že ano).
- Jaký vizuální styl výběru ikon preferujete? (Grid ikon, nebo cyklování kliknutím?).

## Proposed Changes

### 1. `src/components/Timeline/Timeline.tsx`

#### UI v nastavení
- V sekci "Milníky" (kolem řádku 932) přidat novou podsekci pro "Ikony Milníků".
- Vypsat seznam milníků: Chassis (Podvozek), Body (Nástavba), Handover (Předání), Deadline (Termín), Revision (Revize), Start (Příjem).
- Pro každý milník zobrazit aktuální ikonu a umožnit její změnu.
- Použít grid pro výběr ikon (z `ICON_OPTIONS`), který se zobrazí např. po kliknutí na ikonu milníku.

#### Logika
- Implementovat funkci `updateMilestoneIcon(key: keyof IColorsState, icon: string)`, která aktualizuje stav `colors`.

### 2. `src/components/Timeline/Timeline.css` (volitelně)
- Přidat styly pro grid výběru ikon v sidebaru (kompaktní zobrazení).

## Verification Plan

### Automated Tests
- Vytvořit test `src/components/Timeline/__tests__/milestoneIcon.test.tsx` (pokud existují testy), nebo ověřit pomocí render testu.
- Ověřit, že změna ve stavu `colors` se správně propaguje do komponenty.

### Manual Verification
1. Otevřít Timeline.
2. Otevřít panel "Vzhled".
3. V sekci Milníky najít změnu ikon.
4. Změnit ikonu např. pro "Podvozek".
5. Ověřit, že se ikona okamžitě změnila v grafu.
6. Jako administrátor kliknout na "Uložit Všem".
7. Obnovit stránku a ověřit perzistenci.
