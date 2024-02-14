<template>
<div>
    <VueFinalModal 
        v-model="isOpenLocal" 
        name="welcome" 
        classes="flex justify-center md:pt-20 w-full"
        content-class="md:w-5/12"
        >
        <div class="w-full bg-white dark:text-white dark:bg-base-lvl-1 dark:border-base-lvl-3 border rounded-md shadow-md welcome-modal__form">
            <WelcomeForm v-if="section=='welcome'" @closed="section='about'" />
            <AboutForm v-if="section=='about'" @closed="section='help'" />
            <HelpView v-if="section=='help'" @closed="emit('closed')" />
        </div>
    </VueFinalModal>
</div>
</template>

<script setup>
import { ref, watch } from "vue"

import WelcomeForm from "@components/molecules/WelcomeForm.vue"
import AboutForm from "@components/molecules/AboutForm.vue"
import HelpView from "@components/molecules/HelpView.vue"

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
