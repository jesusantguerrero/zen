<script lang="ts" setup>
import HabitItem from '../../components/organisms/HabitItem.vue'
import IconNoData from '~icons/carbon/non-certified'

defineProps<{
  habits: any[]
  labels: any[]
}>()
</script>

<template>
  <div class="mx-auto max-w-7xl">
    <h4 class="font-bold text-gray-400 text-xl">
      Habits
    </h4>
    <div v-if="habits.length" class="space-y-2 mt-5">
      <HabitItem v-for="habit in habits" :key="habit.id" :habit="habit" />
    </div>
    <div v-else class="space-y-2 flex flex-col items-center justify-center mt-5 text-center w-full text-gray-300">
      <div class="text-5xl">
        <icon-no-data />
      </div>
      You have not habits yet
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scheduler {
  height: calc(100vh - 200px);
}

</style>
