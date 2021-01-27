<template>
  <div class="commig-up__today mt-6 py-3">
    <div class="flex justify-between cursor-pointer" @click="toggleExpanded">
      <h4 class="mb-2 font-bold"> {{ title }}</h4>
      
      <div>
         <icon-expand v-if="!isExpanded"/>
         <icon-collapse v-else/>
      </div>
    </div>
    <el-collapse-transition>
      <div v-show="isExpanded">
        <task-item v-for="task in tasks" :key="task" :task="task" />
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup>
import { defineProps, ref } from "vue"
import TaskItem from "../molecules/TaskItem.vue"
import IconExpand from "../atoms/IconExpand.vue"
import IconCollapse from "../atoms/IconCollapse.vue"

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
