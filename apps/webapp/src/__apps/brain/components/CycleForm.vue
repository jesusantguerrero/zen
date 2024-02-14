<script lang="ts" setup>
import FormField from '@/components/molecules/FormField.vue';
import DateSelect from '@/components/atoms/DateSelect.vue';
import { AtButton, AtInput, useForm } from 'atmosphere-ui'
import { nextTick, onMounted, ref, watch } from 'vue'

const emit = defineEmits(['submit', 'cancel'])
const props = defineProps({
  formData: {
    type: Object,
    default: () => ({}),
  },
})

const cycle = useForm({
  id: 'new',
  name: '(no title)',
  description: '(no description)',
  startDate: new Date(),
  endDate: new Date(),
  objectives: [],
}, {
  emit,
})

const addObjective = () => {
  cycle.objectives.push({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
  })

  const len = cycle.objectives.length

  nextTick(() => {
    const objective = document.querySelector(`.objectives:nth-child(${len})`)
    objective?.querySelector('input')?.focus()
  })
}

const removeObjective = (index: number) => {
  cycle.objectives = cycle.objectives.filter((_item: any, i: number) => i !== index)
}

const onKeyModifier = (e: KeyboardEvent) => {
  const { index } = e.target?.dataset
  const modifiers = {
    r: removeObjective.bind(null, index),
  }

  const method = modifiers[e.key]
  if (method)
    method()
}

const onCancel = () => {
  cycle.reset()
  emit('cancel')
}
const submit = async() => {
  cycle.transform(data => ({
    ...data,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    id: data.id !== 'new' ? data.id : null,
  })).submit('submit')
  await cycle.reset()
}

watch(() => props.formData, (data) => {
  if (data) {
    Object.keys(data).forEach((key) => {
      cycle[key] = data[key]
    })
  }
  else {
    cycle.reset()
  }
}, { deep: true, immediate: true })

const fieldName = ref()
onMounted(() => {
  nextTick(() => {
    fieldName.value.focus()
  })
})
</script>

<template>
  <div class="mb-5 space-y-2">
    <FormField
      ref="fieldName"
      v-model="cycle.name"
      label="Cycle Name"
      field="name"
      :errors="cycle.errors"
      :tag="'input'"
    />
    <FormField
      v-model="cycle.description"
      label="Description"
      field="textarea"
      :errors="cycle.errors"
      :tag="'input'"
    />
    <div class="flex my-2 space-x-5">
      <FormField
        label="Start Date"
        field="date"
        :errors="cycle.errors"
        :tag="'input'"
      >
        <DateSelect
          v-model="cycle.startDate"
          label="Start Time"
          :errors="cycle.errors"
        />
      </FormField>
      <FormField
        label="End Date"
        field="date"
        :errors="cycle.errors"
        :tag="'input'"
      >
        <DateSelect
          v-model="cycle.endDate"
          label="End Date"
          :errors="cycle.errors"
        />
      </FormField>
    </div>
    <div class="space-y-2">
      <AtInput
        v-for="(_objective, index) in cycle.objectives"
        :key="index"
        v-model="cycle.objectives[index].title"
        label="Objectives"
        :errors="cycle.errors"
        :tag="'input'"
        class="objectives"
        is-borderless
        :data-index="index"
        @keydown.self.ctrl.prevent="onKeyModifier"
        @keydown.self.ctrl.enter="addObjective"
      >
        <template #suffix>
          <button @click="removeObjective(index)">
            Remove
          </button>
        </template>
      </AtInput>
      <button class="font-bold text-gray-400" @click="addObjective">
        Add Objective
      </button>
    </div>
    <div class="flex items-center justify-end space-x-2">
      <AtButton class="text-white bg-slate-400" @click="onCancel">
        Cancel
      </AtButton>
      <AtButton class="text-white bg-primary" @click="submit">
        Save
      </AtButton>
    </div>
  </div>
</template>
