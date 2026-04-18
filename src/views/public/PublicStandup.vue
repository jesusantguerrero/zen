<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import { usePublicStandup, PublicStandup } from "@/plugins/firebase/usePublicStandup"
import { STAGE_META } from "@/domain/matrix/types/enum/taskTypes"

const route = useRoute()
const { fetchStandup } = usePublicStandup()

const standup = ref<PublicStandup | null>(null)
const state = ref<"loading" | "not-found" | "ready">("loading")
const copied = ref(false)

onMounted(async () => {
  const uid = route.params.uid as string
  const date = route.params.date as string
  try {
    const data = await fetchStandup(uid, date)
    if (!data) {
      state.value = "not-found"
      return
    }
    standup.value = data
    state.value = "ready"
  } catch {
    state.value = "not-found"
  }
})

const matrixLabels: Record<string, string> = {
  todo: "Do first",
  schedule: "Scheduled",
  delegate: "Delegated",
  delete: "Drop",
  backlog: "Backlog",
}

const formatDate = (iso: string) => {
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return iso
  }
}

// Backwards-compat readers:
// - older docs lack `status` → treat as 'completed'
// - older docs lack `when`   → treat as 'today'
const statusOf = (t: { status?: string }) =>
  t.status === "in_progress" ? "in_progress" : "completed"
const whenOf = (t: { when?: string }) =>
  t.when === "yesterday" ? "yesterday" : "today"

// Narrow `task.stage` (string | null | undefined) to a STAGE_META lookup without
// fighting the StageTypes keyof constraint inside templates.
const stageMetaOf = (stage?: string | null) =>
  stage ? (STAGE_META as Record<string, any>)[stage] || null : null

const yesterdayTasks = computed(() =>
  (standup.value?.tasks || []).filter((t) => whenOf(t) === "yesterday")
)
const todayTasks = computed(() =>
  (standup.value?.tasks || []).filter((t) => whenOf(t) === "today")
)

const todayCompleted = computed(() =>
  todayTasks.value.filter((t) => statusOf(t) === "completed")
)
const todayInProgress = computed(() =>
  todayTasks.value.filter((t) => statusOf(t) === "in_progress")
)

const totalCount = computed(() => standup.value?.tasks.length || 0)

const textVersion = computed(() => {
  if (!standup.value) return ""
  const lines: string[] = []
  lines.push(`${standup.value.display_name}'s standup — ${formatDate(standup.value.date)}`)
  lines.push("")
  if (yesterdayTasks.value.length) {
    lines.push("Yesterday:")
    for (const t of yesterdayTasks.value) lines.push(`  • ${t.title}`)
    lines.push("")
  }
  if (todayTasks.value.length) {
    lines.push("Today:")
    for (const t of todayCompleted.value) lines.push(`  ✓ ${t.title}`)
    for (const t of todayInProgress.value) lines.push(`  ◌ ${t.title} (in progress)`)
  }
  return lines.join("\n").trimEnd()
})

