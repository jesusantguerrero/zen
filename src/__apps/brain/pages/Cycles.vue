<script lang="ts" setup>
import { reactive } from 'vue'
import DashboardTemplate from '../components/DashboardTemplate.vue';

const state = reactive({
  scheduledEvents: [],
  labels: [],
})
</script>

<template>
  <DashboardTemplate
    :scheduled-events="state.scheduledEvents"
    :labels="state.labels"
  />
</template>
