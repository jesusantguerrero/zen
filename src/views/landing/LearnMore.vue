<template>
  <section class="relative px-2 py-24 bg-white md:px-0">
    <div class="container items-center max-w-6xl px-8 mx-auto xl:px-5">
      <div class="max-w-3xl mx-auto text-center">
        <span class="inline-block px-3 py-1 text-xs font-bold tracking-wider text-green-600 uppercase border border-green-500 rounded-full">
          The loop
        </span>
        <h2 class="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          One loop instead of five tabs
        </h2>
        <p class="mx-auto mt-5 text-base text-gray-500 md:text-lg">
          Zen wires the Eisenhower Matrix, Pomodoro, time tracking, and standup into a single daily
          flow. Plan what matters, focus on one thing, log the work, ship the update.
        </p>
      </div>

      <ol class="grid grid-cols-1 mt-14 gap-7 md:grid-cols-4">
        <li
          v-for="(step, index) in steps"
          :key="step.title"
          class="relative flex flex-col p-6 transition-all bg-white border-2 border-gray-200 rounded-md hover:border-green-400"
        >
          <div class="flex items-center space-x-3">
            <span class="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-green-500 rounded-full">
              {{ index + 1 }}
            </span>
            <i :class="step.iconClass" class="text-lg text-green-500" aria-hidden="true"></i>
          </div>
          <h3 class="mt-4 text-lg font-bold text-gray-800">{{ step.title }}</h3>
          <p class="mt-2 text-sm text-gray-500">{{ step.description }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup>
const steps = [
  {
    iconClass: "fa fa-border-all",
    title: "Plan",
    description:
      "Dump the backlog into the Eisenhower Matrix. Decide what's urgent, what's important, what to drop.",
  },
  {
    iconClass: "fa fa-tasks",
    title: "Decide",
    description:
      "Pull today's lineup from the matrix. Three to five items you actually commit to shipping.",
  },
  {
    iconClass: "fa fa-stopwatch",
    title: "Work",
    description:
      "Pomodoro timer and time tracker run together. One click starts a focus block and logs the time.",
  },
  {
    iconClass: "fa fa-history",
    title: "Standup",
    description:
      "Yesterday's tracked work becomes today's standup - paste it into Slack, Jira, or your build log.",
  },
];
</script>
