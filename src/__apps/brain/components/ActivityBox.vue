<script lang="ts" setup>
import { reactive } from 'vue'
import ActivityType from '../molecules/ActivityType.vue'

const state = reactive({
  types: [{
    name: 'habit',
    icon: 'fas fa-check-circle',
  }, {
    name: 'prompt',
    icon: 'fas fa-question-circle',
  }, {
    name: 'cycle',
    icon: 'fas fa-list-ul',
  }, {
    name: 'reward',
    icon: 'fas fa-gift',
  }],
})

</script>

<template>
  <div class="flex space-x-2">
    <ActivityType v-for="type in state.types" :key="type.name" :activity-type="type" />
  </div>
</template>
