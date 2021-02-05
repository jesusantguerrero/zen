<template>
  <div class="task-item flex justify-between mb-2 shadow-md bg-white border-gray-200 border-2 px-4 py-3 rounded-md items-center cursor-default"
  :class="{'border-green-400': isSelected }"
  >
    <div class="flex items-center">
      <div v-if="handleMode" class="handle text-gray-300 cursor-move"><i class="fa fa-arrows-alt"></i></div>
      <div v-else-if="showSelect" class="flex items-center">
        <input
            type="checkbox"
            class="checkbox-done"
            :class="{'cursor-not-allowed': isDisabled}"
            name=""
            id=""
            :title="isDisabled? 'Can change task when timer is running' : ''"
            :disabled="isDisabled"
            :checked="isSelected"
            @click="emitSelected()"
        >
      </div>
      <div class="mx-3 rounded-md px-2 py-1" :class="typeColor"> 
          <i class="fa fa-sticky-note"></i>
      </div>
      <h4> {{ task.title }}</h4>
    </div>

    <div class="task-item__controls flex items-center">  
      <div class="mx-2 text-gray-400 hover:text-gray-600 cursor-pointer"
        title="Time tracked"
        >
        <i class="fa fa-clock mr-1"></i>
        <span> {{ timeTrackedLabel }}</span>
      </div>
      <div class="mx-2">
        <i class="fa fa-calendar mr-1 text-gray-400 hover:text-gray-600"></i>
        <span> {{ task.due_date }}</span>
      </div>

      <el-dropdown trigger="click" @command="handleCommand" v-if="showControls" :disabled="isDisabled">
        <div class="mx-2 text-gray-400 hover:text-gray-600" :title="isDisabled? 'Can updates tasks when timer is running' : ''">
          <i class="fa fa-ellipsis-v"></i>
        </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="edit" icon="el-icon-edit">Edit</el-dropdown-item>
          <el-dropdown-item command="delete" icon="el-icon-delete">Delete </el-dropdown-item>
          <el-dropdown-item command="up" icon="el-icon-arrow-up" v-if="task.matrix=='schedule'">Move Up</el-dropdown-item>
          <el-dropdown-item command="down" icon="el-icon-arrow-down" v-if="task.matrix=='todo'">Move down</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { defineProps, toRefs, ref, computed, defineEmit, watch } from "vue"
import { useTracker } from "../../utils/useTracker";
import { useTaskFirestore } from "../../utils/useTaskFirestore";

const { updateTask } = useTaskFirestore()
const props = defineProps({
  task: Object,
  type: String,
  currentTask: Object,
  handleMode: Boolean,
  showSelect: Boolean,
  showControls: Boolean,
  currentTimer: Object
})
const emit = defineEmit({
  deleted: Object,
  selected: Object,
  edited: Object,
  up: Object,
  down: Object,
})

const { task, currentTask, currentTimer} = toRefs(props)

const { timeTracked } = useTracker(task)

watch(() => task.value.tracks.length, () => {
  if (task.value.uid && task.value.tracks.length && task.value.duration_ms != timeTracked.value) {
    updateTask({
      uid: task.value.uid,
      duration_ms: timeTracked.value
    })
  }
})


const timeTrackedLabel = computed(() => {
  return task.value.tracks && !task.value.tracks.length && task.value.duration_ms ?  task.value.duration_ms : timeTracked.value
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


const isDisabled = computed(() => {
  return currentTimer.value && currentTimer.value.task_uid;
})

const isSelected = computed(( ) => {
  return currentTask.value && currentTask.value.uid == task.value.uid
})

const emitSelected = (task) => {
  emit('selected', task)
}
const handleCommand = (commandName) => {
  switch (commandName) {
    case 'delete':
      emit('deleted', task);
      break;
    case 'edit':
      emit('edited', task)
      break
    case 'up':
      emit('up', task)
      break
    case 'down':
      emit('down', task)
      break
    default:
      break;
  }
}
</script>
