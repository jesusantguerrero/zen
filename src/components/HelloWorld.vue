<template>
<div class="mx-10">
  <div class="header">
    <a href="https://vitejs.dev/guide/features.html" target="_blank">Home</a> |
    <a href="https://v3.vuejs.org/" target="_blank">Comitted</a>
  </div>

  <div class="text-left flex">
    <div class="zen__view w-8/12 mr-5">
      <header class="flex justify-between mb-5"> 
        <h1> Task Title</h1>
        <div> 25:00 </div>
      </header>

      <div>
        <div class="zen__datails">
          <div class="task__description mb-4">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Error atque, molestiae beatae est assumenda ipsam explicabo corporis? Facilis suscipit quo corrupti animi amet ad illo ea! Nemo cupiditate expedita recusandae.
          </div>

          <div class="task__checlikst mb-4">
            <div v-for="i in [1,2,3]" :key="i">
              <label for="">
                <input type="checkbox" name="" id="">
                 Checklist Item {{ i }}
              </label>
            </div>
          </div>

          <div class="task__promodoros flex">
            <div class="task__target rounded-full bg-red-200 h-10 w-10 flex justify-center items-center font-bold text-gray-500">
              3
            </div>

            <div class="sessions ml-10 flex items-center">
              Totals: 30 minutes, 1 session
            </div>
          </div>
        </div>

        <div 
          class="zen__reminder mt-10"
          title="Things bear in mind after the zen"
          >
          Add a reminder
        </div>
      </div>
    </div>

    <div class="zen__comming-up w-4/12 ml-5">
      <header class="text-right mb-5">
        <h1> Line Up</h1>
        <div class="task-new">

        </div>
      </header>

      <div class="comming-up__list">
        <div class="quick__add mb-5">
          <h4>Quick Add</h4>
          <div class="task-new">
            Click to add a quick task
          </div>
        </div>
        <div class="commig-up__today">
          <h4> Todo</h4>
          <div class="" v-for="i in [1,2,3,4,5]" :key="i">
            <h4> Task {{ i }}</h4>
          </div>
        </div>

        <div class="comming-up__scheduled mt-5">
          <h4> Scheduled</h4>
          <div class="" v-for="i in [1,2,3]" :key="i">
            <h4> Task {{ i }}</h4>
          </div>
        </div>
      </div>
    </div>
  </div>

</div>

</template>

<script setup>
import { defineProps, reactive } from 'vue'

defineProps({
  msg: String
})

const state = reactive({ count: 0 })
</script>

<style scoped>
a {
  color: #42b983;
}
</style>