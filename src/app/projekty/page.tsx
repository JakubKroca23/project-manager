import ProjectList from '@/components/ProjectList';
import { getMappedProjects } from '@/lib/data-utils';

const mappedProjects = getMappedProjects();

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
