<template>
  <ElPopover placement="bottom-end" :width="300" trigger="click">
    <template #reference>
      <div
        class="relative flex p-2 mx-2 text-sm font-bold text-gray-400 rounded-md cursor-pointer lg:text-lg hover:bg-green-100 dark:hover:bg-gray-600 dark:hover:text-white"
      >
        <i class="fa fa-bell"></i>
        <div
          class="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-400 rounded-full -bottom-2 -right-1"
          v-if="notifications.length"
        >
          {{ notifications.length }}
        </div>
      </div>
    </template>

    <section class="notification-body">
      <div
        class="flex items-center justify-between pb-2 font-bold text-center border-b"
      >
        <div>Notifications</div>
        <div>
          <router-link 
            v-if="false"
            :to="{name: 'settings'}"  
            class="px-2 py-1 transition rounded-sm hover:bg-gray-100 focus:outline-none">
            <i class="fas fa-sliders-h"></i> Manage preferences
          </router-link>
        </div>
      </div>
      <div class="divide-y">
        <notification-item
          v-for="notification in visibleNotifications"
          :key="notification.uid"
          :notification="notification"
        />
        <router-link 
          v-if="seeMoreLength" 
          :to="{name: 'notifications'}"
          class="w-full py-2 font-bold text-center underline"
        >
          And {{ seeMoreLength }} more
        </router-link>
        <div class="flex items-center justify-center h-20" v-if="!notifications.length">
            You are up to date
        </div>
        <div class="w-full py-1">
          <router-link 
            :to="{name: 'notifications'}"
            class="block w-full py-2 text-center transition rounded-sm hover:bg-gray-100 focus:outline-none">
            See all notifications
          </router-link>  
        </div>
      </div>
    </section>
  </ElPopover>
</template>

<script>
import { computed, reactive, toRefs } from 'vue'
import NotificationItem from '../atoms/NotificationItem.vue'

export default {
  components: { NotificationItem },
  props: {
      notifications: {
          type: Array,
          default() {
              return []
          }
      }
  },
  setup(props) {
    const notificationsToShow = 5;
    
    const state = reactive({
      visibleNotifications: computed(() => {
        return props.notifications.slice(0, notificationsToShow);
      }),
      seeMoreLength: computed(() => {
        return props.notifications.slice(notificationsToShow).length;
      })
    });

    return {
      ...toRefs(state)
    }
  }
    
}
</script>
