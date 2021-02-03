<template>
<div>
  <modal-base v-model:is-open="isOpenLocal" title="Edit task">
      <template #title>
        <div>
          
        </div>
      </template>
      <template #body>
          <form 
              class="task-form mb-2 bg-white border-transparent border-2 px-4 py-3 rounded-md items-center cursor-default"
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
                      >
                      </div>
                  </div>

                  <div class="task-item__controls flex items-center" v-if="!isReminder">
                      <div class="mx-2 text-gray-400 hover:text-gray-600">
                      <date-select 
                          v-model="task.due_date" 
                      />    
                      </div>

                      <div class="text-xl cursor-pointer hover:text-red-400 transition-colors">
                        <i class="fa fa-times my-auto" @click="close()"></i>
                      </div>
                  </div>
              </div>
              
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
          </form>
      </template>

      <template #footer>
          <div class="text-right">
              <button class="bg-green-400 text-white focus:outline-none px-5 py-2 rounded-md" 
              @click.prevent="save()"> 
                Save 
              </button>
          </div>
      </template>
  </modal-base>
</div>
</template>

<script setup>
import { defineProps, ref, watch, computed, reactive, defineEmit, toRefs } from "vue"
import { useTaskFirestore } from "./../../utils/useTaskFirestore"
import DateSelect from "../atoms/DateSelect.vue"
import TagsSelect from "../atoms/TagsSelect.vue"
import ModalBase from "../molecules/ModalBase.vue";
import ChecklistContainer from "./ListContainer.vue";

const props = defineProps({
    isOpen: Boolean,
    taskData: Object,
        mode: {
      Type: String,
      default: 'task'
    },
    placeholder: {
      default: "Add a title"
    },
    type: String,
    allowEdit: Boolean
})

const emit = defineEmit({
    "update:isOpen": Boolean,
    "saved": Object,
    "closed": Boolean
})

const isOpenLocal = ref(false)

watch(()=> props.isOpen, (isOpen) => {
    isOpenLocal.value = isOpen;
}, { immediate: true })

watch(()=> isOpenLocal.value, (isOpen) => {
    emit("update:isOpen", isOpen)
})

// FormData

const task = reactive({
  title: "",
  description: "",
  due_date: "",
  duration: "",
  tags: [],
  checklist: [],
  tracks: [],
  done: false,
  commit_date: null,
  matrix: props.type || "backlog",
})

const { taskData } = toRefs(props);
const setTaskData = (taskData) => {
  if (taskData && task) {
    const data = {...taskData};
    Object.keys(taskData).forEach((key) => {
      task[key] = taskData[key]
    });
  }
}

watch(() => taskData.value, (taskData) => {
  setTaskData(taskData)
}, { immediate: true, deep: true })


const isReminder = computed(() => {
  return props.mode == 'reminder'
})

const icon = computed(() => {
  return 'fa fa-edit'
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

const { updateTask } = useTaskFirestore()
const save = () => {
  const formData =  {...task}
  formData.tracks = [];
  formData.due_date = formData.due_date && typeof formData.due_date != 'string' ? formatDate(formData.due_date, "yyyy-MM-dd") : formData.due_date
  updateTask(task).then(() => {
    emit('saved', task)
    clearForm()
    isOpenLocal.value = false
  }).catch(e => {
    console.log(e)
  })
}

const close = () => {
    emit('closed')
    clearForm()
    isOpenLocal.value = false
}
</script>

<style lang="scss" scoped>
.task-form {
  height: 400px;
  width: 100%;
}
</style>

