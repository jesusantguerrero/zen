<template>
<div class="task__promodoros flex shadow-md bg-white px-5 py-3 border-2 border-gray-100 rounded-md mt-10">
  <div class="flex">
      <div class="task__target rounded-full border-4 border-gray-400 text-gray-400 h-16 w-16 flex justify-center items-center font-extrabold">
        <span class="text-xl">
          {{ completedPromodoros }}
        </span>
        <i class="fas fa-stopwatch ml-1" /> 
      </div>

      <div class="sessions ml-5 md:flex md:text-2xl items-center text-gray-400">
        <div v-if="task.title" class="md:flex">
          Totals: 
          <span class="font-bold ml-2">{{ timeTracked }} </span> 
          <div class="font-bold mx-2" v-if="!hideSessions">{{ task.tracks && task.tracks.length }} Sessions</div>
        </div>
        
        <div v-else class="text-lg">
          No data to show
        </div>
      </div>
  </div>
</div>
</template>

<script setup>
import { computed, defineProps, toRefs, watch } from "vue";
import { useTracker } from "../../utils/useTracker";
import { useDateTime } from "../../utils/useDateTime";
import { useTaskFirestore } from "../../utils/useTaskFirestore";
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

const completedPromodoros = computed(() => {
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
