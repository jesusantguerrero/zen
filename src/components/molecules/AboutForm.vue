<template>
<div class="py-5 mx-auto prose prose-xl text-center dark:text-gray-200">
    <div>
        <img src="@/assets/undraw_following.svg" alt="" class="w-4/12 mx-auto">
    </div>
    
    <h4 class="text-center dark:text-white"> About Zen.</h4>
    
    <div class="mb-5">
        Zen. is a productivity app that integrates Eisenhower Matrix, GTD principle and Pomodoros in a unique way in order to improve your dev routine.
    </div>

    <div class="mb-10 text-center" v-if="!hideButton">
        <button class="px-5 py-1 text-white bg-gray-600 dark:bg-base-lvl-2 dark:border-base-lvl-3 border rounded-md hover:bg-gray-700 focus:outline-none" @click="emit('closed')">
            See how it works
            <i class="ml-2 fa fa-chevron-right"></i>
        </button>
    </div>
</div>
</template>


<script setup>
defineProps({
    hideButton: Boolean
})
const emit = defineEmits({
    closed: Function
})
</script>
