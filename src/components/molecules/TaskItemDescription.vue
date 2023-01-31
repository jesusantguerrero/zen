<template>
  <div class="task-item__body">
    <div
      class="pt-2 text-left whitespace-pre-line task-item__description"
      placeholder="Add a short description"
      :class="{ 'text-gray-400 text-sm': !task.description }"
      v-html="descriptionText"
    />
    <div class="mt-5 task-item__checklist">
      <ChecklistContainer
        :items="task.checklist"
        :task="task"
        @updated="updateItems"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElNotification } from "element-plus";
import  { marked } from "marked";
import ChecklistContainer from "../organisms/ListContainer.vue";
import { ITaskPartial } from "vue-temporal-components/src/components/Timer/useTimer";
import { computed } from "vue";

const props = defineProps<{
  task: ITaskPartial & {
    description: string;
    checklist: string[]
  }
}>();

const updateItems = () => {
  ElNotification({
    title: "changed",
  });
};

const descriptionText = computed(() => {
  return marked.parse(props.task.description)
})
   
</script>

<style lang="scss" scoped>
.task-item__tracked {
  width: 90px;
}

.task-item__description {
  overflow-wrap: break-word;
}

.task-item__title {
  overflow-wrap: break-word;
}

.task-item {
  min-width: 345px;
}
</style>
