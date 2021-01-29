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
          <span class="font-bold ml-2">30 minutes</span>, <span class="font-bold mr-2">1</span> session
        </div>
        <div v-else class="text-lg">
          No track data to show
        </div>
      </div>
  </div>
</div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  task: {
    type: Object,
  },
});
</script>

<style></style>
