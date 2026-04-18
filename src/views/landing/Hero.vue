<template>
    <router-link
        :to="{ name: 'blogPost', params: { slug: 'zen-2-0' } }"
        class="flex items-center px-2 py-3 text-xs font-bold transition cursor-pointer bg-white border-b md:px-14 text-gray-600 hover:text-green-500"
    >
        <span class="px-2 py-1 mr-3 text-white bg-green-400 rounded-md">New · v2.0</span>
        <span class="md:text-sm">
            Zen 2.0 is out — decision engine for devs running 5+ projects
        </span>
        <i class="ml-2 text-xs fa fa-chevron-right"></i>
    </router-link>
    <header class="relative w-full px-6 pb-8 antialiased bg-gray-900 select-none md:pb-0 md:px-0">
        <site-header />

        <div class="relative z-50 py-10 mx-auto max-w-7xl md:items-center md:pt-24 md:pb-20 sm:px-4 md:flex md:justify-between md:gap-10">
            <div class="w-full md:w-6/12 text-left">
                <h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.05]">
                    <span class="block">5 projects.</span>
                    <span class="block text-green-400">1 decision.</span>
                </h1>
                <p class="max-w-lg mt-6 text-base text-gray-200 md:text-lg">
                    Zen is the decision engine for developers juggling multiple projects. Stop losing ten minutes every morning deciding what to work on — the matrix does it for you.
                </p>
                <div class="max-w-md mt-10 text-left md:space-x-4 md:items-center md:flex">
                    <router-link
                        to="/register"
                        class="inline-flex items-center justify-center w-full h-12 px-6 font-bold text-white transition-colors bg-green-400 rounded-md md:w-auto hover:bg-green-500"
                    >
                        Plan my day
                        <i class="ml-2 text-xs fa fa-arrow-right"></i>
                    </router-link>
                    <a
                        href="https://github.com/jesusantguerrero/zen"
                        target="_blank"
                        rel="noopener"
                        class="inline-flex items-center justify-center w-full h-12 px-5 mt-3 text-sm font-bold text-white transition-colors border-2 rounded-md md:mt-0 md:w-auto border-white/30 hover:border-green-400 hover:text-green-400">
                        <i class="mr-2 fa fa-github"></i>
                        Star on GitHub
                    </a>
                </div>
                <p class="mt-6 text-xs text-gray-400">
                    Not for teams. Not another Kanban. Not a blank-page wiki.
                </p>
            </div>
            <div class="w-full md:w-6/12 mt-12 md:mt-0">
                <figure class="relative">
                    <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-green-400/30 via-green-400/0 to-blue-400/20 blur-2xl" aria-hidden="true"></div>
                    <img
                        :src="dashboardImage"
                        alt="Zen dashboard — matrix, pomodoro timer, and today's top 3 tasks"
                        class="relative w-full overflow-hidden border rounded-xl shadow-2xl border-white/10"
                        loading="eager"
                        fetchpriority="high"
                        decoding="async"
                        width="1280"
                        height="720"
                    />
                </figure>
            </div>
        </div>

        <down-wave class="z-50" />
    </header>
</template>

<script setup>
import SiteHeader from "./SiteHeader.vue"
import DownWave from "./waves/down-wave.vue";
import dashboardImage from "@/assets/zenboard.png";
</script>

<style lang="scss" scoped>
header {
    background: url('../../assets/zen-photo.jpg');
    background-size: cover;
    position: relative;
    width: 100%;
    height: 100%;

    &::after {
        content: "";
        background: linear-gradient(to left bottom,#3a4a73 0,#1b243f);
        display: block;
        position: absolute;
        width: 100%;
        top: 0;
        opacity: .95;
        left: 0;
        height: 100%;
        z-index: 40;
    }
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
</style>