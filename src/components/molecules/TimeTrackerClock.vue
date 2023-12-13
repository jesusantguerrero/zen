<template>
  <div 
    class="flex items-center justify-center font-bold"
    :class="[state.isMini ? 'flex-row space-x-5' : 'flex-col space-y-4 rounded-md text-2xl py-4']"
  >
    <div 
    class="text-md"   
    :class="[trackerMode.color, trackerMode.colorBorder]">
      {{ trackerMode.text }}
    </div>
    
    <div class="flex items-center">
      <button 
        v-if="!state.isMini"
        class="text-2xl text-gray-400 rounded-full focus:outline-none dark:hover:bg-gray-600 h-14 w-14" 
        :class="{'hover:bg-gray-100': hasPrevMode}"
        @click="prevMode" 
        :disabled="!hasPrevMode"   
      >
        <i class="fa fa-chevron-left"></i>
      </button>
        <div 
          class="flex items-center justify-center cursor-pointer"
          @click="toggleTracker"
          :class="[trackerMode.color, trackerMode.colorBorder, state.isMini ? 'w-20 flex-row-reverse': 'h-52 w-52 rounded-full flex-col space-y-3 border-2']"
          title="Click here to start"
        >

            <div
              class="select-none"
              :class="[state.isMini ? 'w-full text-center text-2xl' : 'text-5xl']"
            >
              {{ currentTime }}
              <div class="flex w-full h-1" :class="[state.isMini ? '' : 'mt-2']">
                <div
                  v-for="(stage, index) in promodoroTotal"
                  :title="`Round ${index+1}: ${stage.name}`"
                  class="w-full h-1 mr-1 cursor-pointer bg-red hover:ring hover:ring-offset-1"
                  :class="[state.currentStep >= stage.originalIndex ? currentStateColor : 'bg-gray-200']"
                  :key="stage.name"
                ></div>
              </div>
            </div>

      
            <i class="fas" :class="[trackerIcon, state.isMini ? 'mr-2' : 'text-3xl']"></i>
        </div>
        <button 
          v-if="!state.isMini"
          class="text-2xl text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none h-14 w-14" 
          @click="nextMode">
          <i class="fa fa-chevron-right"></i>
        </button>
    
    </div>
  </div>
</template>

<script>
import { computed, onBeforeUnmount, reactive, watch } from "vue";
import { Duration, Interval, DateTime } from "luxon";
import { usePromodoro } from "@/composable/usePromodoro";
import { ElMessageBox } from "element-plus";
import { useTitle } from "@vueuse/core";

