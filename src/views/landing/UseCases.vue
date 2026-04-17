<template>
  <section class="relative py-24 bg-secondary">
    <div class="container relative px-6 mx-auto sm:px-10 md:px-16 lg:px-20 max-w-7xl">
      <div class="max-w-2xl mx-auto text-center">
        <span class="inline-block px-3 py-1 text-xs font-bold tracking-wider text-green-400 uppercase border border-green-400 rounded-full">
          Who it's for
        </span>
        <h2 class="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          Built for how developers actually work
        </h2>
        <p class="mt-4 text-base text-gray-300">
          Zen isn't a team Kanban or a blank-page wiki. It's a single-player focus tool for engineers
          who ship on their own schedule.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 mt-14 md:grid-cols-3">
        <article
          v-for="persona in personas"
          :key="persona.name"
          class="relative flex flex-col p-6 overflow-hidden transition-all duration-200 bg-gray-900 border-2 rounded-md border-white/10 hover:border-green-400/60 hover:-translate-y-1"
        >
          <div class="flex items-center space-x-3">
            <div
              class="flex items-center justify-center w-10 h-10 text-sm font-bold text-white rounded-full"
              :class="persona.avatarBg"
            >
              {{ persona.initials }}
            </div>
            <div>
              <p class="text-xs font-bold tracking-widest text-green-400 uppercase">
                {{ persona.label }}
              </p>
              <p class="text-sm text-gray-400">{{ persona.name }}</p>
            </div>
          </div>

          <h3 class="mt-5 text-xl font-bold leading-snug text-white">
            {{ persona.title }}
          </h3>
          <p class="mt-3 text-sm leading-relaxed text-gray-300">
            {{ persona.description }}
          </p>

          <div class="mt-5">
            <p class="text-xs font-bold tracking-wider text-gray-400 uppercase">Killer features</p>
            <ul class="mt-3 space-y-2">
              <li
                v-for="feat in persona.features"
                :key="feat"
                class="flex items-start text-sm text-gray-200"
              >
                <i class="mt-1 mr-2 text-xs text-green-400 fa fa-check"></i>
                <span>{{ feat }}</span>
              </li>
            </ul>
          </div>

          <div class="mt-auto pt-6">
            <router-link
              to="/register"
              class="inline-flex items-center justify-center w-full h-10 px-4 text-sm font-bold text-white transition-colors border-2 rounded-md border-green-400/60 hover:bg-green-400 hover:text-gray-900"
            >
              Sign up free
              <i class="ml-2 text-xs fa fa-arrow-right"></i>
            </router-link>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
const personas = [
  {
    label: "For the multi-project freelancer",
    name: "Maya",
    initials: "M",
    avatarBg: "bg-pink-500",
    title: "Four clients, one matrix, clean invoices.",
    description:
      "Juggling 2-4 clients across Jira projects. Bills hourly, context-switches constantly, and needs time logs that actually match the work.",
    features: [
      "Two-way Jira + Tempo sync",
      "Schedule and filter by client tag",
      "Per-tag standup for weekly client updates",
    ],
  },
  {
    label: "For the remote IC on a distributed team",
    name: "Arun",
    initials: "A",
    avatarBg: "bg-blue-500",
    title: "Async standups written while you focus.",
    description:
      "Works in 2-week sprints across time zones. Needs to defend focus time and post a Slack standup before the team comes online.",
    features: [
      "Pomodoro + time tracking in one timer",
      "Auto-generated standup from yesterday's work",
      "Weekly metrics you can actually show your lead",
    ],
  },
  {
    label: "For the indie hacker / solo founder",
    name: "Sam",
    initials: "S",
    avatarBg: "bg-yellow-500",
    title: "No team. No status meetings. Just shipping.",
    description:
      "Technical founder working nights and weekends (or full-time solo). Needs to decide what matters today and keep momentum over months.",
    features: [
      "Eisenhower matrix to cut the noise",
      "Daily streaks that reward showing up",
      "Standup-as-changelog for your public build log",
    ],
  },
];
</script>
