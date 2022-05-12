import TabHeader from '~atoms/TabHeader.vue';

export default {
  title: 'Atoms/TabHeader',
  component: TabHeader,
  argTypes: {},
};

const Template = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { TabHeader },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<tab-header v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {
  value: 'focused',
  tabs: [{
    label: 'Focused',
    name: 'focused',
    focusClass: 'text-green-400'
  },
  {
    label: 'Todo',
    name: 'todo',
    focusClass: 'text-green-400'
  },
  {
    label: 'Schedule',
    name: 'schedule',
    focusClass: 'text-green-400'
  }
]
};
