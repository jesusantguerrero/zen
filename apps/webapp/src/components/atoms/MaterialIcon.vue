<template>
    <span :class="iconClass">{{ icon }}</span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    icon: {
        type: String,
        required: true
    },
    size: {
        type: String,
        default: 'md'
    },
    type: {
        default: 'two-tone'
    }
})

const iconClass = computed(() => {
    const iconClass = "material-icons";
    return props.type ? iconClass + `-${props.type}` : iconClass;
})
</script>