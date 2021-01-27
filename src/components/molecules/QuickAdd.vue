<template>
  <form class="task-item  mb-2 shadow-md bg-white border-gray-200 border-2 px-4 py-3 rounded-md items-center cursor-default"
     @submit.prevent
     @keydown.ctrl.enter="save()"
     @blur="toggleExpanded()"
    >
    <div class="flex justify-between">
      <div class="flex items-center w-full">
        <div class="mx-3 rounded-md px-2 py-1 " :class="typeColor"> 
            <i :class="icon"> 
              <span class="ml-2">
                {{ mode }}
              </span>
            </i>
        </div>

        <div class="w-full">
          <input 
            type="text" 
            class="focus:outline-none w-full px-2" 
            :placeholder="placeholder" 
            v-model="task.title"
            @click="state.isExpanded = true"
          >
        </div>
      </div>

      <div class="task-item__controls flex items-center" v-if="!isReminder">
        <div class="mx-2 text-gray-400 hover:text-gray-600">
          <date-select 
            v-model="task.due_date" 
          />    
        </div>

        <div class="mx-2 text-gray-400 hover:text-gray-600">
          <i class="fa fa-clock"> </i>
        </div>
        <div class="mx-2 text-gray-400 hover:text-gray-600">
          <tags-select /> 
        </div>

        <button class="mx-2 text-gray-400 hover:text-gray-600">
            <i class="fa fa-ellipsis-v cursor-pointer"></i>
        </button>

      </div>
    </div>
    
    <el-collapse-transition>
      <div class="task-item__body w-full p-3" v-if="state.isExpanded">
        <textarea 
          v-model="task.description"
          class="task-item__description w-full pt-2 focus:outline-none" 
          placeholder="Add a short description">
        </textarea>
        
        <div class="task-item__checklist">

        </div>
      </div>
    </el-collapse-transition>
  </form>
</template>

<script setup="props">
import DateSelect from "../atoms/DateSelect.vue"
import TagsSelect from "../atoms/TagsSelect.vue"
import { computed, reactive, defineProps, defineEmit} from "vue"

const props = defineProps({
    mode: {
      Type: String,
      default: 'task'
    },
    placeholder: {
      default: "Add quick task"
    },
    type: String
})
const emit =  defineEmit({
  'saved': (task) => {}
})

const task = reactive({
  title: "",
  description: "",
  due_date: "",
  duration: "",
  tags: [],
  matrix: "todo",
})

// UI
const state = reactive({
  isExpanded: false
})

const isReminder = computed(() => {
  return props.mode == 'reminder'
})

const icon = computed(() => {
  return props.mode == 'reminder' ? 'fa fa-bell' : 'fa fa-plus'
})

const typeColor = computed(() => {
  const colors = {
    todo: 'bg-green-100 text-green-500',
    schedule: 'bg-blue-100 text-blue-500',
    reminder: 'bg-blue-100 text-blue-500',
    delegate: 'bg-yellow-100 text-yellow-500',
    delete: 'bg-red-100 text-red-500',
    backlog: 'bg-gray-100 text-gray-500'
  }

  return colors[props.type] || colors['todo']
})

// functionnality flow
const clearForm = () => {
  task.title = "";
  task.description = "";
  task.due_date = "";
  task.duration = "";
  task.matrix = "todo";
  task.tags = [];
  task.checklist = [];
}

const save = () => {
  emit('saved', {...task})
  clearForm()
}



</script>
