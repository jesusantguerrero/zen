<script setup lang="ts">
import { inject, nextTick, onUnmounted,computed ,reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox, ElNotification } from "element-plus";
import { useMagicKeys } from "@vueuse/core";
import { startOfYesterday } from "date-fns";
import { useTrackerStore } from "@/store/tracker";
import TaskGroup from "@/components/organisms/TaskGroup.vue";
import QuickAdd from "@/components/molecules/QuickAdd.vue";
import TaskTrackView from "@/components/organisms/TaskTrackView.vue";
import DailySummary from "@/components/organisms/DailySummary.vue";
import OnboardingProgress from "@/components/organisms/OnboardingProgress.vue";
import StandupNudge from "@/components/molecules/StandupNudge.vue";
import MobileQuickAddFab from "@/components/molecules/MobileQuickAddFab.vue";
import FocusMode from "@/components/organisms/FocusMode.vue";
import WelcomeTour from "@/components/organisms/modals/WelcomeTour.vue";
import TaskModal from "@/components/organisms/modals/TaskModal.vue";
import SearchBox from "@/components/molecules/SearchBox.vue";
import StageFilter from "@/components/molecules/StageFilter.vue";
import TabHeader from "@/components/atoms/TabHeader.vue";
import CardButton from "@/components/molecules/CardButton.vue";
import SummaryAside from "@/components/templates/SummaryAside.vue";

import { useTaskFirestore, ITask } from "@/plugins/firebase/useTaskFirestore";
import { STAGE_META } from "@/domain/matrix/types/enum/taskTypes";
import { useUndo } from "@/composables/useUndo";
import { firebaseState, registerEvent, updateSettings } from "@/plugins/useFirebase";
import { useFuseSearch, useSearchOptions } from "@/composables/useFuseSearch";
import { startFireworks } from "@/composables/useConfetti";
import { getNextIndex } from "@/utils";

const {
  saveTask,
  deleteTask,
  updateTask,
  getMatrix,
  getCommittedTasks,
  updateTaskBatch,
} = useTaskFirestore();
const undo = useUndo();

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
  isFocusMode: false,
  selectedQuadrant: null as string | null,
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
    classes: "bg-green-300 dark:bg-accent hover:bg-green-400 text-white",
    loaded: false,
  },
  schedule: {
    ref: null,
    list: [],
    classes: "bg-blue-300 dark:bg-info hover:bg-blue-400 text-white",
    loaded: false,
  },
  delegate: {
    ref: null,
    list: [],
    classes: "bg-yellow-300 dark:bg-warning hover:bg-yellow-400 text-white",
    loaded: false,
  },
  delete: {
    ref: null,
    list: [],
    classes: "bg-red-300 dark:bg-error hover:bg-red-400 text-white",
    loaded: false,
  },
});

state.isWelcomeOpen =
  state.isWelcomeOpen || !firebaseState.settings || !firebaseState.settings.hide_welcome;

// search
const tags = inject("tags", []);
const projects = inject<any>("projects", ref([]));
const { selectedTags, searchText, searchTags, searchStages, searchProjects } = useSearchOptions();

// Projects scheduled for today (based on schedule.days)
const todaysProjects = computed(() => {
  const list = Array.isArray(projects?.value) ? projects.value : []
  const today = new Date().getDay()
  return list.filter((p: any) => p.schedule?.days?.includes(today) && !p.archived)
})
const isFilteringToday = ref(false)
watch(isFilteringToday, (active) => {
  searchProjects.value = active ? todaysProjects.value.map((p: any) => p.uid) : []
})

const schedule = computed(() => {
  return matrix.schedule.list;
});

const todo = computed(() => {
  return matrix.todo.list;
});

const { filteredList: filteredSchedule } = useFuseSearch(
  searchText,
  schedule,
  selectedTags,
  [],
  searchStages,
  searchProjects
);
const { filteredList: filteredTodos } = useFuseSearch(
  searchText,
  todo,
  selectedTags,
  [],
  searchStages,

  searchProjects
);

