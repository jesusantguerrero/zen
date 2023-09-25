<script setup lang="ts">
import { ElPopover } from 'element-plus';
import { computed } from "vue";

const { event } = defineProps<{
  event: any;
  allowSync: boolean;
}>()

const syncButtonTheme = computed((() => {
  const classes: Record<string, string> = {
    "zen-event": "bg-green-400",
    "tempo-event": "bg-blue-500 text-white",
  }

  return classes[event.class];
}))

</script>

<template>
  <article class="relative">
    <ElPopover
      placement="bottom-end"
      popper-class='tag-select dark:bg-base-lvl-2 dark:text-gray-300'
      trigger="hover"
      :width="310"
    >  
      <template #reference>
        <section class="relative" :class="{'border border-green-400': !event.duration_ms && event.class == 'zen-event'}">
          <button 
            class="absolute top-0 right-0 w-4 h-4  rounded-full" 
            :class="syncButtonTheme"
            @click.stop="$emit('sync-tempo', event)"
            :disabled="event.isLoading"
            v-if="allowSync"
          >
            <IMdiSync />
          </button>
          <div class="vuecal__event-title text-xs" v-html="event.title" />
      
          <small class="vuecal__event-time">
            <!-- Using Vue Cal Date prototypes (activated by default) -->
            <strong>Event start:</strong> <span>{{ event.start.formatTime("hh:mm:ss") }}</span><br/>
            <strong>Event end:</strong> <span>{{ event.end.formatTime("hh:mm:ss") }}</span>
          </small>
        </section> 
      </template>
      <section>
        <div class="vuecal__event-title vuecal__event-title--edit"
              contenteditable
              @blur="event.title = $event?.target?.innerHTML"
              v-html="event.title" 
          />
      
          <small class="vuecal__event-time">
            <!-- Using Vue Cal Date prototypes (activated by default) -->
            <strong>Event start:</strong> <span>{{ event.start.formatTime("hh:mm:ss") }}</span><br/>
            <strong>Event end:</strong> <span>{{ event.end.formatTime("hh:mm:ss") }}</span>
          </small>
      </section>
    </ElPopover>      
  </article>     
</template>