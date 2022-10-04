<template>
  <section class="relative py-20">
    <normal-wave />
    <div
      class="container relative items-center px-10 pt-20 mx-auto sm:px-20 md:px-32 lg:px-16"
    >
      <div class="flex flex-wrap -mx-3">
        <div class="order-1 w-full px-3 lg:w-1/2 lg:order-0">
          <div class="w-full lg:max-w-md">
            <h2
              class="mb-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl font-heading"
            >
              Features
            </h2>
            <p class="mb-4 font-bold tracking-tight text-gray-300 xl:mb-10">
              It's never been easier to build a business of your own. Our tools
              will help you with the following:
            </p>
            <ul>
              <li
                class="flex items-center py-2 space-x-4 font-bold text-white transition-colors cursor-pointer xl:py-3 hover:text-green-500"
                v-for="feat in features"
                :key="feat.icon"
              >
                <i :class="`fa fa-${feat.icon} text-2xl text-green-400`"></i>
                <span class="font-medium hover:text-green-500">
                  {{ feat.title }}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div class="w-full px-3 mb-12 lg:w-1/2 order-0 lg:order-1 lg:mb-0">
            <h2
              class="mb-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl font-heading"
            >
              Eisenhower Matrix
            </h2>
            <p class="mb-4 font-medium font-bold tracking-tight text-gray-300 xl:mb-10">
              The app it built around this technique to help find the most important tasks to deliver daily:
            </p>
          <div class="grid gap-2 md:grid-cols-2">
            <div
              v-for="(value, matrix) in matrixes"
              class="pt-5 border-2 border-dashed"
              :class="[value.border]"
              :key="matrix"
            >
              <h1 class="font-bold capitalize" :class="[value.color]">{{ matrix }}</h1>
              <matrix-help-view 
                :matrix="matrix" 
                class="text-gray-200 bg-transparent"
                title-class="text-white"
                >
              </matrix-help-view>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import MatrixHelpView from "../../components/molecules/MatrixHelpView.vue";
import NormalWave from "./waves/normal-wave.vue";

const features = [
  {
    icon: "tasks",
    title: "Tasks with checklists.",
  },
  {
    icon: "stopwatch",
    title: "Pomodoro + TimeTracker in One",
  },
  {
    icon: "chart-bar",
    title: "Stats",
  },
  {
    title: "Eisenhower Matrix",
    icon: "border-all",
  },
  {
    title: "Mobile Friendly",
    icon: "mobile",
  },
  {
    title: "Realtime",
    icon: "retweet",
  },
];

const matrixes = {
  todo: {
    color: "text-green-500",
    border: "border-green-500",
  },
  schedule: {
    color: "text-blue-500",
    border: "border-blue-500",
  },
  delegate: {
    color: "text-yellow-500",
    border: "border-yellow-500",
  },
  delete: {
    color: "text-red-500",
    border: "border-red-500",
  },
};
</script>
