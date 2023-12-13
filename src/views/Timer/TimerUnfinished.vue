<script setup lang="ts">
import { reactive, nextTick, computed } from 'vue'
import { ITrack, useTrackFirestore } from '@/plugins/firebase/useTrackFirestore'
import SearchBar from "@/components/molecules/SearchBar.vue"
// @ts-expect-error: no types
import { AtButton } from "atmosphere-ui";
import { endOfWeek, format, formatRelative, isToday, parse, startOfDay, startOfWeek } from 'date-fns'
import { enUS } from 'date-fns/locale'
import TimeTrackerGroup from '@/components/organisms/TimeTrackerGroup.vue'
import { ElMessageBox, ElNotification } from 'element-plus'
import 'vue-cal/dist/vuecal.css'
import { functions } from '@/plugins/useFirebase'
import TabHeader from '@/components/atoms/TabHeader.vue';
// state and ui
const state: any = reactive({
  tracked: [],
  firebaseRefs: {},
  searchText: "",
  tempoEvents: [],
  tags: [],
  date:startOfDay(new Date()),
  selectedTags: [],
  committedTitle: computed(() => { 
    const relativeLocale = {
        lastWeek: "'Last' eeee",
        yesterday: "'Yesterday'",
        today: "'Today'",
        tomorrow: "'Tomorrow'",
        nextWeek: "'Next' eeee",
        other: 'dd.MM.yyyy',
    }
    const locale = {
      ...enUS,
      formatRelative: (token) => relativeLocale[token]
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
      label: "Unfinished Tracks",
      name: "timer",
      focusClass: "text-gray-600",
    },
  ],
})

// tracked tasks
const  { getUnfinished, syncTempoTracks, deleteBatch } = useTrackFirestore()
const fetchUnfinished = async () => {
  const data = await getUnfinished();
  state.tracked = data;

}
fetchUnfinished()

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



const groupedTracks = computed(() => {
    const trackGroup = {};

    state.tracked.forEach(track => {
        const date = format(track.started_at, "yyyy-MM-dd");
        if (!trackGroup[date]) {
            trackGroup[date] = {
                [track.description]: {
                    id: `group-${track.id}`,
                    description: track.description,
                    tracks: [track]
                }
            };
        } else {
            if (!trackGroup[date][track.description]) {
                trackGroup[date][track.description] = {
                        id: `group-${track.id}`,
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

const toggleGroup = (timeEntry, isSelected) => {
    timeEntry.tracks.forEach(
        track => {
          const trackIndex = state.tracked.findIndex(storedTracked => storedTracked.uid == track.uid)
          state.tracked[trackIndex].selected = isSelected;
        }
    );
}

const updateLocalTrack = (track) => {
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
 const selectedTitles =  Array.from(new Set(selectedItems.value.map(track => track.description)));

 navigator.clipboard.writeText(selectedTitles.join("\n")).then(() => {
  ElNotification({
    title: 'Titles copied',
    message: `${selectedTitles.length} unique tasks were copied`
  });
 })
}

const mergeTracks = () => {
  const timeToSum = selectedItems.value.slice(1).reduce((totalMs, track) => totalMs + track.duration_ms, 0)
  const firstTrack = selectedItems.value.at(0);

  console.log(timeToSum, firstTrack, selectedItems.value, "Hola");

  const mergedTracks = { ...firstTrack}
  mergedTracks.duration_ms += timeToSum;
  // console.log(merge) 
  // syncTempoUpdate
}

const syncAsGroup = (group) => {
  if (group.isLoading) return
  const groupedTracks = group.tracks;
  const timeToSum = groupedTracks.slice(1).reduce((totalMs, track) => totalMs + track.duration_ms, 0)
  const firstTrack = groupedTracks.at(0);

  group.isLoading = true;

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
    console.log(tempoTrack)
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
    group.isLoading = false;
  })
}



const onDeleteItem = async (tracks: ITrack[]) => {
  const canDelete = await ElMessageBox.confirm(
        "Are you sure you want to delete this task?",
        "Delete Task"
      );
  if (canDelete) {
    deleteBatch(tracks).then(() => {
      ElNotification({
        type: "success",
        message: "Task deleted",
        title: "Task deleted",
      });

      nextTick(() => {
        fetchUnfinished();
      })
    });
  }
}
</script>

<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-28">
  <div class="items-center justify-between mb-10 section-header md:flex">
      <TabHeader v-model="state.tabSelected" :tabs="state.tabs" class="h-full overflow-hidden rounded-md"/>
      <section class="flex space-x-2">
        <SearchBar
          v-model="state.searchText"
          hide-date
          hide-tags
          v-model:tags="state.tags"
          v-model:selectedTags="state.selectedTags"
        />
        <AtButton class="text-white bg-green-500" rounded @click="syncTempoLogs()"
        v-if="state.tabSelected=='week'">
          Sync Tempo
        </AtButton>
      </section>
  </div> 

  <div class="">     
      <div v-for="(tracksByDate, trackDate) in groupedTracks" :key="trackDate" class="mb-12">
        <header class="flex items-center justify-between bg-white">
          <div class="flex items-center w-full py-4 pl-16 space-x-2 font-bold bg-white">
            <span>
              {{ formattedDate(trackDate) }}
            </span>  
            <section v-if="selectedItems.length" class="flex items-center text-gray-400">
              <span> 
                {{selectedItems.length }} of {{ state.tracked.length }}
              </span>
              <button title="Copy tasks" @click="copyTasksTitles">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M18 2H9c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H9V4h9v12zM3 15v-2h2v2H3zm0-5.5h2v2H3v-2zM10 20h2v2h-2v-2zm-7-1.5v-2h2v2H3zM5 22c-1.1 0-2-.9-2-2h2v2zm3.5 0h-2v-2h2v2zm5 0v-2h2c0 1.1-.9 2-2 2zM5 6v2H3c0-1.1.9-2 2-2z"/></svg>
              </button>
            </section>
          </div>
        </header>

        <template  v-if="state.tabSelected=='timer'">
          <TimeTrackerGroup
              v-for="track in tracksByDate"
              :time-entry="track"
              :key="track.uid"
              @toggle-select="toggleGroup(track, $event)"
              @updated="updateLocalTrack"
              @deleteItem="onDeleteItem([$event])"
          >
            <template #actions-append>
              <button title="sync as group" :disabled="track.isLoading" @click="syncAsGroup(track)">
                <i class="fa fa-chain-broken" />
              </button>
              <button v-if="track?.tracks" @click="onDeleteItem(track.tracks)" class="opacity-0 ml-2 play-button group-hover:opacity-100">
                <i class="fa fa-trash" />
              </button>
            </template>
          </TimeTrackerGroup>
        </template>
      </div>
      <div class="w-full mx-auto mt-10 text-center md:w-6/12" v-if="!state.tracked.length && state.tabSelected=='timer'">
        <img src="@/assets/undraw_following.svg" class="w-full mx-auto md:w-5/12"> 
        <p class="mt-10 font-bold text-gray-500 md:mt-5 dark:text-gray-300"> There's no tracks</p>
      </div>
  </div>
</div>
</template>
