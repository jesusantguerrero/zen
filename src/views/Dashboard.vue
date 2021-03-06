<template>
  <div class="pt-24 md:pt-28 pb-20 mx-5 md:mx-28">
    <div class="text-left md:flex">
      <div
        class="zen__view md:block md:w-8/12 md:mr-20"
        :class="[state.mobileMode == 'zen' ? 'block' : 'hidden']"
      >
        <header>
          <div class="md:block text-2xl font-bold text-gray-400 flex items-center">
            <h1 class="inline-block"> Dashboard </h1>
        
            <button 
              class="text-sm bg-white p-2 rounded-md font-bold shadow-sm border hover:shadow-md ml-5 focus:outline-none"
              @click="$emit('update', false)"
            >
                <i class="fa fa-chevron-left"></i>
              Legacy Home Screen
            </button>
          </div>

          <div class="flex justify-between mt-5">
            <tab-header v-model="state.tabSelected" :tabs="state.tabs" class="rounded-md overflow-hidden"/>

            <div class="flex itemx-center space-x-2">
              <div class="md:flex items-center h-10">
                <input
                  type="search"
                  v-model.trim="searchOptions.text"
                  class="w-44 px-2 text-sm h-10 rounded-md focus:outline-none border-2 border-gray-200"
                  placeholder="Search task"
                />

                <tags-select
                  v-model="searchOptions.tags"
                  :multiple="true"
                  placeholder="Filter by tag"
                  :tags="tags"
                  class="w-full h-full md:ml-2 bg-white px-2 py-2 rounded-md border-gray-200 border-2"
                  :allow-add="false"
                />
              </div>
              <router-link 
                  to="/plan-ahead" 
                  class="mr-2 flex items-center rounded-md ring ring-green-400 ring-offset-0 px-5 text-white bg-green-500 hover:bg-green-400">
                  <i class="fa fa-tasks mr-2"></i>
                  Plan Ahead
              </router-link>
            </div>
          </div>
        </header>

        <div class="mt-5">
          <quick-add
            @saved="addTask"
            type="todo"
            :allow-edit="true"
          />
          <task-group
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
          >
          </task-group>

          <task-group
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
          >
          </task-group>
        </div>
      </div>

      <div
        class="zen__comming-up lineup md:block md:mt-0 md:w-4/12"
        :class="[state.mobileMode == 'lineup' ? 'block' : 'hidden']"
      >
        <header
          class="mb-2 md:flex justify-between text-gray-400 font-bold items-center overflow-hidden"
        >
          <h1 class="text-2xl">Tools</h1>
        </header>

        <div class="comming-up__list space-y-2 divide-gray-200 divide-solid">
          <time-tracker-wrapper
            ref="TimeTracker"
            class="bg-white shadow-md rounded-md justify-center py-5" 
            :task="currentTask" 
            :toggle-size="true"
            v-model:timer="currentTimer"
            
            >
          </time-tracker-wrapper>

          <background-icon-card
            class="bg-blue-400 h-36 text-white"
            icon="fas fa-clock"
            value="Quick Standup"
          >
            <template #action>
              <Button class="bg-blue-500"> Go to standup </Button>
            </template>
          </background-icon-card>

          <background-icon-card
            class="bg-gray-700 h-36 text-white"
            icon="fas fa-border-all"
            value="Overview"
          >
            <template #action>
              <Button class="bg-gray-800"> Go to overview </Button>
            </template>
          </background-icon-card>
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
    <div
      class="md:hidden bg-gray-600 text-white flex h-10 fixed bottom-0 w-full left-0"
    >
      <div
        class="text-xl font-bold text-center w-full h-full my-auto flex items-center justify-center"
        :class="{ 'bg-gray-900': state.mobileMode == 'zen' }"
        @click="state.mobileMode = 'zen'"
      >
        Zen
      </div>
      <div
        class="text-xl font-bold text-center h-full w-full my-auto flex items-center justify-center"
        :class="{ 'bg-gray-900': state.mobileMode == 'lineup' }"
        @click="state.mobileMode = 'lineup'"
      >
        Lineup
      </div>
    </div>
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
  onMounted,
} from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox, ElNotification } from "element-plus";
import { useTaskFirestore } from "../utils/useTaskFirestore";
import { useTrackFirestore } from "../utils/useTrackFirestore";
import { firebaseState, updateSettings } from "../utils/useFirebase";
import { startFireworks } from "../utils/useConfetti";
import TagsSelect from "../components/atoms/TagsSelect.vue";
import TabHeader from "../components/atoms/TabHeader.vue";
import Button from "../components/atoms/Button.vue";
import TaskGroup from "../components/organisms/TaskGroup.vue";
import QuickAdd from "../components/molecules/QuickAdd.vue";
import BackgroundIconCard from "../components/molecules/BackgroundIconCard.vue";
import TimeTrackerWrapper from "../components/organisms/TimeTrackerWrapper.vue";
import TaskTrackView from "../components/organisms/TaskTrackView.vue";
import WelcomeModal from "../components/organisms/WelcomeModal.vue";
import TaskModal from "../components/organisms/TaskModal.vue";

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

// Current task
const currentTask = ref({});
const TimeTracker = ref(null)
const setCurrentTask = (task) => {
  currentTask.value = task;
  nextTick(() => {
    TimeTracker.value.togglePlay()
  })
};

onMounted(() => {
  console.log(TimeTracker.value)
})

// Edit task
const taskToEdit = ref({});
const setTaskToEdit = (task) => {
  taskToEdit.value = task;
  state.isTaskModalOpen = false;
  state.isTaskModalOpen = true;
};

const onEdittedTask = (task) => {
  const index = state[task.matrix].findIndex(
    (localTask) => localTask.uid == task.uid
  );
  state[task.matrix][index] = { ...task };
  taskToEdit.value = null;
};

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
