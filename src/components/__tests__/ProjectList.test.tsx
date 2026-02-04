import { render, screen } from '@testing-library/react'
import ProjectList from '@/components/ProjectList'
import { Project } from '@/types/project'

const mockProjects: Project[] = [
    {
        id: '1',
        name: 'Projekt A',
        manager: 'Jakub Kroca',
        customer: 'Auto Škoda',
        quantity: 100,
        status: 'production',
        deadline: '20.02.2026',
        action_needed_by: 'internal',
        created_at: new Date().toISOString()
    }
]

describe('ProjectList', () => {
    it('renders correctly with project data', () => {
        render(<ProjectList projects={mockProjects} />)

        expect(screen.getByText('Projekt A')).toBeInTheDocument()
        expect(screen.getByText('Jakub Kroca')).toBeInTheDocument()
        expect(screen.getByText('Auto Škoda')).toBeInTheDocument()
        expect(screen.getByText('100 ks')).toBeInTheDocument()
        expect(screen.getByText('VÝROBA')).toBeInTheDocument()
        expect(screen.getByText('Nás')).toBeInTheDocument()
    })
})
