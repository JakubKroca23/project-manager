import { startOfWeek, endOfWeek, addDays, format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { cs } from "date-fns/locale"

export const COLUMN_WIDTH = 60 // px per day
export const HEADER_HEIGHT = 50 // px

export function getDaysInRange(start: Date, end: Date) {
    return eachDayOfInterval({ start, end })
}

export function formatDateCS(date: Date, formatStr: string) {
    return format(date, formatStr, { locale: cs })
}

export function getPositionFromDate(date: Date, startDate: Date) {
    const diffDays = differenceInDays(date, startDate)
    return diffDays * COLUMN_WIDTH
}

export function getWidthFromDuration(startDate: Date, endDate: Date) {
    // Add 1 day because inclusive
    const days = differenceInDays(endDate, startDate) + 1
    return days * COLUMN_WIDTH
}
