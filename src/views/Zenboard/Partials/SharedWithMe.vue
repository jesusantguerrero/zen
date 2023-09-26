<template>
  <!-- Shared -->
    <section class="py-4 quick__add" v-if="shared">
      <header class="flex justify-between mb-5 font-bold text-gray-500 bg-white py-2 px-4">
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
      </header>
      <section class="flex space-x-2">
        <div v-for="person in  shared" :key="person.uid" class="text-center cursor-pointer">
          <ElAvatar class="block"> {{ person.name }} </ElAvatar>
        </div>
      </section>
  </section>
</template>

<script setup>
import { inject, nextTick, onUnmounted, reactive, ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { ElNotification } from "element-plus";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";

import { useTaskFirestore } from "@/utils/useTaskFirestore";
import { useDateTime } from "@/utils/useDateTime";
import { useTrackFirestore } from "@/utils/useTrackFirestore";
import { firebaseState, updateSettings } from "@/utils/useFirebase";
import { startFireworks } from "@/utils/useConfetti";

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
