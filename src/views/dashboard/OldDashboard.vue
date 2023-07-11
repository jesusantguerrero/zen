<template>
  <div class="pt-24 pb-20 mx-5 md:pt-28 md:mx-28">
    <div class="text-left md:flex">
      <div
        class="zen__view md:block md:w-8/12 md:mr-20"
        :class="[state.mobileMode == 'zen' ? 'block' : 'hidden']"
      >
        <header class="flex justify-between">
          <div
            class="flex items-center text-2xl font-bold text-gray-400 md:block dark:text-gray-300"
          >
            <h1 class="inline-block">Dashboard</h1>
          </div>
        </header>
        <section class="flex justify-between mt-5">
          <div v-if="!state.showAdd" class="h-10">
            <TabHeader
              v-model="state.tabSelected"
              :tabs="state.tabs"
              class="h-full overflow-hidden rounded-md"
            />
          </div>

          <section
            class="flex items-center space-x-2"
            :class="{ 'w-full flex-col': state.showAdd }"
          >
            <header
              v-if="!state.showAdd"
              class="flex items-center justify-between mb-2 space-x-2 overflow-hidden font-bold text-gray-400 md:flex"
            >
              <SearchBox
                v-model="searchText"
                v-model:selectedTags="searchTags"
                placeholder="Search task..."
                :multiple="true"
                :tags="tags"
                :allow-add="false"
              />
              <AtButton type="success" class="h-full" rounded @click="toggleQuickAdd">
                New
              </AtButton>
            </header>
            <div v-show="state.showAdd" class="w-full mb-4 quick__add">
              <QuickAdd
                type="todo"
                ref="quickAdd"
                :initial-text="searchText"
                @saved="addTask"
                @close="state.showAdd = false"
                :allow-edit="true"
              />
            </div>
          </section>
        </section>

        <div>
          <QuickAdd
            v-if="state.showReminder"
            mode="reminder"
            type="reminder"
            class="zen__reminder"
            title="Things bear in mind after the zen"
            placeholder="Add a reminder"
          />

          <section>
            <TaskGroup
              v-if="state.tabSelected == 'todo'"
              :show-title="false"
              title="Todo"
              class="py-3"
              type="todo"
              allow-run
              placeholder="Click a task select"
              :tasks="filteredTodos"
              :show-select="true"
              :show-controls="true"
              :current-task="trackStore.currentTask"
              :current-timer="trackStore.currentTimer"
              :is-item-as-handler="true"
              :use-external-done="true"
              @toggle-timer="trackStore.setCurrentTask($event, true)"
              @selected="trackStore.setCurrentTask"
              @change="handleDragChanges"
              @clone="onClone"
              @deleted="destroyTask"
              @edited="setTaskToEdit"
              @done="onDone"
              @down="moveTo($event, 'schedule')"
            />

            <TaskGroup
              v-if="state.tabSelected == 'schedule'"
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
            />
          </section>

          {{ trackStore.currentTask }}
        </div>
      </div>

      <div
        class="zen__comming-up lineup md:block md:mt-0 md:w-4/12"
        :class="[state.mobileMode == 'lineup' ? 'block' : 'hidden']"
      >
        <div
          class="divide-y-2 divide-gray-200 comming-up__list dark:divide-gray-600 dark:text-gray-300 divide-solid"
        >
          <div class="pt-4 space-y-4">
            <section>
              <CardButton
                class="mt-4"
                title="Plan ahead"
                description="Prioritize your day"
                @click="push('/plan-ahead')"
              >
                <template #icon>
                  <div
                    class="flex items-center justify-center p-3 text-white bg-gray-500 rounded-full h-9 w-9"
                  >
                    <i class="fa fa-tasks" />
                  </div>
                </template>
              </CardButton>
              <SummaryAside class="-mt-4" :matrix="matrix" />
            </section>

            <TaskTrackView
              :task="trackStore.currentTask"
              :current-timer="trackStore.currentTimer"
            />

            <StandupYWidget :committed="state.committed" />
          </div>
        </div>
      </div>
    </div>

    <WelcomeModal :is-open="state.isWelcomeOpen" @closed="closeWelcomeModal" />

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

<script setup lang="ts">
import { inject, nextTick, onUnmounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox, ElNotification } from "element-plus";
// @ts-ignore
import { AtButton } from "atmosphere-ui";

import TaskGroup from "@/components/organisms/TaskGroup.vue";
import QuickAdd from "@/components/molecules/QuickAdd.vue";
import TimeTracker from "@/components/organisms/TimeTracker.vue";
import TaskTrackView from "@/components/organisms/TaskTrackView.vue";
import WelcomeModal from "@/components/organisms/modals/WelcomeModal.vue";
import TaskModal from "@/components/organisms/modals/TaskModal.vue";
import SearchBox from "./SearchBox.vue";
import TabHeader from "@/components/atoms/TabHeader.vue";
import CardButton from "@/components/molecules/CardButton.vue";
import SummaryAside from "@/components/templates/SummaryAside.vue";

import { useTaskFirestore, ITask } from "@/utils/useTaskFirestore";
import { firebaseState, registerEvent, updateSettings } from "@/utils/useFirebase";
import { useFuseSearch, useSearchOptions } from "@/utils/useFuseSearch";
import { startFireworks } from "@/utils/useConfetti";
import { getNextIndex } from "@/utils";
import { useMagicKeys } from "@vueuse/core";
import { computed } from "@vue/reactivity";
import { startOfYesterday } from "date-fns";
import StandupYWidget from "@/components/templates/StandupYWidget.vue";
import { useTrackerStore } from "@/store/tracker";