const copyAsText = async () => {
  try {
    await navigator.clipboard.writeText(textVersion.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    // no-op; browsers without clipboard permission will just not copy
  }
}
</script>

<template>
  <div class="min-h-screen bg-base-lvl-1 text-gray-200">
    <div class="max-w-2xl px-6 py-16 mx-auto">
      <header class="mb-10 text-left">
        <router-link to="/" class="inline-flex items-center text-sm text-gray-400 transition-colors hover:text-accent">
          <span class="mr-2 font-bold zen" style="font-family: 'Potta One', cursive">Zen.</span>
        </router-link>
      </header>

      <div v-if="state === 'loading'" class="py-20 text-center text-gray-400">
        Loading…
      </div>

      <div v-else-if="state === 'not-found'" class="py-20 text-center">
        <h1 class="text-2xl font-bold text-gray-200">Standup not found</h1>
        <p class="mt-3 text-gray-500">
          This standup hasn't been published yet, or the link is wrong.
        </p>
        <router-link
          to="/"
          class="inline-block mt-6 text-sm font-semibold text-accent hover:underline"
        >
          ← Back to zenboard.app
        </router-link>
      </div>

      <template v-else-if="standup">
        <header class="flex flex-wrap items-end justify-between gap-4 mb-8 text-left">
          <div>
            <h1 class="text-3xl font-bold">{{ standup.display_name }}'s standup</h1>
            <p class="mt-2 text-gray-400">{{ formatDate(standup.date) }}</p>
            <p v-if="totalCount" class="mt-1 text-xs text-gray-500">
              <span class="font-semibold text-gray-400">{{ yesterdayTasks.length }}</span> yesterday ·
              <span class="font-semibold text-gray-400">{{ todayTasks.length }}</span> today
            </p>
          </div>

          <button
            v-if="totalCount"
            type="button"
            class="flex items-center h-9 px-3 space-x-2 text-xs font-semibold transition-colors border-2 rounded-md border-base-lvl-3 text-gray-300 hover:border-accent hover:text-accent focus:outline-none"
            :title="copied ? 'Copied!' : 'Copy as plain text'"
            @click="copyAsText"
          >
            <i :class="copied ? 'fa fa-check text-accent' : 'fa fa-copy'" aria-hidden="true"></i>
            <span>{{ copied ? "Copied" : "Copy as text" }}</span>
          </button>
        </header>

        <div v-if="!totalCount" class="py-10 text-center text-gray-500">
          Nothing to report for this day.
        </div>

        <template v-else>
          <!-- Yesterday: what I did -->
          <section v-if="yesterdayTasks.length" class="mb-10">
            <h2 class="flex items-center mb-3 text-sm font-bold tracking-wider uppercase text-gray-400">
              <span class="inline-block w-2 h-2 mr-2 rounded-full bg-accent" aria-hidden="true"></span>
              Yesterday
              <span class="ml-2 text-xs font-normal text-gray-500">{{ yesterdayTasks.length }}</span>
            </h2>
            <ol class="space-y-3">
              <li
                v-for="(task, i) in yesterdayTasks"
                :key="'yst-' + i"
                class="p-4 text-left border rounded-md bg-base-lvl-2 border-base-lvl-3"
              >
                <div class="font-semibold text-gray-100">
                  <i class="mr-2 fa fa-check text-accent" aria-hidden="true"></i>
                  {{ task.title }}
                </div>
                <div class="flex flex-wrap items-center gap-2 mt-2 text-xs">
                  <span v-if="task.matrix" class="px-2 py-0.5 rounded-full bg-base-lvl-3 text-gray-300">
                    {{ matrixLabels[task.matrix] || task.matrix }}
                  </span>
                  <span
                    v-if="stageMetaOf(task.stage)"
                    class="flex items-center px-2 py-0.5 rounded-full"
                    :class="stageMetaOf(task.stage).badgeClass"
                  >
                    <span class="inline-block w-1.5 h-1.5 mr-1 rounded-full" :class="stageMetaOf(task.stage).dotClass"></span>
                    {{ stageMetaOf(task.stage).label }}
                  </span>
                  <template v-if="task.tags && task.tags.length">
                    <span
                      v-for="tag in task.tags"
                      :key="tag.uid || tag.name"
                      class="px-2 py-0.5 text-gray-400 rounded-full bg-base-lvl-3"
                    >
                      #{{ tag.name || tag.uid }}
                    </span>
                  </template>
                </div>
              </li>
            </ol>
          </section>

          <!-- Today: what I'm doing (done + in progress) -->
          <section v-if="todayTasks.length">
            <h2 class="flex items-center mb-3 text-sm font-bold tracking-wider uppercase text-gray-400">
              <span class="inline-block w-2 h-2 mr-2 rounded-full bg-blue-400" aria-hidden="true"></span>
              Today
              <span class="ml-2 text-xs font-normal text-gray-500">{{ todayTasks.length }}</span>
            </h2>
            <ol class="space-y-3">
              <li
                v-for="(task, i) in todayTasks"
                :key="'tdy-' + i"
                class="p-4 text-left border rounded-md bg-base-lvl-2 border-base-lvl-3"
              >
                <div class="font-semibold text-gray-100">
                  <template v-if="statusOf(task) === 'completed'">
                    <i class="mr-2 fa fa-check text-accent" aria-hidden="true"></i>
                  </template>
                  <template v-else>
                    <i class="mr-2 text-blue-400 far fa-circle" aria-hidden="true"></i>
                  </template>
                  {{ task.title }}
                  <span
                    v-if="statusOf(task) === 'in_progress'"
                    class="ml-2 text-xs font-normal text-blue-300/80"
                  >
                    in progress
                  </span>
                </div>
                <div class="flex flex-wrap items-center gap-2 mt-2 text-xs">
                  <span v-if="task.matrix" class="px-2 py-0.5 rounded-full bg-base-lvl-3 text-gray-300">
                    {{ matrixLabels[task.matrix] || task.matrix }}
                  </span>
                  <span
                    v-if="stageMetaOf(task.stage)"
                    class="flex items-center px-2 py-0.5 rounded-full"
                    :class="stageMetaOf(task.stage).badgeClass"
                  >
                    <span class="inline-block w-1.5 h-1.5 mr-1 rounded-full" :class="stageMetaOf(task.stage).dotClass"></span>
                    {{ stageMetaOf(task.stage).label }}
                  </span>
                  <template v-if="task.tags && task.tags.length">
                    <span
                      v-for="tag in task.tags"
                      :key="tag.uid || tag.name"
                      class="px-2 py-0.5 text-gray-400 rounded-full bg-base-lvl-3"
                    >
                      #{{ tag.name || tag.uid }}
                    </span>
                  </template>
                </div>
              </li>
            </ol>
          </section>
        </template>

        <footer class="pt-10 mt-12 text-center border-t border-base-lvl-3">
          <p class="mb-3 text-sm text-gray-500">Tracked with</p>
          <router-link to="/" class="inline-flex items-center text-xl font-bold text-accent">
            <span class="zen" style="font-family: 'Potta One', cursive">Zen.</span>
          </router-link>
          <p class="mt-3 text-xs text-gray-500">
            <router-link to="/register" class="hover:underline">Track yours free →</router-link>
          </p>
        </footer>
      </template>
    </div>
  </div>
</template>
