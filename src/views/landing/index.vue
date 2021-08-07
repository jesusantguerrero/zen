<template>
<div>
  <hero-section></hero-section>
  <content-section></content-section>
  <features-section class="bg-secondary"></features-section>
  <!-- <content-video-section></content-video-section> -->
  <site-footer></site-footer>
</div>
</template>

<script setup>
import HeroSection from "./Hero.vue"
import ContentSection from "./Content.vue"
import ContentVideoSection from "./ContentVideo.vue"
import FeaturesSection from "./Features.vue"
import FooterSection from "./Footer.vue"
import SiteFooter from "./SiteFooter.vue"

</script>

<style lang="scss">
.bg-secondary {
 background: linear-gradient(to left bottom,#3a4a73 0,#1b243f);
 color: white;
 
 .prose h3 {
   color: white !important;
   margin-bottom: 10px;
 }
}

.bg-primary {
 background: #3a4a73;
}
</style>