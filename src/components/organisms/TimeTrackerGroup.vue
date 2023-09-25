<script setup lang="ts">
import { reactive, computed, nextTick, ref, watch } from "vue";
import TimeEntryItem from "./TimeTrackerItem.vue";
import { formatDateToTime } from "@/utils/useTracker";
import { ITrack } from "@/utils/useTrackFirestore";
import { formatDurationFromMs } from "@/utils/useDateTime";
import { ITask } from "@/utils/useTaskFirestore";

interface ITrackGroup {
  description: string;
  tracks: ITrack[];
}

const emit = defineEmits<{
  deleteItem: [track: ITrack];
  deleteGroup: [tracks: ITrack[]];
  resumeTimer: [track: ITrack];
  toggleSelect: [state: boolean];
  editTrack: [track: ITrack];
  updated: [track: ITrack];
  detail: [track: ITrack];
  groupDescriptionChanged: [ITrack[]];
}>();

const { timeEntry } = defineProps<{
  timeEntry: ITrackGroup;
}>();

const state = reactive({
  now: new Date(),
  isExpanded: false,
  selected: false,
});

const toggleExpand = () => {
  state.isExpanded = !state.isExpanded;
};

const toggleSelection = () => {
  nextTick(() => {
    emit("toggleSelect", state.selected);
  });
};

const taskGroupDescription = ref(timeEntry.description);

const duration = computed<string>(() => {
  // @ts-expect-error: I dont know
  const milliseconds = timeEntry.tracks.reduce(
    (total: number, current: ITask): number => {
      return (total += current.duration_ms || 0);
    },
    0
  );

  return formatDurationFromMs(milliseconds).toFormat("hh:mm:ss");
});

const onResumeTimer = () => {
  emit("resumeTimer", timeEntry.tracks[0]);
};

watch(
  () => timeEntry.description,
  () => {
    taskGroupDescription.value = timeEntry.description;
  }
);
const onGroupDescriptionChanged = () => {
  if (taskGroupDescription.value !== timeEntry.description) {
    emit(
      "groupDescriptionChanged",
      timeEntry.tracks.map((track) => ({
        ...track,
        description: taskGroupDescription.value,
      }))
    );
  }
  isEditing.value = false;
};

const titleRef = ref();
const isEditing = ref(false);
const toggleEdit = () => {
  isEditing.value = !isEditing.value;
  if (isEditing.value) {
    nextTick(() => {
      titleRef.value.focus();
    });
  }
};
</script>

<template>
  <div>
    <div
      v-if="timeEntry.tracks.length > 1"
      class="flex items-center w-full px-8 bg-white dark:bg-gray-700 dark:text-gray-200 time-tracker-item group"
    >
      <div class="flex w-full">
        <div class="flex items-center w-3/5">
          <input
            type="checkbox"
            class="inline-block form-control-check checkbox-done"
            v-model="state.selected"
            @change="toggleSelection"
          />

          <div class="flex items-start ml-9 w-full">
            <div
              class="text-green-500 border-2 whitespace-nowrap border-green-500 time-tracker-item__count"
              @click.stop="toggleExpand()"
            >
              {{ timeEntry.tracks.length }}
            </div>

            <section
              v-if="!isEditing"
              @click="toggleEdit"
              class="flex w-full items-start hover:bg-gray-200/20 cursor-pointer py-2 px-4 rounded-md"
            >
              <div
                type="text"
                class="mr-2 font-bold time-tracker__description inline-flex text-left"
              >
                {{ timeEntry.description }}
              </div>
            </section>
            <textarea
              v-else
              ref="titleRef"
              type="text"
              class="w-full px-8 bg-transparent active:border-transparent active:outline-none"
              placeholder="Add description"
              v-model.lazy="taskGroupDescription"
              @blur="onGroupDescriptionChanged"
            />
          </div>
        </div>

        <div class="flex w-2/5 ml-auto">
          <div class="flex time-tracker__controls">
            <span disabled class="flex items-center start-dates">
              {{ formatDateToTime(timeEntry.tracks[0].started_at) }} -
              {{
                timeEntry.tracks.length &&
                formatDateToTime(timeEntry.tracks.at?.(-1)?.ended_at)
              }}
            </span>
            <input
              type="text"
              name=""
              :value="duration"
              disabled
              class="time-duration-display bg-gray-50/20 rounded-md"
            />
            <slot name="actions-append" />
          </div>
        </div>
      </div>
    </div>

    <!-- Child tracks -->
    <TransitionGroup>
      <template v-if="timeEntry.tracks.length <= 1 || state.isExpanded">
        <TimeEntryItem
          v-for="track in timeEntry.tracks"
          class="dark:text-gray-300"
          :is-child="timeEntry.tracks.length > 1"
          :time-entry="track"
          :key="track.uid"
          @detail="emit('detail', $event)"
          @edit-item="emit('editTrack', track)"
          @delete-item="emit('deleteItem', $event)"
          @updated="emit('updated', $event)"
        />
      </template>
    </TransitionGroup>
    <!-- end of child tracks -->
  </div>
</template>

<style lang="scss" scoped>
.time-tracker-item {
  height: 64px;
  margin: 2px 0;
  overflow: hidden;

  /** NEW FEATURES: CSS has */
  &:has(:checked) {
    @apply bg-green-50/20;
  }

  /** NEW FEATURES: CSS has */
  &:has(.time-tracker-item__count) {
    @apply bg-gray-50/20;
  }

  .card-body {
    padding: 0 !important;
  }

  &__count {
    width: 30px;
    height: 30px;
    min-width: 30px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 10px;
    cursor: pointer;
    font-weight: bolder;
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
