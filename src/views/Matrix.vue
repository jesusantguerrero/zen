<template>
<div class="pt-28 mx-28">
  <div class="flex">
    <div class="grid grid-cols-2 gap-10 w-8/12">
      <div class="zen__comming-up w-full" v-for="(quadrant, name) in state.quadrants" :key="quadrant">
          <task-group
            :title="name"
            :type="name"
            :tasks="state.todo"
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

    <div class="w-4/12 ml-20">
        <task-group
            title="backlog"
            type="backlog"
            :tasks="state.todo"
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
import { defineProps, reactive } from 'vue'
import TaskGroup from "../components/organisms/TaskGroup.vue"
import QuickAdd from "../components/molecules/QuickAdd.vue"
import TimeTracker from "../components/organisms/TimeTracker.vue"

defineProps({
  msg: String
})

const state = reactive({
  todo: [
    {
      title: 'Prueba 1',
      description: 'Lorem Ipsum',
      done: false,
      commited_at: null,
      due_date: null,
      matrix: 'todo',
      tags: ['MCTekk', 'Kanvasu']
    }
  ],
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

const addTask = (task) => {
  state.todo.push(task);
}

</script>

<style scoped>
a {
  color: #42b983;
}
</style>