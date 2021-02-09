<template>
  <div class="task-group">
    <div class="flex justify-between cursor-pointer items-center">
      <h4 class="mb-2 font-bold" :class="[isQuadrant ? `md:text-2xl font-bold ${color} capitalize`: '']">
         {{ title }}
          ( {{ tasks.length}} ) 
        </h4>
      
      <div @click="toggleExpanded">
         <icon-expand v-if="!isExpanded"/>
         <icon-collapse v-else/>
      </div>
    </div>

      <slot name="addForm"></slot>
      <el-collapse-transition>
        <div class="list-group w-full ic-scroller" ref="listGroup"  v-show="isExpanded">
          <draggable
            class="dragArea"
            :class="{empty: !tasks.length,  [type]: true }" 
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
              :handle-mode="handleMode"
              :icons="icons"
              :show-select="showSelect"
              :show-controls="showControls"
              :current-task="currentTask"
              :current-timer="currentTimer"
              @toggle-key="onToggleKey(task)"
              @selected="emit('selected', task)"
              @deleted="emit('deleted', task)"
              @edited="emit('edited', task)"
              @up="emit('up', task)"
              @down="emit('down', task)"
            />
          </draggable>
          <slot name="empty" v-if="!tasks.length"></slot>
        </div>
      </el-collapse-transition>
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
    currentTimer: Object,
    maxHeight: {
      default: 340,
      type: Number
    },
    isItemAsHandler: Boolean
})
const listGroup = ref(null);

onMounted(() => {
  if (props.maxHeight && listGroup.value) {
    listGroup.value.style.setProperty("--max-height", `${props.maxHeight}px`);
  }
})

const emit = defineEmit({
  deleted: Object,
  selected: Object,
  edited: Object,
  up: Object,
  down: Object,
  move: Object,
  change: Object
})

const { tasks, search, showSelect, currentTask, currentTimer, isItemAsHandler } = toRefs(props)

const { filteredList } = useFuseSearch(search, tasks);
const handleClass = computed(() => {
  return isItemAsHandler.value ? null : '.handle'
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
}

.list-group {
  max-height: var(--max-height);
  overflow: auto;
}

.matrix {
  .dragArea {
    // min-height: 200px;
  
    // &.empty {
      &::after {
        width: 100%;
        height: 100%;
        position: relative;
      }
      &.todo::after {
        @apply text-gray-400 font-bold;
        content: "Important & Urgent Tasks"
      }
      &.schedule::after {
        @apply text-gray-400 font-bold;
        content: "Important but not urgent"
      }
      &.delegate::after {
        @apply text-gray-400 font-bold;
        content: "Urgent but not important"
      }
      &.delete::after {
        @apply text-gray-400 font-bold;
        content: "not Important & not urgent"
      }
    // }
  }
}
</style>
