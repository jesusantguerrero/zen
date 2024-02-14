<template>
  <div class="px-10 pb-20 text-left">
    <div class="mt-5" v-if="!state.isCreating">
      <div v-for="application in state.applications">
        {{ application.name }} - {{ application.description }}
      </div>
      <AtButton type="secondary" rounded @click="state.isCreating=true"> Add Application </AtButton>
    </div>
    <OauthForm 
      v-else
      @cancel="state.isCreating=false"
      @submit="submit"
    />
  </div>
</template>


<script setup lang="ts">
import { onUnmounted, reactive } from "vue"
import { useCollection } from "@/plugins/firebase/useCollection"
import OauthForm from '../molecules/OauthForm.vue'
import { AtButton } from "atmosphere-ui"

const state = reactive({
  applications: [],
  isCreating: false,
})

const generateOauth = () => {
  const key =  ""
  const secret = "" 

  return {
    key,
    secret
  }
} 

const { getAll, save } = useCollection();

const submit = (formData) => {
  save('applications', formData).then(() => {
    state.isCreating = false;
  })
}


let connectionsRef = getAll("applications").onSnapshot(snap => {
  const list = [];
  snap.forEach((connection) => {
    list.push({ uid: connection.id, ...connection.data() });
  });
  state.applications = list;
});

onUnmounted(() => {
  connectionsRef()
})
</script>