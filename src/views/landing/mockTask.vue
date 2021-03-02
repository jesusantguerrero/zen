<template>
  <div>
    <div class="tab-header flex">
      <button
        class="px-2 py-1 hover:bg-gray-200 font-bold focus:outline-none text-gray-500 capitalize rounded-md ml-2"
        v-for="(color, tab) in state.tabs"
        :key="tab"
        :class="{ [`${color} bg-gray-100`]: state.tabSelected == tab }"
        @click="state.tabSelected = tab"
      >
        {{ tab }} ({{ state[tab].length }})
      </button>
    </div>
    <task-group
      v-if="state.tabSelected == 'todo'"
      :show-title="false"
      title="Todo"
      class="py-3"
      :tasks="state.todo"
      :show-select="true"
      :show-controls="true"
      :is-item-as-handler="true"
      :search-text="''"
      drag-class="shadow-md px-2 py-2"
      task-class="shadow-md"
      type="todo"
      :tags="[]"
      placeholder="Click a task select"
    >
    </task-group>

    <task-group
      v-if="state.tabSelected == 'schedule'"
      :show-title="false"
      title="Schedule"
      :tasks="state.schedule"
      :tags="[]"
      :active="false"
      :show-controls="true"
      :search-text="''"
      type="schedule"
      class="py-3"
      drag-class="shadow-md"
      task-class="shadow-md"
      placeholder="Move task to todo to select"
      :is-item-as-handler="true"
    >
    </task-group>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import TaskGroup from "../../components/organisms/TaskGroup.vue";

const state = reactive({
    tabs: {
        todo: 'text-green-500',
        schedule: 'text-blue-500'
    },
    tabSelected: 'todo',
    todo: [{
        title: 'Task 1',
        checklist: [],
        key: true,
    }, {
        title: 'Task 2',
        checklist: [],
         uid: 'task2'
    
    }],
    schedule: [
        {
            title: 'Task 3',
            checklist: [],
            uid: 'task3'
        }
    ]
})

</script>
