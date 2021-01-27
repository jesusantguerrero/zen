<template>
<el-collapse-transition>
    <div class="login-box">
        <form class="form-signin md:w-1/2 w-full" @submit.prevent="loginUser">
            <div class="w-100 flex justify-center mb-3">
                <div class="text-8xl text-center zen">
                    Zen.
                </div>

            </div>
            <h3 class="login-title">Sign in</h3>

            <div
                class="form-group"
            >
                <label for="email">Email</label>
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
                class="btn btn-action capitalize"
                type="submit"
            >
                {{ mode }}
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
            <p class="copyrights">&copy; 2020-{{ currentYear }}</p>
        </form>
    </div>

</el-collapse-transition>
</template>

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
    background-size: cover;
    background-size: cover;
    filter: blur(5px), grayscale(70%);
    position: relative;

    &::after {
        content: "";
        display: block;
        position: absolute;
        width: 100%;
        top: 0;
        background: rgba(0, 0, 0, 0.7);
        left: 0;
        height: 100%;
    }

    form {
        color: white;
        padding: 15px;
        max-width: 350px;
        border-radius: 4px;
        // box-shadow: 0 0 10px 4px rgba($color: #000000, $alpha: 0.2);
        z-index: 2;
    }

    div {
        text-align: left;
    }

    .btn-action {
        background:#087a9c;
        width: 100%;
        color: white;
        border: none;
        margin: 10px 0;
        border-radius: 0 0 0 0 !important;
        transition: all ease 0.3s;
        border: 2px solid white;
        height: 37px;

        &:hover {
            background: #1fa1d0;
        }
    }

    input {
        border-radius: 0 0 0 0;
        font-weight: bolder;
        min-width: 250px;
        width: 100%;
        height: 37px;

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

<script setup>
import { reactive, ref, computed } from "vue";
import { register, login }  from "../utils/useFirebase";
import { ElNotification } from "element-plus"
    
const mode = ref('login')
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

const registerWithTwitter = () => {
    
}

const loginWithGoogle = () => {

}
</script>