<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-28">
  <div class="items-center justify-between mb-10 section-header md:flex">
      <TabHeader v-model="state.tabSelected" :tabs="state.tabs" class="h-full overflow-hidden rounded-md"/>
      <section class="flex space-x-2">
        <SearchBar
          v-model="state.searchText"
          v-model:date="state.date"
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
          <section class="flex justify-end w-full h-full space-x-4 bg-white" v-if="state.tabSelected=='timer'">
            <AtButton type="success" @click="mergeTracks" rounded :disabled="!selectedItems.length">Merge</AtButton>
            <AtButton type="success" rounded @click="extendTracks">Extend</AtButton>
          </section>
        </header>

        <template  v-if="state.tabSelected=='timer'">
          <TimeTrackerGroup
              v-for="track in tracksByDate"
              :time-entry="track"
              :key="track.id"
              @toggle-select="toggleGroup(track, $event)"
              @updated="updateLocalTrack"
          >
            <template #actions-append>
              <button title="sync as group" :disabled="track.isLoading" @click="syncAsGroup(track)">
                <i class="fa fa-th-list" />
              </button>
            </template>
          </TimeTrackerGroup>
        </template>
      </div>
      <VueCal 
        v-if="state.tabSelected=='week'"
        style="height: 500px"
        :events="events"
        :disable-views="['years', 'year', 'month']"
        hide-weekends
        :time-cell-height="110"
      >
        <template v-slot:weekday-heading="{ heading : { label, date } }">
          <article>
            <h4 class="text-xs">
              {{  label }}
            </h4>
            <section>
              {{ getTotalTimeByDate(date) }}
            </section>
          </article>

        </template>
        <template #event="{ event }"> 
          <TimerCalendarCard 
            :event="event"
            :allow-sync="!hasTempo(event)"
            @sync-tempo=" onEventClick(event)"
          />
        </template>
      </VueCal>
      <div class="w-full mx-auto mt-10 text-center md:w-6/12" v-if="!events.length && state.tabSelected=='timer'">
        <img src="../assets/undraw_following.svg" class="w-full mx-auto md:w-5/12"> 
        <p class="mt-10 font-bold text-gray-500 md:mt-5 dark:text-gray-300"> There's no tracks</p>
      </div>
  </div>
</div>
</template>

<script setup>
import { reactive, watch, onUnmounted, computed } from 'vue'
import { useTrackFirestore } from '../utils/useTrackFirestore'
import SearchBar from "../components/molecules/SearchBar.vue"
import { AtButton } from "atmosphere-ui";
import { endOfWeek, format, formatRelative, isSameDay, isSameHour, isToday, parse, startOfDay, startOfWeek } from 'date-fns'
import { enUS } from 'date-fns/locale'
import TimeTrackerGroup from '../components/organisms/TimeTrackerGroup.vue'
import { ElNotification } from 'element-plus'
import VueCal from "vue-cal";
import 'vue-cal/dist/vuecal.css'
import { functions } from '@/utils/useFirebase'
import { formatDurationFromMs } from '@/utils/useDateTime';
import { isSameDateTime} from '@/utils';
import TimerCalendarCard from './TimerCalendarCard.vue';
import TabHeader from '@/components/atoms/TabHeader.vue';
// state and ui
const state = reactive({
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
      label: "Timer",
      name: "timer",
      focusClass: "text-gray-600",
    },
    {
      label: "Week view",
      name: "week",
      focusClass: "text-gray-600",
    },
    // {
    //   label: "Reports",
    //   name: "reports",
    //   focusClass: "text-gray-600",
    // },
  ],
})

// tracked tasks
const  { getRunningTracks, syncTempoTracks, getTempoTracksByDates } = useTrackFirestore()
const fetchTracked = async (date) => {
  const data = await getRunningTracks();
  state.tracked = data;

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

const onEventClick = (event) => {
  if (!event.class.includes('tempo')) {
    syncTempoUpdate(event)
  }
}

const { updateTrack } = useTrackFirestore();

const syncTempoUpdate = async (event, autoUpdateTrack = true) => {
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

    const zenTrack = state.tracked.find( track => track.uid == event.uid)
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

const hasTempo = (event) => {
  return event.class.includes('tempo') || event.relations && event.relations['tempo']
}

const fetchTempo = async (date) => {
  const from = startOfWeek(date)
  const to = endOfWeek(date)

  const tempoRef = await getTempoTracksByDates(from, to);
  state.firebaseRefs['tempoRef'] = tempoRef.onSnapshot(snap => {
    const list = [];
    snap.forEach(doc => {
      const track = doc.data();

      list.push({ ...track, uid: doc.id });
    });
    state.tempoEvents = list;
  });
}

watch(() => state.date , async () => {
 await fetchTracked(state.date)
 await fetchTempo(state.date)
}, { immediate: true })

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

const getTotalTimeByDate = (date) => {
  const milliseconds = state.tracked.reduce((total, track) => {
    if (format(date, 'yyyy-MM-dd') == format(track.started_at, "yyyy-MM-dd") && track.ended_at) {
      return total + track.duration_ms
    }
    return total;
  }, 0) ?? 0

  return formatDurationFromMs(milliseconds).toFormat('hh:mm:ss')
}

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

const formattedDate = (date) => {
    const dateT = parse(date, 'yyyy-MM-dd', new Date());
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

onUnmounted(() => {
  Object.values(state.firebaseRefs).forEach((firebaseRef) => {
    if (firebaseRef) firebaseRef()
  })
});
</script>


<style lang="scss">
.tempo-event, .zen-event {
  position: relative;
    height: 102.667px;
    width: 168px;
    min-height: 20px;
    border: 1px solid rgb(188, 216, 224);
    border-radius: 4px;
    box-shadow: rgba(0, 0, 0, 0.08) 0px 1px 3px 0px;
    font-size: 14px;
    flex-direction: column;
    display: flex;
    transition: min-height 0.3s ease 0s, box-shadow 0.3s ease-in-out 0s;
    text-decoration: none;
    background: rgb(238, 243, 248);
    line-height: 1.42857;
    touch-action: none;
    -webkit-box-pack: justify;
    justify-content: space-between;
    padding: 8px;
    opacity: 1;
    cursor: grab;
    margin-bottom: 0px;
    color: rgba(0, 28, 61, 0.72);
    user-select: none;
}
</style>