// Top 3 Today (E4b) — visual hierarchy only, no data-model change.
// Only split when there are more than 3 TODOs, otherwise every task is already "top".
const TOP_PRIORITY_COUNT = 3;
const top3Todos = computed(() =>
  filteredTodos.value.length > TOP_PRIORITY_COUNT
    ? filteredTodos.value.slice(0, TOP_PRIORITY_COUNT)
    : filteredTodos.value
);
const restTodos = computed(() =>
  filteredTodos.value.length > TOP_PRIORITY_COUNT
    ? filteredTodos.value.slice(TOP_PRIORITY_COUNT)
    : []
);

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
    // Snapshot the task before deletion for undo
    const snapshot = JSON.parse(JSON.stringify(task));
    deleteTask(task).then(() => {
      matrix[task.matrix].list = matrix[task.matrix].list.filter(
        (localTask) => task.uid != localTask.uid
      );

      if (task.uid == trackStore.currentTask?.uid) {
        onRemoved();
      }

      undo.push({
        label: `Deleted "${task.title}"`,
        undo: async () => {
          // Re-save with the original uid preserved
          await saveTask(snapshot);
        },
      });

      ElNotification({
        type: "success",
        message: "Cmd+Z to undo",
        title: "Task deleted",
      });
    });
  }
};

const moveTo = async (task: ITask, matrixName: string) => {
  const oldMatrix = task.matrix;
  const oldOrder = task.order;
  task.matrix = matrixName;
  task.order = getNextIndex(matrix[oldMatrix]);
  updateTask(task).then(() => {
    undo.push({
      label: `Moved "${task.title}" to ${matrixName}`,
      undo: async () => {
        task.matrix = oldMatrix;
        task.order = oldOrder;
        await updateTask(task);
      },
    });
    ElNotification({
      type: "success",
      message: `Moved to ${matrixName} · Cmd+Z to undo`,
      title: "Task moved",
    });
  });
};

