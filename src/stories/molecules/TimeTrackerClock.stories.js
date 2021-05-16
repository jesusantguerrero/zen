import TimeTrackerButton from '@atoms/tracker/TimeTrackerButton.vue';

export default {
  title: 'Atoms/Tracker/TimeTrackerButton',
  component: TimeTrackerButton,
  argTypes: {
    onClick: {},
    vModel: { control: 'text'}
  },
};

const Template = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { TimeTrackerButton },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<time-tracker-button v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {
  defaultValue: '00:00:01',
  allowRun: true,
  task: {
    tracks: []
  }
};

