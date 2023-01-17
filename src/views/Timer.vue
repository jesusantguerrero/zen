<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-28">
  <div class="items-center justify-between mb-10 section-header md:flex">
      <h2 class="flex items-center text-2xl font-bold text-left text-gray-400">
         <span> Time Tracks </span>
      </h2>
      <search-bar
        v-model="state.searchText"
        v-model:date="state.date"
        v-model:tags="state.tags"
        v-model:selectedTags="state.selectedTags"
      />
  </div> 

  <div class="">     
      <div v-for="(tracksByDate, trackDate) in groupedTracks" :key="trackDate" class="mb-12">
          <div class="pl-16 py-4 bg-white w-full font-bold">
              {{ formattedDate(trackDate) }}
          </div>

          <TimeTrackerGroup
              v-for="track in tracksByDate"
              :time-entry="track"
              :key="track.id"
          />
      </div>
  </div>
</div>

</template>

<script setup>
import { reactive, watch, onUnmounted, computed } from 'vue'
import { useTaskFirestore } from '../_features/tasks'
import { useTrackFirestore } from '../_features/tracks'
import SearchBar from "../components/molecules/SearchBar.vue"
import { format, formatRelative, isToday, parse, startOfDay, subDays } from 'date-fns'
import { enUS } from 'date-fns/locale'
import TimeTrackerGroup from '../components/organisms/TimeTrackerGroup.vue'


// state and ui
const state = reactive({
  isFirstLoaded: false,
  committed: [],
  committedRef: null,
  tracked: [],
  trackedRef: null,
  suggestions: [],
  suggestionsRef: null,
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


const formattedDate = (date) => {
    const dateT = parse(date, 'yyyy-MM-dd', new Date());
    return isToday(dateT) ? 'Today' : format(dateT, 'E, dd LLL yyyy')
}

const parseTrack = (track) => {
  return {
    duration_ms: track.duration_ms,
    done: false,
    commit_date: null,
    uid: track.uid,
    tags: [],
    title: track.description,
    type: 'todo',
    tracks: [track]
  }
}

onUnmounted(() => {
  if (state.committedRef) {
    state.committedRef()
    state.trackedRef()
  }
});
</script>