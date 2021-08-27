<template>
    <div class="pt-10 chart-container md:pt-2 md:ml-10">
        <div class="flex justify-between">
            <h1 class="text-2xl font-bold text-gray-400 dark:text-gray-300"> Pomodoro Info</h1>
            <button class="text-gray-400 dark:text-gray-300"> <i class="fa fa-times"></i></button>
        </div>
        
        <div class="flex py-4 space-x-2 bg-white border-2 border-gray-200 rounded-md dark:bg-gray-700 dark:border-gray-600 h-14"> 
            <div class="w-full" v-if="seriesData && seriesData.length">
                Started: <span class="font-bold"> {{ seriesData[0] }} </span> 
            </div>

            <div class="w-full" v-if="seriesData && seriesData.length">
                Completed: <span class="font-bold"> {{ seriesData[1] }} </span>
            </div>
        </div>

        <task-track-view 
            :task="currentTask"
            :hide-sessions="true"
        >
        </task-track-view>  
    </div>
</template>

<script setup>
import { toRefs } from "vue";
import TaskTrackView from "./TaskTrackView.vue"

const props = defineProps({
    seriesData: Array,
    currentTask: Object
})

const { seriesData, currentTask } = toRefs(props)

</script>