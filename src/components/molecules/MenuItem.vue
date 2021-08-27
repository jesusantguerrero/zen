<template>
<router-link :to="to">
    <div class="flex items-center mb-0 text-lg font-bold text-gray-400 cursor-pointer menu-item lg:text-md dark:text-gray-300 dark:hover:text-gray-50 hover:text-gray-600">
        <!-- <MaterialIcon :icon="icon" v-if="icon" class="mr-1"></MaterialIcon> -->
        <slot></slot>
    </div>
</router-link>
</template>

<script setup>
import MaterialIcon from "../atoms/MaterialIcon.vue";
const props = defineProps({
    to: String,
    icon: {
        type: String,
        default: ''
    }
})
</script>