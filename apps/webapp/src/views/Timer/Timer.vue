<script setup lang="ts">
import { reactive, watch, onUnmounted, computed  } from 'vue'
import SearchBar from "@/components/molecules/SearchBar.vue"
import { enUS } from 'date-fns/locale'
import { endOfWeek, format, formatRelative, isToday, parse, startOfDay, startOfMonth, startOfWeek } from 'date-fns'
import { ref } from 'vue';
import { ElMessageBox, ElNotification } from 'element-plus'
import { AtButton } from "atmosphere-ui";

import TimeTrackerGroup from '@/components/organisms/TimeTrackerGroup.vue'
import TabHeader from '@/components/atoms/TabHeader.vue';
import TrackModal from '@/components/organisms/modals/TrackModal.vue';
import TaskModal from '@/components/organisms/modals/TaskModal.vue';
import TimerCalendar from './TimerCalendar.vue';

import { isSameDateTime} from '@/utils';
import { getDurationOfTracks } from '@/composables/useDateTime';
import { functions } from '@/plugins/useFirebase'
import { ITrack, useTrackFirestore } from '@/plugins/firebase/useTrackFirestore'
import { ITask, useTaskFirestore } from '@/plugins/firebase/useTaskFirestore';
// state and ui
const state: any = reactive({
  tracked: [],
  firebaseRefs: {},
  searchText: "",
  tempoEvents: [],
  tags: [],
  date:startOfDay(new Date()),
  endDate:startOfDay(new Date()),
  startDate:startOfDay(new Date()),
  selectedTags: [],
  committedTitle: computed(() => { 
    const relativeLocale: Record<string, string> = {
        lastWeek: "'Last' eeee",
        yesterday: "'Yesterday'",
        today: "'Today'",
        tomorrow: "'Tomorrow'",
        nextWeek: "'Next' eeee",
        other: 'dd.MM.yyyy',
    }   
    const locale = {
      ...enUS,
      formatRelative: (token: string) => relativeLocale[token]
    }
    
    const dateName = formatRelative(state.date, new Date(), { locale });
    return `${dateName} I finished:`
  }),
  humanDate: computed(() => {
    return format(state.date, 'dd LLL, yyyy')
  }),
  tabSelected: 'timer',
  tabs: [
    {
      label: "Timer",
      name: "timer",
      focusClass: "text-gray-600",
    },
    {
      label: "Week view",
      name: "week",
      focusClass: "text-gray-600",
    },
    {
      label: "Month view",
      name: "month",
      focusClass: "text-gray-600",
    },
  ],
})

const pagerMode = computed(() => {
  const modes: Record<string, string> = {
    'week': 'week',
    'month': 'month',
    'timer': 'day' 
  }

  return modes[state.tabSelected]
})

// tracked tasks
const  { 
  getTracksByDates, 
  syncTempoTracks, 
  deleteTrack, 
  getTempoTracksByDates, 
  deleteBatch,
  updateBatch 
} = useTrackFirestore()
const fetchTracked = (date: Date, endDate?: Date) => {
  return getTracksByDates(date, endDate).then(trackedRef => {
    state.firebaseRefs['tracked'] = trackedRef.onSnapshot( snap => {
      const list: ITrack[] = []
      snap.forEach(doc => {
        const track = doc.data()
          list.push({ ...track, uid: doc.id } as ITrack)
      })
      state.tracked = list;
    })
  })
}

const userApplication = functions.httpsCallable('userApplication');
const syncTempoLogs = () => {
  const from = startOfWeek(state.date)
  const to = endOfWeek(state.date)

  userApplication({
      appKey: 'tempo',
      params: {
        from: format(from, 'yyyy-MM-dd'),
        to: format(to, 'yyyy-MM-dd')
      },
      path: '/worklogs'
  }).then(({ data }) => {
    syncTempoTracks(data.results).then(() => {
      ElNotification({
        type: 'success',
        message: 'Tempo tracks synced correctly'
      })
    })
  }).catch((err) => {
    console.log(err)
  })
}


