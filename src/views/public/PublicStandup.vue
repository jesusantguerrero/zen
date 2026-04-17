<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import { usePublicStandup, PublicStandup } from "@/plugins/firebase/usePublicStandup"
import { STAGE_META } from "@/domain/matrix/types/enum/taskTypes"

const route = useRoute()
const { fetchStandup } = usePublicStandup()

const standup = ref<PublicStandup | null>(null)
const state = ref<"loading" | "not-found" | "ready">("loading")

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
        <header class="mb-10 text-left">
          <h1 class="text-3xl font-bold">{{ standup.display_name }}'s standup</h1>
          <p class="mt-2 text-gray-400">{{ formatDate(standup.date) }}</p>
        </header>

        <div v-if="!standup.tasks.length" class="py-10 text-center text-gray-500">
          No tasks completed on this day.
        </div>

        <ol v-else class="space-y-3">
          <li
            v-for="(task, i) in standup.tasks"
            :key="i"
            class="p-4 text-left bg-base-lvl-2 border border-base-lvl-3 rounded-md"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="font-semibold text-gray-100">✓ {{ task.title }}</div>
                <div class="flex items-center mt-2 space-x-2 text-xs">
                  <span v-if="task.matrix" class="px-2 py-0.5 rounded-full bg-base-lvl-3 text-gray-300">
                    {{ matrixLabels[task.matrix] || task.matrix }}
                  </span>
                  <span
                    v-if="task.stage && STAGE_META[task.stage]"
                    class="flex items-center px-2 py-0.5 rounded-full"
                    :class="STAGE_META[task.stage].badgeClass"
                  >
                    <span class="inline-block w-1.5 h-1.5 mr-1 rounded-full" :class="STAGE_META[task.stage].dotClass"></span>
                    {{ STAGE_META[task.stage].label }}
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
              </div>
            </div>
          </li>
        </ol>

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
