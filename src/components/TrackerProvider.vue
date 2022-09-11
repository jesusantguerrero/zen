<template>
    <slot />
</template>

<script setup>
import { provide, ref, watch } from 'vue';
import { useTrackFirestore } from '../_features/tracks';
const props = defineProps({
  user: {
    type: [Object, null]
  }
})
const { getRunningTrack } = useTrackFirestore()
// Todo use pinia for this
const currentTimer = ref(null)
const timerSubtype = ref(null)
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
provide('timerSubtype', timerSubtype)
provide('setCurrentTask', setCurrentTask)
</script>