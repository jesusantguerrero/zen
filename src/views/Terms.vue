<template>
    <div class="px-10 bg-secondary md:px-0">
        <site-header class="w-full mb-10"/>
    </div>
    <main class="w-full px-10 pb-20 mx-auto prose-sm prose text-left max-w-7xl md:prose-md lg:prose-lg">
        <privacy-policy class="w-full" />
    </main>
    <SiteFooter />
</template>

<script setup>
import PrivacyPolicy from "./copies/Terms.md"
import SiteFooter from "./landing/SiteFooter.vue";
import SiteHeader from "./landing/SiteHeader.vue";
</script>

