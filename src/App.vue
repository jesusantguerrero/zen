<template>
  <div class="text-center">
    <app-header :user="firebaseState.user" class="z-50" @logout="logoutUser" v-if="firebaseState.user"/>
    <router-view>

    </router-view>
    <app-footer v-if="firebaseState.user"></app-footer>
  </div>
</template>

<script setup>
import AppHeader from './components/organisms/AppHeader.vue'
import AppFooter from './components/organisms/AppFooter.vue'
import { ref } from 'vue'
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