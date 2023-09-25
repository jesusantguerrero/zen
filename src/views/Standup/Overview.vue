<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-28 mb-28">
  <div class="items-center justify-between mb-10 section-header md:flex">
      <h2 class="flex items-center text-2xl font-bold text-left text-gray-400 dark:text-white">
         <span> Standup </span>
         <span class="ml-2 text-lg text-green-500">{{ state.humanDate }}</span>
         <IntegrationProjects />
      </h2>
      <SearchBar
        v-model="state.searchText"
        v-model:date="state.date"
        v-model:tags="state.tags"
        v-model:selectedTags="state.selectedTags"
      />
  </div> 

  <div v-for="dateGroup in committedByDate" class="mb-4">
     <h4 class="block mb-2 font-bold text-left text-gray-500 dark:text-white capitalize md:text-xl">
        ✅ {{ getCommitTitle(dateGroup.date) }} ({{ dateGroup.list.length }}) 
    </h4>
    <TaskItem 
        v-for="(task) in dateGroup.list"
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
    >
      <template #append-actions>
        <AtButton 
          v-if="!isYesterday(parseISO(task.commit_date))" 
          class="flex items-center h-6 px-2 ml-2 text-xs font-bold text-white transition-colors bg-gray-600 rounded-md hover:bg-gray-500"
          @click="commitAsYesterday(task)"
        >
          To yesterday
        </AtButton>
        <AtButton 
          v-else 
          class="flex items-center h-6 px-2 ml-2 text-xs font-bold text-white transition-colors bg-gray-600 rounded-md hover:bg-gray-500"
          @click="commitAsToday(task)"
        >
          To today
        </AtButton>
      </template>
    </TaskItem> 
  </div>

  <div class="w-8/12 mx-auto mt-10 text-center md:w-6/12" v-if="!state.committed.length && state.isFirstLoaded">
    <img src="../assets/undraw_following.svg" class="mx-auto w-12/12 md:w-5/12"> 
    <div class="mt-10 font-bold text-gray-500 md:mt-5 dark:text-gray-300"> There's no tasks</div>
  </div>
  
  <h5 class="block mt-5 mb-2 font-bold text-left text-gray-500 dark:text-white capitalize md:text-lg">
    ⏳ Worked on ({{ trackedUnfinished.length }}) 
  </h5>
  <div v-for="track in trackedUnfinished">
    <TaskItem
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
    >
    <template #append-actions>
        <AtButton
        class="flex items-center h-6 px-2 ml-2 text-xs font-bold text-white transition-colors bg-gray-600 rounded-md hover:bg-gray-500"
        @click="commitTrackTaskAsToday(track)"
      >
        Finish
      </AtButton>
    </template>
    </TaskItem>
  </div>

  <h5 class="block mt-5 mb-2 font-bold text-left text-gray-500 dark:text-white capitalize md:text-lg">
    ✨ Suggested for today  ({{ state.suggestions.length }}) 
  </h5>
  <div v-for="task in state.suggestions">
    <TaskItem
      :task="task" 
      type="schedule"
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
</div>

</template>

<script setup>
import { reactive, watch, onUnmounted, computed, toRefs } from 'vue'
import { format, formatRelative, isYesterday, parseISO, startOfDay, startOfToday, startOfYesterday, subDays } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { AtButton } from "atmosphere-ui";

import SearchBar from "@/components/molecules/SearchBar.vue"
import TaskItem from '@/components/molecules/TaskItem.vue'
import IntegrationProjects from '@/components/organisms/IntegrationProjects.vue'

import { useTrackFirestore } from '@/utils/useTrackFirestore'
import { useTaskFirestore } from '@/utils/useTaskFirestore'
import { useSnapshot } from '@/utils/firebase/useSnapshot'
import { formatDate } from '@/utils';
import { track } from '@vue/reactivity';
import { ElNotification } from 'element-plus';

// state and ui
const state = reactive({
  isFirstLoaded: false,
  committed: [],
  firebaseRefs: {},
  tracked: [],
  suggestions: [],
  searchText: "",
  tags: [],
  date: startOfDay(new Date()),
  selectedTags: [],
  humanDate: computed(() => {
    return format(state.date, 'dd LLL, yyyy')
  }),
})

// tasks manipulation
const getCommitTitle = (dateString) => {
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
    
    const dateName = formatRelative(parseISO(dateString), new Date(), { locale });
    return `${dateName} I finished:`
  }

const  { getCommittedTasks, updateTask } = useTaskFirestore()
const fetchCommitted = (date) => {
  const {committed } = toRefs(state);
  state.firebaseRefs.committedRef =  useSnapshot(getCommittedTasks(date), committed, {
    after() {
      state.isFirstLoaded = true;
    }
  })
}

const committedByDate = computed(() => {
  return state.committed.reduce((byDate, task) => {
    if (!byDate[task.commit_date]) {
      byDate[task.commit_date] = {
        date: task.commit_date,
        list: [task],
      }
    } else {
      byDate[task.commit_date].list.push(task);
    }
    return byDate;
  }, {})
})

// tracked tasks
const  { getTracksByDates } = useTrackFirestore()
const fetchTracked = (date) => {
  const startDate = subDays(startOfDay(date), 1);
  const doneTasks = state.committed.map(task => task.title)
  const { tracked } = toRefs(state);

  state.firebaseRefs.trackedRef = useSnapshot(getTracksByDates(startDate, date), tracked, {
    validator: (track) => !doneTasks.includes(track.description),
    parser: (list) => {
      return list.reduce((acc, cur) => {
        const index = acc.findIndex(item => item.description === cur.description)
        if (index === -1) {
          acc.push(cur)
        } else {
          acc[index].duration_ms += cur.duration_ms
        }
        return acc
      }, [])
    }
  })
}

const trackedUnfinished = computed(() => {
  const doneTasks = state.committed.map(task => task.title);
  return state.tracked.filter(track => !doneTasks.includes(track.description));
})

// suggestions [todo + schedule]
const { getTaskByMatrix } = useTaskFirestore();
const fetchSuggestions = (date) => {
  const { suggestions } = toRefs(state);
  state.firebaseRefs.suggestionsRef = useSnapshot(getTaskByMatrix('todo'), suggestions);
}

watch(() => state.date , async () => {
 await fetchCommitted(state.date);
 await fetchTracked(state.date)
 await fetchSuggestions(state.date)
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

const commitAsYesterday = (task) => {
  updateTask({
    ...task,
    commit_date: formatDate(startOfYesterday(), 'yyyy-MM-dd'),
  });
};

const commitAsToday = (task) => {
  updateTask({
    ...task,
    commit_date: formatDate(startOfToday(), 'yyyy-MM-dd'),
  });
};

const commitTrackTaskAsToday = (track) => {
  updateTask({
    uid: track.task_uid,
    commit_date: formatDate(startOfToday(), 'yyyy-MM-dd'),
  }).then(() => {
    ElNotification({
      title: 'State changed',
      message: 'Committed',
    })
  }).catch(() => {
    ElNotification({
      title: 'State change failed',
      message: 'The change has failed',
    })
  });
};

const parseTrack = (track) => {
  return {
    duration_ms: track.duration_ms,
    done: false,
    commit_date: null,
    uid: track.uid,
    task_id: track.task_id,
    tags: [],
    title: track.description,
    type: 'todo',
    tracks: [track]
  }
}

onUnmounted(() => {
  Object.values(state.firebaseRefs).forEach( fbRef => {
    if (fbRef) {
      try {
        fbRef()
      } catch (err) {
        // not exists
      }
    }
  })
});
</script>