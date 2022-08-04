import { inject } from "vue";

export const useGlobalTracker = () => {
    const currentTimer= inject('currentTimer', {});
    const currentTask = inject('currentTask', {});
    const setCurrentTask = inject('setCurrentTask');

    return {
        currentTimer,
        currentTask,
        setCurrentTask
    }
}