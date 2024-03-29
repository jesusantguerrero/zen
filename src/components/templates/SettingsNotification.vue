<template>
  <div class="px-16 py-5 text-left">
    <div class="w-full px-5 text-left md:flex">
      <div class="w-full">
        <div class="grid grid-cols-3 mt-5 mb-2 font-bold">
          <h1> Notification</h1>
          <h1 class="text-right"> Via Email (Coming Soon)</h1>
          <h1 class="text-right"> In app</h1>
        </div>
        <div class="grid grid-cols-3 mb-2" v-for="notification in notifications" :key="notification.name">
          <h1> {{ notification.label }}</h1>
          <h1 class="text-right"> <input type="checkbox" disabled v-model="notification.email"></h1>
          <h1 class="text-right"> <input type="checkbox" v-model="notification.app"></h1>
        </div>

        <div class="mt-10 text-right">
          <Button type="success" class="text-white bg-green-400" @click="saveNotificationSettings()"> Save </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElNotification } from "element-plus";
import { onMounted, reactive } from "vue";
import Button from "../atoms/Button.vue";
import {  settingsService } from "@/services/settings.service";
import { AppSettings, NotificationSetting } from "@/domain/settings/types/settingsApi";

const settingsApiService = new settingsService();

const state = reactive<{
  notifications: NotificationSetting[],
  settings: Partial<AppSettings> | AppSettings
}>({
  notifications: [
    {
      name: 'daily_completion_reminder',
      label: 'Daily Completion Reminder',
      app: true,
      email: false
    },
    {
      name: 'overdue_reminder',
      label: 'Overdue Tasks Reminder',
      app: true,
      email: false
    },
    {
      name: 'stale_reminder',
      label: 'Stale Tasks Reminder',
      app: true,
      email: false
    },
    {
      name: 'task_reminders',
      label: 'Task Reminders',
      app: true,
      email: false
    },
  ],
  settings: {}
});

const mergeNotificationSettings = () => {
  if (!state.settings.notificationSettings) {
    return
  }
  
  state.notifications = state.notifications.reduce((notifications, notification) => {
    const serverValue = state.settings.notificationSettings.find(not => notification.name == not.name);
    notifications.push(serverValue || notification);
    return notifications;
    }, [])
}

onMounted(async() => {
  state.settings = await settingsApiService.getSettings();
  mergeNotificationSettings();
})


const saveNotificationSettings = () => {
  settingsApiService.updateSettings({
    notificationSettings: state.notifications
  }).then(() => {
    ElNotification({
      title: 'Saved',
      message: 'Notification settings saved',
      type: 'success'
    })
  });
}
</script>
