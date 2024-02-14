<script setup lang="ts">
import { ElPopover } from "element-plus";
import { computed } from "vue";

const { event } = defineProps<{
  event: any;
  allowSync: boolean;
}>();

const syncButtonTheme = computed(() => {
  const classes: Record<string, string> = {
    "zen-event": "bg-green-400",
    "tempo-event": "bg-blue-500 text-white",
  };

  return classes[event.class];
});
</script>

<template>
  <article class="relative group h-full">
    <section
      class="group"
      :class="{
        'border border-green-400': !event.duration_ms && event.class == 'zen-event',
      }"
    >
      <button
        class="absolute top-0 right-0 w-4 h-4 rounded-full transition hover:w-full hover:h-full hover:rounded-none justify-center items-center flex"
        :class="syncButtonTheme"
        @click.stop="$emit('sync-tempo', event)"
        :disabled="event.isLoading"
        v-if="allowSync"
        title="click to sync with tempo"
      >
        <IMdiSync />
      </button>
      <ElPopover
        placement="bottom-end"
        popper-class="tag-select dark:bg-base-lvl-2 dark:text-gray-300"
        trigger="hover"
        :width="310"
      >
        <template #reference>
          <div class="vuecal__event-title text-xs" v-html="event.title" />
        </template>

        <!-- Body -->
        <article>
          <div
            class="vuecal__event-title vuecal__event-title--edit"
            contenteditable
            @blur="event.title = $event?.target?.innerHTML"
            v-html="event.title"
          />

          <small class="vuecal__event-time">
            <strong>Event start:</strong>
            <span>{{ event.start.formatTime("hh:mm:ss") }}</span
            ><br />
            <strong>Event end:</strong>
            <span>{{ event.end.formatTime("hh:mm:ss") }}</span>
          </small>
        </article>
      </ElPopover>
    </section>
  </article>
</template>
