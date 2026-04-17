<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  statsByDay: Array<any> | null | undefined
  timeData: string[] | null | undefined
  completedByDay: number[] | null | undefined
}>()

const tasksBars = computed(() => {
  const data = props.completedByDay || []
  const max = Math.max(1, ...data)
  return data.map((count) => ({
    count,
    percent: (count / max) * 100,
  }))
})

const timeBars = computed(() => {
  const stats = props.statsByDay || []
  const values = stats.map((d: any) => (d ? d.pomodoro.duration_ms : 0))
  const max = Math.max(1, ...values)
  return values.map((ms: number) => ({
    ms,
    percent: (ms / max) * 100,
  }))
})

const formatHours = (ms: number) => {
  if (!ms) return "0h"
  const hours = ms / 1000 / 60 / 60
  if (hours < 1) return `${Math.round((ms / 1000 / 60))}m`
  return `${hours.toFixed(1)}h`
}

const totalCompleted = computed(() =>
  (props.completedByDay || []).reduce((sum, n) => sum + n, 0)
)
</script>

<template>
  <section class="px-5 py-5 bg-white border border-gray-100 rounded-lg shadow-md dark:bg-base-lvl-2 dark:border-base-lvl-3">
    <header class="flex items-center justify-between mb-5">
      <div>
        <h3 class="font-bold text-left text-gray-700 dark:text-gray-300">Productivity trend</h3>
        <p class="text-xs text-gray-400">Tasks completed and focus time by day</p>
      </div>
      <div class="text-sm text-gray-500 dark:text-gray-300">
        <span class="font-bold text-accent">{{ totalCompleted }}</span> tasks this week
      </div>
    </header>

    <div class="grid grid-cols-7 gap-2">
      <div
        v-for="(day, index) in timeData || []"
        :key="index"
        class="flex flex-col items-center text-xs text-gray-500"
      >
        <div class="flex items-end justify-center w-full mb-2 space-x-1" style="height: 100px">
          <div
            class="w-3 transition-all rounded-t-sm bg-accent"
            :style="{ height: `${tasksBars[index]?.percent || 0}%` }"
            :title="`${tasksBars[index]?.count || 0} tasks completed`"
          />
          <div
            class="w-3 transition-all bg-blue-400 rounded-t-sm"
            :style="{ height: `${timeBars[index]?.percent || 0}%` }"
            :title="formatHours(timeBars[index]?.ms || 0)"
          />
        </div>
        <div class="font-semibold">{{ tasksBars[index]?.count || 0 }}</div>
        <div class="text-blue-400">{{ formatHours(timeBars[index]?.ms || 0) }}</div>
        <div class="mt-1 text-gray-400 whitespace-nowrap">{{ day }}</div>
      </div>
    </div>

    <footer class="flex items-center justify-center pt-4 mt-4 space-x-4 text-xs border-t border-gray-100 dark:border-base-lvl-3">
      <div class="flex items-center">
        <span class="inline-block w-3 h-3 mr-1 rounded-sm bg-accent"></span>
        <span class="text-gray-500 dark:text-gray-300">Tasks completed</span>
      </div>
      <div class="flex items-center">
        <span class="inline-block w-3 h-3 mr-1 bg-blue-400 rounded-sm"></span>
        <span class="text-gray-500 dark:text-gray-300">Focus time</span>
      </div>
    </footer>
  </section>
</template>
