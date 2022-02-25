<template>
  <div class="pt-24 pb-20 mx-5 md:pt-28 md:mx-28">
    <div class="text-left md:flex">
      <div
        class="zen__view md:block md:w-8/12 md:mr-20"
        :class="[state.mobileMode == 'zen' ? 'block' : 'hidden']"
      >
        <header class="flex justify-between font-bold text-gray-400">
          <h1 class="text-2xl font-bold text-gray-400 md:block">
            Hi, {{ "Jesus" }}<br>
          </h1>
          <small class="text-sm">See your day in a glance</small>
        </header>

      <div
        class="zen__view md:block md:w-full md:mr-20"
        :class="[state.mobileMode == 'zen' ? 'block' : 'hidden']"
      >
        <header>
          <div class="flex justify-between mt-5">
            <tab-header v-model="state.tabSelected" :tabs="state.tabs" class="overflow-hidden rounded-md"/>

            <div class="flex space-x-2 itemx-center">
              <div class="items-center h-10 md:flex">
                <input
                  type="search"
                  v-model.trim="searchOptions.text"
                  class="h-10 px-2 text-sm border-2 border-gray-200 rounded-md w-44 focus:outline-none"
                  placeholder="Search task"
                />

                <tags-select
                  v-model="searchOptions.tags"
                  :multiple="true"
                  placeholder="Filter by tag"
                  :tags="tags"
                  class="w-full h-full px-2 py-2 bg-white border-2 border-gray-200 rounded-md md:ml-2"
                  :allow-add="false"
                />
              </div>
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
            :tasks="state.matrix.todo.list"
            :search="searchOptions.text"
            :show-select="true"
            :show-controls="true"
            :is-item-as-handler="true"
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
            :tasks="state.matrix.schedule.list"
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

          <task-group
              v-if="state.tabSelected == 'stale'"
              title="Stale"
              color="text-blue-400"
              :search="''"
              :tags="[]"
              :tasks="state.stale"
              :show-controls="false"
              :max-height="0"
              :is-compact="true"
              :is-quadrant="false"

            >
              <template #empty v-if="!state.overdues.length">
              <div class="w-8/12 mx-auto mt-10 text-center md:w-6/12">
                <img src="../assets/undraw_following.svg" class="mx-auto w-12/12 md:w-5/12"> 
                <div class="mt-10 font-bold text-gray-500 md:mt-5"> There's no tasks</div>
              </div>
            </template>
          </task-group>

          <task-group
              title="Overdues"
              type="schedule"
              color="text-blue-400"
              v-if="state.tabSelected == 'overdues'"
              :search="''"
              :tags="[]"
              :tasks="state.overdues"
              :show-controls="false"
              :max-height="0"
              :is-compact="true"
              :is-quadrant="false"

            >
              <template #empty v-if="!state.overdues.length">
              <div class="w-8/12 mx-auto mt-10 text-center md:w-6/12">
                <img src="../assets/undraw_following.svg" class="mx-auto w-12/12 md:w-5/12"> 
                <div class="mt-10 font-bold text-gray-500 md:mt-5"> There's no tasks</div>
              </div>
            </template>
          </task-group>
        </div>
      </div>
      </div>

      <div
        class="zen__comming-up lineup md:block md:mt-0 md:w-4/12"
        :class="[state.mobileMode == 'lineup' ? 'block' : 'hidden']"
      >
        <header class="items-center justify-between mb-2 overflow-hidden font-bold text-gray-400 md:flex">
          <h1 class="text-2xl">Summary</h1><br>
          <small class="text-sm">See your day in a glance</small>
        </header>

        <div class="divide-y divide-gray-200 comming-up__list divide-solid">
          <!-- Matrix summary -->
          <div class="py-4 quick__add">
            <h4 class="font-bold text-gray-500"> Matrix summary</h4>
            <div class="grid gap-4 font-bold text-white lg:grid-cols-2">
              <div class="flex items-center justify-center h-20 rounded-md shadow-md cursor-pointer ring ring-offset-2 ring-transparent" 
                v-for="(matrix, matrixName) in state.matrix"
                :key="matrixName"
                :class="matrix.classes">
                  <span class="mr-2 capitalize">{{ matrixName}}</span>
                 ({{ matrix.list.length }})
              </div>
            </div>
          </div>

          <!-- Shared -->
           <div class="py-4 quick__add" v-if="false">
              <div class="flex justify-between mb-5 font-bold text-gray-500">
                <h4>
                  Shared with me
                </h4> 
                <div class="items-center h-10 md:flex">
                  <input
                    type="search"
                    v-model.trim="searchOptions.text"
                    class="w-full h-10 px-2 text-sm border-2 border-gray-200 rounded-md focus:outline-none"
                    placeholder="Search contact"
                  />
                </div>
              </div>
              <div class="flex space-x-2">
                <div v-for="person in  shared" :key="person.uid" class="text-center cursor-pointer">
                  <el-avatar class="block"> {{ person.name }} </el-avatar>
                </div>
              </div>
          </div>

          <div class="py-4">
              <div class="flex justify-between mb-5 font-bold text-gray-500">
                <h4>
                  Your yesterday's work
                </h4> 
              </div>
              <background-icon-card
                class="text-white bg-blue-400 h-36"
                icon="fas fa-clock"
                value="Quick Standup"
              >
                <template #action>
                  <Button class="bg-blue-500"> Go to standup </Button>
                </template>
              </background-icon-card>
          </div>
          
          <div class="py-4">
              <div class="flex justify-between font-bold text-gray-500">
                <h4>
                  What's comming today
                </h4> 
              </div>
     
            <background-icon-card
              class="mt-5 text-white bg-gray-700 h-36"
              icon="fas fa-calendar"
              value="Schedule"
            >
              <template #action>
                <Button class="bg-gray-800"> Connect Calendar </Button>
              </template>
            </background-icon-card>
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
  </div>
