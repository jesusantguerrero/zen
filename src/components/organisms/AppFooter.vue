<template>
  <div
    class="flex items-center zen justify-between h-8 fixed bottom-0 shadow-md w-full bg-gray-700 text-white  px-2 md:px-32"
  >
    <div class="w-full text-center">
      Zen.
    </div>
    <div class="w-full text-center hidden md:block">
      Jesus Guerrero
    </div>

    <div class="w-full text-center text-white hidden md:block">
      2021
    </div>
  </div>
</template>

<script setup>
import { defineEmit } from "vue";
import MenuItem from "../molecules/MenuItem.vue";

defineProps({
  user: {
    type: Object,
  },
});

const emit = defineEmit({
  logout: Function,
});

const logout = () => {
  emit("logout");
};
</script>

<style lang="scss">
:root {
  --tw-border-opacity: 0.7
}
</style>
