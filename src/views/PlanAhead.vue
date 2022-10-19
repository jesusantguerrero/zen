<template>
<div class="pt-24 mx-5 md:pt-28 md:mx-10 lg:mx-28">

  <div class="items-center justify-between mb-10 space-x-4 md:flex">
    <div class="w-full">
      <el-steps :active="state.position" finish-status="success" simple class="bg-white dark:bg-gray-700 dark:text-gray-300">
        <el-step :title="step" v-for="step in state.list" :key="step">
          <template v-slot:icon="{ scope }">
              <i class="fa fa-check"></i>
              {{ scope }}
          </template>

          <template #title>
            <span class="font-bold capitalize"> {{ step }} </span>
          </template>
        </el-step>
      </el-steps>
    </div>

    <div class="flex justify-end mt-5 space-x-2 md:mt-0">
      <button @click="previuosPosition" v-if="!isFirstPosition" class="w-40 h-10 px-5 py-2 text-white bg-gray-400 rounded-md hover:bg-gray-700 focus:outline-none">
        Previous 
      </button>
      <button @click="nextPosition" v-if="!isLastPosition" class="w-40 h-10 px-5 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none"> 
        Next 
      </button>
      <button @click="done" v-else class="w-40 h-10 px-5 py-2 text-white bg-green-400 rounded-md hover:bg-green-600 focus:outline-none"> 
        <i class="fa-fa-check"></i>
        Start my Zen. 
      </button>
    </div>
  </div>
  
  <matrix-board 
    :search="state.search" 
    :mode="currentMode" 
    :show-help="showHelp" 
    :show-uncategorized="showUncategorized"
  />
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

const showUncategorized = computed(() => {
  return state.position === 1;
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