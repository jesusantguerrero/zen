<template>
    <slot />
</template>

<script setup>
import { provide, ref, watch } from 'vue';
import { useTrackFirestore } from '../utils/useTrackFirestore';

const props = defineProps({
  user: {
    type: [Object, null]
  }
})
const { getRunningTrack } = useTrackFirestore()
// Todo use pinia for this
const currentTimer = ref({})
const currentTask = ref({});

const setCurrentTask = (task) => {
  currentTask.value = task;
};

watch(() => props.user, async (user) => {
  if (user) {
    try {
      currentTimer.value = await getRunningTrack() || {}
    } catch(err) {
      console.log(err)
    }
  }
}, { immediate: true, deep: true })

provide('currentTimer', currentTimer)
provide('currentTask', currentTask)
provide('setCurrentTask', setCurrentTask)
</script>