<template>
  <div
    class="zen__datails shadow-md bg-white px-5 py-3 border-2 border-gray-100 rounded-md"
  >
    <h1 class="text-2xl font-bold text-gray-400 flex justify-between">
      {{ task.title }}

      <div class="task-item__controls flex text-lg" v-if="task.title">  
          <el-tooltip class="item" effect="dark" content="Add to zen" placement="top">
              <div 
                class="mx-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                @click="markAsDone()"
                :class="{'text-green-400 font-extrabold': task.commit_date}"
                title="Mark as done"
              >
              <i class="fa fa-check"></i>
              </div>
          </el-tooltip>
          
          <div class="mx-2">
              <i class="fa fa-calendar mr-2 text-gray-400 hover:text-gray-600"></i>
              <span> {{ formattedDate }}</span>
          </div>

          <div class="mx-2 text-gray-400 hover:text-gray-600" @click="emitDeleted">
              <i class="fa fa-chevron-right"></i>
          </div>
          
          <div class="mx-2 text-gray-400 hover:text-gray-600" @click="emitDeleted">
              <i class="fa fa-ellipsis-v"></i>
          </div>
      </div>
    </h1>

    <div class="task__description mb-4 mt-5 text-gray-500 text-lg">
        <p v-if="task.title">
            {{ task.description }}
        </p>
        <slot name="empty"></slot>
    </div>

    <div class="task__checlikst mb-6" v-if="task.checklist">
      <checklist-container :items="task.checklist"></checklist-container>
    </div>
  </div>
</template>

<script setup>
import { defineProps, toRefs, defineEmit } from "vue";
import { useDateTime } from "../../utils/useDateTime";
import ChecklistContainer from "./ListContainer.vue";

const { formatDate, formattedDate } = useDateTime();

const emit = defineEmit({
  done: (task) => {}
})

const props = defineProps({
  task: {
    type: [Object, String],
    default() {
      return {}
    }
  }
});

const { task } = toRefs(props)

const markAsDone = () => {
  task.value.commit_date = formatDate();
  task.value.done = true;
  emit('done', task.value)
}
</script>

<style></style>
