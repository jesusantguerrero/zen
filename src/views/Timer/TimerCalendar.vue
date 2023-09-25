<script setup lang="ts">
import { computed, onMounted } from 'vue'
import {  ElNotification } from 'element-plus'
// @ts-expect-error
import VueCal from "vue-cal";
import 'vue-cal/dist/vuecal.css'

import { useTrackFirestore } from '@/utils/useTrackFirestore'
import { functions } from '@/utils/useFirebase'
import { formatDurationFromMs } from '@/utils/useDateTime';
import { isSameDateTime} from '@/utils';
import TimerCalendarCard from './Partials/TimerCalendarCard.vue';
import { format, subDays, addDays } from 'date-fns';


const { tempoEvents, tracks }= defineProps<{
  tempoEvents: any[];
  tracks: any[];
  date: Date;
  activeView: string;
}>()

// tracked tasks
const  { syncTempoTracks } = useTrackFirestore()


const userApplication = functions.httpsCallable('userApplication');

const onEventClick = (event: any) => {
  if (!event.class.includes('tempo')) {
    syncTempoUpdate(event)
  } else {
    syncZenUpdate(event);
  }
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
    authorAccountId: tempoEvents[0]?.author?.accountId,
    timeSpentSeconds: event.duration_ms / 1000,
    billableSeconds: event.duration_ms / 1000,
    description: event.description,
    issueId: issue.id,
    startDate: format(event.start, 'yyyy-MM-dd'),
    startTime: format(event.start, 'HH:mm:ss')
  }

  const zenTrack = tracks.find( track => track.uid == event.uid)
  
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

    syncTempoTracks([{
      ...data, 
      relations: {
        zen: zenTrack
      }
    }]).then(() => {
      ElNotification({
        type: 'success',
        message: 'Tempo tracks synced correctly'
      })
    })
    
    
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
  .finally(() => {

  })
}

onMounted(() => {
  document.querySelector('.vuecal__body .vuecal__bg')?.classList.add('ic-scroller');
})


const syncZenUpdate = async (event: any, autoUpdateTrack = true) => {
  const alreadyInZen = events.value
  .filter(item => item.class === 'zen-event').find( tempoEvent => {
    return isSameDateTime(event.start, tempoEvent.start);
  });

  if (alreadyInZen) {
    ElNotification({
      message: 'This date-time is already registered in zen',
      type: 'error'
    })
    return;
  }

  event.isLoading = true;
  
  try { 
    const zenTrack = tracks.find( track => track.uid == alreadyInZen.uid)
    
    if (autoUpdateTrack) {
      return updateTrack({
        ...zenTrack,
        relations: {
          tempo: {
            attributes: [{
                "key": "_Account_",
                "value": "DEV"
            }],
            authorAccountId: event.authorAccountId,
            timeSpentSeconds: event.duration_ms / 1000,
            billableSeconds: event.duration_ms / 1000,
            description: event.description,
            issueId: event.issueId,
            startDate: format(event.start, 'yyyy-MM-dd'),
            startTime: format(event.start, 'HH:mm:ss')
          }
        }
      }).then(() => {
          ElNotification({
            type: 'success',
            message: 'Zen track created in tempo  correctly'
          })
      })
      .finally(() => {
        event.isLoading = false;
      })
    }
  } catch(err) {
    console.log(err)
  }
}

const hasTempo = (event: any) => {
  return event.class.includes('tempo') || event.relations && event.relations['tempo']
}

const getTotalTimeByDate = (date: Date) => {
  const milliseconds = tracks.reduce((total: number, track: any) => {
    if (format(date, 'yyyy-MM-dd') == format(track.started_at, "yyyy-MM-dd") && track.ended_at) {
      return total + (track.duration_ms ?? 0)
    }
    return total;
  }, 0) ?? 0

  return formatDurationFromMs(milliseconds)?.toFormat?.('hh:mm:ss')
}

const formatDate = (date: Date) => {
  try {
    format(date, "EEEE, dd ")
  } catch (err) {
    console.log(err, "date")
    return date;
  }
}

const events = computed(() => {
  const appEvents = tracks.filter(item => item.ended_at && !item.relations?.tempo).map(event => ({
        ...event,
        uid: event.uid,
        start: event.started_at,
        end: event.ended_at,
        title: event.description,
        class: 'zen-event',
        isLoading: false,
        allowSync: !event.relations?.tempo
  }))

  return [...appEvents, ...tempoEvents.map((event) => ({
      start: event.started_at,
      end: event.ended_at,
      title: event.description,
      class: 'tempo-event',
      isLoading: false,
      allowSync: !event.relations?.zen || event.allowSync
  }))]
})
</script>

<template>
      <VueCal 
        style="height: 500px"
        :events="events"
        :disable-views="['years', 'year']"
        :active-view="activeView"
        :time-cell-height="110"
        :selected-date="date"
        :start-week-on-sunday="true"
        hide-view-selector
        watchRealTime
      >
        <template v-slot:weekday-heading="{ heading  }">
          <article>
            <h4 class="text-xs">
              {{ formatDate(addDays(heading.date, 1)) }}
               {{ heading.label }}
            </h4>
            <section v-if="activeView == 'week'">
              {{ getTotalTimeByDate(addDays(heading.date, 1)) }}
            </section>
          </article>
        </template>
        
        <template #event="{ event }"> 
          <TimerCalendarCard 
            :event="event"
            :allow-sync="true"
            @sync-tempo="onEventClick(event)"
          />
        </template>
      </VueCal>
</template>

<style lang="scss">
.tempo-event, .zen-event {
  @apply dark:bg-base-lvl-2 dark:border-base-lvl-3 dark:text-white;
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

.vuecal {
  &__title-bar, &__weekdays-headings {
    @apply dark:bg-base-lvl-2 dark:text-white;
  }
}
</style>