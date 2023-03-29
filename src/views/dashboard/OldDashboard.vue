<template>
  <div class="pt-24 pb-20 mx-5 md:pt-28 md:mx-28">
    <div class="text-left md:flex">
      <div
        class="zen__view md:block md:w-8/12 md:mr-20"
        :class="[state.mobileMode == 'zen' ? 'block' : 'hidden']"
      >
        <header class="flex justify-between">
          <div class="flex items-center text-2xl font-bold text-gray-400 md:block dark:text-gray-300">
            <h1 class="inline-block"> Dashboard </h1>
          </div>

          <TimeTracker 
            :task="currentTask" 
            ref="timeTrackerRef"
            v-model:currentTimer="currentTimer"
            @track-added="onTrackAdded"
          />
        </header>
        <section class="flex justify-between mt-5">
          <div v-if="!state.showAdd" class="h-10">
            <TabHeader v-model="state.tabSelected" :tabs="state.tabs" class="overflow-hidden h-full rounded-md"/>
          </div>

          <section class="flex space-x-2 items-center" :class="{'w-full flex-col': state.showAdd}">
              <header  v-if="!state.showAdd" class="items-center flex space-x-2 justify-between mb-2 overflow-hidden font-bold text-gray-400 md:flex">
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
            <div v-show="state.showAdd"  class="mb-4 quick__add w-full">
              <QuickAdd 
                type="todo" 
                ref="quickAdd" 
                :initial-text="searchText"
                @saved="addTask" 
                @close="state.showAdd=false"
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
              v-if="state.tabSelected=='todo'"
              :show-title="false"
              title="Todo"
              class="py-3"
              type="todo"
              allow-run
              placeholder="Click a task select"
              :tasks="filteredTodos"
              :show-select="true"
              :show-controls="true"
              :current-task="currentTask"
              :current-timer="currentTimer"
              :is-item-as-handler="true"
              :use-external-done="true"
              @toggle-timer="setCurrentTask($event, true)"
              @change="handleDragChanges"
              @clone="onClone"
              @deleted="destroyTask"
              @edited="setTaskToEdit"
              @selected="setCurrentTask"
              @done="onDone"
              @down="moveTo($event, 'schedule')"
            />

            <TaskGroup
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
            />
          </section>
        </div>
      </div>

      <div
        class="zen__comming-up lineup md:block md:mt-0 md:w-4/12"
        :class="[state.mobileMode == 'lineup' ? 'block' : 'hidden']"
      >
        
        <div class="divide-y-2 divide-gray-200 comming-up__list dark:divide-gray-600 dark:text-gray-300 divide-solid">
         
          <div class="pt-4 space-y-4">
            <CardButton 
                class="mt-4"
                title="Plan ahead"
                description="Prioritize your day"
                @click="push('/plan-ahead')"
            >
                <template #icon>
                    <div class="rounded-full p-3 bg-gray-500 h-9 w-9 flex text-white items-center justify-center">
                        <i class="fa fa-tasks"/>
                    </div>
                </template>
            </CardButton>
           
            <TaskTrackView :task="currentTask" :current-timer="currentTimer" />
            <SummarySider 
              :matrix="state.matrix"
              :standup="state.standup"
              :committed="state.committed"
              :is-loaded="state.tasksLoaded"
            />
          </div>
        </div>
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

<script setup lang="ts">
import { inject, nextTick, onUnmounted, reactive, ref, watch, toRefs, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox, ElNotification } from "element-plus";
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
import SummarySider from "@/components/templates/SummarySider.vue";

import { useTaskFirestore } from "@/utils/useTaskFirestore";
import { useTrackFirestore } from "@/utils/useTrackFirestore";
import { timeReducer} from "@/utils/useTracker";
import { formatDurationFromMs } from "@/utils/useDateTime";
import { firebaseState, registerEvent, updateSettings } from "@/utils/useFirebase";
import { useFuseSearch, useSearchOptions } from "@/utils/useFuseSearch";
import { startFireworks } from "@/utils/useConfetti";
import { getNextIndex } from "@/utils";
import { useMagicKeys } from "@vueuse/core";

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
  matrix: {
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
  },
  showReminder: false,
  isWelcomeOpen: false,
  isTaskModalOpen: false,
  track: null,
  mobileMode: "zen",
  tabSelected: 'todo',
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

state.isWelcomeOpen = state.isWelcomeOpen || !firebaseState.settings || !firebaseState.settings.hide_welcome;

// search
const tags = inject("tags", []);
const { selectedTags, searchText, searchTags } = useSearchOptions()

const { schedule, todo } = toRefs(state);
const { filteredList: filteredSchedule } = useFuseSearch(searchText, schedule, selectedTags);
const { filteredList: filteredTodos } = useFuseSearch(searchText, todo, selectedTags);

// Current task
const currentTask = ref({});
const timeTrackerRef = ref();
const setCurrentTask = (task: any, autoplay = false) => {
  currentTask.value = task;
  if (autoplay) {
    nextTick(() => {
      timeTrackerRef.value?.togglePlay()
    })
  }
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

const onEditedTask = (task) => {
  const index = state[task.matrix].findIndex((localTask) => localTask.uid == task.uid);
  state[task.matrix][index] = { ...task };
  taskToEdit.value = null;
};

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

const onTrackAdded = (taskUid: string, newTrack: any) => {
  currentTask.value.tracks.push(newTrack);
  const savedTime = timeReducer(currentTask.value.tracks);
  if (savedTime) {
    const timeFormatted = formatDurationFromMs(savedTime);
    nextTick(() => {
      updateTask({
        uid: taskUid,
        duration_ms: timeFormatted.toFormat("hh:mm:ss"),
        duration: savedTime
      })
    })
  }
}
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
const handleDragChanges = (e: any, matrix: string) => {
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

//  magic keys
const { Shift_k} = useMagicKeys();
const quickAdd = ref()
watch(Shift_k, () => {
  toggleQuickAdd();
})
const toggleQuickAdd = () => {
  state.showAdd = true;
  nextTick(() => {
    quickAdd.value.focus();
  })
}
</script>

<style scoped>
.zen__datails {
  min-height: 400px;
}
</style>
