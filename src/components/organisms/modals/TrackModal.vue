<template>
<div>
  <ModalBase 
    v-model:is-open="state.isOpenLocal" 
    title="Edit track" 
    @closed="clearForm()" 
    @click-outside="clearForm()" 
    :click-to-close="false"
    content-class="md:w-4/12"
  >
      <template #title>
           <div class="flex justify-between pr-5">
                  <div class="flex items-center w-full text-left">
                      <div class="w-full text-left">
                      <h1
                          class="w-full px-2 text-lg font-bold" 
                      >
                        Edit track
                      </h1>
                      </div>
                  </div>
              </div>
      </template>

      <template #body>
          <form 
              class="items-center px-4 py-3 bg-white border-2 border-transparent cursor-default task-form dark:bg-gray-700 md:rounded-md"
              @submit.prevent
          >   
              <section>
                  <AtField label="Description" primary>
                      <input 
                          type="text" 
                          class="w-full mt-2 inline-block border-b-2 border-gray-100 focus:outline-none dark:bg-transparent dark:text-gray-300 dark:border-gray-600 dark:focus:border-gray-500"  
                          :placeholder="placeholder" 
                          v-model="track.description"
                      >
                    </AtField>
              </section>

                
              <section class="flex items-center text-left w-full pl-0 p-3 mt-4 space-x-2 task-item__body">
                <div class="w-full">
                  <AtField label="Started at">
                    <ElDatePicker
                      placeholder="Due date"
                      class="w-full"
                      type="datetime"
                      size="large"
                      :format="datePickerFormat"
                      v-model="track.started_at"              
                    />
                  </AtField>
                
                </div>
                <div class="w-full">
                  <AtField label="Ended at">
                    <ElDatePicker
                      placeholder="Due date"
                      class="w-full"
                      type="datetime"
                      size="large"
                      :format="datePickerFormat"
                      v-model="track.ended_at"              
                    />
                  </AtField>
                </div>
              </section>

              <section class="w-full text-left mt-4">
                <AtField label="Duration">
                  <span class="flex items-center h-10" :class="{'text-green-500': isTimeChanged}">
                    {{ localDuration }}
                  </span>
                </AtField>
              </section>
          </form>
      </template>

      <template #footer>
        <div class="flex items-center justify-end pt-4 border-t-2 dark:border-gray-500">
          <div class="text-right">
              <button class="px-5 py-2 mr-2 text-white bg-gray-400 rounded-md hover:bg-gray-500 focus:outline-none" 
              @click.prevent="close()"> 
                Cancel
              </button>
              <button class="px-5 py-2 text-white bg-green-400 rounded-md hover:bg-green-500 focus:outline-none" 
              @click.prevent="save()"> 
                Save 
              </button>
          </div>
        </div>
      </template>
  </ModalBase>
</div>
</template>

<script setup lang="ts">
import { ref, watch, computed, reactive, toRefs } from "vue";
import { useTrackFirestore } from "@/utils/useTrackFirestore";
import { ElNotification } from "element-plus";
import { Interval } from "luxon";
import { isSameDay } from "date-fns";
// @ts-ignore: doesn't have definitions
import { AtField } from "atmosphere-ui";

import ModalBase from "../../molecules/ModalBase.vue";


const props = withDefaults(defineProps<{
  isOpen: boolean;
  data: any;
  placeholder: string;
  allowEdit?: boolean;
}>(), {
  placeholder: 'Add a title'
});

const emit = defineEmits({
    "update:isOpen": Boolean,
    "saved": Object,
    "closed": Boolean
})

const state = reactive({
  isOpenLocal: false,
  checklistTitle: ""
})

watch(()=> props.isOpen, (isOpen) => {
    state.isOpenLocal = isOpen;
}, { immediate: true })

watch(()=> state.isOpenLocal, (isOpen) => {
    emit("update:isOpen", isOpen)
    if (isOpen) {
      setHeight()
    }
})

// FormData
const descriptionInput = ref(null);
const setHeight = () => {
  setTimeout(() => {
    const description = descriptionInput.value;
    if (!description) {
      return
    }
    description.style.height = "";
    description.style.height = description.scrollHeight + "px"
  }, 10)
}

const track = reactive({
  uid: null,
  task_uid: null,
  started_at: null,
  ended_at: null,
  type: "promodoro",
  duration_ms: 0,
  duration_iso: "",
  subtype: null,
  duration: null,
  target_time: null,
  completed: false,
  description: "",
  commit_date: null,
})

const { data } = toRefs(props);

const setTrackData = (newData: any) => {
  if (newData && track) {
    const formData = Object.assign(newData, {});
    
    Object.keys(formData).forEach((key) => {
      const objectData = formData[key]
      track[key] = Array.isArray(objectData) ? [...objectData] : objectData
    });
  }
}

watch(()=> props.isOpen, () => {
  if(data.value || state.isOpenLocal) {
    setTrackData(data.value)
  }
}, { immediate: true, deep: true })

const clearForm = () => {
  track.uid = false;
  track.description = "";
  track.ended_at = "";
  track.started_at = "";
  track.duration = null;
}

const isSameDate = computed(() => {
  return track.started_at && track.ended_at ? isSameDay(track.started_at, track.ended_at) : false
});

const datePickerFormat = computed(() => {
  return isSameDate.value ? 'HH:mm:ss' : 'HH:mm:ss DD/MM'
});

const localDurationBare = computed(() => {
  if (!track.started_at || !track.ended_at) return;
  return Interval.fromDateTimes(track.started_at, track.ended_at).toDuration()
})

const localDuration = computed(() => {
  return localDurationBare.value?.toFormat('hh:mm:ss')
})

const isTimeChanged = computed(() => {
  return localDurationBare.value?.as?.('milliseconds') !== track.duration_ms;
});

const close = () => {
  emit('closed')
  state.isOpenLocal = false
  clearForm()
}

const { updateTrack } = useTrackFirestore();
const save = async () => {
  const formData = { ...track };
  if ( !formData.started_at || !formData.ended_at) return;

  const duration = Interval.fromDateTimes(
    formData.started_at,
    formData.ended_at
  ).toDuration();

  formData.duration_ms = duration.as("milliseconds")
  formData.duration_iso = duration.toISO() ?? ""

  updateTrack(formData).then(() => {
    emit("saved", {
      ...formData,
      uuid: track.uid 
    });
    ElNotification({
      title: "Track updated",
      message: "Track updated",
      type: "success",
    });
  });
}
</script>

<style lang="scss" scoped>
.track-form {
  min-height: 400px;
  width: 100%;
}
</style>

