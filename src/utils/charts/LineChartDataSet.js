const config = {};

export default [{
  label: config.title || '',
  fill: false,
  lineTension: 0.3,
  backgroundColor: config.backgroundColor || 'rgb(54, 162, 235)',
  borderColor: config.borderColor || 'rgb(54, 162, 235)',
  borderCapStyle: 'butt',
  borderDash: [],
  borderDashOffset: 0.0,
  borderJoinStyle: 'miter',
  pointBorderColor: 'rgb(54, 162, 235)',
  pointBackgroundColor: 'rgb(40, 150, 230)',
  pointBorderWidth: 1,
  pointHoverRadius: 7,
  pointHoverBackgroundColor: config.pointHoverBackgroundColor || '#fff',
  pointHoverBorderColor: config.pointHoverBorderColor || '#0077ff',
  pointHoverBorderWidth: config.pointHoverBoderWith || 2,
  pointRadius: 1,
  pointHitRadius: 10,
  data: '',
  spanGaps: false,
}];
