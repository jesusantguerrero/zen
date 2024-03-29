<template>
    <OnClickOutside class="date-select" @trigger="closeModal">
        <ElPopover
            v-model:visible="isOpen"
            placement="bottom-end"
            popper-class='tag-select dark:bg-gray-900 dark:text-gray-300'
            trigger="manual"
            :width="310"
            :show-arrow="false"
        >
            <template #reference>
                <slot :focusInput="focusInput">
                    <button
                            @click.stop="focusInput"
                            data-name="button"
                            :tabindex="0"
                            class="flex items-center focus:outline-none" 
                        >
                        <i class="mr-1 text-green-400 fa fa-redo" v-if="isRecurrent"></i>
                        <i class="mr-1 fa fa-calendar" v-else></i>
                        <span class="inline-block w-full text-sm font-bold text-left capitalize" > {{ humanDate || placeholder }} </span>
                    </button>
                </slot>
            </template>
            <div>
                <AtDatePicker
                    v-model:date="date"
                    v-model:has-error="hasError"
                    @update:date="emitDate()"
                    :shortcuts="shortcuts"
                    :accept-time="false"
                    :accept-recurrence="true"
                />
                <ElPopover
                    v-if="acceptRecurrence"
                    v-model:visible="isRecurrenceOpen"
                    trigger="manual"
                    placement="top"
                    :width="280"
                >
                    <template #reference>
                        <div class="mx-2">
                            <AtDateAction @click="isRecurrenceOpen=!isRecurrenceOpen" class="focus:outline-none"> 
                                {{ recurrenceLabel }}
                            </AtDateAction>
                        </div>
                    </template>
                </ElPopover>
                <div class="mx-2">
                    <AtDateAction @click="isOpen=false" class="focus:outline-none"> 
                        Done
                    </AtDateAction>
                </div>
            </div>
        </ElPopover>
    </OnClickOutside>

</template>

<script>
import { computed, defineComponent, onMounted, reactive, ref, toRefs, watch } from "vue";
import { useDateTime } from "../../composables/useDateTime";
import { ElPopper, ElPopover } from "element-plus"
import { AtDatePicker, AtDateAction } from "atmosphere-ui";
// import RecurrenceForm from "../organisms/RecurrenceForm.vue";
import { OnClickOutside } from "@vueuse/components"

export default defineComponent({
    components: {
        ElPopper,
        ElPopover,
        AtDatePicker,
        AtDateAction,
        OnClickOutside
    },
    props: {
        modelValue: {
            type: [Date, String],
        },
        placeholder: {
            type: String,
            default: 'date'
        },
        acceptRecurrence: {
            type: Boolean,
            default: false
        },
        schedule: {
            type: Object,
            default() {
                return {}
            }
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    emits: {
        'update:modelValue': Date
    },
    setup(props, { emit }) {
        const state = reactive({
            isOpen: false,
            hasError: false,
            shortcuts: [{
                text: 'Today',
                value: new Date(),
                }, {
                text: 'Tomorrow',
                value: (() => {
                    const date = new Date()
                    date.setTime(date.getTime() + 3600 * 1000 * 24)
                    return date
                })(),
                }, {
                text: 'Next week',
                value: (() => {
                    const date = new Date()
                    date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
                    return date
                })(),
            }],
        })
        const date = ref(null)
        const { humanDate , getDateFromString } = useDateTime(date);

        watch(() => props.modelValue, (value) => {
            date.value = typeof value == 'string' ? getDateFromString(value) : value
        }, { immediate: true })

        const emitDate = () => {
            emit('update:modelValue', date.value);
        }

        const input = ref(null)
        const focusInput = () => {
            if (!props.disabled) {
                state.isOpen = !state.isOpen;
            }
        }
        onMounted(() => {
            input.tabIndex = -1;
        })

        const closeModal = (e) => {
            const hasPopover = e.path?.find(el => el.classList && el.classList.contains('el-popper'));
            if (!hasPopover) { 
                state.isOpen = false;
                isRecurrenceOpen.value = false;
            }
        }

        // recurrence

        const setRecurrence = (scheduleData) => {
            isRecurrenceOpen.value = false;
            emit('update:schedule', scheduleData)
        }
 
        const isRecurrenceOpen = ref(false);

        const isRecurrent = computed(() => {
            return props.schedule && props.schedule.frequency 
        });

        const recurrenceLabel = computed(() => {
            return isRecurrent.value ? 'Repeat: ' + props.schedule.frequency : 'No repeat' 
        });

        return {
            ...toRefs(state),
            date,
            humanDate,
            input,
            emitDate,
            focusInput,
            closeModal,
            isRecurrenceOpen,
            recurrenceLabel,
            setRecurrence,
            isRecurrent,
        }  
    }
})

</script>