<template>
  <div class="py-5 px-16 text-left">
    <h1 class="font-bold text-2xl pb-16">
        Profile Settings
    </h1>
    <form action="" @submit.prevent class="flex w-full px-5 text-left">
        <div class="grid grid-cols-2 gap-5 w-9/12 ">
            <div class="">
                <label for=""> Display Name </label>
                <input type="text" class="focus:outline-none bg-white w-full border-b-2 border-gray-100 focus:border-gray-200 px-2"
                    placeholder="John"
                >
            </div>
            
            <div class="">
                <label for=""> Last Name</label>
                <input type="text" class="focus:outline-none bg-white w-full border-b-2 border-gray-100 focus:border-gray-200 px-2"
                placeholder="Doe"
                >
            </div>

            <div class="">
                <label for="">Email</label>
                <input type="email" desabled class="focus:outline-none bg-white w-full border-b-2 border-gray-100 focus:border-gray-200 px-2">
            </div>
        </div>

        <div>
            <h4>  User preferences </h4>
                <div class="form-group">
                    <label for="">
                        <input type="checkbox" v-model="showNotification" @click="requestNotification">
                        Show Notification
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="">
                        <input type="checkbox" @click="subscribeUserToPush">
                        Subscribe to push notifications
                    </label>
            </div>
        </div>
    </form>
  </div>
</template>

<script setup>


</script>

<style>

</style>