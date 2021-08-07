<template>
  <div class="flex overflow-hidden border-2 border-gray-200 rounded-md date-pager dark:border-gray-500">
    <button
      class="px-2 transition-colors bg-white dark:bg-gray-700 dark:text-gray-300 focus:outline-none hover:bg-gray-200"
      @click="previousDate()"
    >
      <i class="fa fa-chevron-left"></i>
    </button>
      <el-date-picker v-model="state.date" ref="input" type="date" @change="emitDate" />
    <button
      class="px-2 transition-colors bg-white dark:bg-gray-700 dark:text-gray-300 focus:outline-none hover:bg-gray-200"
      @click="nextDate()"
    >
      <i class="fa fa-chevron-right"></i>
    </button>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { useDateTime } from "../../utils/useDateTime";
import { ElDatePicker } from "element-plus"

const props = defineProps({
  modelValue: Date,
});

const emit = defineEmits({
  "update:modelValue": Date,
});

const state = reactive({
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

const focusInput = (evt) => {
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

<style lang="scss">
  .date-pager {
    .el-date-editor--date {
      width: 130px !important;
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
