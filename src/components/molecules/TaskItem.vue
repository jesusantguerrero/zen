<template>
  <div
    class="items-center  px-4 mb-2 transition-all bg-white border-2 border-gray-200 rounded-md cursor-pointer task-item dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 hover:border-green-200"
    :class="{
      'border-green-400': isSelected,
      'py-3 hover:shadow-md ': !isCompact,
      'py-2': isCompact,
    }"
    @click="$emit('selected', task)"
    @dblclick.prevent="$emit('edited', task)"
  >
    <div class="flex justify-between">
      <div class="flex items-start text-xs md:items-center">
        <div class="flex items-center mr-2" v-if="showSelect">
          <input
            type="checkbox"
            class="mr-4 form-control-check checkbox-done"
            v-model="task.done"
            @click.stop="$emit('done', task)"
          />
        </div>

        <div
          v-else
          class="px-2 py-1 mr-3 border-2 border-transparent rounded-md"
          :class="[typeColor, keyStyles]"
        >
          <i :class="[!task.is_key ? 'fa fa-sticky-note' : 'fa fa-fire']"></i>
        </div>

        <h4 class="m-0 text-sm text-left cursor-pointer task-item__title">
          {{ task.title }}
        </h4>
      </div>

      <div class="flex items-start task-item__controls md:items-center">
        <div class="flex-wrap items-center justify-end mr-1 md:flex">
          <PersonSelect
            v-if="type == 'delegate'"
            v-model="task.contacts"
            :items="contacts"
            :multiple="true"
            @update:modelValue="$emit('updated', task)"
            @selected="addContact"
            @added="createContact"
          />

          <div
            v-else-if="type == 'delete'"
            class="mx-2 text-sm text-gray-400 cursor-pointer hover:text-red-400 md:text-md md:text-base"
            @click="$emit('deleted', task)"
            title="Delete"
          >
            <i class="mr-1 fa fa-trash"></i>
          </div>
          <TimeTrackerButton
            :allow-run="allowRun"
            :default-value="timeTrackedLabel"
            :currentTimer="currentTimer"
            :is-current="currentTask.uid == task.uid"
            :task="currentTask"
            @toggle-timer="$emit('toggle-timer', task)"
          />

          <div>
            <DateSelect
              v-if="task.due_date || type == 'schedule'"
              v-model="task.due_date"
              v-model:schedule="task.schedule"
              placeholder="due date"
              :disabled="!allowUpdate"
              :class="dateStates.color"
              :title="dateStates.title"
              :accept-recurrence="true"
              @update:schedule="$emit('updated', { ...task, schedule: $event })"
              @update:modelValue="$emit('updated', { ...task, due_date: $event })"
            />
          </div>
          <button
            class="h-6 px-2 ml-2 text-xs text-white transition-colors bg-gray-600 rounded-md hover:bg-gray-500"
            v-if="task.done"
            @click.stop="$emit('undo', task)"
          >
            <i class="fas fa-undo"></i> Undo
          </button>
        </div>
        <ZenDropdown
          v-if="showControls"
          trigger="click"
          :disabled="isDisabled"
          :options="commandOptions"
          @command="handleCommand"
        />
      </div>
    </div>

    <div
      class="flex items-center mt-1 text-xs"
      :class="{ 'justify-between': task.due_date }"
      v-if="!isCompact"
    >
      <button
        title="Description"
        class="px-2 py-1 rounded-md hover:bg-gray-200 focus:outline-none"
        @click.stop="toggleExpand"
        v-if="task.description"
      >
        <i class="fa fa-align-left"></i>
      </button>
      <button
        title="Checklist"
        class="flex items-center w-20 px-2 py-1 rounded-md hover:bg-gray-200 focus:outline-none"
        @click.stop="toggleExpand"
        v-if="task.checklist.length"
      >
        <i class="mr-2 fa fa-list-ul"></i>
        <div>
          <span class="font-bold">{{
            task.checklist.filter((item) => item.done).length
          }}</span>
          / {{ task.checklist.length }}
        </div>
      </button>

      <div class="flex justify-end w-full">
        <tags-select
          v-model="task.tags"
          :tags="tags"
          :multiple="true"
          @update:modelValue="$emit('updated', { ...task, tags: $event })"
          @selected="addTag"
          @added="createTag"
        />
      </div>
    </div>

    <!-- Item body -->
    <ElCollapseTransition>
      <div class="task-item__body" v-show="isExpanded">
        <div
          class="pt-2 text-left whitespace-pre-line task-item__description"
          placeholder="Add a short description"
          :class="{ 'text-gray-400 text-sm': !task.description }"
          v-html="task.description"
        />
        <div class="mt-5 task-item__checklist">
          <ChecklistContainer
            :items="task.checklist"
            :task="task"
            @updated="updateItems"
          />
        </div>
      </div>
    </ElCollapseTransition>
    <TaskTrackView
      v-if="isSelected"
      :task="currentTask"
      :current-timer="currentTimer"
    />
    <!-- /item body -->
  </div>
