<template>
  <div class="pt-24 md:pt-28 pb-20 mx-5 md:mx-28">
      <div class="section-header md:flex justify-between items-center mb-10">
      <h2 class="text-2xl font-bold text-gray-400 text-left">
         Settings
      </h2>
  </div> 
    <div class="flex space-x-5">
          <ul class="w-3/12 space-y-2">
            <li
              v-for="item in state.menu" :key="item" 
              class="cursor-pointer h-10 transition-colors hover:bg-gray-200 flex items-center px-5 rounded-md capitalize font-bold"
              :class="{selected: selectedOption==item}"
              @click="selectedOption=item">
              {{ item }}
            </li>
          </ul>
          <div class="bg-white rounded-md border border-gray-200 shadow-md w-9/12">
            <div class="example-display__presenter">
              <settings-profile> 
              
              </settings-profile>
              <settings-tags> 
              
              </settings-tags>
            </div>
          </div>
      </div>
  </div>
</template>


<script setup>
import { reactive } from "vue"
import SettingsProfile from "../components/templates/SettingsProfile.vue"
import SettingsTags from "../components/templates/SettingsTags.vue"

const state = reactive({
  menu: ['profile', 'tags'],
  selectedOption: 'profile',
  proFeatures: [
    'Dark Theme', 
    'Month / Year Metrics', 
    'Share Lists', 
    'Allow Pictures',  
    'Routines', 
    'Comparison Metrics', 
    'Voice', 
    'Customize App', 
    'Focus Mode', 
    'Weekly Planner'
  ]
})
</script>
