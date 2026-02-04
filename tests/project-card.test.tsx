import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProjectCard } from '@/components/projects/project-card'
import '@testing-library/jest-dom'

const mockProject = {
    id: '1',
    title: 'Testovací Projekt',
    client_name: 'Zákazník s.r.o.',
    manager_name: 'Jakub Kroca',
    status: 'planning',
    end_date: '2026-12-31',
    quantity: 5
}

describe('ProjectCard', () => {
    it('vykreslí základní informace o projektu', () => {
        render(<ProjectCard project={mockProject} />)

        expect(screen.getByText('Testovací Projekt')).toBeInTheDocument()
        expect(screen.getByText('Zákazník s.r.o.')).toBeInTheDocument()
        expect(screen.getByText('Jakub Kroca')).toBeInTheDocument()
    })

    it('zobrazí správný počet ks', () => {
        render(<ProjectCard project={mockProject} />)
        expect(screen.getByText('5 ks')).toBeInTheDocument()
    })
})
