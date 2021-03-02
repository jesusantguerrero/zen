<template>
<div>
    <vue-final-modal 
        v-model="isOpenLocal" 
        name="welcome" 
        classes="flex justify-center md:pt-20 w-full"
        content-class="md:w-5/12 "
        :click-to-close="clickToClose"
        @closed="$emit('closed')"
    >
        <div class="w-full bg-white md:rounded-md modal__content relative">
            <div class="modal__header-container py-2 px-2">
                <slot name="title">
                    <div class="modal__header flex justify-between px-5 py-4">
                        <h3> {{ title }} </h3>
                        <button @click="isOpenLocal=false">
                            <i class="fa fa-times"></i>
                        </button>
                    </div>
                </slot>
            </div>

            <div class="modal__body ic-scroller pb-20">
                <slot name="body"></slot>
            </div>
            
            <div class="modal__footer px-5 py-2 text-right absolute bottom-0 w-full bg-white">
                <slot name="footer"></slot>
            </div>
        </div>
    </vue-final-modal>
</div>
</template>

<script setup>
import { defineProps, ref, watch } from "vue"

const props = defineProps({
    isOpen: Boolean,
    taskData: Object,
    title: String,
    clickToClose: Boolean
})

const emit = defineEmit({
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

<style lang="scss">
.modal__body {
    overflow: auto;
    max-height: 500px;
}
</style>
