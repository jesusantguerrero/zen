<template>
  <div
    class="relative flex items-start p-3 space-x-3 transition-colors border-b border-gray-100 group last:border-b-0 hover:bg-gray-50 dark:border-base-lvl-3 dark:hover:bg-base-lvl-1"
    :class="{ 'bg-gray-100 dark:bg-base-lvl-1': !notification.read_at }"
  >
    <!-- Category icon -->
    <div
      class="flex items-center justify-center w-8 h-8 rounded-md shrink-0"
      :class="categoryMeta.bgClass"
    >
      <i :class="[categoryMeta.icon, categoryMeta.colorClass]" />
    </div>

    <!-- Body -->
    <div class="flex-1 min-w-0 cursor-pointer" @click="runAction">
      <div class="flex items-center text-xs font-bold text-gray-500 dark:text-gray-400">
        <span>{{ categoryMeta.label }}</span>
        <span
          v-if="priority !== 'medium'"
          class="inline-flex items-center ml-2"
          :class="priorityMeta.colorClass"
          :title="`${priorityMeta.label} priority`"
        >
          <span class="inline-block w-1.5 h-1.5 mr-1 rounded-full" :class="priorityMeta.dotClass"></span>
          {{ priorityMeta.label }}
        </span>
        <span v-if="!notification.read_at" class="ml-auto inline-block w-2 h-2 bg-accent rounded-full" title="Unread"></span>
      </div>
      <div class="mt-1 text-sm text-gray-700 dark:text-gray-200">
        <span v-if="notification.data.title" class="font-semibold">{{ notification.data.title }}: </span>
        {{ notification.data.message }}
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center transition-opacity opacity-0 shrink-0 group-hover:opacity-100 focus-within:opacity-100">
      <el-popover placement="bottom-end" trigger="click" :width="180" :show-arrow="false">
        <template #reference>
          <button
            type="button"
            class="w-8 h-8 text-gray-400 transition-colors rounded hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-base-lvl-2 focus:outline-none"
            title="Snooze"
          >
            <i class="fa fa-clock" />
          </button>
        </template>
        <ul class="py-1">
          <li
            v-for="option in snoozeOptions"
            :key="option.label"
            class="px-3 py-2 text-sm rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-base-lvl-1"
            @click="snooze(option)"
          >
            {{ option.label }}
          </li>
        </ul>
      </el-popover>
      <button
        type="button"
        class="w-8 h-8 text-gray-400 transition-colors rounded hover:bg-gray-200 hover:text-red-500 dark:hover:bg-base-lvl-2 focus:outline-none"
        title="Dismiss"
        @click.stop="dismiss"
      >
        <i class="fa fa-times" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import { ElPopover, ElNotification } from "element-plus"
import { useCollection } from "@/plugins/firebase/useCollection"
import { firebaseInstance } from "@/plugins/useFirebase"
import {
  CATEGORY_META,
  PRIORITY_META,
  SNOOZE_OPTIONS,
  computeSnoozeUntil,
  resolveCategory,
  resolvePriority,
} from "@/domain/notifications/notificationTypes"

const props = defineProps<{
  notification: {
    uid: string
    data: { title?: string; message?: string; action?: string; category?: string; priority?: string }
    read_at?: any
    snoozed_until?: any
  }
}>()

const router = useRouter()
const { update } = useCollection()

const category = computed(() => resolveCategory(props.notification))
const categoryMeta = computed(() => CATEGORY_META[category.value])
const priority = computed(() => resolvePriority(props.notification))
const priorityMeta = computed(() => PRIORITY_META[priority.value])
const snoozeOptions = SNOOZE_OPTIONS

const markRead = async () => {
  if (props.notification.read_at) return
  await update("notifications", {
    ...props.notification,
    read_at: firebaseInstance.firestore.Timestamp.now(),
  })
}

const runAction = async () => {
  await markRead()
  const action = props.notification.data?.action
  if (action === "stale") router.push("/matrix?tab=matrix:stale")
  else if (action === "overdue") router.push("/matrix?tab=matrix:overdue")
}

const snooze = async (option: { label: string; ms: number }) => {
  const until = computeSnoozeUntil(option)
  // Snooze hides from the visible lists (filtered by snoozed_until > now)
  // without marking read — notification returns when snooze expires.
  await update("notifications", {
    ...props.notification,
    snoozed_until: firebaseInstance.firestore.Timestamp.fromDate(until),
  })
  ElNotification({
    type: "success",
    title: "Snoozed",
    message: `Hidden until ${option.label.toLowerCase()}`,
  })
}

const dismiss = async () => {
  await update("notifications", {
    ...props.notification,
    read_at: firebaseInstance.firestore.Timestamp.now(),
    dismissed_at: firebaseInstance.firestore.Timestamp.now(),
  })
}
</script>
