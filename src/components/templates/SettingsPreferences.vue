<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { DateTime } from "luxon";
import { ElNotification } from "element-plus";
import { useTheme, Theme } from "@/composables/useTheme";
import { firebaseState, updateSettings } from "@/plugins/useFirebase";
import { useKeyboardShortcuts } from "@/composables/useKeyboardShortcuts";

const { theme, setTheme } = useTheme();
const { openShortcutsPanel } = useKeyboardShortcuts();

const COMMON_ZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "America/Santo_Domingo",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Madrid",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
];

const detectedZone = DateTime.local().zoneName || "UTC";
const zones = computed(() => {
  const set = new Set<string>(COMMON_ZONES);
  if (detectedZone) set.add(detectedZone);
  return Array.from(set).sort();
});

const timezone = ref<string>(
  (firebaseState.settings && firebaseState.settings.timezone) || detectedZone
);

const setThemeValue = (value: Theme) => setTheme(value);

watch(timezone, async (value) => {
  try {
    await updateSettings({ timezone: value });
    ElNotification({ type: "success", message: "Timezone updated" });
  } catch (err) {
    console.error(err);
    ElNotification({ type: "error", message: "Could not save timezone" });
  }
});
</script>

<template>
  <section class="py-5 px-16 text-left dark:text-gray-200">
    <h1 class="pb-10 text-2xl font-bold">Preferences</h1>

    <article class="mb-10">
      <h4 class="mb-2 font-bold">Appearance</h4>
      <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Choose how Zen looks on this device.
      </p>
      <div class="flex gap-3">
        <button
          v-for="option in ['dark', 'light'] as Theme[]"
          :key="option"
          class="px-4 py-2 capitalize border rounded-md transition-colors"
          :class="
            theme === option
              ? 'border-accent text-accent'
              : 'border-gray-300 dark:border-base-lvl-3 hover:border-gray-400'
          "
          @click="setThemeValue(option)"
        >
          <i class="mr-2" :class="option === 'dark' ? 'fa fa-moon' : 'fa fa-sun'" />
          {{ option }}
        </button>
      </div>
    </article>

    <article class="mb-10">
      <h4 class="mb-2 font-bold">Timezone</h4>
      <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Used for due dates, commit dates, and daily summaries. Detected:
        <span class="font-mono">{{ detectedZone }}</span>
      </p>
      <select
        v-model="timezone"
        class="px-3 py-2 bg-white border border-gray-300 rounded-md dark:bg-base-lvl-2 dark:border-base-lvl-3"
      >
        <option v-for="zone in zones" :key="zone" :value="zone">{{ zone }}</option>
      </select>
    </article>

    <article>
      <h4 class="mb-2 font-bold">Keyboard shortcuts</h4>
      <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Press <kbd class="px-1 bg-gray-200 dark:bg-base-lvl-3 rounded">?</kbd>
        anywhere to view the shortcut reference.
      </p>
      <button
        class="px-4 py-2 border border-gray-300 rounded-md dark:border-base-lvl-3 hover:border-gray-400"
        @click="openShortcutsPanel()"
      >
        Open shortcuts panel
      </button>
    </article>
  </section>
</template>
