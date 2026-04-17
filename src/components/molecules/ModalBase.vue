<script setup>
import { computed, ref, watch } from "vue"

const props = defineProps({
    isOpen: Boolean,
    taskData: Object,
    showHeader: {
        type: Boolean,
        default: true
    },
    title: String,
    contentClass: {
        type: String,
        default: 'md:w-5/12',
    },
    clickToClose: Boolean,
    // When true, slides up from bottom on mobile (<md) and stays centered on desktop.
    bottomSheet: {
        type: Boolean,
        default: false,
    }
})

const emit = defineEmits({
    "update:isOpen": Boolean
})

const isOpenLocal = ref(false)

watch(()=> props.isOpen, (isOpen) => {
    isOpenLocal.value = isOpen;
}, { immediate: true })

watch(()=> isOpenLocal.value, (isOpen) => {
    emit("update:isOpen", isOpen)
})

const outerClasses = computed(() =>
    props.bottomSheet
        ? 'flex justify-center w-full items-end md:items-start md:pt-20'
        : 'flex justify-center md:pt-20 w-full'
)

const contentClassComputed = computed(() =>
    props.bottomSheet
        ? `w-full md:w-5/12 ${props.contentClass}`
        : props.contentClass
)

const innerRadius = computed(() =>
    props.bottomSheet
        ? 'rounded-t-2xl md:rounded-md max-h-[90vh] overflow-hidden'
        : 'md:rounded-md'
)
</script>

<template>
    <vue-final-modal
        v-model="isOpenLocal"
        name="welcome"
        :classes="outerClasses"
        :content-class="contentClassComputed"
        :click-to-close="clickToClose"
        @closed="$emit('closed')"
    >
        <div
            class="relative w-full bg-white border dark:bg-gray-700 dark:border-gray-500 modal__content"
            :class="innerRadius"
        >
            <!-- Drag-handle affordance on mobile when in bottom-sheet mode -->
            <div
                v-if="bottomSheet"
                class="flex justify-center pt-2 pb-1 md:hidden"
                aria-hidden="true"
            >
                <span class="block w-10 h-1 bg-gray-300 rounded-full dark:bg-gray-500"></span>
            </div>
            <div class="px-2 py-2 modal__header-container dark:text-gray-300" v-if="showHeader">
                <slot name="title">
                    <div class="flex justify-between px-5 py-4 modal__header dark:text-gray-300">
                        <h3> {{ title }} </h3>
                        <button @click="isOpenLocal=false">
                            <i class="fa fa-times "></i>
                        </button>
                    </div>
                </slot>
            </div>

            <div class="pb-20 modal__body ic-scroller" :class="{ 'modal__body--sheet': bottomSheet }">
                <slot name="body"></slot>
            </div>

            <div class="absolute bottom-0 w-full px-5 py-2 text-right bg-white modal__footer dark:bg-gray-700">
                <slot name="footer"></slot>
            </div>
        </div>
    </vue-final-modal>
</template>



<style lang="scss">
.modal__body {
    overflow: auto;
    max-height: 500px;
}

.modal__body--sheet {
    // On mobile, allow the sheet body to grow with content up to the 90vh cap
    @media (max-width: 767px) {
        max-height: calc(90vh - 120px);
    }
}
</style>
