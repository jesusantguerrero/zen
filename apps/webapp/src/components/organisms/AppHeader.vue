<script lang="ts" setup>
import { computed, nextTick, ref, onMounted, watch, inject } from "vue";
import MenuItem from "../molecules/MenuItem.vue";
import AppNotification from "../organisms/AppNotification.vue";
import { useRouter } from "vue-router";
import TimeTracker from "./TimeTracker.vue";
import { useTrackerStore } from "@/store/tracker";

const trackStore = useTrackerStore()
const timeTrackerRef = ref();
trackStore.$onAction(({ name, args, after }) => {
  after(() => {
    if (name == 'setCurrentTask' && args[1]) {
      nextTick(() => {
        timeTrackerRef.value?.togglePlay()
      });
    }
  })
});

const { user } = defineProps({
  user: {
    type: Object,
  },
});

const emit = defineEmits({
  logout: Function,
});

const initHeadway = () => {
  window.Headway && Headway.init(HW_config)
}

watch(() => user, (userData) => {
  if (userData) {
    initHeadway()
  }
})

// changelog
onMounted(() => {
  initHeadway()
})

// state
const profileName = computed(() => {
  const provider = user.providerData[0];
  return provider.displayName || provider.email;
})

const profileImage = computed(() => {
  const provider = user.providerData[0];
  return provider.photoURL;
})

const initials = computed(() => {
  const provider = user.providerData[0];
  return profileName.value.split(' ').map( name => name[0]).join('');
})

const { push } = useRouter()
const handleCommand = (commandName) => {
  const commands = {
    logout: logout,
    about: push.bind(null, "/about"),
    settings: push.bind(null, {name: 'settings'}),
  }

  const command = commands[commandName]
  command && command()
}
// notifications
const notifications = inject('notifications', [])
const unreadNotifications = computed(() => {
  return notifications.value.filter(not => !not.read_at)
})

// logout
const logout = () => {
  emit("logout");
};
</script>

<template>
  <div class="fixed z-50 w-full">
    <div
      class="flex items-center justify-between w-full h-16 px-2 bg-white border-b border-gray-400 dark:border-base-lvl-3/50 shadow-md dark:bg-base-lvl-1  md:px-32"
    >
      <div class="flex items-baseline">
        <RouterLink class="text-2xl font-bold dark:text-white dark:hover:text-white zen relative" to="/"> 
          Zen
          <span class="dark:text-accent -right-3 absolute">.</span>
        </RouterLink>
        <div class="hidden md:flex md:items-center md:ml-4" v-if="user">
          <!-- <MenuItem class="pl-2 mx-2" to="/home" icon="dashboard"> Home </MenuItem> -->
          <MenuItem class="pl-2 mx-2" to="/zenboard" icon="schedule">Zenboard </MenuItem>
          <MenuItem class="px-2 ml-2" to="/standup" icon="history">Stand Up</MenuItem>
          <MenuItem class="px-2 mx-2" to="/matrix" icon="grid_view">Matrix</MenuItem>
          <MenuItem class="px-2 mx-2" to="/metrics" icon="grid_view">Metrics</MenuItem>
          <MenuItem class="px-2 mx-2" to="/timer" icon="grid_view">Timer</MenuItem>
        </div>
      </div>
  
      <div class="flex items-center " v-if="user">
        <TimeTracker 
          class="mr-4 bg-black/20 rounded-full px-6 py-1.5"
          size="sm"
          :task="trackStore.currentTask" 
          ref="timeTrackerRef"
          v-model:currentTimer="trackStore.currentTimer"
          v-model:subType="trackStore.timerSubtype"
          @track-added="trackStore.onTrackAdded"
      />

        <AppNotification
            :notifications="unreadNotifications"
        />
    
        <div class="relative flex p-2 mx-2 text-sm font-bold text-gray-400 rounded-md cursor-pointer lg:text-lg changelog hover:bg-green-100 dark:hover:bg-gray-600 dark:hover:text-white">
            <i class="fa fa-bullhorn"></i>
        </div>
  
        <ElDropdown trigger="click" class="mt-3" placement="bottom-end" :show-arrow="false" :offset="-2" @command="handleCommand">
          <ElAvatar :src="profileImage">
              {{ initials }}
          </ElAvatar>
          <template #dropdown>
            <ElDropdownMenu class="dark:bg-base-lvl-1 dark:text-gray-200">
              <ElDropdownItem disabled class="dark:bg-base-lvl-1 dark:hover:bg-gray-700">
                <i class="fa fa-user"></i>
                {{ profileName }}
              </ElDropdownItem>
              <ElDropdownItem class="p-0" command="settings">
                  <i class="cursor-pointer fa fa-cog"></i>
                  Settings
              </ElDropdownItem> 
              <ElDropdownItem class="p-0" command="about">
                  <i class="cursor-pointer fa fa-question"></i>
                  About
              </ElDropdownItem> 
              <ElDropdownItem class="p-0" command="logout">
                  <i class="cursor-pointer fa fa-power-off"></i>
                  Logout
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>
    </div>
  </div>
</template>



<style lang="scss">
:root {
  --tw-border-opacity: 0.7
}

#HW_badge_cont {
  position: absolute !important;
}

html.dark {
  .HW_frame, #HW_frame {
    @apply bg-gray-700 border-gray-500 border text-gray-300;
  }

  .outercont {
    color: rgba(209, 213, 219, var(--tw-text-opacity));
  }
}

.router-link-active div {
  @apply text-gray-700 dark:text-accent
}

html.dark {
.el-dropdown-menu__item:focus, .el-dropdown-menu__item:not(.is-disabled):hover {
    background-color: #374151 !important;
    color: white !important;
}
}
</style>
