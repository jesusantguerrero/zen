<template>
  <form class="task-item  mb-2 shadow-md bg-white border-gray-200 border-2 px-4 py-3 rounded-md items-center cursor-default"
     @submit.prevent
     @keydown.ctrl.enter="save()"
     @keydown.enter.prevent.exact
     ref="taskForm"
    >
    <div class="flex justify-between">
      <div class="flex items-center w-full">
        <button class="mx-3 rounded-md px-2 py-1 focus:outline-none transition-colors hover:text-white" :class="typeColor" @click="save()"> 
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

        <div class="mx-2 text-gray-400 hover:text-red-400 text-lg" @click="clearForm()">
          <i class="fa fa-times"></i>
        </div>
      </div>
    </div>
    
    <el-collapse-transition>
      <div class="task-item__body w-full p-3" v-if="state.isExpanded">
        <textarea 
          v-model="task.description"
          class="task-item__description w-full pt-2 focus:outline-none" 
          placeholder="Add a short description"
          @keydown.enter.exact.stop="">
        </textarea>
        
        <div class="task-item__checklist">
          <checklist-container :items="task.checklist" :allow-edit="allowEdit"></checklist-container>
        </div>

        <div class="flex justify-between items-center mt-2">
          <div class=" text-gray-400 hover:text-gray-600 w-6/12">
            <tags-select
              v-model="task.tags"
              :tags="state.tags"
              :multiple="true" 
              @selected="addTag"
              @added="saveDoc('tags', $event)"
            /> 
          </div>

          <div class="mt-2 text-right w-6/12">
            <button class="px-5 py-2 rounded-md focus:outline-none transition-colors bg-green-400 hover:bg-green-500 text-white " type="submit" @click.prevent="save()"> Save</button>
          </div>
        </div>
        <div class="text-xs mr-2 font-bold text-green-400 text-right pt-2">
            <i class="fa fa-lightbulb"></i>
            ProTip! save with ctrl + enter
          </div>
        </div>
    </el-collapse-transition>
  </form>
</template>

<script setup>
import { computed, reactive, defineProps, defineEmit, onMounted, ref, inject} from "vue"
import { onClickOutside } from  "@vueuse/core"
import { useDateTime } from "../../utils/useDateTime"
import { useCollection } from "./../../utils/useCollection"
import DateSelect from "../atoms/DateSelect.vue"
import TagsSelect from "../atoms/TagsSelect.vue"
import ChecklistContainer from "../organisms/ListContainer.vue";
import { ElNotification } from "element-plus";

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
  tags: []
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
  task.order = 0;
  task.duration_ms = 0
  task.checklist = [];
  task.tracks = [];
}

const save = () => {
  if (!task.title) {
    ElNotification({
      title: "Missing title",
      message: "Title is required for a task"
    })
    return
  }
  const { formatDate } = useDateTime()
  const formData = { ...task }
  formData.due_date = formData.due_date ? formatDate(formData.due_date, "yyyy-MM-dd") : ""
  emit('saved', formData)
  clearForm()
}

const { save: saveDoc } = useCollection()
state.tags = inject('tags', [])
const addTag = (tag) => {
  task.tags.push(tag)
}

</script>
