<template>
  <div 
    class="task-item mb-2 shadow-md bg-white border-gray-200 hover:border-green-200 border-2 px-4 py-3 rounded-md items-center transition-all cursor-pointer"
    :class="{'border-green-400': isSelected}"
    @click="emit('selected', task)"
    @dblclick="emit('edited', task)"

  >
    <div class="flex justify-between">
      <div class="flex items-center">
        <div v-if="handleMode" class="handle text-gray-300 cursor-move mr-2"><i class="fa fa-arrows-alt"></i></div>
        
        <div 
          v-if="showSelect" 
          class="mr-3 rounded-md px-2 py-1 border-2 border-transparent hover:bg-green-400 hover:text-white" 
          :class="[isDisabled && 'cursor-not-allowed', isSelected ? 'bg-green-400 text-white' : 'bg-green-100 text-green-400']"
          :title="isDisabled? 'Can change task when timer is running' : 'Click to select'"
          :disabled="isDisabled"
          @click.stop="emit('selected', task)"
        > 
            <i :class="[!task.is_key ? 'fa fa-sticky-note' : 'fa fa-fire']"></i>
        </div>
        <div v-else class="mr-3 rounded-md px-2 py-1 border-2 border-transparent" :class="[typeColor, keyStyles]"> 
            <i :class="[!task.is_key ? 'fa fa-sticky-note' : 'fa fa-fire']"></i>
        </div>
        <h4 class="cursor-pointer m-0 text-left"> {{ task.title }}</h4>
      </div>

      <div class="task-item__controls flex items-center">  
        <div class="md:flex">
          <div class="task-item__tracked mx-2 text-gray-400 hover:text-gray-600 md:text-md cursor-default"
            title="Time tracked">
            <i class="fa fa-clock mr-1"></i>
            <span> {{ timeTrackedLabel }}</span>
          </div>

          <div class="cursor-default md:text-xs w-20" :class="dateStates.color" :title="dateStates.title" v-if="task.due_date">
            <i class="fa fa-calendar mr-1"></i>
            <span> {{ task.due_date }}</span>
          </div>
        </div>

        <el-dropdown trigger="click" @command="handleCommand" v-if="showControls" :disabled="isDisabled" @click.stop="">
          <div class="mx-2 text-gray-400 hover:text-gray-600" :title="isDisabled? 'Can updates tasks when timer is running' : ''">
            <i class="fa fa-ellipsis-v"></i>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="edit" icon="el-icon-edit">Edit</el-dropdown-item>
              <el-dropdown-item command="delete" icon="el-icon-delete">Delete </el-dropdown-item>
              <el-dropdown-item command="toggle-key" icon="el-icon-key" v-if="task.matrix=='todo'"> Key task </el-dropdown-item>
              <el-dropdown-item command="up" icon="el-icon-arrow-up" v-if="task.matrix=='schedule'">Move Up</el-dropdown-item>
              <el-dropdown-item command="down" icon="el-icon-arrow-down" v-if="task.matrix=='todo'">Move down</el-dropdown-item>
            </el-dropdown-menu>
          </template>
      </el-dropdown>
      </div>
    </div>

    <div class="flex items-center mt-1 text-xs" :class="{'justify-between': task.due_date }">
      <button 
        title="Description" 
        class="px-2 py-1 rounded-md border-2 border-gray-200 hover:bg-gray-200 focus:outline-none" 
        @click.stop="toggleExpand" v-if="task.description || task.checklist.length">
        <i class="fa fa-align-left"></i>
      </button>
      <div class="text-right w-full">
        <span v-for="tag in task.tags" :key="tag.name" class="mr-1 bg-gray-200 px-2 py-1 rounded-md"> {{ tag.name}}</span>
      </div>
    </div>

    <!-- Item body -->
    <el-collapse-transition>
      <div class="task-item__body" v-show="isExpanded">
        <div
          class="task-item__description pt-2 text-left whitespace-pre-line" 
          placeholder="Add a short description"
          :class="{'text-gray-400 text-sm': !task.description }">
            {{ task.description || 'No description provided'}}
      </div>
        <div class="task-item__checklist">
          <checklist-container :items="task.checklist" :task="task"  @updated="updateItems"></checklist-container>
        </div>
      </div>
    </el-collapse-transition>
    <!-- /item body -->
  </div>

</template>

<script setup>
import { defineProps, toRefs, ref, computed, defineEmit, watch } from "vue"
import ChecklistContainer from "../organisms/ListContainer.vue"
import { ElNotification } from "element-plus";
import { useDateTime } from "../../utils/useDateTime";

const props = defineProps({
  task: Object,
  type: String,
  currentTask: Object,
  handleMode: Boolean,
  showSelect: Boolean,
  showControls: Boolean,
  currentTimer: Object,
  isItemAsHandler: Boolean
})
const emit = defineEmit({
  deleted: Object,
  selected: Object,
  edited: Object,
  up: Object,
  down: Object,
})

const { task, currentTask, currentTimer} = toRefs(props)

const timeTrackedLabel = computed(() => {
  return task.value.duration_ms ||  "00:00:00"
})


const typeColor = computed(() => {
  const colors = {
    todo: `bg-green-100 ${task.value.is_key ? 'text-gray-100' : 'text-green-500'}`,
    schedule: 'bg-blue-100 text-blue-500',
    delegate: 'bg-yellow-100 text-yellow-500',
    delete: 'bg-red-100 text-red-500',
    backlog: 'bg-gray-100 text-gray-500'
  }

  return colors[props.type] || colors['todo']
})

const keyStyles = computed(() => {
  return task.value.is_key && props.type == 'todo' ? 'border-green-300 border-2 bg-green-500 text-white' : ''
})


const isDisabled = computed(() => {
  return currentTimer.value && currentTimer.value.task_uid;
})

const isSelected = computed(( ) => {
  return currentTask.value && currentTask.value.uid == task.value.uid
})

const { formatDate } = useDateTime()
const dateStates = computed(() => {
  const stateStyles = {
    normal: {
      color: 'text-gray-400',
      title: 'due date'
    },
    due: {
      color: 'text-blue-400',
      title: 'due to today'
    },
    overdue: {
      color: 'text-red-400',
      title: 'Overdue'
    }
  }

  let dateState = 'normal';
  if (task.value.due_date == formatDate()) {
    dateState = 'due' 
  } else if (task.value.due_date && task.value.due_date < formatDate()) {
    dateState = 'overdue'
  }

  return  stateStyles[dateState]
});

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
    case 'toggle-key':
      emit('toggle-key', task)
    default:
      break;
  }
}

const isExpanded = ref(false);
const toggleExpand = () => {
isExpanded.value = !isExpanded.value
}

const updateItems = () => {
  ElNotification({
    title: 'changed'
  })
}

</script>


<style lang="scss" scoped>
.task-item__tracked {
  width: 90px;
}

.task-item__description {
  overflow-wrap: break-word;
}
</style>
