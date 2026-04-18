<template>
  <div>
    <div class="px-10 bg-secondary md:px-0">
      <site-header class="w-full mb-10" />
    </div>

    <main class="w-full max-w-4xl px-6 pb-20 mx-auto text-white bg-secondary md:px-10">
      <article class="py-12">
        <header class="mb-10">
          <p class="inline-block px-3 py-1 text-xs font-bold tracking-wider text-green-400 uppercase border border-green-400 rounded-full">
            Support
          </p>
          <h1 class="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Stuck on something? Let's fix it.
          </h1>
          <p class="mt-4 text-base text-gray-300">
            Zen is built and supported by one person, so the fastest path is usually GitHub - it's
            public, searchable, and other users often have the same question. If it's account- or
            billing-specific, the form below goes straight to my inbox.
          </p>
        </header>

        <section class="mb-12">
          <h2 class="text-xl font-bold text-white">Common questions</h2>
          <div class="mt-4 space-y-3">
            <details
              v-for="item in faqs"
              :key="item.q"
              class="overflow-hidden border-2 rounded-md border-white/10 bg-gray-800/40 hover:border-green-400/40 transition-colors"
            >
              <summary class="flex items-center justify-between px-5 py-4 cursor-pointer list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400">
                <span class="pr-4 text-base font-bold text-white">{{ item.q }}</span>
                <i class="text-xs text-green-400 fa fa-chevron-down" aria-hidden="true"></i>
              </summary>
              <div class="px-5 pb-5 text-sm leading-relaxed text-gray-300">
                <p v-html="item.a"></p>
              </div>
            </details>
          </div>
        </section>

        <section class="grid grid-cols-1 gap-6 mb-12 md:grid-cols-2">
          <a
            href="https://github.com/jesusantguerrero/zen/issues"
            target="_blank"
            rel="noopener"
            class="flex flex-col p-6 border-2 rounded-md border-white/10 bg-gray-900/60 hover:border-green-400 transition-colors"
          >
            <span class="flex items-center justify-center w-10 h-10 text-green-400 rounded-full bg-green-400/10" aria-hidden="true">
              <i class="fa fa-github"></i>
            </span>
            <h3 class="mt-4 text-lg font-bold text-white">Open an issue on GitHub</h3>
            <p class="mt-2 text-sm text-gray-300">
              Best for bugs, feature requests, and integration questions. Public, so other users
              benefit from the answer.
            </p>
            <span class="mt-4 text-sm font-bold text-green-400">
              github.com/jesusantguerrero/zen/issues
              <i class="ml-1 text-xs fa fa-arrow-right" aria-hidden="true"></i>
            </span>
          </a>

          <a
            href="#contact-form"
            class="flex flex-col p-6 border-2 rounded-md border-white/10 bg-gray-900/60 hover:border-green-400 transition-colors"
          >
            <span class="flex items-center justify-center w-10 h-10 text-green-400 rounded-full bg-green-400/10" aria-hidden="true">
              <i class="fa fa-envelope"></i>
            </span>
            <h3 class="mt-4 text-lg font-bold text-white">Send a private message</h3>
            <p class="mt-2 text-sm text-gray-300">
              For account issues, billing questions (once Pro launches), or anything you'd rather
              keep off a public tracker.
            </p>
            <span class="mt-4 text-sm font-bold text-green-400">
              Use the form below
              <i class="ml-1 text-xs fa fa-arrow-down" aria-hidden="true"></i>
            </span>
          </a>
        </section>

        <section id="contact-form" class="p-6 border-2 rounded-md border-green-400/20 bg-green-950/10 md:p-8">
          <h2 class="text-xl font-bold text-white">Contact form</h2>
          <p class="mt-2 text-sm text-gray-300">
            Fires straight to the support queue. Please include the email you sign in with so we
            can look up your account.
          </p>

          <form
            v-if="!submitted"
            class="mt-6 space-y-4"
            @submit.prevent="handleSubmit"
            novalidate
          >
            <div>
              <label for="support-email" class="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                Email
              </label>
              <input
                id="support-email"
                v-model="form.email"
                type="email"
                required
                autocomplete="email"
                :disabled="loading"
                placeholder="you@example.com"
                class="w-full h-10 px-4 mt-1 text-sm text-white placeholder-gray-500 transition-colors bg-gray-900 border-2 rounded-md border-white/20 focus:border-green-400 focus:outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label for="support-subject" class="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                Subject
              </label>
              <input
                id="support-subject"
                v-model="form.subject"
                type="text"
                required
                :disabled="loading"
                placeholder="Short summary"
                maxlength="200"
                class="w-full h-10 px-4 mt-1 text-sm text-white placeholder-gray-500 transition-colors bg-gray-900 border-2 rounded-md border-white/20 focus:border-green-400 focus:outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label for="support-message" class="block text-xs font-bold tracking-wider text-gray-400 uppercase">
                What's going on?
              </label>
              <textarea
                id="support-message"
                v-model="form.message"
                required
                :disabled="loading"
                rows="6"
                maxlength="5000"
                placeholder="Steps to reproduce, what you expected, what happened. The more detail, the faster I can help."
                class="w-full px-4 py-3 mt-1 text-sm text-white placeholder-gray-500 transition-colors bg-gray-900 border-2 rounded-md border-white/20 focus:border-green-400 focus:outline-none disabled:opacity-60"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">
                {{ form.message.length }} / 5000
              </p>
            </div>

            <div class="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-xs text-gray-500">
                We reply within 2 business days. Usually much faster.
              </p>
              <button
                type="submit"
                :disabled="loading || !formValid"
                class="inline-flex items-center justify-center h-10 px-5 text-sm font-bold text-white transition-colors bg-green-400 rounded-md hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <i v-if="loading" class="mr-2 fa fa-spinner fa-spin" aria-hidden="true"></i>
                {{ loading ? "Sending..." : "Send message" }}
              </button>
            </div>

            <p v-if="error" class="text-sm text-red-300" role="alert">{{ error }}</p>
          </form>

          <div
            v-else
            class="mt-6"
            role="status"
            aria-live="polite"
          >
            <p class="flex items-center text-sm text-green-300">
              <i class="mr-2 fa fa-check-circle" aria-hidden="true"></i>
              Got it - your message is in the queue. I'll reply to
              <strong class="mx-1 text-white">{{ lastEmail }}</strong>
              as soon as I can.
            </p>
            <button
              type="button"
              class="mt-4 text-xs font-bold text-gray-400 underline hover:text-green-400"
              @click="reset"
            >
              Send another message
            </button>
          </div>
        </section>

        <footer class="pt-10 mt-12 text-sm border-t border-white/10 text-gray-400">
          <p>
            Prefer GitHub?
            <a href="https://github.com/jesusantguerrero/zen/issues" target="_blank" rel="noopener" class="text-green-400 underline hover:text-green-300">
              Open an issue
            </a>
            . Looking for security?
            <router-link to="/security" class="text-green-400 underline hover:text-green-300">
              /security
            </router-link>.
          </p>
        </footer>
      </article>
    </main>

    <footer-section />
    <site-footer />
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { db, firebaseState, registerEvent } from "@/plugins/useFirebase";
import firebase from "firebase/app";
import FooterSection from "./landing/Footer.vue";
import SiteFooter from "./landing/SiteFooter.vue";
import SiteHeader from "./landing/SiteHeader.vue";

