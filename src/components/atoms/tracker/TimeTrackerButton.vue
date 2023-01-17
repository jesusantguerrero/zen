<template>
  <div
    class="flex items-center ml-2 text-sm text-gray-400 task-item__tracked hover:text-gray-600 dark:hover:text-gray-200 md:text-md md:text-base"
    title="Time tracked"
    :class="[allowRun ? 'cursor-pointer' : 'cursor-default']"
    @click="$emit('toggle-timer', isCurrent)"
  >
    <i
      class="mr-1 fa fa-clock"
      :class="allowRun ? trackerIcon : 'fa-clock'"
    ></i>
    <span> {{ isCurrent && currentTimer.currentTime ? timeTracked : defaultValue }}</span>
  </div>
</template>

<script>
import { computed, reactive, toRefs } from "vue";
import { useTracker } from "../../../composables/useTracker";
import { useDateTime } from "../../../composables/useDateTime";

export default {
  name: "TimeTrackerButton",
  props: {
    allowRun: {
      type: Boolean,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    defaultValue: {
      type: String,
      default: "00:00:00",
    },
    task: {
      type: Object,
      default() {
        return {};
      },
    },
    currentTimer: {
      type: Object,
      default() {
        return {};
      },
    },
    hideSessions: {
      type: Boolean,
    },
  },
  setup(props) {
    const { task, currentTimer } = toRefs(props);

    const { timeTracked, savedTime } = useTracker(task, currentTimer);
    const { formatDurationFromMs } = useDateTime();

    const state = reactive({
      completedPomodoros: computed(() => {
        return task.value.tracks
          ? task.value.tracks.filter((track) => track.completed).length
          : 0;
      }),
      trackerIcon: computed(() =>
        props.isCurrent && props.currentTimer.currentTime ? "fas fa-stop" : "fas fa-play"
      ),
    });

    return {
      ...toRefs(state),
      timeTracked,
      savedTime,
      formatDurationFromMs,
    };
  },
};
</script>
