<template>
    <modal-base v-model:is-open="isOpenLocal">
        <template #title>
            <h1 class="px-5 py-2 text-xl font-bold text-left">
                Pomodoro Configuration
            </h1>
        </template>

        <template #body>
            <form action="" @submit.prevent="save" class="px-5 pt-5 mx-auto text-left">
                 <h4 class="font-bold">  Workflow Template </h4>
                 <div class="form-group">
                    <div class="inline-block mb-10 text-sm capitalize workflow-item"
                        v-for="(item, index) in formData.template"
                        :key="`template-item-${index}`"
                        @click="removeItem(index)">
                        {{ formData.modes[item] ? item : item }}
                        <i class="fa fa-minus"></i>
                    </div>
                 </div>

                 <h4 class="font-bold">  Workflow Items </h4>
                 <div class="form-group">
                    <div class="mb-10 text-sm capitalize workflow-item"
                        v-for="(item, key) in formData.modes"
                        :key="key"
                        @click="addWorkflowItem(key)">
                        {{ item.label || key  }}
                        <i class="fa fa-plus"></i>
                    </div>
                 </div>

                 <h4 class="font-bold">  Select sound </h4>
                 <div class="flex space-x-2 form-group">
                    <select name="" class="w-full form-control">
                        <option value="">Alarm Clock</option>
                    </select>
                    <button class="w-40 px-5 py-1 text-white bg-gray-700 rounded-md focus:outline-none" @click.prevent="playSound()">
                        Test Audio
                    </button>
                 </div>

                 <h4 class="font-bold"> Alert volume </h4>
                 <div class="flex w-full pr-10 space-x-2 form-group">
                    <el-slider
                        v-model="promodoroState.volume"
                        class="w-full"
                        :step="10">
                    </el-slider>
                 </div>

                 <h4 class="font-bold">  Set Time (in minutes) </h4>
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
            <button  class="px-5 py-1 mr-2 text-white bg-gray-500 rounded-md focus:outline-none" @click="emit('cancel')">
                Cancel
            </button>
            <button class="px-5 py-1 text-white bg-green-400 rounded-md focus:outline-none" @click="save()">
                Save
            </button>
        </template>
    </modal-base>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
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

const emit = defineEmits({
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
    volume: 0,
    pushSubscription: null
})

watch(()=> props.settings, (settings) => {
    if (settings) {
        formData.template = settings.template;
        formData.modes = settings.modes;
        formData.pushSubscription = settings.pushSubscription;
        formData.volume = settings.volume || 100
        promodoroState.volume = settings.volume || 100
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
        settings.promodoro_alert_volume = promodoroState.volume;
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