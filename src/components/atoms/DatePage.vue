<template>
  <div class="date-pager flex rounded-md border-gray-200 border-2 overflow-hidden">
    <button
      class="bg-white px-2 focus:outline-none hover:bg-gray-200 transition-colors"
      @click="previousDate()"
    >
      <i class="fa fa-chevron-left"></i>
    </button>
    <el-date-picker v-model="date" ref="input" type="date" @change="emitDate">
    </el-date-picker>
    <button
      class="bg-white px-2 focus:outline-none hover:bg-gray-200 transition-colors"
      @click="nextDate()"
    >
      <i class="fa fa-chevron-right"></i>
    </button>
  </div>
</template>

<script setup>
import { defineEmit, onMounted, ref, watch } from "vue";
import { useDateTime } from "../../utils/useDateTime";
import { ElDatePicker } from "element-plus"

const props = defineProps({
  modelValue: Date,
});

const emit = defineEmit({
  "update:modelValue": Date,
});

const date = ref(null);

watch(
  () => props.modelValue,
  (value) => {
    date.value = value;
  },
  { immediate: true }
);

const { formattedDate } = useDateTime(date);

const emitDate = () => {
  emit("update:modelValue", date.value);
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
  date.value = new Date(date.value.setDate(date.value.getDate() - 1));
  emit("update:modelValue", date.value);
};

const nextDate = () => {
  date.value = new Date(date.value.setDate(date.value.getDate() + 1));
  emit("update:modelValue", date.value);
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
