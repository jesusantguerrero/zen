<template>
  <div 
    class="task-item mb-2 bg-white border-gray-200 hover:border-green-200 border-2 px-4 rounded-md items-center transition-all cursor-pointer"
    :class="{'border-green-400': isSelected, 'py-3 shadow-md ' : !isCompact }"
    @click="$emit('selected', task)"
    @dblclick.prevent="$emit('edited', task)"

  >
    <div class="flex justify-between">
      <div class="flex items-start md:items-center text-xs">
        <div v-if="handleMode" class="handle text-gray-300 cursor-move mr-2"><i class="fa fa-arrows-alt"></i></div>
        
        <div 
          v-if="showSelect" 
          class="mr-3 rounded-md px-2 py-1 border-2 border-transparent hover:bg-green-400 hover:text-white" 
          :class="[isDisabled && 'cursor-not-allowed', isSelected ? 'bg-green-400 text-white' : 'bg-green-100 text-green-400']"
          :title="isDisabled? 'Can change task when timer is running' : 'Click to select'"
          :disabled="isDisabled"
          @click.stop="$emit('selected', task)"
        > 
            <i :class="[!task.is_key ? 'fa fa-sticky-note' : 'fa fa-fire']"></i>
        </div>

        <div v-else class="mr-3 rounded-md px-2 py-1 border-2 border-transparent" :class="[typeColor, keyStyles]"> 
            <i :class="[!task.is_key ? 'fa fa-sticky-note' : 'fa fa-fire']"></i>
        </div>

        <h4 class="task-item__title cursor-pointer m-0 text-left text-sm "> {{ task.title }}</h4>
      </div>

      <div class="task-item__controls flex md:items-center items-start">  
        <div class="md:flex flex-wrap justify-end mr-1">
          <person-select
            v-if="type=='delegate'"
            v-model="task.contacts"
            :items="contacts"
            :multiple="true" 
            @update:modelValue="$emit('updated', task)" 
            @selected="addContact"
            @added="createContact"
          /> 
          
          <div
            v-else-if="type=='delete'" 
            class="mx-2 text-gray-400 hover:text-red-400 md:text-md cursor-pointer text-sm md:text-base"
            @click="$emit('deleted', task)"
            title="Delete">
            <i class="fa fa-trash mr-1"></i>
          </div>
          <time-tracker-button
            :allow-run="allowRun"
            :default-value="timeTrackedLabel"
            :currentTimer="currentTimer"
            :is-current="currentTask.uid == task.uid"
            :task="currentTask"
            @toggle-timer="$emit('toggle-timer', task)"
          />

          <date-select 
            :class="dateStates.color" 
            :title="dateStates.title" 
            @update:modelValue="$emit('updated', {...task, due_date: $event })" 
            v-if="task.due_date || type == 'schedule'"
            v-model="task.due_date" 
          />   
          <button class="bg-gray-600 text-white text-xs px-2 rounded-md hover:bg-gray-500 transition-colors" v-if="task.done" @click.stop="$emit('undo', task)">Undo</button>
        </div>

        <el-dropdown trigger="click" @command="handleCommand" v-if="showControls" :disabled="isDisabled" @click.stop="">
          <div class="px-2 py-1 hover:bg-gray-200 rounded-md text-sm focus:outline-none text-gray-400 hover:text-gray-600" :title="isDisabled? 'Can updates tasks when timer is running' : ''" @click.stop="">
            <i class="fa fa-ellipsis-v"></i>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="edit" icon="el-icon-edit">Edit</el-dropdown-item>
              <el-dropdown-item command="delete" icon="el-icon-delete">Delete </el-dropdown-item>
              <el-dropdown-item command="done" icon="el-icon-check" v-if="!task.done"> Mark as done </el-dropdown-item>
              <el-dropdown-item command="undo" icon="el-icon-refresh-left" v-else> undo </el-dropdown-item>
              <el-dropdown-item command="clone" icon="el-icon-document-copy"> Duplicate </el-dropdown-item>
              <el-dropdown-item command="toggle-key" icon="el-icon-s-flag" v-if="task.matrix=='todo'"> Key task </el-dropdown-item>
              <el-dropdown-item command="up" icon="el-icon-arrow-left" v-if="task.matrix=='schedule'">Move to todo</el-dropdown-item>
              <el-dropdown-item command="down" icon="el-icon-arrow-right" v-if="task.matrix=='todo'">Move to schedule</el-dropdown-item>
            </el-dropdown-menu>
          </template>
      </el-dropdown>
      </div>
    </div>

    <div class="flex items-center mt-1 text-xs" :class="{'justify-between': task.due_date }" v-if="!isCompact">
      <button 
        title="Description" 
        class="px-2 py-1 rounded-md hover:bg-gray-200 focus:outline-none" 
        @click.stop="toggleExpand" v-if="task.description">
        <i class="fa fa-align-left"></i>
      </button>
      <button 
        title="Checklist" 
        class="px-2 py-1 rounded-md  hover:bg-gray-200 focus:outline-none w-20 flex items-center" 
        @click.stop="toggleExpand" v-if="task.checklist.length">
        <i class="fa fa-list-ul mr-2"></i>
        <div> 
          <span class="font-bold">{{ task.checklist.filter(item => item.done).length  }}</span> / {{ task.checklist.length  }} 
        </div>
      </button>

      <div class="w-full flex justify-end">
          <tags-select
            v-model="task.tags"
            :tags="tags"
            :multiple="true" 
            @update:modelValue="$emit('updated', {...task, tags: $event })" 
            @selected="addTag"
            @added="createTag"
          /> 
      </div>
    </div>

    <!-- Item body -->
    <el-collapse-transition>
      <div class="task-item__body" v-show="isExpanded">
        <div
          class="task-item__description pt-2 text-left whitespace-pre-line" 
          placeholder="Add a short description"
          :class="{'text-gray-400 text-sm': !task.description }">
            {{ task.description || 'No description provided'}}
      </div>
        <div class="task-item__checklist mt-5">
          <checklist-container :items="task.checklist" :task="task"  @updated="updateItems"></checklist-container>
        </div>
      </div>
    </el-collapse-transition>
    <!-- /item body -->
  </div>

