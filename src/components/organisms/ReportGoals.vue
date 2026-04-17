<script setup lang="ts">
import { computed, ref } from "vue"
import { firebaseState, updateSettings } from "@/plugins/useFirebase"

const props = defineProps<{
  statsByDay: Array<any> | null | undefined
  timeData: string[] | null | undefined
}>()

const goal = computed(() => {
  const raw = firebaseState.settings?.pomodoro_daily_goal
  const n = typeof raw === "number" ? raw : parseInt(raw as any, 10)
  return Number.isFinite(n) && n > 0 ? n : 4
})

const editing = ref(false)
const draftGoal = ref(goal.value)

const startEdit = () => {
  draftGoal.value = goal.value
  editing.value = true
}

const saveGoal = async () => {
  const n = Number(draftGoal.value)
  if (!Number.isFinite(n) || n < 1) {
    editing.value = false
    return
  }
  await updateSettings({ pomodoro_daily_goal: n })
  editing.value = false
}

const days = computed(() => {
  const stats = props.statsByDay || []
  const labels = props.timeData || []
  return stats.map((day, i) => {
    const completed = day ? day.pomodoro.finished : 0
    const percent = Math.min(100, (completed / goal.value) * 100)
    const hit = completed >= goal.value
    return {
      label: labels[i] || "",
      completed,
      percent,
      hit,
    }
  })
})

const hitDays = computed(() => days.value.filter((d) => d.hit).length)
</script>

<template>
  <section class="px-5 py-5 bg-white border border-gray-100 rounded-lg shadow-md dark:bg-base-lvl-2 dark:border-base-lvl-3">
    <header class="flex items-center justify-between mb-5">
      <div>
        <h3 class="font-bold text-left text-gray-700 dark:text-gray-300">Daily goal</h3>
        <p class="text-xs text-gray-400">Pomodoros completed vs target</p>
      </div>
      <div class="flex items-center space-x-2 text-sm">
        <span class="text-gray-500 dark:text-gray-300">Goal:</span>
        <template v-if="!editing">
          <button
            type="button"
            class="px-3 py-1 font-bold transition-colors border-2 border-gray-200 rounded-md text-accent focus:outline-none hover:border-accent dark:border-base-lvl-3"
            @click="startEdit"
          >
            {{ goal }} / day
          </button>
        </template>
        <template v-else>
          <input
            v-model="draftGoal"
            type="number"
            min="1"
            max="20"
            class="w-16 px-2 py-1 text-center border-2 border-gray-200 rounded-md dark:bg-base-lvl-1 dark:border-base-lvl-3 dark:text-gray-300 focus:outline-none focus:border-accent"
            @keyup.enter="saveGoal"
            @blur="saveGoal"
          />
        </template>
      </div>
    </header>

    <div class="flex items-end justify-between h-32 space-x-2">
      <div
        v-for="(day, i) in days"
        :key="i"
        class="flex flex-col items-center flex-1 text-xs text-gray-500"
      >
        <div class="text-xs font-bold" :class="day.hit ? 'text-accent' : 'text-gray-400'">
          {{ day.completed }}
        </div>
        <div class="relative flex items-end justify-center w-full my-1" style="height: 70px">
          <div class="absolute inset-x-0 bottom-0 w-full bg-gray-100 rounded-md dark:bg-base-lvl-1" style="height: 100%" />
          <div
            class="relative w-full transition-all rounded-md"
            :class="day.hit ? 'bg-accent' : 'bg-blue-400'"
            :style="{ height: `${day.percent}%` }"
          />
        </div>
        <div class="mt-1 text-gray-400 whitespace-nowrap">{{ day.label }}</div>
      </div>
    </div>

    <footer class="flex justify-center pt-4 mt-4 text-sm border-t border-gray-100 dark:border-base-lvl-3">
      <span class="text-gray-500 dark:text-gray-300">
        <span class="font-bold text-accent">{{ hitDays }}</span> / {{ days.length }} days on target this week
      </span>
    </footer>
  </section>
</template>
