<template>
  <section class="relative py-20 bg-white">
    <normal-wave />
    <div
      class="container items-center px-10 mx-auto sm:px-20 md:px-32 lg:px-16"
    >
      <div class="flex flex-wrap -mx-3">
        <h2
          class="w-full mb-4 text-3xl font-bold leading-tight tracking-tight text-center sm:text-4xl font-heading"
        >
          Building productivity with 4 main steps
        </h2>

        <div class="grid w-full grid-cols-1 mt-10 md:grid-cols-4 gap-7">
          <feature-card
            class="flex flex-col items-center"
            v-for="step in steps"
          >
            <badge-item :badge="step" theme-color="#10B981" />
            <span class="mt-2 font-bold text-center text-gray-600">{{ step.title }}</span>
            <p class="px-5 mt-5 text-sm text-left text-gray-500"> {{ step.description }}</p>
          </feature-card>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import NormalWave from "./waves/normal-wave.vue";
import FeatureCard from "./card/FeatureCard.vue";
import BadgeItem from "@/components/atoms/BadgeItem.vue";

const steps = [
  {
    iconClass: "fa fa-tasks",
    title: "Plan ahead",
    description: 'Step that will allow users to add, prioritize them according to the Eisenhower Matrix principle their tasks and build the line up of the day.'
  },
  {
    iconClass: "fa fa-stopwatch",
    title: "Focus and track",
    description: 'Step where I can see my main task at the time detailed, a pomodoro timer to track the sessions of work, and a line up of task titles to know what is coming next.'
  },
  {
    iconClass: "fa fa-history",
    title: "Standup",
    description: 'This section will contain the committed task of previous days and help developers to have this info in hand for daily scrum meetings.'
  },
  {
    title: "Eisenhower Matrix",
    iconClass: "fa fa-border-all",
    description: 'The standalone screen of Eisenhower Matrix plus the backlog of no-prioritized tasks.'
  },
];
</script>
