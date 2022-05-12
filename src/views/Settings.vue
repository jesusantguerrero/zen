<template>
  <div class="pt-24 pb-20 mx-5 md:pt-20 md:mx-28">
      <div class="items-center justify-between mb-10 section-header md:flex">
  </div> 
    <div class="flex space-x-5">
        <div class="w-3/12">
          <h2 class="mb-5 text-2xl font-bold text-left text-gray-400">
            Settings
          </h2>
          <ul class="w-full space-y-2">
            <li
              v-for="(item, value) in state.menu" 
              :key="value" 
              class="flex items-center h-10 px-5 font-bold capitalize transition-colors rounded-md cursor-pointer hover:bg-gray-200"
              :class="{'bg-gray-200': state.selectedOption==value}"
              @click="state.selectedOption=value">
              {{ item.label }}
            </li>
          </ul>
        </div>

        <div class="w-9/12">
            <h2 class="mb-5 text-2xl font-bold text-left text-gray-400 capitalize">
              {{ state.selectedOption }}
            </h2>
          <div class="w-full bg-white border border-gray-200 rounded-md shadow-md">
            <div class="example-display__presenter">
              <component :is="state.selectedComponent" />
            </div>
          </div>
        </div>

      </div>
  </div>
</template>


<script setup>
import { computed, reactive } from "vue"
import SettingsProfile from "../components/templates/SettingsProfile.vue"
import SettingsTags from "../components/templates/SettingsTags.vue"
import SettingsNotification from "../components/templates/SettingsNotification.vue"
import SettingsIntegrations from "../components/templates/SettingsIntegrations.vue"
import SettingsOauth from "../components/templates/SettingsOauth.vue"

const state = reactive({
  menu: {
    profile: {
      label: 'Profile',
      component: SettingsProfile
    }, 
    tags: {
      label: 'Tags',
      component: SettingsTags
    },
    notifications: {
      label: 'Notification Preferences',
      component: SettingsNotification
    },
    integrations: {
      label: 'Integrations',
      component: SettingsIntegrations
    },
    oauth: {
      label: 'Oauth',
      component: SettingsOauth
    }
  },
  selectedOption: 'notifications',
  selectedComponent: computed(() => {
    return state.menu[state.selectedOption].component
  })
})

</script>
