<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { useMagicKeys } from "@vueuse/core"

// Mobile-only floating action button. Emits `quick-add` so the host view
// (Zenboard) can open its QuickAdd / TaskModal without this component
// having to know the task creation flow.
defineEmits<{
  (e: "quick-add"): void
}>()
</script>

<template>
  <button
    type="button"
    aria-label="Quick add task"
    class="fixed z-40 flex items-center justify-center w-14 h-14 text-white transition-all rounded-full shadow-lg bottom-20 right-5 bg-accent hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-accent/30 md:hidden"
    @click="$emit('quick-add')"
  >
    <i class="text-xl fa fa-plus" />
  </button>
</template>
