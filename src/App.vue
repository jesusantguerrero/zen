<template>
<div class="text-center">
  <app-header :user="firebaseState.user" class="z-50" @logout="logoutUser" />
  <login v-if="!firebaseState.user && isLoaded">

  </login>
  <zen-board  v-else-if="isLoaded" class="pt-24" />
</div>
</template>

<script setup>
import ZenBoard from './views/ZenBoard.vue'
import Login from './views/Login.vue'
import AppHeader from './components/organisms/AppHeader.vue'
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