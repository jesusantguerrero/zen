<template>
  <div class="text-center">
      <AppHeader :user="firebaseState.user" class="z-50" @logout="logoutUser" v-if="firebaseState.user"/>
      <RouterView />
      <IntegrationsBar v-if="firebaseState.user" />
      <MobileMenuBar v-if="firebaseState.user" />
  </div>
</template>

<script setup>
import { nextTick, ref, provide, onUnmounted, watch } from 'vue'
import AppHeader from './components/organisms/AppHeader.vue'
import IntegrationsBar from './components/templates/IntegrationsBar.vue'
import { logout, setLoaded, functions, firebaseState, firebaseInstance } from "./utils/useFirebase"
import { useCustomSelect } from "./utils/useCustomSelect"
import { useCollection } from "./utils/useCollection"
import { useIntegrations } from './utils/useIntegrations'
import MobileMenuBar from './components/organisms/mobile/MobileMenuBar.vue'

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
  messaging.onMessage((payload) => {
    console.log(payload, "Mi mensaje favorito")
  })
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

onUnmounted(() => {
  tagsRef.value && tagsRef.value()
  contactsRef.value && contactsRef.value()
  sharedRef.value && sharedRef.value()
  sharingRef.value && sharingRef.value()
  notificationsRef.value && notificationsRef.value()
  closeConnections()
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>