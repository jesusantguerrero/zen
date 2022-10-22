<template>
  <div class="text-center">
    <slot 
      :createTrack="createTrack" 
      :updateTrack="updateData" 
      :canStartTimer="canStartTimer" 
      :updateTitle="updateTitle"
      :config="config"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { ElNotification } from "element-plus";
import { useTrackFirestore } from "../../_features/tracks";
import { SESSION_MODES } from "../../utils";
import { usePromodoro } from "../../composables/usePromodoro";
import { firebaseState } from "../../_features/app";

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
  delete trackFormData.currentTime;
  
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
  if (Object.keys(trackFormData).length) {
    trackFormData.task_uid = trackFormData.task_uid || props.task.uid;
    trackFormData.subtype = trackFormData.subType || props.subType
    delete trackFormData.currentTime;
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
  }
};

const updateTitle = (track) => {
  emit("update:currentTimer", track)
}

// Settings
const { promodoroState, setSettings } = usePromodoro()
setSettings(firebaseState.settings);

const config = ref({});

watch(() => promodoroState, (localState) => {
  config.template = localState.template;
  config.modes = localState.modes;
  config.volume = localState.volume
}, { immediate: true })
</script>