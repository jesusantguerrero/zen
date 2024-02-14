<template>
  <div class="pt-24 pb-20 mx-5 md:pt-28 md:mx-28">
    <div class="items-center justify-between mb-10 section-header md:flex">
      <h2 class="text-2xl font-bold text-left text-gray-400">Settings</h2>
    </div>
    <div class="font-bold text-gray-400">
      Connecting service ...
    </div>

    <IntegrationModal 
      v-model:is-open="isIntegrationModalOpen"
      @cancel="isIntegrationModalOpen=false"
      @saved="redirectToHome"
    />
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { onMounted, ref } from "vue";

import { functions } from "@/plugins/useFirebase"
import IntegrationModal from "@/components/organisms/modals/IntegrationModal.vue"; 

const route = useRoute();
const formData = ref({});
onMounted(() => {
  if (route && route.query && route.query.code) {
    formData.value = {
      service: route.params.service,
      state: route.query.state,
      code: route.query.code
    };

    registerConnection();
  }
});

const isIntegrationModalOpen = ref(false);
const openConfiguration = () => {
  isIntegrationModalOpen.value = true;
}

const { push } = useRouter();
const redirectToHome = () => {
  push({ path: "/zenboard" });
}

const registerConnection = () => {
  const requestAccess = functions.httpsCallable('requestAccess');
  requestAccess(formData.value).then(() => {
     if (route.params.service) {
        openConfiguration();
     } else {
       push({ path: "/zenboard" });
     }
  }).catch(error => {
    console.log(error);
    push({ path: "/zenboard" });
  });
}
</script>
