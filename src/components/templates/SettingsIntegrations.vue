<template>
  <div class="px-10 pb-20 text-left" >
    <div class="flex items-center mt-5 integrations">
      <a :href="connectJira" class="inline-block w-48"> 
        <img src="../../assets/jira-software-blue.svg" class="w-full h-full" />
      </a>
      <a :href="connectJira" class="inline-block w-48 ml-5"> 
        <button @click.prevent class="px-2 py-2 text-white bg-blue-600 rounded-md focus:outline-none hover:bg-opacity-75"> {{
          state.jiraText
        }} </button>
      </a>
    </div>
    <div class="flex items-center mt-5 integrations">
      <a :href="connectGithub" class="inline-block w-48"> 
        <icon-github-logo class="text-4xl"/>
      </a>
      <a :href="connectGithub" class="inline-block w-48 ml-5"> 
        <button class="px-2 py-2 text-white bg-gray-600 rounded-md focus:outline-none hover:bg-opacity-75"> {{
          state.githubText
        }} </button>
      </a>
    </div>
    <div class="flex items-center mt-5 integrations" @click.prevent="handleGoogleConnect">
      <a href="javascript;;" class="inline-block w-48"> 
        Google
      </a>
      <a href="javascript;;" class="inline-block w-48 ml-5"> 
        <button class="px-2 py-2 text-white bg-gray-600 rounded-md focus:outline-none hover:bg-opacity-75"> 
          {{ state.googleText}} 
        </button>
      </a>
    </div>
  </div>
</template>


<script setup>
import { computed, onUnmounted, reactive } from "vue"
import { firebaseState, functions, } from "../../utils/useFirebase"
import IconGithubLogo from "../atoms/icons/IconGithubLogo.vue"
import { useCollection } from "../../utils/firebase/useCollection"
import { connectGoogle } from "../../domain/integrations/google";


const state = reactive({
  integrations: [],
  hasGithub: computed(() => {
    return state.integrations.find(integration => integration.service === 'github')
  }),
  hasJira: computed(() => {
    return state.integrations.find(integration => integration.service === 'jira')
  }),
  githubText: computed(() => {
    return state.hasGithub ? 'Disconnect from Github' : 'Connect with Github'
  }),
  jiraText: computed(() => {
    return state.hasJira ? 'Disconnect from Jira' : 'Connect with Jira'
  }),
  googleText: computed(() => {
    return state.hasJira ? 'Disconnect from Google' : 'Connect with Google'
  }),
})

const connectJira = computed(() => {
  if (state.hasJira) return '#';
  const userbound = firebaseState.user.uid;
  return `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=umMvvT2NxqxNEnjWMlQ6EnudUiK0jnym&scope=offline_access%20read%3Ajira-user%20read%3Ajira-work%20write%3Ajira-work&redirect_uri=https%3A%2F%2Fzenboards.web.app%2Foauth2%2Fconnect%2Fjira&state=${userbound}&response_type=code&prompt=consent`;
})

const connectGithub = computed(() => {
  if (state.hasGithub) return '#';
  const userbound = firebaseState.user.uid;
  const redirectUri = encodeURIComponent(`${window.location.origin}/oauth2/connect/github`);
  return `https://github.com/login/oauth/authorize?client_id=3c21758f1ac3d14ea284&redirect_uri=${redirectUri}&scope=user,repo&state=${userbound}`;
})

const handleGoogleConnect = () => {
  connectGoogle((credentials) => {
    functions.httpsCallable('requestAccess')({
      userId: firebaseState.user.uid,
      ...credentials,
      service: 'google'
    })
  })
}


const { getAll } = useCollection();

let connectionsRef = getAll("connections").onSnapshot(snap => {
  const list = [];
  snap.forEach((connection) => {
    list.push({ uid: connection.id, ...connection.data() });
  });
  state.integrations = list;
});

onUnmounted(() => {
  connectionsRef()
})
</script>
