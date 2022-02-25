<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-28">
  <div class="items-center justify-between mb-10 section-header md:flex">
      <h2 class="text-2xl font-bold text-left text-gray-400">
         Standup <span class="text-lg text-green-500">{{ state.humanDate }}</span>
      </h2>
      <search-bar
        v-model="state.searchText"
        v-model:date="state.date"
        v-model:tags="state.tags"
        v-model:selectedTags="state.selectedTags"
      />
  </div> 

  <div class="md:flex">
    <div class="w-full">
        <task-group
            title="Committed tasks"
            type="backlog"
            :search="state.searchText"
            :tags="state.selectedTags"
            :tasks="state.committed"
            :show-controls="false"
            :current-task="currentTask"
            @selected="setCurrentTask"
            @undo="onUndo"
            color="text-gray-400"
            :max-height="0"
            :is-quadrant="true"
          >
            <template #empty v-if="!state.committed.length">
            <div class="w-8/12 mx-auto mt-10 text-center md:w-6/12">
              <img src="../assets/undraw_following.svg" class="mx-auto w-12/12 md:w-5/12"> 
              <div class="mt-10 font-bold text-gray-500 md:mt-5 dark:text-gray-300"> There's no tasks</div>
            </div>
          </template>
        </task-group>
    </div>
  </div>
</div>

</template>

<script setup>
import { reactive, watch, ref, onUnmounted, computed } from 'vue'
import { useTaskFirestore } from '../utils/useTaskFirestore'
import { useTrackFirestore } from '../utils/useTrackFirestore'
import TaskGroup from "../components/organisms/TaskGroup.vue"
import SearchBar from "../components/molecules/SearchBar.vue"
import { format, startOfDay, subDays } from 'date-fns'
// state and ui
const state = reactive({
  committed: [],
  committedRef: null,
  searchText: "",
  tags: [],
  date: subDays(startOfDay(new Date()), 1),
  selectedTags: [],
  humanDate: computed(() => {
    return format(state.date, 'dd LLL, yyyy')
  }),
})

// tasks manipulation
const  { getCommittedTasks, updateTask } = useTaskFirestore()
const fetchCommitted = (date) => {
  getCommittedTasks(date).then(committedRef => {
    state.committedRef = committedRef.onSnapshot( snap => {
      const list = []
      snap.forEach(doc => {
        list.push({ ...doc.data(), uid: doc.id })
      })
      state.committed = list;
    })
  })
}

watch(() => state.date , () => {
 fetchCommitted(state.date);
}, { immediate: true })

// Current task
const  { getAllTracksOfTask } = useTrackFirestore()
const currentTask = ref({});
const setCurrentTask = (task) => {
  currentTask.value = task
}

const onUndo = (task) => {
  task.tracks = [];
  task.commit_date = null;
  task.done = false;
  delete task.duration_ms;

  updateTask(task).then(() => {
    state.committed = state.committed.filter(localTask => task.uid != localTask.uid);
  })
};

onUnmounted(() => {
  if (state.committedRef) {
    state.committedRef()
  }
});

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
</script>