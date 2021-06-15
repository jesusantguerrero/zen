<template>
  <div class="mb-20 ">
    <div class="md:block lg:flex matrix">
      <div 
          class="grid md:grid-cols-2 md:gap-10" 
          :class="{'w-full':isLineUp, 'sm:w-full lg:w-8/12': isMatrix}"
          v-if="isMatrix || isLineUp"
        >
        <div 
          class="zen__comming-up w-full mb-10 md:mb-0 ic-scroller pl-5 pt-3" 
          :class="[showHelp && (!isLineUp || isLineUpMatrix(matrix))? `border-2 ${state.quadrants[matrix].border} border-dashed pr-5`: '']"
          v-for="matrix in state.matrix" :key="matrix">
            <task-group
              v-if="!isLineUp || isLineUpMatrix(matrix)"
              :title="matrix"
              :type="matrix"
              :search="search"
              :tasks="getMatrixTasks(matrix)"
              :color="state.quadrants[matrix].color"
              :show-controls="true"
              :allow-move="false"
              :handle-mode="true"
              @done="onDone"
              @undone="onDone"
              @deleted="destroyTask"
              @edited="setTaskToEdit"
              @change="handleDragChanges"
              @down="moveTo($event, 'schedule')"
              @up="moveTo($event, 'todo')"
              @move="onMove"
              :is-quadrant="true"
            >
              <template #addForm v-if="!showHelp">
                <div class="quick__add mb-4">
                  <quick-add 
                    @saved="addTask"
                    :allow-edit="true"
                    :type="matrix"
                  ></quick-add>
                </div>
              </template>

              <template #content v-if="showHelp">
                <matrix-help-view :matrix="matrix"></matrix-help-view>
              </template>
            </task-group>
        </div>
      </div>

      <div 
        :class="{
          'md:w-full': isBacklog, 
          'md:w-4/12 md:ml-20': isMatrix,
          'border-2 border-gray-400 border-dashed pr-5 pl-5': showHelp}
          " class="pt-3" v-if="isBacklog || isMatrix">
          <task-group
              title="backlog"
              type="backlog"
              color="text-gray-400"
              :tasks="getMatrixTasks('backlog')"
              :handle-mode="true"
              :is-quadrant="true"
              :show-controls="true"
              :max-height="isBacklog ? 0 : 350"
              @done="onDone"
              @undone="onDone"
              @deleted="destroyTask"
              @edited="setTaskToEdit"
              @change="handleDragChanges"
              @move="onMove"
            >
              <template #addForm v-if="!showHelp">
                <div class="quick__add mb-4">
                  <quick-add 
                    @saved="addTask"
                    :allow-edit="true"
                    type="backlog"
                  ></quick-add>
                </div>
              </template>

              <template #content v-if="showHelp">
                <matrix-help-view matrix="backlog"></matrix-help-view>
              </template>
          </task-group>
      </div>
    </div>

    <div class="w-full bg-white rounded-md shadow-md px-5 py-4" v-if="mode == 'timeline'">
      <div class="font-bold text-gray-500 text-left  mb-2">
            Timeline: <span class="font-normal text-sm">Track the number of days since the task was created until today</span>
      </div>
      <roadmap-view 
        :show-toolbar="true"
        :tasks="roadmapTasks" 
        @task-clicked="setTaskToEdit"
        focused-text-class="text-green-500"
        marker-bg-class="bg-green-400"
      >
        <template v-slot:description="{focusedTextClass, item: task, differenceInCalendarDays: days}">
           <div class="mx-2 text-left h-full flex items-center">
            <span class="capitalize text-gray-400" :class="state.quadrants[task.matrix].color">
              {{ task.matrix}}:
            </span>
               {{ task.title }} 
              <span class="text-sm font-bold ml-2" :class="focusedTextClass">
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
      </roadmap-view> 
    </div>

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
import { computed, defineProps, reactive, watch, ref, onUnmounted, toRefs } from 'vue'
import { ElMessageBox, ElNotification } from 'element-plus';
import { RoadmapView } from "vue-temporal-components";
import { useTaskFirestore } from "../../utils/useTaskFirestore"
import { useDateTime } from "../../utils/useDateTime"
import { useFuseSearch } from "../../utils/useFuseSearch"
import TaskGroup from "../organisms/TaskGroup.vue"
import QuickAdd from "../molecules/QuickAdd.vue"
import TaskModal from "./TaskModal.vue"
import MatrixHelpView from "../molecules/MatrixHelpView.vue"
import JetSelect from "../atoms/JetSelect.vue";
import { orderBy } from "lodash-es"
import { differenceInCalendarDays } from 'date-fns';


// state and ui
const props = defineProps({
    mode: {
        type: String,
        default: 'matrix'
    },
    showHelp: Boolean,
    search: String
})

const isBacklog = computed(() => {
    return props.mode == 'backlog'
})

const isMatrix = computed(() => {
    return props.mode == 'matrix'
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
  isTaskModalOpen: false
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
      task.start = task.created_at.toDate();
      task.end = new Date();
      task.colorClass = state.quadrants[task.matrix].background
      task.diff = differenceInCalendarDays(task.start, task.end)
      return task;
    })

    return orderBy(filtered, roadmapState.sortBy.name);
})

// Tasks manipulation
const { toISO } = useDateTime() 
const { getUncommitedTasks, saveTask, updateTask, updateTaskBatch, deleteTask } = useTaskFirestore()

const fetchTasks = () => {
  const collectionRef = getUncommitedTasks()
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

onUnmounted(() => {
  if (uncommitedTasksRef.value) {
    // uncommitedTasksRef.value();
  }
});

watch(() => state.tasks, () => {
  Object.values(state.quadrants).forEach((quadrant) => quadrant.tasks = []);
  
  state.tasks.forEach(task => {
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

const addTask = (task) => {
  const formattedTask = {...task}
  formattedTask.due_date = toISO(formattedTask.due_date)
  saveTask(formattedTask).then((uid) => {
    task.uid = uid;
    ElNotification({
        type: "success",
        message: "Task created",
        title: "Task created"
    })
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

<style lang="scss" scoped>
.zen__comming-up {
  min-height: 500px;
  overflow: auto;
}
</style>
