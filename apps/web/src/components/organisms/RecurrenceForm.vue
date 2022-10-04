<template>
    <div class="py-2 text-left">
        <h4 class="font-bold"> Recurrence Options</h4>
        <div class="mt-2">
            <span class="block w-full font-bold">Repeat every</span> 
            <div class="flex mt-2 space-x-2">
                <div class="w-40">
                    <el-input type="number" v-model="state.formData.interval" /> 
                </div>
                <el-select class="w-full" v-model="state.formData.frequency">
                    <el-option :value="freq" v-for="freq in state.frequency"> {{ freq }}</el-option>
                </el-select> 
            </div>
        </div>
        <div class="mt-2" v-if="state.formData.frequency == 'WEEKLY'">
            <span class="mt-5 font-bold">Repeat on:</span>
            <div class="flex mt-1 space-x-2">
                <div v-for="day in state.days" class="px-2 py-1 text-xs border rounded-lg cursor-pointer"
                    :class="{'text-white bg-gray-700': state.formData.weekDays.includes(day)}"
                    @click="addDay(day)"
                >
                    {{ day.slice(0,1) }}
                </div>
            </div>
        </div>
        <div class="mt-4">
            <div class="mb-2 font-bold">
                Ends:
            </div>
            <el-date-picker
                v-model="state.formData.date"
            >
            </el-date-picker>
        </div>
        <div class="w-full mt-5 space-x-3 text-right">
            <Button class="text-white bg-gray-400" @click="$emit('cancel')"> Cancel </Button>
            <Button class="text-white bg-green-400" @click="$emit('done', state.formData)"> Done </Button>
        </div>
    </div>
</template>

<script setup lang="ts" >
import { reactive, watch } from "vue";
import Button from "../atoms/Button.vue";

const props = defineProps({
    dueDate: {
        type: Date,
    },
    schedule: {
        type: Object,
        default: () => {
            return {
                frequency: '',
                interval: '',
                date: '',
                weekDays: [],
            };
        }
    }
})

const state = reactive({
    formData: {
        date: new Date(),
        interval: 1,
        frequency: 'DAILY',
        weekDays: []
        
    },
    frequency: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
    days: ['SU', 'MO','TU', 'WE', 'TH', 'FR' ,'SA'],
    endsOptions: ['date', 'occurrences']
});

watch(() => props.schedule, () => {
    state.formData = {
        ...state.formData,
        date: props.dueDate || new Date(), 
        ...props.schedule,
    };
}, {
    deep: true,
    immediate: true
});

const addDay = (day: string) => {
    const index = state.formData.weekDays.findIndex(weekDay =>weekDay == day);
    if (index == -1) {
        state.formData.weekDays.push(day);
    } else {
        state.formData.weekDays.splice(index, 1);
    }
}

</script>