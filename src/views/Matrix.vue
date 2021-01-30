<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-10 lg:mx-28">
  <div class="mb-20 md:block lg:flex">
    <div class="grid md:grid-cols-2 sm:w-full md:gap-10 lg:w-8/12">
      <div class="zen__comming-up w-full mb-10 md:mb-0" v-for="matrix in state.matrix" :key="matrix">
          <task-group
            :title="matrix"
            :type="matrix"
            :tasks="state.quadrants[matrix].tasks"
            :color="state.quadrants[matrix].color"
            :handle-mode="true"
            @change="handleDragChanges"
            @move="onMove"
            :is-quadrant="true"
          >
            <div class="quick__add mb-4">
              <quick-add 
                @saved="addTask"
                :type="matrix"
              ></quick-add>
            </div>
          </task-group>
      </div>
    </div>

    <div class="md:w-4/12 md:ml-20">
        <task-group
            title="backlog"
            type="backlog"
            :tasks="state.quadrants['backlog'].tasks"
            color="text-gray-400"
            :handle-mode="true"
            :is-quadrant="true"
            @change="handleDragChanges"
            @move="onMove"
          >
            <div class="quick__add mb-4">
              <quick-add 
                @saved="addTask"
                type="backlog"
              ></quick-add>
            </div>
          </task-group>
    </div>
  </div>
</div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useDateTime } from "../utils/useDateTime"
import { useTaskFirestore } from "../utils/useTaskFirestore"
import { ElNotification } from 'element-plus'
import TaskGroup from "../components/organisms/TaskGroup.vue"
import QuickAdd from "../components/molecules/QuickAdd.vue"
import TimeTracker from "../components/organisms/TimeTracker.vue"

// state and ui
const state = reactive({
  tasks: [],
  matrix: ['todo', 'schedule', 'delegate', 'delete'],
  quadrants: {
    todo: {
      color: 'text-green-400',
      tasks: []
    },
    schedule: {
      color: 'text-blue-400',
       tasks: []
    },
    delegate: {
      color: 'text-yellow-400',
       tasks: []
    },
    delete: {
      color: 'text-red-400',
      tasks: []
    },
    backlog: {
      color: '',
      tasks: []
    }
  },
  showReminder: false
})

// Tasks manipulation
const { toISO } = useDateTime() 
const { getUncommitedTasks, saveTask, updateTask } = useTaskFirestore()

getUncommitedTasks().then(tasks => {
    state.tasks = tasks
});

watch(() => state.tasks, () => {
  state.tasks.forEach(task => {
    if (state.quadrants[task.matrix] && !state.quadrants[task.matrix].tasks) {
      state.quadrants[task.matrix].tasks = [task];
    } else if (state.quadrants[task.matrix]) {
      state.quadrants[task.matrix].tasks.push(task);
    }
  })
})

const addTask = (task) => {
  const formattedTask = {...task}
  formattedTask.due_date = toISO(formattedTask.due_date)
  saveTask(formattedTask).then(() => {
    state.tasks.push(task);
  })
}

const handleDragChanges = (e, matrix) => {
  if (e.added) {
    e.added.element.matrix = matrix;
    updateTask(e.added.element).then(() => {
      ElNotification({
        message: `Moved to ${matrix}`
      })
    })
  }
}
</script>

<style lang="scss" scoped>
.zen__comming-up {
  max-height: 500px;
  overflow: auto;
}
</style>