</template>

<script>
import { toRefs, computed, reactive } from "vue";
import { ElNotification } from "element-plus";

import ChecklistContainer from "../organisms/ListContainer.vue";
import PersonSelect from "../atoms/PersonSelect.vue";
import TagsSelect from "../atoms/TagsSelect.vue";
import DateSelect from "../atoms/DateSelect.vue";
import TimeTrackerButton from "../atoms/tracker/TimeTrackerButton.vue";
import TaskTrackView from "../organisms/TaskTrackView.vue";
import ZenDropdown from "./ZenDropdown.vue";

import { useDateTime } from "../../composables/useDateTime";
import { useCustomSelect } from "../../composables/useCustomSelect";
import { getTaskColorClass, TaskMatrix, TaskTypeColors } from "../../utils/constants";

export default {
  components: {
    ChecklistContainer,
    PersonSelect,
    TagsSelect,
    DateSelect,
    TimeTrackerButton,
    TaskTrackView,
    ZenDropdown,
  },
  props: {
    task: Object,
    type: String,
    currentTask: {
      type: Object,
      default: () => ({}),
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
    "toggle-timer": Object,
  },
  setup(props, { emit }) {
    const { task, currentTask, currentTimer } = toRefs(props);
    const state = reactive({
      timeTrackedLabel: computed(() => {
        return task.value.duration_ms || "00:00:00";
      }),
      typeColor: computed(() => {
        return getTaskColorClass(task.value) || TaskTypeColors["todo"];
      }),
      keyStyles: computed(() => {
        return task.value.is_key && props.type == "todo"
          ? "border-green-300 border-2 bg-green-500 text-white"
          : "";
      }),

      isDisabled: computed(() => {
        return Boolean(currentTimer.value && currentTimer.value.task_uid);
      }),

      isSelected: computed(() => {
        return currentTask.value && currentTask.value.uid == task.value.uid;
      }),

      dateStates: computed(() => {
        const { formatDate } = useDateTime();
        const stateStyles = {
          normal: {
            color: "text-gray-400",
            title: "due date",
          },
          due: {
            color: "text-blue-400",
            title: "due to today",
          },
          overdue: {
            color: "text-red-400",
            title: "Overdue",
          },
        };

        let dateState = "normal";
        if (task.value.due_date == formatDate()) {
          dateState = "due";
        } else if (task.value.due_date && task.value.due_date < formatDate()) {
          dateState = "overdue";
        }

        return stateStyles[dateState];
      }),
      isExpanded: false,
      processing: false,
    });

    task.value.contacts = task.value.contacts || [];

    // command options
    const commandOptions = computed(() => {
      return {
        edit: {
          icon: "el-icon-edit",
          label: "Edit",
        },
        delete: {
          icon: "el-icon-delete",
          label: "Delete",
        },
        done: {
          icon: "el-icon-check",
          show: !props.task.done,
          label: "Mark as done",
        },
        undo: {
          icon: "el-icon-refresh-left",
          show: props.task.done,
          label: "Undo",
        },
        clone: {
          icon: "el-icon-document-copy",
          label: "Duplicate",
        },
        toggleKey: {
          icon: "el-icon-s-flag",
          show: props.task.matrix == TaskMatrix.TODO,
          label: "Key task",
        },
        up: {
          icon: "el-icon-arrow-left",
          show: props.task.matrix == TaskMatrix.SCHEDULE,
          label: "Move to todo",
        },
        down: {
          icon: "el-icon-arrow-right",
          show: props.task.matrix == TaskMatrix.TODO,
          label: "Move to schedule",
        },
      };
    });
    const handleCommand = (commandName) => {
      switch (commandName) {
        case "delete":
          emit("deleted", task);
          break;
        case "edit":
          emit("edited", task);
          break;
        case "up":
          emit("up", task);
          break;
        case "down":
          emit("down", task);
          break;
        case "done":
          emit("done", task);
          break;
        case "undo":
          emit("undo", task);
          break;
        case "clone":
          emit("clone", task);
          break;
        case "toggle-key":
          emit("toggle-key", task);
        default:
          break;
      }
    };

    const toggleExpand = () => {
      state.isExpanded = !state.isExpanded;
    };

    const updateItems = () => {
      ElNotification({
        title: "changed",
      });
    };

    // Selects
    const { list: tags, addToList: createTag, selectItem: addTag } = useCustomSelect(
      task,
      "tags"
    );
    const {
      list: contacts,
      addToList: createContact,
      selectItem: selectContact,
    } = useCustomSelect(task, "contacts");

    return {
      ...toRefs(state),
      handleCommand,
      toggleExpand,
      updateItems,
      tags,
      createTag,
      addTag,
      contacts,
      createContact,
      selectContact,
    };
  },
};
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
