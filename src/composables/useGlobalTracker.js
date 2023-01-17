import { inject } from "vue";

export const useGlobalTracker = () => {
    const currentTimer= inject('currentTimer', {});
    const currentTask = inject('currentTask', {});
    const timerSubtype = inject('timerSubtype', null);
    const setCurrentTask = inject('setCurrentTask');

    return {
        currentTimer,
        currentTask,
        setCurrentTask,
        timerSubtype
    }
}