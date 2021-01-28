<template>
  <div class="pt-28 mx-28">
    <div class="text-left flex">
      <div class="zen__view w-8/12 mr-28">
        <header class="flex justify-between"> 
          <h1 class="text-2xl font-bold text-gray-400"> 
            Task Title
            <span 
              class="text-sm ml-4 select-none cursor-pointer text-gray-600 hover:text-blue-400 transition-colors"
               @click="toggleReminder"> Add Reminder <i class="fa fa-bell"></i></span>
          </h1>
          <time-tracker></time-tracker>
        </header>

        <div class="mt-10">
          <quick-add 
            v-if="state.showReminder"
            mode="reminder"
            type="reminder"
            class="zen__reminder" 
            title="Things bear in mind after the zen"
            placeholder="Add a reminder"
          >
            
          </quick-add>
          <div class="zen__datails">
            <div class="task__description mb-4">
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Error atque, molestiae beatae est assumenda ipsam explicabo corporis? Facilis suscipit quo corrupti animi amet ad illo ea! Nemo cupiditate expedita recusandae.
            </div>

            <div class="task__checlikst mb-6">
              <div v-for="i in [1,2,3]" :key="i">
                <label for="">
                  <input type="checkbox" name="" id="">
                  Checklist Item {{ i }}
                </label>
              </div>
            </div>

            <div class="task__promodoros flex">
              <div class="task__target rounded-full bg-red-200 text-red-400 h-16 w-16 flex justify-center items-center font-bold">
                <span class="text-xl">
                  3
                </span>
                <i class="fas fa-stopwatch ml-1" /> 
              </div>

              <div class="sessions ml-10 flex items-center">
                Totals: 30 minutes, 1 session
              </div>
            </div>
          </div>        
        </div>
      </div>

      <div class="zen__comming-up w-4/12 ml-5">
        <header class="mb-2 flex justify-between text-gray-400 font-bold">
            <h1 class="text-2xl"> Line Up</h1>
            <button class="text-2xl"> 
              <i class="fa fa-chevron-down"></i>
            </button>
        </header>

        <div class="comming-up__list divide-y-2 divide-gray-200 divide-dashed">
          <div class="quick__add mb-4">
            <h4 class="font-bold mb-2">Quick Add</h4>
            <quick-add @saved="addTask"></quick-add>
          </div>

          <task-group
            title="Todo"
            class="mt-6 py-3"
            :tasks="state.todo"
          >

          </task-group>
          
          <task-group
            title="Scheduled"
            :tasks="state.scheduled"
            :active="false"
            type="schedule"
            class="opacity-60 hover:opacity-100  mt-6 py-3"
          >

          </task-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { useTaskFirestore } from "../utils/useTaskFirestore"
import { defineProps, reactive } from 'vue'
import TaskGroup from "../components/organisms/TaskGroup.vue"
import QuickAdd from "../components/molecules/QuickAdd.vue"
import TimeTracker from "../components/organisms/TimeTracker.vue"

defineProps({
  msg: String
})

const { saveTask, getAllFromUser } = useTaskFirestore()

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
  scheduled: [
    {
      title: 'Prueba 2',
      description: 'Lorem Ipsum',
      done: false,
      commited_at: null,
      due_date: null,
      matrix: 'todo',
      tags: ['MCTekk', 'Kanvasu']
    }
  ],
  showReminder: false
})

axios('/api/tracks').then(({data}) => {
console.log(data)
})

const toggleReminder = () => {
  state.showReminder = !state.showReminder
}

getAllFromUser().then(taks => {
  state.todo = taks
});

const addTask = (task) => {
  saveTask(task).then(() => {
    state.todo.push(task);
  })
}

</script>

<style scoped>
a {
  color: #42b983;
}
</style>