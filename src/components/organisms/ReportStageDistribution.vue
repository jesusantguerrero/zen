<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"
import { db, firebaseState } from "@/plugins/useFirebase"
import { StageTypes, STAGE_META, STAGE_ORDER } from "@/domain/matrix/types/enum/taskTypes"

type Mode = "all" | "open"
const mode = ref<Mode>("open")

const tasks = ref<Array<{ stage?: StageTypes | null; done?: boolean }>>([])
let unsubscribe: (() => void) | null = null

const subscribe = () => {
  if (!firebaseState.user?.uid) return
  if (unsubscribe) unsubscribe()
  unsubscribe = db
    .collection("tasks")
    .where("user_uid", "==", firebaseState.user.uid)
    .onSnapshot((snap) => {
      const list: Array<{ stage?: StageTypes | null; done?: boolean }> = []
      snap.forEach((doc) => list.push(doc.data() as any))
      tasks.value = list
    })
}

onMounted(subscribe)
onUnmounted(() => unsubscribe && unsubscribe())

const counts = computed(() => {
  const result: Record<string, number> = {}
  STAGE_ORDER.forEach((s) => (result[s] = 0))
  result["_unstaged"] = 0

  tasks.value.forEach((t) => {
    if (mode.value === "open" && t.done) return
    if (t.stage && result[t.stage] !== undefined) result[t.stage] += 1
    else result["_unstaged"] += 1
  })
  return result
})

const total = computed(() =>
  Object.values(counts.value).reduce((sum, n) => sum + n, 0)
)

const rows = computed(() => {
  const staged = STAGE_ORDER.map((key) => ({
    key,
    label: STAGE_META[key].label,
    dotClass: STAGE_META[key].dotClass,
    badgeClass: STAGE_META[key].badgeClass,
    count: counts.value[key],
  }))
  return [
    ...staged,
    {
      key: "_unstaged",
      label: "Unstaged",
      dotClass: "bg-gray-300",
      badgeClass: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
      count: counts.value["_unstaged"],
    },
  ]
})
</script>

<template>
  <section class="px-5 py-5 bg-white border border-gray-100 rounded-lg shadow-md dark:bg-base-lvl-2 dark:border-base-lvl-3">
    <header class="flex items-center justify-between mb-5">
      <div>
        <h3 class="font-bold text-left text-gray-700 dark:text-gray-300">Stage distribution</h3>
        <p class="text-xs text-gray-400">Where your tasks are sitting — spot bottlenecks</p>
      </div>
      <div class="flex items-center space-x-1 text-xs">
        <button
          type="button"
          class="px-3 py-1 transition-colors border-2 rounded-md focus:outline-none"
          :class="mode === 'open' ? 'bg-gray-100 dark:bg-base-lvl-1 text-accent border-transparent' : 'text-gray-500 border-gray-200 dark:border-base-lvl-3'"
          @click="mode = 'open'"
        >Open</button>
        <button
          type="button"
          class="px-3 py-1 transition-colors border-2 rounded-md focus:outline-none"
          :class="mode === 'all' ? 'bg-gray-100 dark:bg-base-lvl-1 text-accent border-transparent' : 'text-gray-500 border-gray-200 dark:border-base-lvl-3'"
          @click="mode = 'all'"
        >All</button>
      </div>
    </header>

    <div v-if="!total" class="py-10 text-sm text-center text-gray-400">
      No tasks to chart yet.
    </div>
    <ul v-else class="space-y-3">
      <li v-for="row in rows" :key="row.key" class="flex items-center space-x-3 text-sm">
        <div class="flex items-center w-32 text-left shrink-0">
          <span class="inline-block w-2 h-2 mr-2 rounded-full" :class="row.dotClass"></span>
          <span class="text-gray-600 dark:text-gray-300">{{ row.label }}</span>
        </div>
        <div class="flex-1 h-2 overflow-hidden bg-gray-100 rounded-full dark:bg-base-lvl-1">
          <div
            class="h-full rounded-full"
            :class="row.dotClass"
            :style="{ width: total ? `${(row.count / total) * 100}%` : '0%' }"
          />
        </div>
        <div class="w-10 font-bold text-right text-gray-500 dark:text-gray-300">{{ row.count }}</div>
      </li>
    </ul>
  </section>
</template>
