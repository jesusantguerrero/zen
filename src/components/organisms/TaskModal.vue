<script setup lang="ts">
import { ElMessageBox } from "element-plus"
import { ref, watch, computed, reactive, toRefs } from "vue"

import DateSelect from "../atoms/DateSelect.vue"
import TagsSelect from "../atoms/TagsSelect.vue"
import PersonSelect from "../atoms/PersonSelect.vue"
import ModalBase from "../molecules/ModalBase.vue";
import ChecklistContainer from "./ListContainer.vue";

import { useTaskFirestore } from "@/plugins/firebase/useTaskFirestore"
import { useDateTime } from "@/composables/useDateTime"
import { useCustomSelect } from "@/plugins/firebase/useCustomSelect"


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

const emit = defineEmits({
    "update:isOpen": Boolean,
    "saved": Object,
    "closed": Boolean
})

const state = reactive({
  isOpenLocal: false,
  checklistTitle: ""
})

watch(()=> props.isOpen, (isOpen) => {
    state.isOpenLocal = isOpen;
}, { immediate: true })

watch(()=> state.isOpenLocal, (isOpen) => {
    emit("update:isOpen", isOpen)
    if (isOpen) {
      setHeight()
    }
})

// FormData
const descriptionInput = ref(null);
const setHeight = () => {
  setTimeout(() => {
    const description = descriptionInput.value;
    if (!description) {
      return
    }
    description.style.height = "";
    description.style.height = description.scrollHeight + "px"
  }, 10)
}

const task = reactive({
  uid: false,
  title: "",
  description: "",
  due_date: "",
  duration: "",
  tags: [],
  contacts: [],
  checklist: [],
  tracks: [],
  done: false,
  commit_date: null,
  matrix: props.type || "backlog",
})

const { taskData } = toRefs(props);

const setTaskData = (taskData) => {
  if (taskData && task) {
    const data = Object.assign(taskData, {});
    
    Object.keys(data).forEach((key) => {
      const objectData = data[key]
      task[key] = Array.isArray(objectData) ? [...objectData] : objectData
    });
  }
}

watch(()=> props.isOpen, (isOpen) => {
  if(taskData.value || state.isOpenLocal) {
    setTaskData(taskData.value)
  }
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
  task.uid = false;
  task.title = "";
  task.description = "";
  task.due_date = "";
  task.duration = "";
  task.matrix = props.type || "backlog";
  task.tags = [];
  task.contacts = [];
  task.checklist = [];
}

const { updateTask } = useTaskFirestore()
const { formatDate } = useDateTime()
const confirmChecklist = async () => {
  let canSave = true;
  if (state.checklistTitle) {
    canSave = await ElMessageBox.confirm(`There are an unsaved checklist item`, "Are you sure?", {
      confirmButtonText: "Add item and save",
      cancelButtonText: "Remove item and save"
    }).then(() => true).catch(() => false)

    if (canSave) {
      task.checklist.push({ 
        title: state.checklistTitle,
        done: false
      });
    } 
  }
  
  state.checklistTitle = "";
}

const save = async () => {
  await confirmChecklist();
  // check item

  const formData =  {...task}
  formData.tracks = [];
  formData.due_date = formData.due_date && typeof formData.due_date == 'object' ? formatDate(formData.due_date , "yyyy-MM-dd") : formData.due_date
  updateTask(formData).then(() => {
    emit('saved', formData)
    clearForm()
    state.isOpenLocal = false
  })
}

const close = () => {
    emit('closed')
    state.isOpenLocal = false
    clearForm()
}

// tags
const {list: tags, addToList: createTag, selectItem: addTag} = useCustomSelect(task, 'tags')
const {list: contacts, addToList: createContact, selectItem: selectContact} = useCustomSelect(task, 'contacts')
</script>


<template>
<div>
  <modal-base v-model:is-open="state.isOpenLocal" title="Edit task" @closed="clearForm()" @click-outside="clearForm()" :click-to-close="false">
      <template #title>
           <div class="flex justify-between pr-5">
                  <div class="flex items-center w-full text-left">
                      <button class="mx-3 rounded-md px-2 py-1 " :class="typeColor"> 
                          <i :class="icon"> </i>
                      </button>

                      <div class="w-full text-left">
                      <h1
                          class="text-lg font-bold w-full px-2" 
                      >
                        Edit task
                      </h1>
                      </div>
                  </div>

                  <div class="task-item__controls flex items-center" v-if="!isReminder">
                      <div class="text-xl cursor-pointer hover:text-red-400 transition-colors">
                        <i class="fa fa-times my-auto" @click="close()"></i>
                      </div>
                  </div>
              </div>
      </template>

      <template #body>
          <form 
              class="task-form bg-white border-transparent border-2 px-4 py-3 md:rounded-md items-center cursor-default"
              @submit.prevent
          >   
              <div class="flex justify-between">
                  <div class="flex items-center w-full">
                      <div class="w-full">
                      <input 
                          type="text" 
                          class="focus:outline-none w-full px-2 border-b-2 border-gray-100"  
                          :placeholder="placeholder" 
                          v-model="task.title"
                      >
                      </div>
                  </div>

                  <div class="task-item__controls flex items-center text-sm" v-if="!isReminder">
                      <div class="mx-2 text-gray-400 hover:text-gray-600 w-24">
                      <date-select 
                          v-model="task.due_date"
                          placeholder="Due to"
                          class="w-full"
                      />    
                      </div>
                  </div>
              </div>
              <div class="task-item__body w-full p-3 pb-20">
                  <textarea 
                    ref="descriptionInput"
                    v-model="task.description"
                    class="task-item__description w-full pt-2 focus:outline-none h-20 resize-none" 
                    placeholder="Add a short description"
                    @input="setHeight">
                  </textarea>
                  
                  <div class="task-item__checklist pt-5 text-left flex">
                    <checklist-container 
                      v-model="state.checklistTitle"
                      :items="task.checklist" 
                      :task="task" 
                      :allow-edit="true" 
                      class="w-10/12"
                    >
                    </checklist-container>
                    <div class="w-2/12 text-sm px-2" v-if="task.matrix == 'delegate'">
                      <h4 class="font-bold text-gray-500 text-sm"> Delegated to: </h4>
                      <person-select
                        v-if="task.matrix=='delegate'"
                        v-model="task.contacts"
                        :items="contacts"
                        :multiple="true" 
                        @selected="addContact"
                        @added="createContact"
                      /> 
                    </div>
                  </div>
              </div>
          </form>
      </template>

      <template #footer>
        <div class="flex justify-between items-center">
          <tags-select
              v-model="task.tags"
              :tags="tags"
              :multiple="true" 
              @selected="addTag"
              @added="createTag"
          /> 

          <div class="text-right">
              <button class="bg-gray-400 hover:bg-gray-500 text-white focus:outline-none px-5 py-2 rounded-md mr-2" 
              @click.prevent="close()"> 
                Cancel
              </button>
              <button class="bg-green-400 hover:bg-green-500 text-white focus:outline-none px-5 py-2 rounded-md" 
              @click.prevent="save()"> 
                Save 
              </button>
          </div>
        </div>
      </template>
  </modal-base>
</div>
</template>


<style lang="scss" scoped>
.task-form {
  height: 400px;
  width: 100%;
}
</style>
