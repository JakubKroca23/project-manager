declare module 'wx-react-gantt' {
    import { ComponentType, ReactNode } from 'react';

    export interface GanttTask {
        id: string | number;
        text: string;
        start: Date;
        end: Date;
        duration?: number;
        progress?: number;
        type?: string;
        parent?: string | number;
        details?: string;
        [key: string]: any;
    }

    export interface GanttScale {
        unit: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
        step: number;
        format: string;
    }

    export interface GanttColumn {
        id: string;
        header: string;
        width?: number;
        flexgrow?: number;
        align?: 'left' | 'center' | 'right';
        template?: (task: GanttTask) => ReactNode;
    }

    export interface GanttProps {
        tasks: GanttTask[];
        links?: any[];
        scales?: GanttScale[];
        columns?: GanttColumn[];
        cellWidth?: number;
        cellHeight?: number;
        start?: Date;
        end?: Date;
        readonly?: boolean;
        [key: string]: any;
    }

    export const Gantt: ComponentType<GanttProps>;
    export const DefaultTheme: ComponentType<{ children: ReactNode }>;
    export const Willow: ComponentType<{ children: ReactNode }>;
    export const Material: ComponentType<{ children: ReactNode }>;
}
