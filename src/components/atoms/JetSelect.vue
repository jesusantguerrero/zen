<template>
<jet-dropdown align="right" width="full">
    <template #trigger>
        <span class="inline-flex w-full rounded-md">
            <button type="button" class="inline-flex items-center justify-between w-full px-3 py-3 text-sm font-medium leading-4 text-gray-500 capitalize transition duration-150 ease-in-out bg-white border border-gray-200 rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:bg-gray-50 active:bg-gray-50">
                {{ selected ?  selected[label] : placeholder }}

                <svg class="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </span>
    </template>

    <template #content>
        <div class="w-full overflow-auto select-overlay dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
            <div
                v-for="option in options"
                :key="option.name || option"
                class="dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                >
                <div
                    class="px-2 py-2 cursor-pointer"
                    :class="[groupItems ? 'bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-gray-300' : '']"
                    @click="!groupItems ? emitValue(option) : ''"
                >
                    {{ option[label] || option.name || option }}
                </div>

                <div
                    v-for="item in option[groupItems]"
                    :key="item[keyTrack]"
                    class="w-full px-1 py-2 pl-5 capitalize bg-white cursor-pointer hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                    @click="emitValue(item)"
                >
                    {{ item[label] }}
                </div>
            </div>
        </div>
    </template>
</jet-dropdown>
</template>

<script setup>
import JetDropdown from './Dropdown.vue'
import { defineProps, computed } from 'vue'

const props = defineProps({
    options: {
        type: Array,
        required: true
    },
    modelValue: {
        type: [String, Object],
        required: true
    },
    selected: {
        type: [String, Object]
    },
    placeholder: {
        type: String
    },
    label: {
        type: String
    },
    groupItems: {
        type: Array
    },
    keyTrack: {
        type: String
    }
})

const emit = defineEmits({
    'update:modelValue': Object
})

const items = computed(() => {
    return props.groupItems ? props.options.reduce((items, item) => items.push(...item[props.groupItems]), []) : props.options;
})

const emitValue = (option) => {
    const value = props.keyTrack && option ? option[props.keyTrack] : option
    emit('update:modelValue', value)
    emit('update:selected', option)
}
</script>

<style scoped>
.select-overlay {
    max-height: 256px;
}
</style>
