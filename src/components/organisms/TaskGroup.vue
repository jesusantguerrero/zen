<template>
  <div class="task-group">
    <div class="flex justify-between cursor-pointer items-center" v-if="showTitle">
      <h4 class="mb-2 font-bold block" :class="[isQuadrant ? `md:text-2xl font-bold ${color} capitalize`: '']">
         {{ title }} ({{ tasks.length }}) 
      </h4>
      
      <div class="flex">
        <small class="text-sm  mr-2 text-gray-400 font-bold">{{ helpText }}</small>
        <div @click="toggleExpanded">
          <icon-expand v-if="!isExpanded"/>
          <icon-collapse v-else/>
        </div>
      </div>
    </div>

      <slot name="addForm"></slot>
      <slot name="content">
        <el-collapse-transition>
          <div class="list-group w-full ic-scroller" ref="listGroup"  v-show="isExpanded">
            <draggable
              class="dragArea"
              :class="{empty: !tasks.length,  [type]: true , [dragClass]: true}" 
              :list="tasks" 
              :handle="handleClass"
              :group="{name: type, pull: true, put: true }"
              @move="emitMove"
              @change="emitChange($event, type)"
            >
              <task-item 
                v-for="task in filteredList" 
                :key="task" 
                :task="task" 
                :type="type"
                :handle-mode="displayHandle"
                :icons="icons"
                :show-select="showSelect"
                :show-controls="showControls"
                :current-task="currentTask"
                :current-timer="currentTimer"
                :is-item-as-handler="isItemAsHandler"
                :class="taskClass"
                @toggle-key="onToggleKey(task)"
                @selected="emit('selected', task)"
                @deleted="emit('deleted', task)"
                @updated="updateFields"
                @edited="emit('edited', task)"
                @undo="emit('undo', task)"
                @up="emit('up', task)"
                @down="emit('down', task)"
              />
            </draggable>
            <slot name="empty" v-if="!tasks.length"></slot>
          </div>
        </el-collapse-transition>
      </slot>
  </div>
</template>

<script setup>
import { computed, defineProps, onMounted, ref, toRefs } from "vue"
import { VueDraggableNext as Draggable } from "vue-draggable-next"
import TaskItem from "../molecules/TaskItem.vue"
import IconExpand from "../atoms/IconExpand.vue"
import IconCollapse from "../atoms/IconCollapse.vue"
import { useFuseSearch } from "../../utils/useFuseSearch"
import { useTaskFirestore } from "../../utils/useTaskFirestore"
import { ElNotification } from "element-plus"
import { useMediaQuery, useWindowSize } from "@vueuse/core"

const props = defineProps({
    tasks: {
        type: Array,
        default() {
            return []
        }
    },
    isQuadrant: Boolean,
    color: String,
    title: String,
    type: String,
    icons: Array,
    handleMode: Boolean,
    search: String,
    showControls: Boolean,
    showSelect: Boolean,
    currentTask: {
      type: Object,
      default() {
        return {}
      }
    },
    tags: Array,
    currentTimer: Object,
    showTitle: {
      type: Boolean,
      default: true,
    },
    maxHeight: {
      default: 340,
      type: Number
    },
    taskClass: {
      type: String
    },
    dragClass: {
      type: String
    },
    placeholder: String,
    isItemAsHandler: Boolean
})
const listGroup = ref(null);

onMounted(() => {
  if (props.maxHeight && listGroup.value) {
    listGroup.value.style.setProperty("--max-height", `${props.maxHeight}px`);
    if (props.placeholder) {
      listGroup.value.style.setProperty("--placeholder", `"${props.placeholder}"`);
    }
  }
})

const emit = defineEmit({
  deleted: Object,
  selected: Object,
  edited: Object,
  up: Object,
  down: Object,
  move: Object,
  change: Object,
  undo: Object
})

const { tasks, search,tags, showSelect, currentTask, currentTimer, isItemAsHandler, handleMode } = toRefs(props)

const { filteredList } = useFuseSearch(search, tasks, tags);

const { width, height } = useWindowSize()

const handleClass = computed(() => {
  if (width.value > 758 && (handleMode.value || isItemAsHandler.value)) {
    return null;
  } else {
    return '.handle'
  }
})

const displayHandle = computed(() => {
  if (width.value < 758) {
    return isItemAsHandler.value || handleMode.value;
  } else {
    return handleMode.value
  }
})

const helpText = computed(() => {
const help = {
    todo: {
      content: "Important & Urgent Tasks"
    },
    schedule: {
      content: "Important but not urgent"
    },
    delegate: {
      content: "Urgent but not important"
    },
    delete:{
      content: "not Important & not urgent"
    } 
};

return help[props.type] ? help[props.type].content : '';
})

// expand
const isExpanded = ref(true);
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
}

// Events
const onChange = ({ added, removed }, matrix) => {
    if (added) {
      added.element.matrix = matrix;
      this.$emit("changed", added.element);
    }
}

const emitMove = (evt, originalEvent) => {
  emit('move', evt, originalEvent)
}

const emitChange = ( evt, matrix ) => {
  emit('change', evt, matrix)
}

const { updateTask } = useTaskFirestore();
const keyTasks = computed(() => {
  return tasks.value.filter(item => item.is_key).length;
});

const onUndo = (task) => {
  task.tracks = [];
  task.commit_date = null;
  task.done = false;
  delete task.duration_ms;

  updateTask(task)
};

const onDone = () => {
  task.tracks = [];
  task.commit_date = null;
  task.done = false;
  delete task.duration_ms;

  updateTask(task)
}

const updateFields = (task) => {
  const formData = {...task}
  formData.track = [];
  updateTask(formData);
}

const onToggleKey = (task) => {
  if (!task.is_key && keyTasks.value < 3) {
      task.is_key = true
      updateTask({
        uid: task.uid,
        is_key: task.is_key
      })
      ElNotification({
        message: "Marked as key"
      })
  } else if (task.is_key) {
    task.is_key = false;
    updateTask({
      uid: task.uid,
      is_key: task.is_key
    })
  }
}
</script>

<style lang="scss">
:root {
--max-height: 340px;
--placeholder: "Drop Here"
}

.list-group {
  min-height: var(--max-height);
  overflow: auto;
  
}

.dragArea {
  @apply rounded-md;
  background: rgba(229, 231, 235, .2);
  padding-bottom: 40px;
}

.dragArea {
    &::after {
      @apply text-gray-400 font-bold;
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
      bottom: -15px;
      content: var(--placeholder);
      font-size: 14px;
      text-align: center;
    }
}
</style>
