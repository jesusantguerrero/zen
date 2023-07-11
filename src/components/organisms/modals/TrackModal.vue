<template>
<div>
  <ModalBase v-model:is-open="state.isOpenLocal" title="Edit track" @closed="clearForm()" @click-outside="clearForm()" :click-to-close="false">
      <template #title>
           <div class="flex justify-between pr-5">
                  <div class="flex items-center w-full text-left">
                      <div class="w-full text-left">
                      <h1
                          class="w-full px-2 text-lg font-bold" 
                      >
                        Edit task
                      </h1>
                      </div>
                  </div>

                  <div class="flex items-center task-item__controls" v-if="!isReminder">
                      <div class="text-xl transition-colors cursor-pointer hover:text-red-400">
                        <i class="my-auto fa fa-times" @click="close()"></i>
                      </div>
                  </div>
              </div>
      </template>

      <template #body>
          <form 
              class="items-center px-4 py-3 bg-white border-2 border-transparent cursor-default task-form dark:bg-gray-700 md:rounded-md"
              @submit.prevent
          >   
              <div class="flex justify-between">
                  <div class="flex items-center w-full">
                      <div class="w-full">
                      <input 
                          type="text" 
                          class="w-full px-2 border-b-2 border-gray-100 focus:outline-none dark:bg-transparent dark:text-gray-300 dark:border-gray-600 dark:focus:border-gray-500"  
                          :placeholder="placeholder" 
                          v-model="track.description"
                      >
                      </div>
                  </div>
              </div>

                
              <div class="flex items-center w-full p-3 pb-20 mt-4 space-x-2 task-item__body">
                <div class="w-full">
                  <label for="">
                    Started At
                  </label>
                  <ElDatePicker
                    placeholder="Due date"
                    class="w-full"
                    type="datetime"
                    size="large"
                    v-model="track.started_at"              
                  />
                </div>
                <div class="w-full">
                  <label for="">
                    Ended At
                  </label>
                  <ElDatePicker
                    placeholder="Due date"
                    class="w-full"
                    type="datetime"
                    size="large"
                    v-model="track.ended_at"              
                  />
                </div>

                <div class="w-full">
                  <label for="">
                    Duration
                  </label>
                <span class="flex items-center h-10 ">
                  {{ formatDurationFromMs(track.duration_ms).toFormat('hh:mm:ss') }}
                </span>
                </div>

              </div>
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

<script setup>
import { ref, watch, computed, reactive, toRefs } from "vue"
import { useTaskFirestore } from "../../../utils/useTaskFirestore"
import { formatDurationFromMs, useDateTime } from "../../../utils/useDateTime"
import { useCustomSelect } from "../../../utils/useCustomSelect"
import TagsSelect from "../../atoms/TagsSelect.vue"
import PersonSelect from "../../atoms/PersonSelect.vue"
import ModalBase from "../../molecules/ModalBase.vue";
import ChecklistContainer from "../ListContainer.vue";
import { ElMessageBox, ElNotification } from "element-plus"
import { firebaseInstance, firebaseState } from "../../../utils/useFirebase"
import DateSelect from "../../atoms/DateSelect.vue"
import { useTrackFirestore } from "@/utils/useTrackFirestore"
import { Interval } from "luxon"

const props = defineProps({
    isOpen: Boolean,
    data: Object,
        mode: {
      Type: String,
      default: 'task'
    },
    placeholder: {
      default: "Add a title"
    },
    type: String,
    allowEdit: Boolean
})

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
  subtype: null,
  duration: null,
  target_time: null,
  completed: false,
  description: "",
  commit_date: null,
})

const { data } = toRefs(props);

const setTrackData = (newData) => {
  if (newData && track) {
    const formData = Object.assign(newData, {});
    
    Object.keys(formData).forEach((key) => {
      const objectData = formData[key]
      track[key] = Array.isArray(objectData) ? [...objectData] : objectData
    });
  }
}

watch(()=> props.isOpen, (isOpen) => {
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

const { updateTrack } = useTrackFirestore();
const save = async () => {
  const formData = { ...track };
  const duration = Interval.fromDateTimes(
    formData.started_at,
    formData.ended_at
  ).toDuration();

  if (props.min && duration.as("minutes") < props.min) {
    emit("update:currentTimer", {});
    ElNotification({
      message: "Track should be at leas 1 minute",
      type: "error",
    });
    return;
  }

  (formData.duration_ms = duration.as("milliseconds")),
    (formData.duration_iso = duration.toISO()),
    updateTrack(formData).then(() => {
      emit("update:currentTimer", {});
      emit("track-updated", track.uid, formData);
      ElNotification({
        title: "Track updated",
        message: "Track updated",
        type: "success",
      });
    });
}

const close = () => {
    emit('closed')
    state.isOpenLocal = false
    clearForm()
}
</script>

<style lang="scss" scoped>
.track-form {
  min-height: 400px;
  width: 100%;
}
</style>

