<template>
    <div class="date-select">
        <button
            @click.stop="focusInput"
            data-name="button"
            tabindex="-1"
            :class="{'text-blue-400 w-20': formattedDate }" 
            class="flex items-center focus:outline-none" 
        >
            <i class="fa fa-calendar mr-2 px-2" v-if="!formattedDate"></i>
            <span class="text-sm font-bold inline-block w-full" > {{ formattedDate || placeholder }} </span>
            <el-date-picker
                v-model="date"
                ref="input"
                type="date"
                class="pointer-events-none"
                @change="emitDate"
            >
            </el-date-picker>
        </button>
    </div>
</template>

<script setup>
import { defineEmit, onMounted, ref, watch } from "vue";
import { useDateTime } from "../../utils/useDateTime";
import { ElDatePicker } from "element-plus"
const date = ref(null)
const { formattedDate, getDateFromString } = useDateTime(date);

const props = defineProps({
    modelValue: Date,
    placeholder: String
})

const emit = defineEmit({
    'update:modelValue': Date
})

watch(() => props.modelValue, (value) => {
    date.value = typeof value == 'string' ? getDateFromString(value) : value
}, { immediate: true })


const emitDate = () => {
    emit('update:modelValue', date.value);
}

const input = ref(null)
onMounted(() => {
    input.tabIndex = -1;
})
const focusInput = (evt) => {
    const inputElement = input.value && input.value.$el.nextSibling.querySelector('.el-input__inner')
    if (inputElement) {
        inputElement.focus();
    }
}
</script>

<style lang="scss">
.date-select {
    .el-date-editor--date, .el-input__inner, .el-input__suffix, .el-input__preffix {
        width: 1px !important;
        opacity: 0;
        padding: 0 0 0 0 !important;
    }

    .el-input__prefix {
        width: 0;
    }

    .el-input__icon {
        width: 0;
    }
}
</style>