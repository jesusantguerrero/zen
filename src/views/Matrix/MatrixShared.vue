<script setup lang="ts">
import { ref } from "vue"
import MatrixBoardShared from "@/components/organisms/MatrixBoardShared.vue"

const search = ref("")
const showHelp = ref(false)
const selectedUser = ref(false)

</script>

<template>
<main class="pt-24 mx-5 md:pt-28 md:mx-10 lg:mx-28">
   <header class="section-header md:flex justify-between items-center mb-10">
      <h2 class="text-2xl font-bold text-gray-400 text-left">
         Matrix Shared with me
      </h2>  
      <section class="space-x-2 flex">
         <input type="search" 
            v-model.trim="search" 
            class="px-2 text-md h-10 rounded-md focus:outline-none border-2 border-gray-200 w-full"
            placeholder="Search task"  
         >
         <button title="help" class="bg-gray-600 hover:bg-gray-700 transition-all text-white px-5 py-1 rounded-md ml-2 focus:outline-none" @click="showHelp = !showHelp">
            <i class="fa fa-question"></i>
         </button>
      </section>
   </header>

   <section>
      <h2 class="text-3xl font-extrabold pt-5 pb-10">Shared Lists</h2>
      <section class="flex w-full px-52" v-for="list in shared" :key="list.uid">
         <section class="border-2 rounded-md py-4 bg-white w-full">
            <h4 class="font-bold">
               {{ list.name }} ({{ list.email }})
            </h4>
            <section class="space-x-2">
               <button class="bg-gray-600 text-white px-2 py-2 rounded-md mt-5 focus:outline-none" @click="selectedUser=list"> See Lists </button>
               <button class="bg-gray-600 text-white px-2 py-2 rounded-md mt-5 focus:outline-none" @click="selectedUser=null"> Hide </button>
            </section>
         </section>
      </section> 
    </section>

   <MatrixBoardShared 
      v-if="selectedUser"
      :search="search" 
      :show-help="showHelp" 
      :matrixes="selectedUser.matrix" 
      :selected-user="selectedUser.uid" 
   /> 
</main>
</template>