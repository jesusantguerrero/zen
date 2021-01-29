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
import TaskGroup from "../components/organisms/TaskGroup.vue"
import QuickAdd from "../components/molecules/QuickAdd.vue"
import TimeTracker from "../components/organisms/TimeTracker.vue"
import { useTaskFirestore } from '../utils/useTaskFirestore'

defineProps({
  msg: String
})

const state = reactive({
  committed: [],
})

const  { getCommitedTasks } = useTaskFirestore()
getCommitedTasks().then(tasks => {
  state.committed = tasks;
})

</script>

<style scoped>
a {
  color: #42b983;
}
</style>