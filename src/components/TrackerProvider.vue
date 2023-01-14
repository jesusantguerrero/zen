<template>
    <slot />
</template>

<script setup>
import { provide, ref, watch, nextTick } from 'vue';
import { useTaskFirestore } from '../_features/tasks';
import { useTrackFirestore } from '../_features/tracks';
import { GlobalEmitter } from "@/utils/emitter";

const props = defineProps({
  user: {
    type: [Object, null]
  }
})
const { getRunningTrack } = useTrackFirestore()
const { getById: getTaskById } = useTaskFirestore()
// Todo use pinia for this
const currentTimer = ref(null)
const timerSubtype = ref(null)
const currentTask = ref({});
const setCurrentTask = (task, shouldAutoPlay) => {
  currentTask.value = task;
  if (shouldAutoPlay) {
    nextTick(() => {
      EventBus.emit('track::play')
    })
  }
};
watch(() => props.user, async (user) => {
  if (user) {
    try {
      currentTimer.value = await getRunningTrack() || {}
      if (currentTimer.value.task_uid) {
        const task = await getTaskById(currentTimer.value.task_uid)
        setCurrentTask(task)
      }
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