const {
  saveTask,
  deleteTask,
  updateTask,
  getMatrix,
  getCommittedTasks,
  updateTaskBatch,
} = useTaskFirestore();

nextTick(() => {});
// state and ui
const state = reactive({
  committed: [],
  committedRef: null,
  showReminder: false,
  isWelcomeOpen: false,
  isTaskModalOpen: false,
  track: null,
  mobileMode: "zen",
  tabSelected: "todo",
  showAdd: false,
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
    {
      label: "Routine",
      name: "routine",
      focusClass: "text-blue-400",
    },
  ],
});

interface IMatrix {
  ref: null | any;
  list: ITask[];
  classes: string;
  loaded: boolean;
}

const matrix = reactive<Record<string, IMatrix>>({
  todo: {
    ref: null,
    list: [],
    classes: "bg-green-300 hover:bg-green-400 text-white",
    loaded: false,
  },
  schedule: {
    ref: null,
    list: [],
    classes: "bg-blue-300 hover:bg-blue-400 text-white",
    loaded: false,
  },
  delegate: {
    ref: null,
    list: [],
    classes: "bg-yellow-300 hover:bg-yellow-400 text-white",
    loaded: false,
  },
  delete: {
    ref: null,
    list: [],
    classes: "bg-red-300 hover:bg-red-400 text-white",
    loaded: false,
  },
});

state.isWelcomeOpen =
  state.isWelcomeOpen || !firebaseState.settings || !firebaseState.settings.hide_welcome;

// search
const tags = inject("tags", []);
const { selectedTags, searchText, searchTags } = useSearchOptions();

const schedule = computed(() => {
  return matrix.schedule.list;
});

const todo = computed(() => {
  return matrix.todo.list;
});

const { filteredList: filteredSchedule } = useFuseSearch(
  searchText,
  schedule,
  selectedTags
);
const { filteredList: filteredTodos } = useFuseSearch(searchText, todo, selectedTags);

// Current task
const timeTrackerRef = ref();
const trackStore = useTrackerStore();

const onClone = (task: ITask) => {
  // @ts-ignore
  const data = matrix.todo.list.sort((a, b) =>
    a.created_at.toDate() < b.created_at.toDate() ? 1 : -1
  );
  trackStore.setCurrentTask(data[0]);
};

// Edit task
const taskToEdit = ref<ITask | null>({});
const setTaskToEdit = (task: ITask) => {
  taskToEdit.value = task;
  state.isTaskModalOpen = false;
  state.isTaskModalOpen = true;
};

const onEditedTask = (task: ITask) => {
  const index = matrix[task.matrix].list.findIndex(
    (localTask) => localTask.uid == task.uid
  );
  matrix[task.matrix].list[index] = { ...task };
  taskToEdit.value = null;
};

const onDone = (task: ITask) => {
  task.tracks = [];
  delete task.duration_ms;

  updateTask(task).then(() => {
    if (matrix.todo.list.length) {
      trackStore.setCurrentTask(matrix.todo.list[0]);
      updateSettings({
        last_task_uid: trackStore.currentTask?.uid,
      });
    } else {
      trackStore.setCurrentTask({});
    }
    startFireworks();
  });
};

const onRemoved = () => {
  trackStore.setCurrentTask({});
};

const initialize = () => {
  // Tasks manipulation
  Object.entries(matrix).forEach(([matrixName, matrixValue]) => {
    matrixValue.ref = getMatrix(matrixName, (list: ITask[]) => {
      matrixValue.list = list;
      matrixValue.loaded = true;
    });
  });

  getCommittedTasks(startOfYesterday()).then((committedRef) => {
    state.committedRef = committedRef.onSnapshot((snap) => {
      const list: ITask[] = [];
      snap.forEach((doc) => {
        list.push({ ...doc.data(), uid: doc.id });
      });
      state.committed = list;
    });
  });
};

initialize();

onUnmounted(() => {
  Object.values(matrix).forEach((matrix) => {
    if (matrix.ref) {
      matrix.ref();
    }
  });

  if (state.committedRef) {
    state.committedRef();
  }
});

const addTask = async (task: ITask) => {
  task.order = getNextIndex(matrix.todo.list);
  await saveTask(task);
  registerEvent("quick_task_added");
};

const destroyTask = async (task: ITask) => {
  const canDelete = await ElMessageBox.confirm(
    "Are you sure you want to delete this task?",
    "Delete Task"
  );
  if (canDelete) {
    deleteTask(task).then(() => {
      matrix[task.matrix].list = matrix[task.matrix].list.filter(
        (localTask) => task.uid != localTask.uid
      );

      if (task.uid == trackStore.currentTask?.uid) {
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

const moveTo = async (task: ITask, matrixName: string) => {
  const oldMatrix = task.matrix;
  task.matrix = matrixName;
  task.order = getNextIndex(matrix[oldMatrix]);
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
const handleDragChanges = (e: any, matrixName: string) => {
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
      matrix[e.moved.element.matrix].list.map((task, index) => {
        task.order = index;
        return task;
      })
    );
  }
};

//  magic keys
const { Shift_k } = useMagicKeys();
const quickAdd = ref();
watch(Shift_k, () => {
  toggleQuickAdd();
});
const toggleQuickAdd = () => {
  state.showAdd = true;
  nextTick(() => {
    quickAdd.value.focus();
  });
};
</script>

<style scoped>
.zen__datails {
  min-height: 400px;
}
</style>
