<template>
  <div class="task-item flex justify-between mb-2 shadow-md border-gray-200 border-2 px-4 py-3 rounded-md items-center cursor-default">
    <div class="flex items-center">
      <div><i class="fa fa-chevron-down cursor-pointer"></i></div>
      <div class="mx-3 rounded-md bg-blue-100 px-2 py-1 text-blue-500"> 
          <i class="fa fa-sticky-note"></i>
      </div>
      <h4>Task Title</h4>
    </div>
    <div class="task-item__controls flex">
      <div class="mx-2">Time</div>
      <div class="mx-2">Tags</div>
      <div class="mx-2">
          <i class="fa fa-ellipsis-v"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue"

defineProps({
    task: String
})
</script>
