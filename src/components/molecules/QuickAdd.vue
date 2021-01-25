<template>
  <div class="task-item flex justify-between mb-2 shadow-md border-gray-200 border-2 px-4 py-3 rounded-md items-center cursor-default">
    <div class="flex items-center w-full">
      <div class="mx-3 rounded-md bg-blue-100 px-2 py-1 text-blue-500"> 
          <i :class="icon"> 
            <span class="ml-2">
              {{ mode }}
            </span>
          </i>
      </div>

      <div class="w-full">
        <input type="text" class="focus:outline-none w-full px-2" :placeholder="placeholder">
      </div>
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

<script setup="props">
import { computed, reactive, defineProps } from "vue"

const props = defineProps({
    mode: {
      Type: String,
      default: 'task'
    },
    placeholder: {
      default: "Add quick task"
    }
})


const title = reactive("My Team")
const icon = computed(() => {
  return props.mode == 'reminder' ? 'fa fa-bell' : 'fa fa-plus'
})
</script>
