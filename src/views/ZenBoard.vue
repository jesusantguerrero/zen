<template>
<div>
  <div class="mx-10 mt-5">
    <div class="text-left flex">
      <div class="zen__view w-8/12 mr-10">
        <header class="flex justify-between mb-5"> 
          <h1 class="text-2xl font-bold text-blue-500"> Task Title</h1>
          <div class="font-bold text-2xl"> 25:00 </div>
        </header>

        <div class="mt-4 py-2">
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

          <quick-add 
            mode="reminder"
            class="zen__reminder mt-10" 
            title="Things bear in mind after the zen"
            placeholder="Add a reminder"
          >
            
          </quick-add>
        </div>
      </div>

      <div class="zen__comming-up w-4/12 ml-5">
        <header class="text-right mb-5">
          <h1 class="text-2xl font-bold text-blue-500"> Line Up</h1>
          <div class="task-new">

          </div>
        </header>

        <div class="comming-up__list divide-y-2 divide-gray-200 divide-dashed">
          <div class="quick__add mb-5">
            <h4 class="font-bold mb-2">Quick Add</h4>
            <quick-add></quick-add>
          </div>
          <div class="commig-up__today mt-6 py-3">
            <h4 class="mb-2 font-bold"> Todo</h4>
            <TaskItem 
              v-for="task in [1,2,3,4,5]" 
              :key="task" 
              :task="{}"
            >
            </TaskItem>
          </div>

          <div class="comming-up__scheduled mt-6 py-3">
            <h4 class="mb-2 font-bold"> Scheduled</h4>
            <TaskItem 
              class="opacity-60 hover:opacity-100"
              v-for="task in [1,2,3]" 
              :key="task" 
              :task="{}"
            >
            </TaskItem>
          </div>
        </div>
      </div>
    </div>
  </div>

</div>

</template>

<script setup>
import { defineProps, reactive } from 'vue'
import TaskItem from "../components/molecules/TaskItem.vue"
import QuickAdd from "../components/molecules/QuickAdd.vue"

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