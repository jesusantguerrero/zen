<template>
  <section class="relative py-24 bg-gray-900">
    <div class="container relative px-6 mx-auto sm:px-10 md:px-16 lg:px-20 max-w-4xl">
      <div class="text-center">
        <span class="inline-block px-3 py-1 text-xs font-bold tracking-wider text-green-400 uppercase border border-green-400 rounded-full">
          FAQ
        </span>
        <h2 class="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          Honest answers to the obvious questions
        </h2>
        <p class="mt-4 text-base text-gray-400">
          If you're still on the fence, this is probably why.
        </p>
      </div>

      <ul class="mt-12 space-y-3">
        <li
          v-for="(item, index) in faqs"
          :key="item.q"
          class="overflow-hidden border-2 rounded-md border-white/10 bg-gray-800/40 hover:border-green-400/40 transition-colors"
        >
          <button
            type="button"
            class="flex items-center justify-between w-full px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
            :aria-expanded="openIndex === index"
            :aria-controls="`faq-panel-${index}`"
            @click="toggle(index)"
          >
            <span class="pr-4 text-base font-bold text-white">{{ item.q }}</span>
            <span
              class="flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-400 transition-transform duration-200 rounded-full bg-green-400/10"
              :class="{ 'rotate-180': openIndex === index }"
              aria-hidden="true"
            >
              <i class="text-xs fa fa-chevron-down"></i>
            </span>
          </button>
          <div
            v-if="openIndex === index"
            :id="`faq-panel-${index}`"
            class="px-5 pb-5 -mt-1 text-sm leading-relaxed text-gray-300"
          >
            <p v-html="item.a"></p>
          </div>
        </li>
      </ul>

      <div class="mt-12 text-center">
        <p class="text-sm text-gray-400">
          Still have a question?
          <a
            href="https://github.com/jesusantguerrero/zen/issues"
            target="_blank"
            rel="noopener"
            class="font-bold text-green-400 hover:text-green-300"
          >
            Open an issue on GitHub
          </a>
          - answers go back into the docs.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

const openIndex = ref(0);
const toggle = (index) => {
  openIndex.value = openIndex.value === index ? -1 : index;
};

const faqs = [
  {
    q: "Isn't this just another todo app?",
    a: "Not really. Todo apps give you a flat list; Zen gives you a decision framework (the Eisenhower Matrix), a focus timer, a time log, and a developer standup - in one loop. If you only need a checklist, Todoist is cheaper and simpler. If you want to run the Plan -> Decide -> Work -> Standup loop without five tabs, that's what Zen is for.",
  },
  {
    q: "Does it work offline?",
    a: "Honestly: not fully yet. Zen runs on Firestore with real-time sync, so brief drops are fine, but a full PWA / offline mode is on the roadmap. If offline-first is a hard requirement today, this probably isn't the right tool yet.",
  },
  {
    q: "Can I use it with my team?",
    a: "Zen is single-player by design. There's no shared workspace, assignees, or permissions - and that's the whole point. If you need team collaboration, try something like <a href='https://getsunday.app' target='_blank' rel='noopener' class='text-green-400 underline'>Sunday</a> or Linear. Zen stays focused on the individual contributor loop.",
  },
  {
    q: "What happens to my data?",
    a: "Your tasks and tracks live in Firebase Firestore scoped to your account. You own them. CSV export is built in for tracks, and task export is planned. No data is sold, no ads, no analytics-on-your-tasks nonsense.",
  },
  {
    q: "Is it free?",
    a: "Yes, the core app is free right now - matrix, pomodoro, tracking, standup, metrics, integrations. A Pro tier is planned later for advanced automation and longer history retention, but the daily-driver features stay free.",
  },
  {
    q: "What's the difference from Todoist or Notion?",
    a: "Todoist is a best-in-class todo list. Notion is a blank-page wiki. Neither ship a built-in Eisenhower Matrix, Pomodoro, time tracker, and auto-generated standup in one flow. Zen is opinionated about the developer workflow; they're general-purpose.",
  },
  {
    q: "Can I use it without Jira?",
    a: "Absolutely. Jira and GitHub integrations are optional. Most users start fully standalone - add tasks manually, run the matrix and pomodoro, log time. Hook up integrations later if/when you need them.",
  },
  {
    q: "Is it open source?",
    a: "Yes - MIT licensed. <a href='https://github.com/jesusantguerrero/zen' target='_blank' rel='noopener' class='text-green-400 underline'>Code is on GitHub</a>. Issues, PRs, and roadmap suggestions are all welcome.",
  },
];
</script>
