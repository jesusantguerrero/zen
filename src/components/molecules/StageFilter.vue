<script setup lang="ts">
import { computed } from "vue"
import { ElPopover } from "element-plus"
import { StageTypes, STAGE_META, STAGE_ORDER } from "@/domain/matrix/types/enum/taskTypes"

const props = defineProps<{
  modelValue: StageTypes[]
  compact?: boolean
  dropdown?: boolean
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: StageTypes[]): void
}>()

const stages = STAGE_ORDER.map((key) => ({ key, ...STAGE_META[key] }))
const selected = computed(() => new Set(props.modelValue || []))
const activeStages = computed(() =>
  stages.filter((s) => selected.value.has(s.key))
)

const toggle = (stage: StageTypes) => {
  const next = new Set(selected.value)
  if (next.has(stage)) next.delete(stage)
  else next.add(stage)
  emit("update:modelValue", [...next])
}

const clear = () => emit("update:modelValue", [])
</script>

<template>
  <div v-if="dropdown" class="flex items-center">
    <el-popover
      trigger="click"
      placement="bottom-end"
      popper-class="dark:bg-gray-900 dark:text-gray-300"
      :width="280"
      :show-arrow="false"
    >
      <div class="flex flex-wrap items-center gap-2 p-1">
        <button
          v-for="stage in stages"
          :key="stage.key"
          type="button"
          :title="stage.description"
          class="flex items-center px-2 py-1 text-xs transition-all border rounded-full focus:outline-none"
          :class="selected.has(stage.key)
            ? `${stage.badgeClass} border-transparent font-semibold`
            : 'border-gray-200 text-gray-500 hover:border-gray-400 dark:border-gray-600 dark:text-gray-400'"
          @click.prevent="toggle(stage.key)"
        >
          <span class="inline-block w-2 h-2 mr-1.5 rounded-full" :class="stage.dotClass"></span>
          {{ stage.label }}
        </button>
        <button
          v-if="modelValue && modelValue.length"
          type="button"
          class="ml-1 text-xs text-gray-400 hover:text-red-400 focus:outline-none"
          @click.prevent="clear"
        >
          Clear
        </button>
      </div>

      <template #reference>
        <button
          type="button"
          :title="activeStages.length ? `Stage: ${activeStages.map(s => s.label).join(', ')}` : 'Filter by stage'"
          class="relative flex items-center justify-center h-10 text-xs text-gray-500 transition-colors border-2 border-gray-200 rounded-md hover:border-gray-400 focus:outline-none dark:bg-transparent dark:text-gray-300 dark:border-base-lvl-3"
          :class="activeStages.length ? 'px-3 space-x-1' : 'w-10'"
        >
          <i class="fa fa-flag"></i>
          <template v-if="activeStages.length">
            <span class="font-semibold">{{ activeStages.length }}</span>
            <span
              v-for="stage in activeStages.slice(0, 2)"
              :key="stage.key"
              class="inline-block w-2 h-2 rounded-full"
              :class="stage.dotClass"
            ></span>
          </template>
        </button>
      </template>
    </el-popover>
  </div>

  <div v-else class="flex flex-wrap items-center gap-1 text-xs">
    <span v-if="!compact" class="mr-1 font-semibold text-gray-500 dark:text-gray-400">Stage:</span>
    <button
      v-for="stage in stages"
      :key="stage.key"
      type="button"
      :title="stage.description"
      class="flex items-center px-2 py-1 transition-all border rounded-full focus:outline-none"
      :class="selected.has(stage.key)
        ? `${stage.badgeClass} border-transparent font-semibold`
        : 'border-gray-200 text-gray-500 hover:border-gray-400 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-400'"
      @click.prevent="toggle(stage.key)"
    >
      <span class="inline-block w-2 h-2 mr-1.5 rounded-full" :class="stage.dotClass"></span>
      <span v-if="!compact">{{ stage.label }}</span>
    </button>
    <button
      v-if="modelValue && modelValue.length"
      type="button"
      class="ml-1 text-gray-400 hover:text-red-400 focus:outline-none"
      title="Clear stage filter"
      @click.prevent="clear"
    >
      <i class="fa fa-times"></i>
    </button>
  </div>
</template>
