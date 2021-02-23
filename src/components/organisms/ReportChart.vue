<template>
  <canvas ref="canvas"></canvas>
</template>

<script setup>
import SingleChart from "./../../utils/charts/SingleChart";
import { defineProps, onMounted, ref, watch, toRefs} from "vue";
const props = defineProps({
  labels: {
    type: Array,
    required: true,
  },

  data: {
    type: Array,
    required: true,
  },

  config: {
    type: Object,
    required: true,
  },

  dataClass: {
    type: String,
  },

  id: {
    type: String,
  },

  ownDataset: {
    type: Array,
    default: null,
  },
});

let chart = null;
const canvas = ref(null);
const { data } = toRefs(props)

const init = () => {
  chart = new SingleChart(canvas.value, props.labels, props.data, props.config, props.ownDataset);
};

const refresh = () => {
  const dataSets = props.ownDataset || data.value;
  if (chart) {
    chart.update(dataSets);
  } else {
    init()
  }  
};

onMounted(() => {
    data.value.length && init();
});

watch(() => canvas.value, (data) => {
    canvas.value && data.length && init() ;
}, {immediate: true })

watch(() => [...data.value], (data) => {
    canvas.value && data.length && refresh() ;
}, {immediate: true })

watch(() => props.ownDataset, () => {
   canvas && refresh();
});
</script>
