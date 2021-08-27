<template>
<div class="py-5 mx-auto prose prose-lg text-center">
    <h2 class="text-center"> Complete yesterday tasks.</h2>

    <slot name="content"></slot>

    <div class="mb-10 text-center">
        <button class="px-5 py-1 text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none" @click="emit('closed')">
            Complete Day
        </button>
    </div>
</div>
</template>


<script setup>
const emit = defineEmits({
    closed: Function
})
</script>
