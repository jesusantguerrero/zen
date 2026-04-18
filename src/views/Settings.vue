<template>
  <div class="pt-24 pb-20 mx-5 md:pt-20 md:mx-28">
      <div class="items-center justify-between mb-10 section-header md:flex">
  </div> 
    <div class="flex space-x-5">
        <div class="w-3/12">
          <h2 class="mb-5 text-2xl font-bold text-left text-gray-400 dark:text-gray-300">
            Settings
          </h2>
          <ul class="w-full space-y-2">
            <li
              v-for="(item) in settingsMenu"
              :key="item.name"
              class="flex items-center h-10 px-5 font-bold capitalize transition-colors rounded-md cursor-pointer text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-base-lvl-2"
              :class="{
                'bg-gray-200 dark:bg-base-lvl-2 dark:text-white': state.selectedOption==item.name
              }"
              @click="selectSection(item.name)">
              {{ item.label }}
            </li>
          </ul>
        </div>

        <div class="w-9/12">
            <h2 class="mb-5 text-2xl font-bold text-left text-gray-400 dark:text-gray-300 capitalize">
              {{ state.selectedOption }}
            </h2>
          <div class="w-full bg-white border border-gray-200 rounded-md shadow-md dark:bg-base-lvl-2 dark:border-base-lvl-3">
            <div class="example-display__presenter">
              <component :is="state.selectedComponent" />
            </div>
          </div>
        </div>

      </div>
  </div>
</template>


<script setup>
import { computed, reactive, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import SettingsProfile from "@/components/templates/SettingsProfile.vue"
import SettingsPreferences from "@/components/templates/SettingsPreferences.vue"
import SettingsTags from "@/components/templates/SettingsTags.vue"
import SettingsNotification from "@/components/templates/SettingsNotification.vue"
import SettingsIntegrations from "@/components/templates/SettingsIntegrations.vue"
import SettingsOauth from "@/components/templates/SettingsOauth.vue"
import SettingsPomodoro from "@/components/templates/SettingsPomodoro.vue"
import SettingsJobBundle from "@/components/templates/SettingsJobBundle.vue"
import SettingsMatrixVue from "@/components/templates/SettingsMatrix.vue"
import SettingsData from "@/components/templates/SettingsData.vue"
import SettingsApiTokens from "@/components/templates/SettingsApiTokens.vue"

const state = reactive({
  menu: {
    profile: {
      label: 'Profile',
      component: SettingsProfile,
    },
    preferences: {
      label: 'Preferences',
      component: SettingsPreferences,
      active: true
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
      component: SettingsNotification,
      active: true
    },
    integrations: {
      label: 'Integrations',
      component: SettingsIntegrations,
      active: true
    },
    api: {
      label: 'API Tokens',
      component: SettingsApiTokens,
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
    },
    data: {
      label: 'Data & Account',
      component: SettingsData,
      active: true
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

const route = useRoute()
const router = useRouter()

const resolveSection = (name) => {
  if (name && state.menu[name]?.active) return name
  return settingsMenu.value[0].name
}

state.selectedOption = resolveSection(route.query.section)

const selectSection = (name) => {
  state.selectedOption = name
  if (route.query.section !== name) {
    router.replace({ query: { ...route.query, section: name } })
  }
}

watch(() => route.query.section, (section) => {
  const resolved = resolveSection(section)
  if (resolved !== state.selectedOption) {
    state.selectedOption = resolved
  }
})
</script>
