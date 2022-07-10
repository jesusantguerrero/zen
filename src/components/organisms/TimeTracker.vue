<template>
  <div
    class="text-center"
  >
    <div class="flex items-center justify-between text-2xl font-bold">
      <div class="mr-2 text-sm"  v-if="showLabel" :class="`${trackerMode.color} ${trackerMode.colorBorder}`" >
            {{ trackerMode.text }}
      </div>
      <div 
        class="flex items-center justify-center w-8 h-8 mr-2 rounded-full cursor-pointer"
        title="click here to start"
        :class="`${trackerMode.color} ${trackerMode.colorBorder}`" 
        @click="toggleTracker"
        >
        <i class="text-3xl far fa-play" :class="trackerIcon"></i>
      </div>
      <div
        class="select-none"
        :class="trackerMode.color"
      >
        {{ currentTime }}
        <div class="flex w-full h-1">
          <div
            v-for="(stage, index) in promodoroTotal"
            :title="`Round ${index+1}: ${stage.name}`"
            class="w-full h-1 mr-1 cursor-pointer bg-red hover:ring hover:ring-offset-1"
            :class="[state.currentStep >= stage.originalIndex ? currentStateColor : '']"
            :key="stage.name"
          ></div>
        </div>
      </div>     
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, watch, ref, onUnmounted} from "vue";
import { Duration, Interval, DateTime } from "luxon";
import { useTrackFirestore } from "./../../utils/useTrackFirestore";
import { SESSION_MODES } from "./../../utils";
import { usePromodoro } from "./../../utils/usePromodoro";
import { useSlack } from "./../../utils/useSlack";
import { firebaseState } from "./../../utils/useFirebase";
import { ElMessageBox, ElNotification } from "element-plus";
import { useTitle } from "@vueuse/core";

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
  showLabel: {
    type: Boolean,
    default: true
  }
})
const emit = defineEmits({
  "update:currentTimer": (timer) =>  timer
})

// state
const track = reactive({
  uid: null,
  task_uid: null,
  started_at: null,
  ended_at: null,
  type: "promodoro",
  subtype: null,
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
  volume: 100,
  timer: null,
  pushSubscription: null,
  durationTarget: null,
});

// UI
const trackerIcon = computed(() => state.now ? 'far fa-stop-circle': 'far fa-play-circle' );
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
const isTrackableMode = () => {
  return props.trackableModes.includes(state.mode);
}

// Time manipulation
const setDurationTarget = () => {
  const { min, sec } = state.modes[state.mode];
  state.durationTarget = Duration.fromISO(`PT${min}M${sec}S`);
};

setDurationTarget();

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
  state.volume = localState.volume
  setDurationTarget()
}, { immediate: true })


const createTrack = () => {
  track.task_uid = props.task.uid;
  track.description = props.task.title;
  track.target_time = state.durationTarget.toISO();
  track.subtype = state.mode;
  const formData = { ...track }
  delete formData.currentTime
  saveTrack(formData)
    .then(uid => {
      track.uid = uid;
      emit("update:currentTimer", track)
    })
}

const validatePlay = () => {
  return isTrackableMode() && (props.task.title || track.description);
}

const { setStatus } = useSlack();

// Controls
const toggleTracker = () => {
  track.started_at ? stop(null, true) : play();
};

const play = () => {
  if (isTrackableMode() && !validatePlay()) {
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

const resume = () => {
    track.uid = props.currentTimer.uid;
    track.started_at = props.currentTimer.started_at;
    track.task_uid = props.currentTimer.task_uid;
    track.description = props.currentTimer.description;
    track.target_time = props.currentTimer.target_time;
    track.subtype = props.currentTimer.subtype;
    track.completed = false
    state.durationTarget = Duration.fromISO(props.currentTimer.target_time)
    state.timer = setInterval(() => {
      state.now = new Date();
    }, 100);
}

watch(() => props.currentTimer, (timer) => {
  timer.started_at && resume()
}, { immediate : true })

onUnmounted(() => {
  clearInterval(state.timer)
})

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