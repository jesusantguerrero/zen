<template>
    <div class="px-3 py-5 menu">
        <div class="flex items-baseline ml-3">
            <router-link class="text-2xl font-bold dark:text-gray-300 dark:hover:text-white zen" to="/"> Zen.</router-link>
        </div>
        <div>
        <div class="hidden ml-3 text-left md:block">
            <menu-item class="pl-2 mx-2" to="/home"> Home </menu-item>
            <menu-item class="pl-2 mx-2" to="/zenboard">Zenboard </menu-item>
            <menu-item class="px-2 ml-2" to="/standup">Stand Up</menu-item>
            <menu-item class="px-2 mx-2" to="/matrix">Matrix</menu-item>
            <menu-item class="px-2 mx-2" to="/metrics">Metrics</menu-item>
        </div>
          <div class="font-bold"> Projects</div>
        </div>
      </div>
</template>

<script setup>
    import MenuItem from "../molecules/MenuItem.vue";

</script>