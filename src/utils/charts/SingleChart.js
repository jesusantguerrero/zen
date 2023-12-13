import Chart from 'chart.js';
import LineChartDataSet from './LineChartDataSet';
import BarChartDataSet from './BarChartDataSet';
import { useDateTime } from "@/composables/useDateTime";

const {  formatDurationFromMs } = useDateTime()
export default class SingleChart {
  constructor($canvas, labels, values, config, ownDatasets) {
    const datasets = ownDatasets || this.selectDataSet(config, values);

    const data = {
      labels,
      datasets
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [{
          ticks: {
            callback(label) {
              if (!config.duration) {
                return label
              }
              return formatDurationFromMs(label).toFormat('hh:mm:ss');
            },
            beginAtZero: true
          },
        }],
        xAxes: [{
          ticks: {
            callback(label) {
              if (!config.durationX) {
                return label
              }
              return formatDurationFromMs(label).toFormat('hh:mm:ss');
            },
            beginAtZero: true
          },
        }]
      },
      tooltips: {
        callbacks: {
          label(tooltipItem) {
            if (!config.duration) {
              return tooltipItem.yLabel;
            }
            return formatDurationFromMs(tooltipItem.yLabel).toFormat('hh:mm:ss');
          }
        }
      }
    };

    this.chart = new Chart($canvas, {
      type: config.type,
      data,
      options
    });
    
    $canvas.height = 390;
    this.$canvas = $canvas;
    this.labels = labels;
    this.config = config;
    this.multiple = (ownDatasets) || false;
  }

  update(values) {
    if (Array.isArray(values[0]) && this.chart.data.datasets.length) {
        this.chart.data.datasets.forEach( (dataset, datasetIndex) => {
          dataset.data.forEach((data, index) => {
            dataset.data[index] = values[index][datasetIndex]
          })
        });
    } else if (values.length && this.chart.config.data.datasets.length) {
      this.chart.config.data.datasets[0].data = values;
    }
    this.chart.update();
  }

  selectDataSet(config, dataValue) {
    const datasets = config.type === 'line' ? LineChartDataSet : BarChartDataSet;
    const data = [];
    const values = Array.isArray(dataValue) ? dataValue : [dataValue]
    
    values.forEach(dataProp => {
      const valuesArr = Array.isArray(data) ? dataProp : [dataProp]
      valuesArr.forEach((value, index) => {
        if(!data[index]) {
         data.push({
           ...datasets[0],
            backgroundColor: config.backgroundColor[index],
            borderColor: config.borderColor[index],
            label: config.title[index],
            data: [value]
         })
        } else {
          data[index].data.push(value)
        }
      })
    })

    return data;
  }
}
