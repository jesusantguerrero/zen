<template>
  <login v-if="!firebaseState.user && isLoaded"></login>
  <div class="text-center" v-else-if="isLoaded">
    <app-header :user="firebaseState.user" class="z-50" @logout="logoutUser" />
    <router-view></router-view>
    <app-footer></app-footer>
  </div>
</template>

<script setup>
import ZenBoard from './views/ZenBoard.vue'
import Login from './views/Login.vue'
import AppHeader from './components/organisms/AppHeader.vue'
import AppFooter from './components/organisms/AppFooter.vue'
import { reactive, ref } from 'vue'
import { firebaseState, logout, setLoaded } from "./utils/useFirebase"

const isLoaded = ref(false);

const logoutUser = () => {
  logout()
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