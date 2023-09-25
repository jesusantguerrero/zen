<template>
<div class="space-y-4 md:block md:mt-0">
    <!-- Matrix summary card-->
    <section class="grid grid-cols-2 gap-1 overflow-hidden bg-white dark:bg-gray-500 border dark:border-gray-600 rounded-b-md">
            <article class="relative flex flex-col items-center justify-center h-24 px-4 font-bold transition cursor-pointer" 
                v-for="(matrix, matrixName) in matrix"
                :key="matrixName"
                :class="matrix.classes"
            >
                <div class="absolute right-0 w-6/12 h-full bg-gradient-to-r from-transparent via-transparent to-white opacity-20" />
                <span class="mr-2 capitalize">{{ matrixName}}</span>
                {{ matrix.list.length }}
            </article>
    </section>

    <!-- Shared Card-->
    <!-- <div class="px-4 py-2 bg-white border rounded-md">
        <div class="flex justify-between mb-5 font-bold text-gray-500">
            <h4 class="text-sm">
                Shared with me
            </h4> 
            <div class="items-center h-10 md:flex">
            <input
                type="search"
                v-model.trim="searchText"
                class="w-full h-10 px-2 text-sm border-2 border-gray-200 rounded-md focus:outline-none"
                placeholder="Search contact"
            />
            </div>
        </div>
        <div class="flex space-x-2">
            <div v-for="person in  shared" :key="person.uid" class="text-center cursor-pointer">
            <ElAvatar class="block"> {{ person.name }} </ElAvatar>
            </div>
        </div>
    </div> -->
    <!-- End Shared -->
</div>
</template>

<script setup>
    import { computed } from "vue";
    import { useSearchOptions } from "../../utils/useFuseSearch";

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
        shared: {
            type: Array,
            default() {
                return [];
            },
        }
    })

    const totalTasks = computed(() => {
        return Object.values(props.matrix).reduce((acc, matrix) => {
            return acc + matrix?.list?.length
        }, 0)
    })

    const { searchText }  = useSearchOptions()  
</script>