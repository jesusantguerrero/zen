<script setup>
import { nextTick, ref, provide, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from './components/organisms/AppHeader.vue'
import IntegrationsBar from './components/templates/IntegrationsBar.vue'
import { logout, setLoaded, functions, firebaseState, firebaseInstance } from "./plugins/useFirebase"
import MobileMenuBar from './components/organisms/mobile/MobileMenuBar.vue'
import KeyboardShortcutsModal from './components/organisms/modals/KeyboardShortcutsModal.vue'
import CommandPalette from './components/organisms/modals/CommandPalette.vue'
import PwaInstallPrompt from './components/molecules/PwaInstallPrompt.vue'
import { useCollection } from './plugins/firebase/useCollection'
import { useIntegrations } from './plugins/firebase/useIntegrations'
import { useCustomSelect } from './plugins/firebase/useCustomSelect'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'
import { useCommandPalette } from './composables/useCommandPalette'
import { useTheme } from './composables/useTheme'

const { closeConnections } = useIntegrations()
const { getAllShared, getAll } = useCollection();
const isLoaded = ref(false);
const logoutUser = () => {
  logout().then(() => {
    nextTick(() => {
      location.reload()
    })
  })
}

setLoaded(() => {
  isLoaded.value = true;
  const messaging = firebaseInstance.messaging();
  messaging.onMessage(() => {})
})


const { itemsRef: contactsRef, getInitialItems: getInitialContacts} = useCustomSelect([], 'contacts')
const { itemsRef: tagsRef, getInitialItems: getInitialTags} = useCustomSelect([], 'tags')

const sharedRef = ref(null)
const shared = ref([])
const sharingRef = ref(null)
const sharing = ref([])


const getShared = (name, queryRef, queryRefValue) => {
  queryRef.value = getAllShared(name).onSnapshot(snap => {
    queryRefValue.value = [];
    snap.forEach((doc) => {
        queryRefValue.value.push({...doc.data(), uid: doc.id });
    })
  })
}

provide('shared', shared);
provide('sharing', sharing);

const notificationsRef = ref(null)
const notifications = ref([])
const getNotifications = () => {
  notificationsRef.value = getAll('notifications')
  .orderBy('created_at', 'desc')
  .where('read_at', '==', false)
  .onSnapshot(snap => {
    notifications.value = [];
    snap.forEach((doc) => {
        notifications.value.push({...doc.data(), uid: doc.id });
    })
  })
}

provide('notifications', notifications);

watch(() => isLoaded.value, () => {
  getShared('shared', sharedRef, shared)
  getShared('sharing', sharingRef, sharing)
  getInitialTags()
  getNotifications()
  getInitialContacts()
  const dailyNotifications = functions.httpsCallable('dailyNotifications');
  dailyNotifications();
})

const { toggleShortcutsPanel } = useKeyboardShortcuts()
const { toggle: toggleCommandPalette, register: registerCommands } = useCommandPalette()
const { toggleTheme } = useTheme()
const router = useRouter()

const isTypingTarget = (target) => {
  const tag = target?.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable
}

const onGlobalKeydown = (event) => {
  const target = event.target
  const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
  if (isCmdK) {
    event.preventDefault()
    toggleCommandPalette()
    return
  }
  if (event.key !== '?') return
  if (isTypingTarget(target)) return
  event.preventDefault()
  toggleShortcutsPanel()
}

const registerDefaultCommands = () => {
  registerCommands([
    // Navigation
    { id: 'nav:zenboard', group: 'Navigate', label: 'Go to Dashboard', icon: 'fa fa-columns', keywords: ['dashboard', 'zenboard', 'home'], action: () => router.push({ name: 'zenboard' }) },
    { id: 'nav:matrix', group: 'Navigate', label: 'Go to Matrix', icon: 'fa fa-th', keywords: ['matrix', 'eisenhower', 'priority'], action: () => router.push({ name: 'matrix' }) },
    { id: 'nav:timer', group: 'Navigate', label: 'Go to Timer', icon: 'fa fa-clock', keywords: ['timer', 'pomodoro', 'tracking'], action: () => router.push({ name: 'timer' }) },
    { id: 'nav:standup', group: 'Navigate', label: 'Go to Standup', icon: 'fa fa-list-ul', keywords: ['standup', 'scrum', 'daily'], action: () => router.push('/standup') },
    { id: 'nav:metrics', group: 'Navigate', label: 'Go to Metrics', icon: 'fa fa-chart-bar', keywords: ['metrics', 'stats', 'reports'], action: () => router.push('/metrics') },
    { id: 'nav:notifications', group: 'Navigate', label: 'Go to Notifications', icon: 'fa fa-bell', keywords: ['notifications', 'alerts'], action: () => router.push({ name: 'notifications' }) },
    { id: 'nav:settings', group: 'Navigate', label: 'Go to Settings', icon: 'fa fa-cog', keywords: ['settings', 'preferences', 'config'], action: () => router.push({ name: 'settings' }) },
    // Actions
    { id: 'action:theme', group: 'Actions', label: 'Toggle dark / light mode', icon: 'fa fa-moon', keywords: ['theme', 'dark', 'light'], action: () => toggleTheme() },
    { id: 'action:shortcuts', group: 'Actions', label: 'Show keyboard shortcuts', icon: 'fa fa-keyboard', keywords: ['help', 'shortcuts', 'keys'], action: () => toggleShortcutsPanel() },
    { id: 'action:logout', group: 'Account', label: 'Log out', icon: 'fa fa-sign-out-alt', keywords: ['logout', 'sign out', 'exit'], action: () => logoutUser() },
  ])
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
  registerDefaultCommands()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
  tagsRef.value && tagsRef.value()
  contactsRef.value && contactsRef.value()
  sharedRef.value && sharedRef.value()
  sharingRef.value && sharingRef.value()
  notificationsRef.value && notificationsRef.value()
  closeConnections()
})
</script>

<template>
    <div class="text-center">
        <AppHeader :user="firebaseState.user" class="z-50" @logout="logoutUser" v-if="firebaseState.user"/>
        <RouterView />
        <IntegrationsBar v-if="firebaseState.user" />
        <MobileMenuBar v-if="firebaseState.user" />
        <KeyboardShortcutsModal v-if="firebaseState.user" />
        <CommandPalette v-if="firebaseState.user" />
        <PwaInstallPrompt v-if="firebaseState.user" />
    </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.dark {
  .el-message-box {
      @apply bg-base-lvl-1;
  }

  #WH_frame_count .topBar {
    @apply bg-base-lvl-1;
  }
}

</style>