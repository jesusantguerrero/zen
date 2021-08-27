<template>
<div class="relative flex flex-col justify-center px-4 py-5 text-center rounded-md shadow-md">
    <div class="absolute background-icon right-14 opacity-40">
        <slot name="icon">
            <i class="fa text-7xl" :class="icon"></i>
        </slot>
    </div>
    <slot name="content">
        <div class="text-3xl font-bold">
        {{ value }}
            <small class="block text-sm">
                {{ title }}
            </small>
        </div>
    
    </slot>
    <div class="mt-2">
        <slot name="action">

        </slot>
    </div>
</div>
</template>

<script>
export default {
    props: {
        value: {
            type: String
        },
        title: {
            type: String
        },
        icon: {
            type: String
        }
    }
}
</script>

<style>

</style>
