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
              v-for="item in menu" 
              :key="item" 
              class="flex items-center h-10 px-5 font-bold capitalize transition-colors rounded-md cursor-pointer hover:bg-gray-200"
              :class="{'bg-gray-200': selectedOption==item}"
              @click="selectedOption=item">
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="w-9/12">
            <h2 class="mb-5 text-2xl font-bold text-left text-gray-400 capitalize">
              {{ selectedOption }}
            </h2>
          <div class="w-full bg-white border border-gray-200 rounded-md shadow-md">
            <div class="example-display__presenter">
              <settings-profile v-if="selectedOption == 'profile'"/> 
              <settings-tags v-if="selectedOption == 'tags'"/> 
              <settings-notification v-if="selectedOption == 'Notification Preferences'"></settings-notification>
              <settings-integrations v-if="selectedOption == 'Integrations'" />
            </div>
          </div>
        </div>

      </div>
  </div>
</template>


<script>
import { computed, reactive, toRefs } from "vue"
import SettingsProfile from "../components/templates/SettingsProfile.vue"
import SettingsTags from "../components/templates/SettingsTags.vue"
import SettingsNotification from "../components/templates/SettingsNotification.vue"
import { firebaseState, functions } from "../utils/useFirebase"
import IconGithubLogo from "../components/atoms/icons/IconGithubLogo.vue"
import SettingsIntegrations from "../components/templates/SettingsIntegrations.vue"

export default {
  name: "Settings",
  components: {
    SettingsProfile,
    SettingsTags,
    SettingsNotification,
    IconGithubLogo,
    SettingsIntegrations
},
  setup() {
    const state = reactive({
      menu: [
        // 'profile', 'tags', 
      'Notification Preferences',
      'Integrations'
    ],
      selectedOption: 'Notification Preferences',
      proFeatures: [
        'Dark Theme', 
        'Month / Year Metrics', 
        'Share Lists', 
        'Allow Pictures',  
        'Routines', 
        'Comparison Metrics', 
        'Voice',
        'Weekly Planner'
      ]
    })

    const connectJira = computed(() => {
      const userbound = firebaseState.user.uid;
      return `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=umMvvT2NxqxNEnjWMlQ6EnudUiK0jnym&scope=offline_access%20read%3Ajira-user%20read%3Ajira-work%20write%3Ajira-work&redirect_uri=https%3A%2F%2Fzenboards.web.app%2Foauth2%2Fconnect%2Fjira&state=${userbound}&response_type=code&prompt=consent`;
    })

    const connectGithub = computed(() => {
      const userbound = firebaseState.user.uid;
      const redirectUri = encodeURIComponent(`${window.location.origin}/oauth2/connect/github`);
      return `https://github.com/login/oauth/authorize?client_id=3c21758f1ac3d14ea284&redirect_uri=${redirectUri}&scope=user,repo&state=${userbound}`;
    })

    return {
      ...toRefs(state),
      connectJira,
      connectGithub
    }
  }
}
</script>
