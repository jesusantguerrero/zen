<template>
<router-link :to="to">
    <h2 class="text-lg font-bold cursor-pointer pb-2 border-b-4 border-white hover:border-blue-500">
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