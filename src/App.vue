<template>
  <div class="text-center">
    <app-header :user="firebaseState.user" class="z-50" @logout="logoutUser" v-if="firebaseState.user"/>
    <router-view> </router-view>
    <app-footer v-if="firebaseState.user"></app-footer>
  </div>
</template>

<script setup>
import { nextTick, ref, provide, onUnmounted, watch } from 'vue'
import { useRouter } from "vue-router"
import AppHeader from './components/organisms/AppHeader.vue'
import AppFooter from './components/organisms/AppFooter.vue'
import { logout, setLoaded, firebaseState, firebaseInstance } from "./utils/useFirebase"
import { useCollection} from "./utils/useCollection"

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
      console.log(payload)
  })
})

const { getAll } = useCollection()
const tagsRef = ref(null)
const tags = ref(null)
const getInitialTags = () => {
  tagsRef.value = getAll('tags').onSnapshot(snap => {
    tags.value = [];
    snap.forEach((doc) => {
        tags.value.push({...doc.data(), uid: doc.id });
    })
  })
}
provide('tags', tags);

watch(() => isLoaded.value, () => {
  getInitialTags()
})

onUnmounted(() => {
  tagsRef.value && tagsRef.value()
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