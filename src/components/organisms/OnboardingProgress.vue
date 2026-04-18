<script setup lang="ts">
import { computed, inject, ref, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import { db, firebaseState, updateSettings } from "@/plugins/useFirebase"

const router = useRouter()

interface IMatrix {
  list: any[]
}

const props = defineProps<{
  matrix: Record<string, IMatrix>
}>()

// Whether the widget is dismissed for this user
const dismissed = computed(() => Boolean(firebaseState.settings?.onboarding_dismissed))

// Milestone 1: has any task
const totalTasks = computed(() =>
  Object.values(props.matrix || {}).reduce(
    (acc, m: any) => acc + (m?.list?.length || 0),
    0
  )
)
const hasAnyTask = computed(() => totalTasks.value > 0)

// Milestone 2: has a prioritized task (anything in todo/schedule/delegate — not backlog)
const hasPrioritized = computed(() => {
  const m = props.matrix || {}
  return (
    (m.todo?.list?.length || 0) +
      (m.schedule?.list?.length || 0) +
      (m.delegate?.list?.length || 0) >
    0
  )
})

// Milestone 3: has completed at least one task (query committed tasks)
const hasCompletion = ref(false)
let completedUnsubscribe: (() => void) | null = null
const listenForCompletions = () => {
  const uid = firebaseState.user?.uid
  if (!uid) return
  completedUnsubscribe = db
    .collection("tasks")
    .where("user_uid", "==", uid)
    .where("done", "==", true)
    .limit(1)
    .onSnapshot((snap) => {
      hasCompletion.value = !snap.empty
    })
}
listenForCompletions()
onUnmounted(() => {
  if (completedUnsubscribe) completedUnsubscribe()
})

// Milestone 4: has tracked time (query tracks)
const hasPomodoro = ref(false)
let tracksUnsubscribe: (() => void) | null = null
const listenForTracks = () => {
  const uid = firebaseState.user?.uid
  if (!uid) return
  tracksUnsubscribe = db
    .collection("tracks")
    .where("user_uid", "==", uid)
    .limit(1)
    .onSnapshot((snap) => {
      hasPomodoro.value = !snap.empty
    })
}
listenForTracks()
onUnmounted(() => {
  if (tracksUnsubscribe) tracksUnsubscribe()
})

const milestones = computed(() => [
  {
    id: "task",
    label: "Create a task",
    done: hasAnyTask.value,
    action: () => router.push({ name: "zenboard" }),
    hint: "Press Shift+K or tap New",
  },
  {
    id: "prioritize",
    label: "Prioritize one into the matrix",
    done: hasPrioritized.value,
    action: () => router.push({ name: "matrix" }),
    hint: "Move it to TODO / SCHEDULE / DELEGATE",
  },
  {
    id: "pomodoro",
    label: "Run a pomodoro",
    done: hasPomodoro.value,
    action: () => router.push({ name: "timer" }),
    hint: "Tap the play button on any task",
  },
  {
    id: "complete",
    label: "Mark a task done",
    done: hasCompletion.value,
    action: () => router.push({ name: "zenboard" }),
    hint: "Check the box — we'll celebrate",
  },
])

const doneCount = computed(() => milestones.value.filter((m) => m.done).length)
const total = computed(() => milestones.value.length)
const isComplete = computed(() => doneCount.value === total.value)

const dismiss = async () => {
  await updateSettings({ onboarding_dismissed: true } as any)
}
</script>

<template>
  <section
    v-if="!dismissed && !isComplete"
    class="p-4 space-y-3 bg-white border border-gray-200 rounded-md shadow-sm dark:bg-base-lvl-2 dark:border-base-lvl-3 dark:text-gray-300"
  >
    <header class="flex items-baseline justify-between">
      <h4 class="text-sm font-bold tracking-wide uppercase text-gray-500 dark:text-gray-400">
        Getting started
      </h4>
      <span class="text-xs text-gray-400">{{ doneCount }} / {{ total }}</span>
    </header>

    <!-- Progress bar -->
    <div class="h-1 overflow-hidden bg-gray-100 rounded-full dark:bg-base-lvl-1">
      <div
        class="h-full transition-all bg-accent"
        :style="{ width: `${(doneCount / total) * 100}%` }"
      />
    </div>

    <ul class="space-y-2">
      <li
        v-for="milestone in milestones"
        :key="milestone.id"
        class="flex items-start p-2 space-x-2 text-sm transition-colors rounded cursor-pointer group hover:bg-gray-50 dark:hover:bg-base-lvl-1"
        @click="!milestone.done && milestone.action()"
      >
        <span
          class="flex items-center justify-center w-5 h-5 mt-0.5 transition-colors rounded-full shrink-0"
          :class="milestone.done ? 'bg-accent text-white' : 'border-2 border-gray-300 dark:border-base-lvl-3'"
        >
          <i v-if="milestone.done" class="text-[10px] fa fa-check" />
        </span>
        <div class="flex-1 min-w-0">
          <div
            class="text-gray-700 dark:text-gray-200"
            :class="milestone.done ? 'line-through text-gray-400 dark:text-gray-500' : ''"
          >
            {{ milestone.label }}
          </div>
          <div v-if="!milestone.done" class="text-xs text-gray-400 opacity-0 group-hover:opacity-100">
            {{ milestone.hint }}
          </div>
        </div>
      </li>
    </ul>

    <footer class="flex justify-end pt-2 border-t border-gray-100 dark:border-base-lvl-3">
      <button
        type="button"
        class="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
        @click="dismiss"
      >
        Hide
      </button>
    </footer>
  </section>

  <!-- Celebration when complete — only shows until dismissed -->
  <section
    v-else-if="!dismissed && isComplete"
    class="p-4 text-center bg-white border border-accent/40 rounded-md shadow-sm dark:bg-base-lvl-2 dark:border-accent/40 dark:text-gray-300"
  >
    <div class="mb-2 text-3xl">🎉</div>
    <div class="font-bold text-gray-700 dark:text-gray-200">You're set up</div>
    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
      You ran the full loop. Ship something this week.
    </p>
    <button
      type="button"
      class="mt-3 text-xs text-accent hover:underline focus:outline-none"
      @click="dismiss"
    >
      Hide this
    </button>
  </section>
</template>
