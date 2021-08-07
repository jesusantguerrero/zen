<template>
    <div class="px-2 py-3 text-xs font-bold bg-white border-b md:px-10 md:justify-between md:flex">
        <div class="w-full text-sm text-gray-500 transition cursor-pointer md:text-left hover:text-green-500">
            <span class="px-1 py-1 mr-3 text-white bg-green-400 rounded-md"> New </span>
            Introducing zenboard 2.0 - The Eisenhower Matrix revamped
            <i class="fa fa-chevron-right"></i>
        </div>
        <div class="mt-4 space-x-4 md:mt-0">
          
        </div>
    </div>
    <header class="w-full antialiased bg-gray-900 select-none">
        <nav class="flex items-center w-full h-24 px-10">
            <div class="z-50 flex flex-wrap items-center justify-between w-full h-24 font-medium">
                <router-link to="/landing" class="py-4 pr-4">
                    <span class="text-3xl leading-none text-white select-none logo zen">Zen<span class="text-green-500">.</span></span>
                </router-link>
                
                <div class="flex-col items-center justify-end hidden w-full h-full mt-12 font-bold text-center text-green-700 md:flex md:text-green-400 md:w-2/3 md:mt-0 md:flex-row md:items-cente">
                    <a href="#" class="inline-block px-4 py-2 mx-2 text-left text-green-700 md:text-white md:px-0 lg:mx-3 md:text-center">Home</a>
                    <a href="#" class="inline-block px-4 py-2 mx-2 text-left md:px-0 hover:text-green-800 md:hover:text-white lg:mx-3 md:text-center">Features</a>
                    <a href="https://freesgen.hashnode.dev/" class="inline-block px-4 py-2 mx-2 text-left md:px-0 hover:text-green-800 md:hover:text-white lg:mx-3 md:text-center">Blog</a>
                    <a href="https://forms.gle/bmeGgRdLHLFcsqBf6" class="inline-block px-4 py-2 mx-2 text-left md:px-0 hover:text-green-800 md:hover:text-white lg:mx-3 md:text-center">Contact</a>
                    <router-link to="/register" class="w-full px-4 py-2 font-bold text-gray-500 transition bg-white rounded-md hover:text-green-500 md:ml-8 md:mr-3 lg:mr-3 md:w-auto">Sign in</router-link>
                    <router-link to="/register" class="w-full px-4 py-2 font-bold text-white transition bg-green-400 rounded-md hover:bg-green-500 md:mr-3 lg:mr-5 md:w-auto">Sign up for free</router-link>
                </div>
            </div>
        </nav>

        <div class="relative z-50 px-10 py-10 md:items-center md:py-32 md:px-16 sm:px-4 md:flex md:justify-between md:px-50">
            <div class="w-full text-left">
                <h1 class="text-2xl font-extrabold tracking-tight text-white md:leading-10 md:text-4xl sm:text-5xl sm:leading-none xl:text-5xl"><span class="block">Keep yourself in the zone</span> <span class="inline-block mt-3 text-transparent text-white ">and focus in the moment.</span></h1>
                <div class="max-w-lg mt-6 text-sm text-green-200 md:mt-12 sm:text-base -md:max-w-xl md:text-lg xl:text-xl">Take the step to improve your daily routine and get things done!</div>
                <div class="max-w-md mt-12 text-left md:space-x-5 md:items-center md:flex">
                    <router-link 
                        to="/register" 
                        class="px-5 font-bold border-0 rounded-md btn btn-action">
                        Organize your daily routine
                    </router-link>
                    <!-- <router-link 
                        to="/register" 
                        class="block px-5 py-2 font-bold text-center text-gray-500 bg-white border-0 rounded-md">
                        Learn more
                    </router-link> -->
                </div>
            </div>
            <div class="w-full">
                <div class="px-20 mt-10 overflow-hidden rounded-md shadow-md md:mt-0">
                    <div style="position: relative; padding-bottom: 56.25%; height: 0;"><iframe src="https://www.loom.com/embed/d881ba48b6a44f428080e11853859ebf" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>
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