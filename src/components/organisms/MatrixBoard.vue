<template>
  <div class="mb-20 ">
    <div class="md:block lg:flex matrix">
      <div 
          class="grid md:grid-cols-2 md:gap-10" 
          :class="{
            'w-full':isLineUp, 
            'sm:w-full lg:w-full': isMatrix && !showUncategorized,
            'sm:w-full md:8/12': isMatrix && showUncategorized
          }"
          v-if="isMatrix || isLineUp"
        >
        <div 
          class="w-full pt-3 mb-10 md:mb-0 ic-scroller" 
          :class="[showHelp && (!isLineUp || isLineUpMatrix(matrix))? `border-2 ${state.quadrants[matrix].border} border-dashed pr-5 pl-3`: '', 
          ]"
          v-for="matrix in state.matrix" :key="matrix">
            <TaskGroup
              v-if="!isLineUp || isLineUpMatrix(matrix)"
              :title="getMatrixName(matrix)"
              :type="matrix"
              :search="search"
              :tasks="getMatrixTasks(matrix)"
              :color="state.quadrants[matrix].color"
              :show-controls="allowUpdate"
              :allow-update="allowUpdate"
              :allow-move="false"
              :handle-mode="true"
              @done="onDone"
              @undone="onDone"
              @deleted="destroyTask"
              @edited="setTaskToEdit"
              @change="handleDragChanges"
              @plus="addOccurrence($event, 'up')"
              @minus="addOccurrence($event, 'down')"
              @down="moveTo($event, 'schedule')"
              @up="moveTo($event, 'todo')"
              @move="onMove"
              :is-quadrant="true"
            >
              <template #addForm v-if="!showHelp && allowAdd">
                <div class="mb-4 quick__add">
                  <QuickAdd 
                    @saved="addTask"
                    :allow-edit="true"
                    :type="matrix"
                  />
                </div>
              </template>

              <template #content v-if="showHelp">
                <matrix-help-view :matrix="matrix"></matrix-help-view>
              </template>
            </TaskGroup>
        </div>
      </div>

      <div 
        :class="{
          'md:w-full': isBacklog, 
          'md:w-4/12 md:ml-20': isMatrix && showUncategorized,
          'md:hidden': isMatrix && !showUncategorized,
          'border-2 border-gray-400 border-dashed pr-5 pl-5': showHelp
        }" 
        class="pt-3" v-if="isBacklog || showUncategorized && !state.isTimeLine">
          <TaskGroup
              title="No prioritized"
              type="backlog"
              color="text-gray-400"
              :tasks="getMatrixTasks('backlog')"
              :handle-mode="allowUpdate"
              :is-quadrant="true"
              :show-controls="allowUpdate"
              :max-height="isBacklog ? 0 : 350"
              @done="onDone"
              @undone="onDone"
              @deleted="destroyTask"
              @edited="setTaskToEdit"
              @change="handleDragChanges"
              @move="onMove"
            >
              <template #addForm v-if="!showHelp && allowAdd">
                <div class="mb-4 quick__add">
                  <QuickAdd 
                    @saved="addTask"
                    :allow-edit="true"
                    type="backlog"
                  />
                </div>
              </template>

              <template #content v-if="showHelp">
                <matrix-help-view matrix="backlog"></matrix-help-view>
              </template>
          </TaskGroup>
      </div>
    </div>

    <div class="w-full px-5 py-4 bg-white rounded-md shadow-md" v-if="mode == 'timeline'">
      <div class="mb-2 font-bold text-left text-gray-500">
            Timeline: <span class="text-sm font-normal">Track the number of days since the task was created until today</span>
      </div>
      <RoadmapView 
        :show-toolbar="true"
        :tasks="roadmapTasks" 
        @task-clicked="setTaskToEdit"
        focused-text-class="text-green-500"
        marker-bg-class="bg-green-400"
      >
        <template v-slot:description="{focusedTextClass, item: task, differenceInCalendarDays: days}">
           <div class="flex items-center h-full mx-2 text-left">
            <span class="text-gray-400 capitalize" :class="getMatrixColor(task.matrix)">
              {{ task.matrix}}:
            </span>
               {{ task.title }} 
              <span class="ml-2 text-sm font-bold" :class="focusedTextClass">
                {{ days }} days
              </span>
            </div>
        </template>

        <template #actionsRight>
           <div class="flex items-center">
              <label class="mr-2"> Sort By:</label>
              <jet-select
                v-model:selected="roadmapState.sortBy"
                :options="roadmapState.sortFields"
                label="label"
                key-track="value"
                class="w-32"
              >
              </jet-select>
           </div>
        </template>
      </RoadmapView> 
    </div>

    <TaskModal 
      v-model:is-open="state.isTaskModalOpen" 
      :task-data="taskToEdit" 
      @saved="onEdittedTask"
      @closed="taskToEdit = null"
    />
  </div>
