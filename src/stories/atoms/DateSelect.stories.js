import DateSelect from '@atoms/DateSelect.vue';

export default {
  title: 'Atoms/DateSelect',
  component: DateSelect,
  argTypes: {},
};

const Template = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { DateSelect },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<date-select v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {
  value: "",
  placeholder: "Select a date"
};
