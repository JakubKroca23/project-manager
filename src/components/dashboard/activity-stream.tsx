"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Clock, FileEdit, Plus, User, AlertCircle, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cs } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export interface ActivityItem {
    id: string
    user_id: string | null
    user_name?: string // Joined/Fetched manually
    project_id: string
    project_title?: string // Joined/Fetched manually
    action_type: string
    details: any
    created_at: string
}

interface ActivityStreamProps {
    initialActivities: ActivityItem[]
}

export function ActivityStream({ initialActivities }: ActivityStreamProps) {
    const [activities, setActivities] = useState<ActivityItem[]>(initialActivities)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const channel = supabase
            .channel('activity_stream_subscription')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'project_history'
                },
                async (payload) => {
                    const newActivity = payload.new as ActivityItem

                    // Filter major milestones only
                    const majorMilestones = ['created', 'status_updated', 'completed', 'deleted', 'production_orders_generated']
                    if (!majorMilestones.includes(newActivity.action_type) && !newActivity.action_type.includes('urgent')) {
                        return
                    }

                    let userName = 'Neznámý uživatel'
                    let projectTitle = 'Neznámý projekt'

                    if (newActivity.user_id) {
                        const { data } = await supabase.from('profiles').select('full_name').eq('id', newActivity.user_id).single()
                        if (data) userName = (data as any).full_name
                    }

                    if (newActivity.project_id) {
                        const { data } = await supabase.from('projects').select('title').eq('id', newActivity.project_id).single()
                        if (data) projectTitle = (data as any).title
                    }

                    const enrichedActivity = {
                        ...newActivity,
                        user_name: userName,
                        project_title: projectTitle
                    }

                    setActivities(prev => [enrichedActivity, ...prev].slice(0, 10))
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const getIcon = (action: string) => {
        if (action === 'created') return Plus
        if (action === 'deleted') return Trash2
        if (action === 'completed') return CheckCircle2
        if (action.includes('status')) return FileEdit
        if (action.includes('urgent') || action.includes('alert')) return AlertCircle
        return Clock
    }

    const getColor = (action: string) => {
        if (action === 'created') return { text: "text-blue-500", bg: "bg-blue-500/10" }
        if (action === 'completed') return { text: "text-green-500", bg: "bg-green-500/10" }
        if (action === 'deleted') return { text: "text-red-500", bg: "bg-red-500/10" }
        if (action.includes('urgent')) return { text: "text-orange-500", bg: "bg-orange-500/10" }
        return { text: "text-primary", bg: "bg-primary/10" }
    }

    const formatAction = (action: string) => {
        const map: Record<string, string> = {
            created: 'vytvořil nový projekt',
            updated: 'aktualizoval projekt',
            deleted: 'smazal projekt',
            status_updated: 'změnil stav projektu',
            completed: 'dokončil projekt',
            production_orders_generated: 'vygeneroval výrobní zakázky',
            accessory_added: 'přidal příslušenství',
            superstructure_added: 'přidal nástavbu'
        }
        return map[action] || 'provedl akci'
    }

    return (
        <div className="glass-panel h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Nedávná Aktivita</h3>
                {/* <button className="text-sm text-primary hover:underline">Zobrazit vše</button> */}
            </div>

            <div className="space-y-6 relative ml-2">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border/50 z-0" />

                <AnimatePresence initial={false}>
                    {activities.map((item, index) => {
                        const Icon = getIcon(item.action_type)
                        const styles = getColor(item.action_type)

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                exit={{ opacity: 0, x: -20, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex gap-4 relative z-10 bg-background/50 backdrop-blur-sm p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => router.push(`/projects/${item.project_id}`)}
                            >
                                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-border/50 ${styles.bg} ${styles.text}`}>
                                    <Icon className="w-5 h-5" />
                                </div>

                                <div className="flex-1 pt-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {item.user_name || 'Systém'} <span className="text-muted-foreground font-normal">{formatAction(item.action_type)}</span>
                                        </p>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: cs })}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-primary mt-0.5 truncate pr-4">
                                        {item.project_title || 'Neznámý projekt'}
                                    </p>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {activities.length === 0 && (
                    <div className="text-center text-muted-foreground py-10 z-10 relative bg-background">
                        Žádná nedávná aktivita
                    </div>
                )}
            </div>
        </div>
    )
}
