<template>
  <div class="custom-container">
    <div class="pt-24 pb-20 max-w-7xl mx-auto">
      <h1>Thoughts</h1>
      <span>Your lonely cards</span>
      <QuickAdd placeholder="Type anything to create a new note" mode="note" />
       <TaskGroup
            :show-title="false"
            title="Notes"
            class="py-3"
            type="notes"
            placeholder="Click a task select"
            :allow-select="false"
            :tasks="state.notes"
            :search="searchOptions.text"
            :show-select="true"
            :show-controls="true"
            :is-item-as-handler="true"
            :tags="selectedTags"
          />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import QuickAdd from '../../components/molecules/QuickAdd.vue';
import TaskGroup from '../../components/organisms/TaskGroup.vue';
import { useTrackFirestore } from '../../utils/useTrackFirestore';

const {
  saveTask,
  getTasksByType,
} = useTaskFirestore();

const state = reactive({
  notes: [],
  notesRef: null,
})

const fetchNotes = (callback) => {
  return  getTasksByType('notes').then(notesRef => {
    const unsubscribe = notesRef.onSnapshot((snap) => {
      const list = [];
      snap.forEach((doc) => {
        list.push({ ...doc.data(), uid: doc.id });
      });
      callback && callback(list);
    });

    return unsubscribe;
  })
};

onMounted(async() => {
  state.notesRefs = await fetchNotes(notes => {
    state.notes = notes;
  });
});

// search
const searchOptions = reactive({
  text: "",
  tags: [],
});
const selectedTags = computed(() => {
  return searchOptions.tags.map((tag) => tag.uid);
});

const tags = inject("tags", []);

</script>