export const TaskTypeColors = {
    todo: 'bg-green-100 dark:bg-gray-600 dark:border-gray-500',
    schedule: 'bg-blue-100 dark:bg-gray-600 dark:border-gray-500 dark:text-blue-500 text-blue-500',
    delegate: 'bg-yellow-100 dark:bg-gray-600 dark:border-gray-500 dark:text-yellow-400 text-yellow-500',
    delete: 'bg-red-100 dark:bg-gray-600 dark:border-gray-500 text-red-400',
    backlog: 'bg-gray-100 text-gray-500 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300'
}

export const TaskMatrix = {
    TODO: 'todo',
    SCHEDULE: 'schedule',
    DELEGATE: 'delegate',
    DELETE: 'delete'
}

export const getTaskColorClass = (task) => {
    const colorClass = TaskTypeColors[task.matrix];
    const keyClass = task.is_key ? 'text-gray-100 ' : 'text-green-500'
    return colorClass + ' ' + keyClass
}

export const GLOBAL_EVENTS = {
    track: {
        play: 'track::play'
    }
}