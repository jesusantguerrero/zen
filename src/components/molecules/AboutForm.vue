<template>
<div class="prose prose-xl text-center mx-auto py-5">
    <div>
        <img src="../../assets/undraw_following.svg" alt="" class="w-4/12 mx-auto">
    </div>
    
    <h4 class="text-center"> About Zen.</h4>
    
    <div class="mb-5">
        Zen. is a productivity app that integrates Heisenhower Matrix, GTD principle and Promodoros in a unique way in order to improve your dev routine.
    </div>

    <div class="text-center mb-10" v-if="!hideButton">
        <button class="bg-gray-600 text-white hover:bg-gray-700 focus:outline-none rounded-md px-5 py-1" @click="emit('closed')">
            See how it works
            <i class="fa fa-chevron-right ml-2"></i>
        </button>
    </div>
</div>
</template>


<script setup>
import { defineProps } from "vue"


defineProps({
    hideButton: Boolean
})
const emit = defineEmit({
    closed: Function
})
</script>
