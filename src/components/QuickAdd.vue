<template>
  <div class="task-item flex justify-between mb-2 shadow-md border-gray-200 border-2 px-4 py-3 rounded-md items-center cursor-default">
    <div class="flex items-center">
      <div class="mx-3 rounded-md bg-blue-100 px-2 py-1 text-blue-500"> 
          <i class="fa fa-plus"></i>
      </div>
      <input type="text" class="focus:outline-none" placeholder="Add quick task">
    </div>
    <div class="task-item__controls flex">
      <div class="mx-2">
        <i class="fa fa-clock"></i>
      </div>
      <div class="mx-2">
        <i class="fa fa-tags cursor-pointer"></i>
      </div>
      <div class="mx-2">
          <i class="fa fa-ellipsis-v cursor-pointer"></i>
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
