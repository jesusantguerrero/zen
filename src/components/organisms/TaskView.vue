<template>
  <div
    class="zen__datails shadow-md bg-white px-5 py-3 border-2 border-gray-100 rounded-md"
  >
    <h1 class="text-2xl font-bold text-gray-400 flex justify-between">
      {{ task.title }}

      <div class="task-item__controls flex text-lg" v-if="task.title">  
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
          
          <div class="mx-2" v-if="task.due_date">
              <i class="fa fa-calendar mr-2 text-gray-400 hover:text-gray-600"></i>
              <span> {{ task.due_date}}</span>
          </div>
      </div>
    </h1>

    <div class="task__description mb-4 mt-5 text-gray-500 text-lg">
        <p v-if="task.title">
            {{ task.description }}
        </p>
        <slot name="empty"></slot>
    </div>

    <div class="task__checlikst mb-6" v-if="task.checklist">
      <checklist-container :items="task.checklist" :task="task"></checklist-container>
    </div>
  </div>
</template>

<script setup>
import { ElNotification } from "element-plus";
import { defineProps, toRefs, defineEmit, computed } from "vue";
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
  emit('done', task.value)
}

const saveChanges = () => {
  emit('updated', task.value)
}
</script>

<style></style>
