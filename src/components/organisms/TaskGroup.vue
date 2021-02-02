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
      <div class="list-group w-full ic-scroller" ref="listGroup">
        <draggable
          class="dragArea" 
          tag="transition-group" 
          :component-data="{name:'fade'}"
          :sort="true"
          :list="tasks" 
          handle=".handle"
          :group="{name: type, pull: true, put: true }"
          @move="emitMove"
          @change="emitChange($event, type)"
          v-show="isExpanded"
        >
          <task-item 
            v-for="task in filteredList" 
            :key="task" 
            :task="task" 
            :type="type"
            :handle-mode="handleMode"
            :icons="icons"
            @selected="emitSelected(task)"
            @deleted="emitDeleted(task)"
            @edited="emitEdited(task)"
            @up="emitUp(task)"
            @down="emitDown(task)"
          />
        </draggable>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup>
import { computed, defineProps, onMounted, reactive, ref, toRefs, watch } from "vue"
import { VueDraggableNext as Draggable } from "vue-draggable-next"
import TaskItem from "../molecules/TaskItem.vue"
import IconExpand from "../atoms/IconExpand.vue"
import IconCollapse from "../atoms/IconCollapse.vue"
import { useFuseSearch } from "../../utils/useFuseSearch"

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
    maxHeight: {
      default: 340,
      type: Number
    }
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

const { tasks, search } = toRefs(props)

const { filteredList } = useFuseSearch(search, tasks);

const emitDeleted = (task) => {
  emit('deleted', task)
}

const emitSelected = (task) => {
  emit('selected', task)
}

const emitEdited = (task) => {
  emit('edited', task)
}
const emitUp = (task) => {
  emit('up', task)
}
const emitDown = (task) => {
  emit('down', task)
}

const isExpanded = ref(true);

const onChange = ({ added, removed }, matrix) => {
    if (added) {
      added.element.matrix = matrix;
      this.$emit("changed", added.element);
    }
}

const emitMove = (evt, originalEvent) => {
  console.log(evt, 'modedasdsa')
  emit('move', evt, originalEvent)
}

const emitChange = ( evt, matrix ) => {
  emit('change', evt, matrix)
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
}
</script>

<style lang="scss" scoped>
:root {
--max-height: 340px;
}

.list-group {
  max-height: var(--max-height);
  overflow: auto;
}

.dragArea {
  min-height: 200px;
  border: dashed 1px #ddd;
}
</style>
