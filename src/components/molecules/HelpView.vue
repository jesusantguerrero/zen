<template>
<div class="prose prose-xl text-center mx-auto py-5">
    <h2 class="text-center"> {{ item.title }}</h2>
    
    <div class="image mx-2">
        <img  v-if="isSelected('planahead')" src="../../assets/undraw_following.svg" alt="" class="w-full mx-auto">
        <img  v-if="isSelected('zenboard')" src="../../assets/zenboard-jan-29.PNG" alt="" class="w-full mx-auto">
        <img  v-if="isSelected('standup')" src="../../assets/undraw_following.svg" alt="" class="w-full mx-auto">
        <img  v-if="isSelected('matrix')" src="../../assets/undraw_following.svg" alt="" class="w-full mx-auto">
    </div>
    
    <div
        class="bg-gray-50  h-20 mx-2 pb-5" 
        >
        <span class="font-bold"> {{ item.title }} </span> {{ item.content }}
    </div>
    
    <div class="mb-5 text-left flex mx-2">
        <div v-for="(item, itemName) in state.items" :key="itemName"
            class="list-item bg-gray-50 hover:bg-gray-200 w-full text-center" 
            :class="{'bg-gray-300': isSelected(itemName)}" 
            @click="setSelected(itemName)" 
        >
            {{ item.title }}
        </div>
    </div>

    <div class="text-center mb-10">
        <button class="bg-green-400 text-white hover:bg-green-500 focus:outline-none rounded-md px-5 py-1" @click="emit('closed')">
            Start Building
            <i class="fa fa-chevron-right ml-2"></i>
        </button>
    </div>
</div>
</template>


<script setup>
import { computed, defineEmit, reactive} from "vue"
const emit = defineEmit({
    closed: Function
})

const state = reactive({
    selectedItem: 'planahead',
    items: {
        planahead: {
            image: '../assets/undraw_following.svg',
            title: "Plan Ahead",
            content: "Add your pending tasks, prioritaze them following Heisenhower Matrix principle and set day line up"
        },
        zenboard: {
            image: '../assets/undraw_following.svg',
            title: "Zen",
            content: "Focus in your main task and activate promodoros sessions complete and follow your line up"
        },
        standup: {
            image: '../assets/undraw_following.svg',
            title: "Standup",
            content: "Get your commited task of the previous day (Nice to help with those scrumm daily meetings)"
        },
        matrix: {
            image: '../assets/undraw_following.svg',
            title: "Matrix",
            content: "You can rearange your matrix if necesary (To add something in backlog)."
        }
    }
})

const setSelected = (itemName) => {
    state.selectedItem = itemName;
}

const isSelected = (itemName) => {
    return state.selectedItem == itemName;
}

const item = computed(() => {
    return state.items[state.selectedItem]
})

</script>

<style lang="scss" scoped>

.list-item {
    @apply cursor-pointer px-5 py-3 text-base;
}

.image {
    height: 250px;
    overflow: hidden;
    img {
        height: 100% !important;
        object-fit: fill;
        object-position: center;
    }
}

</style>