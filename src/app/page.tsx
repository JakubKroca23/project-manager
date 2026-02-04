import ProjectList from '@/components/ProjectList';
import { Project } from '@/types/project';

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Výroba konstrukce HALA A',
    manager: 'Jakub Kroca',
    customer: 'Stavby s.r.o.',
    quantity: 12,
    status: 'development',
    deadline: '15.02.2026',
    action_needed_by: 'internal',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'FCC',
    manager: 'Neznámý',
    customer: '-',
    quantity: 1,
    status: 'new',
    deadline: '-',
    action_needed_by: 'external',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Revize elektroinstalace',
    manager: 'Martina Malá',
    customer: 'Nemocnice Brno',
    quantity: 1,
    status: 'completed',
    deadline: '01.02.2026',
    action_needed_by: 'internal',
    created_at: new Date().toISOString()
  }
];

export default function Home() {
  return (
    <div className="dashboard-container">
      <header className="mb-8">
        <h1>Projekty</h1>
        <p>Správa a přehled všech aktivních i dokončených projektů.</p>
      </header>

      <main>
        <ProjectList projects={mockProjects} />
      </main>

      <footer style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        © 2026 Project Manager | Powered by Supabase & Next.js
      </footer>
    </div>
  );
}
