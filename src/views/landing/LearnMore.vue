<template>
  <section class="relative px-2 pt-10 pb-20 bg-white md:px-0">
    <div class="container items-center max-w-6xl px-8 mx-auto xl:px-5">
      <div class="max-w-3xl mx-auto text-center">
        <span class="inline-block px-3 py-1 text-xs font-bold tracking-wider text-green-600 uppercase border border-green-500 rounded-full">
          How it works
        </span>
        <h2 class="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          One morning decision. Four projects handled.
        </h2>
        <p class="mx-auto mt-5 text-base text-gray-500 md:text-lg">
          Dump everything into the matrix once. Zen picks your top 3 across all projects every morning, times your focus, and ships tonight's standup on the way out.
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

      <figure class="max-w-4xl mx-auto mt-16 overflow-hidden border-2 border-gray-200 rounded-md shadow-md">
        <figcaption class="sr-only">Zen product demo: plan a day, run a pomodoro, and generate a standup in 60 seconds.</figcaption>
        <div style="position: relative; padding-bottom: 56.25%; height: 0;">
          <iframe
            src="https://www.loom.com/embed/d881ba48b6a44f428080e11853859ebf"
            frameborder="0"
            webkitallowfullscreen
            mozallowfullscreen
            allowfullscreen
            loading="lazy"
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
            title="Zen product demo"
          ></iframe>
        </div>
      </figure>
      <p class="max-w-2xl mx-auto mt-6 text-sm text-center text-gray-500">
        60 seconds, start to finish — plan, focus, standup.
      </p>
    </div>
  </section>
</template>

<script setup>
const steps = [
  {
    iconClass: "fa fa-border-all",
    title: "Dump",
    description:
      "One place for every task across every project. Zen suggests the quadrant so you don't have to sort manually.",
  },
  {
    iconClass: "fa fa-bolt",
    title: "Decide",
    description:
      "Wake up to your top 3 — already picked across projects. No more 'which client am I on today?'",
  },
  {
    iconClass: "fa fa-stopwatch",
    title: "Focus",
    description:
      "One click starts a pomodoro and logs billable time. The timer is tied to the task — no double entry.",
  },
  {
    iconClass: "fa fa-history",
    title: "Ship",
    description:
      "Today's tracked work writes tonight's standup. Paste it into Slack, Jira, or your public build log.",
  },
];
</script>
