<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-28">
  <div class="items-center justify-between mb-10 section-header md:flex">
      <h2 class="text-2xl font-bold text-left text-gray-400 flex items-center">
         <span> Standup </span>
         <span class="text-lg text-green-500 ml-2">{{ state.humanDate }}</span>
         <integration-projects />
      </h2>
      <search-bar
        v-model="state.searchText"
        v-model:date="state.date"
        v-model:tags="state.tags"
        v-model:selectedTags="state.selectedTags"
      />
  </div> 

  <div class="">
     <h4 class="block mb-2 font-bold text-left text-gray-500 capitalize md:text-xl">
         {{ state.committedTitle }} ({{ state.committed.length }}) 
    </h4>
    <task-item 
        v-for="(task, index) in state.committed"
        :task="task"
        :handle-mode="false"
        :show-select="false"
        :show-controls="false"
        :is-item-as-handler="false"
        :is-compact="true"
        :class="''"
        :allow-run="false"
        :allow-update="false"
        @undo="onUndo(task)"
      />
       
    <div class="w-8/12 mx-auto mt-10 text-center md:w-6/12" v-if="!state.committed.length && state.isFirstLoaded">
      <img src="../assets/undraw_following.svg" class="mx-auto w-12/12 md:w-5/12"> 
      <div class="mt-10 font-bold text-gray-500 md:mt-5 dark:text-gray-300"> There's no tasks</div>
    </div>
    
    <h5 class="block mt-5 mb-2 font-bold text-left text-gray-500 capitalize md:text-lg">
        worked on ({{ state.tracked.length }}) 
    </h5>
    <div v-for="track in state.tracked">
      <task-item
        :task="parseTrack(track)" 
        type="backlog"
        :handle-mode="false"
        :show-select="false"
        :show-controls="false"
        :is-item-as-handler="false"
        :is-compact="true"
        :class="''"
        :allow-run="false"
        :allow-update="false"
      />
    </div>

    <!-- <h5 class="block mt-5 mb-2 font-bold text-left text-green-500 capitalize md:text-lg">
        Suggestions ({{ state.suggestions.length }}) 
    </h5>
    <div v-for="track in state.tracked">
      <task-item
        :task="parseTrack(track)" 
        type="backlog"
        :handle-mode="false"
        :show-select="false"
        :show-controls="false"
        :is-item-as-handler="false"
        :is-compact="true"
        :class="''"
        :allow-run="false"
        :allow-update="false"
      />
    </div> -->
  </div>
</div>

</template>

<script setup>
import { reactive, watch, onUnmounted, computed } from 'vue'
import { useTaskFirestore } from '../utils/useTaskFirestore'
import { useTrackFirestore } from '../utils/useTrackFirestore'
import SearchBar from "../components/molecules/SearchBar.vue"
import { format, formatRelative, startOfDay, subDays } from 'date-fns'
import { enUS } from 'date-fns/locale'
import TaskItem from '../components/molecules/TaskItem.vue'
import IntegrationProjects from '../components/organisms/IntegrationProjects.vue'

// state and ui
const state = reactive({
  isFirstLoaded: false,
  committed: [],
  committedRef: null,
  tracked: [],
  trackedRef: null,
  suggestions: [],
  suggestionsRef: null,
  searchText: "",
  tags: [],
  date: subDays(startOfDay(new Date()), 1),
  selectedTags: [],
  committedTitle: computed(() => { 
    const relativeLocale = {
        lastWeek: "'Last' eeee",
        yesterday: "'Yesterday'",
        today: "'Today'",
        tomorrow: "'Tomorrow'",
        nextWeek: "'Next' eeee",
        other: 'dd.MM.yyyy',
    }   
    const locale = {
      ...enUS,
      formatRelative: (token) => relativeLocale[token]
    }
    
    const dateName = formatRelative(state.date, new Date(), { locale });
    return `${dateName} I finished:`
  }),
  humanDate: computed(() => {
    return format(state.date, 'dd LLL, yyyy')
  }),
})

// tasks manipulation
const  { getCommittedTasks, updateTask, getTaskByMatrix } = useTaskFirestore()
const fetchCommitted = (date) => {
  return getCommittedTasks(date).then(committedRef => {
    state.committedRef = committedRef.onSnapshot( snap => {
      const list = []
      snap.forEach(doc => {
        list.push({ ...doc.data(), uid: doc.id })
      })
      state.isFirstLoaded = true;
      state.committed = list;
    })
  })
}

// tracked tasks
const  { getTracksByDates } = useTrackFirestore()
const fetchTracked = (date) => {
  const doneTasks = state.committed.map(task => task.title)
  console.log(doneTasks)
  return getTracksByDates(date).then(trackedRef => {
    state.trackedRef = trackedRef.onSnapshot( snap => {
      const list = []
      snap.forEach(doc => {
        const track = doc.data()
        if (!doneTasks.includes(track.description)) {
          list.push({ ...track, uid: doc.id })
        }
      })
      state.tracked = list.reduce((acc, cur) => {
        const index = acc.findIndex(item => item.description === cur.description)
        if (index === -1) {
          acc.push(cur)
        } else {
          acc[index].duration += cur.duration
        }
        return acc
      }, [])
    })
  })
}

// suggestions [todo + schedule]
const fetchSuggestions = (date) => {
  const doneTasks = state.committed.map(task => task.title)
  console.log(doneTasks)
  return getTracksByDates(date).then(trackedRef => {
    state.trackedRef = trackedRef.onSnapshot( snap => {
      const list = []
      snap.forEach(doc => {
        const track = doc.data()
        if (!doneTasks.includes(track.description)) {
          list.push({ ...track, uid: doc.id })
        }
      })
      state.tracked = list
    })
  })
}

watch(() => state.date , async () => {
 await fetchCommitted(state.date);
}, { immediate: true })

watch(() => state.committed , async () => {
 await fetchTracked(state.date)
}, { immediate: true })

const onUndo = (task) => {
  task.tracks = [];
  task.commit_date = null;
  task.done = false;
  delete task.duration_ms;

  updateTask(task).then(() => {
    state.committed = state.committed.filter(localTask => task.uid != localTask.uid);
  })
};

const parseTrack = (track) => {
  return {
    duration_ms: track.duration_ms,
    done: false,
    commit_date: null,
    uid: track.uid,
    tags: [],
    title: track.description,
    type: 'todo',
    tracks: [track]
  }
}

onUnmounted(() => {
  if (state.committedRef) {
    state.committedRef()
    state.trackedRef()
  }
});
</script>