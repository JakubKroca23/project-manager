"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface Project {
    id: string
    title: string
    client_name: string
    status: string
    end_date: string | null
    updated_at: string
}

interface RecentProjectsProps {
    initialProjects: Project[]
    userId: string
}

export function RecentProjects({ initialProjects, userId }: RecentProjectsProps) {
    const [projects, setProjects] = useState<Project[]>(initialProjects)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel('recent_projects_subscription')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'projects',
                    filter: `manager_id=eq.${userId}`
                },
                (payload) => {
                    // Simple approach: re-fetch or manipulate list. 
                    // For simplicity and accuracy on sort, let's just trigger a server re-fetch or manual fetch.
                    // But to be "flashy" and fast, we can try to merge.
                    // However, we only have 'payload.new', we might miss join data if we had any.
                    // Here we only use fields from 'projects', so we can use payload.new.

                    if (payload.eventType === 'INSERT') {
                        const newProject = payload.new as Project
                        setProjects(prev => [newProject, ...prev].slice(0, 5))
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedProject = payload.new as Project
                        setProjects(prev =>
                            prev.map(p => p.id === updatedProject.id ? updatedProject : p)
                                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                        )
                    } else if (payload.eventType === 'DELETE') {
                        setProjects(prev => prev.filter(p => p.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, supabase])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)] border-green-500/20'
            case 'in_progress': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)] border-blue-500/20'
            case 'planning': return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)] border-yellow-500/20'
            case 'paused': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)] border-red-500/20'
            default: return 'bg-gray-500/10 text-gray-500'
        }
    }

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            planning: 'Plánování',
            in_progress: 'Ve výrobě',
            completed: 'Dokončeno',
            paused: 'Pozastaveno',
            draft: 'Návrh'
        }
        return labels[status] || status
    }

    return (
        <div className="glass-panel h-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Nedávné Projekty</h3>
                <button onClick={() => router.push('/projects')} className="text-sm text-primary hover:underline transition-all">
                    Zobrazit vše
                </button>
            </div>

            <div className="overflow-x-auto -mx-4 px-4 pb-2">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead className="w-[40%]">Název</TableHead>
                            <TableHead>Zákazník</TableHead>
                            <TableHead>Stav</TableHead>
                            <TableHead className="text-right">Termín</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                    Žádné nedávné projekty
                                </TableCell>
                            </TableRow>
                        ) : (
                            projects.map((project, index) => (
                                <motion.tr
                                    key={project.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => router.push(`/projects/${project.id}`)}
                                    className="cursor-pointer group hover:bg-muted/50 transition-colors border-border/50"
                                >
                                    <TableCell className="font-medium group-hover:text-primary transition-colors">
                                        {project.title}
                                    </TableCell>
                                    <TableCell>{project.client_name || '—'}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`border-0 ${getStatusColor(project.status)}`}>
                                            {getStatusLabel(project.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {project.end_date ? format(new Date(project.end_date), 'd. M.', { locale: cs }) : '—'}
                                    </TableCell>
                                </motion.tr>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
