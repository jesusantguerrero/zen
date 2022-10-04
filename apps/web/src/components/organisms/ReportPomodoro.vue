<template>
<div class="px-5 py-3 mb-10 bg-white rounded-md dark:bg-gray-700 dark:border-gray-600">
    <div class="flex justify-between font-bold text-left text-gray-500 dark:text-gray-300">
        <div>
            Pomodoro Stats
        </div>

        <div class="flex flex-wrap justify-end ">
            <button 
                class="w-24 px-2 py-2 ml-2 text-sm text-white bg-gray-400 rounded-3xl focus:outline-none hover:bg-gray-500" 
                :class="{'bg-gray-600': state.selectedMode == key}"
                v-for="(mode, key) in state.modes" 
                :key="key" 
                @click="state.selectedMode = key">
                 {{ mode }}
            </button>
            <slot class="mt-2 -md:mt-0" />
        </div>
    </div>
    <div class="py-3 bg-white rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" style="height: 400px" v-if="state.selectedMode == 'session'">
        <report-chart data-class="graphics chart" id="chart-pomo-sessions" :data="completedPomodoros" :labels="timeData" :config="state.chartConfig.pomodoros"></report-chart>
    </div>

    <div class="py-3 bg-white rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" style="height: 400px" v-if="state.selectedMode== 'time'">
        <report-chart data-class="graphics chart" id="chart-pomo-sessions" :data="durationPomodoros" :labels="timeData" :config="state.chartConfig.pomodoroDuration"></report-chart>
    </div>
</div>
</template>

<script setup>
import { useDateTime } from "../../composables/useDateTime";
import { reactive, toRefs, computed } from "vue";
import ReportChart from "./ReportChart.vue"


const props = defineProps({
    statsByDay: {
        type: Object,
        required: true
    },
    timeData: {
        type: Array,
        required: true
    }
})

const { statsByDay } = toRefs(props);
const redColor = "rgba(96, 165, 250, 1)";
const state = reactive({
  modes: {
      session: 'By Session',
      time: 'By Time'
  },
  selectedMode: 'session',
  chartConfig: {
    pomodoros: {
      title: ['Started', 'Completed'],
      type: 'bar',
      backgroundColor:[redColor, 'rgba(96, 165, 250, 1)'],
      borderColor: [redColor, 'rgba(96, 165, 250, 1)'],
      borderWidth: 2
    },
    pomodoroDuration: {
      title: ['Hours'],
      type: 'line',
      backgroundColor:[redColor, 'rgba(96, 165, 250, 1)'],
      borderColor: [redColor, 'rgba(96, 165, 250, 1)'],
      borderWidth: 2,
      duration: true
    }
  },
})



const {  formatDurationFromMs } = useDateTime()
const completedPomodoros = computed(() => {
  return statsByDay.value && statsByDay.value.map((stat) => {
    return stat ? [stat.pomodoro.started, stat.pomodoro.finished] : [0, 0]
  })
})

const durationConfig = computed({
    
})

const durationPomodoros = computed(() => {
  return statsByDay.value && statsByDay.value.map((stat) => {
    return stat ? [stat.pomodoro.duration_ms] : [0]
  })
})

</script>