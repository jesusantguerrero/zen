<template>
  <section class="relative py-24 bg-secondary">
    <normal-wave />
    <div
      class="container relative items-center px-6 pt-20 mx-auto sm:px-10 md:px-16 lg:px-20 max-w-7xl"
    >
      <div class="max-w-2xl mx-auto text-center">
        <span class="inline-block px-3 py-1 text-xs font-bold tracking-wider text-green-400 uppercase border border-green-400 rounded-full">
          Under the hood
        </span>
        <h2 class="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          The matrix is the core
        </h2>
        <p class="mt-4 text-base text-gray-300">
          Everything else hangs off the four-quadrant decision. Tasks you start become tracks,
          tracks become standups, standups become weekly metrics.
        </p>
      </div>

      <div class="grid items-start grid-cols-1 mt-14 gap-10 lg:grid-cols-2">
        <div class="w-full">
          <h3 class="text-xl font-bold text-white">Eisenhower Matrix</h3>
          <p class="mt-3 mb-6 text-sm text-gray-300">
            Drop every task into one of four quadrants. Zen turns "what should I work on?" into a
            deterministic answer.
          </p>
          <div class="grid gap-2 md:grid-cols-2">
            <div
              v-for="(value, matrix) in matrixes"
              class="pt-5 border-2 border-dashed rounded-md"
              :class="[value.border]"
              :key="matrix"
            >
              <h4 class="px-4 font-bold capitalize" :class="[value.color]">{{ matrix }}</h4>
              <matrix-help-view
                :matrix="matrix"
                class="text-gray-200 bg-transparent"
                title-class="text-white"
              />
            </div>
          </div>
        </div>

        <div class="w-full lg:pl-6">
          <h3 class="text-xl font-bold text-white">What ships in the box</h3>
          <p class="mt-3 mb-6 text-sm text-gray-300">
            No paywalls on the daily-driver features. Integrations are optional - most users run
            standalone for weeks before hooking up Jira.
          </p>
          <ul class="space-y-3">
            <li
              v-for="feat in features"
              :key="feat.title"
              class="flex items-start py-2 space-x-4 text-white"
            >
              <i :class="`fa fa-${feat.icon} text-2xl text-green-400 w-8 mt-0.5`" aria-hidden="true"></i>
              <div>
                <p class="font-bold">{{ feat.title }}</p>
                <p class="text-sm text-gray-300">{{ feat.description }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import MatrixHelpView from "@/components/molecules/MatrixHelpView.vue";
import NormalWave from "./waves/normal-wave.vue";

const features = [
  {
    icon: "stopwatch",
    title: "Pomodoro + time tracker in one",
    description: "One timer, one click. Focus blocks log billable time automatically.",
  },
  {
    icon: "tasks",
    title: "Tasks with checklists and tags",
    description: "Subtasks, client tags, and keyboard-first quick-add (Shift+K).",
  },
  {
    icon: "retweet",
    title: "Real-time sync",
    description: "Firestore backend. Pick up on another device mid-session without refreshing.",
  },
  {
    icon: "plug",
    title: "Jira, GitHub, Google",
    description: "Pull issues, push Tempo work logs, sync calendar. Optional - not required.",
  },
  {
    icon: "chart-bar",
    title: "Weekly metrics",
    description: "Completed pomodoros, streak, hours per tag. The receipts for your week.",
  },
  {
    icon: "mobile",
    title: "Mobile-friendly",
    description: "Runs from your phone when you need to log a track on the go.",
  },
];

const matrixes = {
  todo: {
    color: "text-green-500",
    border: "border-green-500",
  },
  schedule: {
    color: "text-blue-500",
    border: "border-blue-500",
  },
  delegate: {
    color: "text-yellow-500",
    border: "border-yellow-500",
  },
  delete: {
    color: "text-red-500",
    border: "border-red-500",
  },
};
</script>
