<script setup>
import { ref } from "vue";
import NormalWave from "./waves/normal-wave.vue";
import { db, registerEvent } from "@/plugins/useFirebase";
import firebase from "firebase/app";

const footerSections = {
    product: {
        label: "Product",
        links: {
            "Features": "/#features",
            "Use cases": "/#use-cases",
            "Compare": "/#compare",
            "FAQ": "/#faq",
            "Pricing": "/pricing"
        }
    },
    community: {
        label: "Community",
        links: {
            "GitHub": "https://github.com/jesusantguerrero/zen",
            "Report an issue": "https://github.com/jesusantguerrero/zen/issues",
            "Twitter": "https://twitter.com/zenboard_app",
            "Blog": "/blog"
        }
    },
    company: {
        label: "Company",
        links: {
            "About": "/about",
            "Support": "/support",
            "Security": "/security",
            "Status": "/status"
        }
    },
    legal: {
        label: "Legal",
        links: {
            "Privacy Policy": "/privacy-policy",
            "Terms of service": "/terms"
        }
    }
}

const getRouterComponent = (link) => {
    if (link.startsWith("http")) {
        return "a"
    } else if (link.startsWith("/#")) {
        return "a"
    } else {
        return "router-link"
    }
}

// Slim newsletter opt-in moved here from the full-page EmailCapture section.
// Same backend target + Firestore rules; non-intrusive in the footer.
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
    await db.collection("newsletter_signups").add({
      email: value,
      source: "footer",
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
    });
    registerEvent?.("newsletter_signup", { source: "footer" });
    submitted.value = true;
    email.value = "";
  } catch (err) {
    console.error("newsletter signup failed", err);
    error.value = "Something went wrong. Try again in a moment.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
    <section className="text-gray-700 bg-gray-900 body-font relative px-10 md:px-0">
        <NormalWave />
        <div class="relative max-w-7xl mx-auto pt-24">
            <!-- Slim subscribe strip -->
            <div class="flex flex-col items-start gap-4 pb-10 mb-8 border-b md:flex-row md:items-center md:justify-between border-white/10">
                <div class="md:pr-8">
                    <p class="text-sm font-bold text-white">
                        Heads-up when Pro launches
                    </p>
                    <p class="mt-1 text-xs text-gray-400">
                        No weekly digest. Just a short note when something big ships.
                    </p>
                </div>
                <form
                    v-if="!submitted"
                    class="flex w-full gap-2 md:w-auto"
                    @submit.prevent="handleSubmit"
                    novalidate
                >
                    <label for="footer-email" class="sr-only">Email address</label>
                    <input
                        id="footer-email"
                        v-model="email"
                        type="email"
                        required
                        :disabled="loading"
                        autocomplete="email"
                        placeholder="you@example.com"
                        class="flex-1 h-10 px-3 text-sm text-white placeholder-gray-500 bg-gray-800 border-2 rounded-md md:w-64 border-white/20 focus:border-green-400 focus:outline-none disabled:opacity-60"
                    />
                    <button
                        type="submit"
                        :disabled="loading || !email"
                        class="inline-flex items-center justify-center h-10 px-4 text-sm font-bold text-white transition-colors bg-green-400 rounded-md hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <i v-if="loading" class="mr-2 fa fa-spinner fa-spin" aria-hidden="true"></i>
                        {{ loading ? "…" : "Notify me" }}
                    </button>
                </form>
                <p
                    v-else
                    class="text-sm text-green-300"
                    role="status"
                    aria-live="polite"
                >
                    <i class="mr-2 fa fa-check-circle"></i>
                    You're on the list.
                </p>
            </div>
            <p v-if="error" class="mb-4 text-xs text-red-300" role="alert">{{ error }}</p>

            <div class="grid grid-cols-2 gap-8 pb-8 md:grid-cols-4">
                <div className="text-white" v-for="section in footerSections" :key="section.label">
                    <h4 className="font-bold text-left text-sm tracking-wider uppercase text-gray-400"> {{ section.label }} </h4>
                    <ul className="mt-4 space-y-2 text-left">
                        <li v-for="(link, linkName) in section.links" :key="linkName" class="text-white text-sm">
                            <component :href="link" :to="link" :is="getRouterComponent(link)" class="hover:text-green-400 transition-colors" :target="link.startsWith('http') ? '_blank' : null" :rel="link.startsWith('http') ? 'noopener' : null">
                                {{ linkName }}
                            </component>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
</template>
