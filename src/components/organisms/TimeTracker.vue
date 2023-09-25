<template>
  <div class="text-center">
    <div class="flex items-center justify-between text-2xl font-bold">
      <div
        class="mr-2 text-sm"
        :class="`${trackerMode.color} ${trackerMode.colorBorder}`"
      >
        {{ trackerMode.text }}
      </div>
      <div
        class="flex items-center justify-center w-8 h-8 mr-2 rounded-full cursor-pointer"
        title="click here to start"
        :class="`${trackerMode.color} ${trackerMode.colorBorder}`"
        @click="toggleTracker"
      >
        <i class="text-3xl" :class="trackerIcon" />
      </div>
      <div class="select-none" :class="trackerMode.color">
        {{ currentTime }}
        <div class="flex w-full h-1">
          <div
            v-for="(stage, index) in promodoroTotal"
            :title="`Round ${index + 1}: ${stage.name}`"
            class="w-full h-1 mr-1 cursor-pointer bg-red hover:ring hover:ring-offset-1"
            :class="[state.currentStep >= stage.originalIndex ? currentStateColor : '']"
            :key="stage.name"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, watch, ref } from "vue";
import { Duration, Interval, DateTime } from "luxon";
import { ITrack, useTrackFirestore } from "@/utils/useTrackFirestore";
import { SESSION_MODES } from "@/utils";
import { usePromodoro } from "@/utils/usePromodoro";
import { useSlack } from "@/utils/useSlack";
import { firebaseState } from "@/utils/useFirebase";
import { ElMessageBox, ElNotification } from "element-plus";
import { useTitle } from "@vueuse/core";
import { useTaskFirestore } from "@/utils/useTaskFirestore";

const { saveTrack, updateTrack, deleteTrack } = useTrackFirestore();
const { updateTask } = useTaskFirestore();

const props = defineProps({
  task: {
    type: Object,
  },
  currentTimer: {
    type: Object,
  },
  min: {
    type: Number,
    default: 1,
  },
  trackableModes: {
    type: Array,
    default() {
      return [SESSION_MODES.WORK, SESSION_MODES.REST, SESSION_MODES.LONG_REST];
    },
  },
  now: {
    type: Number,
  },
});

const emit = defineEmits({
  "update:currentTimer": (timer) => timer,
});

// state
const track = reactive<Record<string, any>>({
  uid: null,
  task_uid: null,
  started_at: null,
  ended_at: null,
  type: "promodoro",
  subtype: null,
  duration: null,
  target_time: null,
  completed: false,
  description: "",
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
      color: "text-red-400 dark:text-error",
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
  mode: "promodoro",
  volume: 50,

  pushSubscription: null,
  durationTarget: null,
});

// clock

interface IClock {
  now: null | Date;
  timer: NodeJS.Timer | null;
}

const clock = reactive<IClock>({
  now: null,
  timer: null,
});

const startClock = () => {
  clock.timer = setInterval(() => {
    clock.now = new Date();
  }, 100);
};

const stopClock = () => {
  if (clock.timer) {
    clearInterval(clock.timer);
    clock.timer = null;
    clock.now = null;
    emit("update:currentTimer", {});
  }
};

// UI
const trackerIcon = computed(() =>
  clock.now ? "far fa-stop-circle" : "far fa-play-circle"
);
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
};

// Time manipulation
const setDurationTarget = () => {
  const { min, sec } = state.modes[state.mode];
  state.durationTarget = Duration.fromISO(`PT${min}M${sec}S`);
};

setDurationTarget();

const targetTime = computed(() => {
  if (track.started_at && clock.now) {
    const targetTime = DateTime.fromJSDate(track.started_at).plus(state.durationTarget);
    return targetTime;
  }
  return null;
});

