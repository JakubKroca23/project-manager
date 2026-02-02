"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generateProductionOrders } from "@/app/projects/actions"

interface GenerateJobsModalProps {
    isOpen: boolean
    onClose: () => void
    projectId: string
    quantity: number
}

export function GenerateJobsModal({
    isOpen,
    onClose,
    projectId,
    quantity
}: GenerateJobsModalProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [duration, setDuration] = useState("3") // Default 3 weeks

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const weeks = parseInt(duration)
        if (isNaN(weeks) || weeks <= 0) {
            alert("Zadejte platný počet týdnů")
            setIsLoading(false)
            return
        }

        const result = await generateProductionOrders(projectId, weeks)

        if (result.success) {
            router.refresh()
            onClose()
            alert("Výrobní zakázky byly úspěšně naplánovány.")
        } else {
            alert(result.error || "Chyba při generování")
        }
        setIsLoading(false)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Vygenerovat výrobní zakázky">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 bg-secondary/20 rounded-xl border border-border/50 text-sm space-y-2">
                    <p><strong>Počet vozidel v projektu:</strong> {quantity} ks</p>
                    <p className="text-muted-foreground">
                        Systém automaticky vytvoří {quantity} zakázek. Zakázky budou rozvrženy tak, aby se konec předchozího kusu a začátek nového <strong>překrývaly o 1 týden</strong>.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Doba výroby jednoho kusu (týdny)</label>
                    <Input
                        type="number"
                        min="1"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Např. 3"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        Zrušit
                    </Button>
                    <Button type="submit" variant="premium" disabled={isLoading}>
                        {isLoading ? "Generování..." : "Vygenerovat zakázky"}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
