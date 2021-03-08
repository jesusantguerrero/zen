<template>
  <section class="px-2 py-32 pb-48 bg-white md:px-0 mb-20 md:mb-0">
    <div class="container items-center max-w-6xl px-8 mx-auto xl:px-5">
      <div class="flex flex-wrap items-center sm:-mx-3">
        <div class="w-full md:w-1/2 md:px-3">
          <div
            class="w-full pb-6 space-y-6 sm:max-w-md lg:max-w-lg md:space-y-4 lg:space-y-8 xl:space-y-9 sm:pr-5 lg:pr-0 md:pb-0"
          >
            <h1
              class="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-4xl lg:text-3xl xl:text-4xl"
            >
              <span class="block xl:inline">Use proven techniques</span>
              <span class="block text-green-400 xl:inline">
                at your favor!</span
              >
            </h1>
            <p
              class="mx-auto text-base text-gray-500 sm:max-w-md lg:text-xl md:max-w-3xl"
            >
              Zenboard is a productivity app that integrates <a href="" target="_blank" class="border-b-2 border-dashed border-green-400 text-green-400 font-bold">Eisenhower Matrix</a>,
              <a href="" class="border-b-2 border-dashed border-green-400 text-green-400 font-bold" target="_blank">Pomodoro Timer</a>, and part of the Get Things Done (GTD) principles in a
              unique way, to improve your developer routine.
            </p>
            <div class="relative flex flex-col sm:flex-row sm:space-x-4">
              <router-link
                to="/register"
                class="flex items-center w-full px-6 py-3 mb-3 text-lg text-white bg-green-600 rounded-md sm:mb-0 hover:bg-green-700 sm:w-auto"
              >
                Try It Free
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="feather feather-arrow-right w-5 h-5 ml-1"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </router-link>
            </div>
          </div>
        </div>
        <div class="w-full md:w-1/2">
          <mock-tasks class="shadow-md px-2 py-2 border-2 rounded-md h-20"></mock-tasks>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import MockTasks from "./mockTask.vue";

</script>
