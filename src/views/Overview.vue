<template>
  <div class="pt-24 md:pt-28 pb-20 mx-5 md:mx-28">
    <div class="text-left md:flex">
      <div
        class="zen__view md:block md:w-8/12 md:mr-20"
        :class="[state.mobileMode == 'zen' ? 'block' : 'hidden']"
      >
        <header class="flex justify-between font-bold text-gray-400">
          <h1 class="md:block text-2xl font-bold text-gray-400">
            Hi, {{ "Jesus" }}<br>
          </h1>
          <small class="text-sm">See your day in a glance</small>
        </header>

        <div class="">
          <!-- Agenda -->
          <div class="quick__add py-4 text-gray-500">
            <h4 class="font-bold"> Today's agenda</h4>
            <div class="font-bold bg-white rounded-md ring ring-offset-2 ring-transparent ring-offset-gray-200 shadow-md px-5 py-3">
              <task-group
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
                        <div class="w-8/12 md:w-6/12 mx-auto mt-10 text-center">
                          <img src="../assets/undraw_following.svg" class="w-12/12 md:w-5/12 mx-auto"> 
                          <div class="mt-10 md:mt-5 text-gray-500 font-bold"> There's no tasks</div>
                        </div>
                      </template>
              </task-group>
            </div>
          </div>

          <div class="flex space-x-4">
            <!-- Overdue -->
            <div class="quick__add py-4 w-3/12">
              <h4 class="font-bold text-gray-500"> Badges</h4>
              <div class="text-gray-400 font-bold bg-white rounded-md ring ring-offset-2 ring-transparent ring-offset-gray-200 shadow-md">
                <div class="px-5 py-4 space-y-5 pb-10">
                  <div class="flex justify-between items-center">
                    See More
                    <i class="fa fa-chevron-right"></i>
                  </div>
                  <badge-item v-for="badge in state.badgesSummary" :key="badge.title" :badge="badge" />                   
                  <badge-item :badge="state.badges[0]">
                      <span class="text-3xl zen"> Z </span>
                  </badge-item>                   
                </div>
              </div>
            </div>
            <!-- Overdue -->
            <div class="quick__add py-4 w-9/12">
              <h4 class="font-bold text-gray-500"> Overdue</h4>
              <div class="text-gray-400 font-bold bg-white rounded-md ring ring-offset-2 ring-transparent ring-offset-gray-200 shadow-md px-5 py-3">
                  <div>
                    <task-group
                        title="Overdues"
                        type="schedule"
                        color="text-blue-400"
                        :search="''"
                        :tags="[]"
                        :tasks="state.overdues"
                        :show-controls="false"
                        :max-height="0"
                        :is-compact="true"
                        :is-quadrant="false"

                      >
                        <template #empty v-if="!state.overdues.length">
                        <div class="w-8/12 md:w-6/12 mx-auto mt-10 text-center">
                          <img src="../assets/undraw_following.svg" class="w-12/12 md:w-5/12 mx-auto"> 
                          <div class="mt-10 md:mt-5 text-gray-500 font-bold"> There's no tasks</div>
                        </div>
                      </template>
                    </task-group>
                  </div>
              </div>
            </div>
          
          </div>
        </div>
      </div>

      <div
        class="zen__comming-up lineup md:block md:mt-0 md:w-4/12"
        :class="[state.mobileMode == 'lineup' ? 'block' : 'hidden']"
      >
        <header class="mb-2 md:flex justify-between text-gray-400 font-bold items-center overflow-hidden">
          <h1 class="text-2xl">Summary</h1><br>
          <small class="text-sm">See your day in a glance</small>
        </header>

        <div class="comming-up__list divide-y divide-gray-200 divide-solid">
          <!-- Matrix summary -->
          <div class="quick__add py-4">
            <h4 class="font-bold text-gray-500"> Matrix summary</h4>
            <div class="grid lg:grid-cols-2 gap-4 text-white font-bold">
              <div class="h-20 flex justify-center items-center shadow-md rounded-md cursor-pointer ring ring-offset-2 ring-transparent" 
                v-for="(matrix, matrixName) in state.matrix"
                :key="matrixName"
                :class="matrix.classes">
                  <span class="capitalize mr-2">{{ matrixName}}</span>
                 ({{ matrix.list.length }})
              </div>
            </div>
          </div>

          <!-- Shared -->
           <div class="quick__add py-4">
              <div class="font-bold text-gray-500 flex justify-between mb-5">
                <h4>
                  Shared with me
                </h4> 
                <div class="md:flex items-center h-10">
                  <input
                    type="search"
                    v-model.trim="searchOptions.text"
                    class="w-full px-2 text-sm h-10 rounded-md focus:outline-none border-2 border-gray-200"
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
import { inject, nextTick, onUnmounted, reactive, ref, watch, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElNotification } from "element-plus";
import { useTaskFirestore } from "../utils/useTaskFirestore";
import { useDateTime } from "../utils/useDateTime";
import { useTrackFirestore } from "../utils/useTrackFirestore";
import { firebaseState, updateSettings } from "../utils/useFirebase";
import { startFireworks } from "../utils/useConfetti";
import BadgeItem from "../components/atoms/BadgeItem.vue";
import TaskGroup from "../components/organisms/TaskGroup.vue";
import WelcomeModal from "../components/organisms/WelcomeModal.vue";
import TaskModal from "../components/organisms/TaskModal.vue";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";

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
  badges: [
    {      
      iconClass: 'fa-award',
      level: 1,
      tier: 'task',
      name: 'Doer',
      xp: 1,
      nextLevelXp: 10
    },
    {      
      iconClass: 'fa-award',
      level: 1,
      tier: 'task',
      name: 'Finisher',
      xp: 1,
      nextLevelXp: 10
    },
    {      
      iconClass: 'fa-medal',
      level: 1,
      tier: 'system',
      name: 'Streak',
      xp: 1,
      nextLevelXp: 10
    },
    {      
      iconClass: 'fa-medal',
      level: 1,
      tier: 'system',
      name: 'Zen',
      xp: 1,
      nextLevelXp: 10
    },
      {      
      iconClass: 'fa-trophy',
      level: 1,
      tier: 'matrix',
      name: 'Matrix Master',
      xp: 1,
      nextLevelXp: 10
    },
    {      
      iconClass: 'fa-shield-alt',
      level: 1,
      tier: 'pomodoro',
      name: 'Pomodoro King',
      xp: 1,
      nextLevelXp: 10
    }
  ],
  badgesSummary: computed(() => {
    return state.badges.slice(0, 2)
  }),
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

// Timer
const currentTimer = ref({});

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