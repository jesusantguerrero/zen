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
              v-for="(item) in settingsMenu" 
              :key="item.name" 
              class="flex items-center h-10 px-5 font-bold capitalize transition-colors rounded-md cursor-pointer hover:bg-gray-200"
              :class="{'bg-gray-200': state.selectedOption==item.name}"
              @click="state.selectedOption=item.name">
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
import SettingsProfile from "@/components/templates/SettingsProfile.vue"
import SettingsTags from "@/components/templates/SettingsTags.vue"
import SettingsNotification from "@/components/templates/SettingsNotification.vue"
import SettingsIntegrations from "@/components/templates/SettingsIntegrations.vue"
import SettingsOauth from "@/components/templates/SettingsOauth.vue"
import SettingsPomodoro from "@/components/templates/SettingsPomodoro.vue"
import SettingsJobBundle from "@/components/templates/SettingsJobBundle.vue"
import SettingsMatrixVue from "@/components/templates/SettingsMatrix.vue"

const state = reactive({
  menu: {
    profile: {
      label: 'Profile',
      component: SettingsProfile,
    }, 
    pomodoro: {
      label: 'Pomodoro',
      component: SettingsPomodoro,
      active: true
    },
    matrix: {
      label: 'Matrix',
      component: SettingsMatrixVue,
      active: true
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
      component: SettingsIntegrations,
      active: true
    },
    job: {
      label: 'Job Bundle',
      component: SettingsJobBundle,
      active: true
    },
    oauth: {
      label: 'Oauth',
      component: SettingsOauth
    }
  },
  selectedOption: '',
  selectedComponent: computed(() => {
    return state.menu[state.selectedOption].component
  })
})

const settingsMenu = computed(() => {
  return Object.entries(state.menu)
    .filter(([_name, item]) => item.active)
    .map(([name, item]) => {
      return {
        ...item,
        name
      }
    })
})


state.selectedOption = settingsMenu.value[0].name

</script>
