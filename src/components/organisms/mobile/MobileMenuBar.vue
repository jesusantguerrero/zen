<template>
<div class="fixed bottom-0 flex w-full pt-2 bg-gray-900 h-14 rounded-t-2xl lg:hidden">
    <div v-for="item in menuItems" class="w-full">
    <div>
        <router-link :to="item.link" v-if="item.link">
            <div class="flex-col items-center justify-center text-white">
                <div class="flex items-center justify-center">
                    <component :is="item.icon" v-if="item.icon" class="text-xl custom-icon" />
                </div>
                <span class="block mt-2 text-xs">
                    {{ item.label }}
                </span>
            </div>
        </router-link>
        <div v-else class="relative mx-auto">
            <ButtonCircle class="mx-auto -translate-y-7">
                <component :is="item.icon" v-if="item.icon" />
            </ButtonCircle>
        </div>
    </div>
    </div>
</div>
</template>

<script setup>
import IconRoundAdd from "../../atoms/icons/IconRoundAdd.vue";
import IconAccessTime from "../../atoms/icons/IconAccessTime.vue";
import IconRoundAuto from "../../atoms/icons/IconRoundAuto.vue";
import IconOutlineGrid from "../../atoms/icons/IconOutlineGrid.vue";
import IconSharpBarChart from "../../atoms/icons/IconSharpBarChart.vue";
import ButtonCircle from '../../atoms/ButtonCircle.vue';

const menuItems = [
    {
        name: 'board',
        label: 'Zen',
        icon: IconAccessTime,
        link: '/lineup'
    },
    {
        name: 'standup',
        label: 'Standup',
        icon: IconRoundAuto,
        link: '/standup'
    },
    {
        name: 'add',
        label: 'Add',
        icon: IconRoundAdd,
        action: 'addTask'
    },
    {
        name: 'matrix',
        label: 'Matrix',
        icon: IconOutlineGrid,
        link: '/matrix'
    },
    {
        name: 'metrics',
        label: 'Metrics',
        icon: IconSharpBarChart,
        link: '/metrics'
    }

]
</script>

<style scoped lang="scss">
.router-link-active {
span, .custom-icon {
    @apply text-green-500;
}
}
</style>
