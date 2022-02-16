<template>
  <div class="pt-24 pb-20 mx-5 md:pt-28 md:mx-28">
    <div class="text-left md:flex">
      <div
        class="zen__view md:block md:w-8/12 md:mr-20"
        :class="[state.mobileMode == 'zen' ? 'block' : 'hidden']"
      >
        <header class="flex justify-between">
          <h1 class="text-2xl font-bold text-gray-400 md:block dark:text-gray-300">
            Main task
          </h1>

          <time-tracker 
            :task="currentTask" 
            v-model:currentTimer="currentTimer"
          />
        </header>

        <div class="mt-5">
          <quick-add
            v-if="state.showReminder"
            mode="reminder"
            type="reminder"
            class="zen__reminder"
            title="Things bear in mind after the zen"
            placeholder="Add a reminder"
          />

          <task-view
            :task-data="currentTask"
            :current-timer="currentTimer"
            @done="onDone"
            @removed="onRemoved"
            @updated="onTaskUpdated"
          >
            <template #empty v-if="!currentTask.title">
              <div class="w-8/12 mx-auto mt-10 text-center md:w-6/12">
                <img
                  src="../../assets/undraw_following.svg"
                  class="mx-auto w-12/12 md:w-7/12"
                />
                <div class="mt-10 font-bold text-gray-500 md:mt-5 dark:text-gray-300">
                  Go to
                  
                  <router-link to="/plan-ahead" class="mr-1 text-green-400 transition-colors border-dashed cursor-pointer font-bolder dark:text-green-500 dark:hover:text-green-400 hover:text-green-500"
                    >
                    <i class="fa fa-tasks"></i>
                    Plan Ahead
                    </router-link> or select item from 
                    <span class="text-gray-400 border-gray-400 font-bolder dark:text-white"
                    >Todo
                    <i class="fa fa-arrow-right"></i>
                  </span>
                </div>
              </div>
            </template>
          </task-view>
          <task-track-view :task="currentTask" :current-timer="currentTimer">
          </task-track-view>
        </div>
      </div>

      <div
        class="zen__comming-up lineup md:block md:mt-0 md:w-4/12"
        :class="[state.mobileMode == 'lineup' ? 'block' : 'hidden']"
      >
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

        <div class="divide-y-2 divide-gray-200 comming-up__list dark:divide-gray-600 dark:text-gray-300 divide-solid">
          <div class="mb-4 quick__add">
            <quick-add @saved="addTask" type="todo" :allow-edit="true" />
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
            <task-group
              v-if="state.tabSelected=='todo'"
              :show-title="false"
              title="Todo"
              class="py-3"
              :tasks="filteredTodos"
              :show-select="true"
              :show-controls="true"
              :current-task="currentTask"
              :current-timer="currentTimer"
              :is-item-as-handler="true"
              :use-external-done="true"
              type="todo"
              placeholder="Click a task select"
              @change="handleDragChanges"
              @clone="onClone"
              @deleted="destroyTask"
              @edited="setTaskToEdit"
              @selected="setCurrentTask"
              @done="onDone"
              @down="moveTo($event, 'schedule')"
            >
            </task-group>

            <task-group
              v-if="state.tabSelected=='schedule'"
              :show-title="false"
              title="Schedule"
              :tasks="filteredSchedule"
              :active="false"
              :show-controls="true"
              type="schedule"
              class="py-3"
              placeholder="Move task to todo to select"
              :is-item-as-handler="true"
              @deleted="destroyTask"
              @edited="setTaskToEdit"
              @up="moveTo($event, 'todo')"
              @change="handleDragChanges"
            >
            </task-group>
          </div>
        </div>
      </div>
    </div>

    <welcome-modal
      :is-open="state.isWelcomeOpen"
      @closed="closeWelcomeModal"
    ></welcome-modal>

    <task-modal
      v-model:is-open="state.isTaskModalOpen"
      :task-data="taskToEdit"
      @saved="onEdittedTask"
      @closed="taskToEdit = null"
    >
    </task-modal>

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
import { useTaskFirestore } from "../../utils/useTaskFirestore";
import { useTrackFirestore } from "../../utils/useTrackFirestore";
import { firebaseState, registerEvent, updateSettings } from "../../utils/useFirebase";
import { useFuseSearch, useSearchOptions } from "../../utils/useFuseSearch";
import { startFireworks } from "../../utils/useConfetti";
import TagsSelect from "../../components/atoms/TagsSelect.vue"
import TaskGroup from "../../components/organisms/TaskGroup.vue";
import QuickAdd from "../../components/molecules/QuickAdd.vue";
import TimeTracker from "../../components/organisms/TimeTracker.vue";
import TaskView from "../../components/organisms/TaskView.vue";
import TaskTrackView from "../../components/organisms/TaskTrackView.vue";
import WelcomeModal from "../../components/organisms/modals/WelcomeModal.vue";
import TaskModal from "../../components/organisms/modals/TaskModal.vue";

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
  isTimeTrackerModalOpen: true,
  track: null,
  mobileMode: "zen",
  tabSelected: 'todo'
});

