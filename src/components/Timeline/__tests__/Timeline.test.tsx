import React from 'react';
import { render, screen } from '@testing-library/react';
import Timeline from '../Timeline';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            then: jest.fn((callback) => callback({ data: [], error: null })),
        })),
    },
}));

describe('Timeline Component', () => {
    it('renders without crashing', () => {
        render(<Timeline />);
        expect(screen.getByText(/Timeline/i)).toBeInTheDocument();
    });

    it('shows a loading state initially', () => {
        render(<Timeline />);
        // Pokud budeme mít loading skeleton nebo spinner
        expect(screen.getByTestId('timeline-loading')).toBeInTheDocument();
    });
});
