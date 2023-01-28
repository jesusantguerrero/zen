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
const { getRunningTrack, getAllTracksOfTask } = useTrackFirestore()
const { getById: getTaskById } = useTaskFirestore()
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
      if (currentTimer.value.task_uid) {
        const task = await getTaskById(currentTimer.value.task_uid)
        setCurrentTask(task)
      }
    } catch(err) {
      console.log(err)
    }
  }
}, { immediate: true, deep: true })

watch(() => currentTask.value, (task) => {
  if (task.uid) {
    getAllTracksOfTask(task.uid).then((tracks) => {
      currentTask.value.tracks = tracks.map(track => {
        track.date_f = track.created_at.toDate()
        return track;
      }) || [];
    });
  }
}, { immediate: true });

provide('currentTimer', currentTimer)
provide('currentTask', currentTask)
provide('timerSubtype', timerSubtype)
provide('setCurrentTask', setCurrentTask)
</script>