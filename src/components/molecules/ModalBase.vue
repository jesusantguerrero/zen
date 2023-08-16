<script setup>
import { ref, watch } from "vue"

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
    clickToClose: Boolean
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
</script>

<template>
    <vue-final-modal 
        v-model="isOpenLocal" 
        name="welcome" 
        classes="flex justify-center md:pt-20 w-full"
        :content-class="contentClass"
        :click-to-close="clickToClose"
        @closed="$emit('closed')"
    >
        <div class="relative w-full bg-white border dark:bg-gray-700 dark:border-gray-500 md:rounded-md modal__content">
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

            <div class="pb-20 modal__body ic-scroller">
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
</style>
