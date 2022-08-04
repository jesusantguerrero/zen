<template>
  <div class="pt-24 pb-20 mx-5 md:pt-28 md:mx-28">
    <div class="text-left md:flex">
      <div
        class="zen__view md:block md:w-8/12 md:mr-20"
        :class="[state.mobileMode == 'zen' ? 'block' : 'hidden']"
      >
        <header>
          <div class="flex items-center text-2xl font-bold text-gray-400 md:block dark:text-gray-300">
            <h1 class="inline-block"> Dashboard </h1>
        
            <button 
              class="p-2 ml-5 text-sm font-bold bg-white border rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white hover:shadow-md focus:outline-none"
              @click="$emit('update', false)"
            >
                <i class="fa fa-chevron-left"></i>
              Legacy Home Screen
            </button>
          </div>

          <div class="flex justify-between mt-5">
            <tab-header v-model="state.tabSelected" :tabs="state.tabs" class="overflow-hidden rounded-md"/>

            <div class="flex space-x-2 itemx-center">
              <div class="items-center h-10 md:flex">
                <input
                  type="search"
                  v-model.trim="searchOptions.text"
                  class="h-10 px-2 text-sm border-2 border-gray-200 rounded-md w-44 dark:bg-gray-900 dark:border-gray-500 dark:text-gray-300 focus:outline-none"
                  placeholder="Search task"
                />

                <tags-select
                  v-model="searchOptions.tags"
                  :multiple="true"
                  placeholder="Filter by tag"
                  :tags="tags"
                  class="w-full h-full px-2 py-2 bg-white border-2 border-gray-200 rounded-md md:ml-2 dark:bg-gray-900 dark:border-gray-500"
                  :allow-add="false"
                />
              </div>
              <router-link 
                  to="/plan-ahead" 
                  class="flex items-center px-5 mr-2 text-white bg-green-500 rounded-md ring ring-green-400 ring-offset-0 hover:bg-green-400">
                  <i class="mr-2 fa fa-tasks"></i>
                  Plan Ahead
              </router-link>
            </div>
          </div>
        </header>

        <div class="mt-5">
          <TimeTrackerWrapper
              ref="TimeTracker"
              class="justify-center py-5 bg-white border rounded-md shadow-md dark:bg-gray-700 dark:border-gray-500" 
              :task="currentTask" 
              :toggle-size="true"
              v-model:timer="currentTimer"
            />
          <QuickAdd
            @saved="addTask"
            type="todo"
            :allow-edit="true"
          />
          <TaskGroup
            v-if="state.tabSelected == 'todo'"
            :show-title="false"
            title="Todo"
            class="py-3"
            type="todo"
            placeholder="Click a task select"
            :allow-select="false"
            :tasks="state.todo"
            :search="searchOptions.text"
            :show-select="true"
            :show-controls="true"
            :current-task="currentTask"
            :current-timer="currentTimer"
            :is-item-as-handler="true"
            :allow-run="true"
            :tags="selectedTags"
            @toggle-timer="setCurrentTask"
            @change="handleDragChanges"
            @deleted="destroyTask"
            @edited="setTaskToEdit"
            @down="moveTo($event, 'schedule')"
          />

          <TaskGroup
            v-if="state.tabSelected == 'schedule'"
            :show-title="false"
            title="Schedule"
            :tasks="state.schedule"
            :tags="selectedTags"
            :active="false"
            :show-controls="true"
            :search="searchOptions.text"
            type="schedule"
            class="py-3"
            placeholder="Move task to todo to select"
            :is-item-as-handler="true"
            @deleted="destroyTask"
            @edited="setTaskToEdit"
            @up="moveTo($event, 'todo')"
            @change="handleDragChanges"
          />
        </div>
      </div>

      <div
        class="zen__comming-up lineup md:block md:mt-0 md:w-4/12"
        :class="[state.mobileMode == 'lineup' ? 'block' : 'hidden']"
      >
        <header
          class="items-center justify-between mb-2 overflow-hidden font-bold text-gray-400 md:flex dark:text-gray-300"
        >
          <h1 class="text-2xl">Tools</h1>
        </header>

        <div class="space-y-2 divide-gray-200 comming-up__list divide-solid">
          <background-icon-card
            class="text-white bg-blue-400 dark:bg-blue-600 h-36"
            icon="fas fa-clock"
            value="Quick Standup"
          >
            <template #action>
              <Button class="bg-blue-500 dak:bg-blue-700"> Go to standup </Button>
            </template>
          </background-icon-card>

          <background-icon-card
            class="text-white bg-gray-700 h-36"
            icon="fas fa-border-all"
            value="Overview"
          >
            <template #action>
              <Button class="bg-gray-800" @click="$router.push({name: 'overview'})"> Go to overview </Button>
            </template>
          </background-icon-card>
        </div>
      </div>
    </div>

    <welcome-modal
      :is-open="state.isWelcomeOpen"
      @closed="closeWelcomeModal"
    />

    <task-modal
      v-model:is-open="state.isTaskModalOpen"
      :task-data="taskToEdit"
      @saved="onEditedTask"
      @closed="taskToEdit = null"
    />
  </div>
