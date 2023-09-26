<script setup lang="ts">
import {
  reactive,
  watch,
  computed,
  inject
} from "vue";
// @ts-expect-error: undefined
import { AtDatePager } from "atmosphere-ui";
import { format } from "date-fns";

import SearchBox from "./SearchBox.vue";

const props = defineProps<{
  modelValue: string,
  date: Date;
  startDate?: Date;
  endDate?: Date;
  tags: any[];
  selectedTags: any[];
  pagerMode?: string;
  hideDate?: boolean;
  hideTags?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string],
  "update:date": [date: Date],
  "update:startDate": [date: Date],
  "date-changed": [dates: Date[]],
  "update:endDate": [date: Date],
  "update:tags": [tags: any[]],
  "update:selectedTags": [selected: any[]],
}>();

interface ISearchOptions  {
  text: string;
  tags: any[];
  date: Date;
  startDate: Date;
  endDate: Date;
}

const searchOptions = reactive<ISearchOptions>({
  text: "",
  tags: [],
  date: new Date(),
  startDate: new Date(),
  endDate: new Date(),
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

const displayDate = computed(() => {
  const formats = {
    'day': 'E, dd',
    'week': '',
    'month': 'MMMM'
  }
  return props.pagerMode == 'week'
  ? format(props.startDate, formats.day) + ' -  '+ format(props.endDate, formats.day)
  : format(searchOptions.date, formats[props.pagerMode] ?? formats.day);
})
</script>

<template>
  <div class="text-left md:space-x-2 md:flex ">
    <!-- search -->
    <SearchBox
        v-model="searchOptions.text"
        v-model:selectedTags="searchOptions.tags"
        placeholder="Search task..."
        class="bg-green-500"
        :hide-tags="hideTags"
        :multiple="true"
        :tags="tags" 
        :allow-add="false"
    />
    <!-- /search -->

    <div class="flex justify-between mt-2 md:mt-0" v-if="!hideDate">
        <!-- date-pager -->
        <AtDatePager 
            v-model="searchOptions.date" 
            @change="emit('date-changed', $event)"
            @update:startDate="emit('update:startDate', $event)"
            @update:endDate="emit('update:endDate', $event)"
            :next-mode="pagerMode"
            class="date-pager h-12 dark:bg-base-lvl-2 dark:border-base-lvl-3 dark:text-white"
            controlsClass="dark:hover:bg-base-lvl-1 dark:bg-transparent dark:text-white"
          >
          <span  :class="[props.pagerMode == 'week' ? 'w-48 text-center' : 'w-32 text-center']">
            {{  displayDate }}
          </span>
        </AtDatePager>
        <!-- /date-pager -->
    </div>
  </div>
</template>

<style lang="scss">
.date-pager {
  .h-10 {
    height: max-content !important;
  }
}
</style>