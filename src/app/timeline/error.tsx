'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCw } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Timeline Error:', error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center p-6">
            <div className="bg-red-500/10 p-4 rounded-full">
                <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Vyskytla se chyba při načítání Timeline</h2>
            <p className="text-muted-foreground max-w-[500px]">
                Nepodařilo se načíst data pro časovou osu. Pravděpodobně chybí potřebná databázová view nebo je problém s připojením.
            </p>
            <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Zpět na Dashboard
                </Button>
                <Button onClick={() => reset()} className="gap-2">
                    <RotateCw className="w-4 h-4" />
                    Zkusit znovu
                </Button>
            </div>
        </div>
    )
}