export default {
  name: "TimeTrackerClock",
  props: {
      task: {
    type: Object
  },
  timer: {
    type: Object
  },
  size: {

  },
  disabled: {
    type: Boolean,
    default: false
  },
  template: {
    type: Array,
    default() {
      return [
      "promodoro",
      "rest",
      "promodoro",
      "rest",
      "promodoro",
      "rest",
      "promodoro",
      "long",
      ]
    }
  }
  },
  emits: {
    "update:timer": (timer) =>  timer
  },
  setup(props, { emit }) {
    // state
    const state = reactive({
      currentStep: 0,
      now: null,
      mode: "promodoro",
      volume: 50,
      timer: null,
      durationTarget: null,
      modes: {
          long: {
            label: "Long Rest",
            text: "Long Rest",
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
      isMini: computed(() => {
        return props.size == 'mini';
      }),
      track: reactive({
        uid: null,
        task_uid: null,
        started_at: null,
        ended_at: null,
        type: "promodoro",
        duration: null,
        target_time: null,
        completed: false
      })
    });
    
    // UI
    const trackerIcon = computed(() => state.now ? 'fas fa-stop': 'fas fa-play' );
    const trackerMode = computed(() => state.modes[state.mode]);
    const promodoroTotal = computed(() => {
      return props.template
        .map((mode, index) => {
          return {
            name: mode,
            originalIndex: index,
          };
        })
        .filter((mode) => mode.name.includes("promodoro"));
    });
    const currentStateColor = computed(() => {
      return state.modes[props.template[state.currentStep]].colorBg;
    });
    const hasPrevMode = computed(() => {
      return state.currentStep > 0;
    })
    
    // Time manipulation
    const setDurationTarget = () => {
      const { min, sec } = state.modes[state.mode];
      state.durationTarget = Duration.fromISO(`PT${min}M${sec}S`);
    };
    
    setDurationTarget();
    
    const targetTime = computed(() => {
      if (state.track.started_at && state.now) {
        const targetTime = DateTime.fromJSDate(state.track.started_at).plus(state.durationTarget);
        return targetTime;
      }
      return null;
    });
    
    const currentTime = computed(() => {
      if (state.track.started_at && state.now && state.durationTarget) {
        let duration = Interval.fromDateTimes(state.track.started_at, state.now).toDuration()
        state.track.currentTime = duration;
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
        state.track.completed = true;
        stop();
      }
    });
    
    // Settings
    const { playSound, stopSound, showNotification } = usePromodoro()
    
    // Controls
    const toggleTracker = () => {
      state.track.started_at ? stop(null, true) : play();
    };
    
    const play = () => {  
      if (props.disabled) {
        return
      }
      stopSound()
      state.track.started_at = new Date();
      state.now = state.track.started_at;
      
      if (state.mode == 'promodoro') {
        createTrack(state.track)
      }
    
      state.timer = setInterval(() => {
        state.now = new Date();
      }, 100);
    };
    
    const stop = (shouldCallNextMode = true, silent) => {
      state.track.ended_at = new Date();
      if (state.mode == 'promodoro' && state.now) {
        updateTrackFromLocal({...state.track});
      }
    
      const wasRunning = Boolean(state.now);
      const previousMode = state.mode;
      const message = state.track.completed ? "finished" : "stopped";
      
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

    const reset = () => {
      stop();
      state.mode = "promodoro";
      state.currentStep = 0
      setDurationTarget();
    }
    
    const prevMode = () => {
      if (state.now) {
        stop(false);
      }
      
      const nextMode = hasPrevMode.value ? state.currentStep - 1 : 0;
      state.mode = props.template[nextMode];
      state.currentStep = nextMode;
      setDurationTarget();
    };
    
    const nextMode = () => {
      if (state.now) {
        stop(false);
      }
    
      const canIncrement = state.currentStep < props.template.length - 1;
      const nextMode = canIncrement ? state.currentStep + 1 : 0;
      state.mode = props.template[nextMode];
      state.currentStep = nextMode;
      setDurationTarget();
    };
    
    // data management / persistence
    const clearTrack = () => {
      clearInterval(state.timer);
      state.track.started_at = null;
      state.track.ended_at = null;
      state.track.duration = null;
      state.track.target_time = null;
      state.track.completed = false
    };
    
    const createTrack = () => {
      state.track.task_uid = props.task.uid;
      state.track.description = props.task.title;
      state.track.target_time = state.durationTarget.toISO();
      const formData = { ...state.track }
      delete formData.currentTime
      emit('pomodoroStarted', formData);
      emit("update:timer", state.track)
    }
    
    const updateTrackFromLocal = (track) => {
      const formData = { ...track }
      const duration = Interval.fromDateTimes(formData.started_at, formData.ended_at).toDuration();
      formData.duration_ms = duration.as('milliseconds'),
      formData.duration_iso = duration.toISO(),
      delete formData.currentTime;
      emit('pomodoroStopped', formData)
      emit("update:timer", {})
    };
    
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

    return {
      trackerIcon,
      trackerMode,
      promodoroTotal,
      currentStateColor,
      hasPrevMode,
      targetTime,
      currentTime,
      toggleTracker,
      stop,
      play,
      reset,
      prevMode,
      nextMode,
      clearTrack,
      createTrack,
      updateTrackFromLocal,
      state
    }
  }
}
</script>../../composables/usePromodoro