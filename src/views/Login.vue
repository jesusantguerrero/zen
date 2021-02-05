<template>
    <div class="login-box">
        <form class="form-signin md:w-1/2 w-full px-12" @submit.prevent="loginUser">
            <div class="w-full flex justify-center items-center mb-20 sm:pt-20">
                <div class="text-8xl text-center zen">
                    Zen.
                </div>
            </div>

            <div
                class="form-group"
            >
                <label for="email" class="inline-block mb-2">Email</label>
                <p :class="{ control: true }">
                    <input
                        v-model.trim="formData.email"
                        class="form-control input"
                        :class="{ 'border-red-400 border-2': false }"
                        name="email"
                        type="text"
                        required
                    />
                </p>
            </div>

            <div
                class="form-group"
            >
                <label for="password" class="password-label"><span>Password</span></label
                >
                <p :class="{ control: true }">
                    <input
                        type="password"
                        id="password"
                        v-model="formData.password"
                        class="form-control input"
                        :class="{ 'border-red-400 border-2': false }"
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
                <p class="true">
                    <input
                        type="password"
                        id="confirm-password"
                        v-model="formData.confirmPassword"
                        class="form-control input"
                        @blur="isDirty=true"
                        :class="{ 'error-input': isConfirmationInvalid }"
                        name="confirm-password"
                        required
                    />
                    <small v-if="isConfirmationInvalid" class="text-red-200"> Passwords are not equal </small>
                </p>
            </div>

            <button
                class="btn btn-action capitalize rounded-sm"
                type="submit"
                :disabled="isConfirmationInvalid"
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
                {{ modeLabel }} With Google
            </button>

            <p class="text-center">
                <small v-if="mode=='register'"> Already have an account?
                    <button  @click.prevent.stop="mode='login'"> Login </button>
                </small>

                 <small v-else> Dont have an account?
                    <router-link  to="/register"> Create one </router-link>
                </small>
            </p>
            <p class="copyrights pt-10">&copy; {{ currentYear }}</p>
        </form>
    </div>
</template>


<script setup>
import { reactive, ref, computed, nextTick, defineProps, toRefs } from "vue";
import { useRouter } from "vue-router"
import { register, login, loginWithProvider }  from "../utils/useFirebase";
import { ElNotification } from "element-plus"

// state and ui
const props = defineProps({
    mode: {
        type: String,
        default: "login"
    }
})

const { mode } = toRefs(props)
const isLoading = ref(false)


const formData = reactive({
    email: '',
    password: '',
    confirmPassword: '',
});

const currentYear = computed(() =>{
    const date = new Date();
    return date.getFullYear();
})

const modeLabel = computed(() => {
    return mode.value == 'register' ? 'Sign Up' : 'Sign In';
})

// validation
const isDirty = ref(false)
const isConfirmationInvalid = computed(() => {
    return isDirty.value && mode.value == 'register' && formData.password != formData.confirmPassword;
})

// auth manipulation
const { push } = useRouter()
const loginUser = () => {
 
    if (!validateRegistration()) {
        return
    }

    const loginFunction = mode.value == 'login' ? login : register;
    isLoading.value = true;

    loginFunction(formData.email, formData.password).then(() =>{
        nextTick(() => {
            location.reload()
        })
    }).catch(errorMessage => {
        ElNotification({
            title: "Error",
            message: errorMessage.message,
            type: "error"
        })
        isLoading.value = false
    })
}

const validateRegistration = () => {
   if (mode.value == 'register' && formData.password != formData.confirmPassword) {
         ElNotification({
            title: "Error",
            message: errorMessage.message,
            type: "error"
        })
        return false
    }
    return true
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

        &.error-input {
           @apply border-red-400  text-red-400 border-2
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
        @apply text-gray-400;
        align-items: center;
        padding: 0 0 0 0 !important;
        background: white !important;
        height: 47px !important;
        font-weight: 500;
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
            @apply shadow-sm;
            @apply border-2;
            @apply border-red-300;
        }
    }
}

.form-control {
    @apply text-gray-400;
    @apply px-2;

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
