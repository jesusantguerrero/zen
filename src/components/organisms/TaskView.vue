<template>
  <div
    class="zen__datails shadow-md bg-white px-5 py-3 border-2 border-gray-100 rounded-md"
  >
    <h1 class="text-2xl font-bold text-gray-400">
      {{ task.title }}
    </h1>

    <div class="task__description mb-4 mt-5">
        <p v-if="task.title">
            {{ task.description }}
        </p>
        <slot name="empty"></slot>
    </div>

    <div class="task__checlikst mb-6" v-if="task.checklist">
      <div v-for="checkItem in task.checklist" :key="checkItem">
        <label for="">
          <input type="checkbox" name="" id="" />
          Checklist Item {{ checkItem }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  task: {
    type: Object,
  },
});
</script>

<style></style>
