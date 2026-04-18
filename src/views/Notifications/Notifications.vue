<template>
  <div class="pt-24 pb-20 mx-5 text-left md:pt-28 md:mx-28">
    <header class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <h1 class="text-2xl font-bold text-gray-400 dark:text-gray-300">Notifications</h1>
        <span
          v-if="unreadCount"
          class="ml-3 px-2 py-0.5 text-xs font-bold text-white rounded-full bg-accent"
        >
          {{ unreadCount }}
        </span>
      </div>
      <button
        type="button"
        class="flex items-center h-10 px-4 space-x-2 text-sm text-gray-500 transition-colors border-2 border-gray-200 rounded-md hover:border-gray-400 focus:outline-none dark:bg-transparent dark:text-gray-300 dark:border-base-lvl-3 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!filteredNotifications.length || isMarking"
        @click="markAllRead"
      >
        <i :class="isMarking ? 'fa fa-spinner fa-pulse' : 'fa fa-check'" />
        <span>Mark all as read</span>
      </button>
    </header>

    <!-- Category filter -->
    <div class="flex flex-wrap items-center gap-2 mb-4">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="flex items-center px-3 py-1 space-x-2 text-sm transition-colors border-2 rounded-full focus:outline-none"
        :class="activeTab === tab.key
          ? 'bg-gray-100 dark:bg-base-lvl-1 text-accent border-transparent'
          : 'text-gray-500 border-gray-200 dark:border-base-lvl-3'"
        @click="activeTab = tab.key"
      >
        <i v-if="tab.icon" :class="tab.icon" />
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.count"
          class="px-1.5 py-0 text-xs rounded-full bg-gray-200 dark:bg-base-lvl-2"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <section class="overflow-hidden bg-white border border-gray-200 rounded-md shadow-sm dark:bg-base-lvl-2 dark:border-base-lvl-3">
      <div v-if="!filteredNotifications.length" class="p-8 text-sm text-center text-gray-400">
        <i class="block mb-2 text-2xl fa fa-check-circle text-accent" />
        <div>You're all caught up.</div>
      </div>
      <NotificationItem
        v-for="notification in filteredNotifications"
        :key="notification.uid"
        :notification="notification"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from "vue"
import { ElNotification } from "element-plus"
import NotificationItem from "@/components/atoms/NotificationItem.vue"
import { useCollection } from "@/plugins/firebase/useCollection"
import { firebaseInstance } from "@/plugins/useFirebase"
import {
  NotificationCategory,
  CATEGORY_META,
  resolveCategory,
} from "@/domain/notifications/notificationTypes"

const injected = inject<any>("notifications", [])
const notifications = computed(() => {
  const raw = injected && typeof injected === "object" && "value" in injected ? injected.value : injected
  return Array.isArray(raw) ? raw : []
})
const { update } = useCollection()

const activeTab = ref<"all" | NotificationCategory>("all")
const isMarking = ref(false)

const visibleNotifications = computed(() => {
  const now = Date.now()
  return notifications.value.filter((n: any) => {
    const snoozed = n.snoozed_until?.toMillis?.()
    if (snoozed && snoozed > now) return false
    return true
  })
})

const countByCategory = computed(() => {
  const counts: Record<string, number> = { all: 0 }
  Object.values(NotificationCategory).forEach((c) => (counts[c] = 0))
  visibleNotifications.value.forEach((n: any) => {
    counts.all += 1
    const cat = resolveCategory(n)
    counts[cat] = (counts[cat] || 0) + 1
  })
  return counts
})

const tabs = computed(() => [
  { key: "all" as const, label: "All", icon: "", count: countByCategory.value.all },
  ...Object.values(NotificationCategory).map((cat) => ({
    key: cat,
    label: CATEGORY_META[cat].label,
    icon: CATEGORY_META[cat].icon,
    count: countByCategory.value[cat],
  })),
])

const filteredNotifications = computed(() => {
  if (activeTab.value === "all") return visibleNotifications.value
  return visibleNotifications.value.filter(
    (n: any) => resolveCategory(n) === activeTab.value
  )
})

const unreadCount = computed(() =>
  visibleNotifications.value.filter((n: any) => !n.read_at).length
)

const markAllRead = async () => {
  const targets = filteredNotifications.value.filter((n: any) => !n.read_at)
  if (!targets.length) return
  isMarking.value = true
  try {
    const now = firebaseInstance.firestore.Timestamp.now()
    await Promise.all(
      targets.map((n: any) => update("notifications", { ...n, read_at: now }))
    )
    ElNotification({ type: "success", title: `Marked ${targets.length} as read` })
  } catch (err: any) {
    ElNotification({ type: "error", title: "Error", message: err?.message })
  } finally {
    isMarking.value = false
  }
}
</script>
