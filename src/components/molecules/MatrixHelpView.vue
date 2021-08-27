<template>
<div class="py-5 mx-auto prose-sm prose text-center md:prose-lg">
    <h3 class="text-center dark:text-gray-50" :class="titleClass"> {{ item.title }}</h3>
    
    <div class="pb-5 mx-2 mt-2 mb-5 bg-transparent h-30 dark:text-gray-300" >
        <div v-html="item.content"> </div>
    </div>
</div>
</template>


<script setup>
import { computed, reactive} from "vue"
const emit = defineEmits({
    closed: Function
})

const props = defineProps({
    matrix: String,
    titleClass: String
})

const state = reactive({
    items: {
        todo: {
            title: "Important / Urgent",
            content: `Things with clear deadline and concequences for not taking immediate action`
        },
        schedule: {
            title: "Important / Not urgent",
            content: "This is considered a strategic section of the matrix, perfect for long-term development. Items that belong here are important, but they do not require your immediate attention."
        },
        delegate: {
            title: "Not Important / Urgent",
            content: "Things that need to be done but dont require your specific skills.<br> Busy work"
        },
        delete: {
            title: "Not Important / Not Urgent ",
            content: "You can either set -Tasks that you need to abandon, distractions or things that doesn't align with your goals at all but comsume your time."
        },
        backlog: {
            title: "Uncategorized at the moment",
            content: "Not clear at the moment you will set it's category later or delete."
        }
    }
})

const isSelected = (itemName) => {
    return props.matrix == itemName;
}

const item = computed(() => {
    return state.items[props.matrix]
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
