import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageContainerProps {
    children: ReactNode
    className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
    return (
        <div className={cn("w-full max-w-7xl mx-auto px-6 pt-28 pb-12", className)}>
            {children}
        </div>
    )
}
