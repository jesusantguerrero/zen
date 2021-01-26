import { DateTime } from "luxon";
import { computed } from "vue";

export function useDateTime(dateRef) {
    const date = dateRef
    
    const formattedDate = computed(() => {
        return date.value ? DateTime.fromJSDate(date.value).toISODate() : ""
    })

    return {
        formattedDate,
        date: date.value
    }
}
