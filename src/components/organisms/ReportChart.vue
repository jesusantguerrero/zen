<template>
  <canvas ref="canvas"></canvas>
</template>

<script setup>
import SingleChart from "./../../utils/charts/SingleChart";
import { defineProps, onMounted, ref, watch, watchEffect } from "vue";
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

  dataId: {
    type: String,
  },

  ownDataset: {
    type: Array,
    default: null,
  },
});

let chart = null;
const canvas = ref(null);
const init = () => {
  chart = new SingleChart(canvas.value, props.labels, props.data, props.config, props.ownDataset);
};

const refresh = () => {
  const data = props.ownDataset || props.data;
  chart && chart.update(data);
};

onMounted(() => {
  init();
  refresh();
});

watch(() => [...props.data], () => {
    refresh();
})

watch(() => props.ownDataset, () => {
    refresh();
});
</script>
