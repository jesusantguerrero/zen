<template>
<div>
    <vue-final-modal 
        v-model="isOpenLocal" 
        name="welcome" 
        classes="flex justify-center md:pt-20 w-full"
        content-class="md:w-5/12"
    >
        <div class="w-full bg-white rounded-md modal__content">
            <div class="modal__header flex justify-between px-5 py-4">
                <h3> Edit Task</h3>
                <button @click="isOpenLocal=false">
                    <i class="fa fa-times"></i>
                </button>
            </div>
            <div class="modal__body ic-scroller">
                <task-form :task-data="taskData" @closed="isOpenLocal=false"></task-form>
            </div>
            <div class="modal__footer px-5 py-2 text-right">
                <button class="bg-green-400 text-white focus:outline-none px-5 py-2 rounded-md"> Save </button>
            </div>
        </div>
    </vue-final-modal>
</div>
</template>

<script setup>
import { defineProps, ref, watch } from "vue"
import TaskForm from "../molecules/TaskForm.vue"

const props = defineProps({
    isOpen: Boolean,
    taskData: Object
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
