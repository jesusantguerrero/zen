import { format, isToday, isTomorrow, formatRelative, isThisWeek, isThisYear, isDate } from "date-fns";
import { DateTime, Duration } from "luxon";
import { computed, ref} from "vue";

export const formatDurationFromMs = (ms) => {
    try {
        return Duration.fromMillis(ms)
    } catch (err) {
        console.log(ms)
        return 0
    }
}

export const getDurationOfTracks = (tracks) => {
    const milliseconds = tracks.reduce((total, track) => {
        if (track.ended_at && track.duration_ms) {
        return total + (track.duration_ms ?? 0)
        }
        return total;
    }, 0) ?? 0
    
    return formatDurationFromMs(milliseconds).toFormat('hh:mm:ss')
}
export const getDurationInMs = (tracks) => {
    const milliseconds = tracks.reduce((total, track) => {
        if (track.ended_at && track.duration_ms) {
        return total + (track.duration_ms ?? 0)
        }
        return total;
    }, 0) ?? 0
    
    return milliseconds
}

export function useDateTime(dateRef) {
    const date = dateRef || ref(null)
    
    const formattedDate = computed(() => {
        return date.value && typeof date.value == 'object' ? toISO(date.value) : date.value;
    })

    const humanDate = computed(() => {
        const isoDate = date.value && typeof date.value == 'object' ? date.value : date.value;
        if (!isDate(isoDate)) {
            return isoDate;
        }
        if (isToday(isoDate)) {
            return 'Today';
        } else if (isTomorrow(isoDate)) {
            return 'Tomorrow';
        } else if (isThisWeek(isoDate)) {
            return formatRelative(date.value, new Date()).replace(' at 12:00 AM', '');
        } else if (isThisWeek(isoDate)) {
            return format(date.value, 'iiii');
        } else if (isThisYear(isoDate)) {
            return format(isoDate, 'MMM dd')
        } else {
            return format(isoDate, 'MMM dd yyyy')
        }
    })

    const formatDate = (date, format) => {
       return DateTime.fromJSDate(date || new Date()).toFormat(format || "yyyy-MM-dd");
    }

    const toISO = (date) => {
       return date ? DateTime.fromJSDate(date).toISODate() :  ""
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
        date: date.value,
        humanDate
    }
}
