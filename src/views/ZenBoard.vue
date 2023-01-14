<template>
  <div class="pt-24 pb-20 mx-5 md:pt-28 md:mx-28">
    <div class="text-left md:flex">
      <div
        class="zen__view md:block md:w-8/12 md:mr-20"
        :class="[state.mobileMode == 'zen' ? 'block' : 'hidden']"
      >
        <div class="mt-5">
          <header class="items-center justify-between mb-2 overflow-hidden font-bold text-gray-400 md:flex">
            <h1 class="text-2xl">Lineup</h1>
  
            <div class="items-center h-10 md:flex">
              <input
                type="search"
                v-model.trim="searchText"
                class="h-10 px-2 text-sm border-2 border-gray-200 rounded-md w-44 focus:outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                placeholder="Search task"
              />
  
              <tags-select
                v-model="searchTags"
                :multiple="true"
                placeholder="Filter by tag"
                :tags="tags" 
                class="w-full h-full px-2 py-2 bg-white border-2 border-gray-200 rounded-md md:ml-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                :allow-add="false"
              /> 
            </div>
          </header>
  
          <div class="coming-up__list dark:divide-gray-600 dark:text-gray-300 divide-solid">
            <div class="mb-4 quick__add">
              <QuickAdd 
                @saved="addTask" 
                type="todo" 
                :allow-edit="true"
                ref="quickAdd" 
              />
            </div>
            <div class="pt-4">
              <div class="flex tab-header "> 
                <button 
                  class="px-2 py-1 font-bold text-gray-500 transition-all dark:bg-transparent dark:hover:bg-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 focus:outline-none" 
                  :class="[state.tabSelected=='todo' ? 'text-green-500 bg-gray-100' : 'dark:text-gray-300']"
                  @click="state.tabSelected='todo'"
                  > 
                    Todo ({{ state.todo.length }})
                </button>
                <button 
                  class="px-2 py-1 font-bold text-gray-500 transition-all dark:bg-transparent dark:hover:bg-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 focus:outline-none"
                  :class="[state.tabSelected=='schedule' ? 'text-blue-500 bg-gray-100': 'dark:text-gray-300'] "
                  @click="state.tabSelected='schedule'"
                  > 
                  Schedule ({{ state.schedule.length }})
                </button>
              </div>
              <TaskGroup
                v-if="state.tabSelected=='todo'"
                title="Todo"
                class="py-3"
                type="todo"
                placeholder="Click a task select"
                :show-title="false"
                :tasks="filteredTodos"
                :show-select="true"
                :show-controls="true"
                :current-task="currentTask"
                :current-timer="currentTimer"
                :is-item-as-handler="true"
                :use-external-done="true"
                :allow-run="true"
                @move="handleDragChanges($event, 'todo')"
                @clone="onClone"
                @deleted="destroyTask"
                @edited="setTaskToEdit"
                @selected="setCurrentTask"
                @toggle-timer="setCurrentTask($event, true)"
                @done="onDone"
                @down="moveTo($event, 'schedule')"
              />
  
              <TaskGroup
                v-if="state.tabSelected=='schedule'"
                title="Schedule"
                type="schedule"
                class="py-3"
                placeholder="Move task to todo to select"
                :show-title="false"
                :tasks="filteredSchedule"
                :active="false"
                :show-controls="true"
                :is-item-as-handler="true"
                @deleted="destroyTask"
                @edited="setTaskToEdit"
                @up="moveTo($event, 'todo')"
                @move="handleDragChanges($event, 'schedule')"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        class="zen__coming-up lineup md:block md:mt-0 md:w-4/12"
        :class="[state.mobileMode == 'lineup' ? 'block' : 'hidden']"
      >
        <SummarySider
          :matrix="matrixStore.matrix"
          :standup="[]"
          :committed="[]"
          :is-loaded="matrixStore.tasksLoaded"
        />
      </div>
    </div>

    <WelcomeModal
      :is-open="state.isWelcomeOpen"
      @closed="closeWelcomeModal"
    />

    <TaskModal
      v-model:is-open="state.isTaskModalOpen"
      :task-data="taskToEdit"
      @saved="onEditedTask"
      @closed="taskToEdit = null"
    />
    

    <!-- mobile nav -->
    <div class="fixed bottom-0 left-0 flex w-full h-10 text-white bg-gray-600 md:hidden">
      <div
        class="flex items-center justify-center w-full h-full my-auto text-xl font-bold text-center"
        :class="{ 'bg-gray-900': state.mobileMode == 'zen' }"
        @click="state.mobileMode = 'zen'"
      >
        Zen
      </div>
      <div
        class="flex items-center justify-center w-full h-full my-auto text-xl font-bold text-center"
        :class="{ 'bg-gray-900': state.mobileMode == 'lineup' }"
        @click="state.mobileMode = 'lineup'"
      >
        Lineup
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, nextTick, onUnmounted, reactive, ref, watch, toRefs } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox, ElNotification } from "element-plus";
import { useTaskFirestore } from "../_features/tasks";
import { useTrackFirestore } from "../_features/tracks";
import { firebaseState, registerEvent, updateSettings } from "../_features/app/useFirebase";
import { useMatrixStore } from "../_features/tasks/matrix";
import { useFuseSearch, useSearchOptions } from "../composables/useFuseSearch";
import { startFireworks } from "../composables/useConfetti";
import { useMagicKeys } from "@vueuse/core";

import TagsSelect from "../components/atoms/TagsSelect.vue"
import TaskGroup from "../components/organisms/TaskGroup.vue";
import QuickAdd from "../components/molecules/QuickAdd.vue";
import TimeTracker from "../components/organisms/TimeTracker.vue";
import TaskView from "../components/organisms/TaskView.vue";
import TaskTrackView from "../components/organisms/TaskTrackView.vue";
import WelcomeModal from "../components/organisms/modals/WelcomeModal.vue";
import TaskModal from "../components/organisms/modals/TaskModal.vue";

