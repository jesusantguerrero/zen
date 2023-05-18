<template>
<div class="flex px-5 py-3 mt-10 bg-white border-2 border-gray-100 rounded-md shadow-md task__promodoros dark:bg-gray-700 dark:border-gray-600">
  <div class="flex">
      <div class="flex items-center justify-center w-16 h-16 font-extrabold text-gray-400 border-4 border-gray-400 rounded-full task__target">
        <span class="text-xl">
          {{ completedPomodoros }}
        </span>
        <i class="ml-1 fas fa-stopwatch" /> 
      </div>

      <div class="items-center ml-5 text-gray-400 sessions md:flex md:text-2xl">
        <div v-if="task.title" class="md:flex">
          <span class="ml-2 font-bold">{{ timeTracked }} </span> 
          <div class="mx-2 font-bold" v-if="!hideSessions">{{ task.tracks && task.tracks.length }}x</div>
        </div>
        
        <div class="text-lg">
          (Tracked today: {{ totalTimeToday }})
        </div>
      </div>
  </div>
</div>
</template>

<script setup>
import { computed, toRefs, onUnmounted, reactive } from "vue";
import { useTracker } from "@/utils/useTracker";
import { useTaskFirestore } from "@/utils/useTaskFirestore";
import { useTrackFirestore } from "@/utils/useTrackFirestore";
import { formatDurationFromMs, getDurationOfTracks } from "@/utils/useDateTime";

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

const completedPomodoros= computed(() => {
  return task.value.tracks ? task.value.tracks.filter(track => track.completed).length : 0
})
const { timeTracked } = useTracker(task, currentTimer)

const state = reactive({
  firebaseRefs: {},
  tracked: []
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
 
  return getDurationOfTracks(state.tracked);
})

onUnmounted(() => {
  Object.values(state.firebaseRefs).forEach((firebaseRef) => {
    if (firebaseRef) firebaseRef()
  })
});
</script>
