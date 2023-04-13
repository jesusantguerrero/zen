<script lang="ts" setup>
import { ITask } from '@/utils/useTaskFirestore';
// @ts-ignore
import { AtButton, AtBackgroundIconCard as BackgroundIconCard } from "atmosphere-ui"
import { useRouter } from 'vue-router';

defineProps<{
    committed: ITask[]
}>()

const { push } = useRouter()
</script>

<template>
<div class="md:block md:mt-0">
    <BackgroundIconCard
        class="overflow-auto text-left text-gray-400 bg-white border h-46"
        icon="fas fa-clock"
        value="Quick Standup"
    >
        <template #content>
        <div class="text-left">
            <div class="flex items-start justify-between h-14 ">
                <h2 class="text-xl font-bold">Smart Standup</h2>
            </div>
            <div class="h-40  space-y-2 overflow-auto ic-scroller">
                <p
                    v-for="task in committed"
                    :key="`task-${task.uid}`"
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
            <footer class="flex justify-center items-center pt-4 mt-auto">
                <AtButton rounded class="border border-gray-100 hover:bg-gray-50 transition" @click="push('/standup')">
                    Go to standup
                </AtButton>
            </footer>
        </div>
        </template>
    </BackgroundIconCard>
</div>
</template>

