<template>
<div class="px-8 pt-8 md:block md:mt-0 space-y-4">
    <!-- Plan ahead card -->
    <CardButton 
        class="mt-4"
        title="Plan ahead"
        description="Prioritize your day"
        @click="goTo('/plan-ahead')"
    >
        <template #icon>
            <div class="rounded-full p-3 bg-gray-500 h-9 w-9 flex text-white items-center justify-center">
                <i class="fa fa-tasks"/>
            </div>
        </template>
    </CardButton>

    <!-- Matrix summary card-->
    <article class="rounded-md border bg-white py-2 px-4">
        <header>
            <h4 class="font-bold text-gray-500 text-sm"> Matrix summary</h4>
        </header>
        <section class="flex mt-4">
            <main class="flex items-center justify-center px-4">
                <div class="rounded-full text-gray-500 border-4 h-24 w-24 text-center text-sm">
                    <h5 class="">All</h5>
                    <p class="text-4xl">
                        {{ totalTasks }}
                    </p>
                </div>
            </main>
            <aside>
                <p class="flex items-center justify-between cursor-pointer font-bold" 
                    v-for="(matrix, matrixName) in matrix"
                    :key="matrixName"
                    :class="matrix.classes">
                    <span class="mr-2 capitalize">{{ matrixName}}</span>
                    {{ matrix.list.length }}
                </p>
            </aside>
        </section>
    </article>

    <!-- Shared Card-->
    <div class="rounded-md border bg-white py-2 px-4">
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
            <el-avatar class="block"> {{ person.name }} </el-avatar>
            </div>
        </div>
    </div>
    <!-- End Shared -->
</div>
</template>

<script setup>
    import { computed } from "vue";
    import { useSearchOptions } from "../../composables/useFuseSearch";
    import CardButton from "../molecules/CardButton.vue";

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

    const { searchText, selectedTags}  = useSearchOptions()  
</script>