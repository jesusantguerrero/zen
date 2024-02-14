<template>
  <div class="custom-container">
    <div class="pt-24 pb-20 max-w-7xl mx-auto">
      <h1>Thoughts</h1>
      <span>Your lonely cards</span>
      <QuickAdd 
        placeholder="Type anything to create a new note" 
        mode="note" 
        :is-matrix="false"
        @saved="addTask" 
      />
       <TaskGroup
            :show-title="false"
            title="Notes"
            class="py-3"
            type="notes"
            placeholder="Click a task select"
            :allow-select="false"
            :tasks="notes"
            :show-select="true"
            :show-controls="true"
            :is-item-as-handler="true"
            :search="searchText"
            :tags="selectedTags"
          />
    </div>
  </div>
</template>

<script setup>
import QuickAdd from '@/components/molecules/QuickAdd.vue';
import TaskGroup from '@/components/organisms/TaskGroup.vue';
import { getNextIndex } from '@/utils';
import { registerEvent } from '@/plugins/useFirebase';
import { useSearchOptions } from '@/composables/useFuseSearch';
import { useSnapshot } from '@/plugins/firebase/useSnapshot';
import { useTaskFirestore } from '@/plugins/firebase/useTaskFirestore';

const {
  saveTask,
  getTaskByType,
} = useTaskFirestore();

const { list: notes } = useSnapshot(getTaskByType.bind(null, 'note'));
const { searchText, selectedTags } = useSearchOptions() 

const addTask = async (task) => {
  task.order = getNextIndex(notes.value);
  await saveTask(task);
  registerEvent('quick_task_added');
};
</script>@/plugins/useTaskFirestore@/plugins/firebase/useSnapshot@/composables/useFuseSearch