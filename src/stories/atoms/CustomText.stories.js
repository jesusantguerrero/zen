import CustomText from '@atoms/CustomText.vue';

export default {
  title: 'Atoms/CustomText',
  component: CustomText,
  argTypes: {},
};

const Template = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { CustomText },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<custom-text v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {
  badge: {
    level: 1,
    name: "Zen",
    iconClass: 'fa-award'
  }
};