const { updateTrack } = useTrackFirestore();

const syncTempoUpdate = async (event: any, autoUpdateTrack = true) => {
  const alreadyWithTempo = events.value
  .filter(item => item.class === 'tempo-event').find( tempoEvent => {
    return isSameDateTime(event.start, tempoEvent.start);
  });

  if (alreadyWithTempo) {
    ElNotification({
      message: 'This date-time is already registered in tempo',
      type: 'error'
    })
    return;
  }
  const {data: issue } = await userApplication({
    appKey: 'jira',
    path: `issue/${event.title.slice(0, event.title.indexOf(" ")).trim()}` 
  });

  event.isLoading = true;

  const tempoData = {
    attributes: [{
        "key": "_Account_",
        "value": "DEV"
    }],
    authorAccountId: state.tempoEvents[0].author.accountId,
    timeSpentSeconds: event.duration_ms / 1000,
    billableSeconds: event.duration_ms / 1000,
    description: event.description,
    issueId: issue.id,
    startDate: format(event.start, 'yyyy-MM-dd'),
    startTime: format(event.start, 'HH:mm:ss')
  }
  
  return userApplication({
      method: 'post',
      appKey: 'tempo',
      path: '/worklogs',
      data: tempoData,
  }).then(({ data }) => {
    ElNotification({
      type: 'success',
      message: 'Zen track created in tempo  correctly'
    })

    syncTempoTracks([data]).then(() => {
      ElNotification({
        type: 'success',
        message: 'Tempo tracks synced correctly'
      })
    })

    const zenTrack = state.tracked.find( (track: ITrack) => track.uid == event.uid)
    event.isLoading = false;

    if (autoUpdateTrack) {
      return updateTrack({
        ...zenTrack,
        relations: {
          tempo: data
        }
      })
    }
    return data;
  }).catch((err) => {
    console.log(err)
  })
}

const fetchTempo = async (date: Date) => {
  const from = startOfWeek(date)
  const to = endOfWeek(date)

  const tempoRef = await getTempoTracksByDates(from, to);
  state.firebaseRefs['tempoRef'] = tempoRef.onSnapshot(snap => {
    const list: ITrack[] = [];
    snap.forEach(doc => {
      const track = doc.data();

      list.push({ ...track, uid: doc.id } as ITrack);
    });
    state.tempoEvents = list;
  });
}

const fetchData = async(dates?: Date[]) => {
  if (pagerMode.value == 'day') {
    await fetchTracked(state.date)
    await fetchTempo(state.date)
  } else {
    const startDate = pagerMode.value == "month" ? startOfMonth(state.endDate) : state.startDate;
    await fetchTracked(startDate, state.endDate)
    await fetchTempo(startDate, state.endDate)
  }
}

watch(() => state.date , async () => {
  fetchData()
}, { immediate: true })

watch(() => state.endDate , async () => {
  fetchData()
}, { immediate: true })


interface ITrackGroup {
  id: string;
  description: string;
  isLoading?: boolean;
  tracks: ITrack[]
}

type IGroupByDate = Record<string, ITrackGroup>;
const groupedTracks = computed(() => {
    const trackGroup: Record<string,IGroupByDate> = {};

    state.tracked.forEach((track: ITrack) => {
        const date = format(track.started_at, "yyyy-MM-dd");
        if (!track.ended_at) return
        if (!trackGroup[date]) {
            trackGroup[date] = {
                [track.description]: {
                    id: `group-${track.uid}`,
                    description: track.description,
                    isLoading: false,
                    tracks: [track]
                }
            };
        } else {
            if (!trackGroup[date][track.description]) {
                trackGroup[date][track.description] = {
                        id: `group-${track.uid}`,
                        description: track.description,
                        tracks: [track]
                };
            } else {
                trackGroup[date][track.description].tracks.push(track);
            }
        }
    });
    return trackGroup;
});

