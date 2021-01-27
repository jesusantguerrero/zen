<template>
  <div
    class="font-bold text-2xl text-center text-center"
    title="click here to start"
  >
    <div class="flex items-start justify-between">
      <div
        class="select-none cursor-pointer"
        :class="trackerColor"
        @click="toggleTracker"
      >
        {{ currentTime }}
        <div class="flex w-full h-1">
          <div
            class="bg-red h-1 w-full mr-1"
            v-for="stage in promodoroTotal"
            :class="{
              [`${currentStateColor}`]:
                state.currentStep >= stage.originalIndex,
            }"
            :key="stage"
          ></div>
        </div>
      </div>

      <button
        class="text-sm ml-4 hover:text-md text-gray-400 cursor-pointer mt-2"
      >
        <i class="fa fa-ellipsis-v"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, reactive, watch } from "vue";
import { Duration, Interval, DateTime } from "luxon";

// state
const track = reactive({
  started_at: null,
  ended_at: null,
  target_time: null,
  type: "promodoro",
  duration: null,
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
    },
    promodoro: {
      min: 25,
      sec: 0,
      color: "text-red-400",
      colorBg: "bg-red-400",
    },
    rest: {
      min: 5,
      sec: 0,
      color: "text-blue-400",
      colorBg: "bg-blue-400",
    },
  },
  now: null,
  mode: "promodoro",
  timer: null,
  durationTarget: null,
});

const setDurationTarget = () => {
  const { min, sec } = state.modes[state.mode];
  state.durationTarget = Duration.fromISO(`PT${min}M${sec}S`);
};

setDurationTarget();

const trackerColor = computed(() => state.modes[state.mode].color);
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
    const targetTime = DateTime.fromJSDate(track.started_at).plus(
      state.durationTarget
    );
    return targetTime;
  }
  return null;
});
const currentTime = computed(() => {
  if (track.started_at && state.now && state.durationTarget) {
    let duration = Interval.fromDateTimes(
      track.started_at,
      state.now
    ).toDuration();
    if (duration) {
      duration = state.durationTarget.minus(duration);
      return duration.as("seconds") < 0 ? "00:00" : duration.toFormat("mm:ss");
    }
    return "00:00";
  } else {
    return state.durationTarget.toFormat("mm:ss");
  }
});

watch(
  () => state.now,
  (now) => {
    if (targetTime.value && now && targetTime.value.diffNow() < 0) {
      stop();
    }
  }
);

// controls

const toggleTracker = () => {
  track.started_at ? stop() : play();
};

const play = () => {
  track.started_at = new Date();
  state.timer = setInterval(() => {
    state.now = new Date();
  }, 100);
};

const stop = (shouldCallNextMode = true) => {
  save();
  clearInterval(state.timer);
  state.now = null;
  if (state.mode == "promodoro") {
    confirm("Stopped");
  }
  if (shouldCallNextMode) {
    nextMode();
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
  state.now = null;
  track.started_at = null;
  track.ended_at = null;
  track.duration = null;
  track.target_time = null;
};

const save = () => {
  // save to db.
  clearTrack();
};
</script>

<style></style>
