<template>
<div class="task-select">
    <el-select v-model="task" placeholder="Select a task">
        <el-option
            v-for="item in items"
            :key="item.id"
            :label="item.title"
            :value="item"
            input-class="option-text"
        >
            <div class="flex justify-between h-full mx-2 items-center">
                <div 
                    class="mx-3 rounded-md flex items-center px-2 mr-2 h-7" 
                    :class="typeColor(task)"> 
                    <i class="fa fa-sticky-note"></i>
                </div>
                <div class="item-title bold">{{ item.title }}</div>
            </div>
        </el-option>
    </el-select>
</div>
</template>

<script setup>
import { defineProps, ref, watch, defineEmit } from "vue";

const props = defineProps({
    items: {
        type: Object,
        required: true
    },
    value: {
        type: Object,
        default() {
            return {}
        }
    }
})

const emit = defineEmit({
    'update:modelValue': (task) => {}
})

const task =  ref([]);

const typeColor = (task) => {
  const colors = {
    todo: 'bg-green-100 text-green-500',
    schedule: 'bg-blue-100 text-blue-500',
    delegate: 'bg-yellow-100 text-yellow-500',
    delete: 'bg-red-100 text-red-500',
    backlog: 'bg-gray-100 text-gray-500'
  }

  return colors[task.matrix] || colors['todo']
}

watch(() => props.modelValue, (modelValue) => {
    task.value = modelValue
})

watch(() => task.value, (task) => {
    emit('update:modelValue', task)
})
</script>

<style lang="scss">
.option-text {
    @apply  text-gray-400;
    font-weight: bold;
}

.el-select-dropdown__item {
    height: 40px !important;
    padding: 0 5px !important;
    margin: 5px 0;

    .item-title {
        @apply text-gray-400;
        text-align: left;
        width: 100%;
        font-weight: bold;
    }
}

.el-select {
    .el-input__inner {
        @apply rounded-md;
        @apply border-gray-400;
        border-radius: none !important;
        border-width: 2px;

        &:focus {
            @apply border-gray-400;
        }
    }

    .el-input.is-focus .el-input__inner, .el-input__inner:focus {
        border-color: rgba(156, 163, 175, var(--tw-border-opacity)) !important;
    }
}
</style>