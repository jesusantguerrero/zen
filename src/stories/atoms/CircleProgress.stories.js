import CircleProgress from '@atoms/CircleProgress.vue';
import { ref } from 'vue-demi';

export default {
  title: 'Atoms/CircleProgress',
  component: CircleProgress,
  argTypes: {},
};

const Template = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { CircleProgress },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return {
      percent: ref(50), 
      args 
    };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<circle-progress v-model="percent" v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {
  value: 0,
  strokeWidth: 4,
  color: 'blue',
  class: 'h-20 w-20 bg-red-500'
};
