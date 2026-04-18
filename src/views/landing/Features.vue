<template>
  <section class="relative py-20 bg-secondary">
    <normal-wave />
    <div
      class="container relative items-center px-6 pt-20 mx-auto sm:px-10 md:px-16 lg:px-20 max-w-7xl"
    >
      <div class="max-w-2xl mx-auto text-center">
        <span class="inline-block px-3 py-1 text-xs font-bold tracking-wider text-green-400 uppercase border border-green-400 rounded-full">
          Why a matrix
        </span>
        <h2 class="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          Four quadrants. One answer.
        </h2>
        <p class="mt-4 text-base text-gray-300">
          Todo apps give you a flat list. Zen forces every task into one of four decisions — so "what should I work on?" has a deterministic answer by 9am.
        </p>
      </div>

      <div class="grid items-start grid-cols-1 gap-6 mt-14 md:grid-cols-2">
        <article
          v-for="quadrant in quadrants"
          :key="quadrant.name"
          class="p-6 transition-all border-2 border-dashed rounded-md hover:bg-white/[0.02]"
          :class="[quadrant.border]"
        >
          <div class="flex items-center justify-between">
            <h4 class="text-lg font-bold capitalize" :class="[quadrant.color]">
              {{ quadrant.label }}
            </h4>
            <span class="text-xs font-bold tracking-wider text-gray-400 uppercase">
              {{ quadrant.verdict }}
            </span>
          </div>
          <p class="mt-3 text-sm text-gray-300">{{ quadrant.description }}</p>
          <p class="mt-3 text-xs italic text-gray-400">e.g. {{ quadrant.example }}</p>
        </article>
      </div>

      <p class="max-w-2xl mx-auto mt-10 text-sm text-center text-gray-400">
        Every task you start becomes a tracked pomodoro. Every pomodoro becomes a line in tonight's standup. Every standup becomes next week's metrics.
      </p>
    </div>
  </section>
</template>

<script setup>
import NormalWave from "./waves/normal-wave.vue";

const quadrants = [
  {
    name: "todo",
    label: "Do",
    verdict: "Today",
    color: "text-green-400",
    border: "border-green-400/60",
    description: "Urgent and important. Pick three and start a pomodoro.",
    example: "Deploy the payment fix before the client demo.",
  },
  {
    name: "schedule",
    label: "Plan",
    verdict: "This week",
    color: "text-blue-400",
    border: "border-blue-400/60",
    description: "Important but not urgent. Put it on the calendar before it becomes urgent.",
    example: "Write the quarterly retro for personal project.",
  },
  {
    name: "delegate",
    label: "Delegate",
    verdict: "Hand off",
    color: "text-yellow-400",
    border: "border-yellow-400/60",
    description: "Urgent but not yours. Write the Slack message and move on.",
    example: "Ask the designer to review the onboarding flow.",
  },
  {
    name: "delete",
    label: "Delete",
    verdict: "Drop it",
    color: "text-red-400",
    border: "border-red-400/60",
    description: "Neither urgent nor important. The quadrant that saves your week.",
    example: "Tweak the README badge colors (again).",
  },
];
</script>
