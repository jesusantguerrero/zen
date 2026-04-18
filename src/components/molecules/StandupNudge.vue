<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"
import { useRouter } from "vue-router"
import { DateTime } from "luxon"
import { db, firebaseState, updateSettings } from "@/plugins/useFirebase"

const router = useRouter()

const dismissedKey = computed(() => {
  const dismissed = firebaseState.settings?.standup_nudge_dismissed_date as string | undefined
  return dismissed || null
})

const todayKey = DateTime.now().toFormat("yyyy-MM-dd")
const yesterdayKey = DateTime.now().minus({ days: 1 }).toFormat("yyyy-MM-dd")

// Track whether the user has any committed (done) tasks from yesterday
const hasYesterdayCommits = ref(false)
let unsubscribe: (() => void) | null = null

onMounted(() => {
  const uid = firebaseState.user?.uid
  if (!uid) return
  unsubscribe = db
    .collection("tasks")
    .where("user_uid", "==", uid)
    .where("done", "==", true)
    .where("commit_date", "==", yesterdayKey)
    .limit(1)
    .onSnapshot((snap) => {
      hasYesterdayCommits.value = !snap.empty
    })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const isVisible = computed(() => {
  if (!hasYesterdayCommits.value) return false
  if (dismissedKey.value === todayKey) return false
  return true
})

const goStandup = async () => {
  await updateSettings({ standup_nudge_dismissed_date: todayKey } as any)
  router.push({ name: "standup" } as any)
}

const dismiss = async () => {
  await updateSettings({ standup_nudge_dismissed_date: todayKey } as any)
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
  >
    <section
      v-if="isVisible"
      class="flex items-center p-3 mb-4 space-x-3 text-sm border rounded-md border-accent/40 bg-accent/10 dark:bg-accent/10 dark:text-gray-200"
    >
      <div class="flex items-center justify-center w-10 h-10 text-white rounded-md shrink-0 bg-accent">
        <i class="fa fa-list-ul" />
      </div>
      <div class="flex-1">
        <div class="font-semibold text-gray-700 dark:text-gray-200">
          Your standup is ready
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Yesterday's completed tasks are waiting. Paste it to your team in 10 seconds.
        </p>
      </div>
      <button
        type="button"
        class="h-9 px-3 text-sm font-semibold text-white transition-colors rounded-md bg-accent hover:opacity-90 focus:outline-none"
        @click="goStandup"
      >
        Open standup
      </button>
      <button
        type="button"
        class="w-8 h-8 text-gray-400 transition-colors rounded hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
        title="Dismiss for today"
        @click="dismiss"
      >
        <i class="fa fa-times" />
      </button>
    </section>
  </Transition>
</template>