import { getNextIndex } from "../utils";
import { useGlobalTracker } from "../composables/useGlobalTracker";
import SummarySider from "../components/templates/SummarySider.vue";

const matrixStore = useMatrixStore()

const {
  saveTask,
  deleteTask,
  updateTask,
  getTaskByMatrix,
  updateTaskBatch,
} = useTaskFirestore();
const { getAllTracksOfTask } = useTrackFirestore();

nextTick(() => {});
// state and ui
const state = reactive({
  todo: [],
  schedule: [],
  showReminder: false,
  isWelcomeOpen: false,
  isTaskModalOpen: false,
  track: null,
  mobileMode: "zen",
  tabSelected: 'todo'
});

state.isWelcomeOpen = state.isWelcomeOpen || !firebaseState.settings || !firebaseState.settings.hide_welcome;

// search
const tags = inject("tags", []);
const { selectedTags, searchText, searchTags } = useSearchOptions()

const { schedule, todo } = toRefs(state);
const { filteredList: filteredSchedule } = useFuseSearch(searchText, schedule, selectedTags);
const { filteredList: filteredTodos } = useFuseSearch(searchText, todo, selectedTags);

// Current task
const { currentTask, currentTimer, setCurrentTask } = useGlobalTracker()

const onClone = (task) => {
  const data = state.todo.sort( (a, b) => a.created_at.toDate() < b.created_at.toDate() ? 1 : -1);
  setCurrentTask(data[0]);
}

// Edit task
const taskToEdit = ref({});
const setTaskToEdit = (task) => {
  taskToEdit.value = task;
  state.isTaskModalOpen = false;
  state.isTaskModalOpen = true;
};

const onEditedTask = (task) => {
  const index = state[task.matrix].findIndex((localTask) => localTask.uid == task.uid);
  state[task.matrix][index] = { ...task };
  taskToEdit.value = null;
};

watch(currentTask, (task) => {
  if (task.uid) {
    getAllTracksOfTask(task.uid).then((tracks) => {
      currentTask.value.tracks = tracks.map(track => {
        track.date_f = track.created_at.toDate()
        return track;
      }) || [];
    });
  }
}, { immediate: true });

const onDone = (task) => {
  task.tracks = [];
  delete task.duration_ms;

  updateTask(task).then(() => {
    if (state.todo.length) {
      currentTask.value = state.todo[0];
      updateSettings({
        last_task_uid: currentTask.value.uid,
      });
    } else {
      currentTask.value = {};
    }
    startFireworks();
  });
};

const onRemoved = () => {
  currentTask.value = {};
};

const onTaskUpdated = (task) => {
  const formData = { ...task };
  formData.tracks = [];
  delete task.duration_ms;

  updateTask(formData).then(() => {
    ElNotification({
      title: "Updated",
      message: "Task updated",
    });
  });
};


// Tasks manipulation
const getMatrix = (matrix) => {
  getTaskByMatrix(matrix).then((collectionRef) => {
    const unsubscribe = collectionRef.get().then((snap) => {
      state[matrix] = [];
      snap.forEach((doc) => {
        state[matrix].push({ ...doc.data(), uid: doc.id });
      });
    });

    return unsubscribe;
  });
};

const scheduleRef = ref(null);
const todoRef = ref(null);

todoRef.value = getMatrix("todo");
scheduleRef.value = getMatrix("schedule");


onUnmounted(() => {
  if (scheduleRef.value && todoRef.value) {
    scheduleRef.value();
    todoRef.value();
  }
});

const addTask = async (task) => {
  task.order = getNextIndex(state.todo);
  await saveTask(task);
  registerEvent('quick_task_added');
};

const destroyTask = async (task) => {
  const canDelete = await ElMessageBox.confirm(
    "Are you sure you want to delete this task?",
    "Delete Task"
  );
  if (canDelete) {
    deleteTask(task).then(() => {
      state[task.matrix] = state[task.matrix].filter(
        (localTask) => task.uid != localTask.uid
      );

      if (task.uid == currentTask.value.uid) {
        onRemoved();
      }

      ElNotification({
        type: "success",
        message: "Task deleted",
        title: "Task deleted",
      });
    });
  }
};

const moveTo = async (task, matrix) => {
  const oldMatrix = task.matrix;
  task.matrix = matrix;
  task.order = getNextIndex(state[oldMatrix]);
  updateTask(task).then(() => {
    ElNotification({
      type: "success",
      message: "Task moved",
      title: "Task moved",
    });
  });
};

const { push } = useRouter();
const closeWelcomeModal = () => {
  updateSettings({
    hide_welcome: true,
  }).then(() => {
    state.isWelcomeOpen = false;
    push({
      name: "planAhead",
    });
  });
};

// Drags
const handleDragChanges = async (e, matrix) => {
  // if (e.added) {
  //   e.added.element.matrix = matrix;
  //   updateTask(e.added.element).then(() => {
  //     ElNotification({
  //       message: `Moved to ${matrix}`,
  //     });
  //   });
  // }
  const ordered = state[matrix].map((task, index) => {
      task.order = index;
      return task;
  })
  console.clear()
  console.log(ordered.map(item => item.title));
  updateTaskBatch(ordered);
};

//  magic keys
const { Shift_k} = useMagicKeys();
const quickAdd = ref(null)
watch(Shift_k, () => {
    quickAdd.value.focus();
})
</script>

<style scoped>
.zen__datails {
  min-height: 400px;
}
</style>
