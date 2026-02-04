import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logProjectChange } from '@/lib/history'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(),
}))

describe('logProjectChange (History Logger)', () => {
    const mockSupabase = {
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } })
        },
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ error: null }),
    }

    beforeEach(() => {
        vi.clearAllMocks()
            ; (createClient as any).mockResolvedValue(mockSupabase)
    })

    it('should log simple data without diff if oldData is missing', async () => {
        await logProjectChange('proj-1', 'created', { title: 'New' })

        expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
            project_id: 'proj-1',
            action_type: 'created',
            details: { title: 'New' }
        }))
    })

    it('should log diff if oldData and newData differs', async () => {
        await logProjectChange(
            'proj-1',
            'updated',
            { status: 'done', title: 'Old' },
            { status: 'pending', title: 'Old' }
        )

        expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
            details: {
                before: { status: 'pending' },
                after: { status: 'done' }
            }
        }))
    })

    it('should NOT log if there are no changes', async () => {
        await logProjectChange(
            'proj-1',
            'updated',
            { status: 'pending' },
            { status: 'pending' }
        )

        expect(mockSupabase.insert).not.toHaveBeenCalled()
    })
})
