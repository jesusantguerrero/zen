<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-28">
  <div class="section-header flex justify-between items-center mb-10">
      <h2 class="text-2xl font-bold text-gray-400 text-left">
         Standup
      </h2>  
      <div class="space-x-2">
         <input type="text" placeholder="search in matrix">
         <button>Filters</button>
         <button title="help" class="bg-gray-700 text-white px-5 py-1 rounded-md ml-2">
            <i class="fa fa-question"></i>
         </button>
      </div>
   </div>  
  <div class="flex">
    <div class="w-full">
        <task-group
            title="Committed tasks yesterday"
            type="backlog"
            :tasks="state.committed"
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
import { defineProps, reactive } from 'vue'
import { useTaskFirestore } from '../utils/useTaskFirestore'
import TaskGroup from "../components/organisms/TaskGroup.vue"
import QuickAdd from "../components/molecules/QuickAdd.vue"
import TimeTracker from "../components/organisms/TimeTracker.vue"

// state and ui
const state = reactive({
  committed: [],
})

// tasks manipulation
const  { getCommitedTasks } = useTaskFirestore()
getCommitedTasks().then(tasks => {
  state.committed = tasks;
})

</script>