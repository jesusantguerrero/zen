import { createApp } from 'vue'
import App from './App.vue'
import "./assets/scss/main.scss";
import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css'
import VueFinalModal from "vue-final-modal"
import router from "./router"
import { MotionPlugin } from "@vueuse/motion"
createApp(App)
.use(MotionPlugin)
.use(router)
.use(VueFinalModal())
.use(ElementPlus)
.mount('#app')
