<template>
    <header class="w-full antialiased bg-gray-900 select-none relative">
        <div class="mx-auto max-w-7xl z-50 relative">
            <nav class="flex items-center w-full h-24" x-data="{ showMenu: false }">
                <div class="relative flex flex-wrap items-center justify-between w-full h-24 mx-auto font-medium md:justify-center">
                    <router-link to="/landing" class="w-1/4 py-4 pl-6 pr-4 md:pl-4 md:py-0 z-index">
                        <span class="text-3xl leading-none text-white select-none logo zen">Zen<span class="text-green-500">.</span></span>
                    </router-link>
                    <div class="fixed top-0 left-0 z-40 items-center hidden w-full h-full p-3 text-xl bg-gray-900 bg-opacity-50 md:text-sm lg:text-base md:w-3/4 md:bg-transparent md:p-0 md:relative md:flex" :class="{'flex': showMenu, 'hidden': !showMenu }">
                        <div class="flex-col w-full h-full overflow-hidden bg-white rounded-lg select-none md:bg-transparent md:rounded-none md:relative md:flex md:flex-row md:overflow-auto">
                            <div class="flex flex-col items-center justify-center w-full h-full mt-12 text-center text-green-700 md:text-green-400 md:w-2/3 md:mt-0 md:flex-row md:items-cente font-bold">
                                <a href="#" class="inline-block px-4 py-2 mx-2 text-left text-green-700 md:text-white md:px-0 lg:mx-3 md:text-center">Home</a>
                                <a href="#" class="inline-block px-4 py-2 mx-2 text-left md:px-0 hover:text-green-800 md:hover:text-white lg:mx-3 md:text-center">Features</a>
                                <a href="https://freesgen.hashnode.dev/" class="inline-block px-4 py-2 mx-2 text-left md:px-0 hover:text-green-800 md:hover:text-white lg:mx-3 md:text-center">Blog</a>
                                <a href="https://forms.gle/bmeGgRdLHLFcsqBf6" class="inline-block px-4 py-2 mx-2 text-left md:px-0 hover:text-green-800 md:hover:text-white lg:mx-3 md:text-center">Contact</a>
                            </div>
                            <div class="flex flex-col items-center justify-end w-full h-full pt-4 md:w-1/3 md:flex-row md:py-0">
                                <router-link to="/login" class="w-full pl-6 mr-0 font-bold text-green-400 hover:text-white md:pl-0 md:mr-3 lg:mr-5 md:w-auto">Sign In</router-link>
                            </div>
                        </div>
                    </div>
                    <div @click="showMenu = !showMenu" class="absolute right-0 z-50 flex flex-col items-end w-10 h-10 p-2 mr-4 rounded-full cursor-pointer md:hidden" :class="{ 'text-green-700 hover:bg-gray-200': showMenu, 'hover:bg-green-700 text-green-200': !showMenu }">
                        <svg class="w-6 h-6" v-show="!showMenu" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                        <svg class="w-6 h-6" v-show="showMenu" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                </div>
            </nav>

            <div class="container py-32 mx-auto text-center sm:px-4 z-50">
                <h1 class="text-4xl font-extrabold leading-10 tracking-tight text-white sm:text-5xl sm:leading-none md:text-4xl xl:text-5xl"><span class="block">Keep yourself in the zone</span> <span class="relative inline-block mt-3 text-transparent text-white">and focus in the moment.</span></h1>
                <div class="max-w-lg mx-auto mt-6 text-sm text-center text-green-200 md:mt-12 sm:text-base md:max-w-xl md:text-lg xl:text-xl">Take the step to improve your daily routine and get things done!</div>
                <div class="relative flex justify-center items-center max-w-md mx-auto mt-12 text-center">
                    <router-link 
                        to="/register" 
                        class="btn btn-action rounded-md w-40 border-0">
                        Sign Up
                    </router-link>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref } from "vue";

const showMenu = ref(false)
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
        opacity: .85;
        left: 0;
        height: 100%;
    }
}

.btn-action {
    @apply bg-green-500 flex items-center justify-center;
    color: white;
    border: none;
    margin: 10px 0;
    transition: all ease 0.3s;
    height: 40px;

    &:hover {
        @apply bg-green-700;
    }
}
</style>