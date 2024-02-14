<template>
  <article 
    class="items-stretch flex transition-all bg-white relative border-2 border-gray-200 rounded-md cursor-pointer task-item dark:bg-base-lvl-2 dark:border-gray-600 dark:text-gray-300 hover:border-green-200"
    :class="{'border-green-400': isSelected, 'shadow-md ': !isCompact }"
    @click="$emit('selected', task)"
    @dblclick.prevent="$emit('edited', task)"

  >
    <main class="w-full px-4" :class="{'py-3': !isCompact, 'py-2': isCompact }">
      <header class="flex justify-between">
        <section class="flex items-start text-xs md:items-center"> 
          <div class="flex items-center mr-2" v-if="showSelect" >
            <input
              type="checkbox"
              class="mr-4 form-control-check checkbox-done"
              v-model="task.done"
              @click.stop="$emit('done', task)"
            /> 
          </div> 
  
          <div v-else class="px-2 py-1 mr-3 border-2 border-transparent rounded-md" :class="[typeColor, keyStyles]"> 
              <i :class="[!task.is_key ? 'fa fa-sticky-note' : 'fa fa-fire']"></i>
          </div>
  
          <h4 class="m-0 text-sm text-left cursor-pointer task-item__title "> {{ task.title }}</h4>
        </section>
  
        <section class="flex items-start task-item__controls md:items-center">  
          <div class="flex-wrap items-center justify-end mr-1 md:flex">
            <PersonSelect
              v-if="type=='delegate'"
              v-model="task.contacts"
              :items="contacts"
              :multiple="true" 
              @update:modelValue="$emit('updated', task)" 
              @selected="addContact"
              @added="createContact"
            /> 
            
            
            <TimeTrackerButton
              :allow-run="allowRun"
              :default-value="timeTrackedLabel"
              :currentTimer="currentTimer"
              :is-current="currentTask.uid == task.uid"
              :task="currentTask"
              @toggle-timer="toggleTimer"
              v-if="type !== 'delete'"
            />
            
            <div>
              <DateSelect 
                v-if="task.due_date || type == 'schedule'"
                v-model="task.due_date" 
                v-model:schedule="task.schedule"
                :disabled="!allowUpdate"
                :class="dateStates.color" 
                :title="dateStates.title"
                :accept-recurrence="true"
                placeholder="due date"
                @update:schedule="$emit('updated', {...task, schedule: $event })" 
                @update:modelValue="$emit('updated', {...task, due_date: $event })" 
              /> 
            </div>
            <button 
              class="h-6 px-2 ml-2 text-xs text-white transition-colors bg-gray-600 rounded-md hover:bg-gray-500" 
              v-if="task.done" @click.stop="$emit('undo', task)">
              <i class="fas fa-undo"></i> Undo
            </button>
            <slot name="append-actions" />
          </div>
  
          <ElDropdown trigger="click" @command="handleCommand" v-if="showControls && !isDisabled" :disabled="isDisabled" @click.stop>
            <button 
              class="px-2 py-1 text-sm text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-50 focus:outline-none hover:text-gray-600" 
              :title="isDisabled? 'Can updates tasks when timer is running' : ''" 
              @click.prevent.self
            >
              <i class="fa fa-ellipsis-v"></i> {{ isDisabled }}
            </button>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem command="edit" icon="el-icon-edit">Edit</ElDropdownItem>
                <ElDropdownItem command="delete" icon="el-icon-delete">Delete </ElDropdownItem>
                <ElDropdownItem command="done" icon="el-icon-check" v-if="!task.done"> Mark as done </ElDropdownItem>
                <ElDropdownItem command="undo" icon="el-icon-refresh-left" v-else> undo </ElDropdownItem>
                <ElDropdownItem command="clone" icon="el-icon-document-copy"> Duplicate </ElDropdownItem>
                <ElDropdownItem command="toggle-key" icon="el-icon-s-flag" v-if="task.matrix=='todo'"> Key task </ElDropdownItem>
                <ElDropdownItem command="up" icon="el-icon-arrow-left" v-if="task.matrix=='schedule'">Move to todo</ElDropdownItem>
                <ElDropdownItem command="down" icon="el-icon-arrow-right" v-if="task.matrix=='todo'">Move to schedule</ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </section>
      </header>
  
      <section class="flex items-center mt-1 text-xs" :class="{'justify-between': task.due_date }" v-if="!isCompact">
        <button 
          title="Description" 
          class="px-2 py-1 rounded-md hover:bg-gray-200 focus:outline-none" 
          @click.stop="toggleExpand" v-if="task.description">
          <i class="fa fa-align-left"></i>
        </button>
        <button 
          title="Checklist" 
          class="flex items-center w-20 px-2 py-1 rounded-md hover:bg-gray-200 focus:outline-none" 
          @click.stop="toggleExpand" v-if="task.checklist.length">
          <i class="mr-2 fa fa-list-ul"></i>
          <div> 
            <span class="font-bold">{{ task.checklist.filter(item => item.done).length  }}</span> / {{ task.checklist.length  }} 
          </div>
        </button>
  
        <div class="flex justify-end w-full h-4" >
           <section v-if="task.currentStreak" class="flex mr-2" :class="{'text-blue-700': isCold, 'text-red-600 dark:text-red-400': !isCold}">
            <IPhSnowflakeDuotone v-if="task.currentStreak.direction == 'down'" /> 
            <IPhFireDuotone v-else />
            <span>
              {{ task.currentStreak.streak}}
            </span>
           </section>
            <TagsSelect
              v-if="!isDisabled"
              v-model="task.tags"
              :tags="tags"
              :multiple="true" 
              @update:modelValue="$emit('updated', {...task, tags: $event })" 
              @selected="addTag"
              @added="createTag"
            /> 
        </div>
      </section>
  
      <!-- Item body -->
      <ElCollapseTransition>
        <div class="task-item__body" v-show="isExpanded">
          <div
            class="pt-2 text-left whitespace-pre-line task-item__description" 
            placeholder="Add a short description"
            :class="{'text-gray-400 text-sm': !task.description }"
            v-html="task.description"
          />
          <div class="mt-5 task-item__checklist">
            <ChecklistContainer :items="task.checklist" :task="task"  @updated="updateItems"></ChecklistContainer>
          </div>
        </div>
      </ElCollapseTransition>
      <!-- /item body -->
    </main>
    <aside v-if="type == 'delete'" class="grid grid-rows-2 h-full">
        <button class="hover:bg-green-400 dark:hover:bg-green-400 hover:text-white px-3 py-3 rounded-tl-md dark:bg-base-lvl-1 bg-gray-200 transition-colors" 
          @click.stop="$emit('plus', task)">
          <IMdiChevronUp />
        </button>
        <button class="hover:bg-red-400 dark:hover:bg-red-400 hover:text-white px-3 py-3 rounded-bl-md dark:bg-base-lvl-1 bg-gray-200 transition-colors" 
          @click.stop="$emit('minus', task)">
          <IMdiChevronDown />
        </button>
    </aside>
  </article>

