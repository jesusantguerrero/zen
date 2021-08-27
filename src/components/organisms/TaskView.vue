<template>
  <div
    class="relative px-5 py-3 overflow-hidden bg-white border-2 border-gray-100 rounded-md shadow-md zen__datails dark:bg-gray-700 dark:border-gray-600"
    @keydown.ctrl.enter.exact="saveChanges()"
  >
    <h1 class="flex justify-between text-xl font-bold text-gray-400">
      <input 
        ref="titleInput" 
        v-model="task.title" 
        class="w-full bg-white focus:outline-none dark:bg-transparent" 
        :class="{'border-b-2 border-gray-100 focus:border-gray-200 px-2': isEditMode}"
        :disabled="!isEditMode"
      />

      <div class="flex text-sm task-item__controls" v-if="task.uid"> 
          <div class="mx-2 cursor-pointer" @click="allowEdit()" v-if="!isEditMode">
              <i class="mr-2 text-gray-400 fa fa-pencil-alt hover:text-gray-600"></i>
          </div>

          <el-tooltip class="item" effect="dark" :content="markAsDoneLabel" placement="top" v-if="!isEditMode">
              <div 
                class="mx-2 text-gray-400 cursor-pointer hover:text-gray-600"
                :class="{'text-green-400 font-extrabold': task.commit_date}"
                :disabled="isDisabled"
                @click="markAsDone()"
              >
                <i class="fas fa-check-circle"></i>
              </div>
          </el-tooltip>
        
          <date-select v-if="task.due_date" 
            v-model="task.due_date"
            class="w-20 ml-2 text-gray-400 hover:text-gray-600"
          />
           
          <el-tooltip class="item" effect="dark" content="Remove" placement="top" v-if="!isEditMode">
              <div 
                class="mx-2 text-gray-400 cursor-pointer hover:text-red-600"
                :disabled="isDisabled"
                @click="removeFocus()"
              >
                <i class="fa fa-times"></i>
              </div>
          </el-tooltip>
      </div>
    </h1>

    <div class="mt-5 mb-4 text-lg text-gray-500 task__description">
        <custom-text
            v-if="task.description || isEditMode" 
            v-model="task.description" 
            :placeholder="isEditMode ? 'Add a description' : ''"
            :disabled="!isEditMode"
            :class="{'border-2 bg-gray-50 focus:border-gray-100 px-2': isEditMode}"
            class="w-full py-2 text-sm text-gray-500 bg-white focus:outline-none"
        />
        <slot name="empty"></slot>
    </div>

    <div class="mb-10 task__checlikst" v-if="showChecklist">
      <checklist-container 
        v-model="state.checklistTitle"
        :items="task.checklist" 
        :task="task" :allow-edit="isEditMode">
      </checklist-container>
    </div>

    <div class="absolute w-full pr-10 text-right bottom-2 left-5">
         <button class="px-5 py-1 mx-2 text-sm text-white bg-red-400 rounded-md" @click="cancelChanges()" v-if="isEditMode">
              <span> Cancel </span>
          </button>
         <button class="px-5 py-1 mx-2 text-sm text-white bg-green-400 rounded-md" @click="saveChanges()" v-if="isEditMode">
              <span> Save </span>
          </button>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox, ElNotification } from "element-plus";
import { toRefs, computed, ref, nextTick, reactive, watch } from "vue";
import { useDateTime } from "../../utils/useDateTime";
import ChecklistContainer from "./ListContainer.vue";
import CustomText from "../atoms/CustomText.vue"
import DateSelect from "../atoms/DateSelect.vue";

// utils
const { formatDate } = useDateTime();

// Events and props
const emit = defineEmits({
  done: Object,
  updated: Object,
  removed: null,
})
const props = defineProps({
  taskData: {
    type: [Object, String],
    default() {
      return {}
    }
  },
  currentTimer: {
    type: Object,
    default() {
      return {}
    }
  }
});
const { taskData, currentTimer } = toRefs(props)

// State
const state = reactive({
  task: {},
  checklistTitle: "",
  isEditMode: false,
  isDisabled: computed(() => {
    return currentTimer.value && currentTimer.value.task_uid == state.task.uid;
  }),
  markAsDoneLabel: computed(() => {
    return state.isDisabled ? 'Stop timer first to mark as done' : 'Mark as done'
  }),
  showChecklist: computed(() => {
    return (state.task.checklist && state.task.checklist.length) || state.isEditMode
  })
})

// Tasks domain
const clearTaskData = () => {
  state.task = {}
}

const setTaskData = (taskData) => {
  if (taskData && state.task && taskData.title) {
    const data = Object.assign({...taskData}, {});
    Object.keys(data).forEach((key) => {
      const objectData = data[key]
      state.task[key] = Array.isArray(objectData) ? [...objectData] : objectData
    });
  } else {
    clearTaskData()
  }
}

watch(() => taskData.value, (taskData) => {
  setTaskData(taskData)
}, { immediate: true, deep: true })



// Controls Domain
const markAsDone = async () => {
  if (state.isDisabled) {
    ElNotification({
      type: "info",
      message: "Stop timer first to mark as done"
    })
    return 
  }

  const unresolvedItems = state.task.checklist.filter(item => !item.done)
  let canSave = true;
  if (unresolvedItems.length) {
    canSave = await ElMessageBox.confirm(`There are ${unresolvedItems.length} unresolved item(s)`, "Are you sure?", {
      confirmButtonText: "Mark all as done",
      cancelButtonText: "Cancel"
    }).then(() => true).catch(() => false)

    canSave && unresolvedItems.forEach(item => item.done = true);
  }
  
  if (!canSave) return

  state.task.commit_date = formatDate();
  state.task.done = true;
  state.isEditMode = false
  emit('done', state.task)
  clearTaskData()
}

const removeFocus = async () => {
  if (state.isDisabled) {
    ElNotification({
      type: "info",
      message: "Stop timer first to remove focus"
    })
    return 
  }

  emit('removed')
  clearTaskData()
}

const saveChanges = async () => {
  if (!state.isEditMode) {
    return
  }
  

  let canSave = true;
  if (state.checklistTitle) {
    canSave = await ElMessageBox.confirm(`There are an unsaved checklist item`, "Are you sure?", {
      confirmButtonText: "Add item and save",
      cancelButtonText: "Remove item and save"
    }).then(() => true).catch(() => false)

    if (canSave) {
      state.task.checklist.push({ 
        title: state.checklistTitle,
        done: false
      });
    } 
  }
  
  state.checklistTitle = "";

  emit('updated', state.task)
  isEditMode.value = false;
}

const cancelChanges = () => {
  isEditMode.value = false;
}

// Edit Domain
const titleInput = ref(null)
const allowEdit = () => {
  state.isEditMode = true;
  nextTick(() => {
    titleInput.value.focus();
  })
}

const { task, isDisabled, isEditMode, markAsDoneLabel, showChecklist } = toRefs(state);
</script>

<style lang="scss" scoped>
.task__description {
  overflow-wrap: break-word;
}
</style>
