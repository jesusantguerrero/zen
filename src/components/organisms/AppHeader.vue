<template>
  <div class="fixed z-50 w-full">
    <div
      class="flex items-center justify-between w-full h-16 px-2 bg-white border-b-2 border-gray-400 shadow-md dark:bg-gray-700 dark:border-gray-600 md:px-32"
    >
      <div class="flex items-baseline">
        <router-link class="text-2xl font-bold dark:text-gray-300 dark:hover:text-white zen" to="/"> Zen.</router-link>
        <div class="hidden md:flex md:items-center md:ml-4" v-if="user">
          <!-- <menu-item class="pl-2 mx-2" to="/home" icon="dashboard"> Home </menu-item> -->
          <menu-item class="pl-2 mx-2" to="/zenboard" icon="schedule">Zenboard </menu-item>
          <menu-item class="px-2 ml-2" to="/standup" icon="history">Stand Up</menu-item>
          <menu-item class="px-2 mx-2" to="/matrix" icon="grid_view">Matrix</menu-item>
          <menu-item class="px-2 mx-2" to="/metrics" icon="grid_view">Metrics</menu-item>
        </div>
      </div>
  
        <mobile-menu>
          <button class="mt-4 text-sm font-bold text-gray-400 cursor-pointer lg:text-lg hover:text-gray-600" @click.prevent="logout">
            Logout
          </button>
        </mobile-menu>
      <div class="hidden md:flex md:items-center" v-if="user">
        <app-notification
            :notifications="unreadNotifications"
        />
    
        <div class="relative flex p-2 mx-2 text-sm font-bold text-gray-400 rounded-md cursor-pointer lg:text-lg changelog hover:bg-green-100 dark:hover:bg-gray-600 dark:hover:text-white">
            <i class="fa fa-bullhorn"></i>
        </div>
  
        <el-dropdown trigger="click" class="mt-3" placement="bottom-end" :show-arrow="false" :offset="-2" @command="handleCommand">
          <el-avatar :src="profileImage">
              {{ initials }}
          </el-avatar>
          <template #dropdown>
            <el-dropdown-menu class="dark:bg-gray-800 dark:text-gray-200">
              <el-dropdown-item disabled class="dark:bg-gray-800 dark:hover:bg-gray-700">
                <i class="fa fa-user"></i>
                {{ profileName }}
              </el-dropdown-item>
              <!-- <el-dropdown-item class="p-0" command="settings">
                  <i class="cursor-pointer fa fa-cog"></i>
                  Settings
              </el-dropdown-item>  -->
              <el-dropdown-item class="p-0" command="about">
                  <i class="cursor-pointer fa fa-question"></i>
                  About
              </el-dropdown-item> 
              <el-dropdown-item class="p-0" command="logout">
                  <i class="cursor-pointer fa fa-power-off"></i>
                  Logout
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs, onMounted, watch, inject } from "vue";
import MenuItem from "../molecules/MenuItem.vue";
import MobileMenu from "./MobileMenu.vue";
import AppNotification from "../organisms/AppNotification.vue";
import { useRouter } from "vue-router";

const props = defineProps({
  user: {
    type: Object,
  },
});

const { user } = toRefs(props)

const emit = defineEmits({
  logout: Function,
});

const initHeadway = () => {
  window.Headway && Headway.init(HW_config)
}

watch(() => user.value, (userData) => {
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
  const provider = user.value.providerData[0];
  return provider.displayName || provider.email;
})

const profileImage = computed(() => {
  const provider = user.value.providerData[0];
  return provider.photoURL;
})

const initials = computed(() => {
  const provider = user.value.providerData[0];
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

.router-link-active .menu-item{
  @apply text-gray-700
}

html.dark {
.el-dropdown-menu__item:focus, .el-dropdown-menu__item:not(.is-disabled):hover {
    background-color: #374151 !important;
    color: white !important;
}
}
</style>
