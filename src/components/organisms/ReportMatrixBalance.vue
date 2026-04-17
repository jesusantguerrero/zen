<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"
import { db, firebaseState } from "@/plugins/useFirebase"
import { MatrixTypes } from "@/domain/matrix/types/enum/taskTypes"

const props = defineProps<{
  tracks: Array<{ task_uid?: string; duration_ms?: number }>
}>()

const taskMatrixMap = ref<Record<string, string>>({})
let unsubscribe: (() => void) | null = null

const subscribe = () => {
  if (!firebaseState.user?.uid) return
  unsubscribe = db
    .collection("tasks")
    .where("user_uid", "==", firebaseState.user.uid)
    .onSnapshot((snap) => {
      const map: Record<string, string> = {}
      snap.forEach((doc) => {
        const data: any = doc.data()
        if (data.matrix) map[doc.id] = data.matrix
      })
      taskMatrixMap.value = map
    })
}

onMounted(subscribe)
onUnmounted(() => unsubscribe && unsubscribe())

const QUADRANTS: Array<{ key: string; label: string; color: string; bg: string }> = [
  { key: MatrixTypes.TODO, label: "Do first", color: "text-green-500", bg: "bg-green-400" },
  { key: MatrixTypes.SCHEDULE, label: "Schedule", color: "text-blue-500", bg: "bg-blue-400" },
  { key: MatrixTypes.DELEGATE, label: "Delegate", color: "text-yellow-500", bg: "bg-yellow-400" },
  { key: MatrixTypes.DELETE, label: "Delete", color: "text-red-500", bg: "bg-red-400" },
]

const timeByMatrix = computed(() => {
  const totals: Record<string, number> = {}
  QUADRANTS.forEach((q) => (totals[q.key] = 0))
  totals["backlog"] = 0
  totals["unknown"] = 0

  props.tracks.forEach((track) => {
    const matrix = track.task_uid && taskMatrixMap.value[track.task_uid]
    const ms = track.duration_ms || 0
    if (matrix && totals[matrix] !== undefined) totals[matrix] += ms
    else if (matrix === "backlog") totals["backlog"] += ms
    else totals["unknown"] += ms
  })
  return totals
})

const totalMs = computed(() =>
  Object.values(timeByMatrix.value).reduce((sum, n) => sum + n, 0)
)

const formatHours = (ms: number) => {
  if (!ms) return "0h"
  const hours = ms / 1000 / 60 / 60
  if (hours < 1) return `${Math.round(ms / 1000 / 60)}m`
  return `${hours.toFixed(1)}h`
}

const rows = computed(() =>
  QUADRANTS.map((q) => ({
    ...q,
    ms: timeByMatrix.value[q.key],
    percent: totalMs.value ? (timeByMatrix.value[q.key] / totalMs.value) * 100 : 0,
  }))
)

const insight = computed(() => {
  if (!totalMs.value) return null
  const todoMs = timeByMatrix.value[MatrixTypes.TODO]
  const scheduleMs = timeByMatrix.value[MatrixTypes.SCHEDULE]
  const todoPct = (todoMs / totalMs.value) * 100
  const schedulePct = (scheduleMs / totalMs.value) * 100

  if (todoPct > 70) return "You're mostly firefighting (TODO-heavy). Try investing more in Schedule this week."
  if (schedulePct > 60) return "Strong week — lots of important-but-not-urgent work."
  if (schedulePct < 20 && todoPct < 20) return "Most time is on uncategorized or low-priority work — check your matrix."
  return null
})
</script>

<template>
  <section class="px-5 py-5 bg-white border border-gray-100 rounded-lg shadow-md dark:bg-base-lvl-2 dark:border-base-lvl-3">
    <header class="mb-4">
      <h3 class="font-bold text-left text-gray-700 dark:text-gray-300">Matrix balance</h3>
      <p class="text-xs text-gray-400">Where your time goes by quadrant</p>
    </header>

    <div v-if="!totalMs" class="py-10 text-sm text-center text-gray-400">
      No tracked time this week.
    </div>

    <template v-else>
      <div class="flex w-full h-4 overflow-hidden rounded-full bg-gray-100 dark:bg-base-lvl-1">
        <div
          v-for="row in rows"
          :key="row.key"
          class="h-full transition-all"
          :class="row.bg"
          :style="{ width: `${row.percent}%` }"
          :title="`${row.label}: ${formatHours(row.ms)}`"
        />
      </div>

      <ul class="grid grid-cols-2 gap-3 mt-4 text-sm">
        <li v-for="row in rows" :key="row.key" class="flex items-center">
          <span class="inline-block w-3 h-3 mr-2 rounded-sm" :class="row.bg"></span>
          <span class="w-20 text-left text-gray-600 dark:text-gray-300">{{ row.label }}</span>
          <span class="ml-auto font-bold" :class="row.color">{{ formatHours(row.ms) }}</span>
          <span class="ml-2 text-xs text-gray-400">{{ Math.round(row.percent) }}%</span>
        </li>
      </ul>

      <p v-if="insight" class="pt-4 mt-4 text-xs text-gray-500 border-t border-gray-100 dark:border-base-lvl-3 dark:text-gray-400">
        <i class="mr-1 fa fa-lightbulb text-accent"></i> {{ insight }}
      </p>
    </template>
  </section>
</template>
