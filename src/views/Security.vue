<template>
  <div>
    <div class="px-10 bg-secondary md:px-0">
      <site-header class="w-full mb-10" />
    </div>

    <main class="w-full max-w-4xl px-6 pb-20 mx-auto text-white bg-secondary md:px-10">
      <article class="py-12">
        <header class="mb-10">
          <p class="inline-block px-3 py-1 text-xs font-bold tracking-wider text-green-400 uppercase border border-green-400 rounded-full">
            Security &amp; data
          </p>
          <h1 class="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Where your data lives, in plain English
          </h1>
          <p class="mt-4 text-base text-gray-300">
            This page is the honest version. No "enterprise-grade encryption" marketing - just
            what's actually stored, where it runs, and who can see it.
          </p>
        </header>

        <section class="space-y-10">
          <div>
            <h2 class="text-xl font-bold text-white">
              <i class="mr-2 text-green-400 fa fa-database" aria-hidden="true"></i>
              Where data lives
            </h2>
            <p class="mt-2 text-sm leading-relaxed text-gray-300">
              Zen runs on Google Firebase. Your tasks, tracks, and settings live in Cloud
              Firestore in the <code class="px-1 py-0.5 text-xs bg-gray-800 rounded">us-central1</code>
              region. Authentication is handled by Firebase Auth. The web app is served by Vercel.
              Cloud Functions (for Jira sync, email digests, etc.) run in Firebase Functions.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-white">
              <i class="mr-2 text-green-400 fa fa-file-alt" aria-hidden="true"></i>
              What we store
            </h2>
            <ul class="mt-3 space-y-2 text-sm text-gray-300">
              <li class="flex items-start">
                <i class="mt-1 mr-2 text-xs text-green-400 fa fa-check" aria-hidden="true"></i>
                <span><strong class="text-white">Tasks</strong> - title, due date, matrix quadrant, tags, checklist, project.</span>
              </li>
              <li class="flex items-start">
                <i class="mt-1 mr-2 text-xs text-green-400 fa fa-check" aria-hidden="true"></i>
                <span><strong class="text-white">Tracks</strong> - start time, end time, linked task, labels, billable flag.</span>
              </li>
              <li class="flex items-start">
                <i class="mt-1 mr-2 text-xs text-green-400 fa fa-check" aria-hidden="true"></i>
                <span><strong class="text-white">Settings</strong> - Pomodoro length, timezone, notification prefs.</span>
              </li>
              <li class="flex items-start">
                <i class="mt-1 mr-2 text-xs text-green-400 fa fa-check" aria-hidden="true"></i>
                <span><strong class="text-white">OAuth tokens</strong> for Jira, GitHub, and Google - stored only if you connect an integration. Encrypted at rest by Firebase.</span>
              </li>
              <li class="flex items-start">
                <i class="mt-1 mr-2 text-xs text-green-400 fa fa-check" aria-hidden="true"></i>
                <span><strong class="text-white">Account basics</strong> - email, display name, OAuth provider info.</span>
              </li>
            </ul>
            <p class="mt-3 text-xs text-gray-500">
              All of the above is stored in plain text for the owner - that's intentional so the
              app can filter, sort, and search. It is scoped to your user account and inaccessible
              to anyone else by Firestore rules (see below).
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-white">
              <i class="mr-2 text-green-400 fa fa-ban" aria-hidden="true"></i>
              What we don't store
            </h2>
            <ul class="mt-3 space-y-2 text-sm text-gray-300">
              <li class="flex items-start">
                <i class="mt-1 mr-2 text-xs text-red-300 fa fa-times" aria-hidden="true"></i>
                <span>No analytics on the contents of your tasks or tracks. Task titles never leave your account.</span>
              </li>
              <li class="flex items-start">
                <i class="mt-1 mr-2 text-xs text-red-300 fa fa-times" aria-hidden="true"></i>
                <span>No third-party advertising SDKs, no tracking pixels, no ad cookies.</span>
              </li>
              <li class="flex items-start">
                <i class="mt-1 mr-2 text-xs text-red-300 fa fa-times" aria-hidden="true"></i>
                <span>We don't sell data. There's no data to sell, and the business model is paid subscriptions, not ads.</span>
              </li>
              <li class="flex items-start">
                <i class="mt-1 mr-2 text-xs text-red-300 fa fa-times" aria-hidden="true"></i>
                <span>No cross-account sharing except public standup snapshots (only when you explicitly share one).</span>
              </li>
            </ul>
            <p class="mt-3 text-xs text-gray-500">
              Firebase Analytics does collect basic product metrics (page views, feature usage) -
              those are about the app, never the content inside it.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-white">
              <i class="mr-2 text-green-400 fa fa-lock" aria-hidden="true"></i>
              Who can access your data
            </h2>
            <p class="mt-2 text-sm leading-relaxed text-gray-300">
              Only you. Firestore security rules enforce this at the database layer - every query
              checks that <code class="px-1 py-0.5 text-xs bg-gray-800 rounded">user_uid</code>
              on the document matches the authenticated user. The rules are open source and live
              in
              <a href="https://github.com/jesusantguerrero/zen/blob/master/firestore.rules" target="_blank" rel="noopener" class="text-green-400 underline hover:text-green-300">firestore.rules</a>.
            </p>
            <p class="mt-2 text-sm leading-relaxed text-gray-300">
              The single exception is admin operations (billing, abuse review) which require a
              Firebase custom claim. Admin access is used for support requests you raise, or for
              abuse-of-service enforcement. It is logged.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-white">
              <i class="mr-2 text-green-400 fa fa-plug" aria-hidden="true"></i>
              Integrations (Jira, GitHub, Google)
            </h2>
            <p class="mt-2 text-sm leading-relaxed text-gray-300">
              Integrations are opt-in. When you connect one, an OAuth token is stored in your
              Firestore account (encrypted at rest by Firebase). The token is scoped to the
              minimum permissions needed - issue read/write for Jira and GitHub, calendar for
              Google. You can revoke at any time from the integration provider's settings or from
              Zen's Settings page.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-white">
              <i class="mr-2 text-green-400 fa fa-download" aria-hidden="true"></i>
              Data export &amp; deletion
            </h2>
            <p class="mt-2 text-sm leading-relaxed text-gray-300">
              Every user can export tasks and tracks as CSV or JSON from the Metrics page. Account
              deletion is available in Settings - it wipes tasks, tracks, settings, notifications,
              and integration tokens, and deletes the auth record. There is no retention period
              beyond the deletion request.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-white">
              <i class="mr-2 text-green-400 fa fa-shield-alt" aria-hidden="true"></i>
              Reporting a vulnerability
            </h2>
            <p class="mt-2 text-sm leading-relaxed text-gray-300">
              Found a security issue? Please report it privately rather than filing a public
              issue. Two ways to reach me:
            </p>
            <ul class="mt-3 space-y-2 text-sm text-gray-300">
              <li class="flex items-start">
                <i class="mt-1 mr-2 text-xs text-green-400 fa fa-envelope" aria-hidden="true"></i>
                <span>
                  Email
                  <a href="mailto:security@zenboard.app" class="text-green-400 underline hover:text-green-300">security@zenboard.app</a>
                  (please see the note below)
                </span>
              </li>
              <li class="flex items-start">
                <i class="mt-1 mr-2 text-xs text-green-400 fa fa-github" aria-hidden="true"></i>
                <span>
                  Use
                  <a href="https://github.com/jesusantguerrero/zen/security/advisories/new" target="_blank" rel="noopener" class="text-green-400 underline hover:text-green-300">GitHub's private vulnerability advisory</a>
                  - that's the preferred channel.
                </span>
              </li>
            </ul>
            <p class="mt-3 text-xs text-gray-500">
              I respond to credible reports within 72 hours. No bug bounty yet, but credit in the
              changelog if you'd like it.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-white">
              <i class="mr-2 text-green-400 fa fa-code" aria-hidden="true"></i>
              Open-source transparency
            </h2>
            <p class="mt-2 text-sm leading-relaxed text-gray-300">
              Zen is MIT licensed. Everything above can be verified by reading the source:
              <a href="https://github.com/jesusantguerrero/zen" target="_blank" rel="noopener" class="text-green-400 underline hover:text-green-300">github.com/jesusantguerrero/zen</a>.
              If a claim here contradicts the code, the code wins - please
              <a href="https://github.com/jesusantguerrero/zen/issues" target="_blank" rel="noopener" class="text-green-400 underline hover:text-green-300">open an issue</a>
              and I'll fix one of the two.
            </p>
          </div>
        </section>

        <footer class="pt-10 mt-12 text-sm border-t border-white/10 text-gray-400">
          <p>
            See also:
            <router-link to="/privacy-policy" class="text-green-400 underline hover:text-green-300">Privacy Policy</router-link>
            -
            <router-link to="/terms" class="text-green-400 underline hover:text-green-300">Terms</router-link>
            -
            <router-link to="/status" class="text-green-400 underline hover:text-green-300">Status</router-link>
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
