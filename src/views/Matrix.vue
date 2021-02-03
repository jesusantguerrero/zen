<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-10 lg:mx-28">
   
   <div class="section-header flex justify-between items-center mb-10">
      <h2 class="text-2xl font-bold text-gray-400 text-left">
         Heisenhower Matrix
      </h2>  
      <div class="space-x-2">
         <input type="search" 
            v-model.trim="search" 
            class="px-2 text-md h-10 rounded-md focus:outline-none border-2 border-gray-200"
            placeholder="Search task"  
         >
         <button title="help" class="bg-gray-700 text-white px-5 py-1 rounded-md ml-2">
            <i class="fa fa-question"></i>
         </button>
      </div>
   </div>

   <matrix-board :search="search">

   </matrix-board>
</div>
</template>

<script setup>
import { ref } from "vue"
import MatrixBoard from "../components/organisms/MatrixBoard.vue"

const search = ref("")
</script>