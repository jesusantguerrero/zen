import Chart from 'chart.js';
import LineChartDataSet from './LineChartDataSet';
import BarChartDataSet from './BarChartDataSet';

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
      scales: (!config.money) ? null : {
        yAxes: [{
          ticks: {
            callback(label) {
              return `RD$ ${label}`;
            },
            beginAtZero: true
          }
        }]
      },
      tooltips: {
        callbacks: {
          label(tooltipItem) {
            if (!config.money) {
              return tooltipItem.yLabel;
            }
            return `RD$  ${ooltipItem.yLabel}`;
          }
        }
      }
    };

    this.chart = new Chart($canvas, {
      type: config.type,
      data,
      options
    });

    console.log(this.chart);

    $canvas.height = 390;
    this.multiple = (ownDatasets) || false;
  }

  update(values) {
    if (Array.isArray(values[0])) {
        this.chart.data.datasets.forEach( (dataset, datasetIndex) => {
          dataset.data.forEach((data, index) => {
            dataset.data[index] = values[index][datasetIndex]
          })
        });
    } else {
      this.chart.config.data.datasets[0].data = values;
    }
    this.chart.update();
  }

  selectDataSet(config, values) {
    const datasets = config.type === 'line' ? LineChartDataSet : BarChartDataSet;
    const data = [];
    
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
    console.log(data)
    return data;
  }
}
