import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageHeader } from '../PageHeader';
import { Project } from '../../../types/project';
import { ActionProvider } from '../../../providers/ActionProvider';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

const mockProject: Project = {
    id: 'OP-25-224',
    name: 'MULTILIFT ULTIMA 21Z59',
    customer: 'FCC Česká republika, s.r.o.',
    manager: 'Jiří Tomis',
    status: 'Aktivní',
    project_type: 'civil',
    abra_project: 'V5-045',
    abra_order: 'OPV4/2026',
    category: 'Multilift',
    priority: 2,
    quantity: 1,
    production_status: 'V procesu',
    mounting_company: 'Contsystem',
    start_at: '2026-03-15',
    serial_number: 'SN123456',
    chassis_delivery: '2026-01-01',
    body_delivery: '2026-02-01',
    customer_handover: '2026-03-01',
    created_at: '2026-01-01',
    action_needed_by: 'internal'
};

const renderPageHeader = (props = {}) => {
    return render(
        <ActionProvider>
            <PageHeader
                project={mockProject}
                editedProject={mockProject}
                isEditing={false}
                saving={false}
                canEdit={true}
                typeColor="#2563eb"
                onEdit={() => { }}
                onCancel={() => { }}
                onSave={() => { }}
                onDelete={() => { }}
                onChange={() => { }}
                {...props}
            />
        </ActionProvider>
    );
};

describe('PageHeader', () => {
    it('renders project name, id and customer', () => {
        renderPageHeader();

        expect(screen.getByText('Popis zakázky')).toBeInTheDocument();
        expect(screen.getByText('OP-25-224')).toBeInTheDocument();
        expect(screen.getByText('MULTILIFT ULTIMA 21Z59')).toBeInTheDocument();
        expect(screen.getByText('FCC Česká republika, s.r.o.')).toBeInTheDocument();
        expect(screen.getByText('Jiří Tomis')).toBeInTheDocument();
    });

    it('renders metadata fields like Abra Project', () => {
        renderPageHeader();
        expect(screen.getByText('V5-045')).toBeInTheDocument();
        expect(screen.getByText('OPV4/2026')).toBeInTheDocument();
    });

    it('shows input fields when in editing mode', () => {
        renderPageHeader({ isEditing: true });

        const nameInput = screen.getByPlaceholderText('Zadejte název zakázky...');
        expect(nameInput).toBeInTheDocument();
        expect(nameInput).toHaveValue('MULTILIFT ULTIMA 21Z59');
    });
});
