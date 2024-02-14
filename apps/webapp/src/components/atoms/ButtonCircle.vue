<template>
<div
    v-bind="$attrs"
    class="flex items-center justify-center w-16 h-16 text-3xl text-white bg-green-400 rounded-full shadow-md cursor-pointer"
>
    <slot />
</div>
</template>