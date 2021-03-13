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
          <div class="quick__add py-4">
            <h4 class="font-bold text-gray-500"> Today's agenda</h4>
            <div class="text-white font-bold h-20 bg-white rounded-md ring ring-offset-2 ring-transparent ring-offset-gray-200 shadow-md">
             
            </div>
          </div>

          <div class="flex space-x-4">
            <!-- Overdue -->
            <div class="quick__add py-4 w-3/12">
              <h4 class="font-bold text-gray-500"> Badges</h4>
              <div class="text-white font-bold h-20 bg-white rounded-md ring ring-offset-2 ring-transparent ring-offset-gray-200 shadow-md">
              
              </div>
            </div>

            <!-- Overdue -->
            <div class="quick__add py-4 w-9/12">
              <h4 class="font-bold text-gray-500"> Overdue</h4>
              <div class="text-white font-bold h-20 bg-white rounded-md ring ring-offset-2 ring-transparent ring-offset-gray-200 shadow-md">
              
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
            <div class="grid grid-cols-2 gap-4 text-white font-bold">
              <div class="h-20 flex justify-center items-center shadow-md rounded-md bg-green-400 cursor-pointer ring ring-offset-2 ring-transparent ring-offset-green-500">
                Todo ({{ state.matrix.todo.list.length }})
              </div>
              <div class="h-20 flex justify-center items-center shadow-md rounded-md bg-blue-400 cursor-pointer ring ring-offset-2 ring-transparent ring-offset-blue-500">
                Schedule ({{ state.matrix.schedule.list.length }})
              </div>
              <div class="h-20 flex justify-center items-center shadow-md rounded-md bg-yellow-400 cursor-pointer ring ring-offset-2 ring-transparent ring-offset-yellow-500">
                Delegate ({{ state.matrix.delegate.list.length }})
              </div>
              <div class="h-20 flex justify-center items-center shadow-md rounded-md bg-red-400 cursor-pointer hover:scale-110 ring ring-offset-2 ring-transparent ring-offset-red-500">
                Delete ({{ state.matrix.delete.list.length }})
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

          <!-- Shared -->
           <div class="quick__add py-4">
              <div class="font-bold text-gray-500 flex justify-between mb-5">
                <h4>
                  Sharing with
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
                <div v-for="i in  [1,2]" :key="i" class="text-center">
                  <el-avatar class="block">JG</el-avatar>
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
import { ElMessageBox, ElNotification } from "element-plus";
import { useTaskFirestore } from "../utils/useTaskFirestore";
import { useTrackFirestore } from "../utils/useTrackFirestore";
import { firebaseState, updateSettings } from "../utils/useFirebase";
import { startFireworks } from "../utils/useConfetti";
import TaskGroup from "../components/organisms/TaskGroup.vue";
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
  matrix: {
    todo: {
      ref: null,
      list: []
    },
    schedule: {
      ref: null,
      list: []
    },
    delegate: {
      ref: null,
      list: []
    },
    delete: {
      ref: null,
      list: []
    },
  },
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

<style scoped>
.zen__datails {
  min-height: 400px;
}
</style>
