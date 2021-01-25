<template>
  <div
    class="flex items-center justify-between shadow-md h-16 px-10 fixed w-full"
  >
    <div class="text-2xl font-bold">
        Zen App
    </div>
    <div class="flex">
        <menu-item class="mx-2 pl-2">Zen </menu-item>
        <menu-item class="ml-2 px-2">Stand Up</menu-item>
        <menu-item class="mx-2 px-2">Plan Ahead</menu-item>
    </div>

    <div class="flex">
        <div class="mx-2">Notifications</div>
        <div class="ml-2">Jesus Guerrero</div>
    </div>
  </div>
</template>

<script setup>
import MenuItem from "../molecules/MenuItem.vue"

</script>
