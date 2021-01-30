<template>
<el-collapse-transition>
    <div class="login-box">
        <form class="form-signin md:w-1/2 w-full" @submit.prevent="loginUser">
            <div class="w-full flex justify-center items-center mb-20 sm:pt-20">
                <div class="text-8xl text-center zen">
                    Zen.
                </div>
                <!-- <div class="h-24 bg-white w-2 ml-5" />  -->

                <!-- <h3 class="login-title w-full capitalize"> {{ modeLabel}}</h3> -->
            </div>

            <div
                class="form-group"
            >
                <label for="email" class="inline-block mb-2">Email</label>
                <p :class="{ control: true }">
                    <input
                        v-model.trim="formData.email"
                        class="form-control input"
                        :class="{ 'is-danger': false }"
                        name="email"
                        type="text"
                        required
                    />
                </p>
            </div>

            <div
                class="form-group"
            >
                <label for="password" class="password-label"
                    ><span>Password</span>
                    <small
                        ><a href="/forgot-password" tabindex="5">Forgot password?</a></small
                    ></label
                >
                <p :class="{ control: true }">
                    <input
                        type="password"
                        id="password"
                        v-model="formData.password"
                        class="form-control input"
                        :class="{ 'is-danger': false }"
                        name="password"
                        required
                    />
                </p>
            </div>

            <div
                class="form-group"
                v-if="mode!='login'"
            >
                <label for="password" class="password-label">
                    <span>Confirm Password</span>
                </label>
                <p :class="{ control: true }">
                    <input
                        type="password"
                        id="confirm-password"
                        v-model="formData.confirm_password"
                        class="form-control input"
                        :class="{ 'is-danger': false }"
                        name="confirm-password"
                        required
                    />
                </p>
            </div>

            <button
                class="btn btn-action capitalize rounded-sm"
                type="submit"
            >
                {{ mode }}
                <i v-if="isLoading" class="fa fa-spinner fa-pulse ml-2"></i>
            </button>

            <button
                class="btn btn-action capitalize rounded-sm flex google-btn"
                type="submit"
                @click.prevent.stop="loginWithProvider('google')"
            >
                <img src="./../assets/btn_google_light.svg" alt="">
                Sign in With Google
                <i v-if="isLoading" class="fa fa-spinner fa-pulse ml-2"></i>
            </button>

            <p class="text-center">
                <small v-if="mode=='register'"> Already have an account?
                    <button  @click.prevent.stop="mode='login'"> Login </button>
                </small>

                 <small v-else> Dont have an account?
                    <button  @click.prevent.stop="mode='register'"> Create one </button>
                </small>
            </p>
            <p class="copyrights pt-10">&copy; {{ currentYear }}</p>
        </form>
    </div>

</el-collapse-transition>
</template>


<script setup>
import { reactive, ref, computed } from "vue";
import { register, login, loginWithProvider }  from "../utils/useFirebase";
import { ElNotification } from "element-plus"
    
const mode = ref('login')
const isLoading = ref(false)

const formData = reactive({
    email: '',
    password: '',
    confirmPassword: '',
});

const modeLabel = computed(() =>{
    return mode.value == 'login' ? "Sign In" : "Sign Up"
})

const currentYear = computed(() =>{
    const date = new Date();
    return date.getFullYear();
})

const loginUser = () => {
    const loginFunction = mode.value == 'login' ? login : register;
    isLoading.value = true;

    loginFunction(formData.email, formData.password).catch(errorMessage => {

        ElNotification({
            title: "Error",
            message: errorMessage.message,
            type: "error"
        })
        isLoading.value = false
    })
}

</script>

<style lang="scss" scoped>
:root {
    --primary-color: blue;
}

.login-body {
    background: #fdfdff;
    background-size: cover;
}

.login-box {
    min-height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(#1fa1d0, #087a9c);
    background: url(../assets/zen-photo.jpg);
    background-position: center;
    background-size: cover;
    background-size: cover;
    filter: blur(5px), grayscale(70%);
    position: relative;

    &::after {
        content: "";
        @apply bg-gray-800;
        display: block;
        position: absolute;
        width: 100%;
        top: 0;
        opacity: .85;
        left: 0;
        height: 100%;
    }

    form {
        color: white;
        padding: 15px;
        max-width: 450px;
        border-radius: 4px;
        // box-shadow: 0 0 10px 4px rgba($color: #000000, $alpha: 0.2);
        z-index: 2;
    }

    div {
        text-align: left;
    }

    .btn-action {
        @apply bg-gray-800;
        width: 100%;
        color: white;
        border: none;
        margin: 10px 0;
        transition: all ease 0.3s;
        border: 2px solid white;
        height: 40px;

        &:hover {
            @apply bg-gray-700;
        }
    }

    input {
        @apply rounded-sm;
        font-weight: bolder;
        min-width: 250px;
        width: 100%;
        height: 40px;

        &:hover,
        &:focus {
            //
        }
    }

    .login-title {
        @apply text-3xl;
        text-align: center;
        margin-top: 15px;
        margin-bottom: 20px;
    }

    .password-label {
        display: flex;
        justify-content: space-between;
    }

    .google-btn {
        @apply text-gray-400 items-center;
        padding: 0 0 0 0 !important;
        background: white !important;
        height: 47px !important;
        font-weight: bolder;
        font-family: 'Roboto', sans-serif;
    }
}

.copyrights {
    @apply text-gray-100;
    height: 10vh;
    text-align: center;
    margin: 5px 0;
    p {
        margin: 0;
    }
}

.splash-screen {
    top: 0;
    left: 0;
    color: #fff;
    background: var(--primary-color);
    position: absolute;
    height: 100vh;
}

.splash-logo {
    width: 300px;
}

.form-group {
    margin: 15px 0;

    label {
        margin: 0.5rem 0;
    };

    &--error {
        @apply text-red-400;
        input {
            @apply shadow-sm border-2 border-red-300;
        }
    }
}

.form-control {
    @apply text-gray-400 px-2;

    &:focus {
        outline: none;
    }
}

@keyframes fadeSplash {
    0% {
        opacity: 1;
    }
    60% {
        opacity: 1;
    }
    100% {
        opacity: 0;
    }
}

@keyframes loading-circle {
    0% {
        transform: rotate(0deg);
    }
    60% {
        transform: rotate(90deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

@media (max-width: 768px) {
    .login-body .login-box div {
        margin-right: 0;
    }
}
</style>
