<script setup lang="ts">
import { reactive, watch, ref, onUnmounted, computed } from 'vue'
import { useTrackFirestore } from '@/plugins/firebase/useTrackFirestore'
import { useTaskFirestore } from '@/plugins/firebase/useTaskFirestore'
import { useDateTime } from '@/composables/useDateTime'
import { getMilliseconds } from '@/composables/useTracker'
import ReportPomodoro from "../organisms/ReportPomodoro.vue"
import ReportStageDistribution from "../organisms/ReportStageDistribution.vue"
import ReportProductivity from "../organisms/ReportProductivity.vue"
import ReportCompletion from "../organisms/ReportCompletion.vue"
import ReportMatrixBalance from "../organisms/ReportMatrixBalance.vue"
import ReportGoals from "../organisms/ReportGoals.vue"
import { format } from 'date-fns'
// @ts-ignore
import { AtDatePager } from 'atmosphere-ui';
import { toCsv, downloadCsv } from '@/utils/csvExport'

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
  tracks: [] as any[],
  committed: [] as any[],
  week: null as Date[] | null,
  date: new Date(),
})

// tracks data
const { getTracksByDates } = useTrackFirestore()
const { getCommittedTasks } = useTaskFirestore()

const trackRef = ref<(() => void) | null>(null);
const committedRef = ref<(() => void) | null>(null);

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

