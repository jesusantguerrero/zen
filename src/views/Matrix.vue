<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-28">
  <div class="mb-20 md:flex">
    <div class="grid md:grid-cols-2 md:gap-10 md:w-8/12">
      <div class="zen__comming-up w-full mb-10 md:mb-0" v-for="(quadrant, name) in state.quadrants" :key="quadrant">
          <task-group
            :title="name"
            :type="name"
            :tasks="matrix[name]"
            :color="quadrant.color"
            :is-quadrant="true"
          >
            <div class="quick__add mb-4">
              <quick-add 
                @saved="addTask"
                :type="name"
              ></quick-add>
            </div>
          </task-group>
      </div>
    </div>

    <div class="md:w-4/12 md:ml-20">
        <task-group
            title="backlog"
            type="backlog"
            :tasks="matrix['backlog']"
            color="text-gray-400"
            :is-quadrant="true"
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
import { computed, defineProps, reactive } from 'vue'
import { useDateTime } from "../utils/useDateTime"
import { useTaskFirestore } from "../utils/useTaskFirestore"
import TaskGroup from "../components/organisms/TaskGroup.vue"
import QuickAdd from "../components/molecules/QuickAdd.vue"
import TimeTracker from "../components/organisms/TimeTracker.vue"

defineProps({
  msg: String
})

const state = reactive({
  todo: [],
  quadrants: {
    todo: {
      color: 'text-green-400'
    },
    schedule: {
      color: 'text-blue-400'
    },
    delegate: {
      color: 'text-yellow-400'
    },
    delete: {
      color: 'text-red-400'
    }
  },
   showReminder: false
})

const toggleReminder = () => {
  state.showReminder = !state.showReminder
}

// firebase store
const { toISO } = useDateTime() 
const { getAllFromUser, saveTask } = useTaskFirestore()

getAllFromUser().then(taks => {
    state.todo = taks
});

const matrix = computed(() => {
  return state.todo.reduce((matrix, task) => {
    if (!matrix[task.matrix]) {
      matrix[task.matrix] = [task];
    } else {
      matrix[task.matrix].push(task);
    }
    return matrix
  }, {})
})

const addTask = (task) => {
  const formattedTask = {...task}
  formattedTask.due_date = toISO(formattedTask.due_date)
  saveTask(formattedTask).then(() => {
    state.todo.push(task);
  })
}

</script>

<style scoped>
a {
  color: #42b983;
}
</style>