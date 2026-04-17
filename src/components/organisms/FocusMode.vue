<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive } from "vue";
import { DateTime, Duration, Interval } from "luxon";
import { useTrackerStore } from "@/store/tracker";
import { formatDurationFromMs } from "@/composables/useDateTime";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void;
}>();

const trackStore = useTrackerStore();

const clock = reactive<{ now: Date | null; interval: any }>({
  now: null,
  interval: null,
});

const hasRunningTimer = computed(
  () => !!trackStore.currentTimer?.started_at
);

const targetDuration = computed(() => {
  const target = trackStore.currentTimer?.target_time;
  return target ? Duration.fromISO(target) : null;
});

const countdown = computed(() => {
  if (!hasRunningTimer.value || !targetDuration.value || !clock.now) {
    return targetDuration.value
      ? targetDuration.value.toFormat("mm:ss")
      : "--:--";
  }
  const startedAt =
    trackStore.currentTimer!.started_at instanceof Date
      ? (trackStore.currentTimer!.started_at as Date)
      : new Date(trackStore.currentTimer!.started_at as any);
  const elapsed = Interval.fromDateTimes(startedAt, clock.now).toDuration();
  const remaining = targetDuration.value
    .minus(elapsed)
    .plus({ seconds: 0.9 });
  return remaining.as("seconds") < 0 ? "00:00" : remaining.toFormat("mm:ss");
});

const totalTaskTime = computed(() => {
  const tracks = trackStore.currentTask?.tracks ?? [];
  const ms = tracks.reduce(
    (sum: number, t: any) => sum + Number(t.duration_ms || 0),
    0
  );
  return formatDurationFromMs(ms).toFormat("hh:mm:ss");
});

const startedAt = computed(() => {
  const s = trackStore.currentTimer?.started_at;
  if (!s) return null;
  const date = s instanceof Date ? s : new Date(s as any);
  return DateTime.fromJSDate(date).toFormat("HH:mm");
});

const onEscape = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.isOpen) {
    close();
  }
};

const startClock = () => {
  if (clock.interval) return;
  clock.now = new Date();
  clock.interval = setInterval(() => {
    clock.now = new Date();
  }, 500);
};

const stopClock = () => {
  if (clock.interval) {
    clearInterval(clock.interval);
    clock.interval = null;
  }
};

onMounted(() => {
  window.addEventListener("keydown", onEscape);
  startClock();
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onEscape);
  stopClock();
});

const close = () => emit("update:isOpen", false);

const toggleTimer = () => {
  if (!trackStore.currentTask?.uid) return;
  trackStore.setCurrentTask(trackStore.currentTask, true);
};
</script>

<template>
  <Teleport to="body">
    <Transition name="focus-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 flex flex-col items-center justify-center bg-base-lvl-1 text-gray-100"
        role="dialog"
        aria-modal="true"
      >
        <button
          class="absolute top-6 right-6 text-gray-400 hover:text-white focus:outline-none"
          aria-label="Exit focus mode"
          @click="close"
        >
          <i class="text-2xl fa fa-times" />
        </button>

        <div class="text-xs tracking-widest text-gray-500 uppercase">
          Focus mode · press Esc to exit
        </div>

        <h1 class="max-w-3xl px-6 mt-6 text-5xl font-bold text-center break-words">
          {{ trackStore.currentTask?.title || "No task selected" }}
        </h1>

        <div
          v-if="trackStore.currentTask?.description"
          class="max-w-2xl px-6 mt-4 text-center text-gray-400"
        >
          {{ trackStore.currentTask.description }}
        </div>

        <div class="mt-12 text-center">
          <div
            class="font-mono text-[10rem] leading-none tracking-tight"
            :class="hasRunningTimer ? 'text-accent' : 'text-gray-500'"
          >
            {{ countdown }}
          </div>
          <div class="mt-4 text-sm text-gray-500">
            <span v-if="hasRunningTimer">Started at {{ startedAt }}</span>
            <span v-else>Timer not running</span>
            <span class="mx-2">·</span>
            <span>Total on task: {{ totalTaskTime }}</span>
          </div>
        </div>

        <div class="flex items-center gap-4 mt-12">
          <button
            class="flex items-center justify-center w-20 h-20 text-4xl rounded-full bg-accent text-base-lvl-1 hover:brightness-110 transition disabled:opacity-40"
            :disabled="!trackStore.currentTask?.uid"
            :aria-label="hasRunningTimer ? 'Stop timer' : 'Start timer'"
            @click="toggleTimer"
          >
            <i
              class="far"
              :class="hasRunningTimer ? 'fa-stop-circle' : 'fa-play-circle'"
            />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.focus-fade-enter-active,
.focus-fade-leave-active {
  transition: opacity 200ms ease;
}
.focus-fade-enter-from,
.focus-fade-leave-to {
  opacity: 0;
}
</style>
