<template>
  <form class="task-form mb-2 bg-white border-transparent border-2 px-4 py-3 rounded-md items-center cursor-default"
     @submit.prevent
     ref="taskForm"
    >
    <div class="flex justify-between">
      <div class="flex items-center w-full">
        <button class="mx-3 rounded-md px-2 py-1 " :class="typeColor"> 
            <i :class="icon"> </i>
        </button>

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
          <tags-select /> 
        </div>
      </div>
    </div>
    
    <el-collapse-transition>
      <div class="task-item__body w-full p-3">
        <textarea 
          v-model="task.description"
          class="task-item__description w-full pt-2 focus:outline-none h-20" 
          placeholder="Add a short description">
        </textarea>
        
        <div class="task-item__checklist">
          <checklist-container :items="task.checklist" :allow-edit="true"></checklist-container>
        </div>
      </div>
    </el-collapse-transition>
  </form>
</template>

<script setup>
import { computed, reactive, defineProps, defineEmit, onMounted, ref, watch, toRefs} from "vue"
import { onClickOutside } from  "@vueuse/core"
import DateSelect from "../atoms/DateSelect.vue"
import TagsSelect from "../atoms/TagsSelect.vue"
import ChecklistContainer from "../organisms/ListContainer.vue";

const props = defineProps({
    mode: {
      Type: String,
      default: 'task'
    },
    placeholder: {
      default: "Add a title"
    },
    type: String,
    taskData: Object,
    allowEdit: Boolean
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
  checklist: [],
  done: false,
  commit_date: null,
  matrix: props.type || "backlog",
})

const { taskData } = toRefs(props);
const setTaskData = (taskData) => {
  if (taskData && task) {
    Object.keys(taskData).forEach((key) => {
      task[key] = taskData[key]
    });
  }
}

watch(() => taskData.value, (taskData) => {
  console.log("hello")
  setTaskData(taskData)
}, { immediate: true, deep: true })

// UI
const state = reactive({
  isExpanded: false
})

const taskForm = ref(null)

onMounted(() => {
  
  onClickOutside(taskForm, () => {
    state.isExpanded = false;
  })
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
  task.matrix = props.type || "backlog";
  task.tags = [];
  task.checklist = [];
}

const save = () => {
  emit('saved', {...task})
  clearForm()
}



</script>

<style lang="scss" scoped>
.task-form {
  height: 400px;
  width: 100%;
}
</style>
