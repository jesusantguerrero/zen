import TimeTrackerClock from '@molecules/TimeTrackerClock.vue';

export default {
  title: 'Molecules/TimeTrackerClock',
  component: TimeTrackerClock,
  argTypes: {},
};

const Template = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { TimeTrackerClock },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<time-tracker-clock v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {
 task: {
   title: 'test'
 },
};


export const Mini = Template.bind({});
Mini.args = {
 task: {
   title: 'test'
 },
 size: 'mini'
};
