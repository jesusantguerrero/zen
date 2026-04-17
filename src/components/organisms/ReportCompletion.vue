<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  statsByDay: Array<any> | null | undefined
  started: number
  finished: number
}>()

const completionRate = computed(() => {
  if (!props.started) return 0
  return Math.round((props.finished / props.started) * 100)
})

// Current streak counting from the most recent day backwards
const currentStreak = computed(() => {
  const stats = props.statsByDay || []
  if (!stats.length) return 0
  let streak = 0
  for (let i = stats.length - 1; i >= 0; i--) {
    const day = stats[i]
    if (day && day.pomodoro.started > 0) streak += 1
    else break
  }
  return streak
})

const activeDays = computed(() => {
  return (props.statsByDay || []).filter((d) => d && d.pomodoro.started > 0).length
})
</script>

<template>
  <section class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <div class="flex items-center px-5 py-5 bg-white border border-gray-100 rounded-lg shadow-md dark:bg-base-lvl-2 dark:border-base-lvl-3">
      <div class="flex items-center justify-center w-12 h-12 mr-4 text-lg text-green-500 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200">
        <i class="fa fa-check" />
      </div>
      <div class="text-left">
        <div class="text-2xl font-bold text-gray-700 dark:text-gray-300">{{ completionRate }}%</div>
        <div class="text-xs text-gray-400">Pomodoro completion rate</div>
      </div>
    </div>

    <div class="flex items-center px-5 py-5 bg-white border border-gray-100 rounded-lg shadow-md dark:bg-base-lvl-2 dark:border-base-lvl-3">
      <div class="flex items-center justify-center w-12 h-12 mr-4 text-lg text-red-500 bg-red-100 rounded-full dark:bg-red-900 dark:text-red-200">
        <i class="fa fa-fire" />
      </div>
      <div class="text-left">
        <div class="text-2xl font-bold text-gray-700 dark:text-gray-300">{{ currentStreak }}</div>
        <div class="text-xs text-gray-400">Day streak (from today)</div>
      </div>
    </div>

    <div class="flex items-center px-5 py-5 bg-white border border-gray-100 rounded-lg shadow-md dark:bg-base-lvl-2 dark:border-base-lvl-3">
      <div class="flex items-center justify-center w-12 h-12 mr-4 text-lg text-blue-500 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
        <i class="fa fa-calendar-check" />
      </div>
      <div class="text-left">
        <div class="text-2xl font-bold text-gray-700 dark:text-gray-300">{{ activeDays }} / 7</div>
        <div class="text-xs text-gray-400">Active days this week</div>
      </div>
    </div>
  </section>
</template>
