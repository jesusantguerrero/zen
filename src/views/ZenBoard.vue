<template>
  <div class="pt-28 mx-5 md:mx-28">
    <div class="text-left md:flex">
      <div class="zen__view md:w-8/12 md:mr-28">
        <header class="flex justify-between"> 
          <h1 class="hidden md:block text-2xl font-bold text-gray-400"> 
            {{ currentTask.title || 'No task selected'}}
            <span 
              class="text-sm ml-4 select-none cursor-pointer text-gray-600 hover:text-blue-400 transition-colors"
               @click="toggleReminder"> Add Reminder <i class="fa fa-bell"></i></span>
          </h1>

          <task-select v-model="currentTask" :items="state.todo" class="md:hidden" />
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
          <div class="zen__datails shadow-md bg-white px-5 py-3 border-2 border-gray-100 rounded-md">
             <h1 class="text-2xl font-bold text-gray-400"> 
              {{ currentTask.title }}
          </h1>
            
            <div class="task__description mb-4 mt-5">
              {{ currentTask.description }}
            </div>

            <div class="task__checlikst mb-6" v-if="currentTask.checklist">
              <div v-for="i in currentTask.checklist" :key="i">
                <label for="">
                  <input type="checkbox" name="" id="">
                  Checklist Item {{ i }}
                </label>
              </div>
            </div>
          </div>   

          <div class="task__promodoros flex shadow-md bg-white px-5 py-3 border-2 border-gray-100 rounded-md mt-10" v-if="currentTask.title">
              <div class="task__target rounded-full bg-red-200 text-red-400 h-16 w-16 flex justify-center items-center font-bold">
                <span class="text-xl">
                  {{ Number(currentTask.promodoros || 0) }}
                </span>
                <i class="fas fa-stopwatch ml-1" /> 
              </div>

              <div class="sessions ml-10 flex items-center">
                Totals: 30 minutes, 1 session
              </div>
          </div>     
        </div>
      </div>

      <div class="zen__comming-up hidden mt-10 md:block md:mt-0 md:w-4/12 md:ml-5">
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
            @deleted="destroyTask"
            @selected="setCurrentTask"
          >

          </task-group>
          
          <task-group
            title="Scheduled"
            :tasks="state.scheduled"
            :active="false"
            type="schedule"
            class="opacity-60 hover:opacity-100  mt-6 py-3"
            @deleted="destroyTask"
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
import { computed, defineProps, reactive, ref } from 'vue'
import { ElMessageBox, ElNotification } from "element-plus"
import TaskSelect from "../components/atoms/TaskSelect.vue"
import TaskGroup from "../components/organisms/TaskGroup.vue"
import QuickAdd from "../components/molecules/QuickAdd.vue"
import TimeTracker from "../components/organisms/TimeTracker.vue"

defineProps({
  msg: String
})

const { saveTask, getAllFromUser, deleteTask } = useTaskFirestore()

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

const destroyTask = async (task) => {
  const canDelete = await ElMessageBox.confirm("Are you sure you want to delete this task?", "Delete Task")
  if (canDelete) {
    deleteTask(task).then(() => {
      state.todo = state.todo.filter(localTask => task.uid != localTask.uid)
      ElNotification({
        type: "success",
        message: "Task deleted",
        title: "Task deleted"
      })
    })
  }
} 
const currentTask = ref({});
const setCurrentTask = (task) => {
  currentTask.value = task
}

const currentPromodoros = computed(() => {
  return Number(currentTask.value.promodoros || 0)
})

const taskDuration = computed(() => {
  return Number(currentTask.value.duration || 0)
})

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

.zen__datails {
  min-height: 400px;

}
</style>