</template>

<script setup>
import { inject, nextTick, onUnmounted, reactive, ref, watch, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElNotification } from "element-plus";
import { useTaskFirestore } from "../utils/useTaskFirestore";
import { useDateTime } from "../utils/useDateTime";
import { useTrackFirestore } from "../utils/useTrackFirestore";
import { firebaseState, updateSettings } from "../utils/useFirebase";
import { startFireworks } from "../utils/useConfetti";
import BadgeItem from "../components/atoms/BadgeItem.vue";
import Button from "../components/atoms/Button.vue";
import BackgroundIconCard from "../components/molecules/BackgroundIconCard.vue";
import TagsSelect from "../components/atoms/TagsSelect.vue";
import TabHeader from "../components/atoms/TabHeader.vue";
import TaskGroup from "../components/organisms/TaskGroup.vue";
import WelcomeModal from "../components/organisms/WelcomeModal.vue";
import TaskModal from "../components/organisms/TaskModal.vue";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";

const {
  updateTask,
  getTaskByMatrix,
  updateTaskBatch,
} = useTaskFirestore();
const { getAllTracksOfTask } = useTrackFirestore();

nextTick(() => {});
// state and ui
const state = reactive({
  matrix: {
    todo: {
      ref: null,
      list: [],
      classes: "bg-green-400 ring-offset-green-500"
    },
    schedule: {
      ref: null,
      list: [],
      classes: "bg-blue-400 ring-offset-blue-500"
    },
    delegate: {
      ref: null,
      list: [],
      classes: "bg-yellow-400 ring-offset-yellow-500"
    },
    delete: {
      ref: null,
      list: [],
      classes: "bg-red-400 ring-offset-red-500"
    },
  },
  showReminder: false,
  isWelcomeOpen: false,
  isTaskModalOpen: false,
  isTimeTrackerModalOpen: true,
  track: null,
  mobileMode: "zen",
  tabSelected: 'todo',
  tabs: [
    {
      label: "Todo",
      name: "todo",
      focusClass: "text-green-400",
    },
    {
      label: "Schedule",
      name: "schedule",
      focusClass: "text-blue-400",
    },
    {
      label: "Stale",
      name: "stale",
      focusClass: "text-yellow-400",
    },
    {
      label: "Overdues",
      name: "overdues",
      focusClass: "text-red-400",
    },
  ],
  overdues: computed(() => {
    const { formatDate } = useDateTime()
    return Object.entries(state.matrix).reduce((list, matrix) => {
      return [...list,...matrix[1].list.filter((item) => {
        return item.due_date && item.due_date < formatDate();
      })]
    }, [])
  }),
  stale: computed(() => {
      return Object.entries(state.matrix).reduce((list, matrix) => {
      return [...list,...matrix[1].list.filter((item) => {
        item.diff = differenceInCalendarDays(item.created_at.toDate(), new Date());
        return item.diff;
      })]
    }, [])
  })
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
    state.matrix[matrix].ref = collectionRef.onSnapshot(snap => {
      state.matrix[matrix].list = [];
      snap.forEach((doc) => {
        state.matrix[matrix].list.push({ ...doc.data(), uid: doc.id });
      });
    });
  });
};

Object.keys(state.matrix).forEach(matrix => {
  getMatrix(matrix);
})

onUnmounted(() => {
  Object.values(state.matrix).forEach( matrix => {
    if (matrix.ref) {
      matrix.ref();
    }
  })
});

const getNextIndex = (list) => {
  return Math.max(...list.map((item) => Number(item.order || 0))) + 1;
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

const shared = inject('shared')

</script>

<style lang="scss" scoped>
.zen__datails {
  min-height: 400px;
}
</style>
