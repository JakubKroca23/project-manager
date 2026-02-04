"use client"

import { useTimeline } from "./timeline-provider"
import { ChevronRight, ChevronDown, Folder, Briefcase, Wrench } from "lucide-react"
import { useRouter } from "next/navigation"

export const ROW_HEIGHT = 42

export function TimelineSidebar() {
    const { visibleItems, toggleExpand, expandedIds } = useTimeline()
    const router = useRouter()

    return (
        <div className="w-[280px] flex-shrink-0 border-r border-border/50 bg-background z-20 flex flex-col">
            {/* Header */}
            <div className="h-[50px] border-b border-border/50 flex items-center px-4 font-bold text-sm bg-secondary/5">
                Projekty / Zakázky
            </div>

            {/* List Container - Connected to Scroll Sync ID */}
            <div className="flex-1 overflow-hidden relative">
                <div
                    id="timeline-sidebar-scroll"
                    className="absolute inset-0 overflow-hidden" // Hidden because main scroll drives it
                    style={{ overflowY: 'hidden' }} // Controlled via JS
                >
                    {visibleItems.map(item => {
                        const isParent = !item.parent_id
                        const isExpanded = expandedIds.has(item.id)
                        const Icon = item.type === 'project' ? Folder : item.type === 'service' ? Wrench : Briefcase

                        return (
                            <div
                                key={item.id}
                                className={`flex items-center px-4 border-b border-border/10 hover:bg-secondary/20 transition-colors cursor-pointer text-sm
                                    ${item.parent_id ? 'bg-secondary/5' : ''}
                                `}
                                style={{ height: ROW_HEIGHT, paddingLeft: item.parent_id ? '2.5rem' : '1rem' }}
                                onClick={() => {
                                    if (item.type === 'project') router.push(`/projects/${item.id}`)
                                    if (item.type === 'production') router.push(`/production/${item.id}`)
                                }}
                            >
                                {isParent && item.type === 'project' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleExpand(item.id)
                                        }}
                                        className="p-1 mr-1 hover:bg-secondary rounded text-muted-foreground"
                                    >
                                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                    </button>
                                )}
                                {!isParent && <div className="w-6" />}

                                <Icon className={`w-3.5 h-3.5 mr-2 
                                    ${item.type === 'project' ? 'text-blue-500' : item.type === 'service' ? 'text-purple-500' : 'text-orange-500'}
                                `} />

                                <span className="truncate font-medium">{item.title}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
