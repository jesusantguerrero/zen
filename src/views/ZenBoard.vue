<template>
  <div class="pt-24 md:pt-28 pb-20 mx-5 md:mx-28">
    <div class="text-left md:flex">
      <div
        class="zen__view md:block md:w-8/12 md:mr-28"
        :class="[state.mobileMode == 'zen' ? 'block' : 'hidden']"
      >
        <header class="flex justify-between">
          <h1 class="md:block text-2xl font-bold text-gray-400">
            {{ "Main task" || "No task selected" }}
          </h1>

          <time-tracker :task="currentTask" v-model:currentTimer="currentTimer">
          </time-tracker>
        </header>

        <div class="mt-5">
          <quick-add
            v-if="state.showReminder"
            mode="reminder"
            type="reminder"
            class="zen__reminder"
            title="Things bear in mind after the zen"
            placeholder="Add a reminder"
          >
          </quick-add>

          <task-view
            :task="currentTask"
            :current-timer="currentTimer"
            @done="onDone"
            @updated="onTaskUpdated"
          >
            <template #empty v-if="!currentTask.title">
              <div class="w-8/12 md:w-6/12 mx-auto mt-10 text-center">
                <img
                  src="../assets/undraw_following.svg"
                  class="w-12/12 md:w-7/12 mx-auto"
                />
                <div class="mt-10 md:mt-5 text-gray-500 font-bold">
                  Select item from "todo" or go to
                  <router-link to="/plan-ahead" class="font-bolder"
                    >Planahead</router-link
                  >
                </div>
              </div>
            </template>
          </task-view>
          <task-track-view :task="currentTask" :current-timer="currentTimer">
          </task-track-view>
        </div>
      </div>

      <div
        class="zen__comming-up md:block md:mt-0 md:w-4/12 md:ml-5"
        :class="[state.mobileMode == 'lineup' ? 'block' : 'hidden']"
      >
        <header class="mb-2 md:flex justify-between text-gray-400 font-bold items-center overflow-hidden">
          <h1 class="text-2xl">Lineup</h1>

          <div class="md:flex items-center h-10">
            <input
              type="search"
              v-model.trim="searchOptions.text"
              class="w-full px-2 text-sm h-10 rounded-md focus:outline-none border-2 border-gray-200"
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


        </header>

        <div class="comming-up__list divide-y-2 divide-gray-200 divide-solid">
          <div class="quick__add mb-4">
            <h4 class="font-bold mb-2">Quick Add</h4>
            <quick-add @saved="addTask" type="todo" :allow-edit="true"></quick-add>
          </div>
          <div class="">
            <div class="tab-header flex"> 
              <button 
                class="pr-2 py-1 hover:bg-gray-200 font-bold focus:outline-none text-gray-500" 
                :class="{'text-green-500 bg-gray-100': state.tabSelected=='todo'}"
                @click="state.tabSelected='todo'"
                > 
                  Todo ({{ state.todo.length }})
              </button>
              <button 
                class="px-2 py-1 hover:bg-gray-200 font-bold focus:outline-none text-gray-500"
                :class="{'text-blue-500 bg-gray-100': state.tabSelected=='schedule'}"
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
              :tasks="state.todo"
              :search="searchOptions.text"
              :show-select="true"
              :show-controls="true"
              :current-task="currentTask"
              :current-timer="currentTimer"
              :is-item-as-handler="true"
              type="todo"
              :tags="selectedTags"
              @change="handleDragChanges"
              @deleted="destroyTask"
              @edited="setTaskToEdit"
              @selected="setCurrentTask"
              @down="moveTo($event, 'schedule')"
            >
            </task-group>

            <task-group
              v-if="state.tabSelected=='schedule'"
              :show-title="false"
              title="Schedule"
              :tasks="state.schedule"
              :tags="selectedTags"
              :active="false"
              :show-controls="true"
              :search="searchOptions.text"
              type="schedule"
              class="py-3"
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
    <div class="md:hidden bg-gray-600 text-white flex h-10 fixed bottom-0 w-full left-0">
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
import { inject, nextTick, onUnmounted, reactive, ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox, ElNotification } from "element-plus";
import { useTaskFirestore } from "../utils/useTaskFirestore";
import { useTrackFirestore } from "../utils/useTrackFirestore";
import { firebaseState, updateSettings } from "../utils/useFirebase";
import { startFireworks } from "../utils/useConfetti";
import TagsSelect from "../components/atoms/TagsSelect.vue"
import TaskGroup from "../components/organisms/TaskGroup.vue";
import QuickAdd from "../components/molecules/QuickAdd.vue";
import TimeTracker from "../components/organisms/TimeTracker.vue";
import TaskView from "../components/organisms/TaskView.vue";
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
  tabSelected: 'todo'
});

state.isWelcomeOpen = state.isWelcomeOpen || !firebaseState.settings || !firebaseState.settings.hide_welcome;

const toggleReminder = () => {
  state.showReminder = !state.showReminder;
};

// search
const searchOptions = reactive({
  text: "",
  tags: []
})
const selectedTags = computed(() => {
  return searchOptions.tags.map(tag => tag.uid)
})

const tags = inject("tags", []);

// Current task
const currentTask = ref({});
const setCurrentTask = (task) => {
  currentTask.value = task;
};

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

if (firebaseState.settings && firebaseState.settings.last_task_uid) {
  const lastTask = state.todo.find((task) => task.uid == firebaseState.settings.last_task_uid);
  if (lastTask) {
    setCurrentTask(lastTask);
  }
}

watch(currentTask, () => {
  if (currentTask.value.uid) {
    getAllTracksOfTask(currentTask.value.uid).then((tracks) => {
      currentTask.value.tracks = tracks || [];
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

// 

</script>

<style scoped>
.zen__datails {
  min-height: 400px;
}
</style>
