export enum BlockTypes {
    TASK = "task",
    REMINDER = "reminder",
    NOTE = "note",
    STANDUP = "standup",
    DAILY = "daily",
    HABITS = "habits"
}

export enum MatrixTypes {
    TODO = "todo",
    SCHEDULE = "schedule",
    DELEGATE = "delegate",
    DELETE = "delete"
}

export enum StageTypes {
    EXPLORING = "exploring",
    IN_DEV = "in-dev",
    IN_REVIEW = "in-review",
    IN_PROD = "in-prod",
    DONE = "done",
}

export interface StageMeta {
    label: string;
    description: string;
    badgeClass: string;
    dotClass: string;
}

export const STAGE_META: Record<StageTypes, StageMeta> = {
    [StageTypes.EXPLORING]: {
        label: "Exploring",
        description: "Research or investigation — not yet committed to a solution",
        badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
        dotClass: "bg-purple-400",
    },
    [StageTypes.IN_DEV]: {
        label: "In dev",
        description: "Actively being built",
        badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
        dotClass: "bg-blue-400",
    },
    [StageTypes.IN_REVIEW]: {
        label: "In review",
        description: "Waiting on code review, QA, or feedback",
        badgeClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
        dotClass: "bg-yellow-400",
    },
    [StageTypes.IN_PROD]: {
        label: "In prod",
        description: "Shipped and monitoring",
        badgeClass: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
        dotClass: "bg-green-400",
    },
    [StageTypes.DONE]: {
        label: "Done",
        description: "Closed out",
        badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
        dotClass: "bg-gray-400",
    },
};

export const STAGE_ORDER: StageTypes[] = [
    StageTypes.EXPLORING,
    StageTypes.IN_DEV,
    StageTypes.IN_REVIEW,
    StageTypes.IN_PROD,
    StageTypes.DONE,
];
