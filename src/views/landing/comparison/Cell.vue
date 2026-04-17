<template>
  <span
    v-if="value === true"
    class="inline-flex items-center justify-center w-6 h-6 rounded-full"
    :class="accent ? 'bg-green-400 text-gray-900' : 'bg-green-400/20 text-green-400'"
  >
    <i class="text-xs fa fa-check"></i>
  </span>
  <span v-else-if="value === false" class="text-gray-500">-</span>
  <span
    v-else-if="value === 'plugin'"
    class="px-2 py-0.5 text-xs font-medium text-yellow-300 rounded bg-yellow-400/10"
  >
    Plugin
  </span>
  <span
    v-else-if="value === 'template'"
    class="px-2 py-0.5 text-xs font-medium text-blue-300 rounded bg-blue-400/10"
  >
    Template
  </span>
  <span
    v-else
    class="text-sm"
    :class="accent ? 'font-bold text-green-400' : 'text-gray-300'"
  >
    {{ value }}
  </span>
</template>

<script setup>
defineProps({
  value: { type: [Boolean, String], required: true },
  accent: { type: Boolean, default: false },
});
</script>
