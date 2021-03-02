<template>
<div class="prose prose-xl text-center mx-auto py-5">
    <h2 class="text-center"> {{ item.title }}</h2>
    
    <div class="image mx-2">
        <img  v-if="isSelected('planahead')" src="../../assets/undraw_following.svg" alt="" class="w-full mx-auto">
        <img  v-if="isSelected('zenboard')" src="../../assets/undraw_time_management_30iu.svg" alt="" class="w-full mx-auto">
        <img  v-if="isSelected('standup')" src="../../assets/undraw_project_completed_w0oq.svg" alt="" class="w-full mx-auto">
        <img  v-if="isSelected('matrix')" src="../../assets/undraw_prioritise_tgdh.svg" alt="" class="w-full mx-auto">
    </div>
    
    <div
        class="bg-gray-50  h-30 mx-2 pb-5 mb-5 mt-2" 
        >
        <span class="font-bold"> {{ item.title }} </span>
        <div v-html="item.content"> </div>
    </div>
    
    <div class="mb-5 text-left grid grid-cols-2 md:flex mx-2 mt-5">
        <div v-for="(item, itemName) in state.items" :key="itemName"
            class="list-item bg-gray-50 hover:bg-gray-200 w-full text-center text-xs" 
            :class="{'bg-gray-300': isSelected(itemName)}" 
            @click="setSelected(itemName)" 
        >
            {{ item.title }}
        </div>
    </div>

    <div class="text-center mb-10" v-if="!hideButton">
        <button class="bg-green-400 text-white hover:bg-green-500 focus:outline-none rounded-md px-5 py-1" @click="emit('closed')">
            Start Building
            <i class="fa fa-chevron-right ml-2"></i>
        </button>
    </div>
</div>
</template>


<script setup>
import { computed, defineEmit, defineProps, reactive} from "vue"
const emit = defineEmit({
    closed: Function
})

defineProps({
    hideButton: Boolean
})

const state = reactive({
    selectedItem: 'planahead',
    items: {
        planahead: {
            image: '../assets/undraw_following.svg',
            title: "Plan Ahead",
            content: `Add your pending tasks, prioritize them following <a href="https://luxafor.com/the-eisenhower-matrix/" target="__blank">Eisenhower Matrix</a> principle, and set the <b class="font-bold">lineup</b> for today`
        },
        zenboard: {
            image: '../assets/undraw_following.svg',
            title: "Zen",
            content: "Focus on your main task and activate pomodoros sessions, complete and follow your lineup"
        },
        standup: {
            image: '../assets/undraw_following.svg',
            title: "Standup",
            content: "Get your committed task of the previous day (Nice to help with those scrum's daily meetings)."
        },
        matrix: {
            image: '../assets/undraw_following.svg',
            title: "Matrix",
            content: "You can rearrange your matrix if necessary (To add something in the backlog)."
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
    @apply cursor-pointer; 
    @apply px-5; 
    @apply py-3 ;
    @apply text-base;
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
