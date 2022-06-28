import { computed, ref, watch} from "vue";
import { format } from "date-fns"
import { useDateTime } from "./useDateTime"

const { formatDurationFromMs } = useDateTime()
const timeReducer = (tracks) => {
    if (!tracks) return 0
    return tracks.reduce((milliseconds, task)=> {
        return milliseconds + Number(task.duration_ms || 0);
    }, 0)
}

export function useTracker(taskRef, currentTimerRef) {
    const task = taskRef || ref(null)
    const currentTimer = currentTimerRef || ref({})
    
    const savedTime = computed(() => {
        return timeReducer(task.value.tracks)
    })
      
    const activeTimer = ref(0);
      
    const getActiveTimer = () => {
        const duration = currentTimer && currentTimer.value && currentTimer.value.currentTime
        if (duration) {
        return duration.as("milliseconds");
        }
        return 0;
    }
      
    watch(() => currentTimer.value.currentTime, () => {
        activeTimer.value = getActiveTimer()
    }, { immediate: true })
    
    const timeTracked = computed(() => {
        return formatDurationFromMs(savedTime.value + activeTimer.value).toFormat("hh:mm:ss");
    })

    return {
        timeTracked,
        savedTime
    }
}

export const getMilliseconds = timeReducer

export const formatDateToTime = (firebaseDate) => {
    if (!firebaseDate) return "--"
    return format(firebaseDate.toDate(), "HH:mm:ss");
}

export const durationFromMs = (ms) => {
    const date = new Date(ms);
    return date
        .toISOString()
        .slice(11, -2)
        .split(":")
        .map(unit => {
            return Math.round(unit)
                .toString()
                .padStart(2, "0");
        })
        .join(":");
}
