
<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { useDateTime } from "../../utils/useDateTime";
import { ElDatePicker } from "element-plus"

const props = defineProps<{
  modelValue: Date,
  mode: string
}>();

const emit = defineEmits({
  "update:modelValue": Date,
});

const state = reactive<{
  date: Date
}>({
  date: new Date()
})

watch(
  () => props.modelValue,
  (value) => {
    state.date = value || state.date;
  },
  { immediate: true }
);

const { formattedDate } = useDateTime(state.date);

const emitDate = () => {
  emit("update:modelValue", state.date);
};

const input = ref(null);
onMounted(() => {
  input.tabIndex = -1;
});

const focusInput = () => {
  const inputElement =
    input.value && input.value.$el.nextSibling.querySelector(".el-input__inner");
  if (inputElement) {
    inputElement.focus();
  }
};

const previousDate = () => {
  state.date = new Date(state.date.setDate(state.date.getDate() - 1));
  emit("update:modelValue", state.date);
};

const nextDate = () => {
  state.date = new Date(state.date.setDate(state.date.getDate() + 1));
  emit("update:modelValue", state.date);
};
</script>

<template>
  <section class="flex overflow-hidden border-2 border-gray-200 rounded-md date-pager dark:border-gray-500">
    <button
      class="px-2 transition-colors bg-white dark:bg-gray-700 dark:text-gray-300 focus:outline-none hover:bg-gray-200"
      @click="previousDate()"
    >
      <IMdiChevronLeft />
    </button>
    <span class="w-44 inline-block" v-if="mode == 'day'">
      <ElDatePicker v-model="state.date" ref="input" type="date" @change="emitDate" size="large" />
    </span>
    <button
      class="px-2 transition-colors bg-white dark:bg-gray-700 dark:text-gray-300 focus:outline-none hover:bg-gray-200"
      @click="nextDate()"
    >
      <IMdiChevronRight />
    </button>
  </section>
</template>


<style lang="scss">
  .date-pager {
    .el-date-editor--date {
      width: 176px !important;
    }

    .el-input__inner {
      border: none;
      padding-right: 20px;
    }

    .el-input__icon,
    .el-input__suffix,
    .el-input__suffix-inner {
      background: transparent;
    }
  }
</style>
