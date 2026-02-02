"use client"

import { useTimeline } from "./timeline-context"
import { ChevronRight, ChevronDown, Folder, Briefcase, Wrench } from "lucide-react"
import { useRouter } from "next/navigation"

export const ROW_HEIGHT = 42 // Matches the grid row height

export function TimelineSidebar() {
    const { visibleItems, toggleExpand, expandedIds, headerHeight } = useTimeline()
    const router = useRouter()

    return (
        <div className="w-[250px] flex-shrink-0 border-r border-border/50 bg-background/95 backdrop-blur z-20 flex flex-col">
            {/* Header placeholder to align with timeline header */}
            <div
                className="border-b border-border/50 flex items-center px-4 font-bold text-sm bg-secondary/5 transition-all duration-300"
                style={{ height: headerHeight }}
            >
                Projekty / Zakázky
            </div>

            {/* List */}
            <div className="flex-1 overflow-hidden relative">
                <div className="absolute inset-0 overflow-y-auto no-scrollbar" id="sidebar-scroll">
                    {visibleItems.map(item => {
                        const isParent = !item.parent_id
                        const isExpanded = expandedIds.has(item.id)
                        const Icon = item.type === 'project' ? Folder : item.type === 'service' ? Wrench : Briefcase

                        return (
                            <div
                                key={item.id}
                                className={`flex items-center px-3 border-b border-border/10 hover:bg-secondary/20 transition-colors truncate cursor-pointer
                                    ${item.parent_id ? 'bg-secondary/5' : ''}
                                `}
                                onClick={() => {
                                    if (item.type === 'project') {
                                        router.push(`/projects/${item.id}`)
                                    }
                                }}
                                style={{ height: ROW_HEIGHT, paddingLeft: item.parent_id ? '2rem' : '0.75rem' }}
                            >
                                {isParent && item.type === 'project' && (
                                    <button
                                        onClick={() => toggleExpand(item.id)}
                                        className="p-1 mr-1 hover:bg-secondary rounded text-muted-foreground"
                                    >
                                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                    </button>
                                )}
                                {!isParent && <div className="w-5 mr-1" />} {/* Indent spacer for children */}

                                <Icon className={`w-3.5 h-3.5 mr-2 ${item.type === 'project' ? 'text-blue-500' : item.type === 'service' ? 'text-purple-500' : 'text-orange-500'}`} />
                                <span className="text-xs font-medium truncate">{item.title}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
