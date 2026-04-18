<template>
  <div>
    <hero-section></hero-section>
    <learn-more />
    <features-section id="features"></features-section>
    <use-cases id="use-cases" />
    <comparison-table id="compare" />
    <social-proof id="community" />
    <landing-faq id="faq" />

    <section class="relative py-20 bg-white">
      <div class="container relative max-w-3xl px-6 mx-auto text-center sm:px-10">
        <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Stop deciding. Start shipping.
        </h2>
        <p class="mt-4 text-base text-gray-500">
          Free forever for the daily-driver features. Import your projects in under a minute — no credit card, no team seat dance.
        </p>
        <div class="flex flex-col items-center justify-center gap-3 mt-8 sm:flex-row">
          <router-link
            to="/register"
            class="inline-flex items-center justify-center w-full h-12 px-6 font-bold text-white transition-colors bg-green-400 rounded-md sm:w-auto hover:bg-green-500"
          >
            Plan my first day
            <i class="ml-2 text-xs fa fa-arrow-right" aria-hidden="true"></i>
          </router-link>
          <a
            href="https://github.com/jesusantguerrero/zen"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center justify-center w-full h-12 px-6 text-sm font-bold text-gray-700 transition-colors border-2 border-gray-300 rounded-md sm:w-auto hover:border-green-400 hover:text-green-500"
          >
            <i class="mr-2 fa fa-github" aria-hidden="true"></i>
            View on GitHub
          </a>
        </div>
      </div>
    </section>

    <footer-section />
    <site-footer />
  </div>
</template>

<script setup>
import HeroSection from "./Hero.vue";
import FeaturesSection from "./Features.vue";
import FooterSection from "./Footer.vue";
import SiteFooter from "./SiteFooter.vue";
import LearnMore from "./LearnMore.vue";
import UseCases from "./UseCases.vue";
import ComparisonTable from "./ComparisonTable.vue";
import SocialProof from "./SocialProof.vue";
import LandingFaq from "./LandingFaq.vue";
</script>

<style lang="scss">
.bg-secondary {
  background: linear-gradient(to left bottom, #3a4a73 0, #1b243f);
  color: white;

  .prose h3 {
    color: white !important;
    margin-bottom: 10px;
  }
}

.bg-primary {
  background: #3a4a73;
}

.btn-action {
  @apply bg-green-400 flex items-center justify-center;
  color: white;
  border: none;
  margin: 10px 0;
  transition: all ease 0.3s;
  height: 40px;

  &:hover {
    @apply bg-green-500;
  }
}

html {
  scroll-behavior: smooth;
}
</style>
