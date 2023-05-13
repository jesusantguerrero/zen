<template>
  <div class="text-left md:space-x-2 md:flex">
    <!-- search -->
    <SearchBox
        v-model="searchOptions.text"
        v-model:selectedTags="searchOptions.tags"
        placeholder="Search task..."
        :hide-tags="hideTags"
        :multiple="true"
        :tags="tags" 
        :allow-add="false"
    />
    <!-- /search -->

    <div class="flex justify-between mt-2 md:mt-0" v-if="!hideDate">
        <!-- date-pager -->
        <DatePager v-model="searchOptions.date" />
        <!-- /date-pager -->
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  reactive,
  watch,
  computed,
  inject
} from "vue";
import DatePager from "@/components/atoms/DatePage.vue";
import SearchBox from "@/views/dashboard/SearchBox.vue";

const props = defineProps<{
  modelValue: string,
  date: Date;
  tags: any[];
  selectedTags: any[];
  hideDate: boolean;
  hideTags: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string],
  "update:date": [date: Date],
  "update:tags": [tags: any[]],
  "update:selectedTags": [selected: any[]],
}>();

interface ISearchOptions  {
  text: string;
  tags: any[];
  date: Date;
}

const searchOptions = reactive<ISearchOptions>({
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

watch(() => searchOptions.date, (value: Date) => {
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