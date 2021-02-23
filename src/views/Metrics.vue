<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-28">
  <div class="section-header md:flex justify-between items-center mb-10">
      <h2 class="text-2xl font-bold text-gray-400 text-left">
         Metrics
      </h2>
      <div class="md:space-x-2 text-left md:flex">
          <div class="flex mt-2 md:mt-0 el-date-full">
            <el-date-picker
              v-model.lazy="state.date"
              type="date"
              input-class="ml-0"
            >
            </el-date-picker>
          </div>

          <DatePagerWeek next-mode="week" v-model="state.date" v-model:week="state.week"></DatePagerWeek>
      </div>
  </div> 

  <div class="flex bg-white pt-5 rounded-md shadow-md">
      <div class="space-y-4 bg-white w-3/12 px-5 pt-2 text-gray-400">
        <div class="font-bold text-gray-500 text-left  mb-10">
            General Stats
          </div>
        <div class="bg-white py-8 w-full flex items-center px-5 rounded-md border-2 border-gray-200 overflow-hidden">
          <i class="fa fa-clock mr-2 text-blue-400"></i>
          <span class="font-bold mr-2 text-blue-400">{{ formattedTime }}  </span>
          Total focused time
        </div>
        <div class="bg-white py-8 w-full flex items-center px-5 rounded-md border-2 border-gray-200 overflow-hidden">
          <i class="fa fa-stopwatch mr-2 text-blue-400"></i>
           <span class="font-bold mr-2 text-blue-400">{{  tracksData.started}}  </span> Started
           <span class="font-bold mx-2 text-green-500">{{  tracksData.finished }}  </span> Finished
           <span class="font-bold mx-2 text-red-400">{{  tracksData.started - tracksData.finished }}  </span> Stopped
        </div>

        <div class="bg-white py-8 w-full flex items-center px-5 rounded-md border-2 border-gray-200 overflow-hidden">
          <i class="fa fa-sticky-note mr-2 text-green-500"></i>
          <span class="font-bold mr-2 text-green-500">
            {{ tasksWorked.length }}
          </span>
          Tasks worked
        </div>
      </div>

      <!-- pomodoro stats -->
      <div class="w-9/12">
          <report-pomodoros
            :stats-by-day="statsByDay"
            :time-data="formattedWeek"
          />
      </div>
    <!-- pomodoro stats --> 
  </div>

  <!-- <div class="flex mt-10 space-x-10">
    
  
      <div class="w-9/12 bg-white pt-5 rounded-md shadow-md ">
          <report-tasks
            :stats-by-day="durationByTasks"
            :time-data="durationByTasks.map(task => task.description)"
          />
      </div>
  
      <div class="space-y-4 bg-white pt-5 rounded-md shadow-md w-3/12 px-5 text-gray-400">
        <div class="font-bold text-gray-500 text-left  mb-10">
            Tasks Stats
          </div>

        <div class="bg-white w-full flex items-start px-5 rounded-md text-left overflow-hidden" v-for="task in tasksWorked"  :key="task">
          <i class="fa fa-sticky-note mr-2 text-green-500 mt-1"></i>
          <span class="font-bold mr-2 text-green-500">
             {{ task }}
          </span>
        </div>
      </div>
  </div> -->
</div>
</template>

<script setup>
import { reactive, watch, ref, onUnmounted, computed } from 'vue'
import { useTaskFirestore } from '../utils/useTaskFirestore'
import { useTrackFirestore } from '../utils/useTrackFirestore'
import { useDateTime } from '../utils/useDateTime'
import { getMilliseconds } from '../utils/useTracker'
import TaskGroup from "../components/organisms/TaskGroup.vue"
import DatePagerWeek from "../components/molecules/DatePagerWeek.vue"
import ReportPomodoros from "../components/organisms/ReportPomodoros.vue"
import ReportTasks from "../components/organisms/ReportTasks.vue"
import { format } from 'date-fns'
// state and ui
const state = reactive({
  committed: [],
  tracks: [],
  week: [],
  date: new Date(),
  search: "",
  sections: ['Overview'], // 'Tasks', 'Time Traking'
  selectedSection: 'Overview',
})

// tasks manipulation
const  { getCommitedTasks } = useTaskFirestore()
watch(() => state.date , () => {
  getCommitedTasks(state.date).then(tasks => {
    state.committed = tasks;
  })
}, { immediate: true })

// Current task
const  { getAllTracksOfTask, getTracksByDates } = useTrackFirestore()
const currentTask = ref({});
const setCurrentTask = (task) => {
  currentTask.value = task
}

watch(currentTask, () => {
  if (currentTask.value.uid) {
    getAllTracksOfTask(currentTask.value.uid).then((tracks) => {
      currentTask.value.tracks = tracks || []

      currentTask.value.data = [
        tracks.length,
        tracks.filter( track => track.completed).length
      ]
    })
  }
})

const trackRef = ref(null);

watch(() => state.week, (week) => {
  trackRef.value =  getTracksByDates(week[0], week[6]).then(collectionRef => {
  collectionRef.get().then(querySnapshot => {
      state.tracks = []
      querySnapshot.forEach((doc) => {
          state.tracks.push({...doc.data(), uid: doc.id });
      });
  })
  return collectionRef;
})
})


const {  formatDurationFromMs, formatDate } = useDateTime()

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
        const date = formatDate(new Date(track.started_at.toDate()), "yyyy-MM-dd");

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
  return state.week.map((date) => {
    const stat = tracksGroup.value[format(date, 'yyyy-MM-dd')]
    return stat || null
  })
})

const tasksWorked = computed(() => {
  const tasks = statsByDay.value.reduce((tasks, day) => {
    if (day) {
      return [...tasks, ...Object.keys(day.tasks)]
    } else {
      return tasks
    }
  }, [])

  return Array.from(new Set(tasks));
})

const durationByTasks = computed(() => {
  const tasks = {} 

    state.tracks.forEach((track) => {
       if(!tasks[track.task_uid]) {
         tasks[track.task_uid] = {
            id: `group-${track.uid}`,
            description: track.description,
            tracks: [track],
            started: 1,
            finished: Number(track.completed || 0),
            duration_ms: Number(track.duration_ms || 0)
        };
      } else {
        tasks[track.task_uid].tracks.push(track);
        tasks[track.task_uid].description = track.description;
        tasks[track.task_uid].started += 1
        tasks[track.task_uid].finished += Number(track.completed)
        tasks[track.task_uid].duration_ms += track.duration_ms
      }
  })

  return Object.values(tasks)
})

const formattedWeek = computed(() => {
  return state.week.map((date) => {
    return format(date, "iii, MMM dd");
  })
})

onUnmounted(() => {
  // trackRef.value && trackRef.value()
});

</script>

<style lang="scss">
.el-date-full .el-date-editor.el-input {
  width: 100% !important;
}
</style>