<template>
<router-link :to="to">
    <h2 class="text-sm lg:text-lg font-bold cursor-pointer text-gray-400 dark:text-gray-300  dark:hover:text-gray-50 hover:text-gray-600">
        <slot></slot>
    </h2>
</router-link>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
    to: String
})
</script>