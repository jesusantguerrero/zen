<template>
<div class="py-5 mx-auto prose prose-xl text-center">
    <h2 class="text-center"> {{ item.title }}</h2>
    
    <div class="mx-2 image">
        <img  v-if="isSelected('planahead')" src="../../assets/undraw_following.svg" alt="" class="w-full mx-auto">
        <img  v-if="isSelected('zenboard')" src="../../assets/undraw_time_management_30iu.svg" alt="" class="w-full mx-auto">
        <img  v-if="isSelected('standup')" src="../../assets/undraw_project_completed_w0oq.svg" alt="" class="w-full mx-auto">
        <img  v-if="isSelected('matrix')" src="../../assets/undraw_prioritise_tgdh.svg" alt="" class="w-full mx-auto">
    </div>
    
    <div
        class="pb-5 mx-2 mt-2 mb-5 bg-gray-50 h-30" 
        >
        <span class="font-bold"> {{ item.title }} </span>
        <div v-html="item.content"> </div>
    </div>
    
    <div class="grid grid-cols-2 mx-2 mt-5 mb-5 text-left md:flex">
        <div v-for="(item, itemName) in state.items" :key="itemName"
            class="w-full text-xs text-center list-item bg-gray-50 hover:bg-gray-200" 
            :class="{'bg-gray-300': isSelected(itemName)}" 
            @click="setSelected(itemName)" 
        >
            {{ item.title }}
        </div>
    </div>

    <div class="mb-10 text-center" v-if="!hideButton">
        <button class="px-5 py-1 text-white bg-green-400 rounded-md hover:bg-green-500 focus:outline-none" @click="emit('closed')">
            Start Building
            <i class="ml-2 fa fa-chevron-right"></i>
        </button>
    </div>
</div>
</template>


<script setup>
import { computed, reactive} from "vue"
const emit = defineEmits({
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
