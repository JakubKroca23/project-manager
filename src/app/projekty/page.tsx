import ProjectList from '@/components/ProjectList';
import { Project } from '@/types/project';
import raynetData from '../../../data/raynet_data_3.json';

// Pomocná funkce pro bezpečné získání hodnoty z objektu s potenciálně rozbitým kódováním klíčů
const getVal = (obj: any, searchKey: string) => {
  // Zkusíme najít přesnou shodu
  if (obj[searchKey] !== undefined) return obj[searchKey];

  // Zkusíme najít klíč, který obsahuje hledaný řetězec bez diakritiky nebo s otazníky (pro raynet exporty)
  const normalizedSearch = searchKey.toLowerCase().replace(/[^\w\s]/gi, '');
  const key = Object.keys(obj).find(k => {
    const normalizedK = k.toLowerCase().replace(/[^\w\s]/gi, '');
    return normalizedK === normalizedSearch;
  });

  return key ? obj[key] : undefined;
};

const cleanNaN = (val: any) => val === "NaN" || val === null || val === undefined ? undefined : val;

// Mapování dat z Raynet JSON na náš interní formát Project
const mappedProjects: Project[] = (raynetData as any[]).map((item: any) => ({
  id: getVal(item, "Kód"),
  name: getVal(item, "Předmět"),
  customer: getVal(item, "Klient") || "-",
  manager: getVal(item, "Vlastník") || "-",
  status: "Aktivní", // V novém exportu chybí sloupec Stav, nastavujeme výchozí
  deadline: "-", // V novém exportu chybí Otevřeno od

  // Rozšířená pole
  closed_at: cleanNaN(getVal(item, "Uzavřeno")),
  category: cleanNaN(getVal(item, "Kategorie")),
  abra_order: cleanNaN(getVal(item, "Abra Objednávka")),
  abra_project: cleanNaN(getVal(item, "Abra Zakázka")),
  body_delivery: cleanNaN(getVal(item, "Dodání nástavby")),
  customer_handover: cleanNaN(getVal(item, "Předání zákazníkovi")),
  chassis_delivery: cleanNaN(getVal(item, "Dodání podvozku")),
  production_status: cleanNaN(getVal(item, "Status Výroby")),
  mounting_company: cleanNaN(getVal(item, "Montážní společnost")),
  body_setup: cleanNaN(getVal(item, "Nástavba nastavení")),
  serial_number: cleanNaN(getVal(item, "Výrobní číslo")),

  quantity: 1,
  action_needed_by: 'internal' as const,
  note: "",
  created_at: new Date().toISOString()
})).filter(p => p.name);

export default function ProjectsPage() {
  return (
    <div className="dashboard-container">
      <main>
        <ProjectList projects={mappedProjects} />
      </main>

      <footer style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        © 2026 Project Manager | Kompletní data importována z Raynet CRM (Import 2)
      </footer>
    </div>
  );
}