const events = computed(() => {
  const appEvents = state.tracked.filter(item => item.ended_at).map(event => ({
        ...event,
        uid: event.uid,
        start: event.started_at,
        end: event.ended_at,
        title: event.description,
        class: 'zen-event'
  }))

  return [...appEvents, ...state.tempoEvents.map((event) => ({
      start: event.started_at,
      end: event.ended_at,
      title: event.description,
      class: 'tempo-event'
  }))]
})

const toggleGroup = (group: ITrackGroup, isSelected: boolean) => {
    group.tracks.forEach(
        track => {
          const trackIndex = state.tracked.findIndex((tracked: ITrack) => tracked.uid == track.uid)
          state.tracked[trackIndex].selected = isSelected;
        }
    );
}

const updateLocalTrack = (track: ITrack) => {
  updateTrack(track).then(() => {
    ElNotification({
      type: 'success',
      message: 'track updated'
    });
  })
}

const formattedDate = (dateString: string) => {
    const dateT = parse(dateString, 'yyyy-MM-dd', new Date());
    return isToday(dateT) ? 'Today' : format(dateT, 'E, dd LLL yyyy')
}

const selectedItems = computed(() => {
    return state.tracked.reduce((selectedItems, item) => {
        if (item.selected) {
          selectedItems.push(item)
        }
        return selectedItems
    }, [])
});

// 
const copyTasksTitles = () => {
 const selectedTitles =  Array.from(new Set(selectedItems.value.map((track: ITrack) => track.description)));

 navigator.clipboard.writeText(selectedTitles.join("\n")).then(() => {
  ElNotification({
    title: 'Titles copied',
    message: `${selectedTitles.length} unique tasks were copied`
  });
 })
}

const mergeTracks = () => {
  const timeToSum = selectedItems.value.slice(1).reduce((totalMs: number, track: ITrack) => totalMs + track.duration_ms, 0)
  const firstTrack = selectedItems.value.at(0);

  const mergedTracks = { ...firstTrack}
  mergedTracks.duration_ms += timeToSum;
  // console.log(merge) 
  // syncTempoUpdate
}

const isSyncingGroup = ref(false);
const syncAsGroup = (tracks: ITrack[], group?:|ITrackGroup) => {
  if (group?.isLoading) return
  const timeToSum = tracks.slice(1).reduce((totalMs, track) => totalMs + track.duration_ms, 0)
  const firstTrack = tracks.at(0);

  if (group) {
    group.isLoading = true;
  }
  isSyncingGroup.value = true;

  if (!firstTrack) return;

  const mergedTracks = { 
    ...firstTrack,
    uid: firstTrack.uid,
    start: firstTrack.started_at,
    end: firstTrack.ended_at,
    title: firstTrack.description,
  }

  mergedTracks.duration_ms += timeToSum;

  syncTempoUpdate(mergedTracks, false)
    .then((tempoTrack) => {
    groupedTracks.forEach((track) => {
      updateTrack({
        ...track,
        relations: {
          tempo: tempoTrack
        }
      })
    })

    ElNotification({
      title: 'Group is synced as one',
      message: `${groupedTracks.length} were synced with tempo as one`
    });
  }).finally(() => {
    if (group) {
      group.isLoading = false;
    }
    isSyncingGroup.value = false;
  })
}

type FirebaseReference = () => void;
onUnmounted(() => {
  Object.values(state.firebaseRefs as FirebaseReference[]).forEach((firebaseRef: FirebaseReference) => {
    if (firebaseRef) firebaseRef()
  })
});

const getDurationInGroups = (groupDate: string) => {
  const tracksOfDate = state.tracked.filter((track: ITrack) => format(track.started_at, 'yyyy-MM-dd') == groupDate);
  console.log({tracksOfDate, groupDate })
  return getDurationOfTracks(tracksOfDate)
}

