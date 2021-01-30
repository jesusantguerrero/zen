<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-28">
  <div class="flex">
  
    <div class="w-full">
        <task-group
            title="Committed tasks yesterday"
            type="backlog"
            :tasks="state.committed"
            color="text-gray-400"
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