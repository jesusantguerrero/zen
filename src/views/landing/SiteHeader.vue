<template>
    <nav class="flex items-center h-24 mx-auto max-w-7xl">
        <div class="z-50 flex flex-wrap items-center justify-between w-full h-24 mx-auto font-medium">
            <router-link to="/" class="py-4 pr-4">
                <span class="text-3xl leading-none text-white select-none logo zen">Zen<span class="text-green-500">.</span></span>
            </router-link>

            <div class="flex-col items-center justify-end hidden w-full h-full mt-12 font-bold text-center text-green-700 md:flex md:text-green-400 md:w-2/3 md:mt-0 md:flex-row md:items-center">
                <a href="/#home" class="inline-block px-4 py-2 mx-2 text-left text-green-700 md:text-white md:px-0 lg:mx-3 md:text-center">Home</a>
                <a href="/#features" class="inline-block px-4 py-2 mx-2 text-left md:px-0 hover:text-green-800 md:hover:text-white lg:mx-3 md:text-center">Features</a>
                <router-link to="/blog" class="inline-block px-4 py-2 mx-2 text-left md:px-0 hover:text-green-800 md:hover:text-white lg:mx-3 md:text-center">Blog</router-link>
                <router-link to="/pricing" class="inline-block px-4 py-2 mx-2 text-left md:px-0 hover:text-green-800 md:hover:text-white lg:mx-3 md:text-center">
                    Pricing
                </router-link>
                <router-link to="/support" class="inline-block px-4 py-2 mx-2 text-left md:px-0 hover:text-green-800 md:hover:text-white lg:mx-3 md:text-center">Support</router-link>
                <button
                    type="button"
                    class="changelog inline-flex items-center justify-center h-9 px-3 mx-2 text-sm font-bold text-white transition border-2 rounded-md border-white/20 hover:border-green-400 hover:text-green-400 md:mx-1 lg:mx-2"
                    aria-label="What's new"
                    title="What's new"
                >
                    <i class="mr-2 fa fa-bullhorn" aria-hidden="true"></i>
                    <span class="hidden lg:inline">What's new</span>
                    <span class="lg:hidden">News</span>
                </button>
                <router-link to="/register" class="w-full px-4 py-2 font-bold text-gray-500 transition bg-white rounded-md hover:text-green-500 md:ml-4 md:mr-3 lg:mr-3 md:w-auto">Sign in</router-link>
                <router-link to="/register" class="w-full px-4 py-2 font-bold text-white transition bg-green-400 rounded-md hover:bg-green-500 md:mr-3 lg:mr-5 md:w-auto">Sign up for free</router-link>
            </div>
        </div>
    </nav>
</template>
