<template>
    <VueFinalModal 
        v-model="isOpenLocal" 
        name="welcome" 
        classes="flex justify-center md:pt-20 w-full"
        content-class="md:w-5/12"
        >
        <div class="w-full bg-white rounded-md shadow-md welcome-modal__form">
            <welcome-form v-if="section=='welcome'" @closed="section='about'"></welcome-form>
            <about-form v-if="section=='about'" @closed="section='help'"></about-form>
            <help-view v-if="section=='help'" @closed="emit('closed')"></help-view>
        </div>
    </VueFinalModal>
</template>

<script setup>
import { ref, watch } from "vue"
import WelcomeForm from "../../molecules/WelcomeForm.vue"
import AboutForm from "../../molecules/AboutForm.vue"
import HelpView from "../../molecules/HelpView.vue"
import { VueFinalModal } from "vue-final-modal";

const props = defineProps({
    isOpen: Boolean
})

const emit = defineEmits({
    closed: Function
})

const section = ref('welcome')

const isOpenLocal = ref(false)

watch(()=> props.isOpen, (isOpen) => {
    isOpenLocal.value = isOpen;
}, { immediate: true })

</script>

<style lang="scss" scoped>
.welcome-modal__form {
    min-height: 400px;
}
</style>
