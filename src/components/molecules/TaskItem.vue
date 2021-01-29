<template>
  <div class="task-item flex justify-between mb-2 shadow-md bg-white border-gray-200 border-2 px-4 py-3 rounded-md items-center cursor-default">
    <div class="flex items-center">
      <div><i class="fa fa-chevron-down cursor-pointer"></i></div>
      <div class="mx-3 rounded-md px-2 py-1" :class="typeColor"> 
          <i class="fa fa-sticky-note"></i>
      </div>
      <h4> {{ task.title }}</h4>
    </div>
    <div class="task-item__controls flex">
      
      <el-tooltip class="item" effect="dark" content="Add to zen" placement="top">
        <div class="mx-2 text-gray-400 hover:text-gray-600 cursor-pointer" @click="emitSelected()"
          title="Add to zen"
          >
          <i class="fa fa-clock"></i>
        </div>
      </el-tooltip>
      <div class="mx-2">
        <i class="fa fa-calendar mr-2 text-gray-400 hover:text-gray-600"></i>
        <span> {{ formattedDate }}</span>
      </div>
      <div class="mx-2 text-gray-400 hover:text-gray-600">
        <i class="fa fa-tags"></i>
      </div>
      <div class="mx-2 text-gray-400 hover:text-gray-600" @click="emitDeleted">
          <i class="fa fa-ellipsis-v"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, toRefs, ref, computed, defineEmit } from "vue"
import { useDateTime } from "../../utils/useDateTime";

const props = defineProps({
  task: Object,
  type: String
})

const emit = defineEmit({
  deleted: Object,
  selected: Object
})

const typeColor = computed(() => {
  const colors = {
    todo: 'bg-green-100 text-green-500',
    schedule: 'bg-blue-100 text-blue-500',
    delegate: 'bg-yellow-100 text-yellow-500',
    delete: 'bg-red-100 text-red-500',
    backlog: 'bg-gray-100 text-gray-500'
  }

  return colors[props.type] || colors['todo']
})

const emitDeleted = (task) => {
  emit('deleted', task)
}
const emitSelected = (task) => {
  emit('selected', task)
}

const { task } = toRefs(props)

const { formattedDate } = useDateTime(ref(task.value.due_date))
</script>
