<template>
  <div class="text-left md:space-x-2 md:flex">
    <!-- search -->
    <search-input v-model="searchOptions.text"> </search-input>
    <!-- /search -->

    <div class="flex justify-between mt-2 md:mt-0">
        <!-- date-pager -->
        <date-pager v-model="searchOptions.date"></date-pager>
        <!-- /date-pager -->

        <!-- tags-select -->
        <tags-select
            v-model="searchOptions.tags"
            :multiple="true"
            :tags="tags"
            placeholder="Filter by tag"
            class="px-2 py-2 ml-2 bg-white border-2 border-gray-200 rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
            :allow-add="false"
        ></tags-select>
        <!-- tags-select -->
    </div>
  </div>
</template>

<script setup>
import {
  reactive,
  defineProps,
  watch,
  computed,
  inject
} from "vue";
import TagsSelect from "../atoms/TagsSelect.vue";
import SearchInput from "../atoms/Search.vue";
import DatePager from "../atoms/DatePage.vue";

const props = defineProps({
  modelValue: String,
  date: Date,
  tags: Array,
  selectedTags: Array,
});


const emit = defineEmits({
  "update:modelValue": String,
  "update:date": Date,
  "update:tags": Array,
  "update:selectedTags": Array,
});

const searchOptions = reactive({
  text: "",
  tags: [],
  date: new Date(),
});

watch( () => props.modelValue, (value) => {
    searchOptions.text = value;
  },
  { immediate: true }
);

watch(() => props.date, (value) => {
    searchOptions.date = value;
  },
  { immediate: true }
);


watch( () => searchOptions.text, (value) => {
    emit('update:modelValue', value)
  }
);

watch(() => searchOptions.date, (value) => {
    emit('update:date', value)
  }
);

const tags = inject("tags", []);
const selectedTags = computed(() => {
  return searchOptions.tags.map((tag) => tag.uid);
});

watch( () => [...searchOptions.tags], (value) => {
    emit('update:tags', value)
    emit('update:selectedTags', selectedTags.value)
  }
);

</script>