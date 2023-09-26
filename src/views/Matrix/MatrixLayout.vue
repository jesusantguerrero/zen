<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-10 lg:mx-28">
   
   <div class="items-center justify-between mb-2 section-header md:flex">
      <h2 class="items-center space-x-2 text-2xl font-bold text-left text-gray-400">
         <div>
            <span v-if="state.matrixOwner">{{ state.matrixOwner }} 's</span> Matrix
         </div>
      </h2>  
      <div class="flex space-x-2">
         <div class="w-32">
            <JetSelect
               v-model:selected="state.viewMode"
               :options="state.modes"
               label="name"
               key-track="value"
               class="w-32 "
            />         
         </div>
         <input type="search" 
            v-model.trim="state.search" 
            class="w-full h-10 px-2 border-2 border-gray-200 rounded-md text-md focus:outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
            placeholder="Search task"  
         >
         <button title="help" class="h-10 px-5 py-1 ml-2 text-white transition-all bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none" 
         @click="state.showHelp = !state.showHelp">
            <i class="fa fa-question"></i>
         </button>
      </div>
   </div>

   <div class="flex justify-between w-full text-right">
      <div class="flex">
         <ShareBoard /> 
         <MatrixTeammates v-model:selected="state.selectedUser" />           
      </div>
      
      <button class="px-5 py-1 font-bold border rounded-md focus:outline-none capitalize dark:border-lvl-3"
         :class="showUncategorized ? 'text-gray-200 bg-gray-600 dark:bg-base-lvl-1' : 'text-gray-700 bg-gray-200 dark:base-lvl-2'"
         @click="toggleUncategorized">{{ uncategorizedText }} Uncategorized 
      </button>
   </div>

   <RouterView 
      class="mt-8"
      :search="state.search" 
      :show-help="state.showHelp" 
      :show-uncategorized="showUncategorized" 
      :mode="state.selectedView" 
      :user="state.user"
      :allow-update="!state.selectedUser"
      :allow-add="!state.selectedUser"
   />
</div>
</template>

<script setup>
import { computed, reactive, watch } from "vue"
import { useLocalStorage } from "@vueuse/core";
import { useRoute, useRouter } from "vue-router"

import ShareBoard from "@/components/organisms/ShareBoard.vue"
import JetSelect from "@/components/atoms/JetSelect.vue";
import MatrixTeammates from "@/components/organisms/MatrixTeammates.vue";
import { firebaseState } from "@/utils/useFirebase";


const state = reactive({
   showHelp:  false,
   search: "",
   modes: [{
      name: 'Board',
      value: 'matrix'
   },{
      name: 'Time Line',
      value: 'timeline'
   },
   {
      name: 'Overdue',
      value: 'matrix:overdue'
   },{
      name: 'Stale',
      value: 'matrix:stale'
   }
   ],
   viewMode: {
      name: 'Board',
      value: 'matrix'
   },
   selectedView: computed(() => {
      return state.viewMode.value;
   }),
   selectedUser: null,
   user: computed(() => {
      return state.selectedUser ? state.selectedUser.uid : firebaseState.user.uid;
   }),
   matrixOwner: computed(() => {
      return state.selectedUser ? state.selectedUser.name : '';
   }),
})

const showUncategorized = useLocalStorage(`ZEN::${firebaseState.uid}/showUncategorized`, true);
const uncategorizedText = computed(() => {
   return showUncategorized.value ? 'Hide' : 'Show'
})

const { query, fullPath } = useRoute()
const { replace } = useRouter()
watch(() => state.viewMode.value, () => {
   replace(`/matrix?tab=${state.viewMode.value}`)
})

watch(fullPath, () => {
   if (query.tab) {
      state.viewMode = state.modes.find(mode => mode.value == query.tab) || state.viewMode;
   }
}, { immediate: true, deep: true })

const toggleUncategorized = () => {
   showUncategorized.value =!showUncategorized.value;
}

</script>