<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-10 lg:mx-28">

  <div class="md:flex justify-between space-x-4 mb-10 items-center">
    <div class="w-full">
      <el-steps :active="state.position" finish-status="success" simple style="backgound-color: white">
        <el-step :title="step" v-for="step in state.list" :key="step">
          <template v-slot:icon="{ scope }">
              <i class="fa fa-check"></i>
              {{ scope }}
          </template>

          <template #title>
            <span class="capitalize font-bold"> {{ step }} </span>
          </template>
        </el-step>
      </el-steps>
    </div>

    <div class="flex justify-end mt-5 space-x-2 md:mt-0">
      <button @click="previuosPosition" v-if="!isFirstPosition" class="bg-gray-400 text-white hover:bg-gray-700 px-5 py-2 w-40 rounded-md focus:outline-none h-10">
        Previous 
      </button>
      <button @click="nextPosition" v-if="!isLastPosition" class="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 w-40 rounded-md focus:outline-none h-10"> 
        Next 
      </button>
      <button @click="done" v-else class="bg-green-400 hover:bg-green-600 text-white px-5 py-2 w-40 rounded-md focus:outline-none h-10"> 
        <i class="fa-fa-check"></i>
        Start my Zen. 
      </button>
    </div>
  </div>
  
  <matrix-board :search="state.search" :mode="currentMode" :show-help="showHelp"></matrix-board>
</div>
</template>

<script setup>
import { reactive, computed, ref } from "vue"
import { useRouter } from "vue-router";
import MatrixBoard from "../components/organisms/MatrixBoard.vue"

const state = reactive({
  list: ['backlog', 'matrix', 'lineup'],
  search: "",
  position: 0
})

const showHelp = ref(false)

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

<style lang="scss">
.el-steps--simple {
  background: white;
}
</style>