<template>
<div>
    <button class="md:hidden mr-4 text-2xl focus:outline-none" @click="drawer = true">
        <i class="fas fa-bars"></i>
    </button>
    
    <el-drawer
    title="Zen."
    v-model="drawer"
    size="50%"
    direction="ltr">
        <template #title>
             <router-link class="text-2xl font-bold zen" to="/"> Zen.</router-link>
        </template>
            <div class="pt-2 px-2 w-full">
            <menu-item class="mx-2 pl-2" to="/">Dashboard </menu-item>
            <menu-item class="ml-2 px-2" to="/standup">Stand Up</menu-item>
            <menu-item class="mx-2 px-2" to="/matrix">Matrix</menu-item>
            <menu-item class="mx-2 px-2" to="/plan-ahead">Plan Ahead</menu-item>
            <menu-item class="mx-2 px-2" to="/about">About</menu-item>
            <slot></slot>
        </div>
    </el-drawer>
</div>
</template>

<script setup>
import { ref } from "vue";
import MenuItem from "../molecules/MenuItem.vue";
const drawer = ref(false)
</script>