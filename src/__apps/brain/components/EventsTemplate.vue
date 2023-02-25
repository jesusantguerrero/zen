<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
// @ts-expect-error: undefined types
import { AtWeek } from 'atmosphere-ui'
import EventForm from './EventForm.vue'
import type { IScheduleEvent } from '~/utils/useApi'
import { usePlanApi } from '~/utils/useApi'
import { useResourceApi } from '~/utils/useResourceApi'
import { exposeState } from '~/utils/exposeState'

const state = reactive({
  week: [],
  selectedDay: new Date(),
  cycle: null,
  items: [],
  cycles: [],
  isAddingCycle: false,
})

// events setup
const { add, getAll, update, remove } = usePlanApi()
const { getAll: getLabels } = useResourceApi('labels')

const fetchItems = async() => {
  getAll().then((data) => {
    state.items = data
  })
}

const itemEvents = computed(() => {
  return state.items.map((eventItem: IScheduleEvent) => ({
    ...eventItem,
    class: eventItem.labels && eventItem.labels.length > 0 ? eventItem.labels[0].colors : '',
  }))
})

const isModalOpen = ref(false)
const taskToCreate = reactive({})
const onSaved = async(item) => {
  if (item.id)
    await update(item.id, item)

  else
    await add(item)

  fetchItems()
  isModalOpen.value = false
}

const onUpdate = async(item) => {
  await update(item.id, item)
  state.items.splice(state.items.map(item => item.id).indexOf(item.id), 1, item)
  isModalOpen.value = false
}

const onDelete = async(item) => {
  await remove(item.id)
  state.items = state.items.filter(storedItem => storedItem.id !== item.id)
  isModalOpen.value = false
}

onMounted(() => {
  getAll().then((data) => {
    state.items = data
  })
})

exposeState(state)
</script>

<template>
  <div>
    <AtWeek
      :week="state.week"
      :items="itemEvents"
      class="overflow-auto ic-scroller scheduler"
      @update="onUpdate"
    />
    <EventForm
      :event-data="taskToCreate"
      @delete="onDelete"
      @saved="onSaved"
    />
  </div>
</template>

<style lang="scss" scoped>
.scheduler {
  height: calc(100vh - 200px);
}

</style>
