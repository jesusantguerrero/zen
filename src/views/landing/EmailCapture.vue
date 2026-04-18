<template>
  <section class="relative py-20 bg-gray-900">
    <div class="container relative max-w-3xl px-6 mx-auto sm:px-10">
      <div class="p-8 border-2 rounded-md border-green-400/20 bg-gradient-to-br from-green-950/30 to-gray-900 md:p-10">
        <div class="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div class="md:pr-8">
            <span class="inline-block px-3 py-1 text-xs font-bold tracking-wider text-green-400 uppercase border border-green-400 rounded-full">
              Heads-up list
            </span>
            <h2 class="mt-4 text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
              Want to hear when something big ships?
            </h2>
            <p class="mt-3 text-sm text-gray-400">
              Zen ships changes most weeks. Drop your email if you want a short heads-up when Pro
              launches or when something big lands. No weekly digest, no drip campaign, no sales
              follow-ups.
            </p>
          </div>
        </div>

        <form
          v-if="!submitted"
          class="flex flex-col gap-3 mt-6 sm:flex-row"
          @submit.prevent="handleSubmit"
          novalidate
        >
          <label for="email-capture-input" class="sr-only">Email address</label>
          <input
            id="email-capture-input"
            v-model="email"
            type="email"
            required
            :disabled="loading"
            autocomplete="email"
            placeholder="you@example.com"
            class="flex-1 h-10 px-4 text-sm text-white placeholder-gray-500 transition-colors bg-gray-900 border-2 rounded-md border-white/20 focus:border-green-400 focus:outline-none disabled:opacity-60"
            aria-describedby="email-capture-hint"
          />
          <button
            type="submit"
            :disabled="loading || !email"
            class="inline-flex items-center justify-center h-10 px-5 text-sm font-bold text-white transition-colors bg-green-400 rounded-md hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <i v-if="loading" class="mr-2 fa fa-spinner fa-spin" aria-hidden="true"></i>
            {{ loading ? "Saving..." : "Notify me" }}
          </button>
        </form>

        <p
          v-if="error"
          class="mt-3 text-sm text-red-300"
          role="alert"
        >
          {{ error }}
        </p>

        <div
          v-if="submitted"
          class="flex flex-col items-start gap-3 mt-6 sm:flex-row sm:items-center sm:justify-between"
          role="status"
          aria-live="polite"
        >
          <p class="text-sm text-green-300">
            <i class="mr-2 fa fa-check-circle" aria-hidden="true"></i>
            You're on the list. We'll only email when it's worth it.
          </p>
          <button
            type="button"
            class="text-xs font-bold text-gray-400 underline hover:text-green-400"
            @click="reset"
          >
            Add another email
          </button>
        </div>

        <p id="email-capture-hint" class="mt-4 text-xs text-gray-500">
          Single-opt-in. Unsubscribe link in every email. We don't share this with anyone.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { db, registerEvent } from "@/plugins/useFirebase";
import firebase from "firebase/app";

const email = ref("");
const loading = ref(false);
const submitted = ref(false);
const error = ref("");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const handleSubmit = async () => {
  error.value = "";
  const value = email.value.trim().toLowerCase();
  if (!EMAIL_RE.test(value) || value.length > 200) {
    error.value = "That doesn't look like a valid email.";
    return;
  }
  loading.value = true;
  try {
    // Create-only endpoint — each submission writes a new doc.
    // Firestore rules enforce the payload shape (see firestore.rules).
    // De-duplication happens server-side later (a scheduled function can
    // collapse rows by email); the UI treats resubmits as success.
    await db.collection("newsletter_signups").add({
      email: value,
      source: "landing",
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
    });
    registerEvent?.("newsletter_signup", { source: "landing" });
    submitted.value = true;
    email.value = "";
  } catch (err) {
    console.error("newsletter signup failed", err);
    error.value = "Something went wrong. Try again in a moment, or open an issue on GitHub.";
  } finally {
    loading.value = false;
  }
};

const reset = () => {
  submitted.value = false;
  error.value = "";
};
</script>
