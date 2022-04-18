<template>
<div>
  <div class="md:flex pt-5 bg-white border border-gray-100 rounded-lg shadow-md dark:bg-gray-700 dark:border-gray-600">
      <div class="md:w-3/12 px-5 pt-2 space-y-4 text-gray-400 bg-white dark:bg-gray-700 dark:border-gray-600">
        <div class="mb-10 font-bold text-left text-gray-500 dark:text-gray-300">
            General Stats
          </div>
        <div class="flex items-center w-full px-5 py-8 overflow-hidden bg-white border-2 border-gray-200 rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
          <i class="mr-2 text-blue-400 fa fa-clock"></i>
          <span class="mr-2 font-bold text-blue-400">{{ formattedTime }}  </span>
          Total focused time
        </div>
        <div class="flex items-center w-full px-5 py-8 overflow-hidden bg-white border-2 border-gray-200 rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
          <i class="mr-2 text-blue-400 fa fa-stopwatch"></i>
           <span class="mr-2 font-bold text-blue-400">{{  tracksData.started}}  </span> Started
           <span class="mx-2 font-bold text-green-500">{{  tracksData.finished }}  </span> Finished
           <span class="mx-2 font-bold text-red-400">{{  tracksData.started - tracksData.finished }}  </span> Stopped
        </div>

        <div class="flex items-center w-full px-5 py-8 overflow-hidden bg-white border-2 border-gray-200 rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
          <i class="mr-2 text-green-500 fa fa-sticky-note"></i>
          <span class="mr-2 font-bold text-green-500">
            {{ tasksWorked.length }}
          </span>
          Tasks worked
        </div>
      </div>

      <!-- pomodoro stats -->
      <div class="md:w-9/12 overflow-auto">
          <report-pomodoro
            :stats-by-day="statsByDay"
            :time-data="formattedWeek"
          >
          <div class="ml-2 text-left">
              <at-date-pager next-mode="week" v-model="state.date" v-model:dateSpan="state.week" />
          </div>
          </report-pomodoro>
      </div>
    <!-- pomodoro stats --> 
  </div>
</div>
</template>

<script setup>
import { reactive, watch, ref, onUnmounted, computed } from 'vue'
import { useTrackFirestore } from '../../utils/useTrackFirestore'
import { useDateTime } from '../../utils/useDateTime'
import { getMilliseconds } from '../../utils/useTracker'
import ReportPomodoro from "../organisms/ReportPomodoro.vue"
import { format } from 'date-fns'
import { AtDatePager } from 'atmosphere-ui';
// state and ui
defineProps({
  title: {
    type: String,
    default: 'Pomodoro Stats'
  },
  description: {
    type: String,
    default: 'Pomodoro Stats'
  }
});

const state = reactive({
  tracks: [],
  week: null,
  date: new Date(),
  search: "",
  sections: ['Overview', 'Tasks', 'Time Tracking'],
  selectedSection: 'Overview',
})

// tracks data
const  { getTracksByDates } = useTrackFirestore()

const trackRef = ref(null);

watch(() => state.week, (week) => {
  getTracksByDates(week[0], week[6]).then(collectionRef => {
      trackRef.value =  collectionRef.onSnapshot(snap => {
      state.tracks = []
      snap.forEach((doc) => {
          state.tracks.push({...doc.data(), uid: doc.id });
      });
  })
  return collectionRef;
})
})


const { formatDurationFromMs } = useDateTime()
const formattedTime = computed(() => {
  return formatDurationFromMs(getMilliseconds(state.tracks)).toFormat('hh:mm:ss')
})

const tracksData = computed(() => {
  return {
    started: state.tracks.length,
    finished: state.tracks.filter(track => track.completed).length
  }
})

// Reports 
const tracksGroup = computed(() => {
    const trackGroup = {};

    if (state.tracks) {
    state.tracks.forEach(track => {
        const date = format(track.started_at.toDate(), "yyyy-MM-dd");

        if (!trackGroup[date]) {
            trackGroup[date] = {
                tasks: {
                  [track.description]: {
                      id: `group-${track.uid}`,
                      description: track.description,
                      tracks: [track]
                  }
                },
                pomodoro: {
                  started: 1,
                  finished: Number(track.completed || 0),
                  duration_ms: Number(track.duration_ms || 0)
                }
            };
        } else {
            if (!trackGroup[date].tasks[track.description]) {
                trackGroup[date].tasks[track.description] = {
                        id: `group-${track.uid}`,
                        description: track.description,                    
                        tracks: [track]
                };

                trackGroup[date].pomodoro.started += 1
                trackGroup[date].pomodoro.finished += Number(track.completed)
                trackGroup[date].pomodoro.duration_ms += Number(track.duration_ms)
            } else {
                trackGroup[date].tasks[track.description].tracks.push(track);
                trackGroup[date].pomodoro.started += 1
                trackGroup[date].pomodoro.finished += Number(track.completed)
                trackGroup[date].pomodoro.duration_ms += Number(track.duration_ms)
            }
        }
    });
    } 
     return trackGroup;
})

// completed by date
const statsByDay = computed(() => {
  return state.week && state.week.map((date) => {
    const stat = tracksGroup.value[format(date, 'yyyy-MM-dd')]
    return stat || null
  })
})

const tasksWorked = computed(() => {
  const tasks =  statsByDay.value && statsByDay.value.reduce((tasks, day) => {
    if (day) {
      return [...tasks, ...Object.keys(day.tasks)]
    } else {
      return tasks
    }
  }, [])

  return Array.from(new Set(tasks));
})

const formattedWeek = computed(() => {
  return state.week && state.week.map((date) => {
    return format(date, "iii, MMM dd");
  })
})

onUnmounted(() => {
  if (trackRef.value) {
    trackRef.value()
  }
});

</script>

<style lang="scss">
.el-date-full .el-date-editor.el-input {
  width: 100% !important;
}

.dark {
  .el-input, .el-input__inner, .el-picker__popper.el-popper[role=tooltip],.el-date-picker {
    @apply bg-gray-700 text-gray-300 hover:text-gray-50;
  }

  .el-date-picker__header, .el-picker-panel__icon-btn, .el-date-picker__header-label {
    @apply text-gray-300 hover:text-white
  }

  .el-date-table th {
    @apply text-white
  }

  .el-popper__arrow {
    @apply border-gray-700;
  }

  .el-popper.is-light .el-popper__arrow::before {
    @apply bg-gray-700
  }
}
</style>