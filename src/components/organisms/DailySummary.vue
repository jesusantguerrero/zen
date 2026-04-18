<script setup lang="ts">
import { computed, onUnmounted, reactive } from "vue";
import { DateTime } from "luxon";
import { startOfDay, subDays } from "date-fns";

import { useTaskFirestore, ITask } from "@/plugins/firebase/useTaskFirestore";
import { useTrackFirestore } from "@/plugins/firebase/useTrackFirestore";
import { formatDurationFromMs, getDurationInMs } from "@/composables/useDateTime";

const props = defineProps<{
  matrix: Record<string, { list: ITask[] }>;
}>();

const { getCommittedTasks } = useTaskFirestore();
const { getTracksByDates } = useTrackFirestore();

const state = reactive({
  recentCommitted: [] as ITask[],
  todayTracks: [] as any[],
  refs: [] as Array<() => void>,
});

const todayKey = () => DateTime.now().toFormat("yyyy-MM-dd");

const doneToday = computed(() =>
  state.recentCommitted.filter((t: any) => t.commit_date === todayKey()).length
);

const trackedToday = computed(() =>
  formatDurationFromMs(getDurationInMs(state.todayTracks)).toFormat("hh:mm:ss")
);

const committedDays = computed(() =>
  new Set(
    state.recentCommitted
      .map((t: any) => t.commit_date)
      .filter(Boolean)
  )
);

const dailyStreak = computed(() => {
  let streak = 0;
  let cursor = DateTime.now().startOf("day");
  while (committedDays.value.has(cursor.toFormat("yyyy-MM-dd"))) {
    streak += 1;
    cursor = cursor.minus({ days: 1 });
  }
  return streak;
});

// Streak that's about to break if today ends with zero completions.
const streakAtRisk = computed(() => {
  if (dailyStreak.value > 0) return 0; // already extended today
  let streak = 0;
  let cursor = DateTime.now().minus({ days: 1 }).startOf("day");
  while (committedDays.value.has(cursor.toFormat("yyyy-MM-dd"))) {
    streak += 1;
    cursor = cursor.minus({ days: 1 });
  }
  return streak;
});

// Show nudge when we have a real streak to protect and the day is getting late.
const showStreakNudge = computed(() => {
  const hour = DateTime.now().hour;
  return streakAtRisk.value >= 3 && hour >= 14;
});

const allActiveTasks = computed<ITask[]>(() =>
  Object.values(props.matrix).flatMap((m) => m.list || [])
);

const todayStart = () => startOfDay(new Date());

const overdueTasks = computed(() =>
  allActiveTasks.value.filter(
    (t) => t.due_date && new Date(t.due_date) < todayStart()
  )
);

const dueTodayTasks = computed(() => {
  const today = todayKey();
  return allActiveTasks.value.filter(
    (t) =>
      t.due_date &&
      DateTime.fromJSDate(new Date(t.due_date)).toFormat("yyyy-MM-dd") === today
  );
});

// Stale tasks: created more than 14 days ago, no tracked activity in the last 7 days,
// not done, and not overdue (overdue is its own signal).
const STALE_CREATED_DAYS = 14;
const STALE_INACTIVE_DAYS = 7;
const staleTasks = computed(() => {
  const staleCreatedBefore = DateTime.now().minus({ days: STALE_CREATED_DAYS });
  const inactiveBefore = DateTime.now().minus({ days: STALE_INACTIVE_DAYS });
  return allActiveTasks.value.filter((t: any) => {
    if (!t.created_at) return false;
    const createdAt = t.created_at.toDate ? t.created_at.toDate() : t.created_at;
    if (DateTime.fromJSDate(new Date(createdAt)) > staleCreatedBefore) return false;
    const lastTracked = t.last_tracked_at && (t.last_tracked_at.toDate ? t.last_tracked_at.toDate() : t.last_tracked_at);
    if (lastTracked && DateTime.fromJSDate(new Date(lastTracked)) > inactiveBefore) return false;
    return true;
  });
});

const loadCommitted = async () => {
  const fromDate = subDays(startOfDay(new Date()), 30);
  const ref = await getCommittedTasks(new Date(), fromDate);
  const unsub = ref.onSnapshot((snap: any) => {
    const list: ITask[] = [];
    snap.forEach((doc: any) => list.push({ ...doc.data(), uid: doc.id }));
    state.recentCommitted = list;
  });
  state.refs.push(unsub);
};