const onDeleteItem = async (tracks: ITrack|ITrack[]) => {
  const canDelete = await ElMessageBox.confirm(
        "Are you sure you want to delete this task?",
        "Delete Task"
      );
  if (canDelete) {
    if (Array.isArray(tracks)) {
      deleteBatch(tracks).then(() => {
        ElNotification({
          type: "success",
          message: "Task deleted",
          title: "Task deleted",
        })
      });
    } else {
      deleteTrack(tracks).then(() => {
        ElNotification({
          type: "success",
          message: "Task deleted",
          title: "Task deleted",
        });
      });
    }
  }
}

const isTrackModalOpen = ref(false)
const trackToEdit = ref<ITrack|null>(null);

const setTrackToEdit = (task: ITrack) => {
  trackToEdit.value = task;
  isTrackModalOpen.value = false;
  isTrackModalOpen.value = true;
};

const onEditedTrack = (track: ITrack) => {
  const index = state.tracked.findIndex(
    (trackItem: ITrack) => trackItem.uid == track.uid
  );
  state.tracked[index] = { ...track };
  trackToEdit.value = null;
  isTrackModalOpen.value = false;
};

const { getTaskById, updateTask  } = useTaskFirestore();

const onGroupDescriptionChanged = (tracks: ITrack[]) => {
    updateBatch(tracks).then(() => {
        ElNotification({
          type: "success",
          message: "Group updated",
          title: "Task group updated correctly",
        });
      });

      updateTask({
        uid: tracks.at(0)?.task_uid,
        title: tracks.at(0)?.description
      });
};


const isTaskModalOpen = ref(false)
const taskToEdit = ref<ITask|null>(null);

const onDetail = async (track: ITrack) => {
  taskToEdit.value = await getTaskById(track.task_uid);
  isTaskModalOpen.value = false;
  isTaskModalOpen.value = true;
};


// group options
const areGroupOptionsActive = computed(() => {
  const selectedDescription = selectedItems.value.at(0)?.description;
  return !!selectedItems.value.length && selectedItems.value.every((track: ITrack) => track.description == selectedDescription)
})

const canMergeTracks = computed(() => {
  return areGroupOptionsActive.value && selectedItems.value.length > 1;
})

const canUploadAsGroup = computed(() => {
  return areGroupOptionsActive.value && selectedItems.value.every((track: ITrack) => !track.relations?.tempo);
})

const isView = (viewName: string) => {
  return state.tabSelected== viewName
}
</script>

