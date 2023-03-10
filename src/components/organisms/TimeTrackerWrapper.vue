<template>
  <div
    class="flex items-center px-5"
  >
    <TimeTrackerClock
      ref="Tracker"
      :task="task"
      :current-timer="timer"
      :template="state.template"
      :size="size"    
      :disabled="!task || !task.title"
      @pomodoroStarted="createTrack"
      @pomodoroStopped="updateTrackFromLocal"
      @update:timer="$emit('update:timer', $event)"
    />

    <ElDropdown trigger="click" @command="handleCommand" v-if="size == 'mini'">
        <button
          class="px-2 py-2 ml-4 text-sm text-gray-400 transition-colors border-2 border-transparent rounded-md cursor-pointer hover:border-gray-200 hover:text-md hover:bg-gray-200 focus:outline-none"
        >
          <i class="fa fa-ellipsis-v"></i>
        </button>
      <template #dropdown>
        <ElDropdownMenu>
          <ElDropdownItem command="configuration" icon="el-icon-s-tools">Configuration</ElDropdownItem>
          <ElDropdownItem command="nextmode" icon="el-icon-arrow-right">Next mode</ElDropdownItem>
        </ElDropdownMenu>
      </template>
    </ElDropdown>

    <TimeTrackerModal
      v-model:is-open="isModalOpen"
      :settings="state"
      @cancel="isModalOpen=false"
      @saved="onSettingsSaved"
    />
  </div>
</template>

<script>
import {  reactive, watch, ref} from "vue";
import { useTrackFirestore } from "./../../utils/useTrackFirestore";
import { usePromodoro } from "./../../utils/usePromodoro";
import { firebaseState } from "./../../utils/useFirebase";
import { ElNotification } from "element-plus";
import TimeTrackerClock from "../molecules/TimeTrackerClock.vue";

export default {
  components: {
    TimeTrackerClock,
  },
  props: {
      size: {
        type: String
      },
      task: {
        type: Object
      },
      timer: {
        type: Object
      }
  },
  setup(props) {
    const { saveTrack, updateTrack } = useTrackFirestore();
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
    const Tracker = ref(null)
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
          Tracker.value.nextMode()
          break;
        default:
          break;
      }
    } 

    const togglePlay = () => {
      if (!props.timer || props.task.uid != props.timer.task_uid) {
        Tracker.value.reset();
      }
      Tracker.value.toggleTracker()
    }

    const createTrack = (formData) => {
      saveTrack(formData)
        .then(uid => {
          state.lastTrackId = uid
        })
    }

    const updateTrackFromLocal = (trackData) => {
      const formData = { ...trackData, uid: state.lastTrackId }
      updateTrack(formData).then(() => {
        ElNotification({
          title: "Pomodoro Saved more",
          message: "Pomodoro saved",
          type: "success"
        })
      })
    };

    return {
      togglePlay,
      updateTrackFromLocal,
      createTrack,
      handleCommand,
      onSettingsSaved,
      state,
      Tracker
    }
  }
}
</script>