<template>
  <div>
    <hero-section></hero-section>
    <learn-more />
    <features-section class="bg-secondary" id="features"></features-section>
    <div class="flex flex-col items-center py-24 bg-white">
      <h2 class="text-4xl font-bold text-green-400">Try Zen for free.</h2>
      
      <div class="mt-5">
        <router-link
          to="/register"
          class="block w-64 px-5 font-bold border-0 rounded-md btn btn-action"
        >
          Organize your daily routine
        </router-link>
      </div>
    </div>
    <footer-section />
    <site-footer />
  </div>
</template>

<script setup>
import HeroSection from "./Hero.vue";
import ContentSection from "./Content.vue";
import ContentVideoSection from "./ContentVideo.vue";
import FeaturesSection from "./Features.vue";
import FooterSection from "./Footer.vue";
import SiteFooter from "./SiteFooter.vue";
import LearnMore from "./LearnMore.vue";
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
