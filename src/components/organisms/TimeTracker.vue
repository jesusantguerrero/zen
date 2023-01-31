<template>
  <div class="text-center">
    
    <slot 
      :createTrack="createTrack" 
      :updateTrack="updateData" 
      :canStartTimer="canStartTimer" 
      :updateTitle="updateTitle"
      :config="config"
    >
      <AtTimer 
        size="mini" 
        ref="timerRef"
        v-model:pomodoro-mode="timerSubtype"
        v-model:timer="currentTimer" 
        :disabled="!currentTask.title"
        :show-label="false" 
        :task="currentTask" 
        :template="config.template"
        :volume="config.volume"
        :modes="config.modes"
        :move-on-stop="true"
        @stopped="updateData" 
        @started="createTrack"
        @tick="updateTitle" 
      />
    </slot>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, nextTick } from "vue";
import { ElNotification } from "element-plus";
import { useTrackFirestore } from "../../_features/tracks";
import { SESSION_MODES } from "../../utils";
import { usePromodoro } from "../../composables/usePromodoro";
import { firebaseState } from "../../_features/app";
import { useTitle } from "@vueuse/core";
import { cloneDeep } from "lodash";
import { useGlobalTracker } from "../../composables/useGlobalTracker";
import  AtTimer from "vue-temporal-components/src/components/Timer/index.vue"
import { GLOBAL_EVENTS } from "../../utils/constants";

const { saveTrack, updateTrack } = useTrackFirestore();
const props = defineProps({
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

// Tracker
const { currentTimer, currentTask, timerSubtype, setCurrentTask, setCurrentTimer } = useGlobalTracker()
const timerRef = ref(null);
onMounted(() => {
  EventBus.on(GLOBAL_EVENTS.track.play, (task) => {
    if (!currentTask.value || currentTask.value?.uid !== task.uid) {
        timerRef.value.reset();
        setCurrentTask(task)
    }
    nextTick(() => {
      timerRef.value.toggleTracker();
    })
  })
  EventBus.on(GLOBAL_EVENTS.track.resume, (task) => {
    nextTick(() => {
      timerRef.value.resume(currentTimer.value);
    })
  })
})

const canStartTimer = computed(() => {
  return props.task?.title
})

const createTrack = (trackFormData) => {
  if (trackFormData) {
    trackFormData.subtype = props.subType
    trackFormData.task_uid = trackFormData.task_uid || currentTask.value?.uid;
    trackFormData.description = trackFormData.title || currentTask.value?.title
    
    const data = cloneDeep(trackFormData)
    delete data.currentTime;
    
    saveTrack(data)
      .then(uid => {
        trackFormData.uid = uid;
        currentTrackId.value = uid;
        nextTick(() => {
          setCurrentTimer(trackFormData);
        })
      })
      .catch((e) => {
        ElNotification({
          title: "Track could not be started",
          message: "Error",
          type: "error"
        })
      })
  }
}

const updateData = (trackFormData) => {
  if (trackFormData && (currentTrackId.value || trackFormData.uid)) {
    trackFormData.task_uid = trackFormData.task_uid || currentTask.value.uid;
    trackFormData.subtype = trackFormData.subType || props.subType;
    trackFormData.uid = trackFormData.uid ?? currentTrackId.value;
    delete trackFormData.currentTime;
    updateTrack(trackFormData).then(() => {
      currentTrackId.value = null;
      setCurrentTimer({});
      currentTask.value.tracks?.push(trackFormData);
      ElNotification.success({
        title: "Pomodoro time successfully saved",
        message: "Pomodoro saved"
      })
    }).catch((err) => {
      console.log(err)
      ElNotification.error({
        title: "Track could not be saved",
        message: "Error",
      })
    })
  }
};

const updateTitle = (trackFormData) => {
  trackFormData.task_uid = trackFormData.task_uid || currentTask.value.uid;
  trackFormData.subtype = trackFormData.subType || props.subType;
  trackFormData.uid = trackFormData.uid ?? currentTrackId.value;
  currentTrackId.value && setCurrentTimer(trackFormData);
  useTitle('Zen')
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