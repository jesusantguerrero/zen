<template>
  <div class="commig-up__today">
    <div class="flex justify-between cursor-pointer items-center">
      <h4 class="mb-2 font-bold" :class="[isQuadrant ? `text-2xl font-bold ${color} capitalize`: '']"> {{ title }}</h4>
      
      <div @click="toggleExpanded">
         <icon-expand v-if="!isExpanded"/>
         <icon-collapse v-else/>
      </div>
    </div>

    <slot></slot>
    <el-collapse-transition>
      <div v-show="isExpanded">
        <task-item 
          v-for="task in tasks" 
          :key="task" 
          :task="task" 
          :type="type"
          @selected="emitSelected(task)"
          @deleted="emitDeleted(task)"
        />
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
    isQuadrant: Boolean,
    color: String,
    title: String,
    type: String
})

const emit = defineEmit({
  deleted: Object,
  selected: Object
})

const emitDeleted = (task) => {
  emit('deleted', task)
}

const emitSelected = (task) => {
  emit('selected', task)
}

const isExpanded = ref(true);

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
}
</script>