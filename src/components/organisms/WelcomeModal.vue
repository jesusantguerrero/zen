<template>
<div>
    <vue-final-modal 
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
    </vue-final-modal>
</div>
</template>

<script setup>
import { defineProps, ref, watch } from "vue"
import WelcomeForm from "../molecules/WelcomeForm.vue"
import AboutForm from "../molecules/AboutForm.vue"
import HelpView from "../molecules/HelpView.vue"

const props = defineProps({
    isOpen: Boolean
})

const emit = defineEmit({
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
