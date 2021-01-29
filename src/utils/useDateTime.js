import { DateTime, Duration } from "luxon";
import { computed, ref} from "vue";

export function useDateTime(dateRef) {
    const date = dateRef || ref(null)
    
    const formattedDate = computed(() => {
        return date.value ? toISO(date.value) : "" 
    })

    const formatDate = (date, format) => {
       return DateTime.fromJSDate(date || new Date()).toFormat(format || "yyyy-MM-dd");
    }

    const toISO = (date) => {
       return date ? DateTime.fromJSDate(date).toISODate() : "" 
    }

    const formatDurationFromMs = (ms) => {
        return Duration.fromMillis(ms)
    }

    return {
        formattedDate,
        toISO,
        formatDate,
        formatDurationFromMs,
        date: date.value
    }
}
