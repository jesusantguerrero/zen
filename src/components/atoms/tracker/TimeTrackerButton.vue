<template>
  <div
    class="task-item__tracked ml-2 text-gray-400 hover:text-gray-600 md:text-md text-sm md:text-base flex items-center"
    title="Time tracked"
    :class="[allowRun ? 'cursor-pointer' : 'cursor-default']"
    @click="$emit('toggle-timer', isCurrent)"
  >
    <i
      class="fa fa-clock mr-1"
      :class="allowRun ? trackerIcon : 'fa-clock'"
    ></i>
    <span> {{ isCurrent ? timeTracked : defaultValue }}</span>
  </div>
</template>

<script>
import { computed, reactive, toRefs } from "vue";
import { useTracker } from "../../../utils/useTracker";
import { useDateTime } from "../../../utils/useDateTime";

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
      completedPromodoros: computed(() => {
        return task.value.tracks
          ? task.value.tracks.filter((track) => track.completed).length
          : 0;
      }),
      trackerIcon: computed(() =>
        props.isCurrent ? "fas fa-stop" : "fas fa-play"
      ),
    });
    console.log("hola");
    return {
      ...toRefs(state),
      timeTracked,
      savedTime,
      formatDurationFromMs,
    };
  },
};
</script>
