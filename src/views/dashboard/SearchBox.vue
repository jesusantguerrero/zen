<script lang="ts" setup>
// @ts-expect-error: no ts definitions
import { AtInput } from "atmosphere-ui"
import TagsSelect from "@/components/atoms/TagsSelect.vue"

defineProps<{
  tags: any[];
  selectedTags: any[];
  modelValue: string;
  hideTags: boolean;
}>();
</script>

<template>
  <div class="items-center h-12 w-full rounded-md md:flex border-2 border-gray-200 overflow-hidden bg-white">
    <AtInput
      type="search"
      :model-value="modelValue"
      @update:model-value="$emit('update:model-value', $event)"
      class="w-full px-2 text-sm border-none rounded-md focus:outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
      placeholder="Search task..."
      borderless
    >
      <template #prefix>
      <span class="h-full flex items-center">
        <i class="ml-2 text-gray-300 fa fa-search"></i>
      </span>
      </template>
    </AtInput>
    <TagsSelect
      v-if="!hideTags"
      :model-value="selectedTags"
      @update:model-value="$emit('update:selectedTags', $event)"
      :multiple="true"
      placeholder="Filter by tag"
      :tags="tags" 
      class="w-5/12 h-full border-l px-2 py-2 rounded-md md:ml-2 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
      :allow-add="false"
    /> 
  </div>

</template>



