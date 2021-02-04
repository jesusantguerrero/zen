<template>
  <div class="pt-24 md:pt-28 pb-20 mx-5 md:mx-28">
    <div class="text-left md:flex">
      <div class="zen__view md:block md:w-8/12 md:mr-28"
        :class="[state.mobileMode == 'zen' ? 'block' : 'hidden']"
      >
        <header class="flex justify-between"> 
          <h1 class="md:block text-2xl font-bold text-gray-400"> 
            {{ 'Main task' || 'No task selected'}}
            <!-- <span 
              class="text-sm ml-4 select-none cursor-pointer text-gray-600 hover:text-blue-400 transition-colors"
               @click="toggleReminder"> Add Reminder <i class="fa fa-bell"></i>
            </span> -->
          </h1>

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

          <task-view :task="currentTask" @done="onDone" @updated="onTaskUpdated">
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

      <div class="zen__comming-up md:block md:mt-0 md:w-4/12 md:ml-5"
        :class="[state.mobileMode == 'lineup' ? 'block' : 'hidden']"
      >
        <header class="mb-2 flex justify-between text-gray-400 font-bold items-center">
            <h1 class="text-2xl"> Line Up</h1>

            <div class="flex itemx-center">
                <input type="search" 
                  v-model.trim="state.search" 
                  class="px-2 text-md h-10 rounded-md focus:outline-none border-2 border-gray-200"
                  placeholder="Search task"  
                >
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
            :show-select="true"
            :show-controls="true"
            :current-task="currentTask"
            :current-timer="currentTimer"
            @deleted="destroyTask"
            @edited="setTaskToEdit"
            @selected="setCurrentTask"
            @down="moveTo($event, 'schedule')"
          >

          </task-group>
          
          <task-group
            title="Schedule"
            :tasks="state.schedule"
            :active="false"
            :show-controls="true"
            :search="state.search"
            type="schedule"
            class="opacity-60 hover:opacity-100  mt-6 py-3"
            @deleted="destroyTask"
            @edited="setTaskToEdit"
            @up="moveTo($event, 'todo')"
          >
          </task-group>
        </div>
      </div>
    </div>

    <welcome-modal :is-open="state.isWelcomeOpen" @closed="closeWelcomeModal"></welcome-modal>
    
    <task-modal 
      v-model:is-open="state.isTaskModalOpen" 
      :task-data="taskToEdit" 
      @saved="onEdittedTask"
      @closed="taskToEdit = null"
    >
    </task-modal>

    <!-- mobile nav -->
    <div class="md:hidden bg-gray-600 text-white flex h-10 fixed bottom-0 w-full left-0">
      <div 
      class="text-xl font-bold text-center w-full h-full my-auto flex items-center justify-center"
      :class="{'bg-gray-900': state.mobileMode == 'zen'}" 
      @click="state.mobileMode='zen'">Zen</div>
      <div class="text-xl font-bold text-center h-full w-full my-auto flex items-center justify-center" :class="{'bg-gray-900': state.mobileMode == 'lineup'}" 
        @click="state.mobileMode='lineup'">Line Up</div>
    </div>
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
import TaskModal from "../components/organisms/TaskModal.vue"
import { firebaseState, updateSettings} from "../utils/useFirebase"

const { saveTask, deleteTask, updateTask, getTaskByMatrix} = useTaskFirestore()
const { getAllTracksOfTask } = useTrackFirestore()

const isWelcomeOpen = !firebaseState.settings || !firebaseState.settings.hide_welcome
// state and ui
const state = reactive({
  todo: [],
  schedule: [],
  showReminder: false,
  isWelcomeOpen: isWelcomeOpen,
  isTaskModalOpen: false,
  track: null,
  search: "",
  mobileMode: 'zen'
})

const toggleReminder = () => {
  state.showReminder = !state.showReminder
}

// Current task
const currentTask = ref({});
const setCurrentTask = (task) => {
  currentTask.value = task
}

// Edit task
const taskToEdit = ref({});
const setTaskToEdit = (task) => {
  taskToEdit.value = task
  state.isTaskModalOpen = false;
  state.isTaskModalOpen = true;
}
const onEdittedTask = (task) => {
  const index = state[task.matrix].findIndex(localTask => localTask.uid == task.uid)
  state[task.matrix][index] = {...task};
  taskToEdit.value = null
}

if (firebaseState.settings && firebaseState.settings.last_task_uid) {
  const lastTask = state.todo.find((task) => task.uid == firebaseState.settings.last_task_uid);
  if (lastTask) {
    setCurrentTask(lastTask)
  }
}

watch(currentTask, () => {
  if (currentTask.value.uid) {
    getAllTracksOfTask(currentTask.value.uid).then((tracks) => {
      currentTask.value.tracks = tracks || []
    })
  }
})

const onDone = (task) => {
  task.tracks = []
  delete task.duration_ms
  
  updateTask(task).then(() => {
    const taskIndex = state.todo.findIndex(localTask => localTask.uid == task.uid);
    state.todo.splice(taskIndex, 1);
    if (state.todo.length) {
      currentTask.value = state.todo[0];
      updateSettings({
        last_task_uid: currentTask.value.uid
      });
    } else {
      currentTask.value = {}
    }
    startFireworks()
  });
}

const onTaskUpdated = (task) => {
  const formData = {...task}
  formData.tracks = []
  delete task.duration_ms
  
  updateTask(formData).then(() => {
    ElNotification({
      title: "Updated",
      message: "Task updated"
    })
  })
}

// Timer
const currentTimer = ref({});
// Tasks manipulation 

getTaskByMatrix('todo').then(tasks => {
  state.todo = tasks
});

getTaskByMatrix('schedule').then(tasks => {
  state.schedule = tasks
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
      state[task.matrix] = state[task.matrix].filter(localTask => task.uid != localTask.uid)
      ElNotification({
        type: "success",
        message: "Task deleted",
        title: "Task deleted"
      })
    })
  }
}

const moveTo = async (task, matrix) => {
    const oldMatrix = task.matrix
    task.matrix = matrix
    updateTask(task).then(() => {
      state[oldMatrix] = state[oldMatrix].filter(localTask => task.uid != localTask.uid)
      state[matrix].push(task)
      ElNotification({
        type: "success",
        message: "Task moved",
        title: "Task moved"
      })

    })
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