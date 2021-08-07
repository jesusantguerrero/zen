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
              <settings-billing v-if="selectedOption == 'billing'" />
              <settings-notification v-if="selectedOption == 'Notification Preferences'"></settings-notification>
              <a :href="connectJira" class="block"> Jira </a>
              <button @click="listOptions()" class="px-2 py-2 text-white bg-green-400 rounded-md focus:outline-none hover:bg-opacity-75"> List Options </button>
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
import SettingsBilling from "../components/templates/SettingsBilling.vue"
import SettingsNotification from "../components/templates/SettingsNotification.vue"
import { firebaseState, functions } from "../utils/useFirebase"

export default {
  name: "Settings",
  components: {
    SettingsProfile,
    SettingsTags,
    SettingsBilling,
    SettingsNotification
  },
  setup() {
    const state = reactive({
      menu: [
        // 'profile', 'tags', 
      'billing', 
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
    
    const listOptions = () => {
      const getServiceResources = functions.httpsCallable('getServiceResources');
      console.log("here");
      getServiceResources({
        connectionUid: 'W7o7jckS9gPLicXR3Wd5',
        service: 'jira'
      });
    }

    return {
      ...toRefs(state),
      connectJira,
      listOptions
    }
  }
}
</script>
