<template>
    <nav class="flex items-center h-24 mx-auto max-w-7xl">
        <div class="z-50 flex flex-wrap items-center justify-between w-full h-24 mx-auto font-medium">
            <router-link to="/" class="py-4 pr-4">
                <span class="text-3xl leading-none text-white select-none logo zen">Zen<span class="text-green-500">.</span></span>
            </router-link>
            
            <div class="flex-col items-center justify-end hidden w-full h-full mt-12 font-bold text-center text-green-700 md:flex md:text-green-400 md:w-2/3 md:mt-0 md:flex-row md:items-center">
                <a href="/#home" class="inline-block px-4 py-2 mx-2 text-left text-green-700 md:text-white md:px-0 lg:mx-3 md:text-center">Home</a>
                <a href="/#features" class="inline-block px-4 py-2 mx-2 text-left md:px-0 hover:text-green-800 md:hover:text-white lg:mx-3 md:text-center">Features</a>
                <a href="https://freesgen.hashnode.dev/" class="inline-block px-4 py-2 mx-2 text-left md:px-0 hover:text-green-800 md:hover:text-white lg:mx-3 md:text-center">Blog</a>
                <router-link to="/pricing" class="inline-block px-4 py-2 mx-2 text-left md:px-0 hover:text-green-800 md:hover:text-white lg:mx-3 md:text-center">
                    Pricing
                </router-link>
                <a href="https://forms.gle/bmeGgRdLHLFcsqBf6" class="inline-block px-4 py-2 mx-2 text-left md:px-0 hover:text-green-800 md:hover:text-white lg:mx-3 md:text-center">Contact</a>
                <router-link to="/register" class="w-full px-4 py-2 font-bold text-gray-500 transition bg-white rounded-md hover:text-green-500 md:ml-8 md:mr-3 lg:mr-3 md:w-auto">Sign in</router-link>
                <router-link to="/register" class="w-full px-4 py-2 font-bold text-white transition bg-green-400 rounded-md hover:bg-green-500 md:mr-3 lg:mr-5 md:w-auto">Sign up for free</router-link>
            </div>
        </div>
    </nav>
</template>