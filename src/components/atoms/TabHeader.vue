<template>
  <div class="tab-header flex h-full border-2 border-gray-200 dark:border-base-lvl-3">
    <button
      class="h-full px-3 text-sm font-bold transition-colors focus:outline-none text-gray-500 hover:bg-gray-200 dark:hover:bg-base-lvl-1 dark:hover:text-gray-300"
      v-for="tab in tabs"
      :key="tab.name"
      :class="[modelValue == tab.name ? 'text-accent dark:text-accent bg-gray-100 dark:bg-base-lvl-1' : 'dark:text-body-1 dark:bg-base-lvl-2']"
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
