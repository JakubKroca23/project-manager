import { startOfWeek, endOfWeek, addDays, format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { cs } from "date-fns/locale"

// 60 px per day is default
export const ZOOM_LEVELS = {
    day: 60,
    week: 20,
    month: 10
}

export const COLUMN_WIDTH = 60 // fallback for legacy imports
export const HEADER_HEIGHT = 50 // px

export function getDaysInRange(start: Date, end: Date) {
    return eachDayOfInterval({ start, end })
}

export function formatDateCS(date: Date, formatStr: string) {
    return format(date, formatStr, { locale: cs })
}

export function getPositionFromDate(date: Date, startDate: Date, width: number = COLUMN_WIDTH) {
    const diffDays = differenceInDays(date, startDate)
    return diffDays * width
}

export function getWidthFromDuration(startDate: Date, endDate: Date, width: number = COLUMN_WIDTH) {
    // Add 1 day because inclusive
    const days = differenceInDays(endDate, startDate) + 1
    return days * width
}
