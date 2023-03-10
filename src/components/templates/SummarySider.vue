<template>
<div class="md:block md:mt-0 space-y-4">
    <!-- Matrix summary card-->
    <section class="rounded-md border grid grid-cols-2 bg-white">
            <article class="flex h-24 px-4 relative items-center justify-between cursor-pointer font-bold" 
                v-for="(matrix, matrixName) in matrix"
                :key="matrixName"
                :class="matrix.classes"
            >
                <div class="absolute w-6/12 bg-gradient-to-r from-transparent via-transparent to-white h-full right-0 opacity-20" />
                <span class="mr-2 capitalize">{{ matrixName}}</span>
                {{ matrix.list.length }}
            </article>
    </section>

    <!-- Shared Card-->
    <!-- <div class="rounded-md border bg-white py-2 px-4">
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