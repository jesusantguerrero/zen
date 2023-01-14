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
import { useTitle } from "@vueuse/core";
import { cloneDeep } from "lodash";

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

const currentTrackId = ref(null);

const emit = defineEmits({
  "update:currentTimer": (timer) =>  timer
})

const canStartTimer = computed(() => {
  return props.task.title
})

const createTrack = (trackFormData) => {
  if (trackFormData) {
    trackFormData.subtype = props.subType
    trackFormData.task_uid = trackFormData.task_uid || props.task.uid;
    trackFormData.description = props.task.title
    const data = cloneDeep(trackFormData)
    delete data.currentTime;
    
    saveTrack(data)
      .then(uid => {
        trackFormData.uid = uid;
        currentTrackId.value = uid;
        emit("update:currentTimer", trackFormData)
      })
      .catch(() => {
        ElNotification({
          title: "Track could not be started",
          message: "Error",
          type: "error"
        })
      })
  }
}

const updateData = (trackFormData) => {
  if (trackFormData && Object.keys(trackFormData).length) {
    trackFormData.task_uid = trackFormData.task_uid || props.task.uid;
    trackFormData.subtype = trackFormData.subType || props.subType
    delete trackFormData.currentTime;
    updateTrack(trackFormData).then(() => {
      emit("update:currentTimer", {})
      props.task.tracks.push(trackFormData);
      ElNotification.success({
        title: "Pomodoro time successfully saved",
        message: "Pomodoro saved"
      })
    }).catch((err) => {
      ElNotification.error({
        title: "Track could not be saved",
        message: "Error",
      })
    })
  }
};

const updateTitle = (track) => {
  useTitle('Zen', track.currentTime)
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