// Reports — per-day aggregate
const tracksGroup = computed(() => {
  const trackGroup: Record<string, any> = {};

  if (state.tracks) {
    state.tracks.forEach(track => {
      const date = format(track.started_at, "yyyy-MM-dd");
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

const statsByDay = computed(() => {
  return state.week && state.week.map((date) => {
    const stat = tracksGroup.value[format(date, 'yyyy-MM-dd')]
    return stat || null
  })
})

const tasksWorked = computed(() => {
  const tasks = statsByDay.value && statsByDay.value.reduce<string[]>((all, day) => {
    if (day) return [...all, ...Object.keys(day.tasks)]
    return all
  }, [])
  return Array.from(new Set(tasks || []));
})

const formattedWeek = computed(() => {
  return state.week && state.week.map((date) => {
    return format(date, "iii, MMM dd");
  })
})

// tasks completed per day (matches week)
const completedByDay = computed(() => {
  if (!state.week) return []
  const byDate: Record<string, number> = {}
  state.committed.forEach((task) => {
    const date = task.commit_date
    if (!date) return
    byDate[date] = (byDate[date] || 0) + 1
  })
  return state.week.map((d) => byDate[format(d, "yyyy-MM-dd")] || 0)
})

// fetchers
const fetchTracks = (startDate: Date, endDate: Date) => {
  return getTracksByDates(startDate, endDate).then(collectionRef => {
    if (trackRef.value) trackRef.value()
    trackRef.value = collectionRef.onSnapshot(snap => {
      const tracks: any[] = []
      snap.forEach((doc) => {
        tracks.push({ ...doc.data(), uid: doc.id });
      });
      state.tracks = tracks;
    })
    return collectionRef;
  })
}

const fetchCommitted = (startDate: Date, endDate: Date) => {
  return getCommittedTasks(endDate, startDate).then(collectionRef => {
    if (committedRef.value) committedRef.value()
    committedRef.value = collectionRef.onSnapshot(snap => {
      const committed: any[] = []
      snap.forEach((doc) => committed.push({ ...doc.data(), uid: doc.id }))
      state.committed = committed
    })
  })
}

watch(() => state.week, () => {
  if (state.week) {
    fetchTracks(state.week[0], state.week[6]);
    fetchCommitted(state.week[0], state.week[6]);
  }
}, { immediate: true })

onUnmounted(() => {
  if (trackRef.value) trackRef.value()
  if (committedRef.value) committedRef.value()
});

// CSV export
const exportCsv = () => {
  if (!state.week) return
  const from = format(state.week[0], 'yyyy-MM-dd')
  const to = format(state.week[6], 'yyyy-MM-dd')

  const trackRows = state.tracks.map(t => ({
    type: 'track',
    date: format(t.started_at, 'yyyy-MM-dd'),
    started_at: t.started_at?.toISOString?.() || '',
    ended_at: t.ended_at?.toISOString?.() || '',
    duration_ms: t.duration_ms || 0,
    completed: t.completed ? 'yes' : 'no',
    description: t.description || '',
  }))
  const taskRows = state.committed.map(t => ({
    type: 'task',
    date: t.commit_date || '',
    started_at: '',
    ended_at: '',
    duration_ms: t.duration_ms || 0,
    completed: 'yes',
    description: t.title || '',
  }))

  const columns = ['type', 'date', 'started_at', 'ended_at', 'duration_ms', 'completed', 'description']
  const csv = toCsv([...trackRows, ...taskRows], columns)
  downloadCsv(`zen-metrics-${from}_to_${to}.csv`, csv)
}
</script>

<template>
<div class="space-y-6">
  <!-- Header with date pager + export -->
  <div class="flex items-center justify-between">
    <AtDatePager
      next-mode="week"
      v-model="state.date"
      v-model:dateSpan="state.week"
    />
    <button
      type="button"
      class="flex items-center h-10 px-4 space-x-2 text-sm text-gray-500 transition-colors border-2 border-gray-200 rounded-md focus:outline-none hover:border-gray-400 dark:bg-transparent dark:text-gray-300 dark:border-base-lvl-3"
      :disabled="!state.tracks.length && !state.committed.length"
      @click="exportCsv"
    >
      <i class="fa fa-download" />
      <span>Export CSV</span>
    </button>
  </div>

  <!-- Completion stat cards -->
  <ReportCompletion
    :stats-by-day="statsByDay"
    :started="tracksData.started"
    :finished="tracksData.finished"
  />

  <!-- Original totals + pomodoro chart -->
  <div class="pt-5 bg-white border border-gray-100 rounded-lg shadow-md md:flex dark:bg-base-lvl-2 dark:border-base-lvl-3">
    <div class="px-5 pt-2 space-y-4 text-gray-600 dark:text-gray-300 md:w-3/12 dark:border-gray-600">
      <div class="mb-10 font-bold text-left text-gray-700 dark:text-gray-300">
        General Stats
      </div>
      <div class="flex items-center w-full px-5 py-8 overflow-hidden bg-white border-2 border-gray-200 rounded-md dark:bg-base-lvl-1 dark:border-gray-500 dark:text-gray-300">
        <i class="mr-2 text-blue-400 fa fa-clock"></i>
        <span class="mr-2 font-bold text-blue-400">{{ formattedTime }} </span>
        Total focused time
      </div>
      <div class="flex items-center w-full px-5 py-8 overflow-hidden bg-white border-2 border-gray-200 rounded-md dark:bg-base-lvl-1 dark:border-gray-500 dark:text-gray-300">
        <i class="mr-2 text-blue-400 fa fa-stopwatch"></i>
        <span class="mr-2 font-bold text-blue-400">{{ tracksData.started }} </span> Started
        <span class="mx-2 font-bold text-green-500">{{ tracksData.finished }} </span> Finished
        <span class="mx-2 font-bold text-red-400">{{ tracksData.started - tracksData.finished }} </span> Stopped
      </div>
      <div class="flex items-center w-full px-5 py-8 overflow-hidden bg-white border-2 border-gray-200 rounded-md dark:bg-base-lvl-1 dark:border-gray-500 dark:text-gray-300">
        <i class="mr-2 text-green-500 fa fa-sticky-note"></i>
        <span class="mr-2 font-bold text-green-500">{{ tasksWorked.length }}</span>
        Tasks worked
      </div>
    </div>

    <div class="overflow-auto md:w-9/12">
      <ReportPomodoro
        :stats-by-day="statsByDay"
        :time-data="formattedWeek"
      />
    </div>
  </div>

  <!-- New reports grid -->
  <ReportProductivity
    :stats-by-day="statsByDay"
    :time-data="formattedWeek"
    :completed-by-day="completedByDay"
  />

  <ReportGoals
    :stats-by-day="statsByDay"
    :time-data="formattedWeek"
  />

  <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
    <ReportMatrixBalance :tracks="state.tracks" />
    <ReportStageDistribution />
  </div>
</div>
</template>

<style lang="scss">
.el-date-full .el-date-editor.el-input {
  width: 100% !important;
}

.dark {
  .el-input, .el-input__inner, .el-picker__popper.el-popper[role=tooltip], .el-date-picker {
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
