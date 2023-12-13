<template>
<div class="flex px-5 py-3 mt-10 bg-white border-2 border-gray-100 rounded-md text-gray-400 dark:text-white shadow-md task__promodoros dark:bg-base-lvl-2 dark:border-base-lvl-3">
  <div class="flex">
      <div class="flex items-center justify-center w-16 h-16 font-extrabold  border-4 border-gray-400 dark:border-base-lvl-3 rounded-full task__target">
        <span class="text-xl">
          {{ completedPomodoros }}
        </span>
        <i class="ml-1 fas fa-stopwatch" /> 
      </div>

      <div class="items-center ml-5 sessions md:flex md:text-2xl">
        <div v-if="task.title" class="md:flex">
          <div class="mx-2 font-bold" v-if="!hideSessions">{{ task.tracks && task.tracks.length }}x</div>
        </div>
        
        <div class="text-lg">
          Tracked today: {{ totalTimeToday }}
        </div>
      </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { computed, toRefs, onUnmounted, reactive } from "vue";
import { useTaskFirestore } from "@/plugins/firebase/useTaskFirestore";
import { useTrackFirestore } from "@/plugins/firebase/useTrackFirestore";
import { formatDurationFromMs, getDurationInMs } from "@/composables/useDateTime";

const { updateTask } = useTaskFirestore()
// tracked tasks


const props = defineProps({
  task: {
    type: Object,
  },
  currentTimer: {
    type: Object,
    default() {
      return {}
    }
  },
  hideSessions: {
    type: Boolean
  }
});

const { task, currentTimer } = toRefs(props)

const state = reactive({
  firebaseRefs: {},
  tracked: []
})

const completedPomodoros= computed(() => {
  return state.tracked ? state.tracked.filter(track => track.completed).length : 0
})

const  { getTracksByDates } = useTrackFirestore()
const fetchTracked = (date) => {
  return getTracksByDates(date).then(trackedRef => {
    state.firebaseRefs['tracked'] = trackedRef.onSnapshot( snap => {
      const list = []
      snap.forEach(doc => {
        const track = doc.data()
          list.push({ ...track, uid: doc.id })
      })
      state.tracked = list;
    })
  })
}

fetchTracked(new Date());


const totalTimeToday = computed(() => {
  const duration = currentTimer && currentTimer.value && currentTimer.value.currentTime
  let todayTrackedTime = getDurationInMs(state.tracked);
  if (duration) {
      todayTrackedTime +=  duration;
  }
  return formatDurationFromMs(todayTrackedTime).toFormat('hh:mm:ss');
})

onUnmounted(() => {
  Object.values(state.firebaseRefs).forEach((firebaseRef) => {
    if (firebaseRef) firebaseRef()
  })
});
</script>