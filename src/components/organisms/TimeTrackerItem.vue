<script setup lang="ts">
// @ts-expect-error: no tyoes for this lib
import Duration from "duration";
import { computed, reactive } from "vue";
import { durationFromMs, formatDateToTime } from "../../utils/useTracker"
import { ITrack } from "@/utils/useTrackFirestore";


const emit = defineEmits<{
  deleteItem: [track: ITrack];
  editItem: [track: ITrack];
  resumeTimer: [track: ITrack ]
}>();

const { timeEntry, isChild } = defineProps<{
 timeEntry: ITrack;
 isChild: boolean; 
}>();

const state = reactive({
    now: new Date(),
    running: false
});

const duration = computed(() => {
  return timeEntry.duration_ms 
  ? (durationFromMs(timeEntry.duration_ms) || localDuration.value)
  : 0
});

const localDuration = computed(() => {
  let duration = 0;
  if (timeEntry.started_at) {
    duration = new Duration(timeEntry.started_at, timeEntry.ended_at);
    // @ts-ignore: expect warning in to string
    return duration.toString("%H:%M:%S");
  }

  return "00:00:00";
});

const timerButtonIcon = computed(() => {
  return state.running ? "stop" : "play";
});

const labels = computed(() => {
  return timeEntry.labels ? timeEntry.labels.map(label => label.title).join(", ") : "";
});

const deleteItem = () => {
  emit('deleteItem', timeEntry)
};

const toggleTimer = () => {
  emit('resumeTimer', timeEntry);
}

const setDates = (startDate: Date, endDate: Date) => {
  timeEntry.started_at = startDate; 
  timeEntry.ended_at = endDate; 
}
</script>

<template>
  <div class="flex items-center w-full px-8 bg-white time-tracker-item group">
    <div class="flex w-full">
      <div class="flex items-center w-2/5">
        <input
          type="checkbox"
          class="w-full mr-4 form-control-check checkbox-done" 
          v-model="timeEntry.selected" :value="timeEntry.uid" 
        />
        <div class="flex items-center w-full" :class="[isChild? 'ml-11' : 'ml-4']">
          <div 
            v-if="isChild"
            class="w-4 h-4 text-green-500 bg-green-100 border border-green-500 rounded-full"
          />
          <input
            type="text"
            class="w-full px-8 bg-transparent time-tracker__description"
            placeholder="Add description"
            :class="[isChild? '' : 'font-bold']"
            v-model.lazy="timeEntry.description"
            @update:model-value="$emit('updated', timeEntry)"
          />
        </div>
        <div class="opacity-0 time-tracker__billable-status custom-check-container">
          <label
            for="time-tracker-billable"
            class="custom-check"
            :class="{ selected: timeEntry.billable }"
          >
            <i class="fa fa-folder" />
            <input
              type="checkbox"
              name="time-tracker-billable"
              class="hide"
              :id="`time-tracker-billable-${timeEntry.uid}`"
              v-model="timeEntry.billable"
            />
          </label>
        </div>
      </div>

      <div class="flex m-auto opacity-0 w--1/5">
        <div class="flex time-tracker__relations">
          <div class="time-tracker__billable-status custom-check-container">
            <label
              for="time-tracker-billable"
              class="custom-check"
              :class="{ selected: timeEntry.billable }"
            >
              <i class="fa fa-tag" /> {{ labels }}
              <input
                type="checkbox"
                name="time-tracker-billable"
                class="hide"
                id="time-tracker-billable"
                v-model="timeEntry.billable"
              />
            </label>
          </div>

          <div class="time-tracker__billable-status custom-check-container">
            <label
              for="time-tracker-billable"
              class="custom-check"
              :class="{ selected: timeEntry.billable }"
            >
              <i class="fa fa-dollar-sign" />
              <input
                type="checkbox"
                name="time-tracker-billable"
                class="hide"
                id="time-tracker-billable"
                v-model="timeEntry.billable"
              />
            </label>
          </div>
        </div>
      </div>
      <div class="flex w-2/5 ml-auto">
        <div class="flex time-tracker__controls ">
          <span disabled class="flex items-center px-2 rounded-md cursor-pointer start-dates hover:bg-gray-100"
          @click="emit('editItem', timeEntry)"
          >
            {{ formatDateToTime(timeEntry.started_at) }} -
            {{ formatDateToTime(timeEntry.ended_at) }}
          </span>

          <input
            type="text"
            name=""
            v-model="duration"
            disabled
            class="time-duration-display"
          />

          <button @click="emit('resumeTimer', timeEntry)" class="opacity-0 play-button group-hover:opacity-100">
            <i :class="`fa fa-${timerButtonIcon}`" />
          </button>
          <button @click="deleteItem()" class="opacity-0 play-button group-hover:opacity-100">
            <i class="fa fa-trash" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>



<style lang="scss" scoped>
.time-tracker-item {
  height: 64px;
  margin: 2px 0;
  overflow: hidden;

  .card-body {
    padding: 0 !important;
  }
}

.time-tracker__controls {
  margin-left: auto;
  .play-button {
    margin: auto;
    border: none;
    height: 45px;
    width: 45px;
    border-radius: 50%;
    color: #eee;
    background: transparent;
    outline: none;
    display: flex;
    align-items: center;
    justify-content: center;

    &:focus {
      outline: none;
    }

    &:hover {
      color: #333;
    }
  }

  .time-duration-display {
    width: max-content;
    text-align: center;
    width: 90px;
    background: white;
    border: none;
    display: flex;
    margin-right: 5px;
  }
}

.time-tracker__relations {
  margin-left: auto;
}

.custom-check {
  cursor: pointer;
  width: 100%;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: gray;
  transition: all ease 0.3s;
  margin-bottom: 0;

  input {
    display: none;
  }

  &.selected {
    color: var(--primary-color) !important;
  }
}

.custom-check-container {
  min-width: 28px;
  height: 34px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin: auto;
  padding: 0 5px;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    color: #333;
  }
}

.time-tracker__description {
  border: none;
  height: 100%;
  width: 100%;

  &:focus {
    outline: none;
  }
}

.start-dates {
  margin-right: 28px;
}
[class*="col"] {
  height: 100%;
}
</style>
