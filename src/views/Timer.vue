<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-28">
  <div class="items-center justify-between mb-10 section-header md:flex">
      <h2 class="flex items-center text-2xl font-bold text-left text-gray-400">
         <span> Time Tracks </span>
      </h2>
      <section class="flex space-x-2">
        <SearchBar
          v-model="state.searchText"
          v-model:date="state.date"
          v-model:tags="state.tags"
          v-model:selectedTags="state.selectedTags"
        />
        <AtButton class="bg-green-500 text-white" rounded @click="syncTempoLogs()">
          Sync Tempo
        </AtButton>
      </section>
  </div> 

  <div class="">     
      <div v-for="(tracksByDate, trackDate) in groupedTracks" :key="trackDate" class="mb-12">
          <div class="pl-16 py-4 bg-white w-full font-bold flex items-center space-x-2">
            <span>
              {{ formattedDate(trackDate) }}
            </span>  
              <section v-if="selectedItems.length" class="text-gray-400 flex items-center">
                <span> 
                  {{selectedItems.length }} of {{ state.tracked.length }}
                </span>
                <button title="Copy tasks" @click="copyTasksTitles">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M18 2H9c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H9V4h9v12zM3 15v-2h2v2H3zm0-5.5h2v2H3v-2zM10 20h2v2h-2v-2zm-7-1.5v-2h2v2H3zM5 22c-1.1 0-2-.9-2-2h2v2zm3.5 0h-2v-2h2v2zm5 0v-2h2c0 1.1-.9 2-2 2zM5 6v2H3c0-1.1.9-2 2-2z"/></svg>
                </button>
              </section>
          </div>

          <TimeTrackerGroup
              v-for="track in tracksByDate"
              :time-entry="track"
              :key="track.id"
              @toggle-select="toggleGroup(track, $event)"
          />
          {{ tracked  }}
          <VueCal 
            style="height: 500px"
            :events="events"
            :disable-views="['years', 'year', 'month']"
            hide-weekends
            :on-event-click="onEventClick"
          >
            <template v-slot:weekday-heading="{ heading : { label, date } }">
              {{  label }}
            </template>
          </VueCal>
      </div>
  </div>
</div>
</template>

<script setup>
import { reactive, watch, onUnmounted, computed } from 'vue'
import { useTrackFirestore } from '../utils/useTrackFirestore'
import SearchBar from "../components/molecules/SearchBar.vue"
import { AtButton } from "atmosphere-ui";
import { endOfWeek, format, formatRelative, isToday, parse, startOfDay, startOfWeek } from 'date-fns'
import { enUS } from 'date-fns/locale'
import TimeTrackerGroup from '../components/organisms/TimeTrackerGroup.vue'
import { ElNotification } from 'element-plus'
import VueCal from "vue-cal";
import 'vue-cal/dist/vuecal.css'
import { functions } from '@/utils/useFirebase'
import { useCollection } from "@/utils/useCollection"
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
})

// tracked tasks
const  { getTracksByDates, syncTempoTracks, getTempoTracksByDates } = useTrackFirestore()
const fetchTracked = (date) => {
  return getTracksByDates(date).then(trackedRef => {
    state.firebaseRefs['tracked'] = trackedRef.onSnapshot( snap => {
      const list = []
      snap.forEach(doc => {
        const track = doc.data()
          list.push({ ...track, uid: doc.id })
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

const onEventClick = (event) => {
  if (!event.class.includes('tempo')) {
    console.log(event);
    syncTempoUpdate(event)
  }
}

const syncTempoUpdate = async (event) => {
  const {data: issue } = await userApplication({
    appKey: 'jira',
    path: `issue/${event.title.slice(0, event.title.indexOf(" ")).trim()}` 
  });
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
  
  userApplication({
      method: 'post',
      appKey: 'tempo',
      path: '/worklogs',
      data: tempoData,
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



const fetchTempo = async (date) => {
  const from = startOfWeek(date)
  const to = endOfWeek(date)

  const tempoRef = await getTempoTracksByDates(from, to);
  state.firebaseRefs['tempoRef'] = tempoRef.onSnapshot(snap => {
    const list = [];
    snap.forEach(doc => {
      const track = doc.data();
      console.log(track)
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
        const date = format(track.started_at.toDate(), "yyyy-MM-dd");
        if (!track.ended_at) return

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

const events = computed(() => {
  const appEvents = state.tracked.map(event => ({
        ...event,
        uid: event.uid,
        start: event.started_at.toDate(),
        end: event.ended_at.toDate(),
        title: event.description,
        class: 'zen-event'
  }))

  return [...appEvents, ...state.tempoEvents.map((event) => ({
      start: event.started_at.toDate(),
      end: event.ended_at.toDate(),
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