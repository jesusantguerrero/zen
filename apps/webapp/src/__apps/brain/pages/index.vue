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
    class="pt-24 pb-20 mx-5 md:pt-28 md:mx-28"
    :scheduled-events="state.scheduledEvents"
    :labels="state.labels"
  />
</template>
