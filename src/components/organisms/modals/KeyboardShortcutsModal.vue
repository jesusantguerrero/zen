<script setup lang="ts">
import { computed } from "vue";
import ModalBase from "@/components/molecules/ModalBase.vue";
import { useKeyboardShortcuts, SHORTCUTS } from "@/composables/useKeyboardShortcuts";

const { isOpen, closeShortcutsPanel } = useKeyboardShortcuts();

const grouped = computed(() => {
  const map: Record<string, typeof SHORTCUTS> = {};
  for (const shortcut of SHORTCUTS) {
    const scope = shortcut.scope || "General";
    map[scope] = map[scope] || [];
    map[scope].push(shortcut);
  }
  return map;
});

const onUpdate = (value: boolean) => {
  if (!value) closeShortcutsPanel();
};
</script>

<template>
  <ModalBase
    :is-open="isOpen"
    title="Keyboard shortcuts"
    content-class="md:w-5/12"
    click-to-close
    @update:is-open="onUpdate"
  >
    <template #body>
      <div class="px-6 py-4 space-y-6 dark:text-gray-200">
        <div v-for="(list, scope) in grouped" :key="scope">
          <h4 class="mb-2 text-sm font-bold tracking-wide uppercase text-gray-500 dark:text-gray-400">
            {{ scope }}
          </h4>
          <ul class="space-y-1">
            <li
              v-for="shortcut in list"
              :key="shortcut.keys"
              class="flex items-center justify-between py-1"
            >
              <span>{{ shortcut.description }}</span>
              <kbd
                class="px-2 py-0.5 text-xs font-mono bg-gray-100 rounded border border-gray-300 dark:bg-base-lvl-1 dark:border-base-lvl-3"
              >
                {{ shortcut.keys }}
              </kbd>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </ModalBase>
</template>
