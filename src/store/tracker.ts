import {  ref,  watch, nextTick, toValue  } from "vue"
import { defineStore } from 'pinia'
import { formatDurationFromMs } from '@/utils/useDateTime';
import { ITask, useTaskFirestore } from '@/utils/useTaskFirestore';
import { ITrack, useTrackFirestore } from '@/utils/useTrackFirestore';
import { timeReducer } from '@/utils/useTracker';
import { firebaseState } from "@/utils/useFirebase"

const { getRunningTrack, getAllTracksOfTask } = useTrackFirestore();
const { updateTask } = useTaskFirestore();
export const useTrackerStore = defineStore('tracker', () => {

const currentTimer = ref<Partial<ITrack>>({})
const timerSubtype = ref<string|null>(null)
const currentTask = ref<Partial<ITask>>({});
const currentTaskTracks = ref<ITrack[]>([]);
const isRunning = ref(false);

const toggleTracker = (autoplay: boolean) => {
  isRunning.value = autoplay;
}

const setCurrentTask = (task: Partial<ITask>, autoplay: boolean = false) => {
  if (currentTask.value?.uid !== task?.uid) {
    currentTask.value = toValue(task);
    setTracksForCurrentTask()
  }
  if (autoplay) {
    toggleTracker(autoplay) 
  }
};

const updateTaskTracks = (tracks: ITrack[]) => {
  currentTask.value.tracks = tracks.map(track => {
    track.date_f = track.created_at.toDate()
    return track;
  }) || [];
  currentTaskTracks.value = tracks;
}

const onTrackAdded = (taskUid: string, newTrack: any) => {
  if (!currentTask.value || !Object.keys(currentTask.value)) return;
  
  const oldTracks = currentTaskTracks.value ?? [];
  const savedTime = timeReducer([...(oldTracks), newTrack]);
  if (savedTime) {
    const timeFormatted = formatDurationFromMs(savedTime).toFormat("hh:mm:ss");
    nextTick(() => {
      updateTask({
        uid: taskUid,
        duration_ms: timeFormatted,
        duration: savedTime,
        last_tracked_at: newTrack.started_at,
        ...(newTrack.end_at ? {
          last_tracked_ended_at: newTrack.end_at
        } : {}) 
      })
    })
  }
}
watch(() => firebaseState.user, async (user) => {
  if (user) {
    try {
      currentTimer.value = await getRunningTrack() || {}
    } catch(err) {
      console.error(err)
    }
  }
}, { immediate: true, deep: true })

const setTracksForCurrentTask = () => {
  if (!currentTask.value?.uid) return
  getAllTracksOfTask(currentTask.value?.uid).then((tracks) => {
    if (tracks && tracks.length) {
      updateTaskTracks(tracks)
    }
  });
}

  return {
      currentTask,
      currentTimer,
      timerSubtype,
      updateTaskTracks,
      setCurrentTask,
      onTrackAdded,
      toggleTracker
  }
})