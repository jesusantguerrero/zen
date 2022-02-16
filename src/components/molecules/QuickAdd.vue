<template>
  <form class="items-center px-4 py-3 mb-2 text-sm bg-white border-2 border-gray-200 rounded-md shadow-md cursor-default task-item dark:bg-gray-700 dark:border-gray-600"
     @submit.prevent
     @keydown.ctrl.enter="save()"
     @keydown.enter.prevent.exact
     ref="taskForm"
    >
    <div class="flex justify-between">
      <div class="flex justify-start w-full">
        <button class="px-2 py-1 mr-3 transition-colors rounded-md focus:outline-none dark:bg-gray-600 hover:text-white" :class="typeColor" @click="save()"> 
            <i :class="icon" />
        </button>

        <div class="w-full">
          <input 
            type="text" 
            class="w-full px-2 focus:outline-none dark:bg-gray-700 dark:text-gray-300" 
            :placeholder="placeholder" 
            v-model="task.title"
            @click="state.isExpanded = true"
          
          >
        </div>
      </div>

      <div class="flex items-center task-item__controls" v-if="!isReminder">
        <div class="mx-2 text-gray-400 hover:text-gray-600">
          <person-select
            v-if="type=='delegate'"
            v-model="task.contacts"
            :items="contacts"
            :multiple="true"
            @selected="addContact"
            @added="createContact"
          /> 
          <date-select 
            v-else
            v-model="task.due_date" 
          />    
        </div>

        <div class="mx-2 text-lg text-gray-400 hover:text-red-400" @click="clearForm()">
          <i class="fa fa-times"></i>
        </div>
      </div>
    </div>
    
    <el-collapse-transition>
      <div class="w-full p-3 task-item__body" v-if="state.isExpanded">
        <textarea 
          v-model="task.description"
          class="w-full pt-2 task-item__description focus:outline-none dark:bg-gray-700 dark:text-gray-300" 
          placeholder="Add a short description"
          @keydown.enter.exact.stop="">
        </textarea>
        
        <div class="text-left task-item__checklist">
          <checklist-container 
            v-model="state.checklistTitle"
            :items="task.checklist" 
            :allow-edit="allowEdit"
            :task="task"
            >
          </checklist-container>
        </div>

        <div class="flex items-center justify-between mt-2">
            <div class="text-gray-400 hover:text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              <tags-select
                v-model="task.tags"
                :tags="tags"
                :multiple="true" 
                @selected="addTag"
                @added="createTag"
              /> 
            </div>

          <div class="w-6/12 mt-2 text-right">
            <button class="px-5 py-2 text-white transition-colors bg-green-400 rounded-md focus:outline-none hover:bg-green-500 " type="submit" @click.prevent="save()"> Save</button>
          </div>
        </div>
        <div class="pt-2 mr-2 text-xs font-bold text-right text-gray-600 dark:text-white">
            <i class="fa fa-lightbulb"></i>
            ProTip! save with ctrl + enter
          </div>
        </div>
    </el-collapse-transition>
  </form>
</template>

<script setup>
import { computed, reactive, onMounted, ref } from "vue"
import { onClickOutside } from  "@vueuse/core"
import { useDateTime } from "../../utils/useDateTime"
import { useCollection } from "./../../utils/useCollection"
import { useCustomSelect } from "./../../utils/useCustomSelect"
import DateSelect from "../atoms/DateSelect.vue"
import TagsSelect from "../atoms/TagsSelect.vue"
import PersonSelect from "../atoms/PersonSelect.vue"
import ChecklistContainer from "../organisms/ListContainer.vue";
import { ElMessageBox, ElNotification } from "element-plus";

const props = defineProps({
    mode: {
      Type: String,
      default: 'task'
    },
    placeholder: {
      default: "Add quick task"
    },
    type: String,
    allowEdit: Boolean
})
const emit =  defineEmits({
  'saved': (task) => {}
})

const task = reactive({
  title: "",
  description: "",
  due_date: "",
  duration: "",
  tags: [],
  contacts: [],
  checklist: [],
  tracks: [],
  order: 0,
  duration_ms: 0,
  done: false,
  commit_date: null,
  matrix: props.type || "backlog",
})

// UI
const state = reactive({
  isExpanded: false,
  tags: [],
  contacts: [],
  checklistTitle: ""
})

const taskForm = ref(null)

onMounted(() => {
  
  onClickOutside(taskForm, (e) => {
    const isTagSelect = e.path.filter(el => {
      return el.classList && Array.from(el.classList).includes('tag-select')
    })

    if (isTagSelect.length) {
      return
    }
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
    todo: 'bg-green-100 hover:bg-green-400 text-green-500',
    schedule: 'bg-blue-100 hover:bg-blue-400 text-blue-500',
    reminder: 'bg-blue-100 hover:bg-blue-400 text-blue-500',
    delegate: 'bg-yellow-100 hover:bg-yellow-400 text-yellow-500',
    delete: 'bg-red-100 hover:bg-red-400 text-red-500',
    backlog: 'bg-gray-100 hover:bg-gray-400 text-gray-500'
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
  task.contacts = [];
  task.order = 0;
  task.duration_ms = 0
  task.checklist = [];
  task.tracks = [];
}

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
  if (!task.title) {
    ElNotification({
      title: "Missing title",
      message: "Title is required for a task"
    })
    return
  }
  await confirmChecklist();
  const { formatDate } = useDateTime()
  const formData = { ...task }
  formData.due_date = formData.due_date ? formatDate(formData.due_date, "yyyy-MM-dd") : ""
  emit('saved', formData)
  clearForm()
}

const {list: tags, addToList: createTag, selectItem: addTag} = useCustomSelect(task, 'tags')
const {list: contacts, addToList: createContact, selectItem: selectContact} = useCustomSelect(task, 'contacts')
</script>
