<template>
  <div
    class="flex items-center justify-between h-16 fixed shadow-md w-full bg-white border-gray-400 border-b-2  px-2 md:px-32"
  >
    <div class="flex items-baseline">
      <router-link class="text-2xl font-bold zen" to="/"> Zen.</router-link>
      <div class="hidden md:flex md:items-center md:ml-4" v-if="user">
        <menu-item class="mx-2 pl-2" to="/">Dashboard </menu-item>
        <menu-item class="ml-2 px-2" to="/standup">Stand Up</menu-item>
        <menu-item class="mx-2 px-2" to="/matrix">Matrix</menu-item>
      </div>
    </div>

    <div class="flex items-center" v-if="user">
      <router-link to="/plan-ahead" class="inline-block mr-2 rounded-md ring ring-gray-400 ring-offset-0 px-5 py-1 text-white bg-gray-600 hover:bg-gray-700"> Plan Ahead</router-link>
       <menu-item class="mx-2 px-2" to="/about">
        <i class="fa fa-question"></i>
       </menu-item>
      <div class="mx-2 text-gray-400 text-lg">
        <i class="fa fa-bell"></i>
      </div>
      <div class="ml-2">{{ profileName }}</div>

      <button class="ml-2" @click.prevent="logout">
        <i class="fa fa-power-off cursor-pointer"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, defineEmit, toRefs } from "vue";
import MenuItem from "../molecules/MenuItem.vue";

const props = defineProps({
  user: {
    type: Object,
  },
});

const { user } = toRefs(props)

const emit = defineEmit({
  logout: Function,
});

const profileName = computed(() => {
  const provider = user.value.providerData[0];
  return provider.displayName || provider.email;
})
const logout = () => {
  emit("logout");
};
</script>

<style lang="scss">
:root {
  --tw-border-opacity: 0.7
}
</style>
