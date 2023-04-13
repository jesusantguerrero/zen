<template>
    <div>
        <div
            v-if="timeEntry.tracks.length > 1"
            class="flex items-center w-full px-8 bg-white time-tracker-item group"
        >
            <div class="flex w-full">
                <div class="flex items-center w-2/5">
                    <input
                        type="checkbox"
                        class="inline-block form-control-check checkbox-done" 
                        v-model="state.selected" @change="toggleSelection" />

                    <div class="flex items-center ml-9">
                        <div
                            class="text-green-500 border-2 border-green-500 time-tracker-item__count"
                            @click.stop="toggleExpand()"
                        >
                            {{ timeEntry.tracks.length }}
                        </div>

                        <span
                            type="text"
                            class="mr-2 font-bold time-tracker__description"
                        >
                            {{ timeEntry.description }}
                        </span>


                    </div>
                </div>

                <div class="flex w-3/5 ml-auto">
                    <div class="flex time-tracker__controls">
                        <span disabled class="flex items-center start-dates">
                            {{ formatDateToTime(timeEntry.tracks[0].started_at) }} -
                            {{ formatDateToTime(timeEntry.tracks.at(-1).ended_at) }}
                        </span>
                        <input
                            type="text"
                            name=""
                            :value="duration"
                            disabled
                            class="time-duration-display"
                        />

                        <button @click="initTimer()" class="opacity-0 play-button group-hover:opacity-100">
                            <i class="fa fa-play" />
                        </button>

                        <button @click="toggleExpand" class="opacity-0 play-button group-hover:opacity-100">
                            <i class="fa fa-th-list" />
                        </button>
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
                    :is-child="timeEntry.tracks.length > 1"
                    :time-entry="track"
                    :key="track.id"
                    @updated="emit('updated', $event)"
                />
            </template>
        </TransitionGroup>
        <!-- end of child tracks -->
    </div>
</template>

<script setup>
import { format } from "date-fns";
import { reactive, computed, nextTick } from "vue";
import TimeEntryItem from "./TimeTrackerItem.vue";

const props = defineProps({
    timeEntry: {
        type: Object,
        default() {
            return {
                description: "",
                billable: false,
                start: null,
                end: null,
                duration: null
            };
        }
    }
});

const emit = defineEmits(['toggle-select']);

const state = reactive({
    now: new Date(),
    isExpanded: false,
    selected: false
});

const formatDateToTime = (firebaseDate) => {
    return format(firebaseDate.toDate(), "HH:mm:ss");
}

const durationFromMs = (ms) => {
    const date = new Date(ms);
    return date
        .toISOString()
        .slice(11, -2)
        .split(":")
        .map(unit => {
            return Math.round(unit)
                .toString()
                .padStart(2, "0");
        })
        .join(":");
}

const toggleExpand = () => {
    state.isExpanded = !state.isExpanded;
}

const toggleSelection = () => {
    nextTick(() => {
        emit('toggle-select', state.selected)
    })
}

const duration = computed(() => {
    const milliseconds = props.timeEntry.tracks.reduce((total, current) => {
        return (total += (current.duration_ms || 0));
    },0);
    return durationFromMs(milliseconds);
});

</script>

<style lang="scss" scoped>
.time-tracker-item {
    height: 64px;
    margin: 2px 0;
    overflow: hidden;

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
