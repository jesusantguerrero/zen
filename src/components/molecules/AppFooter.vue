<template>
<div class="bottom-0 hidden w-full px-2 text-white bg-gray-700 shadow-md md:fixed md:px-32">
  <div
    class="flex items-center justify-between h-8 zen"
  >
    <div class="w-full text-center">
      Zen.
    </div>
    <div class="hidden w-full text-center md:block">
      Jesus Guerrero
    </div>

    <div class="hidden w-full text-center text-white md:block">
      2021
    </div>
  </div>
</div>
</template>

<script setup>
import MenuItem from "../molecules/MenuItem.vue";

defineProps({
  user: {
    type: Object,
  },
});

const emit = defineEmits({
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
