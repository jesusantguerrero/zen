<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
// @ts-expect-error: undefined types
// import { AtWeek} from 'vue-temporal-components'
import EventForm from './EventForm.vue'
import type { IScheduleEvent } from '~/utils/useApi'
import { useEventStore } from '../stores/events'

const state = reactive({
  week: [],
  selectedDay: new Date(),
  cycle: null,
  items: [],
  cycles: [],
  isAddingCycle: false,
})

// events setup
const events = useEventStore()
onMounted(async() => {
  await events.fetch()
})


const itemEvents = computed(() => {
  return events.data.map((eventItem: IScheduleEvent) => ({
    ...eventItem,
    class: eventItem.labels && eventItem.labels.length > 0 ? eventItem.labels[0].colors : '',
  }))
})

const isModalOpen = ref(false)
const taskToCreate = reactive({})
const onSaved = async(item) => {
  if (item.id)
    await events.update(item)

  else
    await events.add(item)

  events.fetch()
  isModalOpen.value = false
}

const onUpdate = async(item) => {
  await events.update(item)
  state.items.splice(state.items.map(item => item.id).indexOf(item.id), 1, item)
  isModalOpen.value = false
}

const onDelete = async(item) => {
  await events.remove(item.id)
  state.items = state.items.filter(storedItem => storedItem.id !== item.id)
  isModalOpen.value = false
}
</script>

<template>
  <div>
    <!-- <AtWeek
      :week="state.week"
      :items="itemEvents"
      class="overflow-auto ic-scroller scheduler"
      @update="onUpdate"
    /> -->
    <EventForm
      :day="state.selectedDay"
      :event-data="taskToCreate"
      @delete="onDelete"
      @saved="onSaved"
    />
  </div>
</template>

<style lang="scss" scoped>
.scheduler {
  height: calc(100svh - 200px);
  height: calc(100vh - 200px);
}

</style>