const form = reactive({
  email: "",
  subject: "",
  message: "",
});
const loading = ref(false);
const submitted = ref(false);
const error = ref("");
const lastEmail = ref("");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formValid = computed(() => {
  return (
    EMAIL_RE.test(form.email.trim()) &&
    form.subject.trim().length > 0 &&
    form.subject.trim().length <= 200 &&
    form.message.trim().length > 0 &&
    form.message.trim().length <= 5000
  );
});

const faqs = [
  {
    q: "I think I lost my tasks / tracks. How do I get them back?",
    a: "First, make sure you're signed in with the same provider (email, Google, or GitHub) you used originally - Zen scopes all data to your Firebase auth UID, so a different login looks like a fresh account. If that's not it, the data is almost certainly still there - send a message below with your sign-in email and I'll check.",
  },
  {
    q: "I can't sign in.",
    a: "Common causes: a different auth provider than you registered with (Google vs email vs GitHub create separate accounts), a typo in the email, or a browser blocking the Firebase auth popup. Try a password reset first, then an incognito window. If both fail, message below.",
  },
  {
    q: "Payment / Pro questions",
    a: "Pro hasn't launched yet - the core app is free today. When Pro ships, billing will go through a standard payment provider with receipts and self-serve cancellation. If you're asking about an existing subscription on another service, check your provider's dashboard or email support below.",
  },
  {
    q: "An integration is broken (Jira / GitHub / Google)",
    a: "OAuth tokens expire or get revoked on the provider side. Try disconnecting the integration in Settings and reconnecting it. If the problem repeats, <a href='https://github.com/jesusantguerrero/zen/issues' target='_blank' rel='noopener' class='text-green-400 underline'>open an issue</a> with the provider name and the error you see.",
  },
];

const handleSubmit = async () => {
  error.value = "";
  if (!formValid.value) {
    error.value = "Email, subject, and message are all required.";
    return;
  }
  loading.value = true;
  try {
    const payload = {
      email: form.email.trim().toLowerCase(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      status: "open",
    };
    // Attach user_uid when authed so we can match against the account.
    if (firebaseState.user?.uid) {
      payload.user_uid = firebaseState.user.uid;
    }
    await db.collection("support_tickets").add(payload);
    registerEvent?.("support_ticket_submitted", { has_account: Boolean(firebaseState.user?.uid) });
    lastEmail.value = payload.email;
    submitted.value = true;
    form.email = "";
    form.subject = "";
    form.message = "";
  } catch (err) {
    console.error("support ticket failed", err);
    error.value = "Couldn't submit the form. Please try again, or open a GitHub issue if this persists.";
  } finally {
    loading.value = false;
  }
};

const reset = () => {
  submitted.value = false;
  error.value = "";
};
</script>
