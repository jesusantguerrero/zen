<template>
  <div class="px-16 py-5 text-left">
    <!-- Desktop push notifications -->
    <section class="pb-6 mb-6 border-b border-gray-200 dark:border-base-lvl-3">
      <div class="flex items-start space-x-4">
        <div class="flex items-center justify-center w-12 h-12 text-lg rounded-md shrink-0"
             :class="pushStatus.bgClass">
          <i :class="['fa fa-bell', pushStatus.colorClass]" />
        </div>
        <div class="flex-1">
          <h2 class="font-bold text-gray-700 dark:text-gray-200">Desktop notifications</h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ pushStatus.description }}
          </p>
          <div class="flex items-center mt-3 space-x-2">
            <button
              v-if="!push.isSubscribed.value && push.permission.value !== 'denied'"
              type="button"
              class="h-10 px-4 text-sm font-semibold text-white transition-colors rounded-md bg-accent hover:opacity-90 focus:outline-none disabled:opacity-50"
              :disabled="push.isRequesting.value || push.permission.value === 'unsupported'"
              @click="enablePush"
            >
              <i v-if="push.isRequesting.value" class="mr-1 fa fa-spinner fa-pulse" />
              Enable desktop notifications
            </button>
            <button
              v-if="push.isSubscribed.value"
              type="button"
              class="h-10 px-4 text-sm text-gray-500 transition-colors border-2 border-gray-200 rounded-md hover:border-red-400 hover:text-red-500 focus:outline-none dark:border-base-lvl-3"
              @click="disablePush"
            >
              Disable
            </button>
          </div>
          <p v-if="push.permission.value === 'denied'" class="mt-3 text-xs text-red-500">
            Notifications are blocked in your browser settings. Re-enable them in your browser, then reload this page.
          </p>
        </div>
      </div>
    </section>

    <!-- Email digest -->
    <section class="pb-6 mb-6 border-b border-gray-200 dark:border-base-lvl-3">
      <div class="flex items-start space-x-4">
        <div class="flex items-center justify-center w-12 h-12 text-lg text-blue-500 bg-blue-100 rounded-md shrink-0 dark:bg-blue-900/30">
          <i class="fa fa-envelope" />
        </div>
        <div class="flex-1">
          <h2 class="font-bold text-gray-700 dark:text-gray-200">Daily email digest</h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            A short morning email with what you shipped yesterday, overdue tasks, and hours tracked.
            Sent at 8am UTC. Turn it off anytime.
          </p>
          <label class="flex items-center mt-3 cursor-pointer">
            <input
              type="checkbox"
              class="w-4 h-4 mr-2"
              :checked="state.dailyDigestOptIn"
              @change="toggleDigest(($event.target as HTMLInputElement).checked)"
            />
            <span class="text-sm text-gray-700 dark:text-gray-200">Send me a daily digest</span>
          </label>
        </div>
      </div>
    </section>

    <!-- Per-category preferences -->
    <div class="w-full text-left">
      <div class="grid grid-cols-3 mt-5 mb-2 font-bold">
        <h1>Notification</h1>
        <h1 class="text-right">Via Email (coming soon)</h1>
        <h1 class="text-right">In app</h1>
      </div>
      <div class="grid grid-cols-3 mb-2" v-for="notification in notifications" :key="notification.name">
        <h1>{{ notification.label }}</h1>
        <h1 class="text-right"><input type="checkbox" disabled v-model="notification.email"></h1>
        <h1 class="text-right"><input type="checkbox" v-model="notification.app"></h1>
      </div>

      <div class="mt-10 text-right">
        <Button type="success" class="text-white bg-green-400" @click="saveNotificationSettings">Save</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElNotification } from "element-plus"
import { computed, onMounted, reactive } from "vue"
import Button from "../atoms/Button.vue"
import { settingsService } from "@/services/settings.service"
import { AppSettings, NotificationSetting } from "@/domain/settings/types/settingsApi"
import { usePush } from "@/plugins/firebase/usePush"

const settingsApiService = new settingsService()
const push = usePush()

const state = reactive<{
  notifications: NotificationSetting[],
  settings: Partial<AppSettings> | AppSettings,
  dailyDigestOptIn: boolean
}>({
  notifications: [
    { name: "daily_completion_reminder", label: "Daily Completion Reminder", app: true, email: false },
    { name: "overdue_reminder", label: "Overdue Tasks Reminder", app: true, email: false },
    { name: "stale_reminder", label: "Stale Tasks Reminder", app: true, email: false },
    { name: "task_reminders", label: "Task Reminders", app: true, email: false },
  ],
  settings: {},
  dailyDigestOptIn: false,
})

const toggleDigest = async (enabled: boolean) => {
  state.dailyDigestOptIn = enabled
  try {
    await settingsApiService.updateSettings({ daily_digest_opt_in: enabled } as any)
    ElNotification({
      type: "success",
      title: enabled ? "Daily digest enabled" : "Daily digest disabled",
    })
  } catch (err: any) {
    state.dailyDigestOptIn = !enabled
    ElNotification({
      type: "error",
      title: "Could not save",
      message: err?.message,
    })
  }
}

const notifications = computed(() => state.notifications)

const pushStatus = computed(() => {
  if (push.permission.value === "unsupported") {
    return {
      description: "This browser doesn't support desktop notifications.",
      bgClass: "bg-gray-100 dark:bg-gray-700",
      colorClass: "text-gray-500",
    }
  }
  if (push.permission.value === "denied") {
    return {
      description: "Notifications are blocked. Re-enable them in your browser to use desktop alerts.",
      bgClass: "bg-red-100 dark:bg-red-900/30",
      colorClass: "text-red-500",
    }
  }
  if (push.isSubscribed.value) {
    return {
      description: "Desktop notifications are active. You'll get alerts for overdue tasks and reminders even when Zen isn't open.",
      bgClass: "bg-green-100 dark:bg-green-900/30",
      colorClass: "text-accent",
    }
  }
  return {
    description: "Get notified about overdue tasks, reminders, and shared updates — even when Zen is in the background.",
    bgClass: "bg-gray-100 dark:bg-gray-700",
    colorClass: "text-gray-500",
  }
})

const enablePush = async () => {
  try {
    const result = await push.subscribe()
    if (result.granted) {
      ElNotification({
        title: "Desktop notifications enabled",
        message: "You'll get alerts for overdue tasks and reminders.",
        type: "success",
      })
    } else {
      ElNotification({
        title: "Permission denied",
        message: "You declined notifications. Change your mind in your browser settings.",
        type: "warning",
      })
    }
  } catch (err: any) {
    ElNotification({
      title: "Could not enable notifications",
      message: err?.message || "Unknown error",
      type: "error",
    })
  }
}

const disablePush = async () => {
  await push.unsubscribe()
  ElNotification({ title: "Desktop notifications disabled", type: "success" })
}

const mergeNotificationSettings = () => {
  if (!state.settings.notificationSettings) return
  state.notifications = state.notifications.reduce<NotificationSetting[]>((acc, notification) => {
    const serverValue = state.settings.notificationSettings.find((not) => notification.name == not.name)
    acc.push(serverValue || notification)
    return acc
  }, [])
}

onMounted(async () => {
  state.settings = await settingsApiService.getSettings()
  mergeNotificationSettings()
  state.dailyDigestOptIn = Boolean((state.settings as any).daily_digest_opt_in)
})

const saveNotificationSettings = () => {
  settingsApiService.updateSettings({
    notificationSettings: state.notifications,
  }).then(() => {
    ElNotification({
      title: "Saved",
      message: "Notification settings saved",
      type: "success",
    })
  })
}
</script>
