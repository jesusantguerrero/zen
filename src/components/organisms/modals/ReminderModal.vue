<template>
<div>
    <vue-final-modal 
        v-model="isOpenLocal" 
        name="welcome" 
        classes="flex justify-center md:pt-20 w-full"
        content-class="md:w-5/12"
        >
        <div class="w-full bg-white rounded-md shadow-md welcome-modal__form">
            <RecurrenceForm 
            
            />
        </div>
    </vue-final-modal>
</div>
</template>

<script setup>
import { ref, watch } from "vue"
import RecurrenceForm from "../RecurrenceForm.vue"


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
