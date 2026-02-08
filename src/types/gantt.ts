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
export const projectsToGanttTasks = (projects: Project[]): GanttTask[] => {
    return projects
        .map(projectToGanttTask)
        .filter((task): task is GanttTask => task !== null);
};
