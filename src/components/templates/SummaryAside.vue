<template>
<div class="space-y-4 md:block md:mt-0">
    <!-- Matrix summary card — each quadrant clickable to drill down -->
    <section class="grid grid-cols-2 gap-1 overflow-hidden bg-white dark:bg-gray-500 border dark:border-gray-600 rounded-b-md">
            <article
                role="button"
                tabindex="0"
                class="relative flex flex-col items-center justify-center h-24 px-4 font-bold transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
                v-for="(quadrant, matrixName) in matrix"
                :key="matrixName"
                :class="[
                    quadrant.classes,
                    selected === matrixName ? 'ring-2 ring-accent ring-inset' : ''
                ]"
                :aria-pressed="selected === matrixName"
                @click="toggle(matrixName)"
                @keydown.enter.prevent="toggle(matrixName)"
                @keydown.space.prevent="toggle(matrixName)"
            >
                <div class="absolute right-0 w-6/12 h-full bg-gradient-to-r from-transparent via-transparent to-white opacity-20" />
                <span class="mr-2 capitalize">{{ matrixName }}</span>
                {{ quadrant.list.length }}
                <i
                    v-if="selected === matrixName"
                    class="absolute top-1 right-2 text-xs fa fa-chevron-down"
                    aria-hidden="true"
                />
            </article>
    </section>
</div>
</template>

<script setup>
const props = defineProps({
    matrix: {
        type: Object,
        required: true,
    },
    selected: {
        type: String,
        default: null,
    },
})

const emit = defineEmits(['update:selected'])

const toggle = (matrixName) => {
    emit('update:selected', props.selected === matrixName ? null : matrixName)
}
</script>
