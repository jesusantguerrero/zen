<template>
  <div class="tab-header flex">
    <button
      class="px-2 py-1 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-300 font-bold focus:outline-none text-gray-500"
      v-for="tab in tabs"
      :key="tab.name"
      :class="{'text-green-500 bg-gray-100 dark:bg-gray-500': modelValue == tab.name}"
      @click="$emit('update:modelValue', tab.name)"
    >
      {{ tab.label || tab.name }}
    </button>
  </div>
</template>

<script>
export default {
    props: {
        tabs: {
            type: Array,
            required: true
        },
        modelValue: {
            type: String,
            required: true
        }
    },
    setup() {

    }
};
</script>

<style></style>
