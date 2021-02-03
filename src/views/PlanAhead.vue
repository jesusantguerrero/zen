<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-10 lg:mx-28">

  <div class="md:flex justify-between mb-10">
    <div class="text-2xl font-bold divide-x-2 flex items-center">
      <div class="pr-2">
        Plan Ahead
      </div> 

      <div class="capitalize pl-2"> 
        <span>
          {{ state.list[state.position] }}
        </span>
        <div class="flex space-x-2 w-full">
          <div
            class="h-1 w-full"
            v-for="(section, index) in state.list"
            :class="[index <= state.position ? 'bg-green-400' : 'bg-gray-400']"
            :key="section"
          >
            <div class="mt-2 capitalize font-bold">

            </div>
          </div>
        </div>
      </div>

      <button class="ml-5 bg-gray-700 px-5 py-1 text-white rounded-full">
        <i class="fa fa-question text-sm float-right"></i>
      </button>
    </div>

    <div class="flex justify-end mt-5 space-x-2 md:mt-0">
      <button @click="previuosPosition" v-if="!isFirstPosition" class="bg-gray-400 text-white hover:bg-gray-700 px-5 py-2 w-40 rounded-md focus:outline-none">
        Previous 
      </button>
      <button @click="nextPosition" v-if="!isLastPosition" class="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 w-40 rounded-md focus:outline-none"> 
        Next 
      </button>
      <button @click="done" v-else class="bg-green-400 hover:bg-green-600 text-white px-5 py-2 w-40 rounded-md focus:outline-none"> 
        <i class="fa-fa-check"></i>
        Start my Zen. 
      </button>
    </div>
  </div>
  
  <matrix-board :mode="currentMode"></matrix-board>
</div>
</template>

<script setup>
import { reactive, computed } from "vue"
import { useRouter } from "vue-router";
import MatrixBoard from "../components/organisms/MatrixBoard.vue"

const state = reactive({
  list: ['backlog', 'matrix', 'lineup'],
  position: 0
})

const currentMode = computed(() => {
  return state.list[state.position];
})

const isLastPosition = computed(() => {
  return state.position == state.list.length - 1;
})

const isFirstPosition = computed(() => {
  return state.position == 0;
})

const nextPosition = () => {
  if ((state.position + 1) < state.list.length  ) {
        state.position = state.position + 1
    }
}

const previuosPosition = () => {
    if (state.position > 0 ) {
        state.position = state.position - 1
    }
}

const { push } = useRouter()
const done = () => {
  push('/');
}
</script>