const loadTracks = async () => {
  const ref = await getTracksByDates(new Date());
  const unsub = ref.onSnapshot((snap: any) => {
    const list: any[] = [];
    snap.forEach((doc: any) => list.push({ ...doc.data(), uid: doc.id }));
    state.todayTracks = list;
  });
  state.refs.push(unsub);
};

loadCommitted();
loadTracks();

onUnmounted(() => {
  state.refs.forEach((unsub) => unsub && unsub());
});

defineEmits<{
  (e: "open-task", task: ITask): void;
}>();
</script>

<template>
  <section
    class="p-4 space-y-4 bg-white border border-gray-200 rounded-md shadow-sm dark:bg-base-lvl-2 dark:border-base-lvl-3 dark:text-gray-300"
  >
    <header class="flex items-baseline justify-between">
      <h4 class="text-sm font-bold tracking-wide uppercase text-gray-500 dark:text-gray-400">
        Today
      </h4>
      <span class="text-xs text-gray-400">
        {{ DateTime.now().toFormat("ccc, LLL dd") }}
      </span>
    </header>

    <div class="grid grid-cols-3 gap-2 text-center">
      <div>
        <div class="text-2xl font-bold text-accent">{{ doneToday }}</div>
        <div class="text-xs text-gray-400">Done</div>
      </div>
      <div>
        <div class="text-2xl font-bold">{{ trackedToday }}</div>
        <div class="text-xs text-gray-400">Tracked</div>
      </div>
      <div>
        <div class="text-2xl font-bold text-yellow-400">
          {{ dailyStreak }}<i class="ml-1 text-base fa fa-fire" />
        </div>
        <div class="text-xs text-gray-400">Streak</div>
      </div>
    </div>

    <div
      v-if="showStreakNudge"
      class="flex items-center p-2 space-x-2 text-sm border rounded-md border-orange-400/40 bg-orange-50/50 dark:bg-orange-500/10"
    >
      <i class="text-orange-500 fa fa-fire" />
      <span class="text-orange-600 dark:text-orange-300">
        <span class="font-bold">{{ streakAtRisk }}-day streak</span> at risk — finish one task today to keep it alive.
      </span>
    </div>

    <div
      v-if="overdueTasks.length"
      class="p-2 border border-red-400/40 rounded-md bg-red-50/50 dark:bg-red-500/10"
    >
      <div class="flex items-center justify-between text-sm">
        <span class="font-semibold text-red-500">
          <i class="mr-1 fa fa-exclamation-triangle" />
          {{ overdueTasks.length }} overdue
        </span>
      </div>
      <ul class="mt-1 space-y-1">
        <li
          v-for="task in overdueTasks.slice(0, 3)"
          :key="task.uid"
          class="text-xs truncate cursor-pointer hover:text-accent"
          @click="$emit('open-task', task)"
        >
          · {{ task.title }}
        </li>
      </ul>
    </div>

    <div v-if="dueTodayTasks.length">
      <div class="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
        Due today
      </div>
      <ul class="space-y-1">
        <li
          v-for="task in dueTodayTasks.slice(0, 3)"
          :key="task.uid"
          class="text-xs truncate cursor-pointer hover:text-accent"
          @click="$emit('open-task', task)"
        >
          · {{ task.title }}
        </li>
      </ul>
    </div>

    <div
      v-if="staleTasks.length"
      class="p-2 border rounded-md border-gray-300/40 bg-gray-50/50 dark:bg-gray-700/30 dark:border-base-lvl-3"
    >
      <div class="flex items-center justify-between text-sm">
        <span class="font-semibold text-gray-500 dark:text-gray-400">
          <i class="mr-1 fa fa-hourglass-half" />
          {{ staleTasks.length }} stale ({{ '>' }}14 days)
        </span>
      </div>
      <ul class="mt-1 space-y-1">
        <li
          v-for="task in staleTasks.slice(0, 3)"
          :key="task.uid"
          class="text-xs text-gray-500 truncate cursor-pointer dark:text-gray-400 hover:text-accent"
          @click="$emit('open-task', task)"
        >
          · {{ task.title }}
        </li>
      </ul>
    </div>
  </section>
</template>
