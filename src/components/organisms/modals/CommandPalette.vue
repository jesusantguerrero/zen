<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue"
import { useCommandPalette } from "@/composables/useCommandPalette"

const {
  isOpen,
  query,
  filtered,
  groupedCommands,
  activeIndex,
  close,
  moveSelection,
  executeActive,
} = useCommandPalette()

const inputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLElement | null>(null)

watch(isOpen, async (open) => {
  if (open) {
    await nextTick()
    inputRef.value?.focus()
  }
})

watch(query, () => {
  activeIndex.value = 0
})

watch(activeIndex, async () => {
  await nextTick()
  const el = listRef.value?.querySelector(`[data-index="${activeIndex.value}"]`) as HTMLElement | null
  el?.scrollIntoView({ block: "nearest" })
})

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "ArrowDown") {
    event.preventDefault()
    moveSelection(1)
  } else if (event.key === "ArrowUp") {
    event.preventDefault()
    moveSelection(-1)
  } else if (event.key === "Enter") {
    event.preventDefault()
    executeActive()
  } else if (event.key === "Escape") {
    event.preventDefault()
    close()
  }
}

// Compute flat index for a command (so grouping doesn't break arrow nav)
const flatIndexOf = (cmdId: string) => filtered.value.findIndex((c) => c.id === cmdId)

const onBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) close()
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-24 bg-black/60"
      @click="onBackdropClick"
    >
      <div
        class="w-full max-w-xl overflow-hidden bg-white border-2 border-gray-200 rounded-lg shadow-2xl dark:bg-base-lvl-2 dark:border-base-lvl-3"
        @click.stop
      >
        <!-- Input -->
        <div class="flex items-center px-4 py-3 border-b border-gray-100 dark:border-base-lvl-3">
          <i class="mr-3 text-gray-400 fa fa-search" />
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            placeholder="Type a command or search…"
            class="flex-1 text-sm text-gray-700 bg-transparent focus:outline-none dark:text-gray-200"
            @keydown="onKeydown"
          />
          <kbd class="hidden px-2 py-1 ml-2 text-xs text-gray-400 border rounded md:inline-block dark:border-base-lvl-3">Esc</kbd>
        </div>

        <!-- Results -->
        <div ref="listRef" class="overflow-y-auto max-h-96">
          <div v-if="!filtered.length" class="px-4 py-8 text-sm text-center text-gray-400">
            No commands match "{{ query }}"
          </div>

          <template v-for="group in groupedCommands" :key="group.group">
            <div class="px-4 pt-3 pb-1 text-xs font-bold tracking-wide text-gray-400 uppercase">
              {{ group.group }}
            </div>
            <button
              v-for="cmd in group.items"
              :key="cmd.id"
              type="button"
              :data-index="flatIndexOf(cmd.id)"
              class="flex items-center w-full px-4 py-2 space-x-3 text-sm text-left transition-colors focus:outline-none"
              :class="flatIndexOf(cmd.id) === activeIndex
                ? 'bg-gray-100 dark:bg-base-lvl-1'
                : 'hover:bg-gray-50 dark:hover:bg-base-lvl-1'"
              @mouseenter="activeIndex = flatIndexOf(cmd.id)"
              @click.stop="activeIndex = flatIndexOf(cmd.id); executeActive()"
            >
              <i v-if="cmd.icon" :class="cmd.icon" class="w-5 text-center text-gray-500 dark:text-gray-400" />
              <span class="flex-1 text-gray-700 dark:text-gray-200">{{ cmd.label }}</span>
              <span v-if="cmd.description" class="text-xs text-gray-400">{{ cmd.description }}</span>
            </button>
          </template>
        </div>

        <!-- Footer hint -->
        <div class="flex items-center justify-between px-4 py-2 text-xs text-gray-400 border-t border-gray-100 dark:border-base-lvl-3 dark:bg-base-lvl-1">
          <div class="flex items-center space-x-3">
            <span><kbd class="px-1 border rounded dark:border-base-lvl-3">↑↓</kbd> navigate</span>
            <span><kbd class="px-1 border rounded dark:border-base-lvl-3">↵</kbd> run</span>
          </div>
          <div>{{ filtered.length }} result{{ filtered.length === 1 ? "" : "s" }}</div>
        </div>
      </div>
    </div>
  </Transition>
</template>
