<template>
<div class="bg-white mb-10 rounded-md px-5 py-3">
    <div class="flex justify-between font-bold text-gray-500 text-left">
        <div>
            Task Stats
        </div>

        <div>
            <button 
                class="bg-gray-400 text-white px-2 py-2 rounded-3xl text-sm w-24 focus:outline-none ml-2 hover:bg-gray-500" 
                :class="{'bg-gray-600': state.selectedMode == key}"
                v-for="(mode, key) in state.modes" 
                :key="key" 
                @click="state.selectedMode = key">
                 {{ mode }}
            </button>
        </div>
    </div>

    <div class="bg-white rounded-md py-3" style="height: 400px" v-if="state.selectedMode == 'session'">
        <report-chart  id="chart-trakers" :data="completedPromodoros" :labels="timeData" :config="state.chartConfig.pomodoros"></report-chart>
    </div>

    <div class="bg-white rounded-md py-3" style="height: 400px" v-if="state.selectedMode == 'time'">
        <report-chart id="chart-time-tasks" :data="durationPromodoros" :labels="timeData" :config="state.chartConfig.pomodoroDuration"></report-chart>
    </div>
</div>
</template>

<script setup>
import { useDateTime } from "../../utils/useDateTime";
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
      backgroundColor:['rgba(3,169,244 ,.2)', 'rgba(255, 99, 132, .2)'],
      borderColor: ['rgba(54, 162, 235, .6)', 'rgba(255, 99, 132, .6)'],
      borderWidth: 2
    },
    pomodoroDuration: {
      title: ['Hours'],
      type: 'horizontalBar',
      backgroundColor:['rgba(3,169,244 ,.2)', 'rgba(255, 99, 132, .2)'],
      borderColor: ['rgba(54, 162, 235, .6)', 'rgba(255, 99, 132, .6)'],
      borderWidth: 2,
      durationX: true
    }
  },
})



const {  formatDurationFromMs } = useDateTime()
const completedPromodoros = computed(() => {
  return statsByDay.value.map((stat) => {
    return stat ? [stat.started, stat.finished] : [0, 0]
  })
})


const durationPromodoros = computed(() => {
  return statsByDay.value.map((stat) => {
    return stat ? [stat.duration_ms] : [0]
  })
})

const formatNumber = (number) => {
    return Number(number.toFixed(2))
}
</script>