state.isWelcomeOpen = state.isWelcomeOpen || !firebaseState.settings || !firebaseState.settings.hide_welcome;

const toggleReminder = () => {
  state.showReminder = !state.showReminder;
};

// search
const tags = inject("tags", []);
const { selectedTags, searchText, searchTags } = useSearchOptions()

const { schedule, todo } = toRefs(state);
const { filteredList: filteredSchedule } = useFuseSearch(searchText, schedule, selectedTags);
const { filteredList: filteredTodos } = useFuseSearch(searchText, todo, selectedTags);

// Current task
const currentTask = ref({});
const setCurrentTask = (task) => {
  currentTask.value = task;
};

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

const onEdittedTask = (task) => {
  const index = state[task.matrix].findIndex((localTask) => localTask.uid == task.uid);
  state[task.matrix][index] = { ...task };
  taskToEdit.value = null;
};

const setLastUsedTask = () => {
  if (firebaseState.settings && firebaseState.settings.last_task_uid) {
    const lastTask = state.todo.find((task) => task.uid == firebaseState.settings.last_task_uid);
    if (lastTask) {
      setCurrentTask(lastTask);
    }
  }
}

watch(currentTask, () => {
  if (currentTask.value.uid) {
    getAllTracksOfTask(currentTask.value.uid).then((tracks) => {
      currentTask.value.tracks = tracks.map(track => {
        track.date_f = track.created_at.toDate()
        return track;
      }) || [];
    });
  }
});

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

// Timer
const currentTimer = ref({});

// Tasks manipulation
const getMatrix = (matrix) => {
  getTaskByMatrix(matrix).then((collectionRef) => {
    const unsubscribe = collectionRef.onSnapshot((snap) => {
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
const committed = ref(null);

todoRef.value = getMatrix("todo");
scheduleRef.value = getMatrix("schedule");


onUnmounted(() => {
  if (scheduleRef.value && todoRef.value) {
    scheduleRef.value();
    todoRef.value();
  }
});

const getNextIndex = (list) => {
  const index = Math.max(...list.map((item) => Number(item.order || 0))) + 1;
  return index < 0 ? 0 : index;
}

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
const handleDragChanges = (e, matrix) => {
  if (e.added) {
    e.added.element.matrix = matrix;
    updateTask(e.added.element).then(() => {
      ElNotification({
        message: `Moved to ${matrix}`,
      });
    });
  }

  if (e.moved) {
    updateTaskBatch(
      state[e.moved.element.matrix].map((task, index) => {
        task.order = index;
        return task;
      })
    );
  }
};
</script>

<style scoped>
.zen__datails {
  min-height: 400px;
}
</style>
