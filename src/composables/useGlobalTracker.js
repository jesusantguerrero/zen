import { inject } from "vue";

export const useGlobalTracker = () => {
    const currentTimer= inject('currentTimer', {});
    const currentTask = inject('currentTask', {});
    const timerSubtype = inject('timerSubtype', null);
    const setCurrentTask = inject('setCurrentTask');
    const setCurrentTimer = inject('setCurrentTimer');

    return {
        currentTimer,
        currentTask,
        setCurrentTask,
        setCurrentTimer,
        timerSubtype
    }
}