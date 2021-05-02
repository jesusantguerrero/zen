<template>
  <div
    class="flex items-center px-5"
  >
    <time-tracker-clock
      ref="TimeTracker"
      :task="task"
      :current-timer="currentTimer"
      :template="state.template"
      :size="size"    
      :disabled="!task || !task.title"
      @pomodoroStarted="createTrack"
      @pomodoroStopped="updateTrackFromLocal"
      @update:currentTimer="$emit('update:currentTimer', $event)"
    />

    <el-dropdown trigger="click" @command="handleCommand" v-if="size == 'mini'">
        <button
          class="text-sm px-2 rounded-md ml-4 text-gray-400 border-transparent cursor-pointer border-2 hover:border-gray-200 transition-colors hover:text-md hover:bg-gray-200 py-2  focus:outline-none"
        >
          <i class="fa fa-ellipsis-v"></i>
        </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="configuration" icon="el-icon-s-tools">Configuration</el-dropdown-item>
          <el-dropdown-item command="nextmode" icon="el-icon-arrow-right">Next mode</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <time-tracker-modal
      v-model:is-open="isModalOpen"
      :settings="state"
      @cancel="isModalOpen=false"
      @saved="onSettingsSaved"
    >
    </time-tracker-modal>
  </div>
</template>

<script setup>
import {  reactive, watch, defineProps, ref} from "vue";
import { useTrackFirestore } from "./../../utils/useTrackFirestore";
import { usePromodoro } from "./../../utils/usePromodoro";
import { firebaseState } from "./../../utils/useFirebase";
import { ElNotification } from "element-plus";
import TimeTrackerClock from "../molecules/TimeTrackerClock.vue";
import TimeTrackerModal from "./TimeTrackerModal.vue";

const { saveTrack, updateTrack } = useTrackFirestore();
const props = defineProps({
  size: {
    type: String
  },
  task: {
    type: Object
  },
  currentTimer: {
    type: Object
  }
})

// state
const state = reactive({
  template: [
    "promodoro",
    "rest",
    "promodoro",
    "rest",
    "promodoro",
    "rest",
    "promodoro",
    "long",
  ],
  currentStep: 0,
  modes: {
    long: {
      label: "Long Rest",
      min: 15,
      sec: 0,
      color: "text-green-400",
      colorBg: "bg-green-400",
      colorBorder: "border-green-400",
    },
    promodoro: {
      min: 25,
      sec: 0,
      color: "text-red-400",
      colorBg: "bg-red-400",
      colorBorder: "border-red-400",
      text: "Pomodoro session",
    },
    rest: {
      min: 5,
      sec: 0,
      color: "text-blue-400",
      colorBg: "bg-blue-400",
      colorBorder: "border-blue-400",
      text: "Take a short break",
    },
  },
  volume: 100,
  pushSubscription: null,
  lastTrackId: null
});
const TimeTracker = ref(null)

// Settings
const { promodoroState, setSettings } = usePromodoro()
const isModalOpen = ref(false)

setSettings(firebaseState.settings);

watch(() => promodoroState, (localState) => {
  state.template = localState.template;
  state.modes = localState.modes;
  state.pushSubscription = localState.pushSubscription;
  state.volume = localState.volume
}, { immediate: true })

const onSettingsSaved = (settings) => {  
  isModalOpen.value = false;
  
  if (state.now) {
    ElNotification({
      title: "Stop the timer",
      message: "You must stop the timer before update configuration",
      type: "info"
    })
    return
  } 
  
  setSettings(settings)
  ElNotification({
    title: "Updated",
    message: "Configuration Updated"
  })
  setDurationTarget()
}

const handleCommand = (command) => {
  switch (command) {
    case 'configuration':
      isModalOpen.value = true;
      break;
    case 'nextmode':
      console.log(TimeTracker.value);
      TimeTracker.value.nextMode()
      break;
    default:
      break;
  }
} 

const createTrack = (formData) => {
  saveTrack(formData)
    .then(uid => {
      state.lastTrackId = uid
    })
}


const updateTrackFromLocal = (trackData) => {
  const formData = { trackData, uid: state.lastTrackId }
  updateTrack(formData).then(() => {
    props.task.tracks.push(formData);
    ElNotification({
      title: "Pomodoro Saved",
      message: "Pomodoro saved",
      type: "success"
    })
  })
};
</script>