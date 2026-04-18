<template>
  <section class="relative py-20 bg-gray-900">
    <div class="container relative px-6 mx-auto sm:px-10 md:px-16 lg:px-20 max-w-7xl">
      <div class="max-w-2xl mx-auto text-center">
        <span class="inline-block px-3 py-1 text-xs font-bold tracking-wider text-green-400 uppercase border border-green-400 rounded-full">
          How it compares
        </span>
        <h2 class="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          A productivity app that speaks developer
        </h2>
        <p class="mt-4 text-base text-gray-400">
          Todoist is a clean todo list. Notion is a blank-page wiki. Linear is a team issue tracker. Zen is the only one built for the individual developer running multiple projects at once.
        </p>
      </div>

      <!-- Desktop table -->
      <div class="hidden mt-14 overflow-hidden border-2 rounded-md border-white/10 md:block">
        <table class="w-full text-sm text-left text-gray-200 border-collapse">
          <thead>
            <tr class="text-xs tracking-wider text-gray-400 uppercase bg-gray-800/60">
              <th scope="col" class="px-6 py-4 font-bold">Feature</th>
              <th scope="col" class="px-6 py-4 font-bold text-center text-green-400 bg-green-400/10">
                Zen
              </th>
              <th scope="col" class="px-6 py-4 font-bold text-center">Todoist</th>
              <th scope="col" class="px-6 py-4 font-bold text-center">Notion</th>
              <th scope="col" class="px-6 py-4 font-bold text-center">Linear</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in rows"
              :key="row.feature"
              :class="index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/40'"
              class="border-t border-white/5"
            >
              <td class="px-6 py-4 font-medium text-white">{{ row.feature }}</td>
              <td class="px-6 py-4 text-center bg-green-400/5">
                <cell :value="row.zen" :accent="true" />
              </td>
              <td class="px-6 py-4 text-center">
                <cell :value="row.todoist" />
              </td>
              <td class="px-6 py-4 text-center">
                <cell :value="row.notion" />
              </td>
              <td class="px-6 py-4 text-center">
                <cell :value="row.linear" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile stacked -->
      <div class="mt-10 space-y-6 md:hidden">
        <div
          v-for="(col, key) in mobileColumns"
          :key="key"
          class="overflow-hidden border-2 rounded-md"
          :class="col.highlight ? 'border-green-400/60 bg-green-400/5' : 'border-white/10 bg-gray-800/40'"
        >
          <div class="px-5 py-3 border-b border-white/10" :class="col.highlight ? 'bg-green-400/10' : ''">
            <h3 class="text-base font-bold" :class="col.highlight ? 'text-green-400' : 'text-white'">
              {{ col.name }}
            </h3>
          </div>
          <dl class="divide-y divide-white/5">
            <div
              v-for="row in rows"
              :key="row.feature + key"
              class="flex items-center justify-between px-5 py-3"
            >
              <dt class="text-sm text-gray-300">{{ row.feature }}</dt>
              <dd class="text-sm">
                <cell :value="row[key]" :accent="col.highlight" />
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <p class="mt-8 text-xs text-center text-gray-500">
        Comparison reflects public features as of 2026. Competitor prices and plugins change;
        check their sites for the latest.
      </p>
    </div>
  </section>
</template>

<script setup>
import Cell from "./comparison/Cell.vue";

const rows = [
  {
    feature: "Single-player (not a team tool)",
    zen: true,
    todoist: true,
    notion: true,
    linear: false,
  },
  {
    feature: "Eisenhower Matrix (built-in)",
    zen: true,
    todoist: false,
    notion: "template",
    linear: false,
  },
  {
    feature: "Pomodoro timer (built-in)",
    zen: true,
    todoist: "plugin",
    notion: false,
    linear: false,
  },
  {
    feature: "Time tracking (built-in)",
    zen: true,
    todoist: false,
    notion: false,
    linear: false,
  },
  {
    feature: "Cross-project daily top 3",
    zen: true,
    todoist: false,
    notion: false,
    linear: false,
  },
  {
    feature: "Auto-generated standup",
    zen: true,
    todoist: false,
    notion: false,
    linear: false,
  },
  {
    feature: "Jira / GitHub sync",
    zen: true,
    todoist: false,
    notion: "plugin",
    linear: true,
  },
  {
    feature: "Developer-first design",
    zen: true,
    todoist: false,
    notion: false,
    linear: true,
  },
  {
    feature: "Price",
    zen: "Free (Pro soon)",
    todoist: "$4+/mo",
    notion: "$10+/mo",
    linear: "$8+/user/mo",
  },
];

const mobileColumns = {
  zen: { name: "Zen", highlight: true },
  todoist: { name: "Todoist", highlight: false },
  notion: { name: "Notion", highlight: false },
  linear: { name: "Linear", highlight: false },
};
</script>
