<template>
  <div>
    <div class="px-10 bg-secondary md:px-0">
      <site-header class="w-full mb-10" />
    </div>

    <main class="w-full max-w-4xl px-6 pb-20 mx-auto text-white bg-secondary md:px-10">
      <article class="py-12">
        <header class="mb-10">
          <p class="inline-block px-3 py-1 text-xs font-bold tracking-wider text-green-400 uppercase border border-green-400 rounded-full">
            Status
          </p>
          <h1 class="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Is Zen up?
          </h1>
          <p class="mt-4 text-base text-gray-300">
            Zen runs on Firebase (auth, database, functions) and Vercel (web app). If either of
            those is having an incident, so are we. This page links you straight to the source of
            truth for both.
          </p>
        </header>

        <section class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <a
            href="https://status.firebase.google.com"
            target="_blank"
            rel="noopener"
            class="flex flex-col p-6 transition-colors border-2 rounded-md border-white/10 bg-gray-900/60 hover:border-green-400"
          >
            <div class="flex items-center space-x-3">
              <span class="flex items-center justify-center w-10 h-10 text-green-400 rounded-full bg-green-400/10" aria-hidden="true">
                <i class="fa fa-fire"></i>
              </span>
              <div>
                <p class="text-xs font-bold tracking-widest text-green-400 uppercase">
                  Firebase status
                </p>
                <p class="text-sm text-gray-400">Auth, Firestore, Functions</p>
              </div>
            </div>
            <p class="mt-4 text-sm text-gray-300">
              Real-time updates from Google on Firebase services. If Firestore is degraded, task
              sync and login will be affected.
            </p>
            <span class="mt-4 text-sm font-bold text-green-400">
              status.firebase.google.com
              <i class="ml-1 text-xs fa fa-external-link-alt" aria-hidden="true"></i>
            </span>
          </a>

          <a
            href="https://www.vercel-status.com/"
            target="_blank"
            rel="noopener"
            class="flex flex-col p-6 transition-colors border-2 rounded-md border-white/10 bg-gray-900/60 hover:border-green-400"
          >
            <div class="flex items-center space-x-3">
              <span class="flex items-center justify-center w-10 h-10 text-green-400 rounded-full bg-green-400/10" aria-hidden="true">
                <i class="fa fa-bolt"></i>
              </span>
              <div>
                <p class="text-xs font-bold tracking-widest text-green-400 uppercase">
                  Vercel status
                </p>
                <p class="text-sm text-gray-400">Web app + CDN</p>
              </div>
            </div>
            <p class="mt-4 text-sm text-gray-300">
              If you can't load zen.vercel.app at all, check here first. Partial outages usually
              mean a specific region.
            </p>
            <span class="mt-4 text-sm font-bold text-green-400">
              vercel-status.com
              <i class="ml-1 text-xs fa fa-external-link-alt" aria-hidden="true"></i>
            </span>
          </a>
        </section>

        <section class="p-6 mt-10 border-2 rounded-md border-white/10 bg-gray-900/60">
          <h2 class="text-lg font-bold text-white">
            <i class="mr-2 text-yellow-300 fa fa-info-circle" aria-hidden="true"></i>
            What this page doesn't do yet
          </h2>
          <p class="mt-2 text-sm text-gray-300">
            Zen doesn't run its own synthetic uptime checks yet. A proper status dashboard - real
            response-time graphs, incident history, component-level status - is on the roadmap.
            For now, the links above cover 99% of real incidents because if Firebase or Vercel is
            down, so is Zen.
          </p>
          <p class="mt-3 text-sm text-gray-300">
            If you're seeing something that looks like a Zen-specific issue (not an upstream
            incident), please
            <a href="https://github.com/jesusantguerrero/zen/issues" target="_blank" rel="noopener" class="text-green-400 underline hover:text-green-300">open an issue</a>
            or
            <router-link to="/support" class="text-green-400 underline hover:text-green-300">contact support</router-link>.
          </p>
        </section>

        <section class="mt-10">
          <h2 class="text-lg font-bold text-white">Known limits</h2>
          <ul class="mt-3 space-y-2 text-sm text-gray-300">
            <li class="flex items-start">
              <i class="mt-1 mr-2 text-xs text-green-400 fa fa-check" aria-hidden="true"></i>
              <span>Firestore offline persistence is enabled - brief network drops won't lose data or interrupt the app.</span>
            </li>
            <li class="flex items-start">
              <i class="mt-1 mr-2 text-xs text-green-400 fa fa-check" aria-hidden="true"></i>
              <span>The app is a PWA - if you've installed it, you can still see already-loaded tasks while Firebase recovers.</span>
            </li>
            <li class="flex items-start">
              <i class="mt-1 mr-2 text-xs text-yellow-300 fa fa-exclamation-triangle" aria-hidden="true"></i>
              <span>Integrations (Jira, GitHub, Google) depend on their provider being up - check their status pages too.</span>
            </li>
          </ul>
        </section>

        <footer class="pt-10 mt-12 text-sm border-t border-white/10 text-gray-400">
          <p>
            Last updated: this page is static. Incident-specific updates go on
            <a href="https://twitter.com/zenboard_app" target="_blank" rel="noopener" class="text-green-400 underline hover:text-green-300">@zenboard_app</a>
            and on the
            <a href="https://github.com/jesusantguerrero/zen" target="_blank" rel="noopener" class="text-green-400 underline hover:text-green-300">GitHub repo</a>.
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
</script>
