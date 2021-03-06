<template>
  <div
    class="flex items-center justify-between h-16 fixed shadow-md w-full bg-white border-gray-400 border-b-2  px-2 md:px-32"
  >
    <div class="flex items-baseline">
      <router-link class="text-2xl font-bold zen" to="/"> Zen.</router-link>
      <div class="hidden md:flex md:items-center md:ml-4" v-if="user">
        <menu-item class="mx-2 pl-2" to="/">Zenboard </menu-item>
        <menu-item class="ml-2 px-2" to="/standup">Stand Up</menu-item>
        <menu-item class="mx-2 px-2" to="/matrix">Matrix</menu-item>
        <menu-item class="mx-2 px-2" to="/metrics">Metrics</menu-item>
      </div>
    </div>

      <mobile-menu>
        <button class="text-sm lg:text-lg font-bold cursor-pointer text-gray-400 hover:text-gray-600 mt-4" @click.prevent="logout">
          Logout
        </button>
      </mobile-menu>
    <div class="hidden md:flex md:items-center" v-if="user">
      <router-link 
        to="/plan-ahead" 
        class="hidden lg:inline-block mr-2 rounded-md ring ring-gray-400 ring-offset-0 px-5 py-1 text-white bg-gray-600 hover:bg-gray-700">
        <i class="fa fa-tasks mr-2"></i>
         Plan Ahead
      </router-link>
       <div class="text-sm lg:text-lg font-bold cursor-pointer text-gray-400 mx-2 p-2 changelog flex relative hover:bg-green-100 rounded-md">
          <i class="fa fa-bullhorn"></i>
       </div>

      <el-dropdown trigger="click" class="mt-3" placement="bottom-end" :show-arrow="false" :offset="-2" @command="handleCommand">
       <el-avatar :src="profileImage">
          {{ initials }}
       </el-avatar>
      <template #dropdown>
        <el-dropdown-menu >
          <el-dropdown-item disabled>
            <i class="fa fa-user"></i>
            {{ profileName }}
          </el-dropdown-item>
          <!-- <el-dropdown-item class="p-0" command="releases">
              <i class="fa fa- cursor-pointer"></i>
              Release Notes
          </el-dropdown-item> -->
          <!-- <el-dropdown-item class="p-0" command="settings">
              <i class="fa fa-cog cursor-pointer"></i>
              Settings 
          </el-dropdown-item> -->
          <el-dropdown-item class="p-0" command="about">
              <i class="fa fa-question cursor-pointer"></i>
              About
          </el-dropdown-item> 
          <el-dropdown-item class="p-0" command="logout">
              <i class="fa fa-power-off cursor-pointer"></i>
              Logout
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed, defineEmit, toRefs, onMounted, watch } from "vue";
import MenuItem from "../molecules/MenuItem.vue";
import MobileMenu from "./MobileMenu.vue";
import { useRouter } from "vue-router";
const props = defineProps({
  user: {
    type: Object,
  },
});

const { user } = toRefs(props)

const emit = defineEmit({
  logout: Function,
});

const initHeadway = () => {
  Headway.init(HW_config)
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
</style>
