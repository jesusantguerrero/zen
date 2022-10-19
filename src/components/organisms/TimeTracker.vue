<template>
  <div class="text-center">
    <slot 
      :createTrack="createTrack" 
      :updateTrack="updateData" 
      :canStartTimer="canStartTimer" 
      :updateTitle="updateTitle"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ElNotification } from "element-plus";
import { useTrackFirestore } from "../../_features/tracks";
import { SESSION_MODES } from "../../utils";

const { saveTrack, updateTrack } = useTrackFirestore();
const props = defineProps({
  task: {
    type: Object
  },
  currentTimer: {
    type: Object
  },
  trackableModes: {
    type: Array,
    default() {
      return [
        SESSION_MODES.WORK,
        SESSION_MODES.REST,
        SESSION_MODES.LONG_REST
      ]
    }
  },
  subType: {
    type: String,
    default: 'pomodoro'
  }
})

const emit = defineEmits({
  "update:currentTimer": (timer) =>  timer
})

const isTrackableMode = computed(() => {
  return props.trackableModes.includes(props.subType);
})

const canStartTimer = computed(() => {
  return props.task.title
})

const createTrack = (trackFormData) => {
  trackFormData.subtype = props.subType
  trackFormData.task_uid = trackFormData.task_uid || props.task.uid;
  trackFormData.description = props.task.title

  saveTrack(trackFormData)
    .then(uid => {
      trackFormData.uid = uid;
      // emit("update:currentTimer", trackFormData)
    })
    .catch(() => {
      ElNotification({
        title: "Track could not be started",
        message: "Error",
        type: "error"
      })
    })
}

const updateData = (trackFormData) => {
  trackFormData.task_uid = trackFormData.task_uid || props.task.uid;
  trackFormData.subtype = trackFormData.subType || props.subType

  updateTrack(trackFormData).then(() => {
    props.task.tracks.push(trackFormData);
    ElNotification({
      title: "Pomodoro time successfully saved",
      message: "Pomodoro saved",
      type: "success"
    })
  }).catch(() => {
    ElNotification({
      title: "Track could not be saved",
      message: "Error",
      type: "error"
    })
  })
};

const updateTitle = (track) => {
  // emit("update:currentTimer", track)
}
</script>