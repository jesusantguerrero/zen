<script lang="ts" setup>
import CycleTemplate from './CycleTemplate.vue';

defineProps<{
  labels: []
}>()

</script>

<template>
  <div class="mx-auto max-w-7xl">
    <CycleTemplate />
    <div class="flex mt-8">
      <EventsTemplate class="w-8/12" />
      <div class="w-4/12">
        <h4 class="pb-4 font-bold text-center">
          Sections
        </h4>
        <div class="px-5 space-y-2">
          <div v-for="label in labels" :key="label.id" :class="label.colors" class="px-5 py-2 rounded-md">
            {{ label.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scheduler {
  height: calc(100vh - 200px);
}

</style>
