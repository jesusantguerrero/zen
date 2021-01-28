import { DateTime } from "luxon";
import { computed, ref} from "vue";

export function useDateTime(dateRef) {
    const date = dateRef || ref(null)
    
    const formattedDate = computed(() => {
        return date.value ? toISO(date.value) : "" 
    })

    const toISO = (date) => {
       return date ? DateTime.fromJSDate(date).toISODate() : "" 
    }

    return {
        formattedDate,
        toISO,
        date: date.value
    }
}
