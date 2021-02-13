<template>
   <div class="flex items-center border-2 border-gray-200 bg-white overflow-hidden rounded-md">
        <i class="fa fa-search ml-2 text-gray-300"></i>
        <input 
            ref="input"
            type="search" 
            v-model.trim="searchText" 
            @input="emit('update:modelValue', searchText)"
            class="px-2 text-md h-10  focus:outline-none w-full text-sm"
            placeholder="Search tasks ..."
        >
    </div>
</template>

<script setup>
import { defineEmit, ref, watch } from "vue";

const props = defineProps({
    modelValue: String
})

const emit = defineEmit({
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