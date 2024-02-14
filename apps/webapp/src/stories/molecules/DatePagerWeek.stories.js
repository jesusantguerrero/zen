import DatePagerWeek from '~atoms/DatePagerWeek.vue';

export default {
  title: 'Atoms/DatePagerWeek',
  component: DatePagerWeek,
  argTypes: {},
};

const Template = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { DatePagerWeek },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  template: `
  <div class="w-60">
    <date-pager-week v-bind="args" />
  </div>
  `,
});

export const Default = Template.bind({});
Default.args = {
  value: "",
  placeholder: "Select a date"
};
