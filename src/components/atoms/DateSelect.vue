<template>
    <div>
        <el-popover
            placement="bottom-end"
            :width="240"
        >
            <el-date-picker
                v-model="date"
                type="date"
                @change="emitDate"
            >
            </el-date-picker>

            <template #reference>
            <button @click.prevent.stop="" :class="{'text-blue-400': formattedDate }" class="flex w-20 my-auto focus:outline-none">
                <i class="fa fa-calendar mr-1">hi</i>
                <span class="text-xs" > {{ formattedDate }}</span>
            </button>
            </template>
        </el-popover>
    </div>
</template>

<script setup>
import { defineEmit, ref, watch } from "vue";
import { useDateTime } from "../../utils/useDateTime";

const props = defineProps({
    modelValue: Date
})

const emit = defineEmit({
    'update:modelValue': Date
})

const date = ref(null)

const { formattedDate } = useDateTime(date);

watch(() => props.modelValue, (value) => {
    date.value = value
})

const emitDate = () => {
    emit('update:modelValue', date.value);
}
</script>