</template>

<script>
import { toRefs, computed, reactive } from "vue"
import { ElNotification } from "element-plus";
import ChecklistContainer from "../organisms/ListContainer.vue"
import PersonSelect from "../atoms/PersonSelect.vue"
import TagsSelect from "../atoms/TagsSelect.vue"
import DateSelect from "../atoms/DateSelect.vue"
import TimeTrackerButton from "../atoms/tracker/TimeTrackerButton.vue";
import { useDateTime } from "../../utils/useDateTime";
import { useCustomSelect } from "../../utils/useCustomSelect";

export default {
  components: {
    ChecklistContainer,
    PersonSelect,
    TagsSelect,
    DateSelect,
    TimeTrackerButton
  },
  props: {
    task: Object,
    type: String,
    currentTask: Object,
    handleMode: Boolean,
    showSelect: Boolean,
    showControls: Boolean,
    currentTimer: Object,
    isItemAsHandler: Boolean,
    isCompact: Boolean,
    allowRun: Boolean
  },
  emits: {
    deleted: Object,
    selected: Object,
    edited: Object,
    up: Object,
    down: Object,
    undo: Object,
    done: Object,
    clone: Object,
    updated: Array,
    'toggle-timer': Object
  },
  setup(props, { emit }) {
    const { task, currentTask, currentTimer} = toRefs(props)
    const state = reactive({
      timeTrackedLabel: computed(() => {
        return task.value.duration_ms ||  "00:00:00"
      }),
      typeColor: computed(() => {
        const colors = {
          todo: `bg-green-100 ${task.value.is_key ? 'text-gray-100' : 'text-green-500'}`,
          schedule: 'bg-blue-100 text-blue-500',
          delegate: 'bg-yellow-100 text-yellow-500',
          delete: 'bg-red-100 text-red-500',
          backlog: 'bg-gray-100 text-gray-500'
        }

        return colors[props.type] || colors['todo']

      }),
      keyStyles: computed(() => {
        return task.value.is_key && props.type == 'todo' ? 'border-green-300 border-2 bg-green-500 text-white' : ''
      }),

      isDisabled: computed(() => {
        return currentTimer.value && currentTimer.value.task_uid;
      }),

      isSelected: computed(( ) => {
        return currentTask.value && currentTask.value.uid == task.value.uid
      }),

      dateStates: computed(() => {
        const { formatDate } = useDateTime()
        const stateStyles = {
          normal: {
            color: 'text-gray-400',
            title: 'due date'
          },
          due: {
            color: 'text-blue-400',
            title: 'due to today'
          },
          overdue: {
            color: 'text-red-400',
            title: 'Overdue'
          }
        }

        let dateState = 'normal';
        if (task.value.due_date == formatDate()) {
          dateState = 'due' 
        } else if (task.value.due_date && task.value.due_date < formatDate()) {
          dateState = 'overdue'
        }

        return  stateStyles[dateState]
      }),
      isExpanded: false
    })

    task.value.contacts = task.value.contacts || [] 

    const handleCommand = (commandName) => {
      switch (commandName) {
        case 'delete':
          emit('deleted', task);
          break;
        case 'edit':
          emit('edited', task)
          break
        case 'up':
          emit('up', task)
          break
        case 'down':
          emit('down', task)
          break
        case 'done':
          emit('done', task)
          break
        case 'undo':
          emit('undo', task)
          break
        case 'clone':
          emit('clone', task)
          break
        case 'toggle-key':
          emit('toggle-key', task)
        default:
          break;
      }
    }

    const toggleExpand = () => {
      state.isExpanded = !state.isExpanded
    }

    const updateItems = () => {
      ElNotification({
        title: 'changed'
      })
    }

    // Selects
    const {list: tags, addToList: createTag, selectItem: addTag} = useCustomSelect(task, 'tags')
    const {list: contacts, addToList: createContact, selectItem: selectContact} = useCustomSelect(task, 'contacts')

    return {
      ...toRefs(state),
      handleCommand,
      toggleExpand,
      updateItems,
      tags,createTag, addTag,
      contacts, createContact, selectContact
    }

  }

}



</script>


<style lang="scss" scoped>
.task-item__tracked {
  width: 90px;
}

.task-item__description {
  overflow-wrap: break-word;
}

.task-item__title {
  overflow-wrap: break-word;
}

.task-item {
  min-width: 345px;
}
</style>
