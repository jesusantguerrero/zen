<script setup lang="ts">
import { ElPopover } from 'element-plus';

const props = defineProps<{
  event: any;
  allowSync: boolean;
}>()

</script>

<template>
  <article class="relative">
    <ElPopover
      placement="bottom-end"
      popper-class='tag-select dark:bg-gray-900 dark:text-gray-300'
      trigger="hover"
      :width="310"
    >  
      <template #reference>
        <section class="relative">
          <button 
            class="absolute top-0 right-0 w-4 h-4 bg-green-400 rounded-full" 
            @click.stop="$emit('sync-tempo', event)"
            :disabled="event.isLoading"
            v-if="allowSync"
          >
            <IMdiSync />
          </button>
          <div class="vuecal__event-title" v-html="event.title" />
      
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

<style lang="scss">
.tempo-event, .zen-event {
  position: relative;
    height: 102.667px;
    width: 168px;
    min-height: 20px;
    border: 1px solid rgb(188, 216, 224);
    border-radius: 4px;
    box-shadow: rgba(0, 0, 0, 0.08) 0px 1px 3px 0px;
    font-size: 14px;
    flex-direction: column;
    display: flex;
    transition: min-height 0.3s ease 0s, box-shadow 0.3s ease-in-out 0s;
    text-decoration: none;
    background: rgb(238, 243, 248);
    line-height: 1.42857;
    touch-action: none;
    -webkit-box-pack: justify;
    justify-content: space-between;
    padding: 8px;
    opacity: 1;
    cursor: grab;
    margin-bottom: 0px;
    color: rgba(0, 28, 61, 0.72);
    user-select: none;
}
</style>