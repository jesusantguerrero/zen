<template>
  <form class="items-center px-4 py-3 mb-2 text-sm bg-white border-2 border-gray-200 rounded-md shadow-md cursor-default task-item dark:bg-base-lvl-1 dark:border-base-lvl-3"
     @submit.prevent
     @keydown.ctrl.enter="save()"
     @keydown.enter.prevent.exact
     ref="taskForm"
    >
    <div class="flex justify-between">
      <div class="flex justify-start w-full">
        <button class="px-2 py-1 mr-3 transition-colors rounded-md focus:outline-none dark:bg-base-lvl-2 hover:text-white" :class="typeColor" @click="save()"> 
            <i :class="icon" />
        </button>

        <div class="w-full">
          <input 
            ref="quickAddInput"
            type="text" 
            class="w-full px-2 focus:outline-none dark:bg-transparent dark:text-gray-300" 
            :placeholder="placeholder" 
            v-model="task.title"
            @click="state.isExpanded = true"
          
          >
        </div>
      </div>

      <div class="flex items-center task-item__controls" v-if="!isReminder">
        <div class="mx-2 text-gray-400 hover:text-gray-600">
          <PersonSelect
            v-if="type=='delegate'"
            v-model="task.contacts"
            :items="contacts"
            :multiple="true"
            @selected="addContact"
            @added="createContact"
          /> 
          <DateSelect 
            v-else
            v-model="task.due_date" 
          />    
        </div>

        <div class="mx-2 text-lg text-gray-400 hover:text-red-400" @click="clearForm()">
          <i class="fa fa-times"></i>
        </div>
      </div>
    </div>
    
    <ElCollapseTransition>
      <div class="w-full py-3 task-item__body" v-if="state.isExpanded">
        <textarea 
          v-model="task.description"
          class="w-full pt-2 task-item__description focus:outline-none dark:bg-base-lvl-2 rounded-md px-4 dark:text-gray-300" 
          placeholder="Add a short description"
          @keydown.enter.exact.stop="">
        </textarea>
        
        <div class="text-left task-item__checklist mt-4">
          <ChecklistContainer 
            v-model="state.checklistTitle"
            :items="task.checklist" 
            :allow-edit="allowEdit"
            :task="task"
          />
        </div>

        <div class="flex items-center justify-between mt-2">
            <div class="text-gray-400 hover:text-gray-600 dark:text-white">
              <TagsSelect
                v-model="task.tags"
                :tags="tags"
                :multiple="true" 
                @selected="addTag"
                @added="createTag"
              /> 
            </div>

          <div class="w-6/12 mt-2 text-right">
            <button 
              class="px-5 py-2 dark:bg-accent dark:font-bold text-white transition-colors bg-green-400 rounded-md focus:outline-none hover:bg-green-500 " type="submit"
              @click.prevent="save()"> 
              Save
            </button>
          </div>
        </div>
        <div class="pt-2 mr-2 text-xs font-bold text-right text-gray-600 dark:text-white">
            <i class="fa fa-lightbulb"></i>
            ProTip! save with ctrl + enter
          </div>
        </div>
    </ElCollapseTransition>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, onMounted, ref, watch } from "vue"
import { onClickOutside } from  "@vueuse/core"
import { ElMessageBox, ElNotification } from "element-plus";

import DateSelect from "@components/atoms/DateSelect.vue"
import TagsSelect from "@components/atoms/TagsSelect.vue"
import PersonSelect from "@components/atoms/PersonSelect.vue"
import ChecklistContainer from "@components/organisms/ListContainer.vue";

import { useCustomSelect } from "@/plugins/firebase/useCustomSelect"
import { useDateTime } from "@/composables/useDateTime"

const props = defineProps({
    mode: {
      Type: String,
      default: 'task'
    },
    placeholder: {
      default: "Add quick task"
    },
    type: String,
    allowEdit: Boolean,
    isMatrix: {
      Type: Boolean,
      default: true
    },
    initialText: {
      type: String,
      default: ""
    }
})
const emit =  defineEmits({
  'saved': (task) => {},
  'close': () => {}
})

const task = reactive({
  title: props.initialText,
  description: "",
  due_date: "",
  duration: "",
  type: props.mode,
  tags: [],
  contacts: [],
  checklist: [],
  tracks: [],
  order: 0,
  duration_ms: 0,
  done: false,
  commit_date: null,
  matrix: props.isMatrix ? props.type || "backlog" : null,
})

watch(() => props.initialText, 
() => {
  task.title = props.initialText
}, { immediate: true })

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
    const isTagSelect = e.path?.filter(el => {
      return el.classList && Array.from(el.classList).includes('tag-select')
    })

    if (isTagSelect?.length) {
      return
    }
    state.isExpanded = false;
    emit('close');
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
  emit('close')
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

const quickAddInput = ref(null)
const focus = () => {
  quickAddInput.value.click()
  setTimeout(() => {
    quickAddInput.value.focus()
  }, 100)
}

defineExpose({
  focus
})

const {list: tags, addToList: createTag, selectItem: addTag} = useCustomSelect(task, 'tags')
const {list: contacts, addToList: createContact, selectItem: selectContact} = useCustomSelect(task, 'contacts')
</script>
@/plugins/firebase/useCustomSelect@/composables/useDateTime