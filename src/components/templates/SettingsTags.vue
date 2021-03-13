<template>
  <div class="py-5 px-16 text-left">
    <h1 class="font-bold text-2xl pb-16">
        Manage Tags
    </h1>
    <form action="" @submit.prevent class="flex w-full px-5 text-left">
        <div class="grid grid-cols-2 gap-5 w-9/12">
            <div v-for="tag in tags" :key="tag.uid" class="capitalize cursor-pointer">
                {{ tag.name }}
            </div>
        </div>
    </form>
  </div>
</template>

<script setup>
import { inject } from "vue";

const tags = inject('tags')

</script>

<style>

</style>