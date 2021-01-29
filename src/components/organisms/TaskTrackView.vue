<template>
<div class="task__promodoros flex shadow-md bg-white px-5 py-3 border-2 border-gray-100 rounded-md mt-10">
  <div class="flex">
      <div class="task__target rounded-full border-4 border-gray-400 text-gray-400 h-16 w-16 flex justify-center items-center font-extrabold">
        <span class="text-xl">
          {{ Number(task.promodoros || 0) }}
        </span>
        <i class="fas fa-stopwatch ml-1" /> 
      </div>

      <div class="sessions ml-5 flex  text-2xl items-center text-gray-400">
        <div v-if="task.title">
          Totals: 
          <span class="font-bold ml-2">{{ timeTracked }}</span> <span class="font-bold mx-2">{{ task.tracks.length }}</span> session
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
import { useDateTime } from "../../utils/useDateTime"

const { formatDurationFromMs } = useDateTime()
const props = defineProps({
  task: {
    type: Object,
  },
});

const { task }= toRefs(props)

const timeTracked = computed(() => {
  if (task.value.tracks) {
    const time = task.value.tracks.reduce((milliseconds, task)=> {
      return milliseconds + Number(task.duration_ms || 0);
    }, 0)

    return formatDurationFromMs(time).toFormat("hh:mm:ss");
  }
  return 0
})
</script>

<style></style>
