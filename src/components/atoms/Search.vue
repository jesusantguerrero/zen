<template>
   <div class="flex items-center overflow-hidden bg-white border-2 border-gray-200 rounded-md dark:bg-gray-700 dark:border-gray-500">
        <i class="ml-2 text-gray-300 fa fa-search"></i>
        <input 
            ref="input"
            type="search" 
            v-model.trim="searchText" 
            @input="emit('update:modelValue', searchText)"
            class="w-full h-10 px-2 text-sm text-md dark:bg-gray-700 dark:text-gray-300 focus:outline-none"
            placeholder="Search tasks ..."
        >
    </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
    modelValue: String
})

const emit = defineEmits({
    'update:modelValue': Date
})

const searchText = ref(null)

watch(() => props.modelValue, (value) => {
    searchText.value = value
}, {immediate: true})

const input = ref(null)
const focusInput = (evt) => {
    const inputElement = input.value && input.value.$el.nextSibling.querySelector('.el-input__inner')
    if (inputElement) {
        inputElement.focus();
    }
}
</script>

<style lang="scss">
.date-pager {
    .el-date-editor--date  {
        width: 130px !important;
    }

    .el-input__inner {
        border: none;
        padding-right: 20px;
    }

    .el-input__icon, .el-input__suffix, .el-input__suffix-inner {
        background: transparent;
    }
}
</style>