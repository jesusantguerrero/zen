<template>
  <div>
    <div class="px-10 bg-secondary md:px-0">
      <site-header class="w-full mb-10" />
    </div>

    <main class="w-full max-w-4xl px-6 pb-20 mx-auto text-white bg-secondary md:px-10">
      <article class="py-12">
        <header class="mb-10">
          <p class="inline-block px-3 py-1 text-xs font-bold tracking-wider text-green-400 uppercase border border-green-400 rounded-full">
            About Zen
          </p>
          <h1 class="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Zen is the productivity app I wanted for myself.
          </h1>
          <p class="mt-4 text-base text-gray-300">
            Hi, I'm Jesus Guerrero. I'm a full-stack developer, and Zen started as the side
            project I kept reaching for instead of the five tools I already paid for.
          </p>
        </header>

        <section class="space-y-5 text-base leading-relaxed text-gray-200">
          <p>
            I kept running the same loop every workday - open Jira, decide what to do today, start
            a Pomodoro, forget to log the time, and scramble to write a standup. The tools for each
            step exist and most of them are excellent. The problem is they don't talk to each
            other, so the glue is you, every single morning.
          </p>
          <p>
            Zen is the glue. The Eisenhower Matrix picks what matters, a built-in Pomodoro runs
            the focus block and logs the time in the same click, and a standup generator turns
            yesterday's tracks into today's update. One tab, not five.
          </p>

          <h2 class="pt-4 text-xl font-bold text-white">What Zen is not</h2>
          <p>
            Zen is not a team tool. There's no shared workspace, assignees, or permissions
            and there won't be - if you need team collaboration, try
            <a href="https://getsunday.app" target="_blank" rel="noopener" class="text-green-400 underline hover:text-green-300">Sunday</a>
            or Linear. Zen is also not a blank-page wiki or a general-purpose todo list. If you
            just need checkboxes, Todoist is better and cheaper.
          </p>
          <p>
            Zen is opinionated on purpose. It picks a specific workflow - Plan, Decide, Work,
            Standup - and optimizes hard for that one thing, for one person.
          </p>

          <h2 class="pt-4 text-xl font-bold text-white">Indie-built, open source</h2>
          <p>
            Zen is MIT-licensed and built in public. No VC funding, no growth-hack playbook, no
            "productivity revolution" rhetoric. I use it every day, I'd like you to too, and the
            roadmap is whatever makes the daily loop better. Issues and PRs are welcome at
            <a href="https://github.com/jesusantguerrero/zen" target="_blank" rel="noopener" class="text-green-400 underline hover:text-green-300">github.com/jesusantguerrero/zen</a>.
          </p>
        </section>

        <aside class="p-6 mt-12 border-2 rounded-md border-green-400/30 bg-green-950/20">
          <h3 class="text-lg font-bold text-white">
            <i class="mr-2 text-green-400 fa fa-code-branch" aria-hidden="true"></i>
            Currently building
          </h3>
          <p class="mt-2 text-sm text-gray-300">
            I track every cycle in public on GitHub. The current roadmap, shipped features, and
            open issues all live there.
          </p>
          <ul class="mt-4 space-y-2">
            <li class="flex items-start text-sm text-gray-200">
              <i class="mt-1 mr-2 text-xs text-green-400 fa fa-check" aria-hidden="true"></i>
              <span>Foundation cycle - security hardening, onboarding, metrics rebuild, PWA + mobile. Shipped.</span>
            </li>
            <li class="flex items-start text-sm text-gray-200">
              <i class="mt-1 mr-2 text-xs text-green-400 fa fa-circle-notch fa-spin" aria-hidden="true"></i>
              <span>Landing + go-to-market - comparison story, honest testimonials, SEO, a real demo video.</span>
            </li>
            <li class="flex items-start text-sm text-gray-200">
              <i class="mt-1 mr-2 text-xs text-gray-400 fa fa-hourglass-half" aria-hidden="true"></i>
              <span>Next cycle - Pro tier, account-level integrations admin, richer standup templates.</span>
            </li>
          </ul>
          <div class="flex flex-wrap gap-3 mt-6">
            <a
              href="https://github.com/jesusantguerrero/zen"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center h-10 px-4 text-sm font-bold text-white transition-colors border-2 rounded-md border-white/20 hover:border-green-400 bg-gray-900"
            >
              <i class="mr-2 fa fa-github" aria-hidden="true"></i>
              See the repo
            </a>
            <router-link
              to="/blog"
              class="inline-flex items-center h-10 px-4 text-sm font-bold text-white transition-colors border-2 rounded-md border-white/20 hover:border-green-400"
            >
              Read the blog
            </router-link>
          </div>
        </aside>

        <footer class="mt-12 text-sm text-gray-400">
          <p>
            Built by
            <a href="https://jesusantguerrero.com" target="_blank" rel="noopener" class="text-green-400 underline hover:text-green-300">Jesus Guerrero</a>
            - {{ appVersion }} - MIT licensed.
          </p>
          <p class="mt-2">
            Feedback, questions, or war stories:
            <a href="https://github.com/jesusantguerrero/zen/issues" target="_blank" rel="noopener" class="text-green-400 underline hover:text-green-300">open an issue on GitHub</a>
            or
            <router-link to="/support" class="text-green-400 underline hover:text-green-300">head to support</router-link>.
          </p>
        </footer>
      </article>
    </main>

    <footer-section />
    <site-footer />
  </div>
</template>

<script setup>
import FooterSection from "./landing/Footer.vue";
import SiteFooter from "./landing/SiteFooter.vue";
import SiteHeader from "./landing/SiteHeader.vue";

const appVersion = "v2.1";
</script>
