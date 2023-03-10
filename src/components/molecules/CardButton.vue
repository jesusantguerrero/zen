<template>
 <div role="button" class="flex rounded-sm border py-2 px-4 shadow-md dark:bg-slate-700 bg-white hover:bg-white">
    <div v-if="$slots.icon" class="mr-2 flex items-center">
        <slot name="icon"></slot>
    </div>
    <div>
        <h4 class="font-bold text-sm">{{ title }}</h4>
        <p v-if="description" class="text-sm text-gray-500"> {{ description }}</p>
    </div>
    <div class="items-center flex ml-auto justify-end text-right" v-if="showArrow">
        <slot name="arrow-icon">
            <i class="fas fa-chevron-right text-gray-400" />
        </slot>
    </div>
 </div>
</template>

<script setup>
defineProps({
    icon: {
        type: String,
        default: '',
    },
    title: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        default: '',
    },
    showArrow: {
        type: Boolean,
        default: true,
    },
})
</script>