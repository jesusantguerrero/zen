<template>
<div>
    <VueFinalModal 
        v-model="isOpenLocal" 
        name="standup" 
        classes="flex justify-center md:pt-20 w-full"
        content-class="md:w-5/12"
        >
        <div class="w-full bg-white rounded-md shadow-md standup-modal__form">
            <standup-form @closed="emit('closed')">
                <template 
                    name="content" 
                    v-slot:content
                >
                    <slot name="content"> </slot>
                </template>
            </standup-form>
        </div>
    </VueFinalModal>
</div>
</template>

<script setup>
import { ref, watch } from "vue"
import StandupForm from "../../molecules/StandupForm.vue"
import { VueFinalModal } from "vue-final-modal";

const props = defineProps({
    isOpen: Boolean
})

const emit = defineEmits({
    closed: Function
})

const isOpenLocal = ref(false)

watch(()=> props.isOpen, (isOpen) => {
    isOpenLocal.value = isOpen;
}, { immediate: true })

</script>

<style lang="scss" scoped>
.standup-modal__form {
    min-height: 400px;
}
</style>
