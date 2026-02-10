import { Project } from './project';

/**
 * Task pro SVAR Gantt knihovnu
 */
export interface GanttTask {
    id: string | number;
    text: string;
    start: Date;
    end: Date;
    duration?: number;
    progress?: number;
    type?: 'task' | 'milestone' | 'summary';
    parent?: string | number;
    details?: string;
    // Custom fields
    customer?: string;
    phase?: 'preparation' | 'assembly' | 'final' | 'delayed' | 'completed';
    projectId?: string; // New field for grouping
}

/**
 * Link mezi tasky (závislosti)
 */
export interface GanttLink {
    id: string | number;
    source: string | number;
    target: string | number;
    type: number; // 0: finish-to-start, 1: start-to-start, 2: finish-to-finish, 3: start-to-finish
}

/**
 * Konfigurace timeline zobrazení
 */
export interface TimelineConfig {
    zoomLevel: 'day' | 'week' | 'month' | 'quarter';
    showWeekends: boolean;
    startDate: Date;
    endDate: Date;
}

/**
 * Pomocná funkce pro parsování českého data (DD.MM.YYYY)
 */
export const parseCzechDate = (dateStr?: string): Date | null => {
    if (!dateStr || dateStr === '-' || dateStr === 'NaN') return null;
    const parts = dateStr.split('.');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month, day);
};

/**
 * Převod Project na GanttTask
 */
export const projectToGanttTask = (project: Project): GanttTask | null => {
    // Určení start a end date z milníků projektu
    const closedAt = parseCzechDate(project.closed_at);
    const chassisDelivery = parseCzechDate(project.chassis_delivery);
    const bodyDelivery = parseCzechDate(project.body_delivery);
    const customerHandover = parseCzechDate(project.customer_handover);

    // Určení časového rozsahu
    const dates = [closedAt, chassisDelivery, bodyDelivery, customerHandover].filter(Boolean) as Date[];
    if (dates.length === 0) return null;

    const start = new Date(Math.min(...dates.map(d => d.getTime())));
    const end = new Date(Math.max(...dates.map(d => d.getTime())));

    // Pokud start === end, přidáme 1 den
    if (start.getTime() === end.getTime()) {
        end.setDate(end.getDate() + 1);
    }

    // Určení fáze projektu
    const today = new Date();
    const lastMain = chassisDelivery && bodyDelivery
        ? new Date(Math.max(chassisDelivery.getTime(), bodyDelivery.getTime()))
        : (chassisDelivery || bodyDelivery);

    let phase: GanttTask['phase'] = 'preparation';
    if (customerHandover && today > customerHandover) {
        phase = 'completed';
    } else if (lastMain) {
        const daysSinceLastMain = Math.floor((today.getTime() - lastMain.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastMain > 21) {
            phase = 'delayed';
        } else if (daysSinceLastMain > 14) {
            phase = 'final';
        } else if (daysSinceLastMain > 0) {
            phase = 'assembly';
        }
    }

    // Výpočet progressu
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = Math.max(0, today.getTime() - start.getTime());
    const progress = Math.min(100, Math.round((elapsed / totalDuration) * 100));

    return {
        id: project.id,
        text: project.name,
        start,
        end,
        progress: customerHandover && today > customerHandover ? 100 : progress,
        type: 'task',
        customer: project.customer,
        phase,
        details: `${project.customer} | ${project.id}`
    };
};

/**
 * Převod pole projektů na GanttTask[]
 */
/**
 * Převod pole projektů na GanttTask[] - Multiple tasks per project
 */
export const projectsToGanttTasks = (projects: Project[]): GanttTask[] => {
    return projects.flatMap(project => {
        const closedAt = parseCzechDate(project.closed_at);
        const chassisDelivery = parseCzechDate(project.chassis_delivery);
        const bodyDelivery = parseCzechDate(project.body_delivery);
        const customerHandover = parseCzechDate(project.customer_handover);
        const today = new Date();

        const tasks: GanttTask[] = [];

        // Helper to add task
        const addTask = (start: Date, end: Date, phase: GanttTask['phase'], text: string) => {
            // Ensure start <= end
            if (start > end) {
                const temp = start;
                start = end;
                end = temp;
            }
            // Ensure at least 1 day duration
            if (start.getTime() === end.getTime()) {
                end = new Date(start);
                end.setDate(end.getDate() + 1);
            }

            tasks.push({
                id: `${project.id}-${phase}-${Math.random().toString(36).substr(2, 5)}`, // Unique ID for each segment
                projectId: String(project.id), // Group by Project ID
                text: text,
                start,
                end,
                progress: 0,
                type: 'task',
                customer: project.customer,
                phase,
                details: `${project.customer} | ${project.id}`
            });
        };

        const lastMain = chassisDelivery && bodyDelivery
            ? new Date(Math.max(chassisDelivery.getTime(), bodyDelivery.getTime()))
            : (chassisDelivery || bodyDelivery);

        // 1. Preparation (Start -> Max(Chassis, Body))
        // Since we don't have a specific "Project Start Date", we might default to 14 days beore lastMain or something similar?
        // For now, let's use a default preparation window if lastMain exists.

        // Actually, let's mimick the Logic from page.tsx (Timeline)
        // Green: Closed -> Max(Body, Chassis)
        if (closedAt && lastMain && closedAt < lastMain) {
            addTask(closedAt, lastMain, 'preparation', 'Příprava');
        }

        // Yellow: Max(Body, Chassis) -> +14 days
        if (lastMain) {
            const dP14 = new Date(lastMain);
            dP14.setDate(dP14.getDate() + 14);
            addTask(lastMain, dP14, 'assembly', 'Montáž');

            // Orange: +14 -> +21 days
            const dP21 = new Date(dP14);
            dP21.setDate(dP21.getDate() + 7);
            addTask(dP14, dP21, 'final', 'Finále');

            // Red: +21 -> Handover (or Today if no handover)
            const gridEndDate = customerHandover || today;
            if (dP21 < gridEndDate) {
                addTask(dP21, gridEndDate, 'delayed', 'Zpoždění');
            }
        }

        // Purple: Handover -> Today (if delivered)
        if (customerHandover && customerHandover < today) {
            // Just a milestone or a short bar? Let's make it a 'completed' bar from handover to today/handover+1
            const completedEnd = new Date(customerHandover);
            completedEnd.setDate(completedEnd.getDate() + 2); // Show 2 days bar
            addTask(customerHandover, completedEnd, 'completed', 'Předáno');
        }

        return tasks;
    });
};
