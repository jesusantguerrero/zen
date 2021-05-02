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

<script setup>
import { computed, defineProps, toRefs} from "vue";
import { useTracker } from "../../../utils/useTracker";
import { useDateTime } from "../../../utils/useDateTime";

const props = defineProps({
  allowRun: {
    type: Boolean,
  },
  isCurrent: {
      type: Boolean,
      default: false
  }, 
  defaultValue: {
      type: String,
      default: '00:00:00'
  }, 
  task: {
    type: Object,
    default() {
        return {}
    }
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
});

const { task, currentTimer } = toRefs(props);

const completedPromodoros = computed(() => {
  return task.value.tracks
    ? task.value.tracks.filter((track) => track.completed).length
    : 0;
});
const { timeTracked, savedTime } = useTracker(task, currentTimer);
const { formatDurationFromMs } = useDateTime();
const trackerIcon = computed(() => props.isCurrent ? 'fas fa-stop': 'fas fa-play' );
</script>
