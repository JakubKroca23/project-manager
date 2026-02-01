export type Project = {
    id: string
    title: string
    client: string
    status: "planning" | "in_progress" | "completed" | "paused"
    dueDate: string
    progress: number
}

// Mock data for now to show UI structure
export const projects: Project[] = [
    {
        id: "1",
        title: "Redesign E-shopu",
        client: "Alza.cz",
        status: "in_progress",
        dueDate: "2024-03-15",
        progress: 65,
    },
    {
        id: "2",
        title: "Mobilní Aplikace iOS",
        client: "Škoda Auto",
        status: "planning",
        dueDate: "2024-04-01",
        progress: 10,
    },
    {
        id: "3",
        title: "Kampaň Jaro 2024",
        client: "Kofola",
        status: "completed",
        dueDate: "2024-02-01",
        progress: 100,
    },
    {
        id: "4",
        title: "Interní CRM Systém",
        client: "Contsystem",
        status: "paused",
        dueDate: "2024-06-30",
        progress: 30,
    },
]

export type ProductionOrder = {
    id: string
    title: string
    project: string | null
    quantity: number
    status: "new" | "fabrication" | "assembly" | "testing" | "done"
    priority: "low" | "medium" | "high" | "critical"
    deadline: string
}

export const productionOrders: ProductionOrder[] = [
    {
        id: "1",
        title: "Vozidlo X5 - Skříňová nástavba",
        project: "Vozidlo X5 - Doplnění výbavy",
        quantity: 1,
        status: "fabrication",
        priority: "high",
        deadline: "2024-03-20",
    },
    {
        id: "2",
        title: "Držáky monitorů (Série A)",
        project: "Redesign E-shopu",
        quantity: 50,
        status: "new",
        priority: "medium",
        deadline: "2024-04-05",
    },
    {
        id: "3",
        title: "Kabelové svazky",
        project: null,
        quantity: 200,
        status: "done",
        priority: "low",
        deadline: "2024-02-10",
    },
]

export type Service = {
    id: string
    title: string
    client: string
    location: string
    status: "scheduled" | "in_progress" | "waiting_parts" | "done"
    date: string
}

export const services: Service[] = [
    {
        id: "1",
        title: "Servis Klimatizace",
        client: "Contsystem",
        location: "Ostrava",
        status: "scheduled",
        date: "2024-03-12 10:00",
    },
    {
        id: "2",
        title: "Výměna Oleje - Bagr",
        client: "Stavby s.r.o.",
        location: "Praha - Staveniště",
        status: "in_progress",
        date: "2024-03-10 14:00",
    },
]
