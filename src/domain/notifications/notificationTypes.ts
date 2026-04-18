export enum NotificationCategory {
    OVERDUE = "overdue",
    REMINDER = "reminder",
    SHARED = "shared",
    SYSTEM = "system",
}

export enum NotificationPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
}

export interface CategoryMeta {
    label: string
    icon: string
    colorClass: string
    bgClass: string
}

export const CATEGORY_META: Record<NotificationCategory, CategoryMeta> = {
    [NotificationCategory.OVERDUE]: {
        label: "Overdue",
        icon: "fa fa-exclamation-triangle",
        colorClass: "text-red-500",
        bgClass: "bg-red-100 dark:bg-red-900/30",
    },
    [NotificationCategory.REMINDER]: {
        label: "Reminder",
        icon: "fa fa-bell",
        colorClass: "text-blue-500",
        bgClass: "bg-blue-100 dark:bg-blue-900/30",
    },
    [NotificationCategory.SHARED]: {
        label: "Shared",
        icon: "fa fa-users",
        colorClass: "text-purple-500",
        bgClass: "bg-purple-100 dark:bg-purple-900/30",
    },
    [NotificationCategory.SYSTEM]: {
        label: "System",
        icon: "fa fa-info-circle",
        colorClass: "text-gray-500",
        bgClass: "bg-gray-100 dark:bg-gray-700/50",
    },
}

export const PRIORITY_META: Record<NotificationPriority, { label: string; colorClass: string; dotClass: string }> = {
    [NotificationPriority.LOW]: {
        label: "Low",
        colorClass: "text-gray-400",
        dotClass: "bg-gray-300",
    },
    [NotificationPriority.MEDIUM]: {
        label: "Medium",
        colorClass: "text-yellow-500",
        dotClass: "bg-yellow-400",
    },
    [NotificationPriority.HIGH]: {
        label: "High",
        colorClass: "text-red-500",
        dotClass: "bg-red-400",
    },
}

export const resolveCategory = (notification: { data?: { category?: string; action?: string } }): NotificationCategory => {
    const raw = notification?.data?.category
    if (raw && Object.values(NotificationCategory).includes(raw as NotificationCategory)) {
        return raw as NotificationCategory
    }
    // Legacy inference: existing notifications set `data.action` instead
    const action = notification?.data?.action
    if (action === "overdue") return NotificationCategory.OVERDUE
    if (action === "stale") return NotificationCategory.OVERDUE
    if (action === "reminder") return NotificationCategory.REMINDER
    return NotificationCategory.SYSTEM
}

export const resolvePriority = (notification: { data?: { priority?: string } }): NotificationPriority => {
    const raw = notification?.data?.priority
    if (raw && Object.values(NotificationPriority).includes(raw as NotificationPriority)) {
        return raw as NotificationPriority
    }
    return NotificationPriority.MEDIUM
}

export interface SnoozeOption {
    label: string
    ms: number
}

export const SNOOZE_OPTIONS: SnoozeOption[] = [
    { label: "1 hour", ms: 60 * 60 * 1000 },
    { label: "4 hours", ms: 4 * 60 * 60 * 1000 },
    { label: "Tomorrow morning", ms: -1 }, // computed per call
    { label: "Next week", ms: 7 * 24 * 60 * 60 * 1000 },
]

export const computeSnoozeUntil = (option: SnoozeOption): Date => {
    if (option.ms > 0) return new Date(Date.now() + option.ms)
    // Tomorrow morning = 9am local
    const d = new Date()
    d.setDate(d.getDate() + 1)
    d.setHours(9, 0, 0, 0)
    return d
}
