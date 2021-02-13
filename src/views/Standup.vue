<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-28">
  <div class="section-header md:flex justify-between items-center mb-10">
      <h2 class="text-2xl font-bold text-gray-400 text-left">
         Standup
      </h2>
      <search-bar
        v-model="state.searchText"
        v-model:date="state.date"
        v-model:tags="state.tags"
        v-model:selectedTags="state.selectedTags"
      >

      </search-bar>
  </div> 

  <div class="md:flex">
    <div class="w-full md:w-9/12">
        <task-group
            title="Committed tasks"
            type="backlog"
            :search="state.searchText"
            :tags="state.selectedTags"
            :tasks="state.committed"
            :show-controls="false"
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
import { reactive, watch, ref, inject, computed } from 'vue'
import { useTaskFirestore } from '../utils/useTaskFirestore'
import { useTrackFirestore } from '../utils/useTrackFirestore'
import TaskGroup from "../components/organisms/TaskGroup.vue"
import QuickAdd from "../components/molecules/QuickAdd.vue"
import SearchBar from "../components/molecules/SearchBar.vue"
import TimeTracker from "../components/organisms/TimeTracker.vue"
import ChartView from "../components/organisms/ChartView.vue"
// state and ui
const state = reactive({
  committed: [],
  searchText: "",
  tags: [],
  date: new Date(),
  selectedTags: []
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