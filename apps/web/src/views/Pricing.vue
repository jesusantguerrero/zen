<template>
  <div>
    <div class="px-10 bg-secondary md:px-0">
        <site-header />
    </div>
    <div class="py-64">
        <a href="#!" class="paddle_button" data-product="756082">Buy Now!</a>
    </div>
    <footer-section />
    <site-footer />
  </div>
</template>

<script setup>
import SiteHeader from './landing/SiteHeader.vue';
import FooterSection from "./landing/Footer.vue";
import SiteFooter from "./landing/SiteFooter.vue";
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