const onMoveTo = ({ task, matrix: target }: { task: ITask; matrix: string }) => {
  moveTo(task, target);
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
const { Shift_k, Shift_f } = useMagicKeys();
const quickAdd = ref();
watch(Shift_k, () => {
  toggleQuickAdd();
});
watch(Shift_f, (v) => {
  if (v) state.isFocusMode = !state.isFocusMode;
});
const toggleQuickAdd = () => {
  state.showAdd = true;
  nextTick(() => {
    quickAdd.value.focus();
  });
};
</script>

<template>
  <div class="pt-24 pb-20 mx-5 md:pt-28 md:mx-28">
    <div class="text-left md:flex">
      <div
        class="zen__view md:block md:w-8/12 md:mr-20"
        :class="[state.mobileMode == 'zen' ? 'block' : 'hidden']"
      >
        <header class="flex items-center justify-between">
          <div
            class="flex items-center text-2xl font-bold text-gray-400 md:block dark:text-gray-300"
          >
            <h1 class="inline-block">Dashboard</h1>
          </div>
          <button
            type="button"
            class="flex items-center justify-center w-10 h-10 text-gray-500 transition-colors border-2 border-gray-200 rounded-md focus:outline-none hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-transparent dark:text-gray-300 dark:border-base-lvl-3 dark:hover:border-gray-400"
            :disabled="!trackStore.currentTask?.uid"
            title="Enter focus mode (Shift+F)"
            @click="state.isFocusMode = true"
          >
            <i class="fa fa-expand" />
          </button>
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
              <StageFilter v-model="searchStages" dropdown />
              <button
                v-if="todaysProjects.length"
                type="button"
                :title="`Filter to ${todaysProjects.length} project${todaysProjects.length === 1 ? '' : 's'} scheduled for today`"
                class="flex items-center h-10 px-3 space-x-2 text-xs transition-colors border-2 rounded-md focus:outline-none"
                :class="isFilteringToday
                  ? 'bg-accent text-white border-transparent'
                  : 'text-gray-500 border-gray-200 hover:border-gray-400 dark:bg-transparent dark:text-gray-300 dark:border-base-lvl-3'"
                @click="isFilteringToday = !isFilteringToday"
              >
                <i class="fa fa-calendar-day" />
                <span class="whitespace-nowrap">Today ({{ todaysProjects.length }})</span>
              </button>
              <button
                type="button"
                class="h-10 px-4 text-sm font-semibold text-white transition-colors rounded-md bg-accent hover:opacity-90 focus:outline-none"
                @click="toggleQuickAdd"
              >
                New
              </button>
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
            <template v-if="state.tabSelected == 'todo'">
              <div
                v-if="restTodos.length"
                class="flex items-baseline justify-between mb-1"
              >
                <h5 class="text-xs font-bold tracking-wide uppercase text-accent">
                  <i class="mr-1 fa fa-bolt" />
                  Top {{ top3Todos.length }} today
                </h5>
                <span class="text-xs text-gray-400 dark:text-gray-500">
                  Important &amp; urgent
                </span>
              </div>

              <TaskGroup
                :show-title="false"
                title="Todo"
                class="py-3"
                type="todo"
                allow-run
                placeholder="Click a task select"
                :tasks="top3Todos"
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
                @move-to="onMoveTo"
              />

              <template v-if="restTodos.length">
                <div class="flex items-center mt-3 mb-1 space-x-2 text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  <div class="flex-grow h-px bg-gray-200 dark:bg-base-lvl-3" />
                  <span>More ({{ restTodos.length }})</span>
                  <div class="flex-grow h-px bg-gray-200 dark:bg-base-lvl-3" />
                </div>
                <div class="opacity-60 hover:opacity-100 transition-opacity">
                  <TaskGroup
                    :show-title="false"
                    title="Todo"
                    class="py-2"
                    type="todo"
                    allow-run
                    placeholder="Click a task select"
                    :tasks="restTodos"
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
                    @move-to="onMoveTo"
                  />
                </div>
              </template>
            </template>

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
              @move-to="onMoveTo"
              @change="handleDragChanges"
            />
          </section>
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
                class="mt-4 dark:border-base-lvl-3"
                title="Plan ahead"
                description="Prioritize your day"
                @click="push('/plan-ahead')"
              >
                <template #icon>
                  <div
                    class="flex items-center justify-center p-3 text-white bg-gray-500 dark:bg-base-lvl-1 dark:border-base-lvl-3 border rounded-full h-9 w-9"
                  >
                    <i class="fa fa-tasks" />
                  </div>
                </template>
              </CardButton>
              <SummaryAside
                class="-mt-4 dark:border-gray-600"
                :matrix="matrix"
                v-model:selected="state.selectedQuadrant"
              />
              <section
                v-if="state.selectedQuadrant && matrix[state.selectedQuadrant]"
                class="p-3 bg-white border border-gray-200 rounded-md shadow-sm dark:bg-base-lvl-2 dark:border-base-lvl-3"
              >
                <header class="flex items-center justify-between mb-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                  <span class="capitalize">
                    {{ state.selectedQuadrant }} · {{ matrix[state.selectedQuadrant].list.length }} task{{ matrix[state.selectedQuadrant].list.length === 1 ? '' : 's' }}
                  </span>
                  <button
                    type="button"
                    class="text-gray-400 hover:text-red-400 focus:outline-none"
                    title="Close"
                    @click="state.selectedQuadrant = null"
                  >
                    <i class="fa fa-times" />
                  </button>
                </header>
                <ul v-if="matrix[state.selectedQuadrant].list.length" class="space-y-1 max-h-64 overflow-y-auto ic-scroller">
                  <li
                    v-for="task in matrix[state.selectedQuadrant].list"
                    :key="task.uid"
                    class="flex items-center p-2 space-x-2 text-sm transition-colors rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-base-lvl-1"
                    @click="setTaskToEdit(task)"
                  >
                    <span class="flex-1 truncate text-gray-700 dark:text-gray-200">{{ task.title }}</span>
                    <span
                      v-if="task.stage && STAGE_META[task.stage]"
                      class="flex items-center px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full whitespace-nowrap"
                      :class="STAGE_META[task.stage].badgeClass"
                    >
                      <span class="inline-block w-1.5 h-1.5 mr-1 rounded-full" :class="STAGE_META[task.stage].dotClass"></span>
                      {{ STAGE_META[task.stage].label }}
                    </span>
                  </li>
                </ul>
                <div v-else class="py-4 text-sm text-center text-gray-400">
                  No tasks in this quadrant.
                </div>
              </section>
            </section>

            <StandupNudge />
            <OnboardingProgress :matrix="matrix" />
            <DailySummary :matrix="matrix" @open-task="setTaskToEdit" />

            <TaskTrackView
              :task="trackStore.currentTask"
              :current-timer="trackStore.currentTimer"
            />
          </div>
        </div>
      </div>
    </div>

    <MobileQuickAddFab @quick-add="toggleQuickAdd" />
    <FocusMode v-model:is-open="state.isFocusMode" />

    <WelcomeTour
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

<style scoped>
.zen__datails {
  min-height: 400px;
}
</style>
@/plugins/useTaskFirestore@/composables/useFuseSearch@/composables/useConfetti