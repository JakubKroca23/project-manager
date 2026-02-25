import { Truck, Box, Zap, Camera, Lightbulb, Bell, Link2, LifeBuoy, Droplets, Fuel, Settings2, Hammer, ShieldAlert } from 'lucide-react';

export const ACCESSORIES = [
    { key: 'blatniky', label: 'Blatníky', icon: Truck },
    { key: 'bocni_podjezd', label: 'Boční podjezdová zábrana', icon: Box },
    { key: 'zadni_podjezd', label: 'Zadní podjezdová zábrana', icon: Box },
    { key: 'drzak_rezervy', label: 'Držák rezervy', icon: Settings2 },
    { key: 'cerpadlo', label: 'Čerpadlo', icon: Zap },
    { key: 'budlik', label: 'Box na nářadí (budlík)', icon: Box },
    { key: 'nadoba_voda', label: 'Nádoba na vodu', icon: Droplets },
    { key: 'hydraulicka_nadrz', label: 'Hydraulická nádrž', icon: Fuel },
    { key: 'uzivatelsky_konektor', label: 'Uživatelský konektor', icon: Link2 },
    { key: 'kamera', label: 'Kamera', icon: Camera },
    { key: 'pracovni_svetlo', label: 'Pracovní světlo', icon: Lightbulb },
    { key: 'majak', label: 'Maják', icon: Bell },
    { key: 'kos_plachta', label: 'Koš na plachtu', icon: Box },
    { key: 'navarovaci_oko', label: 'Navařovací oko', icon: Hammer },
    { key: 'hasicak', label: 'Hasičák', icon: ShieldAlert },
];

export const SOURCE_OPTIONS = [
    { key: 'podvozek', label: 'Podvozek', color: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
    { key: 'nastavba', label: 'Nástavba', color: 'bg-violet-500/10 text-violet-600 border-violet-500/30' },
    { key: 'montazni', label: 'Mont. firma', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
    { key: 'objednat', label: 'Objednat', color: 'bg-rose-500/10 text-rose-600 border-rose-500/30' },
    { key: 'vypalky', label: 'Výpalky', color: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
];
