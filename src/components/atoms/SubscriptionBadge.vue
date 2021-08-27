<template>
    <div v-if="!isSubscribed && daysLeft && false" class="flex items-center justify-center w-10 h-10 mr-4 font-bold text-gray-400 border-4 border-green-500 rounded-full cursor-pointer relatisve"> 
        {{ daysLeft }}
      <div class="absolute px-1 text-xs bg-white bottom-2">Pro</div>
    </div>
</template>

<script setup>
    import { useSubscription } from "../../utils/useSubscription";
    const { isSubscribed, daysLeft } = useSubscription()
</script>