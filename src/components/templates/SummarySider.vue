<template>
<div class="px-8 pt-8 md:block md:mt-0">
    <div class="space-y-5">
    <!-- Plan ahead -->
    <div class="py-4">
        <div class="justify-between text-gray-500">
            <h4 class="mb-0 font-bold"> Make a plan for today</h4>
            <small class="text-gray-400">We suggest planning your daily work through plan ahead</small>
        
            <div class="flex space-x-2">
            <router-link 
                    to="/plan-ahead" 
                    class="hidden w-full px-5 py-1 mt-5 mr-2 text-center text-white bg-gray-500 rounded-md shadow-sm lg:inline-block ring ring-gray-400 dark:ring-gray-600 ring-offset-0 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-800">
                    <i class="mr-2 fa fa-tasks"></i>
                    Start work
              </router-link>

            </div>
        </div>
    </div>
    <!-- Matrix summary -->
    <div class="py-4 quick__add">
        <h4 class="font-bold text-gray-500"> Matrix summary</h4>
        <div class="grid gap-4 font-bold text-white lg:grid-cols-2">
        <div class="flex items-center justify-center h-20 rounded-md shadow-md cursor-pointer ring ring-offset-2 ring-transparent" 
            v-for="(matrix, matrixName) in matrix"
            :key="matrixName"
            :class="matrix.classes">
            <span class="mr-2 capitalize">{{ matrixName}}</span>
            ({{ matrix.list.length }})
        </div>
        </div>
    </div>

    <!-- Shared -->
        <div class="py-4 quick__add" v-if="false">
            <div class="flex justify-between mb-5 font-bold text-gray-500">
                <h4>
                Shared with me
                </h4> 
                <div class="items-center h-10 md:flex">
                <input
                    type="search"
                    v-model.trim="searchOptions.text"
                    class="w-full h-10 px-2 text-sm border-2 border-gray-200 rounded-md focus:outline-none"
                    placeholder="Search contact"
                />
                </div>
            </div>
            <div class="flex space-x-2">
                <div v-for="person in  shared" :key="person.uid" class="text-center cursor-pointer">
                <el-avatar class="block"> {{ person.name }} </el-avatar>
                </div>
            </div>
        </div>
    <!-- End Shared -->
    </div>

  <standup-modal
    :is-open="!standup.length && matrix.todo.list.length"
    @closed="completeDay()"
  >
      <template #content>
        <div class="mx-10 text-left">
            <p v-for="task in matrix.todo.list" :key="`task-${task.id}`">
                <label class="checkbox-label">
                <input
                    type="checkbox"
                    class="mr-5"
                    name=""
                    :id="task.id"
                    v-model="task.done"
                />

                <span>
                    {{ task.title }}
                </span>
                </label>
            </p>
        </div>
    </template>
  </standup-modal>
</div>
</template>

<script setup>
    import BackgroundIconCard from "../molecules/BackgroundIconCard.vue";
    import Button from "../atoms/Button.vue";

    const props = defineProps({
        matrix: {
            type: Object,
            required: true,
        },
        committed: {
            type: Object,
            required: true,
        },
        standup: {
            type: Array,
            required: true,
        },
        isLoaded: {
            type: Boolean,
            default: false,
        }
    })

</script>