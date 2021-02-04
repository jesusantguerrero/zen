<template>
    <div class="chart-container pt-2 ml-10">
        <div class="flex justify-between">
            <h1 class="text-gray-400 font-bold text-2xl"> Promodoro Info</h1>
            <button class="text-gray-400"> <i class="fa fa-times"></i></button>
        </div>
        
        <div class="flex space-x-2 py-4 bg-white border-gray-200 border-2 rounded-md h-14"> 
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
import { defineProps, toRefs } from "vue";
import TaskTrackView from "./TaskTrackView.vue"

const props = defineProps({
    seriesData: Array,
    currentTask: Object
})

const { seriesData, currentTask } = toRefs(props)

</script>