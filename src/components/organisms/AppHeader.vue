<template>
  <div
    class="flex items-center justify-between h-16 fixed w-full bg-white px-28"
  >
    <div class="text-2xl font-bold">
        Zen App
    </div>
    <div class="flex" v-if="user">
        <menu-item class="mx-2 pl-2">Zen </menu-item>
        <menu-item class="ml-2 px-2">Stand Up</menu-item>
        <menu-item class="mx-2 px-2">Plan Ahead</menu-item>
    </div>

    <div class="flex" v-if="user">
        <div class="mx-2">
          <i class="fa fa-bell"></i>
        </div>
        <div class="ml-2">Jesus Guerrero</div>

        <button class="ml-2" @click.prevent="logout">
          <i class="fa fa-power-off cursor-pointer" ></i>
        </button>
    </div>
  </div>
</template>

<script setup>
import { defineEmit } from "vue"
import MenuItem from "../molecules/MenuItem.vue"

defineProps({
  user: {
    type: Object
  }
})

const emit = defineEmit({
   "logout": Function
})

const logout = () => {
  emit('logout')
}
</script>
