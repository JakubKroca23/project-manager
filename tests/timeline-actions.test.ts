import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateTimelineItemDate } from '@/app/timeline/actions'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(),
}))

describe('updateTimelineItemDate', () => {
    const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
            ; (createClient as any).mockResolvedValue(mockSupabase)
    })

    it('should update project dates correctly', async () => {
        mockSupabase.eq.mockResolvedValue({ error: null })

        const result = await updateTimelineItemDate(
            '1',
            'project',
            '2024-01-01',
            '2024-01-10'
        )

        expect(result.success).toBe(true)
        expect(mockSupabase.from).toHaveBeenCalledWith('projects')
        expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({
            start_date: '2024-01-01',
            end_date: '2024-01-10'
        }))
    })

    it('should return error if update fails', async () => {
        mockSupabase.eq.mockResolvedValue({ error: { message: 'DB Error' } })

        const result = await updateTimelineItemDate(
            '1',
            'project',
            '2024-01-01',
            '2024-01-10'
        )

        expect(result.success).toBe(false)
        expect(result.error).toBe('DB Error')
    })
})
