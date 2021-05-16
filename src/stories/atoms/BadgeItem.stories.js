import BadgeItem from '@atoms/BadgeItem.vue';

export default {
  title: 'Atoms/BadgeItem',
  component: BadgeItem,
  argTypes: {},
};

const Template = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { BadgeItem },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<badge-item v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {
  badge: {
    level: 1,
    name: "Zen",
    iconClass: 'fa-award'
  }
};