const currentTime = computed(() => {
  if (track.started_at && clock.now && state.durationTarget) {
    let duration = Interval.fromDateTimes(track.started_at, clock.now).toDuration();
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

watch(
  () => currentTime.value,
  () => {
    if (clock.now) {
      useTitle(`Zen.  ${currentTime.value}`);
    } else {
      useTitle("Zen.");
    }
  }
);

watch(
  () => clock.now,
  (now) => {
    if (targetTime.value && now && targetTime.value.diffNow() < 0) {
      track.completed = true;
      stop();
    }
  }
);

// Settings
const {
  playSound,
  stopSound,
  promodoroState,
  setSettings,
  showNotification,
} = usePromodoro();
const isModalOpen = ref(false);

setSettings(firebaseState.settings);

watch(
  () => promodoroState,
  (localState) => {
    state.template = localState.template;
    state.modes = localState.modes;
    state.pushSubscription = localState.pushSubscription;
    state.volume = localState.volume;
    setDurationTarget();
  },
  { immediate: true }
);

const createTrack = () => {
  track.task_uid = props.task.uid;
  track.description = props.task.title;
  track.target_time = state.durationTarget.toISO();
  track.subtype = state.mode;
  const formData = { ...track };
  delete formData.currentTime;
  saveTrack(formData).then((uid) => {
    track.uid = uid;
    updateTask({
      uid: props.task.uid,
      last_tracked_at: track.started_at,
    });
    emit("update:currentTimer", track);
  });
};

const validatePlay = () => {
  return isTrackableMode() && (props.task.title || track.description);
};

const { setStatus } = useSlack();

// Controls
const toggleTracker = () => {
  track.started_at ? stop(false, true) : play();
};

const resume = (currentTimer: Record<string, any>) => {
  if (!clock.timer) {
    track.uid = currentTimer.uid;
    track.started_at = currentTimer.started_at;
    track.task_uid = currentTimer.task_uid;
    track.description = currentTimer.description;
    track.target_time = currentTimer.target_time;
    track.subtype = currentTimer.subtype;
    track.completed = false;
    setDurationTarget();
    startClock();
  }
};

watch(
  () => props.currentTimer,
  (timer) => {
    if (timer && timer.uid !== track.uid) {
      timer?.started_at && resume(timer);
    }
  },
  { immediate: true }
);
const play = () => {
  if (!validatePlay()) {
    ElNotification({
      title: "Select a task",
      message: "Must select a task to start promodoro",
      type: "info",
    });
    return;
  }

  stopSound();
  track.started_at = new Date();
  clock.now = track.started_at;

  if (validatePlay()) {
    setStatus("Zen mode.", ":slack:");
    createTrack(track);
  }

  startClock();
};

const stop = (shouldCallNextMode = true, silent = false) => {
  track.ended_at = new Date();
  const isValidated = validatePlay();
  if (isValidated && clock.now) {
    updateTrackFromLocal({ ...track });
  }

  const wasRunning = Boolean(clock.now);
  const previousMode = state.mode;
  const message = track.completed ? "finished" : "stopped";

  clearTrack();
  stopClock();

  nextMode();
  if (!silent) {
    playSound();
    if (wasRunning && previousMode == "promodoro") {
      showNotification("Promodoro session finished");
      ElMessageBox.confirm(`Promodoro session ${message}`);
    }
  }
};

const reset = () => {
  stop();
  state.mode = "promodoro";
  state.currentStep = 0;
  setDurationTarget();
};

const nextMode = () => {
  if (clock.now) {
    stop(false);
  }

  const canIncrement = state.currentStep < state.template.length - 1;
  const nextMode = canIncrement ? state.currentStep + 1 : 0;
  state.mode = state.template[nextMode];
  state.currentStep = nextMode;
  setDurationTarget();
};

const clearTrack = () => {
  clearInterval(clock.timer);
  track.started_at = null;
  track.ended_at = null;
  track.duration = null;
  track.target_time = null;
  track.completed = false;
};

// checks to stop
onBeforeUnmount(() => {
  useTitle("Zen.");
  stop(false, true);
});

watch(
  () => props.task.title,
  (newValue, oldValue) => {
    if (oldValue && clock.now && state.mode == "promodoro") {
      stop(false, true);
    }
  }
);

// Persistence
const updateTrackFromLocal = async (track: Partial<ITrack>) => {
  if (!track.started_at) return;
  const formData = { ...track };
  const duration = Interval.fromDateTimes(
    formData.started_at,
    formData.ended_at
  ).toDuration();

  if (props.min && duration.as("minutes") < props.min) {
    await deleteTrack(formData);
    emit("track-trashed", props.task.uid, formData);
    ElNotification({
      message: "Track should be at leas 1 minute",
      type: "error",
    });
    return;
  }

  (formData.duration_ms = duration.as("milliseconds")),
    (formData.duration_iso = duration.toISO()),
    delete formData.currentTime;
  updateTrack(formData).then(() => {
    emit("update:currentTimer", {});
    emit("track-added", props.task.uid, formData);
    ElNotification({
      title: "Pomodoro Saved",
      message: "Pomodoro saved",
      type: "success",
    });
  });
};

const togglePlay = () => {
  if (!props.currentTimer || props.task?.uid != props.currentTimer.task_uid) {
    reset();
  }
  toggleTracker();
};

defineExpose({
  toggleTracker,
  togglePlay,
});
</script>