</template>

<script>
import { toRefs, computed, reactive } from "vue"
import { ElDropdown, ElDropdownItem, ElDropdownMenu, ElNotification } from "element-plus";

import ChecklistContainer from "@components/organisms/ListContainer.vue"
import PersonSelect from "@components/atoms/PersonSelect.vue"
import TagsSelect from "@components/atoms/TagsSelect.vue"
import DateSelect from "@components/atoms/DateSelect.vue"
import TimeTrackerButton from "@components/atoms/tracker/TimeTrackerButton.vue";

import { useDateTime } from "@/composables/useDateTime";
import { useCustomSelect } from "@/plugins/firebase/useCustomSelect";
import { durationFromMs } from "@/composables/useTracker";

export default {
  components: {
    ChecklistContainer,
    PersonSelect,
    TagsSelect,
    DateSelect,
    TimeTrackerButton,
    ElDropdown,
    ElDropdownMenu,
    ElDropdownItem
},
  props: {
    task: Object,
    type: String,
    currentTask: {
      type: Object,
      default: () => ({})
    },
    handleMode: Boolean,
    showSelect: Boolean,
    showControls: Boolean,
    currentTimer: Object,
    isItemAsHandler: Boolean,
    isCompact: Boolean,
    allowRun: Boolean,
    allowUpdate: Boolean,
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
    const { task, currentTask, currentTimer } = toRefs(props)
    const state = reactive({
      timeTrackedLabel: computed(() => {
        const durationMs = task.value.duration_ms;
        if (typeof durationMs == 'number') {
          return durationFromMs(durationMs) 
        }
        return durationMs ||  "00:00:00"
      }),
      typeColor: computed(() => {
        const colors = {
          todo: `bg-green-100 dark:bg-gray-600 dark:border-gray-500 ${task.value.is_key ? 'text-gray-100 ' : 'text-green-500'}`,
          schedule: 'bg-blue-100 dark:bg-gray-600 dark:border-gray-500 dark:text-blue-500 text-blue-500',
          delegate: 'bg-yellow-100 dark:bg-gray-600 dark:border-gray-500 dark:text-yellow-400 text-yellow-500',
          delete: 'bg-red-100 dark:bg-gray-600 dark:border-gray-500 text-red-400',
          backlog: 'bg-gray-100 text-gray-500 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300'
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
      isExpanded: false,
      processing: false,
      isCold: computed(() => {
        return task.value.currentStreak?.direction == 'down'
      })
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

    const toggleTimer = () => {
      emit('toggle-timer', task.value)
    }

    return {
      ...toRefs(state),
      handleCommand,
      toggleTimer,
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
@/plugins/firebase/useCustomSelect@/composables/useDateTime@/composables/useTracker