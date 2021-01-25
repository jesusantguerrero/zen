<template>
  <div
    class="font-bold text-2xl cursor-pointer text-center"
    title="click here to start"
    :class="trackerColor"
    @click="toggleTracker"
  >
    <i class="fas fa-stopwatch" :class="trackerColor"></i>
        {{ currentTime }}
    <div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, reactive,  watch} from "vue"
import { Duration, Interval, DateTime } from "luxon"

// state
const track = reactive({
    started_at: null,
    ended_at: null,
    target_time: null,
    type: 'promodoro',
    duration: null 
})

const state = reactive({
    modes: {
        long: {
            min: 15,
            sec: 0,
            color: 'text-green-400'
        },
        promodoro: {
            min: 25,
            sec: 0,
            color: 'text-red-400'
        },
        rest: {
            min: 5,
            sec: 0,
            color: 'text-blue-400'
        }
    },
    now: null,
    mode: 'promodoro',
    timer: null,
    durationTarget: null
})

const setDurationTarget = () => {
    const {min, sec} = state.modes[state.mode];
    state.durationTarget = Duration.fromISO(`PT${min}M${sec}S`);
}

setDurationTarget();

const trackerColor = computed(() => state.modes[state.mode].color)

// Time manipulation
const targetTime = computed(() => {   
    if (track.started_at && state.now) {
        const targetTime = DateTime.fromJSDate(track.started_at).plus(state.durationTarget)
        return targetTime;
    }
    return null
})
const currentTime = computed(() => {
    if (track.started_at && state.now && state.durationTarget) {
        let duration = Interval.fromDateTimes(track.started_at, state.now).toDuration();
        if (duration) {
            duration = state.durationTarget.minus(duration)
            return duration.as('seconds') < 0 ? "00:00" : duration.toFormat("mm:ss");
        } 
        return "00:00"
    } else {
        return state.durationTarget.toFormat("mm:ss")
    }
})

watch(() => state.now, (now) => {
    if (targetTime.value && now && targetTime.value.diffNow() < 0) {
        stop();
    }
})

// controls

const toggleTracker = () => {
    track.started_at ? stop() : play()
}

const play = () => {
    track.started_at = new Date();
    state.timer = setInterval(() => {
        state.now = new Date()
    }, 100)
}

const stop = () => {
    clearInterval(state.timer);
    save()
    state.now = null
    confirm("Stopped")
    nextMode();
}

const nextMode = () => {
    state.mode = 'rest';
    setDurationTarget();
}

const clearTrack = () => {
    track.started_at = null
    track.ended_at = null
    track.duration = null
    track.target_time = null
}

const save = () => {
    // save to db.
    clearTrack()
}

</script>

<style></style>
