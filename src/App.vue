<template>
  <div class="text-center">
    <app-header :user="firebaseState.user" class="z-50" @logout="logoutUser" v-if="firebaseState.user"/>
    <router-view> </router-view>
    <app-footer v-if="firebaseState.user"></app-footer>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import { useRouter } from "vue-router"
import AppHeader from './components/organisms/AppHeader.vue'
import AppFooter from './components/organisms/AppFooter.vue'
import { logout, setLoaded, firebaseState } from "./utils/useFirebase"

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