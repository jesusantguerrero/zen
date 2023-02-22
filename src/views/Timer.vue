<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-28">
  <div class="items-center justify-between mb-10 section-header md:flex">
      <h2 class="flex items-center text-2xl font-bold text-left text-gray-400">
         <span> Time Tracks </span>
      </h2>
      <SearchBar
        v-model="state.searchText"
        v-model:date="state.date"
        v-model:tags="state.tags"
        v-model:selectedTags="state.selectedTags"
      />
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
      </div>
  </div>
</div>
</template>

<script setup>
import { reactive, watch, onUnmounted, computed } from 'vue'
import { useTrackFirestore } from '../utils/useTrackFirestore'
import SearchBar from "../components/molecules/SearchBar.vue"
import { format, formatRelative, isToday, parse, startOfDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import TimeTrackerGroup from '../components/organisms/TimeTrackerGroup.vue'
import { ElNotification } from 'element-plus'


// state and ui
const state = reactive({
  tracked: [],
  trackedRef: null,
  searchText: "",
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
const  { getTracksByDates } = useTrackFirestore()
const fetchTracked = (date) => {
  return getTracksByDates(date).then(trackedRef => {
    state.trackedRef = trackedRef.onSnapshot( snap => {
      const list = []
      snap.forEach(doc => {
        const track = doc.data()
          list.push({ ...track, uid: doc.id })
      })
      state.tracked = list;
    })
  })
}

watch(() => state.date , async () => {
 await fetchTracked(state.date)
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
  if (state.trackedRef) {
    state.trackedRef()
  }
});
</script>