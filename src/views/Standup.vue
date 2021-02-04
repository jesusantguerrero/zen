<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-28">
  <div class="section-header md:flex justify-between items-center mb-10">
      <h2 class="text-2xl font-bold text-gray-400 text-left">
         Standup
      </h2>  
      <div class="md:space-x-2 text-left md:flex">
          <div class="md:flex items-center">
              <input type="search" 
                v-model.trim="state.search" 
                class="px-2 text-md h-10 rounded-md focus:outline-none border-2 border-gray-200 w-full"
                placeholder="Search task"

              >
          </div>
          <div class="flex mt-2 md:mt-0">
            <el-date-picker
              v-model.lazy="state.date"
              type="date"
              input-class="ml-0"
            >
            </el-date-picker>
          <button title="help" class="bg-gray-700 text-white px-5 py-1 rounded-md ml-2">
              <i class="fa fa-question"></i>
          </button>
          </div>
      </div>
  </div> 

  <div class="md:flex">
    <div class="w-full md:w-9/12">
        <task-group
            title="Committed tasks"
            type="backlog"
            :search="state.search"
            :tasks="state.committed"
            :show-controls="false"
            :show-select="true"
            :current-task="currentTask"
            @selected="setCurrentTask"
            color="text-gray-400"
            :max-height="0"
            :is-quadrant="true"
          >
            <template #empty v-if="!state.committed.length">
            <div class="w-8/12 md:w-6/12 mx-auto mt-10 text-center">
              <img src="../assets/undraw_following.svg" class="w-12/12 md:w-5/12 mx-auto"> 
              <div class="mt-10 md:mt-5 text-gray-500 font-bold"> There's no tasks</div>
            </div>
          </template>
        </task-group>
    </div>

    <transition-group>
      <div class="w-full md:w-3/12">
        <chart-view 
          :series-data="currentTask.data"
          :current-task="currentTask"
        >
        </chart-view>
    </div>
    </transition-group>
  </div>
</div>

</template>

<script setup>
import { reactive, watch, ref } from 'vue'
import { useTaskFirestore } from '../utils/useTaskFirestore'
import { useTrackFirestore } from '../utils/useTrackFirestore'
import TaskGroup from "../components/organisms/TaskGroup.vue"
import QuickAdd from "../components/molecules/QuickAdd.vue"
import TimeTracker from "../components/organisms/TimeTracker.vue"
import ChartView from "../components/organisms/ChartView.vue"
// state and ui
const state = reactive({
  committed: [],
  date: new Date(),
  search: ""
})

// tasks manipulation
const  { getCommitedTasks } = useTaskFirestore()
watch(() => state.date , () => {
  getCommitedTasks(state.date).then(tasks => {
    state.committed = tasks;
  })
}, { immediate: true })

// Current task
const  { getAllTracksOfTask } = useTrackFirestore()
const currentTask = ref({});
const setCurrentTask = (task) => {
  currentTask.value = task
}

watch(currentTask, () => {
  if (currentTask.value.uid) {
    getAllTracksOfTask(currentTask.value.uid).then((tracks) => {
      currentTask.value.tracks = tracks || []

      currentTask.value.data = [
        tracks.length,
        tracks.filter( track => track.completed).length
      ]
    })
  }
})
</script>

<style lang="scss">
.el-date-editor.el-input {
  width: 100% !important;
}
</style>