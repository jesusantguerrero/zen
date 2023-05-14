import { Ref, inject, ref } from "vue";
import { ITrack } from "./useTrackFirestore";
import { ITask } from "./useTaskFirestore";

export const useGlobalTracker = () => {
    const currentTimer= inject<Ref<Partial<ITrack>>>('currentTimer', ref({}));
    const currentTask = inject<Ref<Partial<ITask>>>('currentTask', ref({}));
    const timerSubtype = inject<Ref<string|null>>('timerSubtype', ref(null));
    const setCurrentTask = inject('setCurrentTask', (task: Partial<ITask>) => {});
    const onTrackAdded = inject('onTrackAdded', (track: Partial<ITrack>) => {});

    return {
        currentTimer,
        currentTask,
        setCurrentTask,
        timerSubtype,
        onTrackAdded
    }
}