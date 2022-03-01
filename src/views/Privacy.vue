<template>
    <div class="bg-white">
        <div class="px-10 bg-secondary md:px-0">
            <site-header class="w-full mb-10"/>
        </div>
        <main class="w-full px-10 pb-20 mx-auto prose-sm prose text-left bg-white max-w-7xl md:prose-md lg:prose-lg">
            <privacy-policy class="w-full" />
        </main>
    </div>
    <footer-section />
    <SiteFooter />
</template>

<script setup>
import PrivacyPolicy from "./copies/Privacy.md"
import FooterSection from "./landing/Footer.vue";
import SiteFooter from "./landing/SiteFooter.vue";
import SiteHeader from "./landing/SiteHeader.vue";
</script>

