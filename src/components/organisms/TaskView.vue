<template>
  <div
    class="zen__datails shadow-md bg-white px-5 py-3 border-2 border-gray-100 rounded-md relative overflow-hidden"
  >
    <h1 class="text-xl font-bold text-gray-400 flex justify-between">
      <input 
        ref="titleInput" 
        v-model="task.title" 
        class="focus:outline-none bg-white w-full" 
        :class="{'focus:border-2 focus:border-gray-100 focus:ring focus:ring-gray-100 focus:ring-offset-gray-50 px-2': isEditMode}"
        :disabled="!isEditMode"
      >

      <div class="task-item__controls flex text-lg" v-if="task.uid"> 
          <div class="mx-2 cursor-pointer" @click="allowEdit()" v-if="!isEditMode">
              <i class="fa fa-pencil-alt mr-2 text-gray-400 hover:text-gray-600"></i>
          </div>

          <el-tooltip class="item" effect="dark" :content="markAsDoneLabel" placement="top">
              <div 
                class="mx-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                @click="markAsDone()"
                :disabled="isDisabled"
                :class="{'text-green-400 font-extrabold': task.commit_date}"
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
        <textarea 
          v-if="task.uid" 
          v-model="task.description" 
          :placeholder="isEditMode ? 'Add a description' : ''"
          :disabled="!isEditMode"
          class="w-full pt-2 focus:outline-none bg-white text-gray-500"
        >
        
        </textarea>
        <slot name="empty"></slot>
    </div>

    <div class="task__checlikst mb-6" v-if="task.checklist">
      <checklist-container :items="task.checklist" :task="task" :allow-edit="isEditMode"></checklist-container>
    </div>

    <div class="absolute bottom-2 text-right w-full left-5 pr-10" v-if="isEditMode">
         <button class="mx-2 bg-green-400 text-white px-5 rounded-md text-md" @click="saveChanges()">
              <span> Save </span>
          </button>
    </div>
  </div>
</template>

<script setup>
import { ElNotification } from "element-plus";
import { defineProps, toRefs, defineEmit, computed, ref, nextTick } from "vue";
import { useDateTime } from "../../utils/useDateTime";
import ChecklistContainer from "./ListContainer.vue";

const emit = defineEmit({
  done: Object,
  updated: Object 
})

const props = defineProps({
  task: {
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

const { task, currentTimer } = toRefs(props)

const { formatDate } = useDateTime();

const isDisabled = computed(() => {
  return currentTimer.value && currentTimer.value.task_uid == task.value.uid;
})

const markAsDoneLabel = computed(() => {
  return isDisabled.value ? 'Stop timer first to mark as done' : 'Mark as done'
})

const markAsDone = () => {
  if (isDisabled.value) {
    ElNotification({
      type: "info",
      message: "Stop timer first to mark as done"
    })
    return 
  }

  task.value.commit_date = formatDate();
  task.value.done = true;
  isEditMode.value = false
  emit('done', task.value)
}

const saveChanges = () => {
  emit('updated', task.value)
  isEditMode.value = false;
}

const titleInput = ref(null)
const isEditMode = ref(false);
const allowEdit = () => {
  isEditMode.value = true;
  nextTick(() => {
    titleInput.value.focus();
  })
}
</script>

<style lang="scss" scoped>
.task__description {
  overflow-wrap: break-word;
}
</style>
