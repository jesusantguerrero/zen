<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-10 lg:mx-28">

  <div class="flex justify-between mb-10">
    <h4 class="text-2xl font-bold"> Plan Ahead</h4>
    <div class="flex space-x-2">
    <div
      class="h-2 w-40 rounded-md"
      v-for="(section, index) in state.list"
      :class="[index <= state.position ? 'bg-green-400' : 'bg-gray-400']"
      :key="section"
    >
      <div class="mt-2 capitalize font-bold">
        {{  section }}

      </div>
    </div>
  </div>
    <div class="flex justify-end space-x-2">
      <button @click="previuosPosition" class="bg-gray-600 text-white hover:bg-gray-700 px-5 py-2 w-40 rounded-md focus:outline-none">
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