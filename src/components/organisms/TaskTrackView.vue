<template>
<div class="flex px-5 py-3 mt-10 bg-white border-2 border-gray-100 rounded-md shadow-md task__promodoros dark:bg-gray-700 dark:border-gray-600">
  <div class="flex">
      <div class="flex items-center justify-center w-16 h-16 font-extrabold text-gray-400 border-4 border-gray-400 rounded-full task__target">
        <span class="text-xl">
          {{ completedPomodoros}}
        </span>
        <i class="ml-1 fas fa-stopwatch" /> 
      </div>

      <div class="items-center ml-5 text-gray-400 sessions md:flex md:text-2xl">
        <div v-if="task.title" class="md:flex">
          Totals: 
          <span class="ml-2 font-bold">{{ timeTracked }} </span> 
          <div class="mx-2 font-bold" v-if="!hideSessions">{{ task.tracks && task.tracks.length }} Sessions</div>
        </div>
        
        <div v-else class="text-lg">
          No data to show
        </div>
      </div>
  </div>
</div>
</template>

<script setup>
import { computed, toRefs, watch, nextTick } from "vue";
import { useTracker } from "../../utils/useTracker";
import { useDateTime } from "../../utils/useDateTime";
import { useTaskFirestore } from "../../utils/useTaskFirestore";

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

const completedPomodoros= computed(() => {
  return task.value.tracks ? task.value.tracks.filter(track => track.completed).length : 0
})
const { timeTracked } = useTracker(task, currentTimer)


</script>
