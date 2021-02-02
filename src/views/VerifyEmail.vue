<template>
  <div class="pt-24 md:pt-28 pb-20 mx-5 md:mx-28">
    <div class="text-left md:flex">
      <div class="zen__view md:w-8/12 md:mx-auto mt-8 shadow-md bg-white py-14">
        <div class="mt-8">
              <div class="w-8/12 md:w-6/12 mx-auto mt-10 text-center">
                <img src="../assets/undraw_following.svg" class="w-12/12 md:w-7/12 mx-auto"> 
                <div class="mt-10 md:mt-5 text-gray-500 font-bold"> Check your email and validate your email</div> 
              </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TaskView from "../components/organisms/TaskView.vue"
import { firebaseState } from "../utils/useFirebase"

firebaseState.user.reload()
</script>

<style scoped>
.zen__datails {
  min-height: 400px;

}
</style>