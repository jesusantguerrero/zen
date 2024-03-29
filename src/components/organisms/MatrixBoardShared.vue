<template>
  <div class="mb-20 md:block lg:flex matrix">
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
            v-if="matrixes.includes(matrix)"
            :title="matrix"
            :type="matrix"
            :search="search"
            :tasks="state.quadrants[matrix].tasks"
            :color="state.quadrants[matrix].color"
            :show-controls="true"
            :allow-move="false"
            :handle-mode="true"
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
            :tasks="state.quadrants['backlog'].tasks"
            :search="search"
            color="text-gray-400"
            :handle-mode="true"
            :is-quadrant="true"
            :max-height="isBacklog ? 0 : 350"
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

    <task-modal 
      v-model:is-open="state.isTaskModalOpen" 
      :task-data="taskToEdit" 
      @saved="onEdittedTask"
      @closed="taskToEdit = null"
    >
    </task-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch, ref } from 'vue'
import { ElMessageBox, ElNotification } from 'element-plus'
import { useDateTime } from "@/composables/useDateTime"
import MatrixHelpView from "@/components/molecules/MatrixHelpView.vue"
import QuickAdd from "@/components/molecules/QuickAdd.vue"
import TaskGroup from "@/components/organisms/TaskGroup.vue"
import TaskModal from "@/components/organisms/modals/TaskModal.vue"
import { useTaskFirestore } from '@/plugins/firebase/useTaskFirestore'


// state and ui
const props = defineProps({
    mode: {
        type: String,
        default: 'matrix'
    },
    matrixes: Array,
    selectedUser: String,
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
      tasks: []
    },
    schedule: {
      color: 'text-blue-400',
      border: 'border-blue-400',
      tasks: []
    },
    delegate: {
      color: 'text-yellow-400',
      border: 'border-yellow-400',
      tasks: []
    },
    delete: {
      color: 'text-red-400',
      border: 'border-red-400',
      tasks: []
    },
    backlog: {
      color: '',
      tasks: []
    }
  },
  isTaskModalOpen: false
})

// Tasks manipulation
const { toISO } = useDateTime() 
const { getUncommitedTasks, saveTask, updateTask, updateTaskBatch, deleteTask } = useTaskFirestore()

getUncommitedTasks(null, props.selectedUser, props.matrixes).get().then(snap => {
    const tasks = [];
    snap.forEach((doc) => {
      tasks.push({ ...doc.data(), uid: doc.id });
    });
    state.tasks = tasks
});

watch(() => state.tasks, () => {
  state.tasks.forEach(task => {
    if (state.quadrants[task.matrix] && !state.quadrants[task.matrix].tasks) {
      state.quadrants[task.matrix].tasks = [task];
    } else if (state.quadrants[task.matrix]) {
      state.quadrants[task.matrix].tasks.push(task);
    }
  })
})

const addTask = (task) => {
  const formattedTask = {...task}
  formattedTask.due_date = toISO(formattedTask.due_date)
  saveTask(formattedTask).then((uid) => {
    task.uid = uid;
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

const moveTo = async (task, matrix) => {
    const oldMatrix = task.matrix
    task.matrix = matrix
    const quadrants = state.quadrants;
    updateTask(task).then(() => {
      quadrants[oldMatrix].tasks = quadrants[oldMatrix].tasks.filter(localTask => task.uid != localTask.uid)
      quadrants[matrix].tasks.push(task)
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
    updateTask(e.added.element).then(() => {
      ElNotification({
        message: `Moved to ${matrix}`
      })
    })
  }

  if (e.moved) {
    updateTaskBatch(state.quadrants[matrix].tasks.map((task, index) => {
      task.order = index
      return task
    })).then(() => {
      ElNotification({
        message: `Moved to ${matrix}`
      })
    })
  }
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