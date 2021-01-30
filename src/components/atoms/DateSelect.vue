<template>
    <div class="date-select">
        <button
            @click.stop="focusInput()"
            data-name="button"
            tabindex="-1"
            :class="{'text-blue-400 w-24': formattedDate }" 
            class="flex items-center my-auto focus:outline-none" 
        >
            <i class="fa fa-calendar mr-2 px-2"></i>
            <span class="text-xs" > {{ formattedDate }} </span>
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

const props = defineProps({
    modelValue: Date
})

const emit = defineEmit({
    'update:modelValue': Date
})

const date = ref(null)
const input = ref(null)

onMounted(() => {
    input.tabIndex = -1;
})

const focusInput = (evt) => {
    // todo to prevent open on click
    if (evt) {
        const inputElement = input.value && input.value.$el.nextSibling.querySelector('.el-input__inner')
        if (inputElement) {
            inputElement.focus();
        }
    }
}

const { formattedDate } = useDateTime(date);

watch(() => props.modelValue, (value) => {
    date.value = value
})

const emitDate = () => {
    emit('update:modelValue', date.value);
}
</script>

<style lang="scss">
.date-select {
    .el-date-editor--date, .el-input__inner, .el-input__suffix, .el-input__preffix {
        width: 1px !important;
        opacity: 0;
    }
}
</style>