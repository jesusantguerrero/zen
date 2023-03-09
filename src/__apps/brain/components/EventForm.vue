<script lang="ts" setup>

import { useForm } from 'atmosphere-ui'

const props = defineProps<{
  day: Date
}>()

const event = useForm({
  id: 'new',
  title: '(no title)',
  description: '(no description)',
  startTime: new Date(),
  endTime: new Date(),
  startDate: props.day,
  endDate: props.day,
  recurrence: '',
  labels: [],
})
</script>

<template>
  <div>
    <FormField
      v-model="event.name"
      label="Event Name"
      field="name"
      :errors="event.errors"
      :tag="'input'"
    />
  </div>
</template>
