<template>
<div class="py-5 mx-auto prose prose-xl text-center">
    <div>
        <img src="../../assets/undraw_following.svg" alt="" class="w-4/12 mx-auto">
    </div>
    
    <h4 class="text-center"> Welcome to Zen.</h4>
    
    <div class="mb-5">
        Create tasks, set priority, plan your day list and start working!
    </div>

    <div class="mb-10 text-center">
        <button class="px-5 py-1 text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none" @click="emit('closed')">
            Learn More!
        </button>
    </div>
</div>
</template>


<script setup>
const emit = defineEmits({
    closed: Function
})
</script>