</template>

<script setup>
import { computed, reactive, watch, ref, onUnmounted, toRefs } from 'vue'
import { ElMessageBox, ElNotification } from 'element-plus';
import { orderBy } from "lodash-es"
import { differenceInCalendarDays } from 'date-fns';
import { RoadmapView } from "vue-temporal-components";

import TaskGroup from "@components/organisms/TaskGroup.vue"
import QuickAdd from "@components/molecules/QuickAdd.vue"
import TaskModal from "./modals/TaskModal.vue"
import MatrixHelpView from "@components/molecules/MatrixHelpView.vue"
import JetSelect from "@components/atoms/JetSelect.vue";

import { useFuseSearch } from "@/utils/useFuseSearch"
import { useTaskFirestore } from "@/utils/useTaskFirestore"
import { useDateTime } from "@/utils/useDateTime"
import { firebaseState } from '@/utils/useFirebase';


// state and ui
const props = defineProps({
    mode: {
        type: String,
        default: 'matrix'
    },
    showHelp: Boolean,
    showUncategorized: Boolean,
    search: String,
    user: String,
    allowUpdate: {
      type: Boolean,
      default: true
    },
    allowAdd: {
      type: Boolean,
      default: true
    }
})

const isBacklog = computed(() => {
    return props.mode == 'backlog'
})

const isMatrix = computed(() => {
    return props.mode.includes('matrix')
})

const isLineUp = computed(() => {
    return props.mode == 'lineup'
})

const isLineUpMatrix = (matrix) => {
    return isLineUp && ['todo','schedule'].includes(matrix)
}

const state = reactive({
  tasks: [],
  matrix: ['todo', 'schedule', 'delegate', 'delete'],
  quadrants: {
    todo: {
      color: 'text-green-400',
      border: 'border-green-400',
      background: 'bg-green-400',
      tasks: []
    },
    schedule: {
      color: 'text-blue-400',
      border: 'border-blue-400',
      background: 'bg-blue-400',
      tasks: []
    },
    delegate: {
      color: 'text-yellow-400',
      border: 'border-yellow-400',
      background: 'bg-yellow-400',
      tasks: []
    },
    delete: {
      color: 'text-red-400',
      border: 'border-red-400',
      background: 'bg-red-400',
      tasks: []
    },
    backlog: {
      background: 'bg-gray-400',
      color: '',
      tasks: []
    }
  },
  isTaskModalOpen: false,
  isTimeLine: computed(() => props.mode == 'timeline')
})

const { search } = toRefs(props);
const { tasks } = toRefs(state);
const { filteredList } = useFuseSearch(search, tasks);

// 
const roadmapState = reactive({
  sortBy: {
    name: 'matrix',
    label: 'Matrix'
  },
  sortFields: [
    {
      name: 'matrix',
      label: 'Matrix'
    },
    {
      name: 'diff',
      label: 'Duration'
    },
    {
      name: 'order',
      label: 'Order'
    }
  ]
})

const roadmapTasks = computed(() => {
    const filtered =  filteredList.value.map((task) => {
      task.start = task.created_at;
      task.end = new Date();
      const matrix = task.matrix || 'backlog';
      task.colorClass = state.quadrants[matrix]?.background
      task.diff = differenceInCalendarDays(task.start, task.end)
      return task;
    })

    return orderBy(filtered, roadmapState.sortBy.name);
})

const getMatrixColor = (matrixName) => {
  return state.quadrants[matrixName]?.color
}

// Tasks manipulation
const { toISO } = useDateTime() 
const { 
  getUncommittedTasks, 
  saveTask, 
  updateTask, 
  updateTaskBatch, 
  deleteTask ,
  addOccurrence,
} = useTaskFirestore()

const fetchTasks = () => {
  const collectionRef = getUncommittedTasks(props.user)
  const unsubscribe = collectionRef.get().then((snap) => {
      const tasks = [];
      snap.forEach((doc) => {
        tasks.push({ ...doc.data(), uid: doc.id });
      });
      state.tasks = tasks
  });

  return unsubscribe;
}