</template>

<script setup>
import {
  inject,
  nextTick,
  onUnmounted,
  reactive,
  ref,
  watch,
  computed,
} from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox, ElNotification } from "element-plus";
import { useTaskFirestore } from "../../utils/useTaskFirestore";
import { useTrackFirestore } from "../../utils/useTrackFirestore";
import { firebaseState, updateSettings } from "../../utils/useFirebase";
import { startFireworks } from "../../utils/useConfetti";
import TagsSelect from "../../components/atoms/TagsSelect.vue";
import TabHeader from "../../components/atoms/TabHeader.vue";
import Button from "../../components/atoms/Button.vue";
import TaskGroup from "../../components/organisms/TaskGroup.vue";
import QuickAdd from "../../components/molecules/QuickAdd.vue";
import BackgroundIconCard from "../../components/molecules/BackgroundIconCard.vue";
import TimeTrackerWrapper from "../../components/organisms/TimeTrackerWrapper.vue";
import WelcomeModal from "../../components/organisms/modals/WelcomeModal.vue";
import TaskModal from "../../components/organisms/modals/TaskModal.vue";
import { useGlobalTracker } from "../../utils/useGlobalTracker";

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
  mobileMode: "zen",
  tabSelected: "todo",
  tabs: [
    {
      label: "Todo",
      name: "todo",
      focusClass: "text-green-400",
    },
    {
      label: "Schedule",
      name: "schedule",
      focusClass: "text-green-400",
    },
  ],
});

state.isWelcomeOpen =
  state.isWelcomeOpen ||
  !firebaseState.settings ||
  !firebaseState.settings.hide_welcome;

const toggleReminder = () => {
  state.showReminder = !state.showReminder;
};

// search
const searchOptions = reactive({
  text: "",
  tags: [],
});
const selectedTags = computed(() => {
  return searchOptions.tags.map((tag) => tag.uid);
});

const tags = inject("tags", []);

// Edit task
const taskToEdit = ref({});
const setTaskToEdit = (task) => {
  taskToEdit.value = task;
  state.isTaskModalOpen = false;
  state.isTaskModalOpen = true;
};

const onEditedTask = (task) => {
  const index = state[task.matrix].findIndex(
    (localTask) => localTask.uid == task.uid
  );
  state[task.matrix][index] = { ...task };
  taskToEdit.value = null;
};

// Current task
const { currentTask, currentTimer, setCurrentTask } = useGlobalTracker()

const setLastUsedTask = () => {
  if (firebaseState.settings && firebaseState.settings.last_task_uid) {
    const lastTask = state.todo.find(
      (task) => task.uid == firebaseState.settings.last_task_uid
    );
    if (lastTask) {
      setCurrentTask(lastTask);
    }
  }
};

watch(currentTask, () => {
  if (currentTask.value.uid) {
    getAllTracksOfTask(currentTask.value.uid).then((tracks) => {
      currentTask.value.tracks =
        tracks.map((track) => {
          track.date_f = track.created_at.toDate();
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
  return Math.max(...list.map((item) => Number(item.order || 0))) + 1;
};

const addTask = (task) => {
  task.order = getNextIndex(state.todo);
  saveTask(task);
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
