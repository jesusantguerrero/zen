<template>
  <div
    class="text-center"
    title="click here to start"
  >
    <div class="flex items-center justify-between font-bold text-2xl">
      <div class="text-sm mr-2"   :class="`${trackerMode.color} ${trackerMode.colorBorder}`" >
            {{ trackerMode.text }}
      </div>
      <div 
        :class="`${trackerMode.color} ${trackerMode.colorBorder}`" 
        class="border-2 mr-2 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
        @click="toggleTracker"
        >
        <i class="fa fa-play text-sm" :class="trackerIcon"></i>
      </div>
      <div
        class="select-none cursor-pointer"
        :class="trackerMode.color"
        @click="toggleTracker"
      >
        {{ currentTime }}
        <div class="flex w-full h-1">
          <div
            class="bg-red h-1 w-full mr-1"
            v-for="stage in promodoroTotal"
            :class="[state.currentStep >= stage.originalIndex ? currentStateColor : '']"
            :key="stage"
          ></div>
        </div>
      </div>

       <el-dropdown trigger="click" @command="handleCommand">
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
      
    </div>

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
import { computed, onBeforeUnmount, reactive, watch, defineProps, defineEmit, ref} from "vue";
import { Duration, Interval, DateTime } from "luxon";
import { useTrackFirestore } from "./../../utils/useTrackFirestore";
import { usePromodoro } from "./../../utils/usePromodoro";
import { useSlack } from "./../../utils/useSlack";
import { firebaseState } from "./../../utils/useFirebase";
import { ElMessageBox, ElNotification } from "element-plus";
import TimeTrackerModal from "./TimeTrackerModal.vue";
import { useTitle } from "@vueuse/core";

const { saveTrack, updateTrack } = useTrackFirestore();
const props = defineProps({
  task: {
    type: Object
  },
  currentTimer: {
    type: Object
  }
})
const emit = defineEmit({
  "update:currentTimer": (timer) =>  timer
})

// state
const track = reactive({
  uid: null,
  task_uid: null,
  started_at: null,
  ended_at: null,
  type: "promodoro",
  duration: null,
  target_time: null,
  completed: false
});

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
  now: null,
  mode: "promodoro",
  timer: null,
  pushSubscription: null,
  durationTarget: null,
});

const setDurationTarget = () => {
  const { min, sec } = state.modes[state.mode];
  state.durationTarget = Duration.fromISO(`PT${min}M${sec}S`);
};

setDurationTarget();

const trackerIcon = computed(() => state.now ? 'fa fa-stop': 'fa fa-play' );
const trackerMode = computed(() => state.modes[state.mode]);
const promodoroTotal = computed(() => {
  return state.template
    .map((mode, index) => {
      return {
        name: mode,
        originalIndex: index,
      };
    })
    .filter((mode) => mode.name.includes("promodoro"));
});
const currentStateColor = computed(() => {
  return state.modes[state.template[state.currentStep]].colorBg;
});

// Time manipulation
const targetTime = computed(() => {
  if (track.started_at && state.now) {
    const targetTime = DateTime.fromJSDate(track.started_at).plus(state.durationTarget);
    return targetTime;
  }
  return null;
});

const currentTime = computed(() => {
  if (track.started_at && state.now && state.durationTarget) {
    let duration = Interval.fromDateTimes(track.started_at, state.now).toDuration()
    track.currentTime = duration;
    if (duration) {
      duration = state.durationTarget.minus(duration).plus({ seconds: 0.9 });
      return duration.as("seconds") < 0 ? "00:00" : duration.toFormat("mm:ss");
    }
    return "00:00";
  } else {
    return state.durationTarget.toFormat("mm:ss");
  }
});


watch(() => currentTime.value, () => {
  if (state.now) {
    useTitle(`Zen.  ${currentTime.value}`)
  } else {
    useTitle('Zen.')
  }
});

watch(() => state.now, (now) => {
  if (targetTime.value && now && targetTime.value.diffNow() < 0) {
    track.completed = true;
    stop();
  }
});

// Settings
const { playSound, stopSound, promodoroState, setSettings, showNotification } = usePromodoro()
const isModalOpen = ref(false)

setSettings(firebaseState.settings);

watch(() => promodoroState, (localState) => {
  state.template = localState.template;
  state.modes = localState.modes;
  state.pushSubscription = localState.pushSubscription;
  setDurationTarget()
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

// Controls
const toggleTracker = () => {
  track.started_at ? stop(null, true) : play();
};

const createTrack = () => {
  track.task_uid = props.task.uid;
  track.description = props.task.title;
  track.target_time = state.durationTarget.toISO();
  const formData = { ...track }
  delete formData.currentTime
  saveTrack(formData)
    .then(uid => {
      track.uid = uid;
      emit("update:currentTimer", track)
    })
}

const isPromodoro = () => {
  return state.mode == 'promodoro';
}

const validatePlay = () => {
  return isPromodoro() && props.task.title;
}

const { setStatus } = useSlack();
const play = () => {
  if (isPromodoro() && !validatePlay()) {
    ElNotification({
      title: "Select a task",
        message: "Must select a task to start promodoro",
        type: "info"
      })
    return  
  }
  
  stopSound()
  track.started_at = new Date();
  state.now = track.started_at;
  
  if (validatePlay()) {
    setStatus('Zen mode.', ':slack:')
    createTrack(track)
  }

  state.timer = setInterval(() => {
    state.now = new Date();
  }, 100);
};

const stop = (shouldCallNextMode = true, silent) => {
  track.ended_at = new Date();
  if (validatePlay() && state.now) {
    updateTrackFromLocal({...track});
  }

  const wasRunning = Boolean(state.now);
  const previousMode = state.mode;
  const message = track.completed ? "finished" : "stopped";
  
  clearTrack()
  clearInterval(state.timer);
  state.now = null;
  
  nextMode();
  if (!silent) {
    playSound()
    if (wasRunning && previousMode == "promodoro") {
      showNotification("Promodoro session finished")
      ElMessageBox.confirm(`Promodoro session ${message}`)
    }
  }
  
};

const nextMode = () => {
  if (state.now) {
    stop(false);
  }

  const canIncrement = state.currentStep < state.template.length - 1;
  const nextMode = canIncrement ? state.currentStep + 1 : 0;
  state.mode = state.template[nextMode];
  state.currentStep = nextMode;
  setDurationTarget();
};

const clearTrack = () => {
  clearInterval(state.timer);
  track.started_at = null;
  track.ended_at = null;
  track.duration = null;
  track.target_time = null;
  track.completed = false
};

const handleCommand = (command) => {
  switch (command) {
    case 'configuration':
      isModalOpen.value = true;
      break;
    case 'nextmode':
      nextMode()
      break;
    default:
      break;
  }
} 

// checks to stop
onBeforeUnmount(() => {
    useTitle('Zen.')
    stop(false, true) 
})

watch(() => props.task.title, (newValue, oldValue) => {
  if (oldValue && state.now && state.mode == 'promodoro') {
    stop(false, true)
  }
})

// Persistence
const updateTrackFromLocal = (track) => {
  const formData = { ...track }
  const duration = Interval.fromDateTimes(formData.started_at, formData.ended_at).toDuration();
  formData.duration_ms = duration.as('milliseconds'),
  formData.duration_iso = duration.toISO(),
  delete formData.currentTime;
  updateTrack(formData).then(() => {
    emit("update:currentTimer", {})
    props.task.tracks.push(formData);
    ElNotification({
      title: "Pomodoro Saved",
      message: "Pomodoro saved",
      type: "success"
    })
  })
};
</script>