const uncommitedTasksRef = ref(fetchTasks());

watch(() => props.user, () => {
  uncommitedTasksRef.value = fetchTasks();
})

onUnmounted(() => {
  if (uncommitedTasksRef.value) {
    // uncommitedTasksRef.value();
  }
});

const getTasks = (mode = "default") => {
  const modes = {
    "default": state.tasks,
     overdue:  state.tasks.filter((item) => {
        return item.due_date && item.due_date < new Date();
      }),
      stale:  state.tasks.filter((item) => {
        return item.created_at && differenceInCalendarDays(new Date(), item.created_at) > 14;
      })
  }

  return modes[mode] || modes['default']
}

watch(() => [state.tasks, props.mode], () => {
  Object.values(state.quadrants).forEach((quadrant) => quadrant.tasks = []);
  const mode = props.mode.slice(props.mode.search(':') + 1);
  const tasks = getTasks(mode);

  tasks.forEach(task => {
    if (state.quadrants[task.matrix] && !state.quadrants[task.matrix].tasks) {
      state.quadrants[task.matrix].tasks = [task];
    } else if (state.quadrants[task.matrix]) {
      state.quadrants[task.matrix].tasks.push(task);
    }
  })
})

const getMatrixTasks = (matrix) => {
    const tasks = [...filteredList.value.filter(task => task.matrix == matrix)].sort((a, b) => {
      return a.order - b.order;
    })

    return search.value ? tasks : state.quadrants[matrix].tasks;
}

const getMatrixName = (matrix) => {
  const label = firebaseState.settings[`matrix_${matrix}_name`]
  return label || matrix
}

const getNextIndex = (list) => {
  return Math.max(...list.map((item) => Number(item.order || 0))) + 1;
};

const addTask = (task) => {
  task.order = getNextIndex(state.quadrants[task.matrix || 'backlog'].tasks);
  const formattedTask = {...task}
  formattedTask.due_date = toISO(formattedTask.due_date)
  saveTask(formattedTask).then((uid) => {
    task.uid = uid;
    ElNotification({
        type: "success",
        message: "Task created",
        title: "Task created"
    })
    state.quadrants[task.matrix].tasks.push(task);
  })
}

const destroyTask = async (task) => {
  const canDelete = await ElMessageBox.confirm("Are you sure you want to delete this task?", "Delete Task")
  if (canDelete) {
    deleteTask(task).then(() => {
      const quadrant = state.quadrants[task.matrix];
      quadrant.tasks = quadrant.tasks.filter(localTask => task.uid != localTask.uid)
      ElNotification({
        type: "success",
        message: "Task deleted",
        title: "Task deleted"
      })
    })
  }
}

const onDone = (task) => {
  const quadrant = state.quadrants[task.matrix];
  quadrant.tasks = quadrant.tasks.filter(localTask => task.uid != localTask.uid)
}

const moveTo = async (task, matrix) => {
    const oldMatrix = task.matrix
    task.matrix = matrix
    const quadrants = state.quadrants;
    updateTask(task).then(() => {
      quadrants[oldMatrix].tasks = quadrants[oldMatrix].tasks.filter(localTask => task.uid != localTask.uid)
      ElNotification({
        type: "success",
        message: "Task moved",
        title: "Task moved"
      })

    })
}

const handleDragChanges = (e, matrix) => {
  if (e.added) {
    e.added.element.matrix = matrix;
    e.added.element.order = e.added.newIndex;
    updateTask(e.added.element).then(() => {
      sortOrder(matrix).then(() => {
        ElNotification({
          message: `Moved to ${matrix}`
        })
      })
    })
  }

  if (e.moved) {
    sortOrder(matrix).then(() => {
      ElNotification({
        message: `Moved to ${matrix}`
      })
    })
  }
}

const sortOrder = (matrix) => {
   const tasks = getMatrixTasks(matrix)
    return updateTaskBatch(tasks.map((task, index) => {
      task.order = index
      return task
    }))
}

// Edit task
const taskToEdit = ref({});
const setTaskToEdit = (task) => {
  taskToEdit.value = task
  state.isTaskModalOpen = false;
  state.isTaskModalOpen = true;
}
const onEdittedTask = (task) => {
  const index = state.quadrants[task.matrix].tasks.findIndex(localTask => localTask.uid == task.uid)
  state.quadrants[task.matrix].tasks[index] = {...task};
  taskToEdit.value = null
}
</script>
