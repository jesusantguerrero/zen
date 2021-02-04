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
          No track data to show
        </div>
      </div>
  </div>
</div>
</template>

<script setup>
import { computed, defineProps, toRefs } from "vue";
import { useTracker } from "../../utils/useTracker"

const props = defineProps({
  task: {
    type: Object,
  },
  currentTimer: {
    type: Object
  },
  hideSessions: {
    type: Boolean
  }
});

const { task, currentTimer } = toRefs(props)

const completedPromodoros = computed(() => {
  return task.value.tracks ? task.value.tracks.filter(track => track.completed).length : 0
})
const { timeTracked } = useTracker(task, currentTimer)
</script>

<style></style>
