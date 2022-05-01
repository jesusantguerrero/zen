<template>
<div class="px-8 pt-8 md:block md:mt-0">
    <background-icon-card
        class="overflow-auto text-left text-gray-400 bg-white border border-gray-100 h-46"
        icon="fas fa-clock"
        value="Quick Standup"
    >
        <template #content>
        <div class="text-left">
            <h2 class="w-full mb-5 text-xl font-bold">Overdues</h2>
            <div class="h-40 space-y-2 overflow-auto ic-scroller">
            <p
                v-for="task in overdues"
                :key="`task-${task.id}`"
                class="flex items-start"
            >
                <MaterialIcon
                icon="check_circle"
                class="mr-2 text-green-400"
                />

                <span class="mr-2">
                {{ task.title }}
                </span>
                <span
                v-for="tag in task.tags"
                :class="tag.colors"
                class="px-2 text-white rounded-md"
                >
                {{ tag.name }}
                </span>
            </p>
            </div>
        </div>
        </template>
    </background-icon-card>

    <background-icon-card
        class="overflow-auto text-left text-gray-400 bg-white border h-46"
        icon="fas fa-clock"
        value="Quick Standup"
    >
        <template #content>
        <div class="text-left">
            <div class="flex items-start justify-between mb-5">
            <h2 class="text-xl font-bold">Smart Standup</h2>
            </div>
            <div class="h-40 space-y-2 overflow-auto ic-scroller">
            <p
                v-for="task in committed.list"
                :key="`task-${task.id}`"
                class="flex items-start"
            >
                <MaterialIcon
                icon="check_circle"
                class="mr-2 text-green-400"
                />

                <span class="mr-2">
                {{ task.title }}
                </span>
                <span
                v-for="tag in task.tags"
                :class="tag.colors"
                class="px-2 text-white rounded-md"
                >
                {{ tag.name }}
                </span>
            </p>
            </div>
        </div>
        </template>
    </background-icon-card>
</div>
</template>

<script setup>
import { useSearchOptions } from '../../utils/useFuseSearch';

defineProps({
    committed: {
        type: Object,
        required: true,
    },
    standup: {
        type: Array,
        required: true,
    },
    overdues: {
        type: Array,
        default() {
            return [];
        },
    }
})

const { searchTags, searchText, selectedTags } = useSearchOptions()
</script>