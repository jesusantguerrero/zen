<template>
  <div class="pt-24 md:pt-28 pb-20 mx-5 md:mx-28">
    <div class="text-left md:flex">
      <div class="zen__view md:w-8/12 md:mr-28">
        <header class="flex justify-between"> 
          <h1 class="hidden md:block text-2xl font-bold text-gray-400"> 
            {{ 'Main task' || 'No task selected'}}
            <span 
              class="text-sm ml-4 select-none cursor-pointer text-gray-600 hover:text-blue-400 transition-colors"
               @click="toggleReminder"> Add Reminder <i class="fa fa-bell"></i></span>
          </h1>

          <task-select v-model="currentTask" :items="state.todo" class="md:hidden mr-5" />
          <time-tracker 
            :task="currentTask"
            v-model:currentTimer="currentTimer"
          >
          </time-tracker>
        </header>

        <div class="mt-8">
          <quick-add 
            v-if="state.showReminder"
            mode="reminder"
            type="reminder"
            class="zen__reminder" 
            title="Things bear in mind after the zen"
            placeholder="Add a reminder"
          >
          </quick-add>

          <task-view :task="currentTask" @done="onDone">
            <template #empty v-if="!currentTask.title">
              <div class="w-8/12 md:w-6/12 mx-auto mt-10 text-center">
                <img src="../assets/undraw_following.svg" class="w-12/12 md:w-7/12 mx-auto"> 
                <div class="mt-10 md:mt-5 text-gray-500 font-bold"> Select item from "todo" or go to 
                   <router-link to="/plan-ahead" class="font-bolder">Planahead</router-link>  
                  </div> 
              </div>
            </template>
          </task-view>  
          <task-track-view 
            :task="currentTask"
            :current-timer="currentTimer"
            >
          </task-track-view>     
        </div>
      </div>

      <div class="zen__comming-up hidden mt-10 md:block md:mt-0 md:w-4/12 md:ml-5">
        <header class="mb-2 flex justify-between text-gray-400 font-bold items-center">
            <h1 class="text-2xl"> Line Up</h1>

            <div class="flex itemx-center">
                <input type="search" 
                  v-model="state.search" 
                  class="px-2 text-sm h-8 rounded-md focus:outline-none border-2 border-gray-200"
                  placeholder="search task"  
                >
              <button class="text-2xl"> 
                <i class="fa fa-chevron-down ml-2"></i>
              </button>
            </div>
        </header>

        <div class="comming-up__list divide-y-2 divide-gray-200 divide-dashed">
          <div class="quick__add mb-4">
            <h4 class="font-bold mb-2">Quick Add</h4>
            <quick-add @saved="addTask" type="todo" :allow-edit="true"></quick-add>
          </div>

          <task-group
            title="Todo"
            class="mt-6 py-3"
            :tasks="state.todo"
            :search="state.search"
            @deleted="destroyTask"
            @selected="setCurrentTask"
          >

          </task-group>
          
          <task-group
            title="Scheduled"
            :tasks="state.scheduled"
            :active="false"
            :search="state.search"
            type="schedule"
            class="opacity-60 hover:opacity-100  mt-6 py-3"
            @deleted="destroyTask"
          >

          </task-group>
        </div>
      </div>
    </div>

    <welcome-modal :is-open="state.isWelcomeOpen" @closed="closeWelcomeModal">

    </welcome-modal>
  </div>
</template>

<script setup>
import { useTaskFirestore } from "../utils/useTaskFirestore"
import { useTrackFirestore } from "../utils/useTrackFirestore"
import { reactive, ref, watch} from 'vue'
import { useRouter } from "vue-router"
import { ElMessageBox, ElNotification } from "element-plus"
import { startFireworks } from "../utils/useConfetti"
import TaskSelect from "../components/atoms/TaskSelect.vue"
import TaskGroup from "../components/organisms/TaskGroup.vue"
import QuickAdd from "../components/molecules/QuickAdd.vue"
import TimeTracker from "../components/organisms/TimeTracker.vue"
import TaskView from "../components/organisms/TaskView.vue"
import TaskTrackView from "../components/organisms/TaskTrackView.vue"
import WelcomeModal from "../components/organisms/WelcomeModal.vue"
import { firebaseState, updateSettings} from "../utils/useFirebase"

const { saveTask, deleteTask, updateTask, getTaskByMatrix} = useTaskFirestore()
const { getAllTracksOfTask } = useTrackFirestore()

const isWelcomeOpen = !firebaseState.settings.hide_welcome
// state and ui
const state = reactive({
  todo: [],
  scheduled: [],
  showReminder: false,
  isWelcomeOpen: isWelcomeOpen,
  track: null,
  search: ""
})

const toggleReminder = () => {
  state.showReminder = !state.showReminder
}

// Current task
const currentTask = ref({});
const setCurrentTask = (task) => {
  currentTask.value = task
}

watch(currentTask, () => {
  if (currentTask.value.uid) {
    getAllTracksOfTask(currentTask.value.uid).then((tracks) => {
      currentTask.value.tracks = tracks || []
    })
  }
})

const onDone = (task) => {
  updateTask(task);
  const taskIndex = state.todo.findIndex(localTask => localTask.uid == task.uid);
  state.todo.splice(taskIndex, 1);
  currentTask.value = state.todo[0];
  startFireworks()
}

// Timer
const currentTimer = ref({});
// Tasks manipulation 

getTaskByMatrix('todo').then(tasks => {
  state.todo = tasks
});

getTaskByMatrix('schedule').then(tasks => {
  state.scheduled = tasks
});

const addTask = (task) => {
  saveTask(task).then((uid) => {
    task.uid = uid
    state.todo.push(task);
  })
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

const { push } = useRouter()
const closeWelcomeModal = () => {
  updateSettings({
    hide_welcome: true 
  })
  localStorage.setItem("zen::hide-welcome", 1);
  state.isWelcomeOpen = false;
  push({
    name: 'planAhead'
  })
}

</script>

<style scoped>
.zen__datails {
  min-height: 400px;

}
</style>