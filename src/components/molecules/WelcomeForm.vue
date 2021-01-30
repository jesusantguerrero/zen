<template>
<div class="prose prose-xl text-center mx-auto py-5">
    <div>
        <img src="../../assets/undraw_following.svg" alt="" class="w-4/12 mx-auto">
    </div>
    
    <h4 class="text-center"> Welcome to Zen.</h4>
    
    <div class="mb-5">
        Create tasks, set priority, plan your day list and start working!
    </div>

    <div class="text-center mb-10">
        <button class="bg-gray-600 text-white hover:bg-gray-700 focus:outline-none rounded-md px-5 py-1" @click="emit('closed')">
            Learn More!
        </button>
    </div>
</div>
</template>


<script setup>
const emit = defineEmit({
    closed: Function
})
</script>
