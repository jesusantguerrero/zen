<template>
    <modal-base v-model:is-open="isOpenLocal">
        <template #title>
            <h1 class="py-2 px-5 text-xl font-bold text-left">
                Pomodoro Configuration
            </h1>
        </template>

        <template #body>
            <form action="" @submit.prevent="save" class="pt-5  px-5 text-left mx-auto">
                <!-- <h4>  User preferences </h4> -->
                <!-- <div class="form-group">
                    <label for="">
                        <input type="checkbox" name="">
                        Timer indication title
                    </label>
                </div>
                <div class="form-group">
                    <label for="">
                        <input type="checkbox" v-model="showNotification" @click="requestNotification">
                        Show Notification
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="">
                        <input type="checkbox" @click="subscribeUserToPush">
                        Subscribe to push notifications
                    </label>
                </div> -->

                 <h4 class="font-bold">  Workflow Template </h4>
                 <div class="form-group">
                    <div class="workflow-item capitalize text-sm mb-10 inline-block"
                        v-for="(item, index) in formData.template"
                        :key="`template-item-${index}`"
                        @click="removeItem(index)">
                        {{ formData.modes[item] ? item : item }}
                        <i class="fa fa-minus"></i>
                    </div>
                 </div>

                 <h4 class="font-bold">  Workflow Items </h4>
                 <div class="form-group">
                    <div class="workflow-item capitalize text-sm mb-10"
                        v-for="(item, key) in formData.modes"
                        :key="key"
                        @click="addWorkflowItem(key)">
                        {{ item.label || key  }}
                        <i class="fa fa-plus"></i>
                    </div>
                 </div>

                 <h4 class="font-bold">  Select sound </h4>
                 <div class="form-group flex space-x-2">
                    <select name="" class="form-control w-full">
                        <option value="">Alarm Clock</option>
                    </select>
                    <button class="bg-gray-700 text-white px-5 py-1 focus:outline-none rounded-md w-40" @click.prevent="playSound()">
                        Test Audio
                    </button>
                 </div>

                 <h4 class="font-bold">  Set Times </h4>
                 <div class="flex">
                    <div class="form-group">
                        <label for="">
                            Session
                        </label>
                        <input
                            type="number"
                            min="1"
                            class="form-control"
                            v-model="formData.modes.promodoro.min">
                    </div>
                    <div class="form-group">
                        <label for="">
                            Break
                        </label>
                        <input
                            type="number"
                            class="form-control"
                            min="1"
                            v-model="formData.modes.rest.min"
                        >
                    </div>
                    <div class="form-group">
                        <label for="">
                            Long Break
                        </label>
                        <input
                            type="number"
                            class="form-control"
                            min="1"
                            v-model="formData.modes.long.min"
                        >
                    </div>
                 </div>
            </form>
        </template>

        <template #footer>
            <button  class="bg-gray-500 text-white px-5 py-1 focus:outline-none rounded-md mr-2" @click="emit('cancel')">
                Cancel
            </button>
            <button class="bg-green-400 text-white px-5 py-1 focus:outline-none rounded-md" @click="save()">
                Save
            </button>
        </template>
    </modal-base>
</template>

<script setup>
import { defineProps, reactive, ref, watch, defineEmit } from "vue";
import { usePromodoro } from "./../../utils/usePromodoro";
import ModalBase from "../molecules/ModalBase.vue";
import { updateSettings } from "../../utils/useFirebase";
import { usePush } from "../../utils/usePush"
const { subscribeUserToPush } = usePush()

// controls
const { playSound, stopSound, promodoroState, requestNotification, showNotification } = usePromodoro()

const props = defineProps({
    isOpen: {
        type: Boolean
    },
    settings: {
        type: Object,
        required: true
    }
});

const emit = defineEmit({
    saved: Object,
    cancel: null,
    "update:isOpen": Boolean
}) 

const isOpenLocal = ref(false)

watch(()=> props.isOpen, (isOpen) => {
    isOpenLocal.value = isOpen;
}, { immediate: true })

watch(()=> isOpenLocal.value, (isOpen) => {
    emit("update:isOpen", isOpen)
})


const formData = reactive({
    template: [],
    modes: {},
    pushSubscription: null
})

watch(()=> props.settings, (settings) => {
    if (settings) {
        formData.template = settings.template;
        formData.modes = settings.modes;
        formData.pushSubscription = settings.pushSubscription;
    }
}, { immediate: true })

const save = () => {
        const settings = {};
        settings.promodoro_template = formData.template
        Object.keys(formData.modes).forEach((key) => {
            formData.modes[key].min = Number(formData.modes[key].min) || 25;
            formData.modes[key].sec = Number(formData.modes[key].sec) || 0;
        })

        settings.promodoro_modes = formData.modes
        updateSettings(settings).then(() => {
            emit('saved', settings)
        })
}

const addWorkflowItem = (item) => {
    formData.template.push(item)
}

const removeItem = (index) => {
    formData.template.splice(index, 1);
}

</script>

<style lang="scss">
    .form-control {
        @apply bg-gray-100;
        @apply border-gray-400; 
        @apply px-4;
        width: 100%;
        border-width: 2;
        height: 37px;
        border-radius: 4px;
    }

    h4 {
        @apply mb-2;
    }

    .form-group {
        @apply mx-2;
        @apply mb-4;
    }

    .workflow-item {
        @apply border-2;
        @apply border-gray-300;
        display: inline-block;
        margin: 2px;
        padding: 2px 5px;
        border-radius: 4px;
        cursor: pointer;
    }
</style>