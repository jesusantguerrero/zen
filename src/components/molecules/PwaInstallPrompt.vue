<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"

const DISMISS_KEY = "zen:pwa-install-dismissed"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const visible = ref(false)

const isDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1"
  } catch {
    return false
  }
}

const markDismissed = () => {
  try {
    localStorage.setItem(DISMISS_KEY, "1")
  } catch {}
}

const onBeforeInstall = (event: Event) => {
  const e = event as BeforeInstallPromptEvent
  e.preventDefault()
  if (isDismissed()) return
  deferredPrompt.value = e
  visible.value = true
}

const install = async () => {
  const prompt = deferredPrompt.value
  if (!prompt) return
  await prompt.prompt()
  const { outcome } = await prompt.userChoice
  if (outcome === "accepted") {
    markDismissed()
  }
  deferredPrompt.value = null
  visible.value = false
}

const dismiss = () => {
  markDismissed()
  visible.value = false
}

onMounted(() => {
  window.addEventListener("beforeinstallprompt", onBeforeInstall)
})

onUnmounted(() => {
  window.removeEventListener("beforeinstallprompt", onBeforeInstall)
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-4 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-4 opacity-0"
  >
    <div
      v-if="visible"
      class="fixed z-50 flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-lg shadow-xl bottom-4 right-4 dark:bg-base-lvl-2 dark:border-base-lvl-3"
      role="dialog"
      aria-live="polite"
    >
      <div class="flex items-center justify-center w-10 h-10 text-white rounded-md bg-accent">
        <i class="fa fa-download" />
      </div>
      <div class="text-sm text-left">
        <div class="font-bold text-gray-700 dark:text-gray-200">Install Zen</div>
        <div class="text-xs text-gray-400">Run Zen as an app, launch faster, work offline.</div>
      </div>
      <button
        type="button"
        class="h-10 px-4 text-sm font-semibold text-white transition-colors rounded-md bg-accent hover:opacity-90 focus:outline-none"
        @click="install"
      >
        Install
      </button>
      <button
        type="button"
        class="px-2 text-gray-400 hover:text-gray-600 focus:outline-none dark:hover:text-gray-200"
        title="Dismiss"
        @click="dismiss"
      >
        <i class="fa fa-times" />
      </button>
    </div>
  </Transition>
</template>
