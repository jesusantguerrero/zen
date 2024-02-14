<template>
   <div class="date-pager flex rounded-md border-gray-200 border-2 overflow-hidden">
    <button
      class="bg-white px-2 focus:outline-none hover:bg-gray-200 transition-colors"
      @click="controls.previous()"
    >
      <i class="fa fa-chevron-left"></i>
    </button>
    <div v-if="selectedWeek" class="bg-white flex items-center font-bold text-sm text-gray-500">
      {{ formatDate(selectedWeek[0]) }} - {{ formatDate(selectedWeek[6]) }}
    </div>
    <el-date-picker v-model="date" ref="input" type="date" @change="emitDate" v-if="false">
    </el-date-picker>
    <button
      class="bg-white px-2 focus:outline-none hover:bg-gray-200 transition-colors"
      @click="controls.next()"
    >
      <i class="fa fa-chevron-right"></i>
    </button>
  </div>
</template>

<script>
import { format } from "date-fns";
import { useWeekPager } from "@/composable/useWeekPager";
import { watch, toRefs, computed, watchEffect } from "vue";

export default {
  name: "DatePagerWeek",
  props: {
    modelValue: {
      type: Date
    },
    week: {
      type: Array
    },
    nextMode: {
      type: String,
      default: "day"
    }
  },
  
  setup(props, { emit }) {
    const { modelValue, week, nextMode } = toRefs(props);
    const { controls, selectedWeek, selectedDay,startDate, endDate } = useWeekPager({
      nextMode: nextMode.value
    });

    const isMonthMode = computed(() => nextMode.value == "month");

    // week
    const emitWeek = value => {
      emit("update:week", value);
    };
    watch(week, controls.setWeek, { immediate: true });
    watch(selectedWeek, emitWeek, { immediate: true });

    // Day
    const emitDay = value => {
      emit("update:modelValue", value);
    };
    watch(modelValue,  controls.setDay , { immediate: true });
    watch(selectedDay, emitDay, { immediate: true });

    // viewHelpers
    const getISODate = date => {
      return date.toISOString ? date.toISOString().slice(0, 10) : "";
    };

    const formatDate = (date) => {
      return format(date,  'MMM dd yyyy')
    }

    return {
      selectedWeek,
      selectedDay,
      isMonthMode,
      // methods
      controls,
      // ui helpers
      getISODate,
      formatDate
    };
  }
};
</script>

<style lang="scss">
$primary-color: var(--primary-color);

.controls {
  @apply text-left bg-white shadow-lg mb-1 p-2 border-gray-100 border-2;
  border-radius: 12px;
}

.controls-container {
  @apply grid grid-cols-3 pb-3;
  user-select: none;
}

.day-item,
.day-controls {
  @apply text-center capitalize text-gray-600 py-2  cursor-pointer w-20;
  transition: all ease 0.3s;
  border-radius: 0.8rem;
  display: none;

  &:hover {
    @apply text-white;
    background: var(--primary-color);
  }
}

.day-controls {
  @apply flex justify-center items-center text-gray-700;
  &:hover {
    @apply bg-gray-400 text-gray-700;
  }
}

.selected-day {
  @apply visible text-white shadow-lg;
  display: block;
  background: var(--primary-color);
  box-shadow: 4px 4px 6px var(--primary-color-5);
}

@media (min-width: 768px) {
  .controls-container {
    @apply grid-cols-9;
    user-select: none;

    &.month {
      @apply grid-cols-7;
    }
  }

  .day-item {
    display: block;
  }
}
</style>
../../composables/useWeekPager