<template>
<div class="flex py-3 bg-white border-gray-100 rounded-md dark:bg-gray-700 dark:border-gray-600">
  <div class="flex">
      <div class="flex items-center justify-center font-extrabold text-gray-400 border-gray-400 rounded-full task__target">
        <span>
          {{ completedPomodoros }}
        </span>
        <i class="ml-1 fas fa-stopwatch" /> 
      </div>

      <div class="items-center ml-1 text-gray-400 sessions md:flex">
        <div v-if="task.title" class="md:flex">
          Totals: 
          <span class="ml-2 font-bold">{{ timeTracked }} </span> 
          <div class="mx-2 font-bold" v-if="!hideSessions">{{ task.tracks && task.tracks.length }} Sessions</div>
        </div>
        
        <div v-else>
          No sessions record to show
        </div>
      </div>
  </div>
</div>
</template>

<script setup>
import { computed, toRefs, watch } from "vue";
import { useTracker } from "../../composables/useTracker";
import { useDateTime } from "../../composables/useDateTime";
import { useTaskFirestore } from "../../_features/tasks";
import { ElNotification } from "element-plus";

const { updateTask } = useTaskFirestore()

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

const completedPomodoros = computed(() => {
  return task.value.tracks ? task.value.tracks.filter(track => track.completed).length : 0
})
const { timeTracked, savedTime } = useTracker(task, currentTimer)
const { formatDurationFromMs } = useDateTime()

watch(() => currentTimer.value, () => {
  if (savedTime) {
    const timeFormatted = formatDurationFromMs(savedTime.value);
    
    if (task.value.uid && task.value.duration_ms != timeFormatted) {
      updateTask({
        uid: task.value.uid,
        duration_ms: timeFormatted.toFormat("hh:mm:ss"),
        duration: savedTime.value
      })
    }
  }
})

</script>
