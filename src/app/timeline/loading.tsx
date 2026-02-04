import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="flex-1 flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
            </div>

            <div className="flex-1 border border-border/50 rounded-xl overflow-hidden flex">
                <div className="w-64 border-r border-border/50 p-4 space-y-4 bg-secondary/10">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="flex-1 bg-background p-4 space-y-8">
                    <div className="flex justify-between">
                        <Skeleton className="h-6 w-full max-w-[800px]" />
                    </div>
                    <div className="space-y-4 pt-8">
                        <Skeleton className="h-8 w-32 ml-10" />
                        <Skeleton className="h-8 w-48 ml-32" />
                        <Skeleton className="h-8 w-24 ml-64" />
                    </div>
                </div>
            </div>
        </div>
    )
}
