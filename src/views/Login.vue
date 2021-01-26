<template>
  <div class="py-20 bg-blue-500 login-container px-20 flex items-center">
      <div class="text-white w-full">
          <h1 class="text-4xl pt-28 mb-4">
                Welcome to the Zen state
          </h1>
          <p class="text-2xl"> Improve your development workflow applying proven techniques, that not only will help you to be more productive but helthier and more efficient.</p>
      </div>
      
      <div class="w-full">
        <form 
            class="shadow-md lg:w-7/12 ml-auto p-10 rounded-md border-2 border-gray-300 mt-20 py-20 bg-white mr-20"
            @submit.prevent="loginUser"
            >
            <h2 class="text-3xl font-extrabold mb-10"> Sign Up</h2>
            <div class="text-left">
                <label for="" class="block"> Email</label>
                <input type="email" v-model="formData.email" class="block border-2 border-gray-300 w-full h-10 px-2" required>
            </div>

            <div class="text-left w-full mt-5">
                <label for="" class="block">Password</label>
                <input type="password" v-model="formData.password" class="block border-2 border-gray-300 w-full h-10 px-2"  required>
            </div>
            
            <div class="text-left w-full mt-5" v-if="mode!='login'">
                <label for="" class="block">Confirm Password</label>
                <input type="password" v-model="formData.password" class="block border-2 border-gray-300 w-full h-10 px-2"  required>
            </div>

            
            <button class="mt-5 bg-blue-500 w-full h-10 text-white font-bold" 
                @click="loginUser()" 
                v-if="mode=='login'"
            >
                Login
            </button>
            <button class="mt-5 bg-blue-500 w-full h-10 text-white font-bold" @click="registerUser()" v-else>
                Register
            </button>
        </form>
      </div>
  </div>
</template>

<script setup="props, { emit }">
import {reactive, ref} from "vue";
import { register, login }  from "../utils/useFirebase";
    
const mode = ref('login')

const formData = reactive({
    email: '',
    password: '',
    confirmPassword: '',
});

const registerUser = () => {
    register(formData.email, formData.password)
}

const loginUser = () => {
    login(formData.email, formData.password)
}
</script>