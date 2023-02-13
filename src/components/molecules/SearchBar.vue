<template>
  <div class="text-left md:space-x-2 md:flex">
    <!-- search -->
    <SearchBox
        v-model="searchOptions.text"
        v-model:selectedTags="searchOptions.tags"
        placeholder="Search task..."
        :multiple="true"
        :tags="tags" 
        :allow-add="false"
    />
    <!-- /search -->

    <div class="flex justify-between mt-2 md:mt-0">
        <!-- date-pager -->
        <DatePager v-model="searchOptions.date" />
        <!-- /date-pager -->
    </div>
  </div>
</template>

<script setup>
import {
  reactive,
  watch,
  computed,
  inject
} from "vue";
import TagsSelect from "@/components/atoms/TagsSelect.vue";
import SearchInput from "@/components/atoms/Search.vue";
import DatePager from "@/components/atoms/DatePage.vue";
import SearchBox from "@/views/dashboard/SearchBox.vue";

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