<template>
<main class="pt-24 mx-5 md:pt-28 md:mx-28">
  <header class="items-center justify-between mb-10 section-header md:flex">
      <TabHeader v-model="state.tabSelected" :tabs="state.tabs" class="h-full overflow-hidden rounded-md w-full "/>
      <section class="flex space-x-2 w-full justify-end">
        <SearchBar
          v-model="state.searchText"
          v-model:date="state.date"
          v-model:startDate="state.startDate"
          v-model:endDate="state.endDate"
          v-model:tags="state.tags"
          v-model:selectedTags="state.selectedTags"
          :pager-mode="pagerMode"
          date-type=""
        />
        <AtButton 
          class="text-white bg-green-500" 
          rounded 
          @click="syncTempoLogs()"
          v-if="state.tabSelected=='week'"
        >
          Sync Tempo
        </AtButton>
      </section>
  </header> 

  <section class="w-full mx-auto mt-10 text-center md:w-6/12" v-if="!state.tracked.length && (isView('timer') || isView('week'))">
    <img src="@/assets/undraw_following.svg" class="w-full mx-auto md:w-5/12"> 
    <p class="mt-10 font-bold text-gray-500 md:mt-5 dark:text-gray-300"> There's no tracks</p>
  </section>

  <section v-else-if="isView('timer') || isView('week')">     
      <div v-for="(tracksInDate, trackDate) in groupedTracks" :key="trackDate" class="mb-12">
        <header class="flex items-center justify-between bg-white dark:bg-gray-700 px-8 text-gray-400 dark:text-gray-300">
          <div class="flex items-center w-full py-4 space-x-2 font-bold">
            <span>
              {{ formattedDate(trackDate) }}
            </span>  
            <section v-if="selectedItems.length" class="flex items-center ">
              <span> 
                {{selectedItems.length }} of {{ state.tracked.length }} items selected
              </span>
              <button title="Copy tasks" @click="copyTasksTitles">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M18 2H9c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H9V4h9v12zM3 15v-2h2v2H3zm0-5.5h2v2H3v-2zM10 20h2v2h-2v-2zm-7-1.5v-2h2v2H3zM5 22c-1.1 0-2-.9-2-2h2v2zm3.5 0h-2v-2h2v2zm5 0v-2h2c0 1.1-.9 2-2 2zM5 6v2H3c0-1.1.9-2 2-2z"/></svg>
              </button>
            </section>
          </div>
          <section class="flex items-center justify-end w-full h-full space-x-4" >
            <span>
              {{ getDurationInGroups(trackDate) }}
            </span>
            <AtButton class="flex " type="success" v-if="false" @click="mergeTracks" rounded :disabled="!canMergeTracks">
              <IMdiVectorCombine class="mr-2"/>
              <span>
                Merge
              </span>
            </AtButton>
            <AtButton 
              title="sync as group" type="success" class="flex" @click="syncAsGroup(selectedItems)" 
              rounded :disabled="!canUploadAsGroup || isSyncingGroup">
                <IMdiUpload class="mr-2" v-if="!isSyncingGroup"/>
                <IMdiSync class="mr-2 animate-spin" v-else />
                <span>
                  Upload tempo
                </span>
            </AtButton>
            <AtButton type="success" rounded class="flex" :disabled="!areGroupOptionsActive" v-if="false">
              <IMdiArrowExpandHorizontal class="mr-2" />
              Extend
            </AtButton>
          </section>
        </header>

        <template  v-if="tracksInDate">
          <TimeTrackerGroup
              v-for="track in tracksInDate"
              :time-entry="track"
              :key="track.id"
              @toggle-select="toggleGroup(track, $event)"
              @editTrack="setTrackToEdit"
              @updated="updateLocalTrack"
              @deleteItem="onDeleteItem"
              @groupDescriptionChanged="onGroupDescriptionChanged"
              @detail="onDetail"
          >
            <template #actions-append>
              <section class="flex">
                <button title="sync as group" :disabled="track.isLoading" @click="syncAsGroup(track.tracks, track)">
                  <IMdiSync />
                </button>
                <button v-if="track?.tracks" @click="onDeleteItem(track.tracks)" class="ml-2 opacity-0 play-button group-hover:opacity-100 hover:text-red-400">
                  <i class="fa fa-trash" />
                </button>
              </section>
            </template>
            <template #item-actions-append>
              <section class="flex opacity-0 play-button group-hover:opacity-100">
                <button title="sync as group" :disabled="track.isLoading" @click="syncTempoUpdate(track)">
                  <IMdiSync />
                </button>
              </section>
            </template>
          </TimeTrackerGroup>
        </template>
      </div>
  </section>

  <TimerCalendar
    v-else-if="['month'].includes(state.tabSelected)"
    :date="state.startDate"
    :tracks="state.tracked" 
    :events="events"
    :active-view="state.tabSelected"
    :tempoEvents="state.tempoEvents"  
  />

  <TrackModal
    v-model:is-open="isTrackModalOpen"
    :data="trackToEdit"
    @closed="trackToEdit = null"
    @saved="onEditedTrack"
  />
  <TaskModal
    v-model:is-open="isTaskModalOpen"
    :task-data="taskToEdit"
    :editable="false"
    @closed="taskToEdit = null"
  />
</main>
</template>