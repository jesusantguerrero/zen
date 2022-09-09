<template>
  <div
    class="text-center"
  >
    <slot :creteTrack="createTrack" :updateTrack="updateData" :validatePlay="validatePlay" />
  </div>
</template>

<script setup>
import { reactive} from "vue";
import { firebaseState } from "./../../utils/useFirebase";
import { ElNotification } from "element-plus";

// state
const track = reactive({
  uid: null,
  task_uid: null,
  started_at: null,
  ended_at: null,
  type: "promodoro",
  subtype: null,
  duration: null,
  target_time: null,
  completed: false
});

const isTrackableMode = () => {
  return props.trackableModes.includes(state.mode);
}

setSettings(firebaseState.settings);

const createTrack = (trackFormData) => {
  saveTrack(trackFormData)
    .then(uid => {
      track.uid = uid;
      emit("update:currentTimer", track)
    })
}


const validatePlay = () => {
  if (isTrackableMode() || !validatePlay()) {
    ElNotification({
      title: "Select a task",
        message: "Must select a task to start promodoro",
        type: "info"
    })
    return false  
  }
  return true
};


const updateData = () => {
   updateTrack(formData).then(() => {
    props.task.tracks.push(formData);
    ElNotification({
      title: "Pomodoro Saved",
      message: "Pomodoro saved",
      type: "success"
    })
  })
};
</script>