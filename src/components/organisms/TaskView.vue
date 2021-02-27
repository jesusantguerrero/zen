<template>
  <div
    class="zen__datails shadow-md bg-white px-5 py-3 border-2 border-gray-100 rounded-md relative overflow-hidden"
  >
    <h1 class="text-xl font-bold text-gray-400 flex justify-between">
      <input 
        ref="titleInput" 
        v-model="task.title" 
        class="focus:outline-none bg-white w-full" 
        :class="{'border-b-2 border-gray-100 focus:border-gray-200 px-2': isEditMode}"
        :disabled="!isEditMode"
      >

      <div class="task-item__controls flex text-sm" v-if="task.uid"> 
          <div class="mx-2 cursor-pointer" @click="allowEdit()" v-if="!isEditMode">
              <i class="fa fa-pencil-alt mr-2 text-gray-400 hover:text-gray-600"></i>
          </div>

          <el-tooltip class="item" effect="dark" :content="markAsDoneLabel" placement="top" v-if="!isEditMode">
              <div 
                class="mx-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                :class="{'text-green-400 font-extrabold': task.commit_date}"
                :disabled="isDisabled"
                @click="markAsDone()"
              >
                <i class="fas fa-check-circle"></i>
              </div>
          </el-tooltip>
        
          <div class="mx-2 w-32 text-sm" v-if="task.due_date">
              <i class="fa fa-calendar mr-2 text-gray-400 hover:text-gray-600"></i>
              <span> {{ task.due_date}}</span>
          </div>
      </div>
    </h1>

    <div class="task__description mb-4 mt-5 text-gray-500 text-lg">
        <custom-text
            v-if="task.description || isEditMode" 
            v-model="task.description" 
            :placeholder="isEditMode ? 'Add a description' : ''"
            :disabled="!isEditMode"
            :class="{'border-2 bg-gray-50 focus:border-gray-100 px-2': isEditMode}"
            class="w-full py-2 focus:outline-none bg-white text-gray-500 text-sm"
        >
        </custom-text>
        <slot name="empty"></slot>
    </div>

    <div class="task__checlikst mb-6" v-if="showChecklist">
      <checklist-container :items="task.checklist" :task="task" :allow-edit="isEditMode"></checklist-container>
    </div>

    <div class="absolute bottom-2 text-right w-full left-5 pr-10">
         <button class="mx-2 py-1 bg-red-400 text-white px-5 rounded-md text-sm" @click="cancelChanges()" v-if="isEditMode">
              <span> Cancel </span>
          </button>
         <button class="mx-2 py-1 bg-green-400 text-white px-5 rounded-md text-sm" @click="saveChanges()" v-if="isEditMode">
              <span> Save </span>
          </button>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox, ElNotification } from "element-plus";
import { defineProps, toRefs, defineEmit, computed, ref, nextTick, reactive, watch } from "vue";
import { useDateTime } from "../../utils/useDateTime";
import ChecklistContainer from "./ListContainer.vue";
import CustomText from "../atoms/CustomText.vue"

// utils
const { formatDate } = useDateTime();

// Events and props
const emit = defineEmit({
  done: Object,
  updated: Object 
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
const setTaskData = (taskData) => {
  if (taskData && state.task) {
    const data = Object.assign({...taskData}, {});
    Object.keys(data).forEach((key) => {
      const objectData = data[key]
      state.task[key] = Array.isArray(objectData) ? [...objectData] : objectData
    });
  }
}

watch(() => taskData.value, (taskData) => {
  setTaskData(taskData)
}, { immediate: true, deep: true })

const clearTaskData = () => {
  state.task = {}
}

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
    }).then(() => true)

    canSave && unresolvedItems.forEach(item => item.done = true);
  }
  
  if (!canSave) return

  state.task.commit_date = formatDate();
  state.task.done = true;
  state.isEditMode = false
  emit('done', state.task)
  clearTaskData()
}

const saveChanges = () => {
  emit('updated', task)
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
