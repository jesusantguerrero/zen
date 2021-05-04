<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-10 lg:mx-28">
   
   <div class="section-header md:flex justify-between items-center mb-10">
      <h2 class="text-2xl font-bold text-gray-400 text-left">
         Eisenhower Matrix
      </h2>  
      <div class="space-x-2 flex">
         <div class="w-32">
            <jet-select
               v-model:selected="state.viewMode"
               :options="state.modes"
               label="name"
               key-track="value"
               class="w-32"
            >
            </jet-select>
         
         </div>
         <input type="search" 
            v-model.trim="state.search" 
            class="px-2 text-md h-10 rounded-md focus:outline-none border-2 border-gray-200 w-full"
            placeholder="Search task"  
         >
         <button title="help" class="bg-gray-600 hover:bg-gray-700 transition-all text-white px-5 py-1 rounded-md ml-2 focus:outline-none" @click="showHelp = !showHelp">
            <i class="fa fa-question"></i>
         </button>
      </div>
   </div>

   <matrix-board :search="search" :show-help="showHelp" :mode="state.selectedView" />

</div>
</template>

<script setup>
import { computed, reactive, ref } from "vue"
import MatrixBoard from "../components/organisms/MatrixBoard.vue"
import JetSelect from "../components/atoms/JetSelect.vue";

const state = reactive({
   showHelp:  false,
   search: "",
   modes: [{
      name: 'Board',
      value: 'matrix'
   },{
      name: 'Time Line',
      value: 'timeline'
   }],
   viewMode: {
      name: 'Board',
      value: 'matrix'
   },
   selectedView: computed(() => {
      return state.viewMode.value;
   })
})
</script>