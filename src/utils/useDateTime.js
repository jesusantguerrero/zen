import { DateTime, Duration } from "luxon";
import { computed, ref} from "vue";

export function useDateTime(dateRef) {
    const date = dateRef || ref(null)
    
    const formattedDate = computed(() => {
        return date.value && typeof date.value == 'object' ? toISO(date.value) : date.value;
    })

    const formatDate = (date, format) => {
       return DateTime.fromJSDate(date || new Date()).toFormat(format || "yyyy-MM-dd");
    }

    const toISO = (date) => {
       return date ? DateTime.fromJSDate(date).toISODate() :  ""
    }

    const formatDurationFromMs = (ms) => {
        return Duration.fromMillis(ms)
    }

    const getDateFromString = (dateValue) => {
        const date = dateValue ? dateValue.split("-") : null;
        return date ? new Date(date[0], date[1] - 1, date[2]) : null;
    }

    return {
        formattedDate,
        toISO,
        formatDate,
        formatDurationFromMs,
        getDateFromString,
        date: date.value
    }
}
