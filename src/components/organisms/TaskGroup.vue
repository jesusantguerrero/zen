<template>
  <div class="commig-up__today mt-6 py-3">
    <h4 class="mb-2 font-bold"> {{ title }}</h4>
    <TaskItem v-for="task in tasks" :key="task" :task="task" />
  </div>
</template>

<script setup>
import { defineProps } from "vue"
import TaskItem from "../molecules/TaskItem.vue"

const props = defineProps({
    tasks: {
        type: Array,
        default() {
            return []
        }
    },
    title: String
})
</script>
