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
  <div class="flex">
    <div class="w-full">
        <task-group
            title="Committed tasks"
            type="backlog"
            :search="state.search"
            :tasks="state.committed"
            :show-controls="false"
            color="text-gray-400"
            :max-height="0"
            :is-quadrant="true"
          >
        </task-group>
    </div>
  </div>
</div>

</template>

<script setup>
import { reactive, watch } from 'vue'
import { useTaskFirestore } from '../utils/useTaskFirestore'
import TaskGroup from "../components/organisms/TaskGroup.vue"
import QuickAdd from "../components/molecules/QuickAdd.vue"
import TimeTracker from "../components/organisms/TimeTracker.vue"
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


</script>