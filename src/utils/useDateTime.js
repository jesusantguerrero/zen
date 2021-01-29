import { DateTime, Duration } from "luxon";
import { computed, ref} from "vue";

export function useDateTime(dateRef) {
    const date = dateRef || ref(null)
    
    const formattedDate = computed(() => {
        return date.value ? toISO(date.value) : "" 
    })

    const toISO = (date) => {
       return date ? DateTime.fromJSDate(date).toISODate() : "" 
    }

    const formatDurationFromMs = (ms) => {
        return Duration.fromMillis(ms).as('mi')
    }

    return {
        formattedDate,
        toISO,
        formatDurationFromMs,
        date: date.value
    }
}
