<template>
<div class="text-center">
  <app-header />
  <zen-board class="pt-24" />
</div>
</template>

<script setup>
import ZenBoard from './views/ZenBoard.vue'
import AppHeader from './components/organisms/AppHeader.vue'
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