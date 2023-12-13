<template>
<div v-for="connection in state.connectionsWithProjects" class="ml-2 text-sm">
    <div 
        v-for="project in connection.metaData.projects" 
        :title="`Pull tasks from ${project.name}`" 
        @click="pullTasks(connection, project)"
        class="cursor-pointer rounded-md flex items-center space-x-1 bg-gray-800 px-2 py-1 text-white">
        <icon-github />  <span>{{ project.name }}</span>
    </div>
</div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import IconGithub from '../../components/atoms/icons/IconGithub.vue'

import { useIntegrations } from '@/plugins/firebase/useIntegrations'
import { getIssues } from '../../domain/integrations/github';


const { getList } = useIntegrations()
const state = reactive({
  connections:[],
  connectionsWithProjects: computed(() => {
    return state.connections.filter(connection => connection.metaData?.projects)
  })
})

const pullTasks = (connection, project) => {
    getIssues(connection, project.orgId, project.key).then(data => {
        console.log(data)
    })
}

onMounted(() => {
  state.connections = getList()
})
</script>../../plugins/firebase/useIntegrations