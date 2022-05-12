<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-28">
  <div class="items-center justify-between mb-10 section-header md:flex">
      <h2 class="text-2xl font-bold text-left text-gray-400">
         Metrics
      </h2>
  </div> 

  <MetricsTemplate class="w-full" />
  
</div>
</template>

<script setup>
import MetricsTemplate from "../components/templates/MetricsTemplate.vue";
</script>