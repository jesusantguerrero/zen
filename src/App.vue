<template>
  <div class="text-center">
    <app-header :user="firebaseState.user" class="z-50" @logout="logoutUser" v-if="firebaseState.user"/>
    <router-view> </router-view>
  </div>
</template>

<script setup>
import { nextTick, ref, provide, onUnmounted, watch } from 'vue'
import { useRouter } from "vue-router"
import AppHeader from './components/organisms/AppHeader.vue'
import { logout, setLoaded, firebaseState, firebaseInstance } from "./utils/useFirebase"
import { useCustomSelect } from "./utils/useCustomSelect"
import { useCollection } from "./utils/useCollection"

const { getAllShared } = useCollection();
const isLoaded = ref(false);
const { push } = useRouter();
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

const getShared = () => {
  sharedRef.value = getAllShared('shared').onSnapshot(snap => {
    shared.value = [];
    snap.forEach((doc) => {
        shared.value.push({...doc.data(), uid: doc.id });
    })
  })
}

provide('shared', shared);


watch(() => isLoaded.value, () => {
  getShared()
  getInitialTags()
  getInitialContacts()
})

onUnmounted(() => {
  tagsRef.value && tagsRef.value()
  contactsRef.value && contactsRef.value()
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