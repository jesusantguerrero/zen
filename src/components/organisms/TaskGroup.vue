<template>
  <div class="commig-up__today mt-6 py-3">
    <h4 class="mb-2 font-bold cursor-pointer" @click="toggleExpanded"> {{ title }}</h4>
    <el-collapse-transition>
      <div v-show="isExpanded">
        <TaskItem v-for="task in tasks" :key="task" :task="task" />
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup>
import { defineProps, ref } from "vue"
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

const isExpanded = ref(true);
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
}
</script>
