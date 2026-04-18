<template>
  <section class="relative py-24 bg-gray-900">
    <div class="container relative px-6 mx-auto sm:px-10 md:px-16 lg:px-20 max-w-7xl">
      <div class="max-w-2xl mx-auto text-center">
        <span class="inline-block px-3 py-1 text-xs font-bold tracking-wider text-green-400 uppercase border border-green-400 rounded-full">
          Before vs after
        </span>
        <h2 class="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          From scattered tabs to one loop
        </h2>
        <p class="mt-4 text-base text-gray-400">
          Most devs already own the tools. They just live in five different tabs. Zen pulls them
          into a single daily flow.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 mt-14 lg:grid-cols-2">
        <!-- Before -->
        <article
          class="relative flex flex-col p-6 overflow-hidden border-2 rounded-md border-red-400/30 bg-red-950/20"
          aria-labelledby="before-heading"
        >
          <header class="flex items-center justify-between">
            <span class="inline-flex items-center px-3 py-1 text-xs font-bold tracking-wider text-red-300 uppercase border rounded-full border-red-400/40 bg-red-500/10">
              <i class="mr-2 text-xs fa fa-exclamation-triangle" aria-hidden="true"></i>
              Before Zen
            </span>
            <span class="text-xs text-gray-500">Monday, 9:47am</span>
          </header>
          <h3 id="before-heading" class="mt-5 text-xl font-bold text-white">
            Five tabs, zero signal
          </h3>
          <p class="mt-2 text-sm text-gray-400">
            You open the laptop. Every tool wants attention. None of them tell you what to do next.
          </p>

          <!-- Chaos tabs -->
          <ul
            class="mt-6 space-y-2"
            aria-label="Scattered tools"
          >
            <li
              v-for="tab in chaosTabs"
              :key="tab.name"
              class="flex items-center px-3 py-2 border rounded-md border-white/5 bg-gray-900/60"
            >
              <span class="flex items-center justify-center w-8 h-8 mr-3 text-xs rounded bg-gray-800" aria-hidden="true">
                <i :class="tab.icon"></i>
              </span>
              <span class="flex-1 text-sm text-gray-300">{{ tab.name }}</span>
              <span class="text-xs text-red-300">{{ tab.problem }}</span>
            </li>
          </ul>

          <ul class="mt-6 space-y-2 text-sm text-gray-400">
            <li class="flex items-start">
              <i class="mt-1 mr-2 text-xs text-red-400 fa fa-times" aria-hidden="true"></i>
              <span>30 minutes deciding what to work on first</span>
            </li>
            <li class="flex items-start">
              <i class="mt-1 mr-2 text-xs text-red-400 fa fa-times" aria-hidden="true"></i>
              <span>Timer app you forget to start, forget to stop</span>
            </li>
            <li class="flex items-start">
              <i class="mt-1 mr-2 text-xs text-red-400 fa fa-times" aria-hidden="true"></i>
              <span>Scrambling to write a standup 5 minutes before it starts</span>
            </li>
            <li class="flex items-start">
              <i class="mt-1 mr-2 text-xs text-red-400 fa fa-times" aria-hidden="true"></i>
              <span>No honest answer to "where did my week go?"</span>
            </li>
          </ul>
        </article>

        <!-- After -->
        <article
          class="relative flex flex-col p-6 overflow-hidden border-2 rounded-md border-green-400/40 bg-green-950/10"
          aria-labelledby="after-heading"
        >
          <header class="flex items-center justify-between">
            <span class="inline-flex items-center px-3 py-1 text-xs font-bold tracking-wider text-green-400 uppercase border rounded-full border-green-400/50 bg-green-400/10">
              <i class="mr-2 text-xs fa fa-check" aria-hidden="true"></i>
              With Zen
            </span>
            <span class="text-xs text-gray-500">Monday, 9:47am</span>
          </header>
          <h3 id="after-heading" class="mt-5 text-xl font-bold text-white">
            One tab, one decision, one timer
          </h3>
          <p class="mt-2 text-sm text-gray-400">
            The matrix tells you what matters. The timer runs the focus block and the time log.
            The standup writes itself from what you shipped.
          </p>

          <!-- Loop steps -->
          <ol
            class="relative mt-6 space-y-2"
            aria-label="The Zen loop"
          >
            <li
              v-for="(step, index) in loopSteps"
              :key="step.title"
              class="flex items-center px-3 py-2 border rounded-md border-green-400/20 bg-gray-900/60"
            >
              <span
                class="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-3 text-xs font-bold text-white bg-green-500 rounded"
                aria-hidden="true"
              >
                {{ index + 1 }}
              </span>
              <div class="flex-1">
                <p class="text-sm font-bold text-white">{{ step.title }}</p>
                <p class="text-xs text-gray-400">{{ step.sub }}</p>
              </div>
              <i
                v-if="index < loopSteps.length - 1"
                class="text-xs text-green-400/60 fa fa-arrow-down"
                aria-hidden="true"
              ></i>
              <i
                v-else
                class="text-xs text-green-400 fa fa-check"
                aria-hidden="true"
              ></i>
            </li>
          </ol>

          <ul class="mt-6 space-y-2 text-sm text-gray-200">
            <li class="flex items-start">
              <i class="mt-1 mr-2 text-xs text-green-400 fa fa-check" aria-hidden="true"></i>
              <span>3-5 items committed for the day, in under 2 minutes</span>
            </li>
            <li class="flex items-start">
              <i class="mt-1 mr-2 text-xs text-green-400 fa fa-check" aria-hidden="true"></i>
              <span>Pomodoro and track log in the same click</span>
            </li>
            <li class="flex items-start">
              <i class="mt-1 mr-2 text-xs text-green-400 fa fa-check" aria-hidden="true"></i>
              <span>Standup generated from yesterday's work, paste it in Slack</span>
            </li>
            <li class="flex items-start">
              <i class="mt-1 mr-2 text-xs text-green-400 fa fa-check" aria-hidden="true"></i>
              <span>Weekly metrics that show the week you actually had</span>
            </li>
          </ul>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
const chaosTabs = [
  { name: "Jira board", icon: "fa fa-columns text-blue-400", problem: "40 open tickets" },
  { name: "Notion doc", icon: "fa fa-file-alt text-gray-300", problem: "stale notes" },
  { name: "Todoist", icon: "fa fa-list text-red-300", problem: "flat list" },
  { name: "Toggl timer", icon: "fa fa-clock text-purple-300", problem: "forgot to start" },
  { name: "Slack drafts", icon: "fa fa-comment text-yellow-300", problem: "standup due" },
];

const loopSteps = [
  { title: "Plan", sub: "Drop tasks into the Eisenhower matrix" },
  { title: "Decide", sub: "Pick 3-5 items for today" },
  { title: "Work", sub: "Pomodoro + time tracker, one click" },
  { title: "Standup", sub: "Auto-generated from your tracks" },
];
</script>
