<script setup lang="ts">
import { computed } from "vue"
import type { IProject } from "@/plugins/firebase/useProjectsFirestore"

const props = defineProps<{
  project?: IProject | null
  compact?: boolean
  scheduledToday?: boolean
}>()

const labelClass = computed(() =>
  props.compact
    ? "px-1.5 py-0.5 text-[10px]"
    : "px-2 py-0.5 text-xs"
)
</script>

<template>
  <span
    v-if="project"
    class="flex items-center rounded-full font-semibold whitespace-nowrap border"
    :class="[labelClass, scheduledToday ? 'ring-1 ring-accent' : '']"
    :style="{
      color: project.color,
      borderColor: project.color + '66',
      backgroundColor: project.color + '1a',
    }"
    :title="scheduledToday ? `${project.name} — scheduled for today` : project.name"
  >
    <span
      class="inline-block w-1.5 h-1.5 mr-1 rounded-full"
      :style="{ backgroundColor: project.color }"
    ></span>
    {{ project.name }}
    <i v-if="scheduledToday" class="ml-1 text-[9px] fa fa-calendar-day" aria-hidden="true" />
  </span>
</template>
